/* 나라장터 입찰공고 프록시 (Cloudflare Worker) — 선택 사항
 *
 * 기본 경로는 GitHub Actions 주기 수집(tools/fetch-bids.js)이다.
 * 이 Worker 는 "화면에서 조건을 바꿔 실시간으로 조회"가 필요할 때만 쓴다.
 *
 * 응답 해석·정규화는 tools/g2b-core.mjs 한 곳에만 있다. 두 벌로 갈라지면
 * 한쪽만 고치는 사고가 나기 때문.
 *
 * 엔드포인트
 *   GET /health
 *   GET /bids?kind=thng,cnstwk&keywords=간판,사인&from=YYYYMMDD&to=YYYYMMDD
 *            &minPrice=&maxPrice=&region=&debug=1
 */

import { OPS, collectBids, parseEnvelope } from '../../tools/g2b-core.mjs';

const CACHE_TTL = 600;   // 업스트림 페이지 캐시 10분

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin') || '';
        const cors = corsHeaders(origin, env);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: cors });
        }
        if (request.method !== 'GET') {
            return json({ error: 'GET 만 허용됩니다.' }, 405, cors);
        }
        if (origin && !cors['Access-Control-Allow-Origin']) {
            return json({ error: '허용되지 않은 origin 입니다: ' + origin }, 403, {});
        }

        if (url.pathname === '/health') {
            return json({ ok: true, hasKey: !!env.G2B_SERVICE_KEY }, 200, cors);
        }
        if (url.pathname === '/bids') {
            try {
                return json(await handleBids(url, env), 200, cors);
            } catch (err) {
                return json({ error: String(err && err.message || err) }, 502, cors);
            }
        }
        return json({ error: 'not found' }, 404, cors);
    },
};

/* ── CORS ────────────────────────────────────────────────────── */
function corsHeaders(origin, env) {
    const allowed = String(env.ALLOWED_ORIGINS || '')
        .split(',').map(s => s.trim()).filter(Boolean);
    const h = {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
    };
    if (origin && allowed.includes(origin)) {
        h['Access-Control-Allow-Origin'] = origin;
    }
    return h;
}

function json(body, status, extra) {
    return new Response(JSON.stringify(body), {
        status,
        headers: Object.assign(
            { 'Content-Type': 'application/json; charset=utf-8' },
            extra || {}
        ),
    });
}

/* ── /bids ───────────────────────────────────────────────────── */
async function handleBids(url, env) {
    const key = env.G2B_SERVICE_KEY;
    if (!key) throw new Error('G2B_SERVICE_KEY 시크릿이 설정되지 않았습니다.');

    const q = url.searchParams;
    const kinds = (q.get('kind') || 'thng,cnstwk')
        .split(',').map(s => s.trim()).filter(k => OPS[k]);
    if (!kinds.length) throw new Error('kind 는 thng, cnstwk, servc 중 하나 이상이어야 합니다.');

    return collectBids({
        key,
        kinds,
        from:     q.get('from'),
        to:       q.get('to'),
        keywords: (q.get('keywords') || '').split(',').map(s => s.trim()).filter(Boolean),
        region:   (q.get('region') || '').trim(),
        minPrice: numOrNull(q.get('minPrice')),
        maxPrice: numOrNull(q.get('maxPrice')),
        debug:    q.get('debug') === '1',
        fetchText: cachedFetchText,
    });
}

/* 업스트림 페이지 단위로 캐시한다. 기간이 겹치는 재조회가 잦아
 * 페이지 키로 캐시하면 일일 한도를 크게 절약한다. */
async function cachedFetchText(target) {
    const cache = caches.default;
    const cacheKey = new Request(target, { method: 'GET' });

    const cached = await cache.match(cacheKey);
    if (cached) return cached.text();

    const upstream = await fetch(target, { headers: { Accept: 'application/json' } });
    const text = await upstream.text();

    if (!upstream.ok) {
        // 인증 실패·한도 초과는 본문에 사람이 읽을 사유가 들어 있다.
        // parseEnvelope 가 그걸 꺼내 던지고, 못 알아보면 아래로 떨어진다.
        parseEnvelope(text, '업스트림');
        throw new Error(`업스트림 HTTP ${upstream.status}: ${text.slice(0, 300)}`);
    }

    // 오류 봉투를 캐시에 남기지 않도록 넣기 전에 먼저 해석해 본다.
    parseEnvelope(text, '업스트림');
    await cache.put(cacheKey, new Response(text, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': `max-age=${CACHE_TTL}`,
        },
    }));
    return text;
}

function numOrNull(v) {
    if (v == null || v === '') return null;
    const n = Number(String(v).replace(/[,\s]/g, ''));
    return Number.isFinite(n) ? n : null;
}
