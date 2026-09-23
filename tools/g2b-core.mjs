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

        // 계약방법(수의/제한경쟁…)과 낙찰방법(적격심사…)은 다른 항목이다.
        method:     str(r.cntrctCnclsMthdNm),
        bidMethod:  str(r.sucsfbidMthdNm) || str(r.bidMethdNm),

        // 업종. indstrytyNm 은 목록 API 에 없다 — 별도 오퍼레이션 소관이라
        // 건별로 부르면 호출 수가 감당이 안 된다. 목록에 들어 있는 것 중
        // 가장 가까운 값을 쓴다: 물품은 세부품명, 공사는 주공종명.
        industry:   str(r.dtilPrdctClsfcNoNm) || str(r.mainCnsttyNm),

        // 세부품명번호. 입찰참가자격 등록물품과 대조하는 기준이다.
        // 키워드로 어림잡는 것보다 정확하다 — 번호가 맞으면 실제로
        // 투찰할 수 있는 건이라는 뜻이기 때문이다.
        productCode: str(r.dtilPrdctClsfcNo),

        // 참가가능지역(prtcptPsblRgnNm)도 목록 API 에 없다.
        // 공사는 현장 지역이 들어오므로 그것만이라도 쓴다. 물품은 비어 있다.
        regions:    str(r.cnstrtsiteRgnNm),
        // 지역제한이 걸린 공고인지, 무엇을 기준으로 보는지 (예: 본사소재지)
        regionLimit: str(r.rgnLmtBidLocplcJdgmBssNm),
        industryLimit: str(r.indstrytyLmtYn) === 'Y',

        // 물품 규격·수량. 원가를 잡으려면 이게 있어야 한다.
        spec:       str(r.prdctSpecNm),
        qty:        numOrNull(r.prdctQty),
        unit:       str(r.prdctUnit),

        // 문의처. 규격을 확인하려면 결국 전화하게 된다.
        officer:    str(r.ntceInsttOfclNm),
        officerTel: str(r.ntceInsttOfclTelNo),

        // 현장설명회 — 참석이 의무인 공고가 있어 놓치면 입찰 자체가 막힌다.
        briefingAt:    str(r.dcmtgOprtnDt),
        briefingPlace: str(r.dcmtgOprtnPlce),

        // 예비가격 개수. 투찰금액 계산기에서 복수예비가격 조합을 돌릴 때 쓴다.
        prdprcTotal: numOrNull(r.totPrdprcNum),
        prdprcDrawn: numOrNull(r.drwtPrdprcNum),

        specUrl:    str(r.ntceSpecDocUrl1),
        url:        str(r.bidNtceDtlUrl) || str(r.bidNtceUrl),
    };
    if (debug) rec._raw = r;
    return rec;
}

export function matchesKeyword(rec, keywords) {
    const hay = `${rec.name} ${rec.industry} ${rec.spec}`;
    return keywords.some(k => hay.includes(k));
}

/* 공고가 우리와 얼마나 관련 있는지 가린다.
 *
 * 세부품명번호를 먼저 본다. 입찰참가자격 등록물품과 번호가 맞으면
 * 실제로 투찰할 수 있는 건이라는 뜻이라, 공고명을 키워드로 어림잡는
 * 것과는 확실성이 다르다.
 *
 *   registered  등록물품과 번호가 일치 — 바로 투찰 가능
 *   expired     번호는 맞지만 등록유효기간이 지남 — 갱신해야 참가 가능
 *   group       같은 품명군(앞 8자리) — 품명 추가 등록하면 참가 가능
 *   keyword     품명번호는 안 맞지만 공고명이 우리 일로 보임
 *   null        관련 없음
 */
export function classifyRelevance(rec, company, onDate) {
    const codes   = new Set((company.products || []).map(p => p.code));
    const groups  = new Set((company.products || []).map(p => p.code.slice(0, 8)));
    const code    = rec.productCode || '';
    const today   = onDate || new Date();

    if (code && codes.has(code)) {
        const p = company.products.find(x => x.code === code);
        const alive = !!p.regEnd && new Date(p.regEnd + 'T23:59:59') >= today;
        return alive ? 'registered' : 'expired';
    }
    if (code && groups.has(code.slice(0, 8))) return 'group';

    // 품명번호가 안 맞으면 공고명으로 본다. 다만 엉뚱한 게 많이 딸려 오므로
    // 제외어를 먼저 적용한다 ('LED'로 조명등이, '시트'로 방수시트가 걸렸다).
    const hay = `${rec.name} ${rec.industry} ${rec.spec}`;
    if ((company.excludeKeywords || []).some(k => hay.includes(k))) return null;
    if ((company.keywords || []).some(k => hay.includes(k))) return 'keyword';

    return null;
}

/* 지역으로 거르기. 목록 API 에 참가가능지역이 없어서, 공사 현장지역과
 * 기관명을 함께 본다. 기관명에 지역이 들어 있는 경우가 많다
 * (예: "경기도교육청", "강원특별자치도 평창군"). 참가자격을 판정하는
 * 것이 아니라 훑어볼 범위를 좁히는 용도다. */
export function matchesRegion(rec, region) {
    const hay = `${rec.regions} ${rec.noticeInst} ${rec.demandInst}`;
    return hay.includes(region);
}

/* ── 수집 ────────────────────────────────────────────────────── */
/* fetchText(url) 를 주입받는다. Worker 는 캐시를 끼운 것을, Actions 는 맨 fetch 를 넘긴다. */
export async function collectBids(opts) {
    const {
        key, kinds, keywords = [], region = '',
        minPrice = null, maxPrice = null, debug = false, fetchText,
        company = null,
    } = opts;

    const { from, to } = resolveRange(opts.from, opts.to, opts.days);

    // 업무구분별로 기간 전체를 훑고 키워드는 이쪽에서 걸러낸다.
    // 키워드마다 업스트림을 따로 부르면 호출 수가 키워드 개수만큼 불어나
    // 일일 한도가 금방 소진되기 때문이다.
    //
    // 공고번호로 묶는다. 같은 공고번호에 차수(000, 001, …)가 여럿 오는데
    // 이는 원공고와 그 변경공고다. 마지막 차수만 유효하므로 그것만 남긴다.
    // 그러지 않으면 같은 공고가 목록에 두세 번 나와 읽기가 어렵다.
    const seen = new Map();   // 공고번호 → 가장 높은 차수
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
                if (!rec) continue;
                const prev = seen.get(rec.no);
                if (!prev || ordNum(rec.ord) > ordNum(prev.ord)) seen.set(rec.no, rec);
            }
            fetched += res.items.length;
            if (fetched >= total || res.items.length === 0) break;
            page++;
        }
        meta.byKind[kind] = { total, fetched };
        if (fetched < total) meta.truncated = true;
    }

    let list = [...seen.values()];

    // 입찰참가자격 등록 내용이 주어지면 그걸로 먼저 가린다.
    // 관련 없는 공고를 목록에 섞어두면 결국 매번 눈으로 걸러야 한다.
    if (company) {
        meta.relevance = {};
        list = list.reduce((acc, r) => {
            const rel = classifyRelevance(r, company);
            if (!rel) return acc;
            r.relevance = rel;
            meta.relevance[rel] = (meta.relevance[rel] || 0) + 1;
            acc.push(r);
            return acc;
        }, []);
    }

    if (keywords.length) list = list.filter(r => matchesKeyword(r, keywords));
    if (region)   list = list.filter(r => matchesRegion(r, region));
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

/* 차수 비교용. '000' 같은 문자열로 오고, 드물게 비어 있거나 숫자가 아니다. */
function ordNum(v) {
    const n = Number(String(v ?? '').trim());
    return Number.isFinite(n) ? n : 0;
}

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
