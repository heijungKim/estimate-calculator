// ── 이미지 → 벡터(SVG) 변환 ──────────────────────────────────
// 웹 워커(imageconvert-worker.js)와 메인 스레드(워커를 못 쓰는 환경) 양쪽에서 함께 쓰므로
// DOM·jQuery 에 의존하지 않는다. lib/vtracer/vtracer.js 가 먼저 로드되어야 한다.
//
// 확대해도 깨지지 않는 깔끔한 벡터를 위해 두 단계로 처리한다.
//   1) 단색화: 대표 색을 자동으로 뽑아 모든 픽셀을 그중 하나로 칠하고,
//      경계의 중간색(안티앨리어싱·JPG 번짐)과 점 잡티를 없앤다.
//      (이 단계 없이 벡터화하면 중간색이 가는 조각으로 따로 떨어져 확대 시 너덜너덜해진다)
//   2) VTracer(visioncortex)로 색 영역을 스플라인 곡선으로 따고, 큰 영역 위에 작은 영역을 쌓는다.
//
// wsTraceImage(imgd, p) → Promise<{ body, paths, width, height }>
//   imgd : { width, height, data(Uint8ClampedArray RGBA) }  (흰 배경에 합성된 상태)
//   p    : { mode:'illust'|'vector'|'mono', maxColors, mergeDistance(RGB), mergeDeltaE(Lab), removeBg, threshold, invert,
//            srcScale(변환용 이미지 가로 / 원본 가로) }
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

    // ── 배경 제거 ──
    // 테두리에서 가장 많은 색과 비슷한 픽셀을 테두리부터 이어서 투명하게 만든다.
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

    // ── 1) 단색화 ──────────────────────────────────────────────

    function makeRandom(seed) {
        var s = seed >>> 0;
        return function() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    }

    // sRGB → CIE Lab (D65)
    function toLab(c) {
        function lin(v) { v /= 255; return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92; }
        var r = lin(c[0]), g = lin(c[1]), b = lin(c[2]);
        var x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
        var z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
        function f(t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }
        var fx = f(x), fy = f(y), fz = f(z);
        return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
    }

    function dist2(a, c) {
        var dr = a[0] - c[0], dg = a[1] - c[1], db = a[2] - c[2];
        return dr * dr + dg * dg + db * db;
    }

    // 대표 색 추출: 색상 히스토그램(5비트 칸)에 면적의 제곱근만큼 가중치를 준 k-means++.
    // 픽셀 수 그대로 가중하면 넓은 배경이 비슷한 색으로 팔레트를 다 차지해 작은 글자색이 빠진다.
    // 끝으로 mergeDistance 보다 가까운 색끼리 합친다.
    function buildPalette(d, n, k, mergeDistance, mergeDeltaE) {
        var bins = new Map(), p, i;
        for (p = 0; p < n; p++) {
            i = p * 4;
            if (d[i + 3] < 128) continue;
            var key = (d[i] >> 3) << 10 | (d[i + 1] >> 3) << 5 | (d[i + 2] >> 3);
            var bin = bins.get(key);
            if (!bin) { bin = [0, 0, 0, 0]; bins.set(key, bin); }
            bin[0] += d[i]; bin[1] += d[i + 1]; bin[2] += d[i + 2]; bin[3]++;
        }
        var minCount = Math.max(2, Math.floor(n * 0.00005)), samples = [], weights = [];
        bins.forEach(function(b) {
            if (b[3] < minCount) return;
            samples.push([b[0] / b[3], b[1] / b[3], b[2] / b[3]]);
            weights.push(Math.sqrt(b[3]));
        });
        var m = samples.length, rnd = makeRandom(20260914), s;
        if (!m) return [[255, 255, 255]];
        k = Math.max(1, Math.min(k, m));

        var first = 0;
        for (s = 1; s < m; s++) if (weights[s] > weights[first]) first = s;
        var centers = [samples[first].slice()], best = new Float64Array(m);
        for (s = 0; s < m; s++) best[s] = dist2(samples[s], centers[0]);
        while (centers.length < k) {
            var sum = 0;
            for (s = 0; s < m; s++) sum += best[s] * weights[s];
            if (sum === 0) break;
            var target = rnd() * sum, idx = 0;
            for (s = 0; s < m; s++) { target -= best[s] * weights[s]; if (target <= 0) { idx = s; break; } }
            var c = samples[idx].slice();
            centers.push(c);
            for (s = 0; s < m; s++) { var dd = dist2(samples[s], c); if (dd < best[s]) best[s] = dd; }
        }

        var acc = [];
        for (var iter = 0; iter < 12; iter++) {
            acc = centers.map(function() { return [0, 0, 0, 0]; });
            for (s = 0; s < m; s++) {
                var bi = 0, bd = Infinity;
                for (var ci = 0; ci < centers.length; ci++) {
                    var dc = dist2(samples[s], centers[ci]);
                    if (dc < bd) { bd = dc; bi = ci; }
                }
                var wt = weights[s];
                acc[bi][0] += samples[s][0] * wt; acc[bi][1] += samples[s][1] * wt; acc[bi][2] += samples[s][2] * wt; acc[bi][3] += wt;
            }
            for (ci = 0; ci < centers.length; ci++) {
                if (acc[ci][3]) centers[ci] = [acc[ci][0] / acc[ci][3], acc[ci][1] / acc[ci][3], acc[ci][2] / acc[ci][3]];
            }
        }

        var items = [];
        for (i = 0; i < centers.length; i++) if (acc[i][3] > 0) items.push({ c: centers[i], w: acc[i][3] });
        // RGB 거리와 사람 눈 기준 색 차이(ΔE)가 모두 작을 때만 합친다.
        // RGB 만 보면 흐릿한 남색과 암갈색처럼 눈에는 확연히 다른 어두운 색이 가깝게 계산돼 합쳐진다.
        // 합칠 때는 평균을 내지 않고 면적이 큰 쪽 색을 유지해 노랑이 주황 쪽으로 물드는 일을 막는다.
        var limit = mergeDistance * mergeDistance, merged = true;
        items.forEach(function(it) { it.lab = toLab(it.c); });
        while (merged && items.length > 1) {
            merged = false;
            for (var a = 0; a < items.length && !merged; a++) {
                for (var b2 = a + 1; b2 < items.length && !merged; b2++) {
                    var A = items[a], B = items[b2];
                    if (dist2(A.c, B.c) >= limit || dist2(A.lab, B.lab) >= mergeDeltaE * mergeDeltaE) continue;
                    if (B.w > A.w) { A.c = B.c; A.lab = B.lab; }
                    A.w += B.w;
                    items.splice(b2, 1);
                    merged = true;
                }
            }
        }
        return items.map(function(it) { return it.c.map(Math.round); });
    }

    // 픽셀 색 → 가장 가까운 팔레트 색 번호.
    // 사람 눈 기준 색 공간(Lab)에서 비교하되 색기(a·b) 차이에 가중치를 더 준다.
    // RGB 로 비교하면 글자 획 사이의 연한 회색이 흰 바탕 대신 사진 부분의 살구색으로 칠해지는 일이 생긴다.
    // 같은 팔레트로 수백만 픽셀을 비교하므로 RGB 6비트 단위로 결과를 캐시한다.
    function nearestLab(lab, labs) {
        var bi = 0, bd = Infinity;
        for (var j = 0; j < labs.length; j++) {
            var dL = lab[0] - labs[j][0], da = lab[1] - labs[j][1], db = lab[2] - labs[j][2];
            var dd = dL * dL + 1.6 * (da * da + db * db);
            if (dd < bd) { bd = dd; bi = j; }
        }
        return bi;
    }

    function makeMatcher(pal) {
        var labs = pal.map(toLab), cache = new Int16Array(1 << 18).fill(-1);
        return function(r, g, b) {
            var key = (r >> 2) << 12 | (g >> 2) << 6 | (b >> 2), v = cache[key];
            if (v < 0) v = cache[key] = nearestLab(toLab([(r >> 2) * 4 + 2, (g >> 2) * 4 + 2, (b >> 2) * 4 + 2]), labs);
            return v;
        };
    }

    // 캐시 없이 한 픽셀만 비교 (주변 몇 색 중에서 고를 때)
    function nearestColor(r, g, b, pal) {
        return nearestLab(toLab([r, g, b]), pal.map(toLab));
    }

    function quantize(d, n, pal) {
        var index = new Uint8Array(n), match = makeMatcher(pal);
        for (var p = 0; p < n; p++) {
            var i = p * 4;
            index[p] = match(d[i], d[i + 1], d[i + 2]);
        }
        return index;
    }

    // c 가 a 와 b 를 잇는 선분의 중간쯤(15~85%)에 가까이 있는 색인가
    function liesBetween(c, a, b) {
        var abr = b[0] - a[0], abg = b[1] - a[1], abb = b[2] - a[2], len2 = abr * abr + abg * abg + abb * abb;
        if (len2 < 900) return false;
        var t = ((c[0] - a[0]) * abr + (c[1] - a[1]) * abg + (c[2] - a[2]) * abb) / len2;
        if (t < 0.15 || t > 0.85) return false;
        var dr = a[0] + abr * t - c[0], dg = a[1] + abg * t - c[1], db = a[2] + abb * t - c[2];
        return dr * dr + dg * dg + db * db < 32 * 32;
    }

    // 경계의 중간색 흡수.
    // - 5×5 창 전체가 같은 색인 "꽉 찬 면"이 거의 없는 색 = 경계에만 가는 띠로 있는 색
    //   (빨강→진빨강→암적색→검정처럼 여러 단계로 이어진 안티앨리어싱도 한 번에 걸러진다)
    // - 꽉 찬 면이 있어도 면적이 작고 더 큰 두 주요 색 사이 색이면 JPG 번짐으로 본다
    // 흡수된 픽셀은 원래 픽셀 색과 가장 가까운 주요 색으로 칠한다.
    function absorbThinColors(d, index, pal, w, h, r) {
        var k = pal.length, n = w * h, x, y, q, p;
        var tmin = new Uint8Array(n), tmax = new Uint8Array(n);
        for (y = 0; y < h; y++) {
            var base = y * w;
            for (x = 0; x < w; x++) {
                var lo = 255, hi = 0, x0 = x - r < 0 ? 0 : x - r, x1 = x + r >= w ? w - 1 : x + r;
                for (q = x0; q <= x1; q++) { var v = index[base + q]; if (v < lo) lo = v; if (v > hi) hi = v; }
                tmin[base + x] = lo; tmax[base + x] = hi;
            }
        }
        var solid = new Array(k).fill(0), counts = new Array(k).fill(0);
        for (x = 0; x < w; x++) {
            for (y = 0; y < h; y++) {
                var lo2 = 255, hi2 = 0, y0 = y - r < 0 ? 0 : y - r, y1 = y + r >= h ? h - 1 : y + r;
                for (q = y0; q <= y1; q++) {
                    var qi = q * w + x;
                    if (tmin[qi] < lo2) lo2 = tmin[qi];
                    if (tmax[qi] > hi2) hi2 = tmax[qi];
                }
                if (lo2 === hi2) solid[lo2]++;
            }
        }
        for (p = 0; p < n; p++) counts[index[p]]++;

        var minSolid = Math.max(16, Math.round(n * 0.0002)), major = [];
        for (var c = 0; c < k; c++) if (solid[c] >= minSolid) major.push(c);
        major.sort(function(a, b) { return counts[b] - counts[a]; });
        for (var mi = major.length - 1; mi >= 2; mi--) {
            var cc = major[mi];
            if (counts[cc] / n >= 0.015) continue;
            var between = false;
            for (var ai = 0; ai < mi && !between; ai++) {
                for (var bi = ai + 1; bi < mi && !between; bi++) between = liesBetween(pal[cc], pal[major[ai]], pal[major[bi]]);
            }
            if (between) major.splice(mi, 1);
        }
        if (!major.length || major.length === k) return { index: index, pal: pal };

        var remap = new Int16Array(k).fill(-1);
        var newPal = major.map(function(ci, i) { remap[ci] = i; return pal[ci]; });
        var out = new Uint8Array(n), matchNew = makeMatcher(newPal);
        for (p = 0; p < n; p++) {
            var cur = index[p];
            if (remap[cur] >= 0) { out[p] = remap[cur]; continue; }
            var i4 = p * 4;
            out[p] = matchNew(d[i4], d[i4 + 1], d[i4 + 2]);
        }
        return { index: out, pal: newPal };
    }

    // 5×5 창 전체가 같은 색인 픽셀 표시 (꽉 찬 면의 안쪽)
    function solidMask(index, w, h, r) {
        var n = w * h, tmin = new Uint8Array(n), tmax = new Uint8Array(n), mask = new Uint8Array(n), x, y, q;
        for (y = 0; y < h; y++) {
            var base = y * w;
            for (x = 0; x < w; x++) {
                var lo = 255, hi = 0, x0 = x - r < 0 ? 0 : x - r, x1 = x + r >= w ? w - 1 : x + r;
                for (q = x0; q <= x1; q++) { var v = index[base + q]; if (v < lo) lo = v; if (v > hi) hi = v; }
                tmin[base + x] = lo; tmax[base + x] = hi;
            }
        }
        for (x = 0; x < w; x++) {
            for (y = 0; y < h; y++) {
                var lo2 = 255, hi2 = 0, y0 = y - r < 0 ? 0 : y - r, y1 = y + r >= h ? h - 1 : y + r;
                for (q = y0; q <= y1; q++) {
                    var qi = q * w + x;
                    if (tmin[qi] < lo2) lo2 = tmin[qi];
                    if (tmax[qi] > hi2) hi2 = tmax[qi];
                }
                mask[y * w + x] = lo2 === hi2 ? 1 : 0;
            }
        }
        return mask;
    }

    // 경계 띠 정리 (주변 기준).
    // 사진 부분에 실제로 있는 회갈색 같은 색이 글자 가장자리의 중간 밝기 픽셀을 차지해 글자에 테두리가 생기는 것을 막는다.
    // 꽉 찬 면이 아닌 픽셀마다 주변(9×9)에 꽉 찬 면으로 있는 색들을 모아,
    // 자기 색이 그중에 없고, 그 색들 중 두 색 사이의 중간색이거나 어느 한 주변 색과 눈으로 봐도 비슷하면(ΔE < 45)
    // 원래 픽셀 색과 가장 가까운 주변 색으로 붙인다. (예: 갈색 외곽선 안쪽이 JPG 번짐으로 더 어두워져 생긴 검정 조각)
    // 주변과 뚜렷하게 다른 고유한 색의 가는 선(노랑 바탕 위 검정 선 등)은 그대로 남는다.
    function cleanEdgeBands(d, index, pal, w, h, R) {
        var k = pal.length, n = w * h, solid = solidMask(index, w, h, 2), out = new Uint8Array(index);
        var seen = new Uint8Array(k), cand = new Uint8Array(k);
        var labs = pal.map(toLab), near = new Uint8Array(k * k);
        for (var i = 0; i < k; i++) for (var j = 0; j < k; j++) near[i * k + j] = dist2(labs[i], labs[j]) < 45 * 45 ? 1 : 0;
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var p = y * w + x;
                if (solid[p]) continue;
                var own = index[p], nc = 0, hasOwn = false;
                for (var dy = -R; dy <= R; dy += 2) {
                    var yy = y + dy;
                    if (yy < 0 || yy >= h) continue;
                    for (var dx = -R; dx <= R; dx += 2) {
                        var xx = x + dx;
                        if (xx < 0 || xx >= w) continue;
                        var q = yy * w + xx;
                        if (!solid[q]) continue;
                        var c = index[q];
                        if (c === own) { hasOwn = true; break; }
                        if (!seen[c]) { seen[c] = 1; cand[nc++] = c; }
                    }
                    if (hasOwn) break;
                }
                var replace = false, a;
                if (!hasOwn && nc >= 1) {
                    for (a = 0; a < nc && !replace; a++) replace = near[own * k + cand[a]] === 1;
                    for (a = 0; a < nc && !replace; a++) {
                        for (var b = a + 1; b < nc && !replace; b++) replace = liesBetween(pal[own], pal[cand[a]], pal[cand[b]]);
                    }
                }
                if (replace) {
                    var i4 = p * 4, sub = [];
                    for (a = 0; a < nc; a++) sub.push(pal[cand[a]]);
                    out[p] = cand[nearestColor(d[i4], d[i4 + 1], d[i4 + 2], sub)];
                }
                for (a = 0; a < nc; a++) seen[cand[a]] = 0;
            }
        }
        return out;
    }

    // 다수결 필터: (2r+1)² 창에서 need 칸 이상 차지한 색으로 바꾼다 (동률·미달이면 그대로).
    // 점 잡티와 경계의 계단을 없애되, 창의 절반 이상 굵기인 가는 획은 보존한다.
    function modeFilter(index, w, h, k, r, need) {
        var out = new Uint8Array(index.length), counts = new Uint16Array(k), touched = new Uint8Array((2 * r + 1) * (2 * r + 1));
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var p = y * w + x, cur = index[p], nt = 0;
                for (var dy = -r; dy <= r; dy++) {
                    var yy = y + dy < 0 ? 0 : (y + dy >= h ? h - 1 : y + dy), row = yy * w;
                    for (var dx = -r; dx <= r; dx++) {
                        var xx = x + dx < 0 ? 0 : (x + dx >= w ? w - 1 : x + dx);
                        var c = index[row + xx];
                        if (counts[c]++ === 0) touched[nt++] = c;
                    }
                }
                var best = cur;
                for (var t = 0; t < nt; t++) if (counts[touched[t]] >= need && counts[touched[t]] > counts[best]) best = touched[t];
                for (t = 0; t < nt; t++) counts[touched[t]] = 0;
                out[p] = best;
            }
        }
        return out;
    }

    // 비슷한 색 묶음 다수결.
    // 가는 글자 획 안이 남색·짙은 회색·회갈색처럼 비슷한 어두운 색 여러 개로 얼룩덜룩하게 칠해진 경우,
    // 5×5 창에서 서로 비슷한 색(거리 similar 미만)끼리 개수를 합쳐 가장 큰 묶음을 고르고,
    // 그 묶음 안에서 가장 많은 색으로 통일한다. 서로 다른 색(글자와 바탕)의 경계는 기존대로 유지된다.
    function groupModeFilter(index, pal, w, h, similar, r) {
        var k = pal.length, limit = similar * similar, same = new Uint8Array(k * k), i, j;
        for (i = 0; i < k; i++) for (j = 0; j < k; j++) same[i * k + j] = dist2(pal[i], pal[j]) < limit ? 1 : 0;
        var out = new Uint8Array(index.length), counts = new Uint16Array(k), touched = new Uint8Array((2 * r + 1) * (2 * r + 1)), half = Math.ceil((2 * r + 1) * (2 * r + 1) / 2);
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var p = y * w + x, nt = 0;
                for (var dy = -r; dy <= r; dy++) {
                    var yy = y + dy < 0 ? 0 : (y + dy >= h ? h - 1 : y + dy), row = yy * w;
                    for (var dx = -r; dx <= r; dx++) {
                        var xx = x + dx < 0 ? 0 : (x + dx >= w ? w - 1 : x + dx);
                        var c = index[row + xx];
                        if (counts[c]++ === 0) touched[nt++] = c;
                    }
                }
                if (nt === 1) { out[p] = touched[0]; counts[touched[0]] = 0; continue; }
                var bestGroup = -1, bestColor = index[p];
                for (i = 0; i < nt; i++) {
                    var ci = touched[i], group = 0, top = ci;
                    for (j = 0; j < nt; j++) {
                        var cj = touched[j];
                        if (!same[ci * k + cj]) continue;
                        group += counts[cj];
                        if (counts[cj] > counts[top]) top = cj;
                    }
                    if (group > bestGroup) { bestGroup = group; bestColor = top; }
                }
                // 자기 색이 속한 묶음이 창의 절반 이상이면 그 묶음 안에서만 통일 (경계가 밀리지 않도록)
                var own = index[p], ownGroup = 0, ownTop = own;
                for (j = 0; j < nt; j++) {
                    var cj2 = touched[j];
                    if (!same[own * k + cj2]) continue;
                    ownGroup += counts[cj2];
                    if (counts[cj2] > counts[ownTop]) ownTop = cj2;
                }
                out[p] = ownGroup >= half ? ownTop : bestColor;
                for (i = 0; i < nt; i++) counts[touched[i]] = 0;
            }
        }
        return out;
    }

    // 경계선 다듬기: 색마다 "그 색인가"를 0/1 로 표시한 지도를 살짝 흐린 뒤, 픽셀마다 값이 가장 큰 색을 다시 고른다.
    // - 작은 원본을 확대해 생긴 계단 모양 경계가 매끈한 곡선으로 바뀐다 (계단 모서리를 벡터 엔진이 진짜 모서리로 따는 것을 막음)
    // - 흐림 폭보다 좁은 부스러기(경계에 낀 검정 조각, 가장자리 주황 얼룩)는 이웃 색에 밀려 사라진다
    // - 흐림 폭보다 굵은 획은 그대로 남는다
    // 색 수만큼 지도를 동시에 들고 있으면 메모리가 커서, 한 색씩 흐리며 최댓값만 갱신한다.
    function smoothLabels(index, w, h, k, r, passes) {
        var n = w * h, bestVal = new Float32Array(n), bestIdx = new Uint8Array(index);
        var mask = new Float32Array(n), tmp = new Float32Array(n), inv = 1 / (2 * r + 1);
        var present = new Uint8Array(k), p, x, y, q, sum;
        for (p = 0; p < n; p++) present[index[p]] = 1;

        for (var c = 0; c < k; c++) {
            if (!present[c]) continue;
            for (p = 0; p < n; p++) mask[p] = index[p] === c ? 1 : 0;
            for (var pass = 0; pass < passes; pass++) {
                for (y = 0; y < h; y++) {
                    var base = y * w, first = mask[base], last = mask[base + w - 1];
                    sum = first * (r + 1);
                    for (q = 1; q <= r; q++) sum += q < w ? mask[base + q] : last;
                    for (x = 0; x < w; x++) {
                        tmp[base + x] = sum * inv;
                        var add = x + r + 1, sub = x - r;
                        sum += (add < w ? mask[base + add] : last) - (sub > 0 ? mask[base + sub] : first);
                    }
                }
                for (x = 0; x < w; x++) {
                    var f = tmp[x], l = tmp[(h - 1) * w + x];
                    sum = f * (r + 1);
                    for (q = 1; q <= r; q++) sum += q < h ? tmp[q * w + x] : l;
                    for (y = 0; y < h; y++) {
                        mask[y * w + x] = sum * inv;
                        var add2 = y + r + 1, sub2 = y - r;
                        sum += (add2 < h ? tmp[add2 * w + x] : l) - (sub2 > 0 ? tmp[sub2 * w + x] : f);
                    }
                }
            }
            for (p = 0; p < n; p++) {
                if (mask[p] > bestVal[p]) { bestVal[p] = mask[p]; bestIdx[p] = c; }
            }
        }
        return bestIdx;
    }

    // 전환 띠 정리 (그라데이션 사다리 접기).
    // 흐릿한 그림자처럼 검정 → 적갈색 → 빨강으로 부드럽게 바뀌는 부분은 단계마다 다른 색 조각이 되어 얼룩져 보인다.
    // 한 색 덩어리가 양쪽에서 서로 다른 두 색 A·B 와 맞닿아 있고, 자기 색이 A 와 B 사이의 중간색이면
    // 덩어리 속 각 픽셀을 원래 색이 A·B 중 어느 쪽에 더 가까운지(선분 위 위치)에 따라 A 또는 B 로 나눈다.
    // 여러 단계로 된 사다리도 바깥쪽부터 차례로 접히도록 몇 번 반복한다.
    // 노랑과 빨강 사이의 검정 외곽선처럼 "사이 색"이 아닌 진짜 테두리는 대상이 아니다.
    function collapseTransitions(d, index, pal, w, h) {
        var k = pal.length, n = w * h, out = new Uint8Array(index);
        var seen = new Uint8Array(n), stack = new Int32Array(n), comp = new Int32Array(n), border = new Uint32Array(k);
        for (var pass = 0; pass < 6; pass++) {
            var changed = 0;
            seen.fill(0);
            for (var start = 0; start < n; start++) {
                if (seen[start]) continue;
                var color = out[start], top = 0, area = 0;
                seen[start] = 1;
                stack[top++] = start;
                border.fill(0);
                while (top) {
                    var p = stack[--top];
                    comp[area++] = p;
                    var x = p % w;
                    for (var t = 0; t < 4; t++) {
                        var q = t === 0 ? (x > 0 ? p - 1 : -1) : t === 1 ? (x < w - 1 ? p + 1 : -1) : t === 2 ? p - w : p + w;
                        if (q < 0 || q >= n) continue;
                        var c = out[q];
                        if (c !== color) { border[c]++; continue; }
                        if (!seen[q]) { seen[q] = 1; stack[top++] = q; }
                    }
                }
                if (area > n * 0.05) continue; // 넓은 면(배경 등)은 전환 띠가 아니다

                var total = 0, c1;
                for (c1 = 0; c1 < k; c1++) total += border[c1];
                if (!total) continue;
                // 테두리의 15% 이상 맞닿은 색 쌍 중, 자기 색이 그 사이에 있는 쌍 (맞닿은 비율 합이 가장 큰 쌍)
                var A = -1, B = -1, bestShare = 0;
                for (c1 = 0; c1 < k; c1++) {
                    if (border[c1] < total * 0.15) continue;
                    for (var c2 = c1 + 1; c2 < k; c2++) {
                        if (border[c2] < total * 0.15) continue;
                        if (!liesBetween(pal[color], pal[c1], pal[c2])) continue;
                        if (border[c1] + border[c2] > bestShare) { bestShare = border[c1] + border[c2]; A = c1; B = c2; }
                    }
                }
                if (A < 0) continue;

                var pa = pal[A], pb = pal[B];
                var abr = pb[0] - pa[0], abg = pb[1] - pa[1], abb = pb[2] - pa[2], len2 = abr * abr + abg * abg + abb * abb;
                for (var i = 0; i < area; i++) {
                    var pp = comp[i], i4 = pp * 4;
                    var tt = ((d[i4] - pa[0]) * abr + (d[i4 + 1] - pa[1]) * abg + (d[i4 + 2] - pa[2]) * abb) / len2;
                    out[pp] = tt < 0.5 ? A : B;
                }
                changed++;
            }
            if (!changed) break;
        }
        return out;
    }

    // 작은 섬 정리: 서로 다른 두 색 영역 사이에 끼인 작은 덩어리를, 둘 중 눈으로 봐도 비슷한 색(ΔE < 45)으로 칠한다.
    // 노란 숫자와 갈색 외곽선이 맞닿는 곳에 JPG 번짐으로 뭉친 검정 덩어리 같은 것을 없앤다.
    // 사진 위 작은 글자·빨간 바탕 위 흰 점처럼 한 가지 배경에 둘러싸인 요소는 남긴다.
    function absorbSmallIslands(index, pal, w, h) {
        var k = pal.length, n = w * h, maxArea = Math.max(64, Math.round(n * 0.0004));
        var labs = pal.map(toLab), seen = new Uint8Array(n), stack = new Int32Array(n), comp = new Int32Array(maxArea + 1);
        var border = new Uint32Array(k), out = index;
        for (var start = 0; start < n; start++) {
            if (seen[start]) continue;
            var color = index[start], top = 0, area = 0, tooBig = false;
            seen[start] = 1;
            stack[top++] = start;
            border.fill(0);
            while (top) {
                var p = stack[--top];
                if (area <= maxArea) comp[area] = p;
                area++;
                if (area > maxArea) tooBig = true;
                var x = p % w;
                var nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p >= w ? p - w : -1, p < n - w ? p + w : -1];
                for (var t = 0; t < 4; t++) {
                    var q = nb[t];
                    if (q < 0) continue;
                    if (index[q] !== color) { border[index[q]]++; continue; }
                    if (!seen[q]) { seen[q] = 1; stack[top++] = q; }
                }
            }
            if (tooBig) continue;
            // 테두리의 20% 이상을 차지하는 이웃 색이 둘 이상(서로 뚜렷이 다른 색)일 때만 대상
            var total = 0, majors = [], dom = -1, c;
            for (c = 0; c < k; c++) total += border[c];
            for (c = 0; c < k; c++) if (border[c] >= total * 0.2) majors.push(c);
            if (majors.length < 2) continue;
            var distinct = false;
            for (var mi = 0; mi < majors.length && !distinct; mi++) {
                for (var mj = mi + 1; mj < majors.length && !distinct; mj++) distinct = dist2(labs[majors[mi]], labs[majors[mj]]) >= 30 * 30;
            }
            if (!distinct) continue;
            for (mi = 0; mi < majors.length; mi++) {
                c = majors[mi];
                if (dist2(labs[color], labs[c]) >= 45 * 45) continue;
                if (dom < 0 || border[c] > border[dom]) dom = c;
            }
            if (dom < 0) continue;
            if (out === index) out = new Uint8Array(index);
            for (var i = 0; i < area; i++) out[comp[i]] = dom;
        }
        return out;
    }

    function cleanIndex(index, w, h, k, t) {
        index = modeFilter(index, w, h, k, 1, 5);
        if (t.big) index = modeFilter(index, w, h, k, 2, 13);
        index = modeFilter(index, w, h, k, 1, 5);
        return t.smoothR > 0 ? smoothLabels(index, w, h, k, t.smoothR, t.smoothPasses) : index;
    }

    // 정리 필터 강도: 변환용 이미지가 원본보다 몇 배 큰지(srcScale)에 맞춘다.
    // 원본 1픽셀짜리 잡티·계단은 확대 배율만큼 커지므로, 필터 창도 그만큼만 키워야
    // 작은 글자의 가는 획(원본 2~3픽셀)을 잡티로 오인해 깎아내거나 둥글게 뭉개지 않는다.
    function tuning(p) {
        var s = Math.max(1, p.srcScale || 2), big = s >= 3;
        var t = {
            big: big,
            thinR: big ? 2 : 1,
            bandR: big ? 4 : 2,
            groupR: big ? 2 : 1,
            smoothR: s >= 3.5 ? 2 : 1,
            smoothPasses: s >= 3.5 ? 2 : 1,
            speckle: Math.max(2, Math.round(s * 1.5)),
            corner: 45,
            length: 3.5,
            splice: 45
        };
        if (p.tune) for (var key in p.tune) t[key] = p.tune[key];
        return t;
    }

    function paint(d, index, pal) {
        for (var p = 0; p < index.length; p++) {
            var c = pal[index[p]], i = p * 4;
            d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
        }
    }

    function flattenColors(d, w, h, maxColors, mergeDistance, mergeDeltaE, t) {
        var n = w * h;
        var pal = buildPalette(d, n, maxColors, mergeDistance, mergeDeltaE);
        var q = absorbThinColors(d, quantize(d, n, pal), pal, w, h, t.thinR);
        var index = cleanEdgeBands(d, q.index, q.pal, w, h, t.bandR);
        index = collapseTransitions(d, index, q.pal, w, h);
        index = groupModeFilter(index, q.pal, w, h, 64, t.groupR);
        index = cleanIndex(index, w, h, q.pal.length, t);
        paint(d, absorbSmallIslands(index, q.pal, w, h), q.pal);
    }

    // 흑백: 명암 기준으로 이진화한 뒤 같은 다수결 필터로 윤곽의 잡티·계단을 정리
    function flattenMono(d, w, h, threshold, invert, t) {
        var n = w * h, index = new Uint8Array(n);
        for (var p = 0; p < n; p++) {
            var i = p * 4, dark = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114 < threshold;
            index[p] = (invert ? !dark : dark) ? 0 : 1;
            d[i + 3] = 255;
        }
        paint(d, cleanIndex(index, w, h, 2, t), [[0, 0, 0], [255, 255, 255]]);
    }

    // ── 2) VTracer ────────────────────────────────────────────

    function traceOptions(p, t) {
        return {
            clustering: p.mode === 'mono' ? 'bw' : 'color-cluster',
            hierarchical: 'stacked',
            mode: 'spline',
            filterSpeckle: t.speckle, // 이보다 작은 조각(경계에 남은 점)은 버린다
            colorPrecision: 8,
            layerDifference: 16,
            cornerThreshold: t.corner,   // 이 각도보다 꺾이면 모서리로 살린다 (글자 끝이 둥글게 뭉개지지 않도록 기본 60보다 낮춤)
            lengthThreshold: t.length,
            spliceThreshold: t.splice,
            maxIterations: 10,
            pathPrecision: 2
        };
    }

    function wsTraceImage(imgd, p) {
        return ensureVTracer().then(function() {
            var w = imgd.width, h = imgd.height, t = tuning(p);
            var d = new Uint8Array(imgd.data.buffer.slice(0));

            if (p.mode === 'mono') {
                flattenMono(d, w, h, p.threshold, p.invert, t);
            } else {
                if (p.removeBg) removeBackground(d, w, h);
                flattenColors(d, w, h, p.maxColors, p.mergeDistance, p.mergeDeltaE, t);
            }

            var raw = root.vtracerWasm.vectorize_rgba(d, w, h, traceOptions(p, t));
            var open = raw.indexOf('<svg'), start = raw.indexOf('>', open) + 1, end = raw.lastIndexOf('</svg>');
            var body = raw.slice(start, end).trim();

            if (p.mode === 'mono') {
                body = body.replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#000000"');
                if (!p.removeBg) body = '<rect width="' + w + '" height="' + h + '" fill="#FFFFFF"/>' + body;
            } else {
                // 이웃한 색 도형 경계가 딱 맞물리지 않아 확대 시 머리카락 같은 틈이 비치지 않도록 같은 색 테두리를 얇게 두른다
                body = body.replace(/<path d="([^"]*)" fill="(#[0-9A-Fa-f]{6})"\/>/g,
                    '<path d="$1" fill="$2" stroke="$2" stroke-width="1" stroke-linejoin="round"/>');
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
