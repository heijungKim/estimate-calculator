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

/* 화면에서 더 좁히고 싶을 때 쓰는 키워드. 기본은 비어 있다 —
 * 수집 단계에서 이미 입찰참가자격 등록물품 기준으로 걸러내므로
 * 여기서 또 거르면 정작 볼 공고가 가려진다. */
var BID_DEFAULT_KEYWORDS = [];

// 기본 조회 업무구분. 등록분야가 물품·용역이라 공사는 뺀다.
var BID_DEFAULT_KINDS = ['thng', 'servc'];

// 기본 조회 기간 (일)
var BID_DEFAULT_DAYS = 7;

// 마감 임박으로 표시할 기준 (시간)
var BID_URGENT_HOURS = 48;
