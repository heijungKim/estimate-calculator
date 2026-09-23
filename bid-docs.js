/* bid-docs.js — 입찰 서류 목록과 발급처
 *
 * 공고 상세의 '서류 준비'와 입찰 가이드(guide.html)가 함께 쓴다.
 * 링크는 2026-09-23 에 브라우저로 직접 열어 확인했다.
 * (mainbiz.go.kr 은 도메인이 없어졌고 메인비즈협회는 mainbiz.or.kr 이다)
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
 * kinds   해당 업무구분에서만 필요 (없으면 전부)
 * onlyIf  'adequacy' = 낙찰방법이 적격심사인 공고에서만
 * gain    신인도 가점용 — 자격이 있어도 내야 점수가 붙는다
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
        key: 'd_credit', stage: 'qual', name: '신용평가등급확인서',
        source: 'nice', onlyIf: 'adequacy',
        note: '경영상태 평가에 쓰입니다. 발급에 며칠 걸리니 미리 받아두세요.',
    },
    {
        key: 'd_perf', stage: 'qual', name: '납품실적증명서',
        onlyIf: 'adequacy',
        note: '이행실적 평가. 수요기관에서 받거나 계약 건별로 모아둡니다.',
    },
    {
        key: 'd_direct', stage: 'qual', name: '직접생산확인증명서',
        source: 'smpp', kinds: ['thng'],
        note: '등록 품목의 유효기간이 살아 있어야 합니다.',
    },
    {
        key: 'd_sme', stage: 'qual', name: '중소기업 확인서',
        source: 'smes',
        note: '중소기업자간 경쟁제품 입찰에 필요합니다.',
    },
    {
        key: 'd_women', stage: 'qual', name: '여성기업 확인서',
        source: 'wbiz', gain: true,
        note: '신인도 가점. 여성기업 제한경쟁 공고 참가에도 씁니다.',
    },
    {
        key: 'd_mainbiz', stage: 'qual', name: '메인비즈 확인서',
        source: 'mainbiz', gain: true,
        note: '신인도 가점. 경영혁신형 중소기업 확인서입니다.',
    },
    {
        key: 'd_rnd', stage: 'qual', name: '기업부설연구소 인정서',
        source: 'rnd', gain: true,
        note: '신인도 가점. 기업부설 디자인연구소 인정서.',
    },

    /* ── 계약 ── */
    {
        key: 'd_contbond', stage: 'contract', name: '계약보증금 (보증보험증권)',
        source: 'sgic', note: '보통 계약금액의 10%.',
    },
    {
        key: 'd_seal', stage: 'contract', name: '법인인감증명서',
        source: 'iros', note: '인터넷등기소에서 발급.',
    },
    {
        key: 'd_usedseal', stage: 'contract', name: '사용인감계',
        note: '법인인감 대신 사용인감을 쓸 때 함께 냅니다.',
    },
    {
        key: 'd_taxnat', stage: 'contract', name: '국세 납세증명서',
        source: 'hometax', note: '체납이 있으면 계약이 막힙니다.',
    },
    {
        key: 'd_taxloc', stage: 'contract', name: '지방세 납세증명서',
        source: 'wetax', note: '위택스에서 발급.',
    },
    {
        key: 'd_cleanpledge', stage: 'contract', name: '청렴계약 이행각서',
        source: 'g2b', note: '계약 체결 시 제출.',
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

function bidDocSource(d) {
    return d.source ? BID_DOC_SOURCES[d.source] : null;
}
