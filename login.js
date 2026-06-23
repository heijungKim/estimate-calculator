var _AUTH_KEY = 'ws_auth_v1';
var _AUTH_VAL = 'ok';
var _ID       = 'woosung6860';
var _PW       = 'sunwooho6860!@#';

$(function() {
    // 이미 로그인된 경우 바로 이동
    if (localStorage.getItem(_AUTH_KEY) === _AUTH_VAL ||
        sessionStorage.getItem(_AUTH_KEY) === _AUTH_VAL) {
        location.replace('index.html');
        return;
    }

    $('#login_form').on('submit', function(e) {
        e.preventDefault();
        var id = $.trim($('#login_id').val());
        var pw = $('#login_pw').val();

        if (id !== _ID || pw !== _PW) {
            $('#login_error').text('아이디 또는 비밀번호가 올바르지 않습니다.');
            $('#login_pw').val('').focus();
            return;
        }

        $('#login_error').text('');
        if ($('#auto_login').is(':checked')) {
            localStorage.setItem(_AUTH_KEY, _AUTH_VAL);
        } else {
            sessionStorage.setItem(_AUTH_KEY, _AUTH_VAL);
        }
        location.replace('index.html');
    });

    $('#login_id').focus();
});
