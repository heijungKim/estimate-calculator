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
        // 공고번호를 달리한다. 같은 번호의 차수 여러 개는 한 건으로 합쳐지므로
        // 페이지 이어받기 시험이 성립하지 않는다.
        return { body: envelope(
            Array.from({ length: 999 }, (_, i) => ({ ...REC_SIGN, bidNtceNo: `P${page}-${i}` })),
            1998) };
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

test('같은 공고의 여러 차수는 마지막 것만 남긴다', async () => {
    // 원공고(000)와 변경공고(001)가 함께 온다. 둘 다 남기면 같은 공고가
    // 목록에 두 번 나온다. 실제 수집분에서 18쌍이 이렇게 겹쳐 있었다.
    const v0 = { ...REC_SIGN, bidNtceOrd: '000', bidNtceDt: '2026-09-17 14:25:13' };
    const v1 = { ...REC_SIGN, bidNtceOrd: '001', bidNtceDt: '2026-09-17 17:40:43' };
    mockUpstream(() => ({ body: envelope([v0, v1]) }));

    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    const j = await res.json();
    assert.equal(j.count, 1);
    assert.equal(j.items[0].ord, '001', '나중 차수가 유효한 공고다');
    assert.equal(j.items[0].noticeAt, '2026-09-17 17:40:43');
});

test('차수가 역순으로 와도 마지막 것을 고른다', async () => {
    const v2 = { ...REC_SIGN, bidNtceOrd: '002' };
    const v0 = { ...REC_SIGN, bidNtceOrd: '000' };
    mockUpstream(() => ({ body: envelope([v2, v0]) }));
    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    const j = await res.json();
    assert.equal(j.count, 1);
    assert.equal(j.items[0].ord, '002');
});

test('공고번호가 다르면 이름이 같아도 각각 남긴다', async () => {
    // 재공고는 별개의 입찰이다. 이름이 같다고 합치면 안 된다.
    const a = { ...REC_SIGN, bidNtceNo: 'R26BK01719586' };
    const b = { ...REC_SIGN, bidNtceNo: 'R26BK01723966' };
    mockUpstream(() => ({ body: envelope([a, b]) }));
    const res = await worker.fetch(req('kind=thng&from=20260920&to=20260923'), ENV);
    assert.equal((await res.json()).count, 2);
});

/* ── 입찰참가자격 등록 내용으로 관련 공고 가리기 ──────────────
 * 키워드만으로 걸렀더니 'LED'로 조명등이, '시트'로 방수시트가,
 * '인쇄'로 인쇄기가 딸려 들어왔다. 세부품명번호가 맞으면 실제로
 * 투찰할 수 있는 건이라는 뜻이라 확실성이 다르다. */

const { classifyRelevance } = await import('../tools/g2b-core.mjs');
const { COMPANY } = await import('../tools/company.mjs');

const TODAY = new Date('2026-09-23T00:00:00');
const rec = (o) => ({ name: '', industry: '', spec: '', productCode: '', ...o });

test('등록물품과 품명번호가 맞으면 registered', () => {
    const r = rec({ productCode: '5512190401', name: '○○초 간판 제작설치' });
    assert.equal(classifyRelevance(r, COMPANY, TODAY), 'registered');
});

test('등록유효기간이 지난 품명은 expired', () => {
    // 스티커(5512161202)는 등록이 2018-12-31 로 끝나 있다
    const r = rec({ productCode: '5512161202', name: '홍보 스티커 제작' });
    assert.equal(classifyRelevance(r, COMPANY, TODAY), 'expired');
});

test('같은 품명군이면 group', () => {
    // 55121904 군이지만 등록번호(…0401)는 아님
    const r = rec({ productCode: '5512190499', name: '무언가' });
    assert.equal(classifyRelevance(r, COMPANY, TODAY), 'group');
});

test('품명번호가 없어도 공고명이 우리 일이면 keyword', () => {
    const r = rec({ name: '청사 현수막 게시대 설치' });
    assert.equal(classifyRelevance(r, COMPANY, TODAY), 'keyword');
});

test('제외어에 걸리면 버린다', () => {
    // 실제 수집분에서 딸려 들어왔던 것들
    for (const name of [
        'LED실내조명등 구매',
        'LED터널용등기구 구입',
        '풀로터리인쇄기 구매의건',
        '옥상 방수시트 방수공사',
        'AX 스프린트 실증용 GPU 서버 구매',
    ]) {
        assert.equal(classifyRelevance(rec({ name }), COMPANY, TODAY), null, name);
    }
});

test('제외어가 있어도 품명번호가 맞으면 남긴다', () => {
    // 'LED 간판'처럼 등록물품이 확실한 건은 이름에 뭐가 섞여도 버리면 안 된다
    const r = rec({ productCode: '5512190401', name: 'LED조명등 및 간판 교체' });
    assert.equal(classifyRelevance(r, COMPANY, TODAY), 'registered');
});

test('아무 데도 안 걸리면 null', () => {
    assert.equal(classifyRelevance(rec({ name: '급식실 주방기구 구매' }), COMPANY, TODAY), null);
});

test('등록분야에 공사가 없다', () => {
    // 등록증에 공사 체크가 없고 업종 목록도 비어 있어 투찰 자체가 불가능하다
    assert.equal(COMPANY.fields.cnstwk, false);
    assert.equal(COMPANY.fields.thng, true);
    assert.equal(COMPANY.fields.servc, true);
});

test('company.json 의 품명 날짜가 모두 읽히는 형식이다', () => {
    for (const p of COMPANY.products) {
        assert.match(p.code, /^\d{10}$/, p.name + ' 품명번호');
        for (const f of ['regStart', 'regEnd', 'certStart', 'certEnd']) {
            assert.match(p[f], /^\d{4}-\d{2}-\d{2}$/, `${p.name}.${f}`);
        }
        assert.ok(new Date(p.regEnd) >= new Date(p.regStart), p.name + ' 기간 역전');
    }
});

test('products.html 이 참조하는 로컬 파일이 모두 있다', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const url = await import('node:url');
    const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
    const html = fs.readFileSync(path.join(root, 'products.html'), 'utf8');
    let checked = 0;
    for (const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
        if (/^https?:/.test(m[1])) continue;
        assert.ok(fs.existsSync(path.join(root, m[1])), m[1] + ' 없음');
        checked++;
    }
    assert.ok(checked >= 5, '검사된 로컬 참조가 너무 적다: ' + checked);
});

/* ── 서류 목록 (bid-docs.js) ──────────────────────────────────
 * 브라우저용 스크립트라 eval 로 올려 쓴다. */
const DOCS_SRC = await (async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const url = await import('node:url');
    const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
    return fs.readFileSync(path.join(root, 'bid-docs.js'), 'utf8');
})();

const docsEnv = {};
new Function('g', DOCS_SRC + `
    g.BID_DOCUMENTS = BID_DOCUMENTS;
    g.BID_DOC_SOURCES = BID_DOC_SOURCES;
    g.BID_STAGES = BID_STAGES;
    g.bidDocsFor = bidDocsFor;
    g.bidDocSource = bidDocSource;
`)(docsEnv);

test('적격심사 공고는 적격심사 서류가 붙는다', () => {
    const docs = docsEnv.bidDocsFor({ kind: 'thng', bidMethod: '적격심사' });
    const names = docs.map(d => d.name);
    assert.ok(names.includes('적격심사 신청서'));
    assert.ok(names.includes('신용평가등급확인서'));
    assert.ok(names.includes('여성기업 확인서'), '가점 서류도 포함');
});

test('수의계약 공고는 적격심사 서류를 빼고 준다', () => {
    // 필요 없는 서류까지 늘어놓으면 목록 자체를 안 보게 된다
    const docs = docsEnv.bidDocsFor({ kind: 'thng', bidMethod: '수의시담' });
    const names = docs.map(d => d.name);
    assert.ok(!names.includes('적격심사 신청서'));
    assert.ok(!names.includes('신용평가등급확인서'));
    assert.ok(names.includes('입찰서'), '투찰 서류는 그대로');
});

test('산출내역서는 공사에만 붙는다', () => {
    const thng = docsEnv.bidDocsFor({ kind: 'thng', bidMethod: '적격심사' }).map(d => d.name);
    const cnst = docsEnv.bidDocsFor({ kind: 'cnstwk', bidMethod: '적격심사' }).map(d => d.name);
    assert.ok(!thng.includes('산출내역서'));
    assert.ok(cnst.includes('산출내역서'));
});

test('직접생산확인증명서는 물품에만 붙는다', () => {
    const thng = docsEnv.bidDocsFor({ kind: 'thng', bidMethod: '적격심사' }).map(d => d.name);
    const servc = docsEnv.bidDocsFor({ kind: 'servc', bidMethod: '적격심사' }).map(d => d.name);
    assert.ok(thng.includes('직접생산확인증명서'));
    assert.ok(!servc.includes('직접생산확인증명서'));
});

test('모든 서류의 발급처가 실재하고 주소가 https 다', () => {
    for (const d of docsEnv.BID_DOCUMENTS) {
        assert.ok(d.key && d.name && d.stage, '서류에 key/name/stage 필요: ' + d.name);
        assert.ok(docsEnv.BID_STAGES.some(s => s.key === d.stage), d.name + ' 의 stage 가 이상함');
        if (!d.source) continue;
        const src = docsEnv.BID_DOC_SOURCES[d.source];
        assert.ok(src, d.name + ' 의 발급처 키가 없음: ' + d.source);
        assert.match(src.url, /^https:\/\//, src.name + ' 주소');
    }
});

test('서류 키가 겹치지 않는다', () => {
    // 키가 겹치면 체크 상태가 서로 덮어쓴다
    const keys = docsEnv.BID_DOCUMENTS.map(d => d.key);
    assert.equal(new Set(keys).size, keys.length);
});

test('guide.html 이 참조하는 로컬 파일이 모두 있다', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const url = await import('node:url');
    const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
    const html = fs.readFileSync(path.join(root, 'guide.html'), 'utf8');
    let checked = 0;
    for (const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
        if (/^https?:/.test(m[1])) continue;
        assert.ok(fs.existsSync(path.join(root, m[1])), m[1] + ' 없음');
        checked++;
    }
    assert.ok(checked >= 5, '검사된 로컬 참조가 너무 적다: ' + checked);
});

/* ── 투찰금액 산정 (bid-calc.js) ──────────────────────────────
 * 여기가 틀리면 금액이 틀린다. 이론식을 몬테카를로로 대조한다.
 * 처음에 유한모집단 보정을 넣었다가 실측과 어긋나 잡았다 — 예비가격
 * 15개 자체가 우리가 모르는 확률변수라 보정이 들어가면 안 된다. */
const CALC_SRC = await (async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const url = await import('node:url');
    const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
    return fs.readFileSync(path.join(root, 'bid-calc.js'), 'utf8');
})();

const calc = {};
new Function('g', CALC_SRC + `
    g.bidPrceSigma = bidPrceSigma;
    g.normalCdf = normalCdf;
    g.bidValidProbability = bidValidProbability;
    g.bidRateForProbability = bidRateForProbability;
    g.bidCalc = bidCalc;
    g.bidBaseFromEstimate = bidBaseFromEstimate;
`)(calc);

test('표준정규 누적분포가 알려진 값과 맞는다', () => {
    const known = [[0, 0.5], [1, 0.8413447], [1.96, 0.9750021], [-1, 0.1586553], [2.5758, 0.995]];
    for (const [z, want] of known) {
        assert.ok(Math.abs(calc.normalCdf(z) - want) < 1e-5, `Φ(${z})=${calc.normalCdf(z)}`);
    }
});

test('예정가격 표준편차가 몬테카를로와 맞는다', () => {
    // 예비가격 15개를 만들고 4개를 비복원으로 뽑아 평균낸다 — 실제 절차 그대로
    function simulate(spread, n) {
        let sum = 0, sq = 0;
        for (let i = 0; i < n; i++) {
            const pool = [];
            for (let k = 0; k < 15; k++) pool.push(1 + (Math.random() * 2 - 1) * spread);
            for (let k = pool.length - 1; k > 0; k--) {
                const j = Math.floor(Math.random() * (k + 1));
                [pool[k], pool[j]] = [pool[j], pool[k]];
            }
            const m = (pool[0] + pool[1] + pool[2] + pool[3]) / 4;
            sum += m; sq += m * m;
        }
        const mean = sum / n;
        return Math.sqrt(sq / n - mean * mean);
    }
    for (const spread of [0.02, 0.03]) {
        const got = simulate(spread, 200000);
        const theory = calc.bidPrceSigma(spread, 15, 4);
        const err = Math.abs(got - theory) / theory;
        assert.ok(err < 0.02, `±${spread * 100}%: 실측 ${got} vs 이론 ${theory} (오차 ${(err * 100).toFixed(1)}%)`);
    }
});

test('하한율 그대로 쓰면 유효확률이 절반이다', () => {
    // 예정가격이 기초금액을 중심으로 대칭이므로 정확히 50%
    const sig = calc.bidPrceSigma(0.02, 15, 4);
    const p = calc.bidValidProbability(0.87995, 0.87995, sig);
    assert.ok(Math.abs(p - 0.5) < 1e-6, String(p));
});

test('투찰률을 올리면 유효확률이 오른다', () => {
    const sig = calc.bidPrceSigma(0.02, 15, 4);
    let prev = 0;
    for (let d = -0.004; d <= 0.02; d += 0.001) {
        const p = calc.bidValidProbability(0.87995 + d, 0.87995, sig);
        assert.ok(p >= prev, '단조증가 깨짐');
        prev = p;
    }
});

test('목표 확률을 거꾸로 맞춘다', () => {
    const sig = calc.bidPrceSigma(0.02, 15, 4);
    for (const target of [0.5, 0.7, 0.9, 0.95, 0.99]) {
        const t = calc.bidRateForProbability(target, 0.87995, sig);
        const back = calc.bidValidProbability(t, 0.87995, sig);
        assert.ok(Math.abs(back - target) < 1e-4, `목표 ${target} → ${back}`);
    }
});

test('변동폭이 넓으면 같은 확률을 맞추는 데 더 올려 써야 한다', () => {
    const t2 = calc.bidRateForProbability(0.9, 0.87995, calc.bidPrceSigma(0.02, 15, 4));
    const t3 = calc.bidRateForProbability(0.9, 0.87995, calc.bidPrceSigma(0.03, 15, 4));
    assert.ok(t3 > t2, '±3% 쪽이 더 높아야 한다');
});

test('원가를 밑돌면 원가선까지 올려 권한다', () => {
    // 낙찰받고 적자를 보는 것이 무효보다 나쁘다
    const base = 20000000;
    const r = calc.bidCalc({ base, rate: 0.87995, spread: 0.02, cost: 19500000 });
    assert.ok(r.recommend.amount >= 19500000, '원가 위여야 한다: ' + r.recommend.amount);
    assert.match(r.recommend.reason, /원가선/);
});

test('원가가 낮으면 목표 확률 지점을 권한다', () => {
    const r = calc.bidCalc({ base: 20000000, rate: 0.87995, spread: 0.02, cost: 12000000, target: 0.9 });
    // 표와 같은 0.1%p 격자로 올려 맞추므로 목표를 살짝 넘을 수 있다
    assert.ok(r.recommend.valid >= 0.9, String(r.recommend.valid));
    assert.ok(r.recommend.valid < 0.93, '너무 많이 넘으면 격자 정렬이 잘못된 것');
    assert.equal(r.recommend.reason, null, '원가가 안 물리면 사유를 붙이지 않는다');
    assert.ok(r.recommend.margin > 0);
});

test('기초금액이나 하한율이 없으면 계산하지 않는다', () => {
    assert.equal(calc.bidCalc({ base: 0, rate: 0.88 }), null);
    assert.equal(calc.bidCalc({ base: 1000, rate: 0 }), null, '수의계약처럼 하한율이 없으면 null');
});

test('추정가격에서 기초금액을 어림한다 (부가세 별도)', () => {
    assert.equal(calc.bidBaseFromEstimate(18400000), 20240000);
    assert.equal(calc.bidBaseFromEstimate(0), null);
});

test('권장 투찰률이 표와 같은 0.1%p 격자에 맞는다', () => {
    // 권장 금액과 표의 강조 행이 어긋나면 어느 쪽을 믿어야 할지 헷갈린다
    const rate = 0.87995;
    for (const target of [0.7, 0.8, 0.9, 0.95, 0.99]) {
        const r = calc.bidCalc({ base: 20240000, rate, spread: 0.02, target });
        const steps = (r.recommend.t - rate) / 0.001;
        assert.ok(Math.abs(steps - Math.round(steps)) < 1e-6,
            `목표 ${target}: 투찰률 ${r.recommend.t} 가 격자에 안 맞음`);
        assert.ok(r.recommend.valid >= target, `목표 ${target} 미달: ${r.recommend.valid}`);
    }
});
