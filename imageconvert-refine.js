// ── 벡터 경로 다듬기 (직선·모서리 복원) ──────────────────────────
// VTracer 가 만든 스플라인 경로는 확대한 JPG 의 흐릿한 경계를 그대로 따라가서
// 곧은 획의 옆면이 물결치고, 고딕 글자의 직각 모서리가 둥글게 깎인다.
// 여기서는 경로를 점 목록으로 편 뒤
//   1) 잔 흔들림을 걷어내고(Douglas-Peucker)          → 곧은 획은 곧게
//   2) 곧은 두 변 사이의 짧게 둥근 구간을 두 변의 교점으로 바꾸고 → 직각 모서리 복원
//   3) 가로·세로에 거의 맞는 변은 정확히 가로·세로로 맞추고    → 고딕 글자·숫자의 획이 반듯하게
//   4) 남은 완만한 구간은 부드러운 곡선으로 다시 이어 붙인다  → 붓글씨·원형 글자는 매끈하게
// 모든 문턱값은 원본 대비 확대 배율(scale)에 비례하므로, 원본 한두 픽셀 크기의 흔들림만 다듬고
// 붓글씨의 둥근 끝·뾰족한 끝처럼 진짜 모양은 그대로 둔다.
//
// wsRefinePath(d, scale) → 다듬은 path d 문자열 (같은 좌표계)
// 워커와 메인 스레드 양쪽에서 쓰므로 DOM 에 의존하지 않는다.

(function(root) {
    'use strict';

    var NUM = /[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi;

    // ── path d → 닫힌 점 목록들 ──
    function flatten(d) {
        var subs = [], cur = null, x = 0, y = 0, sx = 0, sy = 0;
        var re = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g, m;
        function close() {
            if (cur && cur.length) {
                var f = cur[0], l = cur[cur.length - 1];
                if (cur.length > 1 && Math.abs(f[0] - l[0]) < 1e-6 && Math.abs(f[1] - l[1]) < 1e-6) cur.pop();
                if (cur.length >= 3) subs.push(cur);
            }
            cur = null;
        }
        function cubic(x1, y1, x2, y2, x3, y3) {
            var approx = Math.hypot(x1 - x, y1 - y) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2);
            var n = Math.max(2, Math.ceil(approx)); // 약 1px 간격으로 표본
            for (var i = 1; i <= n; i++) {
                var t = i / n, u = 1 - t;
                cur.push([u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
                          u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]);
            }
            x = x3; y = y3;
        }
        while ((m = re.exec(d))) {
            var c = m[1], a = (m[2].match(NUM) || []).map(parseFloat), i;
            switch (c) {
                case 'M': case 'm':
                    close();
                    x = c === 'm' ? x + a[0] : a[0]; y = c === 'm' ? y + a[1] : a[1];
                    sx = x; sy = y; cur = [[x, y]];
                    for (i = 2; i + 1 < a.length; i += 2) { x = c === 'm' ? x + a[i] : a[i]; y = c === 'm' ? y + a[i + 1] : a[i + 1]; cur.push([x, y]); }
                    break;
                case 'L': case 'l':
                    if (!cur) cur = [[x, y]];
                    for (i = 0; i + 1 < a.length; i += 2) { x = c === 'l' ? x + a[i] : a[i]; y = c === 'l' ? y + a[i + 1] : a[i + 1]; cur.push([x, y]); }
                    break;
                case 'H': case 'h':
                    if (!cur) cur = [[x, y]];
                    for (i = 0; i < a.length; i++) { x = c === 'h' ? x + a[i] : a[i]; cur.push([x, y]); }
                    break;
                case 'V': case 'v':
                    if (!cur) cur = [[x, y]];
                    for (i = 0; i < a.length; i++) { y = c === 'v' ? y + a[i] : a[i]; cur.push([x, y]); }
                    break;
                case 'C': case 'c':
                    if (!cur) cur = [[x, y]];
                    for (i = 0; i + 5 < a.length; i += 6) {
                        if (c === 'c') cubic(x + a[i], y + a[i + 1], x + a[i + 2], y + a[i + 3], x + a[i + 4], y + a[i + 5]);
                        else cubic(a[i], a[i + 1], a[i + 2], a[i + 3], a[i + 4], a[i + 5]);
                    }
                    break;
                case 'Z': case 'z':
                    close(); x = sx; y = sy;
                    break;
                default:
                    return null; // 다른 명령(호 등)은 다루지 않음 → 원본 유지
            }
        }
        close();
        return subs;
    }

    // ── 1) Douglas-Peucker (닫힌 경로) ──
    function simplify(pts, eps) {
        var n = pts.length;
        if (n < 4) return pts;
        // 서로 가장 먼 두 점을 고정점으로 잡고 양쪽 반을 각각 단순화
        var a = 0, b = 0, best = -1, i;
        for (i = 1; i < n; i++) {
            var dd = sq(pts[i][0] - pts[0][0]) + sq(pts[i][1] - pts[0][1]);
            if (dd > best) { best = dd; b = i; }
        }
        var keep = new Uint8Array(n);
        keep[a] = keep[b] = 1;
        dp(pts, a, b, eps, keep);
        dp(pts, b, n, eps, keep); // b → n(=0)
        var out = [];
        for (i = 0; i < n; i++) if (keep[i]) out.push(pts[i]);
        return out;
    }

    function dp(pts, i0, i1, eps, keep) {
        var n = pts.length, p0 = pts[i0], p1 = pts[i1 % n];
        if (i1 - i0 < 2) return;
        var dx = p1[0] - p0[0], dy = p1[1] - p0[1], len = Math.hypot(dx, dy), maxd = -1, mi = -1;
        for (var i = i0 + 1; i < i1; i++) {
            var p = pts[i % n], d;
            if (len < 1e-9) d = Math.hypot(p[0] - p0[0], p[1] - p0[1]);
            else d = Math.abs((p[0] - p0[0]) * dy - (p[1] - p0[1]) * dx) / len;
            if (d > maxd) { maxd = d; mi = i; }
        }
        if (maxd > eps) {
            keep[mi % n] = 1;
            dp(pts, i0, mi, eps, keep);
            dp(pts, mi, i1, eps, keep);
        }
    }

    function sq(v) { return v * v; }

    // ── 2) 모서리 복원 ──
    // 긴 변(곧은 획의 옆면) 두 개 사이에 낀 짧은 변들의 묶음이 45~135° 꺾이면서 길이가 짧으면(모서리가 깎여 둥글어진 흔적)
    // 두 긴 변을 연장한 교점 하나로 바꾼다. 붓글씨 끝처럼 180° 가까이 돌아 나오는 둥근 끝은 대상이 아니다.
    function sharpenCorners(pts, longLen, maxRun) {
        var n = pts.length, i, len = new Float64Array(n), longs = [];
        for (i = 0; i < n; i++) {
            var q = pts[(i + 1) % n];
            len[i] = Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]);
            if (len[i] >= longLen) longs.push(i);
        }
        var m = longs.length;
        if (m < 2) return { pts: pts, corner: new Uint8Array(n) };

        var out = [], corner = [];
        for (var k = 0; k < m; k++) {
            var ia = longs[k], ib = longs[(k + 1) % m];
            // ia 변의 끝점(ia+1)부터 ib 변의 시작점(ib)까지의 점들
            var chain = [], run = 0, j = (ia + 1) % n;
            while (true) {
                chain.push(pts[j]);
                if (j === ib) break;
                run += len[j];
                j = (j + 1) % n;
            }
            var replaced = false;
            if (chain.length > 1 && run <= maxRun) {
                var A0 = pts[ia], A1 = pts[(ia + 1) % n], B0 = pts[ib], B1 = pts[(ib + 1) % n];
                var ax = A1[0] - A0[0], ay = A1[1] - A0[1], bx = B1[0] - B0[0], by = B1[1] - B0[1];
                var cosT = (ax * bx + ay * by) / (len[ia] * len[ib]);
                var theta = Math.acos(Math.max(-1, Math.min(1, cosT))) * 180 / Math.PI;
                var den = ax * by - ay * bx;
                if (theta >= 45 && theta <= 135 && Math.abs(den) > 1e-9) {
                    var ta = ((B0[0] - A0[0]) * by - (B0[1] - A0[1]) * bx) / den;   // A 선 위 위치 (0=A0, 1=A1)
                    var tb = ((B0[0] - A0[0]) * ay - (B0[1] - A0[1]) * ax) / den;   // B 선 위 위치 (0=B0, 1=B1)
                    var X = [A0[0] + ax * ta, A0[1] + ay * ta];
                    var dA = Math.hypot(X[0] - A1[0], X[1] - A1[1]), dB = Math.hypot(X[0] - B0[0], X[1] - B0[1]);
                    if (ta >= 0.6 && tb <= 0.4 && dA <= maxRun && dB <= maxRun) {
                        out.push(X); corner.push(1);
                        replaced = true;
                    }
                }
            }
            if (!replaced) for (j = 0; j < chain.length; j++) { out.push(chain[j]); corner.push(0); }
        }
        return { pts: out, corner: Uint8Array.from(corner) };
    }

    // ── 3) 가로·세로 맞춤 ──
    // 긴 변이 기준 방향(skew: 이미지 전체 긴 변들의 주된 기울기)의 가로·세로에서 tolDeg 안쪽으로 기울어 있으면
    // 정확히 그 가로·세로로 놓는다. 한 점에 여러 변이 걸리면 각 변이 원하는 좌표의 평균을 쓴다.
    // 기준 방향을 이미지에서 재는 이유: 살짝 기울여 찍은 사진은 모든 획이 같이 기울어 있으므로,
    // 화면 가로·세로에 억지로 맞추면 긴 변만 돌아가 들쭉날쭉해진다. 반듯한 원본이면 기준 방향이 0° 로 잡힌다.
    function snapAxes(pts, longLen, tolDeg, skew) {
        var n = pts.length, tol = Math.tan(tolDeg * Math.PI / 180);
        var cs = Math.cos(skew || 0), sn = Math.sin(skew || 0);
        var us = new Float64Array(n), vs = new Float64Array(n), U = new Float64Array(n), V = new Float64Array(n);
        var uc = new Uint8Array(n), vc = new Uint8Array(n), i;
        for (i = 0; i < n; i++) { U[i] = pts[i][0] * cs + pts[i][1] * sn; V[i] = -pts[i][0] * sn + pts[i][1] * cs; }
        for (i = 0; i < n; i++) {
            var j = (i + 1) % n, du = Math.abs(U[j] - U[i]), dv = Math.abs(V[j] - V[i]);
            if (Math.hypot(du, dv) < longLen) continue;
            if (dv <= du * tol) { var mv = (V[i] + V[j]) / 2; vs[i] += mv; vc[i]++; vs[j] += mv; vc[j]++; }
            else if (du <= dv * tol) { var mu = (U[i] + U[j]) / 2; us[i] += mu; uc[i]++; us[j] += mu; uc[j]++; }
        }
        var out = new Array(n);
        for (i = 0; i < n; i++) {
            var u = uc[i] ? us[i] / uc[i] : U[i], v = vc[i] ? vs[i] / vc[i] : V[i];
            out[i] = [u * cs - v * sn, u * sn + v * cs];
        }
        return out;
    }

    // 이미지 전체 긴 변들의 주된 기울기 (라디안, -45°~45°). 90° 주기이므로 각도를 4배 해 원형 평균을 낸다.
    function dominantSkew(polys, longLen) {
        var cx = 0, sy = 0;
        for (var k = 0; k < polys.length; k++) {
            var pts = polys[k], n = pts.length;
            for (var i = 0; i < n; i++) {
                var q = pts[(i + 1) % n], dx = q[0] - pts[i][0], dy = q[1] - pts[i][1], l = Math.hypot(dx, dy);
                if (l < longLen * 2) continue;
                var a = 4 * Math.atan2(dy, dx);
                cx += Math.cos(a) * l; sy += Math.sin(a) * l;
            }
        }
        return (cx === 0 && sy === 0) ? 0 : Math.atan2(sy, cx) / 4;
    }

    // ── 4) 곡선으로 잇기 ──
    // 모서리(복원한 교점, 80° 이상 꺾인 점, 긴 두 변이 30° 이상 꺾여 만나면서 양옆은 곧은 점)는 뾰족하게,
    // 나머지는 양옆 점 방향의 접선으로 부드럽게 잇는다. 짧은 변끼리 만나는 완만한 꺾임은 원의 일부이므로 곡선으로 둔다.
    function emit(pts, corner, longLen) {
        var n = pts.length, i, dir = [], len = [];
        for (i = 0; i < n; i++) {
            var p = pts[i], q = pts[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1e-9;
            len.push(l); dir.push([dx / l, dy / l]);
        }
        var isCorner = new Uint8Array(n), tan = [], turn = new Float64Array(n);
        for (i = 0; i < n; i++) {
            var din = dir[(i + n - 1) % n], dout = dir[i];
            turn[i] = Math.acos(Math.max(-1, Math.min(1, din[0] * dout[0] + din[1] * dout[1]))) * 180 / Math.PI;
        }
        for (i = 0; i < n; i++) {
            var bothLong = len[(i + n - 1) % n] >= longLen && len[i] >= longLen;
            // 양옆 점도 비슷하게 꺾이면 원을 여러 변으로 근사한 것이므로 모서리가 아니다 (작은 'ㅇ' 이 다각형이 되지 않도록)
            var lone = turn[i] >= 2.5 * Math.max(turn[(i + n - 1) % n], turn[(i + 1) % n]);
            if (corner[i] || turn[i] >= 80 || (bothLong && turn[i] >= 30 && lone)) { isCorner[i] = 1; tan.push(null); continue; }
            var tx = pts[(i + 1) % n][0] - pts[(i + n - 1) % n][0], ty = pts[(i + 1) % n][1] - pts[(i + n - 1) % n][1];
            var tl = Math.hypot(tx, ty) || 1e-9;
            tan.push([tx / tl, ty / tl]);
        }
        var s = 'M' + fmt(pts[0][0]) + ' ' + fmt(pts[0][1]);
        for (i = 0; i < n; i++) {
            var j = (i + 1) % n, p0 = pts[i], p1 = pts[j];
            if (isCorner[i] && isCorner[j]) { s += 'L' + fmt(p1[0]) + ' ' + fmt(p1[1]); continue; }
            var k = len[i] / 3, t0 = tan[i] || dir[i], t1 = tan[j] || dir[i];
            s += 'C' + fmt(p0[0] + t0[0] * k) + ' ' + fmt(p0[1] + t0[1] * k) + ' ' +
                 fmt(p1[0] - t1[0] * k) + ' ' + fmt(p1[1] - t1[1] * k) + ' ' + fmt(p1[0]) + ' ' + fmt(p1[1]);
        }
        return s + 'Z';
    }

    function fmt(v) {
        var r = Math.round(v * 100) / 100;
        return String(r);
    }

    function params(scale, o) {
        var s = Math.max(1, scale || 1);
        o = o || {};
        return { eps: (o.eps || 0.45) * s, longLen: (o.longLen || 3.5) * s, maxRun: (o.maxRun || 4) * s, tol: o.tol || 4 };
    }

    // 단순화한 점 목록들 → path d
    function build(polys, P, skew) {
        var out = '';
        for (var i = 0; i < polys.length; i++) {
            var sc = sharpenCorners(polys[i], P.longLen, P.maxRun);
            var pts = snapAxes(sc.pts, P.longLen, P.tol, skew);
            if (pts.length < 3) continue;
            out += emit(pts, sc.corner, P.longLen);
        }
        return out;
    }

    function simplifyAll(d, eps) {
        var subs = flatten(d);
        if (!subs) return null;
        var polys = [];
        for (var i = 0; i < subs.length; i++) {
            var pts = simplify(subs[i], eps);
            if (pts.length >= 3) polys.push(pts);
        }
        return polys;
    }

    // 경로 하나 다듬기 (기준 방향은 그 경로 안에서 잰다)
    function wsRefinePath(d, scale, o) {
        var P = params(scale, o), polys = simplifyAll(d, P.eps);
        if (!polys) return d;
        return build(polys, P, dominantSkew(polys, P.longLen));
    }

    // SVG 본문의 모든 <path d> 다듬기. 기준 방향은 이미지 전체 경로에서 한 번 재서 모두 같은 방향에 맞춘다.
    function wsRefineSvg(body, scale, o) {
        var P = params(scale, o), items = [], all = [];
        body.replace(/<path d="([^"]*)"/g, function(m, d) {
            var polys = simplifyAll(d, P.eps);
            items.push(polys);
            if (polys) all = all.concat(polys);
            return m;
        });
        var skew = dominantSkew(all, P.longLen), k = 0;
        body = body.replace(/<path d="([^"]*)"/g, function(m, d) {
            var polys = items[k++];
            if (!polys) return m;
            return '<path d="' + build(polys, P, skew) + '"';
        });
        return body.replace(/<path d=""[^>]*\/>/g, '');
    }

    root.wsRefinePath = wsRefinePath;
    root.wsRefineSvg = wsRefineSvg;
})(typeof self !== 'undefined' ? self : this);
