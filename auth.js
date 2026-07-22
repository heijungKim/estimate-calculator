// ── Firebase Auth 기반 인증 ───────────────────────────────────
// 이 파일은 jQuery 로드 후 · 각 페이지 스크립트 로드 전에 포함되어야 한다.
// 로그인 상태가 확정될 때까지 $.holdReady 로 페이지 초기화($(function(){}))를
// 붙잡아, Firestore 호출이 미인증 상태로 나가 permission-denied 되는 것을 막는다.

var WS_LOGIN_PAGE = 'login.html';

// 아이디만 입력했을 때 붙일 도메인 (Firebase 계정 이메일과 반드시 일치)
var WS_ID_DOMAIN = '@woosung.local';

function wsIdToEmail(id) {
    id = String(id || '').trim();
    return id.indexOf('@') > -1 ? id : (id + WS_ID_DOMAIN);
}

// Firebase 앱 초기화 (중복 초기화 방지)
function wsInitFirebase() {
    try {
        if (typeof firebase === 'undefined') return false;
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') return false;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        return true;
    } catch (e) { return false; }
}

// 현재 페이지가 로그인 페이지인가
function wsIsLoginPage() {
    var f = location.pathname.split('/').pop().toLowerCase();
    return f === WS_LOGIN_PAGE.toLowerCase();
}

// ── 인증 확인 ────────────────────────────────────────────────
function wsCheckAuth() {
    // 로그인 페이지는 자기 자신으로 리다이렉트하면 안 되므로 초기화만 한다
    if (wsIsLoginPage()) { wsInitFirebase(); return; }

    var ok = wsInitFirebase();

    // Firebase를 못 쓰는 상황이면 페이지를 잠그지 않고 그대로 진행
    if (!ok || !firebase.auth) return;

    if (window.jQuery) $.holdReady(true);
    var released = false;
    function release() {
        if (released) return;
        released = true;
        if (window.jQuery) $.holdReady(false);
    }

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            release();
        } else {
            // 미로그인: 원래 가려던 주소를 기억해 두고 로그인 페이지로
            try {
                sessionStorage.setItem('ws_redirect', location.pathname + location.search);
            } catch (e) {}
            location.replace(WS_LOGIN_PAGE);
        }
    }, function() {
        // 인증 조회 자체가 실패해도 페이지가 영구히 멈추지는 않게
        release();
    });
}

// ── 로그아웃 ─────────────────────────────────────────────────
function wsLogout() {
    // 구버전 로컬 인증 흔적 제거
    try {
        localStorage.removeItem('ws_auth_v1');
        sessionStorage.removeItem('ws_auth_v1');
    } catch (e) {}

    if (wsInitFirebase() && firebase.auth) {
        firebase.auth().signOut().then(function() {
            location.replace(WS_LOGIN_PAGE);
        }).catch(function() {
            location.replace(WS_LOGIN_PAGE);
        });
    } else {
        location.replace(WS_LOGIN_PAGE);
    }
}

wsCheckAuth();
