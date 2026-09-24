/* bid-docs.js — 입찰 서류 목록과 발급처
 *
 * 공고 상세의 '투찰 준비'와 입찰 가이드(guide.html), 상시 준비 화면이
 * 함께 쓴다. 링크는 2026-09-23 에 브라우저로 직접 열어 확인했다.
 * (mainbiz.go.kr 은 도메인이 없어졌고 메인비즈협회는 mainbiz.or.kr 이다)
 *
 * 서류를 두 갈래로 나눈다.
 *
 *   standing  회사 단위로 한 번 갖춰두면 공고마다 다시 준비할 필요가 없는 것.
 *             인증서, 각종 확인서처럼 유효기간만 관리하면 되는 것들이다.
 *             products.html 의 '상시 준비'에서 한 번 체크한다.
 *
 *   공고별     공고마다 새로 만들거나 제출해야 하는 것. 입찰서, 산출내역서,
 *             보증금처럼 건별로 달라진다.
 *
 * 매 공고에서 17가지를 전부 다시 확인하게 하면 결국 체크리스트를 형식적으로
 * 넘기게 된다. 공고마다 달라지는 것만 남겨야 실제로 본다.
 */

var BID_DOC_SOURCES = {
    g2b:     { name: '나라장터',                    url: 'https://www.g2b.go.kr' },
    smpp:    { name: '중소기업제품 공공구매 종합정보망', url: 'https://www.smpp.go.kr' },
    smes:    { name: '중소벤처24',                  url: 'https://portal.smes.go.kr/home' },
    wbiz:    { name: 'Wbiz 여성기업 종합정보 포털',   url: 'https://www.wbiz.or.kr' },
    mainbiz: { name: '메인비즈협회',                 url: 'https://www.mainbiz.or.kr' },
    rnd:     { name: '기업부설연구소 신고관리시스템',   url: 'https://www.rnd.or.kr' },
    nice:    { name: '나이스디앤비 (신용평가)',       url: 'https://www.nicednb.com' },
    hometax: { name: '국세청 홈택스',                url: 'https://www.hometax.go.kr' },
    wetax:   { name: '위택스',                      url: 'https://www.wetax.go.kr' },
    iros:    { name: '인터넷등기소',                 url: 'https://www.iros.go.kr' },
    sgic:    { name: '서울보증보험',                 url: 'https://www.sgic.co.kr' },
    gov24:   { name: '정부24',                      url: 'https://www.gov.kr' },
};

/* 단계
 *   bid       투찰할 때
 *   qual      적격심사 (낙찰후보자가 된 뒤)
 *   contract  계약할 때
 *
 * kinds     해당 업무구분에서만 필요 (없으면 전부)
 * onlyIf    'adequacy' = 낙찰방법이 적격심사인 공고에서만
 * gain      신인도 가점용 — 자격이 있어도 내야 점수가 붙는다
 * standing  회사 단위로 한 번 갖춰두면 되는 것
 */
var BID_STAGES = [
    { key: 'bid',      title: '투찰할 때',                  note: '마감 전에 나라장터에서 제출합니다.' },
    { key: 'qual',     title: '적격심사 (낙찰후보자가 된 뒤)', note: '보통 통보일부터 7일 이내. 공고문에서 기한을 확인하세요.' },
    { key: 'contract', title: '계약할 때',                  note: '낙찰 후 계약 체결 전에 준비합니다.' },
];

var BID_DOCUMENTS = [
    /* ── 투찰 ── */
    {
        key: 'd_bidform', stage: 'bid', name: '입찰서',
        source: 'g2b', note: '나라장터에서 전자로 작성·제출합니다.',
    },
    {
        key: 'd_clean', stage: 'bid', name: '청렴계약 이행서약서',
        source: 'g2b', note: '투찰 과정에서 전자 동의합니다.',
    },
    {
        key: 'd_bidbond', stage: 'bid', name: '입찰보증금',
        source: 'sgic',
        note: '보통 지급각서로 갈음됩니다. 공고가 보증보험증권을 요구하면 입찰금액의 5%.',
    },
    {
        key: 'd_calc', stage: 'bid', name: '산출내역서',
        kinds: ['cnstwk'],
        note: '공사는 미제출 시 무효인 경우가 많습니다.',
    },

    /* ── 적격심사 ── */
    {
        key: 'd_qualform', stage: 'qual', name: '적격심사 신청서',
        source: 'g2b', onlyIf: 'adequacy',
        note: '낙찰후보자로 통보되면 기한 안에 제출합니다.',
    },
    {
        key: 'd_perf', stage: 'qual', name: '납품실적증명서',
        onlyIf: 'adequacy',
        note: '이행실적 평가. 수요기관에서 받거나 계약 건별로 모아둡니다.',
    },
    {
        key: 'd_credit', stage: 'qual', name: '신용평가등급확인서',
        source: 'nice', onlyIf: 'adequacy', standing: true,
        note: '경영상태 평가. 보통 1년 단위로 갱신합니다.',
    },
    {
        key: 'd_direct', stage: 'qual', name: '직접생산확인증명서',
        source: 'smpp', kinds: ['thng'], standing: true,
        note: '등록 품목의 유효기간이 살아 있어야 합니다.',
    },
    {
        key: 'd_sme', stage: 'qual', name: '중소기업 확인서',
        source: 'smes', standing: true,
        note: '중소기업자간 경쟁제품 입찰에 필요합니다.',
    },
    {
        key: 'd_women', stage: 'qual', name: '여성기업 확인서',
        source: 'wbiz', gain: true, standing: true,
        note: '신인도 가점. 여성기업 제한경쟁 공고 참가에도 씁니다.',
    },
    {
        key: 'd_mainbiz', stage: 'qual', name: '메인비즈 확인서',
        source: 'mainbiz', gain: true, standing: true,
        note: '신인도 가점. 경영혁신형 중소기업 확인서입니다.',
    },
    {
        key: 'd_rnd', stage: 'qual', name: '기업부설연구소 인정서',
        source: 'rnd', gain: true, standing: true,
        note: '신인도 가점. 기업부설 디자인연구소 인정서.',
    },

    /* ── 계약 ── */
    {
        key: 'd_contbond', stage: 'contract', name: '계약보증금 (보증보험증권)',
        source: 'sgic', note: '보통 계약금액의 10%. 낙찰 후 건별로 발급합니다.',
    },
    {
        key: 'd_cleanpledge', stage: 'contract', name: '청렴계약 이행각서',
        source: 'g2b', note: '계약 체결 시 제출.',
    },
    {
        key: 'd_seal', stage: 'contract', name: '법인인감증명서',
        source: 'iros', standing: true,
        note: '발급 후 3개월 이내를 요구하는 경우가 많습니다.',
    },
    {
        key: 'd_usedseal', stage: 'contract', name: '사용인감계',
        standing: true,
        note: '법인인감 대신 사용인감을 쓸 때 함께 냅니다.',
    },
    {
        key: 'd_taxnat', stage: 'contract', name: '국세 납세증명서',
        source: 'hometax', standing: true,
        note: '유효기간이 짧습니다(보통 30일). 체납이 있으면 계약이 막힙니다.',
    },
    {
        key: 'd_taxloc', stage: 'contract', name: '지방세 납세증명서',
        source: 'wetax', standing: true,
        note: '유효기간이 짧습니다. 위택스에서 발급.',
    },
];

/* 서류는 아니지만 공고마다 다시 할 필요 없는 것들.
 * 한 번 갖춰두고 만료일만 보면 된다. */
var BID_STANDING_EXTRA = [
    {
        key: 's_cert_corp', name: '사업자용 공동인증서',
        note: '입찰용으로 등록되어 있어야 합니다. 만료일을 확인하세요.',
    },
    {
        key: 's_cert_person', name: '개인용 인증서 (투찰 담당자)',
        note: '2024년 1월부터 지문보안토큰 없이 사업자용 + 개인용 조합으로 투찰합니다.',
    },
    {
        key: 's_secmod', name: '나라장터 보안모듈', source: 'g2b',
        note: '투찰할 PC 에 미리 깔아두고 로그인까지 되는지 확인하세요.',
    },
    {
        key: 's_bidreg', name: '입찰참가자격 등록', source: 'g2b',
        note: '등록 품목의 유효기간이 지나면 그 품명으로는 투찰할 수 없습니다.',
        link: 'products.html',
    },
];

/* 이 공고에 실제로 필요한 서류만 골라낸다.
 * 필요 없는 것까지 늘어놓으면 목록을 안 보게 된다. */
function bidDocsFor(rec) {
    var isAdequacy = /적격심사/.test((rec && rec.bidMethod) || '');
    return BID_DOCUMENTS.filter(function(d) {
        if (d.kinds && d.kinds.indexOf(rec && rec.kind) === -1) return false;
        if (d.onlyIf === 'adequacy' && !isAdequacy) return false;
        return true;
    });
}

/* 공고마다 새로 준비해야 하는 것만 */
function bidDocsPerBid(rec) {
    return bidDocsFor(rec).filter(function(d) { return !d.standing; });
}

/* 회사 단위로 한 번 갖춰두면 되는 것만 */
function bidDocsStanding(rec) {
    return bidDocsFor(rec).filter(function(d) { return d.standing; });
}

/* 상시 준비 화면에 늘어놓을 전체 목록 (서류 + 그 밖의 것) */
function bidStandingAll() {
    return BID_STANDING_EXTRA.concat(
        BID_DOCUMENTS.filter(function(d) { return d.standing; })
    );
}

function bidDocSource(d) {
    return d.source ? BID_DOC_SOURCES[d.source] : null;
}
