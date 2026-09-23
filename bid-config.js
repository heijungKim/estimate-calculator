/* bid-config.js — 나라장터 입찰공고 조회 설정
 *
 * 서비스키는 여기에 적지 않는다. 이 파일은 공개 저장소에 그대로 올라가므로
 * 키를 넣으면 누구나 긁어서 일일 호출 한도를 태울 수 있다.
 * 키는 GitHub 저장소 시크릿(G2B_SERVICE_KEY)에만 둔다.
 */

/* ── 공고 데이터 출처 ──────────────────────────────────────────
 * GitHub Actions 가 1시간마다 공고를 받아 bid-data 브랜치에 올린다
 * (.github/workflows/fetch-bids.yml → tools/fetch-bids.mjs).
 * raw.githubusercontent.com 은 Access-Control-Allow-Origin: * 를 주므로
 * 브라우저가 중계 서버 없이 바로 읽을 수 있다.
 */
var BID_DATA_URL = 'https://raw.githubusercontent.com/heijungKim/estimate-calculator/bid-data/bids.json';

/* 선택 사항 — Cloudflare Worker 를 띄웠다면 그 주소를 넣는다.
 * 넣으면 화면에서 조건을 바꿀 때마다 실시간으로 조회한다(worker/README.md).
 * 비워두면 위 BID_DATA_URL 을 쓴다. 둘 다 비면 예시 데이터로 동작한다. */
var BID_PROXY_BASE = '';

// 기본 검색 키워드. 공고명·업종에 하나라도 걸리면 목록에 남는다.
// 화면에서 수정할 수 있고, 수정하면 이 브라우저에 기억된다.
var BID_DEFAULT_KEYWORDS = [
    '간판', '사인', '현수막', '실사출력', 'LED',
    '배너', '표지판', '안내판', '시트', '스카시',
    '채널문자', '옥외광고', '광고물',
];

// 기본 조회 업무구분 — 물품, 공사
var BID_DEFAULT_KINDS = ['thng', 'cnstwk'];

// 기본 조회 기간 (일)
var BID_DEFAULT_DAYS = 7;

// 마감 임박으로 표시할 기준 (시간)
var BID_URGENT_HOURS = 48;
