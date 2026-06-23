// ── 인증 상수 ─────────────────────────────────────────────────
var _AUTH_KEY = 'ws_auth_v1';
var _AUTH_VAL = 'ok';

// ── 인증 확인 (각 페이지 최상단에서 호출) ──────────────────────
function wsCheckAuth() {
    var ok = localStorage.getItem(_AUTH_KEY) === _AUTH_VAL ||
             sessionStorage.getItem(_AUTH_KEY) === _AUTH_VAL;
    if (!ok) {
        location.replace('login.html');
    }
}

// ── 로그아웃 ─────────────────────────────────────────────────
function wsLogout() {
    localStorage.removeItem(_AUTH_KEY);
    sessionStorage.removeItem(_AUTH_KEY);
    location.replace('login.html');
}

wsCheckAuth();
