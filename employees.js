var _empDb = null;
var _empList = [];
var _empEditId = null;

// 2026년 최저임금 기준
var MIN_HOURLY = 10320;
var MONTHLY_HOURS = 209;

function _empInitDB() {
    if (_empDb) return _empDb;
    try {
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') return null;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        _empDb = firebase.firestore();
    } catch(e) { _empDb = null; }
    return _empDb;
}

function _empEsc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _empFmt(n) {
    var v = parseInt(n, 10) || 0;
    return v.toLocaleString('ko-KR');
}

function _empDateFmt(s) {
    if (!s) return '-';
    var parts = s.split('-');
    if (parts.length === 3) return parts[0] + '.' + parts[1] + '.' + parts[2];
    return s;
}

function _empTenure(joinDate) {
    if (!joinDate) return '';
    var join = new Date(joinDate);
    var now = new Date();
    var months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
    if (months < 0) return '';
    var years = Math.floor(months / 12);
    var rem = months % 12;
    if (years > 0 && rem > 0) return years + '년 ' + rem + '개월';
    if (years > 0) return years + '년';
    return rem + '개월';
}

function loadEmployees() {
    var db = _empInitDB();
    $('#emp_list_area').html('<p class="emp-empty">불러오는 중…</p>');
    if (!db) {
        $('#emp_list_area').html('<p class="emp-empty">Firebase 연결 오류입니다.</p>');
        return;
    }
    db.collection('employees').orderBy('createdAt', 'desc').get()
        .then(function(snap) {
            _empList = [];
            snap.forEach(function(doc) {
                _empList.push(Object.assign({ id: doc.id }, doc.data()));
            });
            renderEmployees();
        })
        .catch(function() {
            $('#emp_list_area').html('<p class="emp-empty">직원 목록을 불러오지 못했습니다.</p>');
        });
}

function renderEmployees() {
    $('#emp_count').text(_empList.length + '명');
    if (!_empList.length) {
        $('#emp_list_area').html('<p class="emp-empty">등록된 직원이 없습니다.</p>');
        return;
    }

    var rows = '';
    _empList.forEach(function(emp) {
        var salary = parseInt(emp.salary, 10) || 0;
        var monthly = salary > 0 ? Math.round(salary / 12) : 0;
        var tenure = _empTenure(emp.joinDate);
        var memoHtml = emp.memo ? '<span class="emp-memo-badge" title="' + _empEsc(emp.memo) + '">메모</span>' : '';
        var rankPos = [emp.rank, emp.position].filter(Boolean).map(_empEsc).join(' / ') || '-';
        rows += '<tr>' +
            '<td class="emp-name">' + _empEsc(emp.name) + memoHtml + '</td>' +
            '<td>' + (emp.userId ? '<span class="emp-userid">' + _empEsc(emp.userId) + '</span>' : '<span style="color:#c0c8d4">-</span>') + '</td>' +
            '<td>' + rankPos + '</td>' +
            '<td>' + _empEsc(emp.phone || '-') + '</td>' +
            '<td>' + _empDateFmt(emp.joinDate) + (tenure ? ' <span style="color:#8892a4;font-size:11px;">(' + _empEsc(tenure) + ')</span>' : '') + '</td>' +
            '<td class="emp-salary-cell tr">' + (salary > 0 ? _empFmt(salary) + '원' : '-') + '</td>' +
            '<td class="emp-monthly-cell tr">' + (monthly > 0 ? _empFmt(monthly) + '원/월' : '-') + '</td>' +
            '<td class="tc">' + (emp.workHours ? emp.workHours + 'h' : '-') + '</td>' +
            '<td>' +
                '<div class="emp-actions">' +
                    '<button class="btn-edit emp-edit-btn" data-id="' + _empEsc(emp.id) + '">수정</button>' +
                    '<button class="btn-delete emp-del-btn" data-id="' + _empEsc(emp.id) + '">삭제</button>' +
                '</div>' +
            '</td>' +
        '</tr>';
    });

    var html = '<div class="emp-table-wrap">' +
        '<table class="emp-table">' +
            '<thead><tr>' +
                '<th>이름</th>' +
                '<th>아이디</th>' +
                '<th>직급 / 포지션</th>' +
                '<th>연락처</th>' +
                '<th>입사일</th>' +
                '<th class="tr">연봉</th>' +
                '<th class="tr">월급</th>' +
                '<th class="tc">근무시간</th>' +
                '<th class="tc">관리</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table></div>';

    $('#emp_list_area').html(html);

    $('.emp-edit-btn').click(function() {
        var id = $(this).data('id');
        var emp = null;
        _empList.forEach(function(e) { if (e.id === id) emp = e; });
        if (!emp) return;
        openEmpModal(emp);
    });

    $('.emp-del-btn').click(function() {
        if (!confirm('이 직원을 삭제하시겠습니까?')) return;
        var id = $(this).data('id');
        var db = _empInitDB();
        if (!db) return;
        db.collection('employees').doc(id).delete()
            .then(function() {
                _empList = _empList.filter(function(e) { return e.id !== id; });
                renderEmployees();
            })
            .catch(function() { alert('삭제에 실패했습니다.'); });
    });
}

function openEmpModal(emp) {
    _empEditId = emp ? emp.id : null;
    $('#emp_form_title').text(emp ? '직원 수정' : '직원 등록');
    $('#emp_name').val(emp ? (emp.name || '') : '');
    $('#emp_user_id').val(emp ? (emp.userId || '') : '');
    $('#emp_rank').val(emp ? (emp.rank || '') : '');
    $('#emp_position').val(emp ? (emp.position || '') : '');
    $('#emp_phone').val(emp ? (emp.phone || '') : '');
    $('#emp_join_date').val(emp ? (emp.joinDate || '') : '');
    $('#emp_salary').val(emp ? (emp.salary || '') : '');
    $('#emp_work_hours').val(emp ? (emp.workHours || '') : '');
    $('#emp_memo').val(emp ? (emp.memo || '') : '');
    $('#emp_form_error').text('');
    $('#emp_name').removeClass('error');
    $('body').css('overflow', 'hidden');
    $('#emp_form_modal').fadeIn(180, function(){ $(this).css('display','flex'); });
    setTimeout(function() { $('#emp_name')[0].focus({ preventScroll: true }); }, 200);
}

function closeEmpModal() {
    $('body').css('overflow', '');
    $('#emp_form_modal').fadeOut(150);
    _empEditId = null;
}

function saveEmployee() {
    var name = $.trim($('#emp_name').val());
    if (!name) {
        $('#emp_form_error').text('이름을 입력하세요.');
        $('#emp_name').addClass('error').focus();
        return;
    }
    $('#emp_name').removeClass('error');

    var db = _empInitDB();
    if (!db) { alert('Firebase 연결 오류입니다.'); return; }

    var data = {
        name: name,
        userId: $.trim($('#emp_user_id').val()),
        rank: $.trim($('#emp_rank').val()),
        position: $.trim($('#emp_position').val()),
        phone: $.trim($('#emp_phone').val()),
        joinDate: $('#emp_join_date').val(),
        salary: parseInt($('#emp_salary').val(), 10) || 0,
        workHours: parseFloat($('#emp_work_hours').val()) || 0,
        memo: $.trim($('#emp_memo').val()),
        updatedAt: Date.now()
    };

    if (_empEditId) {
        db.collection('employees').doc(_empEditId).update(data)
            .then(function() {
                closeEmpModal();
                loadEmployees();
            })
            .catch(function() { alert('수정에 실패했습니다.'); });
    } else {
        data.createdAt = Date.now();
        db.collection('employees').add(data)
            .then(function() {
                closeEmpModal();
                loadEmployees();
            })
            .catch(function() { alert('등록에 실패했습니다.'); });
    }
}

$(function() {
    // 최저임금 정보 표시
    var minMonthly = MIN_HOURLY * MONTHLY_HOURS;
    var minAnnual  = minMonthly * 12;
    $('#min_hourly').text(_empFmt(MIN_HOURLY) + '원');
    $('#min_monthly').text(_empFmt(minMonthly) + '원');
    $('#min_annual').text(_empFmt(minAnnual) + '원');

    loadEmployees();

    $('#btn_add_emp').click(function() { openEmpModal(null); });
    $('#emp_modal_close, #emp_form_cancel').click(closeEmpModal);
    $('#emp_form_modal').click(function(e) {
        if ($(e.target).hasClass('modal_overlay')) closeEmpModal();
    });
    $('#emp_form_save').click(saveEmployee);

    $('#emp_name').keydown(function(e) {
        if (e.key === 'Enter') saveEmployee();
    });

    // 모달 내 포커스 트랩 — Tab 키를 항상 가로채서 직접 이동
    $(document).on('keydown.empModal', function(e) {
        if (!$('#emp_form_modal').is(':visible')) return;

        if (e.key === 'Escape') {
            closeEmpModal();
            return;
        }

        if (e.key !== 'Tab') return;

        e.preventDefault(); // 항상 차단 — 브라우저 기본 스크롤 방지

        var focusable = $('#emp_form_modal').find('input, textarea, select, button').filter(':visible').not(':disabled');
        var idx = focusable.index(document.activeElement);
        var next = e.shiftKey
            ? (idx <= 0 ? focusable.length - 1 : idx - 1)
            : (idx >= focusable.length - 1 ? 0 : idx + 1);

        focusable.eq(next)[0].focus({ preventScroll: true });
    });
});
