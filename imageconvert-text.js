// ── 글자 폰트 교체 ─────────────────────────────────────────────
// 변환 결과에서 글자를 클릭하면 같은 줄의 글자를 찾아 글자색·외곽선·배경색·기울기를 뽑고,
// 글자 모양과 가장 비슷한 폰트 후보를 미리보기로 보여준다. 사용자가 고른 폰트로 글자를 다시 써서
// 원래 글자 자리를 배경색으로 덮고 그 위에 완전한 벡터 글자를 올린다.
//
// 저화질 원본의 뭉개진 글자를 벡터로 따는 대신 폰트로 새로 쓰므로 확대해도 완벽하게 선명하다.
// 페이지(imageconvert.js)에서 window.wsTextReplace 의 함수들을 불러 쓴다.

(function(root) {
    'use strict';

    // 무료 상업용(OFL) 한글 폰트. Google Fonts 에서 필요한 글자만 불러온다.
    var FONTS = [
        { name: "본고딕 Regular", family: "Noto Sans KR", weight: 400 },
        { name: "본고딕 Bold", family: "Noto Sans KR", weight: 700 },
        { name: "나눔고딕 Regular", family: "Nanum Gothic", weight: 400 },
        { name: "나눔명조 Regular", family: "Nanum Myeongjo", weight: 400 },
        { name: '검은고딕',        family: 'Black Han Sans',          weight: 400 },
        { name: '도현',            family: 'Do Hyeon',                weight: 400 },
        { name: '주아',            family: 'Jua',                     weight: 400 },
        { name: '본고딕 Black',    family: 'Noto Sans KR',            weight: 900 },
        { name: '고딕 A1 Black',   family: 'Gothic A1',               weight: 900 },
        { name: '나눔고딕 ExtraBold', family: 'Nanum Gothic',         weight: 800 },
        { name: '베이글',          family: 'Bagel Fat One',           weight: 400 },
        { name: '해바라기',        family: 'Sunflower',               weight: 700 },
        { name: '구기',            family: 'Gugi',                    weight: 400 },
        { name: '연성',            family: 'Yeon Sung',               weight: 400 },
        { name: '스타일리시',      family: 'Stylish',                 weight: 400 },
        { name: '송명',            family: 'Song Myung',              weight: 400 },
        { name: '나눔명조 ExtraBold', family: 'Nanum Myeongjo',       weight: 800 },
        { name: '독도',            family: 'Dokdo',                   weight: 400 },
        { name: '동해독도',        family: 'East Sea Dokdo',          weight: 400 },
        { name: '나눔손글씨 붓',   family: 'Nanum Brush Script',      weight: 400 },
        { name: '나눔손글씨 펜',   family: 'Nanum Pen Script',        weight: 400 },
        { name: '개구 Bold',       family: 'Gaegu',                   weight: 700 },
        { name: '하이멜로디',      family: 'Hi Melody',               weight: 400 },
        { name: '기랑해랑',        family: 'Kirang Haerang',          weight: 400 },
        { name: '흑백사진',        family: 'Black And White Picture', weight: 400 },
        { name: '감자꽃',          family: 'Gamja Flower',            weight: 400 },
        { name: '싱글데이',        family: 'Single Day',              weight: 400 },
        { name: '가난한 이야기',   family: 'Poor Story',              weight: 400 },
        { name: '오르빗',          family: 'Orbit',                   weight: 400 }
    ];
    var TOP_COUNT = 6;
    var TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';

    // 폰트 CSS 가 다 읽힌 뒤에 글자를 불러와야 한다 (먼저 부르면 대체 글꼴로 그려져 모든 후보가 똑같아진다)
    var fontsLinked = null;
    function linkFonts() {
        if (fontsLinked) return fontsLinked;
        var groups = {};
        FONTS.forEach(function(f) { (groups[f.family] || (groups[f.family] = [])).push(f.weight); });
        var families = Object.keys(groups).map(function(family) {
            return 'family=' + family.replace(/ /g,'+') + ':wght@' + groups[family].sort(function(a,b){return a-b;}).join(';');
        });
        fontsLinked = new Promise(function(resolve,reject) {
            var link = document.createElement('link'), timer;
            function fail() { clearTimeout(timer); link.remove(); reject(new Error('폰트를 불러오지 못했습니다. 인터넷 연결을 확인하고 다시 시도하세요.')); }
            link.rel='stylesheet'; link.href='https://fonts.googleapis.com/css2?'+families.join('&')+'&display=block';
            link.onload=function(){clearTimeout(timer);resolve();}; link.onerror=fail;
            timer=setTimeout(fail,15000);document.head.appendChild(link);
        }).catch(function(error) { fontsLinked=null; throw error; });
        return fontsLinked;
    }
    function fontString(f,px) { return f.weight + ' ' + px + 'px "' + f.family + '"'; }
    function loadFonts(text) {
        return linkFonts().then(function() {
            return Promise.all(FONTS.map(function(f) {
                return new Promise(function(resolve) {
                    var timer=setTimeout(function(){resolve(null);},12000);
                    document.fonts.load(fontString(f,64),text||'가').then(function(faces) {
                        clearTimeout(timer);resolve(faces.length ? f : null);
                    },function(){clearTimeout(timer);resolve(null);});
                });
            }));
        }).then(function(fonts) {
            var available=fonts.filter(Boolean);
            if (!available.length) throw new Error('사용 가능한 폰트를 불러오지 못했습니다. 다시 시도하세요.');
            return available;
        });
    }

    // Manual selection works on pixels even when vector segmentation/OCR finds no letters.
    function selectRegion(image, box) {
        var x0=Math.max(0,Math.floor(box.x)), y0=Math.max(0,Math.floor(box.y));
        var w=Math.min(image.width-x0,Math.ceil(box.w)), h=Math.min(image.height-y0,Math.ceil(box.h));
        if (!(w>=3 && h>=3)) return {error:'글자 한 줄을 조금 더 크게 선택하세요.'};
        var pixels=image.data, colors={};
        function rgb(x,y) {
            var i=((y+y0)*image.width+x+x0)*4,a=pixels[i+3]/255;
            return [0,1,2].map(function(c){return Math.round(pixels[i+c]*a+255*(1-a));});
        }
        for(var y=0;y<h;y++)for(var x=0;x<w;x++)if(x===0||y===0||x===w-1||y===h-1){
            var color=rgb(x,y),key=color.map(function(v){return v>>4;}).join(',');
            var item=colors[key]||(colors[key]={n:0,sum:[0,0,0]});item.n++;
            color.forEach(function(v,c){item.sum[c]+=v;});
        }
        var dominant=Object.values(colors).sort(function(a,b){return b.n-a.n;})[0];
        var bg=dominant.sum.map(function(v){return v/dominant.n;});
        var distances=new Float32Array(w*h),hist=new Uint32Array(256);
        for(var y=0;y<h;y++)for(var x=0;x<w;x++){
            var color=rgb(x,y),dist=Math.sqrt(color.reduce(function(sum,v,c){return sum+(v-bg[c])*(v-bg[c]);},0)/3);
            distances[y*w+x]=dist;hist[Math.round(dist)]++;
        }
        var sum=0;for(var i=0;i<256;i++)sum+=i*hist[i];
        var count=0,partial=0,best=-1,threshold=12;
        for(var i=0;i<255;i++){
            count+=hist[i];partial+=i*hist[i];if(!count||count===w*h)continue;
            var diff=partial/count-(sum-partial)/(w*h-count),score=count*(w*h-count)*diff*diff;
            if(score>best){best=score;threshold=i;}
        }
        threshold=Math.max(8,threshold);
        var fill=new Uint8Array(w*h),minX=w,minY=h,maxX=-1,maxY=-1,total=0,ink=[0,0,0];
        for(var y=0;y<h;y++)for(var x=0;x<w;x++)if(distances[y*w+x]>threshold){
            fill[y*w+x]=1;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
            var color=rgb(x,y);color.forEach(function(v,c){ink[c]+=v;});total++;
        }
        if(!total) return {error:'선택 영역에서 글자 경계를 찾지 못했습니다. 글자와 배경이 함께 들어오도록 선택하세요.'};
        return {crop:{x:x0,y:y0,w:w,h:h},fill:fill,outlineMask:null,
            center:{x:(minX+maxX+1)/2,y:(minY+maxY+1)/2},size:{w:maxX-minX+1,h:maxY-minY+1},angle:0,
            colors:{fill:hex(ink.map(function(v){return v/total;})),bg:hex(bg),outline:null},thickness:Math.max(1,h*0.025)};
    }

    function hex(c) {
        return '#' + c.map(function(v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join('');
    }

    function parseHex(h) {
        return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)];
    }

    function luminance(c) { return c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114; }

    // ── 글자 줄 찾기 ───────────────────────────────────────────
    // 클릭한 픽셀과 같은 색으로 이어진 조각(글자 한 덩어리)에서 시작해,
    // 같은 색이면서 세로로 겹치고 옆으로 가까운 조각을 반복해서 붙여 한 줄로 만든다.
    function findLine(res, px, py) {
        var w = res.width, h = res.height, idx = res.index, n = w * h;
        var start = py * w + px, color = idx[start];

        var counts = res.colorCounts;
        if (!counts) {
            counts = res.colorCounts = new Uint32Array(res.palette.length);
            for (var i = 0; i < n; i++) counts[idx[i]]++;
        }

        var owner = new Int32Array(n).fill(-1), stack = new Int32Array(n), comps = [];

        function flood(s, limit) {
            var id = comps.length, top = 0, area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0, border = {};
            owner[s] = id;
            stack[top++] = s;
            var pixels = [];
            while (top) {
                var p = stack[--top], x = p % w, y = (p / w) | 0;
                area++;
                pixels.push(p);
                if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
                if (area > limit) break;
                var nb4 = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1];
                for (var t = 0; t < 4; t++) {
                    var q = nb4[t];
                    if (q < 0) continue;
                    if (idx[q] !== color) { border[idx[q]] = (border[idx[q]] || 0) + 1; continue; }
                    if (owner[q] < 0) { owner[q] = id; stack[top++] = q; }
                }
            }
            // 테두리 순도: 맞닿은 색 중 가장 많은 한 색의 비율 (외곽선에 둘러싸인 글자 속은 높고, 외곽선 자체는 안·밖 두 색에 닿아 낮다)
            var btot = 0, bmax = 0, main = -1;
            for (var key in border) { btot += border[key]; if (border[key] > bmax) { bmax = border[key]; main = +key; } }
            var c = { id: id, x0: x0, y0: y0, x1: x1, y1: y1, area: area, pixels: pixels, overflow: area > limit,
                      purity: btot ? bmax / btot : 0, main: main };
            comps.push(c);
            return c;
        }

        // 클릭한 곳이 글자 속 빈 공간(ㅇ 안쪽, 3 의 홈)이나 가는 외곽선일 수 있으므로,
        // 클릭 주변의 색들 중 "글자처럼 생긴" 조각(적당한 높이·채움 비율)을 가진 색을 고른다. 클릭한 색이 우선.
        function glyphLike(c) {
            var ch = c.y1 - c.y0 + 1, cw = c.x1 - c.x0 + 1;
            return !c.overflow && ch >= h * 0.03 && ch <= h * 0.5 && cw <= w * 0.35 && c.area >= cw * ch * 0.12;
        }
        var R = Math.max(3, Math.round(h * 0.025)), tried = {}, order = [color];
        for (var rad = 1; rad <= R && order.length < 5; rad++) {
            for (var ang = 0; ang < 16; ang++) {
                var tx = Math.round(px + Math.cos(ang * Math.PI / 8) * rad), ty = Math.round(py + Math.sin(ang * Math.PI / 8) * rad);
                if (tx < 0 || ty < 0 || tx >= w || ty >= h) continue;
                var tc = idx[ty * w + tx];
                if (order.indexOf(tc) < 0) order.push(tc);
            }
        }
        var seed = null, seedColor = -1;
        for (var oi = 0; oi < order.length; oi++) {
            var oc = order[oi];
            if (tried[oc]) continue;
            tried[oc] = true;
            // 클릭 지점에서 가장 가까운 그 색 픽셀에서 시작
            var sp = -1;
            for (var rr = 0; rr <= R && sp < 0; rr++) {
                for (var a2 = 0; a2 < Math.max(1, rr * 8) && sp < 0; a2++) {
                    var sx2 = Math.round(px + Math.cos(a2 * 2 * Math.PI / Math.max(1, rr * 8)) * rr);
                    var sy2 = Math.round(py + Math.sin(a2 * 2 * Math.PI / Math.max(1, rr * 8)) * rr);
                    if (sx2 >= 0 && sy2 >= 0 && sx2 < w && sy2 < h && idx[sy2 * w + sx2] === oc) sp = sy2 * w + sx2;
                }
            }
            if (sp < 0) continue;
            color = oc;
            var trial = flood(sp, n * 0.08);
            // 글자처럼 생긴 후보 중 테두리 순도가 가장 높은 것 (외곽선보다 그 안의 글자를 고른다)
            if (glyphLike(trial) && (!seed || trial.purity > seed.purity + 0.1)) { seed = trial; seedColor = oc; }
        }
        if (!seed) return { error: '글자를 찾지 못했어요. 글자 획 위를 클릭해 주세요.' };
        color = seedColor;
        // 시험 삼아 칠한 표시를 지우고 고른 색으로 다시 시작
        owner.fill(-1);
        comps.length = 0;
        seed = flood(seed.pixels[0], n * 0.08);

        var line = { x0: seed.x0, y0: seed.y0, x1: seed.x1, y1: seed.y1 }, chosen = [seed];
        var changed = true, guard = 0;
        while (changed && guard++ < 60) {
            changed = false;
            var lh = line.y1 - line.y0 + 1;
            var sx0 = Math.max(0, line.x0 - Math.round(lh * 1.1)), sx1 = Math.min(w - 1, line.x1 + Math.round(lh * 1.1));
            var sy0 = Math.max(0, line.y0 - Math.round(lh * 0.35)), sy1 = Math.min(h - 1, line.y1 + Math.round(lh * 0.35));
            for (var y = sy0; y <= sy1; y++) {
                for (var x = sx0; x <= sx1; x++) {
                    var p = y * w + x;
                    if (idx[p] !== color || owner[p] >= 0) continue;
                    var c = flood(p, lh * lh * 3);
                    if (c.overflow) continue;
                    var ch = c.y1 - c.y0 + 1;
                    var overlap = Math.min(c.y1, line.y1) - Math.max(c.y0, line.y0) + 1;
                    var gap = Math.max(c.x0 - line.x1, line.x0 - c.x1);
                    if (ch > lh * 1.7 || c.area < lh * lh * 0.004) continue;
                    // 같은 줄의 글자는 둘러싼 색(외곽선·배경)도 같다 — 사진 속 같은 색 반점이 끼어드는 것을 막는다
                    if (c.main !== seed.main) continue;
                    if (overlap < Math.min(ch, lh) * 0.35 || gap > lh * 1.1) continue;
                    chosen.push(c);
                    line.x0 = Math.min(line.x0, c.x0); line.x1 = Math.max(line.x1, c.x1);
                    line.y0 = Math.min(line.y0, c.y0); line.y1 = Math.max(line.y1, c.y1);
                    changed = true;
                }
            }
        }
        return analyzeLine(res, color, chosen, line);
    }

    // 글자색·외곽선·배경색·기울기·크기
    function analyzeLine(res, color, chosen, box) {
        var w = res.width, h = res.height, idx = res.index, pal = res.palette;
        var lh = box.y1 - box.y0 + 1;
        var margin = Math.max(6, Math.round(lh * 0.45));
        var cx0 = Math.max(0, box.x0 - margin), cy0 = Math.max(0, box.y0 - margin);
        var cx1 = Math.min(w - 1, box.x1 + margin), cy1 = Math.min(h - 1, box.y1 + margin);
        var cw = cx1 - cx0 + 1, chh = cy1 - cy0 + 1, cn = cw * chh;

        var fill = new Uint8Array(cn);
        chosen.forEach(function(c) {
            c.pixels.forEach(function(p) {
                var x = p % w - cx0, y = ((p / w) | 0) - cy0;
                fill[y * cw + x] = 1;
            });
        });

        // 글자 바깥으로 한 칸씩 넓혀 가며 거리별 색 분포를 잰다
        var maxD = Math.max(3, Math.round(lh * 0.3)), dist = new Int16Array(cn).fill(-1), queue = new Int32Array(cn), qh = 0, qt = 0;
        for (var i = 0; i < cn; i++) if (fill[i]) { dist[i] = 0; queue[qt++] = i; }
        var hist = [];
        while (qh < qt) {
            var q = queue[qh++], d = dist[q];
            if (d >= maxD) continue;
            var qx = q % cw, qy = (q / cw) | 0;
            var nbs = [qx > 0 ? q - 1 : -1, qx < cw - 1 ? q + 1 : -1, qy > 0 ? q - cw : -1, qy < chh - 1 ? q + cw : -1];
            for (var k = 0; k < 4; k++) {
                var r = nbs[k];
                if (r < 0 || dist[r] >= 0) continue;
                dist[r] = d + 1;
                queue[qt++] = r;
                var col = idx[(((r / cw) | 0) + cy0) * w + (r % cw) + cx0];
                var bucket = hist[d + 1] || (hist[d + 1] = {});
                bucket[col] = (bucket[col] || 0) + 1;
            }
        }
        function dominant(from, to, exclude) {
            var acc = {};
            for (var dd = from; dd <= to; dd++) {
                var b = hist[dd];
                if (!b) continue;
                for (var key in b) if (exclude.indexOf(+key) < 0) acc[key] = (acc[key] || 0) + b[key];
            }
            var best = -1, bestN = -1;
            for (var key2 in acc) if (acc[key2] > bestN) { bestN = acc[key2]; best = +key2; }
            return best;
        }
        function share(dd, c) {
            var b = hist[dd];
            if (!b) return 0;
            var tot = 0;
            for (var key in b) tot += b[key];
            return tot ? (b[c] || 0) / tot : 0;
        }

        var ring = dominant(1, 2, [color]), outline = null, thickness = 0, bg = ring;
        if (ring >= 0 && share(1, ring) >= 0.5) {
            var t = 1;
            while (t < maxD && share(t + 1, ring) >= 0.5) t++;
            // 바깥으로 더 가도 그 색이 꽤 남아 있으면 외곽선이 아니라 배경 (흰 외곽선 + 흰 배경 등)
            var farShare = 0, farN = 0;
            for (var fd = t + 2; fd <= Math.min(maxD, t + 5); fd++) { farShare += share(fd, ring); farN++; }
            if (t < maxD - 1 && (!farN || farShare / farN < 0.35)) {
                outline = ring;
                thickness = t;
                var outer = dominant(t + 1, Math.min(maxD, t + Math.max(3, t)), [color, ring]);
                bg = outer >= 0 ? outer : ring;
            }
        }
        if (bg < 0) bg = dominant(1, maxD, [color]);

        // 기울기: 글자 픽셀 좌표의 주축 (가로로 긴 줄에서만)
        var sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, cnt = 0, x, y;
        for (y = 0; y < chh; y++) for (x = 0; x < cw; x++) if (fill[y * cw + x]) { sx += x; sy += y; cnt++; }
        var mx = sx / cnt, my = sy / cnt;
        for (y = 0; y < chh; y++) for (x = 0; x < cw; x++) if (fill[y * cw + x]) {
            var dx = x - mx, dy = y - my;
            sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
        }
        var angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
        var aspect = (box.x1 - box.x0 + 1) / lh;
        if (aspect < 2.2 || Math.abs(angle) < 2 * Math.PI / 180 || Math.abs(angle) > 25 * Math.PI / 180) angle = 0;

        // 기울인 좌표계에서 글자 범위
        var cos = Math.cos(-angle), sin = Math.sin(-angle), u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
        for (y = 0; y < chh; y++) for (x = 0; x < cw; x++) if (fill[y * cw + x]) {
            var u = (x + 0.5) * cos - (y + 0.5) * sin, v = (x + 0.5) * sin + (y + 0.5) * cos;
            if (u < u0) u0 = u; if (u > u1) u1 = u; if (v < v0) v0 = v; if (v > v1) v1 = v;
        }
        var uc = (u0 + u1) / 2, vc = (v0 + v1) / 2;
        var cosA = Math.cos(angle), sinA = Math.sin(angle);

        return {
            crop: { x: cx0, y: cy0, w: cw, h: chh },
            fill: fill,
            outlineMask: outline != null ? ringMask(dist, idx, w, cw, chh, cx0, cy0, outline, thickness + 1) : null,
            center: { x: uc * cosA - vc * sinA, y: uc * sinA + vc * cosA },
            size: { w: u1 - u0, h: v1 - v0 },
            angle: angle,
            colors: {
                fill: hex(pal[color]),
                outline: outline != null ? hex(pal[outline]) : null,
                bg: bg >= 0 ? hex(pal[bg]) : '#ffffff'
            },
            thickness: thickness
        };
    }

    function ringMask(dist, idx, w, cw, chh, cx0, cy0, color, maxD) {
        var m = new Uint8Array(cw * chh);
        for (var i = 0; i < m.length; i++) {
            if (dist[i] > 0 && dist[i] <= maxD && idx[((i / cw) | 0) * w + cy0 * w + (i % cw) + cx0] === color) m[i] = 1;
        }
        return m;
    }

    // ── 폰트로 그리기 ──────────────────────────────────────────
    // 기준 크기로 잰 글자 테두리를 목표 영역(기울인 좌표계의 가로·세로)에 맞게 늘려 그린다
    // 높이는 원본 글자 높이에 맞추고 글자 모양 비율은 그대로 둔다.
    // 폰트가 원본보다 넓으면 가로만 좁히고, 좁으면 글자 사이 간격을 고르게 벌려 원본 줄 길이에 맞춘다.
    // (줄 전체를 한 번에 늘리면 긴 줄에서 글자가 찌그러지고 서로 붙어 보인다)
    function drawText(ctx, sel, f, text, scale, mode) {
        ctx.font = fontString(f, 100);
        var chars = Array.from(text), m = ctx.measureText(text);
        var asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent, th = asc + desc;
        if (!(th > 0) || !chars.length) return false;

        var first = ctx.measureText(chars[0]), last = ctx.measureText(chars[chars.length - 1]);
        var adv = chars.map(function(ch) { return ctx.measureText(ch).width; });
        var sum = adv.reduce(function(a, b) { return a + b; }, 0);
        // 잉크 기준 폭 = 전체 advance - 첫 글자 왼쪽 여백 - 마지막 글자 오른쪽 여백
        var leadIn = -first.actualBoundingBoxLeft, trail = adv[adv.length - 1] - last.actualBoundingBoxRight;
        var inkW = sum - leadIn - trail;
        if (!(inkW > 0)) return false;

        var W = sel.size.w * scale, H = sel.size.h * scale;
        var sy = H / th, sx = sy, gap = 0;
        if (inkW * sy > W) sx = W / inkW;
        else if (chars.length > 1) gap = (W - inkW * sy) / (chars.length - 1) / sx;

        ctx.save();
        ctx.translate(sel.center.x * scale, sel.center.y * scale);
        ctx.rotate(sel.angle);
        ctx.scale(sx, sy);
        var x = -(inkW + gap * (chars.length - 1)) / 2 - leadIn, y = (asc - desc) / 2;
        if (mode === 'stroke') {
            // 늘린 좌표계 안이라 선 두께도 늘어나므로 가로·세로 배율의 평균으로 되돌린다
            ctx.lineWidth = sel.thickness * 2 * scale / ((sx + sy) / 2);
            ctx.lineJoin = 'round';
        }
        for (var i = 0; i < chars.length; i++) {
            if (mode === 'stroke') ctx.strokeText(chars[i], x, y);
            ctx.fillText(chars[i], x, y);
            x += adv[i] + gap;
        }
        ctx.restore();
        return sx / sy;   // 가로 압축 비율 (1 = 폰트 원래 비율)
    }

    // 원본 글자 모양과 겹치는 정도(IoU)로 폰트 순위를 매긴다 (작게 줄여 빠르게 비교)
    function rankFonts(sel, text, available) {
        var s = Math.min(1, 220 / Math.max(sel.crop.w, sel.crop.h));
        var W = Math.max(1, Math.round(sel.crop.w * s)), H = Math.max(1, Math.round(sel.crop.h * s));
        var target = new Uint8Array(W * H), x, y;
        for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
            target[y * W + x] = sel.fill[Math.min(sel.crop.h - 1, Math.floor(y / s)) * sel.crop.w + Math.min(sel.crop.w - 1, Math.floor(x / s))];
        }
        var c = document.createElement('canvas');
        c.width = W; c.height = H;
        var ctx = c.getContext('2d', { willReadFrequently: true });
        return (available || FONTS).map(function(f) {
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#000';
            var ratio = drawText(ctx, sel, f, text, s, 'fill');
            if (!ratio) return { font: f, score: 0 };
            var d = ctx.getImageData(0, 0, W, H).data, inter = 0, uni = 0;
            for (var p = 0; p < W * H; p++) {
                var a = d[p * 4 + 3] > 127 ? 1 : 0, b = target[p];
                if (a && b) inter++;
                if (a || b) uni++;
            }
            // 원본 줄에 넣으려고 가로로 많이 찌그러뜨려야 하는 폰트는 읽기 어려워 순위를 낮춘다
            var squeeze = ratio < 0.8 ? Math.pow(ratio / 0.8, 1.5) : 1;
            return { font: f, score: uni ? inter / uni * squeeze : 0 };
        }).sort(function(a, b) { return b.score - a.score; });
    }

    function renderPreview(canvas, sel, f, text, colors) {
        var s = Math.min(canvas.width / sel.crop.w, canvas.height / sel.crop.h);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate((canvas.width - sel.crop.w * s) / 2, (canvas.height - sel.crop.h * s) / 2);
        if (colors.outline && sel.thickness > 0) {
            ctx.fillStyle = colors.outline;
            ctx.strokeStyle = colors.outline;
            drawText(ctx, sel, f, text, s, 'stroke');
        }
        ctx.fillStyle = colors.fill;
        drawText(ctx, sel, f, text, s, 'fill');
        ctx.restore();
    }

    // 확정된 교체 글자를 벡터로 만든다: 덮개(원래 글자+외곽선 자리) · 새 외곽선 · 새 글자
    function buildVector(sel, f, text, colors) {
        var F = Math.max(1, Math.min(8, 2600 / Math.max(sel.crop.w, sel.crop.h)));
        var W = Math.round(sel.crop.w * F), H = Math.round(sel.crop.h * F);
        var c = document.createElement('canvas');
        c.width = W; c.height = H;
        var ctx = c.getContext('2d', { willReadFrequently: true });

        function maskOf(mode) {
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#000';
            ctx.strokeStyle = '#000';
            drawText(ctx, sel, f, text, F, mode);
            var d = ctx.getImageData(0, 0, W, H).data, m = new Uint8Array(W * H);
            for (var p = 0; p < W * H; p++) m[p] = d[p * 4 + 3] > 127 ? 1 : 0;
            return m;
        }

        // 덮개: 원래 글자(+외곽선)를 조금 넓힌 모양
        var cw = sel.crop.w, ch = sel.crop.h, cover = new Uint8Array(cw * ch), grow = Math.max(2, Math.round(sel.size.h * 0.04));
        var base = new Uint8Array(cw * ch);
        for (var i = 0; i < base.length; i++) base[i] = sel.fill[i] || (sel.outlineMask && sel.outlineMask[i]) ? 1 : 0;
        for (var y = 0; y < ch; y++) for (var x = 0; x < cw; x++) {
            if (!base[y * cw + x]) continue;
            for (var dy = -grow; dy <= grow; dy++) {
                var yy = y + dy;
                if (yy < 0 || yy >= ch) continue;
                for (var dx = -grow; dx <= grow; dx++) {
                    var xx = x + dx;
                    if (xx >= 0 && xx < cw && dx * dx + dy * dy <= grow * grow) cover[yy * cw + xx] = 1;
                }
            }
        }

        if (colors.coverAll) cover.fill(1);
        var jobs = [root.wsTraceMask(cover, cw, ch), root.wsTraceMask(maskOf('fill'), W, H)];
        var hasOutline = colors.outline && sel.thickness > 0;
        if (hasOutline) jobs.push(root.wsTraceMask(maskOf('stroke'), W, H));
        return Promise.all(jobs).then(function(ds) {
            return { x: sel.crop.x, y: sel.crop.y, scale: F, coverD: ds[0], fillD: ds[1], outlineD: hasOutline ? ds[2] : '' };
        });
    }

    // 벡터 조각 → SVG. 흑백 모드면 색을 검정·흰색으로 바꾸고, 흰 덮개는 생략(커팅 파일에 흰 도형이 섞이지 않게)
    function toSvg(vec, colors, mono) {
        function mapColor(c) { return mono ? (luminance(parseHex(c)) < 128 ? '#000000' : '#ffffff') : c; }
        var g = '<g transform="translate(' + vec.x + ' ' + vec.y + ')">';
        var bg = mapColor(colors.bg);
        if (vec.coverD && !(mono && bg === '#ffffff')) g += '<path d="' + vec.coverD + '" fill="' + bg + '"/>';
        g += '<g transform="scale(' + (1 / vec.scale) + ')">';
        if (vec.outlineD && colors.outline) g += '<path d="' + vec.outlineD + '" fill="' + mapColor(colors.outline) + '"/>';
        if (vec.fillD) g += '<path d="' + vec.fillD + '" fill="' + mapColor(colors.fill) + '"/>';
        return g + '</g></g>';
    }

    // ── OCR (글자 내용 자동 입력) ──────────────────────────────
    var tesseractPromise = null, ocrWorkerPromise = null;
    function loadTesseract() {
        if (root.Tesseract) return Promise.resolve(root.Tesseract);
        if (!tesseractPromise) {
            tesseractPromise = new Promise(function(resolve, reject) {
                var s = document.createElement('script');
                s.src = TESSERACT_URL;
                s.onload = function() { resolve(root.Tesseract); };
                s.onerror = function() { tesseractPromise = null; reject(new Error('글자 인식 모듈을 불러오지 못했습니다.')); };
                document.head.appendChild(s);
            });
        }
        return tesseractPromise;
    }

    function recognize(sel) {
        return loadTesseract().then(function(T) {
            if (!ocrWorkerPromise) ocrWorkerPromise = T.createWorker('kor');
            return ocrWorkerPromise;
        }).then(function(worker) {
            // 글자 모양을 반듯하게 세운 흑백 이미지 (줄 높이 약 90px)
            var s = 90 / Math.max(8, sel.size.h), pad = 30;
            var W = Math.round(sel.size.w * s) + pad * 2, H = Math.round(sel.size.h * s) + pad * 2;
            var c = document.createElement('canvas');
            c.width = W; c.height = H;
            var ctx = c.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, W, H);
            var src = document.createElement('canvas');
            src.width = sel.crop.w; src.height = sel.crop.h;
            var sctx = src.getContext('2d'), id = sctx.createImageData(sel.crop.w, sel.crop.h);
            for (var p = 0; p < sel.fill.length; p++) {
                var v = sel.fill[p] ? 0 : 255;
                id.data[p * 4] = id.data[p * 4 + 1] = id.data[p * 4 + 2] = v;
                id.data[p * 4 + 3] = 255;
            }
            sctx.putImageData(id, 0, 0);
            ctx.translate(W / 2, H / 2);
            ctx.rotate(-sel.angle);
            ctx.scale(s, s);
            ctx.translate(-sel.center.x, -sel.center.y);
            ctx.drawImage(src, 0, 0);
            return worker.recognize(c);
        }).then(function(out) {
            var text = (out.data.text || '').replace(/\s+/g, ' ').trim();
            return { text: text, confidence: out.data.confidence || 0 };
        });
    }

    root.wsTextReplace = {
        FONTS: FONTS,
        TOP_COUNT: TOP_COUNT,
        findLine: findLine,
        selectRegion: selectRegion,
        loadFonts: loadFonts,
        rankFonts: rankFonts,
        renderPreview: renderPreview,
        buildVector: buildVector,
        toSvg: toSvg,
        recognize: recognize,
        parseHex: parseHex,
        luminance: luminance
    };
})(window);
