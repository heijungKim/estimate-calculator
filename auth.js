// ── 인증 상수 ─────────────────────────────────────────────────
var _AUTH_KEY = 'ws_auth_v1';
var _AUTH_VAL = 'ok';

// ── 인증 확인 (각 페이지 최상단에서 호출) ──────────────────────
// 로그인 기능 비활성화: 항상 통과 처리
function wsCheckAuth() {
}

// ── 로그아웃 ─────────────────────────────────────────────────
function wsLogout() {
    localStorage.removeItem(_AUTH_KEY);
    sessionStorage.removeItem(_AUTH_KEY);
    location.replace('login.html');
}

wsCheckAuth();
