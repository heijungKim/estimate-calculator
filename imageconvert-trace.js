// ── 이미지 → 벡터(SVG) 변환 ──────────────────────────────────
// 웹 워커(imageconvert-worker.js)와 메인 스레드(워커를 못 쓰는 환경) 양쪽에서 함께 쓰므로
// DOM·jQuery 에 의존하지 않는다. lib/vtracer/vtracer.js 가 먼저 로드되어야 한다.
//
// 변환 엔진은 VTracer(visioncortex). 색상별로 영역을 나눈 뒤 스플라인 곡선으로 따고,
// 큰 영역 위에 작은 영역을 쌓는 방식이라 색 사이 틈이 생기지 않는다.
//
// wsTraceImage(imgd, p) → Promise<{ body, paths, width, height }>
//   imgd : { width, height, data(Uint8ClampedArray RGBA) }  (흰 배경에 합성된 상태)
//   p    : { mode:'illust'|'vector'|'mono', detail(1~10), pathomit, smooth(0~5),
//            removeBg, threshold, invert }
//   body : <svg> 안쪽 내용 (viewBox 0 0 width height 기준). 출력 크기(mm)는 페이지에서 감싼다.

(function(root) {
    'use strict';

    var WASM_URL = 'lib/vtracer/vtracer_wasm_bg.wasm';
    var initPromise = null;

    function ensureVTracer() {
        if (!root.vtracerWasm) return Promise.reject(new Error('벡터 변환 엔진을 불러오지 못했습니다.'));
        if (!initPromise) {
            initPromise = fetch(WASM_URL).then(function(res) {
                if (!res.ok) throw new Error('벡터 변환 엔진(wasm)을 불러오지 못했습니다.');
                return res.arrayBuffer();
            }).then(function(buf) {
                root.vtracerWasm.init(new Uint8Array(buf));
            });
            initPromise.catch(function() { initPromise = null; });
        }
        return initPromise;
    }

    // 흑백 모드: 명암 기준값으로 이진화
    function binarize(d, threshold, invert) {
        for (var i = 0; i < d.length; i += 4) {
            var dark = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114 < threshold;
            if (invert) dark = !dark;
            d[i] = d[i + 1] = d[i + 2] = dark ? 0 : 255;
            d[i + 3] = 255;
        }
    }

    // 배경 제거: 테두리에서 가장 많은 색과 비슷한 픽셀을 테두리부터 이어서 투명하게 만든다.
    // (VTracer 는 투명 픽셀을 도형으로 만들지 않는다. 가운데 떨어진 같은 색 영역은 남는다)
    function removeBackground(d, w, h) {
        var bins = {}, best = null, x, y;
        function sample(p) {
            var i = p * 4, key = (d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4);
            var b = bins[key] || (bins[key] = { r: 0, g: 0, b: 0, n: 0 });
            b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2]; b.n++;
            if (!best || b.n > best.n) best = b;
        }
        for (x = 0; x < w; x++) { sample(x); sample((h - 1) * w + x); }
        for (y = 1; y < h - 1; y++) { sample(y * w); sample(y * w + w - 1); }
        var br = best.r / best.n, bg = best.g / best.n, bb = best.b / best.n, tol = 48;

        var n = w * h, seen = new Uint8Array(n), stack = new Int32Array(n), top = 0;
        function push(p) { if (!seen[p]) { seen[p] = 1; stack[top++] = p; } }
        for (x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
        for (y = 1; y < h - 1; y++) { push(y * w); push(y * w + w - 1); }
        while (top) {
            var p = stack[--top], i = p * 4;
            if (Math.abs(d[i] - br) + Math.abs(d[i + 1] - bg) + Math.abs(d[i + 2] - bb) > tol) continue;
            d[i + 3] = 0;
            var px = p % w;
            if (px > 0) push(p - 1);
            if (px < w - 1) push(p + 1);
            if (p >= w) push(p - w);
            if (p < n - w) push(p + w);
        }
    }

    // 디테일(1~10) → 색 단계 차이. 작을수록 그라데이션·사진을 촘촘한 색 단계로 나눈다.
    // 24 이상으로 거칠게 하면 불꽃 같은 그라데이션 영역이 배경에 합쳐져 통째로 사라진다.
    var LAYER_DIFFERENCE = [40, 34, 28, 24, 20, 18, 16, 13, 11, 8];

    function buildOptions(p) {
        var detail = Math.max(1, Math.min(10, Math.round(p.detail)));
        var opts = {
            mode: 'spline',
            filterSpeckle: p.pathomit,
            cornerThreshold: 60,
            lengthThreshold: 4,
            spliceThreshold: 45,
            maxIterations: 10,
            pathPrecision: 2
        };
        if (p.smooth > 0) opts.simplify = p.smooth * 0.5;

        if (p.mode === 'mono') {
            opts.clustering = 'bw';
        } else {
            opts.clustering = 'color-cluster';
            opts.hierarchical = 'stacked';
            // 색 정밀도(비트): 일러스트는 비슷한 색을 조금 더 합친다.
            // (maxColors 로 색 수를 강제로 줄이면 남색 글자가 갈색이 되는 등 색이 틀어져 쓰지 않는다)
            opts.colorPrecision = p.mode === 'illust' ? 7 : 8;
            opts.layerDifference = LAYER_DIFFERENCE[detail - 1];
        }
        return opts;
    }

    function wsTraceImage(imgd, p) {
        return ensureVTracer().then(function() {
            var w = imgd.width, h = imgd.height;
            var d = new Uint8Array(imgd.data.buffer.slice(0));

            if (p.mode === 'mono') binarize(d, p.threshold, p.invert);
            else if (p.removeBg) removeBackground(d, w, h);

            var raw = root.vtracerWasm.vectorize_rgba(d, w, h, buildOptions(p));
            var open = raw.indexOf('<svg'), start = raw.indexOf('>', open) + 1, end = raw.lastIndexOf('</svg>');
            var body = raw.slice(start, end).trim();

            if (p.mode === 'mono') {
                body = body.replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#000000"');
                if (!p.removeBg) body = '<rect width="' + w + '" height="' + h + '" fill="#FFFFFF"/>' + body;
            }

            return {
                body: body,
                paths: (body.match(/<path/g) || []).length,
                width: w,
                height: h
            };
        });
    }

    root.wsTraceImage = wsTraceImage;
})(typeof self !== 'undefined' ? self : this);
