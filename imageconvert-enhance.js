// ── 해상도 개선 알고리즘 ───────────────────────────────────────
// DOM 에 의존하지 않는 순수 함수라 브라우저·Node 어디서나 돌릴 수 있다.
//
// wsEnhanceImage(src, sw, sh, tw, th, o) → Uint8ClampedArray (tw×th RGBA)
//   src : 원본 RGBA
//   o   : { denoise: 0~3, crisp: 0~1, sharpen: 0~1.5, contrast: -0.3~0.5 }
//
// 처리 순서
//   1) 노이즈 제거 : JPG 색 번짐(색차)은 강하게 흐리고, 밝기는 경계를 보존하는 bilateral 필터로 정리
//   2) 확대       : Lanczos3 (+링잉 억제) — 브라우저 기본 확대보다 경계가 선명
//   3) 경계 선명화 : 글자·도형 경계의 전환 폭을 좁혀 번짐을 걷어냄 (안티앨리어싱은 유지해 계단 현상 없음)
//   4) 선명도     : 밝기 기준 언샤프 마스크, 주변 3×3 밝기 범위를 넘지 않게 제한해 흰 띠(헤일로) 방지
//   5) 대비

(function(root) {
    'use strict';

    function wsEnhanceImage(src, sw, sh, tw, th, o) {
        var data = premultiply(src);
        if (o.denoise > 0) data = denoise(data, sw, sh, o.denoise);

        var up = (tw !== sw || th !== sh) ? lanczosResize(data, sw, sh, tw, th) : data;
        var scale = tw / sw;

        if (o.crisp > 0) up = crispEdges(up, tw, th, o.crisp, scale);
        if (o.sharpen > 0) up = sharpenLuma(up, tw, th, o.sharpen, Math.max(1, Math.round(scale * 0.5)));

        return toBytes(up, o.contrast || 0);
    }

    // ── 알파 곱하기/되돌리기 (투명 PNG 가장자리에 검은 테두리가 생기지 않도록) ──
    function premultiply(src) {
        var n = src.length, out = new Float32Array(n);
        for (var i = 0; i < n; i += 4) {
            var a = src[i + 3] / 255;
            out[i] = src[i] * a; out[i + 1] = src[i + 1] * a; out[i + 2] = src[i + 2] * a; out[i + 3] = src[i + 3];
        }
        return out;
    }

    function toBytes(d, contrast) {
        var n = d.length, out = new Uint8ClampedArray(n), cf = 1 + contrast;
        for (var i = 0; i < n; i += 4) {
            var a = d[i + 3];
            if (a <= 0) continue;
            var k = 255 / a;
            for (var c = 0; c < 3; c++) {
                var v = d[i + c] * k;
                if (contrast !== 0) v = (v - 128) * cf + 128;
                out[i + c] = v;
            }
            out[i + 3] = a;
        }
        return out;
    }

    // ── 1) 노이즈 제거 ──
    function denoise(d, w, h, level) {
        var n = w * h, Y = new Float32Array(n), Cb = new Float32Array(n), Cr = new Float32Array(n);
        for (var p = 0, i = 0; p < n; p++, i += 4) {
            var r = d[i], g = d[i + 1], b = d[i + 2];
            Y[p] = 0.299 * r + 0.587 * g + 0.114 * b;
            Cb[p] = -0.168736 * r - 0.331264 * g + 0.5 * b;
            Cr[p] = 0.5 * r - 0.418688 * g - 0.081312 * b;
        }

        // JPG 는 색 정보를 절반 해상도로 저장해 글자 주변에 색 얼룩이 생긴다 → 색차는 넉넉히 흐리되,
        // 밝기가 비슷한 픽셀끼리만 섞는다. 그냥 흐리면 남색 글자의 푸른 기운이 배경으로 번지고 빨간 글자는 채도가 빠진다.
        var chroma = bilateral([Cb, Cr], Y, w, h, level + 1, 12);
        Cb = chroma[0]; Cr = chroma[1];
        Y = bilateral([Y], Y, w, h, level >= 3 ? 2 : 1, [0, 14, 22, 32][level])[0];

        var out = new Float32Array(d.length);
        for (p = 0, i = 0; p < n; p++, i += 4) {
            out[i] = Y[p] + 1.402 * Cr[p];
            out[i + 1] = Y[p] - 0.344136 * Cb[p] - 0.714136 * Cr[p];
            out[i + 2] = Y[p] + 1.772 * Cb[p];
            out[i + 3] = d[i + 3];
        }
        return out;
    }

    // joint bilateral: guide 밝기 차이로 가중치를 매겨 channels 각각을 경계 보존하며 흐린다.
    // 가중치는 채널끼리 같으므로 한 번만 계산하고, 지수 함수는 미리 만든 표로 대신한다.
    function bilateral(channels, guide, w, h, r, sigmaR) {
        var n = w * h, nc = channels.length, outs = [], c, i;
        for (c = 0; c < nc; c++) outs.push(new Float32Array(n));
        var lut = new Float32Array(512);
        for (i = 0; i < 512; i++) lut[i] = Math.exp(-(i * i) / (2 * sigmaR * sigmaR));
        var dxs = [], dys = [], sp = [], sigmaS2 = 2 * Math.max(1, r * r / 2);
        for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
            dxs.push(dx); dys.push(dy); sp.push(Math.exp(-(dx * dx + dy * dy) / sigmaS2));
        }
        var taps = sp.length, offs = new Int32Array(taps), spw = new Float32Array(sp), acc = new Float64Array(nc);
        for (i = 0; i < taps; i++) offs[i] = dys[i] * w + dxs[i];

        for (var y = 0; y < h; y++) {
            var innerRow = y >= r && y < h - r;
            for (var x = 0; x < w; x++) {
                var p = y * w + x, gv = guide[p], wsum = 0;
                var fast = innerRow && x >= r && x < w - r;
                for (c = 0; c < nc; c++) acc[c] = 0;
                for (var t = 0; t < taps; t++) {
                    var q;
                    if (fast) {
                        q = p + offs[t];
                    } else {
                        var yy = y + dys[t], xx = x + dxs[t];
                        yy = yy < 0 ? 0 : (yy >= h ? h - 1 : yy);
                        xx = xx < 0 ? 0 : (xx >= w ? w - 1 : xx);
                        q = yy * w + xx;
                    }
                    var diff = guide[q] - gv;
                    var di = ((diff < 0 ? -diff : diff) + 0.5) | 0;
                    var wt = spw[t] * lut[di > 511 ? 511 : di];
                    wsum += wt;
                    for (c = 0; c < nc; c++) acc[c] += channels[c][q] * wt;
                }
                for (c = 0; c < nc; c++) outs[c][p] = acc[c] / wsum;
            }
        }
        return outs;
    }

    // 단일 채널 박스 블러 (passes 회 반복, 가장자리는 끝 픽셀 반복)
    function boxBlur1(a, w, h, r, passes) {
        var src = new Float32Array(a), tmp = new Float32Array(a.length), inv = 1 / (2 * r + 1);
        var x, y, k, sum, base, first, last, add, sub;
        for (var pass = 0; pass < passes; pass++) {
            for (y = 0; y < h; y++) {
                base = y * w; first = src[base]; last = src[base + w - 1];
                sum = first * (r + 1);
                for (k = 1; k <= r; k++) sum += k < w ? src[base + k] : last;
                for (x = 0; x < w; x++) {
                    tmp[base + x] = sum * inv;
                    add = x + r + 1; sub = x - r;
                    sum += (add < w ? src[base + add] : last) - (sub > 0 ? src[base + sub] : first);
                }
            }
            for (x = 0; x < w; x++) {
                first = tmp[x]; last = tmp[(h - 1) * w + x];
                sum = first * (r + 1);
                for (k = 1; k <= r; k++) sum += k < h ? tmp[k * w + x] : last;
                for (y = 0; y < h; y++) {
                    src[y * w + x] = sum * inv;
                    add = y + r + 1; sub = y - r;
                    sum += (add < h ? tmp[add * w + x] : last) - (sub > 0 ? tmp[sub * w + x] : first);
                }
            }
        }
        return src;
    }

    // ── 2) Lanczos3 확대 ──
    function lanczosKernel(x) {
        if (x === 0) return 1;
        if (x <= -3 || x >= 3) return 0;
        var px = Math.PI * x;
        return 3 * Math.sin(px) * Math.sin(px / 3) / (px * px);
    }

    function lanczosWeights(inSize, outSize) {
        var scale = inSize / outSize, filterScale = Math.max(1, scale), support = 3 * filterScale;
        var starts = new Int32Array(outSize), counts = new Int32Array(outSize), weights = [], near = new Int32Array(outSize);
        for (var i = 0; i < outSize; i++) {
            var center = (i + 0.5) * scale - 0.5;
            var left = Math.ceil(center - support), right = Math.floor(center + support), total = 0, row = [];
            for (var j = left; j <= right; j++) {
                var wt = lanczosKernel((j - center) / filterScale);
                row.push(wt); total += wt;
            }
            starts[i] = left; counts[i] = row.length; near[i] = Math.floor(center);
            for (j = 0; j < row.length; j++) weights.push(row[j] / total);
        }
        return { starts: starts, counts: counts, weights: new Float32Array(weights), near: near };
    }

    function lanczosResize(d, sw, sh, dw, dh) {
        var tmp = resizeAxis(d, sw, sh, dw, true);
        return resizeAxis(tmp, dw, sh, dh, false);
    }

    // 한 축 방향 리샘플. 결과를 가장 가까운 두 원본 픽셀 범위로 제한해 경계의 링잉(물결 테두리)을 막는다.
    function resizeAxis(d, w, h, outLen, horizontal) {
        var inLen = horizontal ? w : h, lines = horizontal ? h : w;
        var ow = horizontal ? outLen : w, oh = horizontal ? h : outLen;
        var wts = lanczosWeights(inLen, outLen), W = wts.weights, out = new Float32Array(ow * oh * 4);

        // 출력 위치별로 참조할 원본 픽셀의 버퍼 위치(가장자리 고정)를 미리 계산
        var stride = horizontal ? 4 : w * 4;
        var offs = new Int32Array(outLen), pos = new Int32Array(W.length), p0s = new Int32Array(outLen), p1s = new Int32Array(outLen);
        for (var i = 0, off = 0; i < outLen; i++) {
            offs[i] = off;
            for (var k = 0; k < wts.counts[i]; k++) {
                var sIdx = wts.starts[i] + k;
                pos[off + k] = (sIdx < 0 ? 0 : (sIdx >= inLen ? inLen - 1 : sIdx)) * stride;
            }
            off += wts.counts[i];
            var n0 = wts.near[i] < 0 ? 0 : (wts.near[i] >= inLen ? inLen - 1 : wts.near[i]);
            p0s[i] = n0 * stride;
            p1s[i] = (n0 + 1 >= inLen ? inLen - 1 : n0 + 1) * stride;
        }

        for (var line = 0; line < lines; line++) {
            var base = horizontal ? line * w * 4 : line * 4;
            for (i = 0; i < outLen; i++) {
                var o = horizontal ? (line * ow + i) * 4 : (i * ow + line) * 4;
                var start = offs[i], cnt = wts.counts[i], a0 = base + p0s[i], a1 = base + p1s[i];
                for (var c = 0; c < 4; c++) {
                    var sum = 0;
                    for (k = 0; k < cnt; k++) sum += d[base + pos[start + k] + c] * W[start + k];
                    var va = d[a0 + c], vb = d[a1 + c], lo = va < vb ? va : vb, hi = va < vb ? vb : va;
                    out[o + c] = sum < lo ? lo : (sum > hi ? hi : sum);
                }
            }
        }
        return out;
    }

    // ── 3) 경계 선명화 ──
    // 주변 창의 가장 어두운/밝은 밝기 사이에서 전환 구간의 기울기를 가파르게 만든다.
    // - 전환 위치는 살짝 흐린 밝기(G)로 계산한다. 원본 픽셀을 그대로 쓰면 JPG 잡티까지 경계로 강조돼 테두리가 울퉁불퉁해진다.
    // - 색은 건드리지 않고 밝기만 비율로 옮긴다. 주변 픽셀 색을 가져오면 압축 얼룩 색이 번져 빛번짐·거뭇한 테두리가 생기고,
    //   밝기를 빼기로 옮기면 빨간 글자처럼 채도 높은 색이 탁해진다.
    // - 옮긴 밝기는 그 픽셀 가까운 주변의 실제 밝기 범위를 넘지 않게 해 글자 바깥에 밝은 테두리(헤일로)가 생기지 않게 한다.
    // - 두 밝기 사이 값(안티앨리어싱)은 남기므로 계단이 생기지 않고, 대비가 낮은 질감(사진 결)은 거의 건드리지 않는다.
    function crispEdges(d, w, h, strength, scale) {
        var n = w * h, Y = new Float32Array(n);
        for (var p = 0, i = 0; p < n; p++, i += 4) Y[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

        var R = Math.max(1, Math.round(scale));
        var G = boxBlur1(Y, w, h, Math.max(1, Math.round(scale * 0.5)), 2);
        var extG = windowMinMax(G, w, h, R);
        var extV = windowMinMax(boxBlur1(Y, w, h, 1, 1), w, h, R);
        var near = windowMinMax(Y, w, h, Math.max(1, Math.round(scale * 0.5)));

        var out = new Float32Array(d), gain = 1 + 4 * strength;
        for (p = 0; p < n; p++) {
            var gRange = extG.max[p] - extG.min[p], vRange = extV.max[p] - extV.min[p];
            if (gRange < 8 || vRange < 16) continue;
            var edgeW = Math.min(1, (vRange - 16) / 48);
            var t = (G[p] - extG.min[p]) / gRange, t2 = 0.5 + (t - 0.5) * gain;
            t2 = t2 < 0 ? 0 : (t2 > 1 ? 1 : t2);
            var target = extV.min[p] + vRange * t2;
            target = target < near.min[p] ? near.min[p] : (target > near.max[p] ? near.max[p] : target);
            // 밝은 쪽 픽셀이 주변 배경(흐린 밝기의 최댓값)보다 밝으면 JPG 링잉 테두리이므로 배경 밝기로 눌러준다
            if (t2 >= 0.5 && target > extG.max[p]) target = extG.max[p];
            var newY = Y[p] + (target - Y[p]) * edgeW, o = p * 4;
            if (Y[p] > 1) {
                var k = newY / Y[p];
                out[o] = d[o] * k; out[o + 1] = d[o + 1] * k; out[o + 2] = d[o + 2] * k;
            } else {
                out[o] = out[o + 1] = out[o + 2] = newY;
            }
        }
        return out;
    }

    // ── 4) 헤일로 없는 언샤프 마스크 (밝기 기준) ──
    // RGB 각각을 날카롭게 하면 경계에 색 테두리가 생기고 3배 느리므로, 밝기만 계산해 비율로 반영한다.
    function sharpenLuma(d, w, h, amount, r) {
        var n = w * h, Y = new Float32Array(n);
        for (var p = 0, i = 0; p < n; p++, i += 4) Y[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        var soft = boxBlur1(Y, w, h, r, 2), ext = windowMinMax(Y, w, h, 1), out = new Float32Array(d);
        for (p = 0; p < n; p++) {
            var y = Y[p];
            if (y <= 1) continue;
            var v = y + (y - soft[p]) * amount;
            v = v < ext.min[p] ? ext.min[p] : (v > ext.max[p] ? ext.max[p] : v);
            var k = v / y, o = p * 4;
            out[o] = d[o] * k; out[o + 1] = d[o + 1] * k; out[o + 2] = d[o + 2] * k;
        }
        return out;
    }

    // (2r+1)² 창의 최솟값·최댓값. 가로→세로 분리 계산.
    function windowMinMax(a, w, h, r) {
        var n = w * h, tmin = new Float32Array(n), tmax = new Float32Array(n), mn = new Float32Array(n), mx = new Float32Array(n);
        var x, y, k, lo, hi, v, k0, k1, base;
        for (y = 0; y < h; y++) {
            base = y * w;
            for (x = 0; x < w; x++) {
                k0 = x - r; if (k0 < 0) k0 = 0;
                k1 = x + r; if (k1 >= w) k1 = w - 1;
                lo = a[base + k0]; hi = lo;
                for (k = k0 + 1; k <= k1; k++) {
                    v = a[base + k];
                    if (v < lo) lo = v; else if (v > hi) hi = v;
                }
                tmin[base + x] = lo; tmax[base + x] = hi;
            }
        }
        for (x = 0; x < w; x++) {
            for (y = 0; y < h; y++) {
                k0 = y - r; if (k0 < 0) k0 = 0;
                k1 = y + r; if (k1 >= h) k1 = h - 1;
                lo = tmin[k0 * w + x]; hi = tmax[k0 * w + x];
                for (k = k0 + 1; k <= k1; k++) {
                    v = tmin[k * w + x]; if (v < lo) lo = v;
                    v = tmax[k * w + x]; if (v > hi) hi = v;
                }
                mn[y * w + x] = lo; mx[y * w + x] = hi;
            }
        }
        return { min: mn, max: mx };
    }

    root.wsEnhanceImage = wsEnhanceImage;
})(typeof self !== 'undefined' ? self : this);
