/* Worker 통합 시험 — 업스트림과 캐시를 가짜로 대체하고 /bids 전 경로를 돌린다 */
import assert from 'node:assert';
import test from 'node:test';
import worker from '../worker/src/index.js';

const ENV = {
    G2B_SERVICE_KEY: 'TEST-KEY',
    ALLOWED_ORIGINS: 'https://heijungkim.github.io',
};
const ORIGIN = 'https://heijungkim.github.io';

// 캐시 스텁 (매번 미스)
globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };

function mockUpstream(bodyFor) {
    globalThis.fetch = async (url) => {
        const u = new URL(url);
        const op = u.pathname.split('/').pop();
        const page = Number(u.searchParams.get('pageNo'));
        assert.ok(u.searchParams.get('ServiceKey') === 'TEST-KEY', 'ServiceKey 전달됨');
        assert.match(u.searchParams.get('inqryBgnDt'), /^\d{12}$/, 'inqryBgnDt 는 YYYYMMDDHHMM');
        const { body, status = 200 } = bodyFor(op, page, u);
        return new Response(body, { status });
    };
}

function envelope(items, totalCount) {
    return JSON.stringify({
        response: {
            header: { resultCode: '00', resultMsg: 'NORMAL SERVICE.' },
            body: { pageNo: 1, numOfRows: 999, totalCount: totalCount ?? items.length, items },
        },
    });
}

/* 필드명은 실제 응답을 찍어 확인한 것이다(BID_DIAG=1).
 * indstrytyNm(업종)과 prtcptPsblRgnNm(참가가능지역)은 목록 API 에 없다 —
 * 별도 오퍼레이션 소관이라 건별로 부르면 호출 수가 감당이 안 된다.
 * 그 자리는 물품이면 dtilPrdctClsfcNoNm, 공사면 mainCnsttyNm 이 채운다. */
const REC_SIGN = {
    bidNtceNo: '20260900123', bidNtceOrd: '000',
    bidNtceNm: '○○초 교내 안내표지판 및 간판 제작설치',
    ntceInsttNm: '경기도교육청', dminsttNm: '○○초등학교',
    bidNtceDt: '2026-09-21 10:00:00', bidClseDt: '2026-09-30 11:00:00',
    opengDt: '2026-09-30 14:00:00',
    presmptPrce: '18400000', asignBdgtAmt: '20,000,000',
    sucsfbidLwltRate: '87.995',
    cntrctCnclsMthdNm: '제한경쟁', sucsfbidMthdNm: '적격심사',
    dtilPrdctClsfcNoNm: '광고물',
    prdctSpecNm: '알루미늄 복합판 3T', prdctQty: '12', prdctUnit: '개',
    rgnLmtBidLocplcJdgmBssNm: '본사소재지', indstrytyLmtYn: 'Y',
    ntceInsttOfclNm: '김담당', ntceInsttOfclTelNo: '031-000-0000',
    dcmtgOprtnDt: '2026-09-25 14:00:00', dcmtgOprtnPlce: '○○초등학교 본관',
    totPrdprcNum: '15', drwtPrdprcNum: '4',
    bidNtceDtlUrl: 'https://www.g2b.go.kr/detail?no=20260900123',
};
const REC_OTHER = {
    ...REC_SIGN, bidNtceNo: '20260900999',
    bidNtceNm: '급식실 주방기구 구매', dtilPrdctClsfcNoNm: '주방용품',
    prdctSpecNm: '스테인리스 조리대', presmptPrce: '5000000',
};

function req(qs, origin = ORIGIN) {
    return new Request(`https://w.dev/bids?${qs}`, { headers: { Origin: origin } });
}

test('정상 응답을 정규화하고 키워드로 걸러낸다', async () => {
    mockUpstream(() => ({ body: envelope([REC_SIGN, REC_OTHER]) }));
    const res = await worker.fetch(req('kind=thng&keywords=간판&from=20260920&to=20260923'), ENV);
    assert.equal(res.status, 200);
    const j = await res.json();

    assert.equal(j.count, 1, '간판 공고 1건만 남아야 한다');
    const r = j.items[0];
    assert.equal(r.id, '20260900123-000');
    assert.equal(r.name, '○○초 교내 안내표지판 및 간판 제작설치');
    assert.equal(r.estPrice, 18400000, '문자열 금액 → 숫자');
    assert.equal(r.budget, 20000000, '콤마 포함 금액 → 숫자');
    assert.equal(r.lowerRate, 87.995, '낙찰하한율 파싱');
    assert.equal(r.kind, 'thng');
    assert.equal(r.url, 'https://www.g2b.go.kr/detail?no=20260900123');
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), ORIGIN);
});

test('키워드가 품명에도 걸린다', async () => {
    mockUpstream(() => ({ body: envelope([REC_SIGN, REC_OTHER]) }));
    const res = await worker.fetch(req('kind=thng&keywords=광고물&from=20260920&to=20260923'), ENV);
    assert.equal((await res.json()).count, 1);
});

test('키워드가 규격에도 걸린다', async () => {
    mockUpstream(() => ({ body: envelope([REC_SIGN, REC_OTHER]) }));
    const res = await worker.fetch(req('kind=thng&keywords=알루미늄&from=20260920&to=20260923'), ENV);
    assert.equal((await res.json()).count, 1);
});

test('물품·공사를 합치고 같은 공고는 중복 제거한다', async () => {
    mockUpstream(() => ({ body: envelope([REC_SIGN]) }));
    const res = await worker.fetch(req('kind=thng,cnstwk&from=20260920&to=20260923'), ENV);
    const j = await res.json();
    assert.equal(j.count, 1, '두 구분에서 같은 공고번호가 오면 1건');
    assert.equal(j.meta.upstreamCalls, 2, '구분마다 1회씩 호출');
});

test('items 가 {item: 객체} 한 건으로 와도 받는다', async () => {
    mockUpstream(() => ({
        body: JSON.stringify({
            response: {
                header: { resultCode: '00' },
                body: { totalCount: 1, items: { item: REC_SIGN } },
            },
        }),
    }));
    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    assert.equal((await res.json()).count, 1);
});

test('결과 0건도 오류가 아니다', async () => {
    mockUpstream(() => ({ body: envelope([], 0) }));
    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).count, 0);
});

test('한도 초과 XML 을 읽어 안내 문구를 붙인다', async () => {
    mockUpstream(() => ({
        body: `<OpenAPI_ServiceResponse><cmmMsgHeader>
               <returnReasonCode>22</returnReasonCode>
               <returnAuthMsg>LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR</returnAuthMsg>
               </cmmMsgHeader></OpenAPI_ServiceResponse>`,
    }));
    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    assert.equal(res.status, 502);
    const { error } = await res.json();
    assert.match(error, /22/);
    assert.match(error, /일일 트래픽 한도/, '사람이 읽을 안내가 붙어야 한다');
});

test('resultCode 가 00 이 아니면 오류로 넘긴다', async () => {
    mockUpstream(() => ({
        body: JSON.stringify({ response: { header: { resultCode: '30', resultMsg: 'SERVICE_KEY_IS_NOT_REGISTERED_ERROR' } } }),
    }));
    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    assert.equal(res.status, 502);
    assert.match((await res.json()).error, /등록되지 않은 서비스키/);
});

test('총건수가 많으면 페이지를 이어 받는다', async () => {
    let calls = 0;
    mockUpstream((op, page) => {
        calls++;
        const rec = { ...REC_SIGN, bidNtceNo: `2026090${page}000` };
        return { body: envelope(Array.from({ length: 999 }, (_, i) => ({ ...rec, bidNtceOrd: String(i).padStart(3, '0') })), 1998) };
    });
    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    const j = await res.json();
    assert.equal(calls, 2, '999 + 999 = 1998 이면 2페이지');
    assert.equal(j.count, 1998);
});

test('추정가격 범위로 걸러낸다', async () => {
    mockUpstream(() => ({ body: envelope([REC_SIGN, REC_OTHER]) }));
    const res = await worker.fetch(req('kind=thng&minPrice=10000000&from=20260920&to=20260923'), ENV);
    const j = await res.json();
    assert.equal(j.count, 1);
    assert.equal(j.items[0].estPrice, 18400000);
});

test('마감 임박순으로 정렬한다', async () => {
    const late = { ...REC_SIGN, bidNtceNo: '20260900500', bidClseDt: '2026-10-15 11:00:00' };
    mockUpstream(() => ({ body: envelope([late, REC_SIGN]) }));
    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    const j = await res.json();
    assert.equal(j.items[0].no, '20260900123', '9/30 마감이 10/15 보다 먼저');
});

test('기간을 안 주면 최근 7일, 31일을 넘기면 자른다', async () => {
    mockUpstream(() => ({ body: envelope([]) }));

    let res = await worker.fetch(req('kind=thng'), ENV);
    let { range } = await res.json();
    const days = (a, b) => Math.round(
        (new Date(+b.slice(0, 4), +b.slice(4, 6) - 1, +b.slice(6, 8))
       -  new Date(+a.slice(0, 4), +a.slice(4, 6) - 1, +a.slice(6, 8))) / 86400000);
    assert.equal(days(range.from, range.to), 7);

    res = await worker.fetch(req('kind=thng&from=20250101&to=20260923'), ENV);
    range = (await res.json()).range;
    assert.equal(days(range.from, range.to), 31, '31일로 잘려야 한다');
});

test('허용되지 않은 origin 은 403', async () => {
    mockUpstream(() => ({ body: envelope([]) }));
    const res = await worker.fetch(req('kind=thng', 'https://evil.example'), ENV);
    assert.equal(res.status, 403);
});

test('알 수 없는 kind 는 거부한다 (열린 프록시 방지)', async () => {
    mockUpstream(() => ({ body: envelope([]) }));
    const res = await worker.fetch(req('kind=hack'), ENV);
    assert.equal(res.status, 502);
    assert.match((await res.json()).error, /kind/);
});

test('키가 없으면 health 가 알려준다', async () => {
    const res = await worker.fetch(
        new Request('https://w.dev/health', { headers: { Origin: ORIGIN } }), { ALLOWED_ORIGINS: ORIGIN });
    assert.deepEqual(await res.json(), { ok: true, hasKey: false });
});

test('OPTIONS 프리플라이트', async () => {
    const res = await worker.fetch(
        new Request('https://w.dev/bids', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), ENV);
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), ORIGIN);
});

test('bid.html 이 참조하는 로컬 파일이 모두 있다', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const url = await import('node:url');
    const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
    const html = fs.readFileSync(path.join(root, 'bid.html'), 'utf8');
    let checked = 0;
    for (const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
        if (/^https?:/.test(m[1])) continue;
        assert.ok(fs.existsSync(path.join(root, m[1])), m[1] + ' 없음');
        checked++;
    }
    assert.ok(checked >= 5, '검사된 로컬 참조가 너무 적다: ' + checked);
});

/* 아래 세 개는 실제 API 를 두드려 보고 나서 추가한 것.
 * 인증 실패가 XML 이 아니라 JSON 오류 봉투(OpenAPI_ServiceResponse)로 오는데,
 * 그 모양을 모르면 잘못된 키인데도 조용히 '0건' 으로 보인다. */

const KEY_ERROR = JSON.stringify({
    OpenAPI_ServiceResponse: {
        cmmMsgHeader: {
            errMsg: 'SERVICE_KEY_IS_NOT_REGISTERED_ERROR',
            returnAuthMsg: '등록되지 않은 서비스키',
            returnReasonCode: '30',
        },
    },
});

test('JSON 오류 봉투를 0건으로 삼키지 않는다', async () => {
    mockUpstream(() => ({ body: KEY_ERROR }));
    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    assert.equal(res.status, 502, '200 으로 0건을 돌려주면 안 된다');
    const { error } = await res.json();
    assert.match(error, /30/);
    assert.match(error, /등록되지 않은 서비스키/);
});

test('HTTP 403 이어도 본문에서 사유를 꺼내 보여준다', async () => {
    mockUpstream(() => ({ status: 403, body: KEY_ERROR }));
    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    assert.equal(res.status, 502);
    const { error } = await res.json();
    assert.match(error, /등록되지 않은 서비스키/);
    assert.doesNotMatch(error, /^업스트림 HTTP/, '상태코드만 덤프하면 원인을 모른다');
});

test('오류 응답은 캐시에 남기지 않는다', async () => {
    let puts = 0;
    const real = globalThis.caches;
    globalThis.caches = { default: { match: async () => undefined, put: async () => { puts++; } } };

    mockUpstream(() => ({ body: KEY_ERROR }));
    await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    assert.equal(puts, 0, '오류를 캐시하면 10분간 계속 실패한다');

    mockUpstream(() => ({ body: envelope([REC_SIGN]) }));
    await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    assert.equal(puts, 1, '정상 응답은 캐시해야 한다');

    globalThis.caches = real;
});

/* 아래는 실제 응답을 확인한 뒤 맞춘 매핑이다.
 * 추측으로 넣었던 필드가 전부 빈 값으로 들어오던 것을 잡고 나서 추가했다. */

test('목록에 실제로 있는 필드로 정규화한다', async () => {
    mockUpstream(() => ({ body: envelope([REC_SIGN]) }));
    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    const r = (await res.json()).items[0];

    assert.equal(r.industry, '광고물', '물품은 세부품명이 업종 자리를 채운다');
    assert.equal(r.spec, '알루미늄 복합판 3T');
    assert.equal(r.qty, 12);
    assert.equal(r.unit, '개');
    assert.equal(r.method, '제한경쟁', '계약방법');
    assert.equal(r.bidMethod, '적격심사', '낙찰방법은 계약방법과 다른 항목이다');
    assert.equal(r.regionLimit, '본사소재지');
    assert.equal(r.industryLimit, true);
    assert.equal(r.officer, '김담당');
    assert.equal(r.officerTel, '031-000-0000');
    assert.equal(r.briefingPlace, '○○초등학교 본관');
    assert.equal(r.prdprcTotal, 15, '예비가격 개수는 투찰금액 계산에 쓴다');
    assert.equal(r.prdprcDrawn, 4);
});

test('공사는 주공종명이 업종 자리를 채운다', async () => {
    const cnstwk = {
        ...REC_SIGN,
        bidNtceNo: '20260900777',
        bidNtceNm: '체육공원 사인탑 신설공사',
        dtilPrdctClsfcNoNm: undefined,
        mainCnsttyNm: '금속구조물창호공사',
        cnstrtsiteRgnNm: '강원특별자치도 평창군',
    };
    mockUpstream(() => ({ body: envelope([cnstwk]) }));
    const res = await worker.fetch(req('kind=cnstwk&from=20260920&to=20260923'), ENV);
    const r = (await res.json()).items[0];
    assert.equal(r.industry, '금속구조물창호공사');
    assert.equal(r.regions, '강원특별자치도 평창군', '공사는 현장지역이 들어온다');
});

test('지역 필터가 기관명도 본다', async () => {
    // 목록 API 에 참가가능지역이 없어서, 물품 공고는 기관명 말고는 단서가 없다.
    mockUpstream(() => ({ body: envelope([REC_SIGN]) }));
    let res = await worker.fetch(req('kind=thng&region=경기&from=20260920&to=20260923'), ENV);
    assert.equal((await res.json()).count, 1, '경기도교육청 → 경기로 걸려야 한다');

    mockUpstream(() => ({ body: envelope([REC_SIGN]) }));
    res = await worker.fetch(req('kind=thng&region=제주&from=20260920&to=20260923'), ENV);
    assert.equal((await res.json()).count, 0);
});
