// Firebase Auth 이메일/비밀번호 로그인
// 비밀번호는 더 이상 이 파일에 존재하지 않는다. 계정은 Firebase 콘솔에서 관리한다.

$(function() {
    var ready = (typeof wsInitFirebase === 'function') && wsInitFirebase();

    if (!ready || !firebase.auth) {
        $('#login_error').text('인증 서비스에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
        return;
    }

    var auth = firebase.auth();

    function goNext() {
        var next = '';
        try { next = sessionStorage.getItem('ws_redirect') || ''; } catch (e) {}
        try { sessionStorage.removeItem('ws_redirect'); } catch (e) {}
        // 외부 주소로 튕기지 않도록 같은 사이트 경로만 허용
        if (next && next.charAt(0) === '/' && next.indexOf('//') !== 0) {
            location.replace(next);
        } else {
            location.replace('index.html');
        }
    }

    // 이미 로그인된 경우 바로 이동
    auth.onAuthStateChanged(function(user) {
        if (user) goNext();
    });

    $('#login_form').on('submit', function(e) {
        e.preventDefault();

        var id = $.trim($('#login_id').val());
        var pw = $('#login_pw').val();
        var $btn = $(this).find('.login-btn');

        if (!id || !pw) {
            $('#login_error').text('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        $('#login_error').text('');
        $btn.prop('disabled', true).text('로그인 중...');

        // 자동 로그인 체크 → 브라우저를 닫아도 유지(LOCAL), 아니면 탭 종료 시 만료(SESSION)
        var mode = $('#auto_login').is(':checked')
            ? firebase.auth.Auth.Persistence.LOCAL
            : firebase.auth.Auth.Persistence.SESSION;

        auth.setPersistence(mode)
            .then(function() {
                return auth.signInWithEmailAndPassword(wsIdToEmail(id), pw);
            })
            .then(function() {
                goNext();
            })
            .catch(function(err) {
                $btn.prop('disabled', false).text('로그인');
                $('#login_pw').val('').focus();
                $('#login_error').text(wsAuthErrorText(err));
            });
    });

    $('#login_id').focus();
});

// Firebase 인증 오류 코드를 사용자용 문구로
function wsAuthErrorText(err) {
    var code = (err && err.code) || '';
    switch (code) {
        case 'auth/invalid-email':
            return '아이디 형식이 올바르지 않습니다.';
        case 'auth/user-disabled':
            return '사용이 중지된 계정입니다. 관리자에게 문의해주세요.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
            return '아이디 또는 비밀번호가 올바르지 않습니다.';
        case 'auth/too-many-requests':
            return '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.';
        case 'auth/network-request-failed':
            return '네트워크 연결을 확인해주세요.';
        case 'auth/operation-not-allowed':
            return '이메일/비밀번호 로그인이 비활성화되어 있습니다. (Firebase 콘솔 확인)';
        default:
            return '로그인에 실패했습니다. ' + (code ? '(' + code + ')' : '');
    }
}
