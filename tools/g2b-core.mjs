/* g2b-core.mjs — 나라장터 입찰공고 API 공용 로직
 *
 * 두 곳에서 쓴다.
 *   - tools/fetch-bids.js   GitHub Actions 가 주기적으로 수집 (기본 경로)
 *   - worker/src/index.js   Cloudflare Worker 실시간 중계 (선택)
 *
 * 응답 해석이 두 벌로 갈라지면 한쪽만 고치는 사고가 난다. 특히 오류 봉투
 * 판별은 실수하기 쉬운 자리라(아래 parseEnvelope 주석 참고) 반드시 여기 한 곳에만 둔다.
 */

export const UPSTREAM = 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService';

// 업무구분 → 오퍼레이션. 허용 목록으로 두어 임의 경로 중계를 막는다.
export const OPS = {
    thng:   'getBidPblancListInfoThng',    // 물품
    cnstwk: 'getBidPblancListInfoCnstwk',  // 공사
    servc:  'getBidPblancListInfoServc',   // 용역
};

export const ROWS_PER_PAGE  = 999;  // 업스트림 허용 최대치
export const MAX_PAGES      = 20;   // 업무구분당 호출 상한 (한도 보호)
export const MAX_RANGE_DAYS = 31;   // 업스트림이 장기간 조회를 거부한다

/* 한 페이지 요청 URL. 서비스키는 반드시 '디코딩된' 값이어야 한다.
 * 포털이 주는 인코딩된 키를 넣으면 여기서 한 번 더 인코딩되어 인증에 실패한다. */
export function buildPageUrl(op, key, from, to, page, rows = ROWS_PER_PAGE) {
    const p = new URLSearchParams({
        ServiceKey: key,
        type: 'json',
        inqryDiv: '1',               // 1 = 공고게시일시 기준
        inqryBgnDt: from + '0000',   // YYYYMMDDHHMM
        inqryEndDt: to + '2359',
        pageNo: String(page),
        numOfRows: String(rows),
    });
    return `${UPSTREAM}/${op}?${p}`;
}

/* 업스트림 응답은 세 가지 모양으로 온다.
 *   1. XML 오류 봉투   — type=json 이어도 이렇게 오는 경우가 있다
 *   2. JSON 오류 봉투  — OpenAPI_ServiceResponse.cmmMsgHeader.
 *                        성공 응답과 구조가 완전히 달라서 따로 봐야 한다.
 *                        이걸 놓치면 인증 실패가 조용히 '0건' 으로 둔갑한다.
 *   3. JSON 정상 응답  — response.header / response.body
 */
export function parseEnvelope(text, op) {
    const trimmed = String(text || '').trim();

    if (trimmed.startsWith('<')) {
        const code = pick(trimmed, 'returnReasonCode') || pick(trimmed, 'resultCode');
        const msg  = pick(trimmed, 'returnAuthMsg')
                  || pick(trimmed, 'errMsg')
                  || pick(trimmed, 'resultMsg')
                  || trimmed.slice(0, 200);
        throw new Error(`${op} 오류(${code || '?'}): ${msg}${hint(code)}`);
    }

    let data;
    try { data = JSON.parse(trimmed); }
    catch { throw new Error(`${op} 응답을 JSON 으로 해석할 수 없습니다: ${trimmed.slice(0, 200)}`); }

    const cmm = data?.OpenAPI_ServiceResponse?.cmmMsgHeader;
    if (cmm) {
        const code = cmm.returnReasonCode;
        const msg  = cmm.returnAuthMsg || cmm.errMsg || '';
        throw new Error(`${op} 오류(${code || '?'}): ${msg}${hint(code)}`);
    }

    const header = data?.response?.header || {};
    const code = header.resultCode;
    if (code && code !== '00') {
        throw new Error(`${op} 오류(${code}): ${header.resultMsg || ''}${hint(code)}`);
    }

    const body = data?.response?.body || {};
    let items = body.items;
    if (!items) items = [];
    else if (Array.isArray(items)) { /* 그대로 */ }
    else if (Array.isArray(items.item)) items = items.item;
    else if (items.item) items = [items.item];
    else items = [];

    return { items, totalCount: Number(body.totalCount) || items.length };
}

export function pick(xml, tag) {
    const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
    return m ? m[1].trim() : '';
}

export function hint(code) {
    const map = {
        '12': ' — 폐기된 오퍼레이션입니다.',
        '22': ' — 일일 트래픽 한도를 초과했습니다. 운영계정 신청을 검토하세요.',
        '30': ' — 등록되지 않은 서비스키입니다. Decoding 키가 맞는지, 활용신청이 승인됐는지 확인하세요.',
        '31': ' — 서비스키 활용 기간이 만료되었습니다.',
        '32': ' — 등록되지 않은 도메인/IP 입니다.',
    };
    return map[String(code)] || '';
}

/* ── 정규화 ──────────────────────────────────────────────────── */
export function normalize(r, kind, debug) {
    const no = str(r.bidNtceNo);
    if (!no) return null;
    const ord = str(r.bidNtceOrd) || '000';

    const rec = {
        id: `${no}-${ord}`,
        kind,
        no,
        ord,
        name:       str(r.bidNtceNm),
        noticeInst: str(r.ntceInsttNm),
        demandInst: str(r.dminsttNm),
        noticeAt:   str(r.bidNtceDt),
        closeAt:    str(r.bidClseDt),
        openAt:     str(r.opengDt),
        estPrice:   numOrNull(r.presmptPrce),
        budget:     numOrNull(r.asignBdgtAmt),
        // 낙찰하한율. 투찰금액 계산기에서 쓴다.
        lowerRate:  numOrNull(r.sucsfbidLwltRate),
        method:     str(r.cntrctCnclsMthdNm) || str(r.bidMethdNm),
        industry:   str(r.indstrytyNm),
        regions:    str(r.prtcptPsblRgnNm),
        url:        str(r.bidNtceDtlUrl),
    };
    if (debug) rec._raw = r;
    return rec;
}

export function matchesKeyword(rec, keywords) {
    const hay = `${rec.name} ${rec.industry}`;
    return keywords.some(k => hay.includes(k));
}

/* ── 수집 ────────────────────────────────────────────────────── */
/* fetchText(url) 를 주입받는다. Worker 는 캐시를 끼운 것을, Actions 는 맨 fetch 를 넘긴다. */
export async function collectBids(opts) {
    const {
        key, kinds, keywords = [], region = '',
        minPrice = null, maxPrice = null, debug = false, fetchText,
    } = opts;

    const { from, to } = resolveRange(opts.from, opts.to, opts.days);

    // 업무구분별로 기간 전체를 훑고 키워드는 이쪽에서 걸러낸다.
    // 키워드마다 업스트림을 따로 부르면 호출 수가 키워드 개수만큼 불어나
    // 일일 한도가 금방 소진되기 때문이다.
    const seen = new Map();
    const meta = { upstreamCalls: 0, truncated: false, byKind: {} };

    for (const kind of kinds) {
        const op = OPS[kind];
        let page = 1, fetched = 0, total = 0;
        while (page <= MAX_PAGES) {
            const text = await fetchText(buildPageUrl(op, key, from, to, page));
            meta.upstreamCalls++;
            const res = parseEnvelope(text, op);
            total = res.totalCount;
            for (const raw of res.items) {
                const rec = normalize(raw, kind, debug);
                if (rec && !seen.has(rec.id)) seen.set(rec.id, rec);
            }
            fetched += res.items.length;
            if (fetched >= total || res.items.length === 0) break;
            page++;
        }
        meta.byKind[kind] = { total, fetched };
        if (fetched < total) meta.truncated = true;
    }

    let list = [...seen.values()];
    if (keywords.length) list = list.filter(r => matchesKeyword(r, keywords));
    if (region)   list = list.filter(r => (r.regions || '').includes(region));
    if (minPrice != null) list = list.filter(r => r.estPrice != null && r.estPrice >= minPrice);
    if (maxPrice != null) list = list.filter(r => r.estPrice != null && r.estPrice <= maxPrice);

    // 마감이 가까운 것부터. 마감 정보가 없는 건은 뒤로 보낸다.
    list.sort((a, b) => (a.closeAt || '9999').localeCompare(b.closeAt || '9999'));

    return { range: { from, to }, count: list.length, meta, items: list };
}

/* 기간 기본값은 최근 7일. 업스트림이 장기간 조회를 거부하므로 31일로 자른다. */
export function resolveRange(fromRaw, toRaw, days = 7) {
    const digits = s => String(s || '').replace(/\D/g, '').slice(0, 8);
    let to   = digits(toRaw)   || ymd(new Date());
    let from = digits(fromRaw) || ymd(addDays(parseYmd(to), -days));
    if (from > to) [from, to] = [to, from];
    if (daysBetween(from, to) > MAX_RANGE_DAYS) {
        from = ymd(addDays(parseYmd(to), -MAX_RANGE_DAYS));
    }
    return { from, to };
}

/* ── 잡다한 것들 ─────────────────────────────────────────────── */
export function str(v) { return v == null ? '' : String(v).trim(); }

export function numOrNull(v) {
    if (v == null || v === '') return null;
    const n = Number(String(v).replace(/[,\s]/g, ''));
    return Number.isFinite(n) ? n : null;
}

export function ymd(d) {
    return d.getFullYear().toString()
        + String(d.getMonth() + 1).padStart(2, '0')
        + String(d.getDate()).padStart(2, '0');
}
export function parseYmd(s) {
    return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
}
export function addDays(d, n) {
    const x = new Date(d); x.setDate(x.getDate() + n); return x;
}
export function daysBetween(a, b) {
    return Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
}
