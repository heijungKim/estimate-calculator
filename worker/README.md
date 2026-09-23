# 나라장터 입찰공고 프록시

`bid.html` 이 나라장터 입찰공고 API 를 부르기 위한 중계 서버입니다.
이 디렉터리는 GitHub Pages 로 배포되지 않습니다 (배포 워크플로가 루트의
`*.html *.css *.js` 와 `lib/` 만 복사합니다).

## 왜 필요한가

- `apis.data.go.kr` 은 CORS 헤더를 주지 않습니다. 브라우저에서 직접 부르면 차단됩니다.
- 이 저장소는 Pages 배포용 공개 저장소입니다. 서비스키를 JS 에 넣으면 누구나
  긁어서 일일 호출 한도를 태울 수 있습니다. 키는 Worker 시크릿에만 둡니다.
- 물품·공사를 한 번에 훑어 중복 제거와 정규화까지 해두면 화면 쪽이
  API 응답 필드 변경에 덜 흔들립니다.

---

## 0. 키부터 확인 (Cloudflare 없이, 1분)

배포 전에 키가 실제로 동작하는지 먼저 봅니다. 활용신청 직후에는 키가
아직 활성화되지 않아 실패하는 경우가 흔합니다 (보통 30분~1시간).

Windows PowerShell:

```powershell
$env:G2B_SERVICE_KEY = "여기에 Decoding 키"
node tools/probe-g2b.js --key
```

Git Bash / macOS / Linux:

```bash
G2B_SERVICE_KEY='여기에 Decoding 키' node tools/probe-g2b.js --key
```

오퍼레이션별로 `OK` 가 뜨고 필드 점검표가 나오면 준비 완료입니다.
`SERVICE_KEY_IS_NOT_REGISTERED_ERROR` 가 뜨면 아직 활성화 전이니 조금 기다렸다 다시 하세요.

> **Decoding 키**를 써야 합니다. 인코딩된 키를 넣으면 한 번 더 인코딩되어 인증에 실패합니다.
> 포털 마이페이지 → 개발계정 → 상세보기에서 두 가지가 나란히 보입니다.

---

## 1. 서비스키 발급

1. <https://www.data.go.kr> 회원가입
2. **조달청_나라장터 입찰공고정보서비스** 활용신청
   → <https://www.data.go.kr/data/15129394/openapi.do>
3. 마이페이지 → 개발계정 → **일반 인증키 (Decoding)** 복사

개발계정은 신청 즉시 승인되지만 일일 호출 한도가 작습니다(보통 1,000회).
매일 쓰시려면 **운영계정**도 함께 신청해 두세요.

## 2. Cloudflare 계정

<https://dash.cloudflare.com/sign-up> — 무료 플랜이면 충분합니다
(Workers 무료 한도: 하루 10만 요청). 카드 등록 필요 없습니다.

## 3. 배포

```bash
cd worker
npm install              # wrangler 설치
npx wrangler login       # 브라우저가 열리면 Allow
npx wrangler secret put G2B_SERVICE_KEY   # Decoding 키 붙여넣기
npx wrangler deploy
```

`wrangler login` 은 브라우저를 띄워 Cloudflare 로그인을 요구합니다.
`deploy` 를 처음 하면 `<계정명>.workers.dev` 서브도메인을 만들라고 물어볼 수 있습니다. 아무 이름이나 정하면 됩니다.

끝나면 `https://g2b-proxy.<계정명>.workers.dev` 형태의 주소가 출력됩니다.

### 로컬에서 먼저 돌려보려면

```bash
cd worker
echo 'G2B_SERVICE_KEY=여기에키' > .dev.vars   # .gitignore 에 있음
npx wrangler dev
```

`http://localhost:8787/health` 로 확인합니다.
`wrangler.toml` 의 `ALLOWED_ORIGINS` 에 `http://localhost:8080` 이 들어 있으니,
같은 포트로 정적 서버를 띄우면 `bid.html` 도 로컬에서 붙습니다.

## 4. 화면에 주소 알려주기

저장소 루트의 `bid-config.js` 에서 `BID_PROXY_BASE` 를 그 주소로 바꿉니다.

```js
var BID_PROXY_BASE = 'https://g2b-proxy.내계정.workers.dev';
```

`wrangler.toml` 의 `ALLOWED_ORIGINS` 에 Pages 주소가 들어 있는지도 확인하세요.
바꿨으면 다시 `npx wrangler deploy`.

## 5. 확인

```bash
curl https://g2b-proxy.내계정.workers.dev/health
# {"ok":true,"hasKey":true}

node tools/probe-g2b.js https://g2b-proxy.내계정.workers.dev
```

---

## 엔드포인트

| | |
|---|---|
| `GET /health` | 살아있는지, 키가 설정됐는지 |
| `GET /bids` | 공고 목록 (정규화·중복 제거·마감 임박순 정렬) |

`/bids` 쿼리 파라미터

| 이름 | 기본값 | 설명 |
|---|---|---|
| `kind` | `thng,cnstwk` | 업무구분. `thng` 물품 / `cnstwk` 공사 / `servc` 용역 |
| `from` `to` | 최근 7일 | `YYYYMMDD`. 최대 31일 |
| `keywords` | 없음 | 콤마 구분. 공고명·업종에 부분일치 |
| `region` | 없음 | 참가가능지역 부분일치 |
| `minPrice` `maxPrice` | 없음 | 추정가격 범위 |
| `debug` | `0` | `1` 이면 각 건에 업스트림 원본(`_raw`) 포함 |

## 호출 한도 관리

- 업스트림 페이지는 10분간 캐시됩니다. 같은 조건 재조회는 한도를 쓰지 않습니다.
- 키워드는 Worker 안에서 걸러냅니다. 키워드마다 업스트림을 따로 부르면
  호출 수가 키워드 개수만큼 불어나기 때문입니다.
- 업무구분당 최대 20페이지(약 2만 건)까지만 가져옵니다. 잘렸으면 응답의
  `meta.truncated` 가 `true` 로 옵니다. 그때는 조회 기간을 좁히세요.
- 실제 소모량은 응답의 `meta.upstreamCalls` 로 확인할 수 있습니다.

## 자주 걸리는 것

| 증상 | 원인 |
|---|---|
| `SERVICE_KEY_IS_NOT_REGISTERED_ERROR` | 키 활성화 전(30분~1시간) 또는 인코딩 키를 넣음 |
| `LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR` | 일일 한도 초과. 운영계정 신청 |
| 화면에 "중계 서버에 닿지 못했습니다" | `BID_PROXY_BASE` 오타 또는 `ALLOWED_ORIGINS` 에 Pages 주소 누락 |
| 필드가 비어 보임 | 조달청이 필드명을 바꿨을 수 있음. `probe-g2b.js` 로 확인 후 `normalize()` 수정 |
