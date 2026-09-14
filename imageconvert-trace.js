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

    // 색상 히스토그램 기반 가중 k-means++ 로 팔레트 생성.
    // 픽셀 수를 그대로 가중치로 쓰면 넓은 그라데이션 배경이 비슷한 색으로 팔레트를 다 차지해
    // 작은 글자·로고의 뚜렷한 색이 빠진다. 그래서 비슷한 색을 한 칸으로 묶고 면적의 제곱근만큼만 반영한다.
    function buildPalette(imgd, k) {
        var d = imgd.data, total = imgd.width * imgd.height;
        var bins = new Map();
        for (var p = 0; p < total; p++) {
            var i = p * 4, key = (d[i] >> 3) << 10 | (d[i + 1] >> 3) << 5 | (d[i + 2] >> 3);
            var b = bins.get(key);
            if (!b) { b = [0, 0, 0, 0]; bins.set(key, b); }
            b[0] += d[i]; b[1] += d[i + 1]; b[2] += d[i + 2]; b[3]++;
        }

        // 아주 드문 색(압축 잡티)은 제외
        var minCount = Math.max(2, Math.floor(total * 0.00005));
        var samples = [], weights = [];
        bins.forEach(function(b) {
            if (b[3] < minCount) return;
            samples.push([b[0] / b[3], b[1] / b[3], b[2] / b[3]]);
            weights.push(Math.sqrt(b[3]));
        });
        if (!samples.length) {
            bins.forEach(function(b) { samples.push([b[0] / b[3], b[1] / b[3], b[2] / b[3]]); weights.push(Math.sqrt(b[3])); });
        }

        var n = samples.length, rnd = makeRandom(20260914);
        k = Math.max(1, Math.min(k, n));

        function dist(a, c) {
            var dr = a[0] - c[0], dg = a[1] - c[1], db = a[2] - c[2];
            return dr * dr + dg * dg + db * db;
        }

        // k-means++ 초기 중심: 가장 비중 큰 색에서 시작, 이후 거리² × 가중치에 비례해 선택
        var first = 0;
        for (var s = 1; s < n; s++) if (weights[s] > weights[first]) first = s;
        var centers = [samples[first].slice()];
        var best = new Float64Array(n);
        for (s = 0; s < n; s++) best[s] = dist(samples[s], centers[0]);
        while (centers.length < k) {
            var sum = 0;
            for (s = 0; s < n; s++) sum += best[s] * weights[s];
            if (sum === 0) break; // 남은 색이 모두 기존 중심과 같음
            var target = rnd() * sum, idx = 0;
            for (s = 0; s < n; s++) { target -= best[s] * weights[s]; if (target <= 0) { idx = s; break; } }
            var c = samples[idx].slice();
            centers.push(c);
            for (s = 0; s < n; s++) { var dd = dist(samples[s], c); if (dd < best[s]) best[s] = dd; }
        }

        // 가중 Lloyd 반복
        for (var iter = 0; iter < 10; iter++) {
            var acc = centers.map(function() { return [0, 0, 0, 0]; });
            for (s = 0; s < n; s++) {
                var bi = 0, bd = Infinity;
                for (var ci = 0; ci < centers.length; ci++) {
                    var dc = dist(samples[s], centers[ci]);
                    if (dc < bd) { bd = dc; bi = ci; }
                }
                var wt = weights[s];
                acc[bi][0] += samples[s][0] * wt; acc[bi][1] += samples[s][1] * wt; acc[bi][2] += samples[s][2] * wt; acc[bi][3] += wt;
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

    // 두 색 사이의 "중간색"이면서, 그 두 색 사이에 끼어 있는 가는 띠인 팔레트 색을 제거한다.
    // 흰 바탕 위 빨간 원 둘레의 연분홍 띠처럼, 샤프닝·JPG 압축으로 생긴 경계 번짐이 독립된 색으로 잡히는 것을 막는다.
    // 가는 글자 획도 "가늘고 중간색"일 수 있지만 한쪽(바탕)에만 닿으므로, 양 끝 색 모두와 맞닿아 있어야 번짐으로 본다.
    function pruneBlendColors(imgd, index, palette, maxShare) {
        var k = palette.length, total = index.length, w = imgd.width, h = imgd.height;
        var counts = new Array(k).fill(0), edge = new Array(k).fill(0);
        var adj = new Uint32Array(k * k), adjTotal = new Array(k).fill(0);
        for (var p = 0; p < total; p++) {
            var ci0 = index[p], x = p % w;
            counts[ci0]++;
            if ((x > 0 && index[p - 1] !== ci0) || (x < w - 1 && index[p + 1] !== ci0) ||
                (p >= w && index[p - w] !== ci0) || (p < total - w && index[p + w] !== ci0)) {
                edge[ci0]++;
            }
            // 오른쪽·아래 이웃과의 맞닿음 횟수 (색 쌍별)
            if (x < w - 1 && index[p + 1] !== ci0) { adj[ci0 * k + index[p + 1]]++; adj[index[p + 1] * k + ci0]++; }
            if (p < total - w && index[p + w] !== ci0) { adj[ci0 * k + index[p + w]]++; adj[index[p + w] * k + ci0]++; }
        }
        for (var r = 0; r < k; r++) for (var q = 0; q < k; q++) adjTotal[r] += adj[r * k + q];
        function touchesBoth(c, a, b) {
            var t = adjTotal[c];
            return t > 0 && adj[c * k + a] >= t * 0.2 && adj[c * k + b] >= t * 0.2;
        }

        // 면적이 큰 색부터 판단해, 중간색의 양 끝 색은 반드시 남아 있는 색이 되게 한다
        var order = [], c;
        for (c = 0; c < k; c++) if (counts[c] > 0) order.push(c);
        order.sort(function(x, y) { return counts[y] - counts[x]; });

        var kept = [], ends = {};
        order.forEach(function(ci) {
            if (counts[ci] / total < maxShare && edge[ci] / counts[ci] > 0.8) {
                for (var i = 0; i < kept.length; i++) {
                    for (var j = i + 1; j < kept.length; j++) {
                        if (liesBetween(palette[ci], palette[kept[i]], palette[kept[j]]) && touchesBoth(ci, kept[i], kept[j])) {
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

    // 3×3 이웃 중 5칸 이상을 차지한 다른 색이 있을 때만 그 색으로 바꾼다.
    // 점 잡티·1px 번짐은 지우고, 2px 이상 굵기의 가는 글자 획은 깎지 않는다.
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
                    if (counts[touched[t]] >= 5 && counts[touched[t]] > counts[best]) best = touched[t];
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
            var pruned = pruneBlendColors(imgd, index, palette, p.mode === 'illust' ? 0.05 : 0.02);
            if (pruned) {
                palette = pruned.palette;
                index = pruned.index;
            }
        }
        var passes = p.mode === 'vector' ? 0 : 1;
        for (var ps = 0; ps < passes; ps++) index = majorityFilter(index, imgd.width, imgd.height, palette.length);
        paintIndex(imgd, index, palette);

        var bgIndex = p.removeBg ? detectBackground(index, imgd.width, imgd.height, palette.length) : -1;

        var res = detailToRes(p.detail);
        var options = tracer.checkoptions({
            ltres: res,
            qtres: res,
            pathomit: p.pathomit,
            rightangleenhance: p.mode !== 'illust',
            linefilter: false, // 켜면 I·T 같은 가는 획이 선분으로 취급돼 사라진다
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

        var area = new Array(palette.length).fill(0);
        for (var q = 0; q < index.length; q++) area[index[q]]++;
        var order = td.layers.map(function(_, n) { return n; }).sort(function(a, b) { return area[b] - area[a]; });

        var body = '', pathCount = 0, colorCount = 0;
        for (var oi = 0; oi < order.length; oi++) {
            var l = order[oi];
            if (l === bgIndex) continue;
            var layer = td.layers[l], parts = [];
            for (var i = 0; i < layer.length; i++) {
                var path = layer[i];
                if (path.isholepath) continue;
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
