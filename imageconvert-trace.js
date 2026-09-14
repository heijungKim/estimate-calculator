// ── 이미지 → 벡터(SVG) 변환 핵심 로직 ─────────────────────────
// 웹 워커(imageconvert-worker.js)와 메인 스레드(워커를 못 쓰는 환경) 양쪽에서
// 함께 쓰므로 DOM·jQuery 에 의존하지 않는다. lib/imagetracer_v1.2.6.js 가 먼저 로드되어야 한다.
//
// wsTraceImage(imgd, p) → { svg, colors, paths, width, height }
//   imgd : { width, height, data(Uint8ClampedArray RGBA) }  (배경은 흰색으로 합성된 상태)
//   p    : { mode:'illust'|'vector'|'mono', colors, detail(1~10), pathomit, blur,
//            stroke, removeBg, threshold, invert, widthMm }

(function(root) {
    'use strict';

    // 디테일(1~10) → ImageTracer 직선/곡선 허용 오차. 10이면 0.5px, 1이면 8px
    // (0.5px 미만은 픽셀 계단까지 그대로 따라가 곡선이 지저분해진다)
    function detailToRes(detail) {
        var t = (10 - Math.max(1, Math.min(10, detail))) / 9;
        return +(0.5 * Math.pow(16, t)).toFixed(3);
    }

    // 흑백 모드: 명암 기준값으로 이진화
    function binarize(imgd, threshold, invert) {
        var d = imgd.data;
        for (var i = 0; i < d.length; i += 4) {
            var lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
            var dark = lum < threshold;
            if (invert) dark = !dark;
            var v = dark ? 0 : 255;
            d[i] = d[i + 1] = d[i + 2] = v;
            d[i + 3] = 255;
        }
    }

    // 결정적(seed 고정) 난수 — 같은 설정이면 같은 결과가 나오도록
    function makeRandom(seed) {
        var s = seed >>> 0;
        return function() {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    // 표본 픽셀로 k-means++ 팔레트 생성.
    // ImageTracer 기본 격자 샘플링은 로고의 작은 강조색을 자주 놓쳐서 직접 만든다.
    function buildPalette(imgd, k) {
        var d = imgd.data, total = imgd.width * imgd.height;
        var step = Math.max(1, Math.floor(total / 40000));
        var samples = [];
        for (var p = 0; p < total; p += step) {
            var i = p * 4;
            samples.push([d[i], d[i + 1], d[i + 2]]);
        }
        var n = samples.length, rnd = makeRandom(20260914);
        k = Math.max(1, Math.min(k, n));

        function dist(a, b) {
            var dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
            return dr * dr + dg * dg + db * db;
        }

        // k-means++ 초기 중심
        var centers = [samples[Math.floor(rnd() * n)].slice()];
        var best = new Float64Array(n);
        for (var s = 0; s < n; s++) best[s] = dist(samples[s], centers[0]);
        while (centers.length < k) {
            var sum = 0;
            for (s = 0; s < n; s++) sum += best[s];
            if (sum === 0) break; // 남은 색이 모두 기존 중심과 같음
            var target = rnd() * sum, idx = 0;
            for (s = 0; s < n; s++) { target -= best[s]; if (target <= 0) { idx = s; break; } }
            var c = samples[idx].slice();
            centers.push(c);
            for (s = 0; s < n; s++) { var dd = dist(samples[s], c); if (dd < best[s]) best[s] = dd; }
        }

        // Lloyd 반복
        for (var iter = 0; iter < 8; iter++) {
            var acc = centers.map(function() { return [0, 0, 0, 0]; });
            for (s = 0; s < n; s++) {
                var bi = 0, bd = Infinity;
                for (var ci = 0; ci < centers.length; ci++) {
                    var dc = dist(samples[s], centers[ci]);
                    if (dc < bd) { bd = dc; bi = ci; }
                }
                acc[bi][0] += samples[s][0]; acc[bi][1] += samples[s][1]; acc[bi][2] += samples[s][2]; acc[bi][3]++;
            }
            for (ci = 0; ci < centers.length; ci++) {
                if (acc[ci][3]) centers[ci] = [acc[ci][0] / acc[ci][3], acc[ci][1] / acc[ci][3], acc[ci][2] / acc[ci][3]];
            }
        }

        return centers.map(function(c) {
            return { r: Math.round(c[0]), g: Math.round(c[1]), b: Math.round(c[2]), a: 255 };
        });
    }

    function nearestIndex(palette, r, g, b) {
        var bi = 0, bd = Infinity;
        for (var k = 0; k < palette.length; k++) {
            var d = Math.abs(palette[k].r - r) + Math.abs(palette[k].g - g) + Math.abs(palette[k].b - b);
            if (d < bd) { bd = d; bi = k; }
        }
        return bi;
    }

    // 두 색 사이의 "중간색"이면서 면적이 작은 팔레트 색을 제거한다.
    // 흰 바탕 위 빨간 원 둘레의 연분홍 띠처럼, 샤프닝·JPG 압축으로 생긴 경계 번짐이 독립된 색으로 잡히는 것을 막는다.
    function pruneBlendColors(imgd, index, palette, maxShare) {
        var k = palette.length, total = index.length, counts = new Array(k).fill(0);
        for (var p = 0; p < total; p++) counts[index[p]]++;

        // 면적이 큰 색부터 판단해, 중간색의 양 끝 색은 반드시 남아 있는 색이 되게 한다
        var order = [], c;
        for (c = 0; c < k; c++) if (counts[c] > 0) order.push(c);
        order.sort(function(x, y) { return counts[y] - counts[x]; });

        var kept = [], ends = {};
        order.forEach(function(ci) {
            if (counts[ci] / total < maxShare) {
                for (var i = 0; i < kept.length; i++) {
                    for (var j = i + 1; j < kept.length; j++) {
                        if (liesBetween(palette[ci], palette[kept[i]], palette[kept[j]])) {
                            ends[ci] = [kept[i], kept[j]];
                            return;
                        }
                    }
                }
            }
            kept.push(ci);
        });
        if (kept.length === order.length || kept.length < 2) return null;

        // 남은 색 번호로 다시 매기고, 지운 색 픽셀은 양 끝 색 중 실제 픽셀과 가까운 쪽으로 보낸다
        var remap = new Array(k).fill(0), newPalette = kept.map(function(ci, n) { remap[ci] = n; return palette[ci]; });
        var d = imgd.data, out = new Uint8Array(total);
        for (p = 0; p < total; p++) {
            var ci2 = index[p], e = ends[ci2];
            if (!e) { out[p] = remap[ci2]; continue; }
            var i4 = p * 4, pa = palette[e[0]], pb = palette[e[1]];
            var da = Math.abs(pa.r - d[i4]) + Math.abs(pa.g - d[i4 + 1]) + Math.abs(pa.b - d[i4 + 2]);
            var db = Math.abs(pb.r - d[i4]) + Math.abs(pb.g - d[i4 + 1]) + Math.abs(pb.b - d[i4 + 2]);
            out[p] = remap[da <= db ? e[0] : e[1]];
        }
        return { palette: newPalette, index: out };
    }

    function liesBetween(c, a, b) {
        var abr = b.r - a.r, abg = b.g - a.g, abb = b.b - a.b;
        var len2 = abr * abr + abg * abg + abb * abb;
        if (len2 < 900) return false; // 두 색이 너무 비슷하면 판단하지 않음
        var t = ((c.r - a.r) * abr + (c.g - a.g) * abg + (c.b - a.b) * abb) / len2;
        if (t < 0.08 || t > 0.92) return false;
        var dr = a.r + abr * t - c.r, dg = a.g + abg * t - c.g, db = a.b + abb * t - c.b;
        return dr * dr + dg * dg + db * db < 32 * 32;
    }

    function quantize(imgd, palette) {
        var d = imgd.data, n = imgd.width * imgd.height, index = new Uint8Array(n);
        for (var p = 0; p < n; p++) {
            var i = p * 4;
            index[p] = nearestIndex(palette, d[i], d[i + 1], d[i + 2]);
        }
        return index;
    }

    // 3×3 이웃에서 가장 많은 색으로 바꾼다 (동률이면 현재 색 유지)
    function majorityFilter(index, w, h, k) {
        var out = new Uint8Array(index.length), counts = new Uint8Array(k), touched = new Uint8Array(9);
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var p = y * w + x, cur = index[p], nt = 0;
                for (var dy = -1; dy <= 1; dy++) {
                    var yy = Math.min(h - 1, Math.max(0, y + dy));
                    for (var dx = -1; dx <= 1; dx++) {
                        var xx = Math.min(w - 1, Math.max(0, x + dx));
                        var c = index[yy * w + xx];
                        if (counts[c]++ === 0) touched[nt++] = c;
                    }
                }
                var best = cur;
                for (var t = 0; t < nt; t++) {
                    if (counts[touched[t]] > counts[best]) best = touched[t];
                }
                for (t = 0; t < nt; t++) counts[touched[t]] = 0;
                out[p] = best;
            }
        }
        return out;
    }

    function paintIndex(imgd, index, palette) {
        var d = imgd.data;
        for (var p = 0; p < index.length; p++) {
            var c = palette[index[p]], i = p * 4;
            d[i] = c.r; d[i + 1] = c.g; d[i + 2] = c.b; d[i + 3] = 255;
        }
    }

    // 테두리 픽셀에서 가장 많이 나온 팔레트 색 = 배경색으로 판단
    function detectBackground(index, w, h, k) {
        var counts = new Array(k).fill(0);
        for (var x = 0; x < w; x++) { counts[index[x]]++; counts[index[(h - 1) * w + x]]++; }
        for (var y = 1; y < h - 1; y++) { counts[index[y * w]]++; counts[index[y * w + w - 1]]++; }
        var bi = 0;
        for (var c = 1; c < k; c++) if (counts[c] > counts[bi]) bi = c;
        return bi;
    }

    function num(v) { return +v.toFixed(1); }

    // ImageTracer 경로 → SVG path d 문자열 (구멍은 역방향으로 이어 붙임)
    function pathData(layer, path) {
        var seg = path.segments, str = 'M' + num(seg[0].x1) + ' ' + num(seg[0].y1);
        for (var i = 0; i < seg.length; i++) {
            var sg = seg[i];
            str += sg.type + num(sg.x2) + ' ' + num(sg.y2);
            if (sg.hasOwnProperty('x3')) str += ' ' + num(sg.x3) + ' ' + num(sg.y3);
        }
        str += 'Z';
        for (var h = 0; h < path.holechildren.length; h++) {
            var hs = layer[path.holechildren[h]].segments, last = hs[hs.length - 1];
            str += last.hasOwnProperty('x3') ? ('M' + num(last.x3) + ' ' + num(last.y3)) : ('M' + num(last.x2) + ' ' + num(last.y2));
            for (var j = hs.length - 1; j >= 0; j--) {
                var s = hs[j];
                str += s.type;
                if (s.hasOwnProperty('x3')) str += num(s.x2) + ' ' + num(s.y2) + ' ';
                str += num(s.x1) + ' ' + num(s.y1);
            }
            str += 'Z';
        }
        return str;
    }

    function hex(c) {
        return '#' + [c.r, c.g, c.b].map(function(v) { return ('0' + v.toString(16)).slice(-2); }).join('');
    }

    function wsTraceImage(imgd, p) {
        var tracer = root.ImageTracer;
        if (!tracer) throw new Error('ImageTracer 라이브러리를 불러오지 못했습니다.');

        // 경계 부드럽게: 색 경계는 살리고 얼룩만 뭉개는 선택적 가우시안 블러
        if (p.blur > 0) {
            var blurred = tracer.blur(imgd, p.blur, 64);
            imgd = { width: imgd.width, height: imgd.height, data: Uint8ClampedArray.from(blurred.data) };
        }

        var mono = p.mode === 'mono';
        if (mono) binarize(imgd, p.threshold, p.invert);

        var palette = mono
            ? [{ r: 0, g: 0, b: 0, a: 255 }, { r: 255, g: 255, b: 255, a: 255 }]
            : buildPalette(imgd, p.colors);

        // 색 나누기 → 다수결 필터로 경계의 옅은 번짐 띠 제거 → 팔레트 색으로 다시 칠함
        var index = quantize(imgd, palette);
        if (!mono) {
            var pruned = pruneBlendColors(imgd, index, palette, p.mode === 'illust' ? 0.06 : 0.03);
            if (pruned) {
                palette = pruned.palette;
                index = pruned.index;
            }
        }
        var passes = p.mode === 'illust' ? 2 : (mono ? 1 : 0);
        for (var ps = 0; ps < passes; ps++) index = majorityFilter(index, imgd.width, imgd.height, palette.length);
        paintIndex(imgd, index, palette);

        var bgIndex = p.removeBg ? detectBackground(index, imgd.width, imgd.height, palette.length) : -1;

        var res = detailToRes(p.detail);
        var options = tracer.checkoptions({
            ltres: res,
            qtres: res,
            pathomit: p.pathomit,
            rightangleenhance: p.mode !== 'illust',
            linefilter: p.mode === 'illust',
            pal: palette.map(function(c) { return { r: c.r, g: c.g, b: c.b, a: c.a }; }),
            numberofcolors: palette.length,
            colorquantcycles: 1,
            blurradius: 0,
            layering: 0
        });

        var td = tracer.imagedataToTracedata(imgd, options);
        var w = td.width, h = td.height;

        var sizeAttr;
        if (p.widthMm > 0) {
            var mmH = p.widthMm * h / w;
            sizeAttr = 'width="' + num(p.widthMm) + 'mm" height="' + num(mmH) + 'mm"';
        } else {
            sizeAttr = 'width="' + w + '" height="' + h + '"';
        }

        var body = '', pathCount = 0, colorCount = 0;
        for (var l = 0; l < td.layers.length; l++) {
            if (l === bgIndex) continue;
            var layer = td.layers[l], parts = [];
            for (var i = 0; i < layer.length; i++) {
                var path = layer[i];
                if (path.isholepath) continue;
                if (options.linefilter && path.segments.length < 3) continue;
                parts.push('<path d="' + pathData(layer, path) + '"/>');
            }
            if (!parts.length) continue;
            var color = hex(td.palette[l]);
            var strokeAttr = p.stroke > 0
                ? ' stroke="' + color + '" stroke-width="' + p.stroke + '" stroke-linejoin="round"'
                : '';
            body += '<g fill="' + color + '"' + strokeAttr + '>' + parts.join('') + '</g>';
            pathCount += parts.length;
            colorCount++;
        }

        var svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" ' + sizeAttr +
            ' viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>';

        return { svg: svg, colors: colorCount, paths: pathCount, width: w, height: h };
    }

    root.wsTraceImage = wsTraceImage;
})(typeof self !== 'undefined' ? self : this);
