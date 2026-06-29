var _leaveEmpList = [];
var _leaveSelectedEmpId = null;
var _leaveYear = new Date().getFullYear();
var _leaveDb = null;

function _leaveInitDB() {
    if (_leaveDb) return _leaveDb;
    try {
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') return null;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        _leaveDb = firebase.firestore();
    } catch(e) { _leaveDb = null; }
    return _leaveDb;
}

function _leaveEsc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _leaveAnnualDays(joinDate) {
    if (!joinDate) return 0;
    var join = new Date(joinDate);
    var now  = new Date();
    var totalMonths = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
    if (totalMonths <= 0) return 0;
    if (totalMonths < 12) return Math.min(totalMonths, 11);
    var years = Math.floor(totalMonths / 12);
    return Math.min(15 + Math.floor((years - 1) / 2), 25);
}

function _todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// 구 데이터 포맷 → 신 포맷 변환 (하위 호환)
function _normalizeMd(md) {
    if (!md) return { uses: [], paidAt: null };
    var uses = [];
    if (Array.isArray(md.uses)) {
        // uses 항목이 문자열이면 { date, reason } 객체로 변환
        uses = md.uses.map(function(u) {
            return (typeof u === 'string') ? { date: u, reason: '' } : u;
        });
        return { uses: uses, paidAt: md.paidAt || null };
    }
    // 구 포맷: { used: bool, paidAt: string|null }
    return { uses: md.used ? [{ date: '', reason: '' }] : [], paidAt: md.paidAt || null };
}

// ── 직원 목록 로드 ─────────────────────────────────────────────
function loadLeaveEmps() {
    var db = _leaveInitDB();
    if (!db) {
        $('#leave_emp_tabs').html('<div class="leave-empty">Firebase 연결 오류</div>');
        return;
    }
    db.collection('employees').orderBy('createdAt', 'desc').get()
        .then(function(snap) {
            _leaveEmpList = [];
            snap.forEach(function(doc) {
                _leaveEmpList.push(Object.assign({ id: doc.id }, doc.data()));
            });
            renderLeaveEmpTabs();
            if (_leaveEmpList.length > 0 && !_leaveSelectedEmpId) {
                selectLeaveEmp(_leaveEmpList[0].id);
            }
        })
        .catch(function() {
            $('#leave_emp_tabs').html('<div class="leave-empty">불러오지 못했습니다.</div>');
        });
}

function renderLeaveEmpTabs() {
    if (!_leaveEmpList.length) {
        $('#leave_emp_tabs').html('<div class="leave-empty">등록된 직원이 없습니다.</div>');
        return;
    }
    var groups = {}, groupOrder = [];
    _leaveEmpList.forEach(function(emp) {
        var grp = emp.position || emp.rank || '미분류';
        if (!groups[grp]) { groups[grp] = []; groupOrder.push(grp); }
        groups[grp].push(emp);
    });
    var html = '';
    groupOrder.forEach(function(grp) {
        html += '<div class="leave-tab-group-label">' + _leaveEsc(grp) + '</div>';
        groups[grp].forEach(function(emp) {
            html += '<div class="leave-emp-tab' + (emp.id === _leaveSelectedEmpId ? ' active' : '') + '" data-id="' + _leaveEsc(emp.id) + '">' +
                '<span class="leave-tab-name">' + _leaveEsc(emp.name) + '</span>' +
            '</div>';
        });
    });
    $('#leave_emp_tabs').html(html);
    $('.leave-emp-tab').click(function() { selectLeaveEmp($(this).data('id')); });
}

function selectLeaveEmp(empId) {
    _leaveSelectedEmpId = empId;
    renderLeaveEmpTabs();
    loadLeaveData(empId, _leaveYear);
}

// ── 연차 데이터 로드 ────────────────────────────────────────────
function loadLeaveData(empId, year) {
    var db = _leaveInitDB();
    if (!db) return;
    db.collection('annual_leave').doc(empId + '_' + year).get()
        .then(function(doc) {
            renderLeaveMonths(empId, year, doc.exists ? (doc.data().months || {}) : {});
        })
        .catch(function() { renderLeaveMonths(empId, year, {}); });
}

// ── 월별 렌더링 ─────────────────────────────────────────────────
function renderLeaveMonths(empId, year, rawMonths) {
    var emp = null;
    _leaveEmpList.forEach(function(e) { if (e.id === empId) emp = e; });
    if (!emp) return;

    // 각 월 데이터를 정규화
    var months = {};
    for (var i = 1; i <= 12; i++) {
        months[String(i)] = _normalizeMd(rawMonths[String(i)]);
    }

    var annualDays = _leaveAnnualDays(emp.joinDate);
    var usedCount = 0, paidCount = 0, unpaidCount = 0, totalUseCnt = 0;

    for (var m = 1; m <= 12; m++) {
        var md = months[String(m)];
        if (md.uses.length > 0) { usedCount++; totalUseCnt += md.uses.length; }
        else if (md.paidAt)      paidCount++;
        else                     unpaidCount++;
    }

    var MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    var rows = '';

    for (var m = 1; m <= 12; m++) {
        var md = months[String(m)];
        var hasUse = md.uses.length > 0;

        // ── 연차 사용 내역 셀 ──
        var useList = '';
        md.uses.forEach(function(u, idx) {
            useList += '<div class="leave-use-item">' +
                '<span class="leave-use-date">' + _leaveEsc(u.date || '날짜 미기록') + '</span>' +
                (u.reason ? '<span class="leave-use-reason">' + _leaveEsc(u.reason) + '</span>' : '') +
                '<button class="leave-del-use-btn" data-month="' + m + '" data-idx="' + idx + '" title="삭제">✕</button>' +
            '</div>';
        });
        var badge = hasUse
            ? '<span class="leave-badge leave-badge-used">사용 ' + md.uses.length + '회</span>'
            : '<span class="leave-badge leave-badge-unpaid">미사용</span>';
        var statusCell = '<div class="leave-uses-wrap">' + badge + useList +
            '<button class="leave-use-btn" data-month="' + m + '">+ 사용추가</button>' +
        '</div>';

        // ── 지급일 셀 ──
        var dateCell;
        if (hasUse) {
            dateCell = '<span style="color:#aab0bb;font-size:12px;">-</span>';
        } else if (md.paidAt) {
            dateCell = '<div class="leave-pay-date-wrap">' +
                '<span class="leave-paid-date">' + _leaveEsc(md.paidAt) + '</span>' +
                '<button class="leave-edit-pay-btn" data-month="' + m + '" title="날짜 수정">✎</button>' +
                '<button class="leave-undo-btn" data-month="' + m + '">취소</button>' +
            '</div>';
        } else {
            dateCell = '<div class="leave-pay-date-wrap">' +
                '<span class="leave-nopay">미지급</span>' +
                '<button class="leave-pay-btn" data-month="' + m + '"' + (hasUse ? ' disabled' : '') + '>지급</button>' +
            '</div>';
        }

        // ── 액션 셀 ──
        var actionCell = '<button class="leave-use-btn" data-month="' + m + '">+ 사용추가</button>';
        if (md.paidAt) {
            actionCell += '<button class="leave-undo-btn" data-month="' + m + '">취소</button>';
        } else {
            actionCell += '<button class="leave-pay-btn" data-month="' + m + '"' + (hasUse ? ' disabled' : '') + '>지급</button>';
        }

        rows += '<tr data-month="' + m + '">' +
            '<td class="tc leave-month-cell">' + MONTHS[m-1] + '</td>' +
            '<td class="leave-status-cell">' + statusCell + '</td>' +
            '<td class="leave-date-col">' + dateCell + '</td>' +
            '<td class="tc leave-action-cell">' + actionCell + '</td>' +
        '</tr>';
    }

    var html =
        '<div class="leave-emp-header">' +
            '<div class="leave-emp-info">' +
                '<span class="leave-emp-name">' + _leaveEsc(emp.name) + '</span>' +
                (emp.position ? '<span class="leave-emp-pos">' + _leaveEsc(emp.position) + '</span>' : '') +
                (emp.joinDate ? '<span class="leave-emp-join">입사 ' + emp.joinDate + '</span>' : '') +
            '</div>' +
            '<div class="leave-year-nav">' +
                '<button class="leave-year-btn" id="leave_prev_year">&#9664;</button>' +
                '<span class="leave-year-label">' + year + '년</span>' +
                '<button class="leave-year-btn" id="leave_next_year">&#9654;</button>' +
            '</div>' +
        '</div>' +
        '<div class="leave-stats">' +
            '<div class="leave-stat-item"><span class="leave-stat-label">지급 연차</span><span class="leave-stat-val leave-stat-total">' + annualDays + '일</span></div>' +
            '<div class="leave-stat-divider"></div>' +
            '<div class="leave-stat-item"><span class="leave-stat-label">사용 월수</span><span class="leave-stat-val leave-stat-used">' + usedCount + '개월</span></div>' +
            '<div class="leave-stat-divider"></div>' +
            '<div class="leave-stat-item"><span class="leave-stat-label">사용 횟수</span><span class="leave-stat-val leave-stat-used">' + totalUseCnt + '회</span></div>' +
            '<div class="leave-stat-divider"></div>' +
            '<div class="leave-stat-item"><span class="leave-stat-label">미사용 지급</span><span class="leave-stat-val leave-stat-paid">' + paidCount + '개월</span></div>' +
            '<div class="leave-stat-divider"></div>' +
            '<div class="leave-stat-item"><span class="leave-stat-label">미지급</span><span class="leave-stat-val leave-stat-unpaid">' + unpaidCount + '개월</span></div>' +
        '</div>' +
        '<table class="leave-month-table">' +
            '<thead><tr><th>월</th><th>연차 사용 내역</th><th>지급일</th><th>액션</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>';

    $('#leave_content').html(html);

    // ── 이벤트 ──────────────────────────────────────────────────

    $('#leave_prev_year').click(function() { _leaveYear--; loadLeaveData(empId, _leaveYear); });
    $('#leave_next_year').click(function() { _leaveYear++; loadLeaveData(empId, _leaveYear); });

    // 사용추가 → 인라인 날짜 입력 표시
    $('.leave-use-btn').click(function() {
        var m = $(this).data('month');
        var $row = $('tr[data-month="' + m + '"]');
        var $actionCell = $row.find('.leave-action-cell');

        // 이미 열려있으면 닫기
        if ($actionCell.find('.leave-date-input').length) return;

        $actionCell.html(
            '<div class="leave-inline-form">' +
                '<input type="date" class="leave-date-input" value="' + _todayStr() + '">' +
                '<input type="text" class="leave-reason-input" placeholder="사유 (선택)">' +
                '<button class="leave-use-confirm-btn" data-month="' + m + '">확인</button>' +
                '<button class="leave-use-cancel-btn" data-month="' + m + '">취소</button>' +
            '</div>'
        );

        $actionCell.find('.leave-date-input').focus();

        // 확인
        $actionCell.find('.leave-use-confirm-btn').click(function() {
            var dateVal   = $actionCell.find('.leave-date-input').val();
            var reasonVal = $actionCell.find('.leave-reason-input').val().trim();
            if (!dateVal) { $actionCell.find('.leave-date-input').focus(); return; }
            var upd = JSON.parse(JSON.stringify(months));
            upd[String(m)].uses.push({ date: dateVal, reason: reasonVal });
            upd[String(m)].paidAt = null;
            saveLeaveData(empId, year, upd);
        });

        // 취소
        $actionCell.find('.leave-use-cancel-btn').click(function() {
            loadLeaveData(empId, year);
        });

        // Enter 키
        $actionCell.find('.leave-date-input').keydown(function(e) {
            if (e.key === 'Enter') $actionCell.find('.leave-use-confirm-btn').click();
            if (e.key === 'Escape') $actionCell.find('.leave-use-cancel-btn').click();
        });
    });

    // 개별 사용 내역 삭제
    $('.leave-del-use-btn').click(function() {
        var m = String($(this).data('month'));
        var idx = parseInt($(this).data('idx'));
        if (!confirm('이 사용 내역을 삭제하시겠습니까?')) return;
        var upd = JSON.parse(JSON.stringify(months));
        upd[m].uses.splice(idx, 1);
        saveLeaveData(empId, year, upd);
    });

    // 지급
    $('.leave-pay-btn:not([disabled])').click(function() {
        var m = String($(this).data('month'));
        var upd = JSON.parse(JSON.stringify(months));
        upd[m].paidAt = _todayStr();
        upd[m].uses = [];
        saveLeaveData(empId, year, upd);
    });

    // 지급일 수정
    $('.leave-edit-pay-btn').click(function() {
        var m = String($(this).data('month'));
        var $wrap = $('tr[data-month="' + m + '"]').find('.leave-pay-date-wrap');
        if ($wrap.find('.leave-date-input').length) return;
        var curDate = months[m].paidAt || _todayStr();
        $wrap.html(
            '<input type="date" class="leave-date-input" value="' + curDate + '">' +
            '<button class="leave-use-confirm-btn leave-pay-edit-confirm" data-month="' + m + '">확인</button>' +
            '<button class="leave-use-cancel-btn leave-pay-edit-cancel" data-month="' + m + '">취소</button>'
        );
        $wrap.find('.leave-date-input').focus();
        $wrap.find('.leave-pay-edit-confirm').click(function() {
            var v = $wrap.find('.leave-date-input').val();
            if (!v) { $wrap.find('.leave-date-input').focus(); return; }
            var upd = JSON.parse(JSON.stringify(months));
            upd[m].paidAt = v;
            saveLeaveData(empId, year, upd);
        });
        $wrap.find('.leave-pay-edit-cancel').click(function() {
            loadLeaveData(empId, year);
        });
        $wrap.find('.leave-date-input').keydown(function(e) {
            if (e.key === 'Enter') $wrap.find('.leave-pay-edit-confirm').click();
            if (e.key === 'Escape') $wrap.find('.leave-pay-edit-cancel').click();
        });
    });

    // 취소(지급 되돌리기)
    $('.leave-undo-btn').click(function() {
        var m = String($(this).data('month'));
        if (!confirm('지급 내역을 초기화하시겠습니까?')) return;
        var upd = JSON.parse(JSON.stringify(months));
        upd[m] = { uses: [], paidAt: null };
        saveLeaveData(empId, year, upd);
    });
}

// ── 저장 ────────────────────────────────────────────────────────
function saveLeaveData(empId, year, months) {
    var db = _leaveInitDB();
    if (!db) return;
    db.collection('annual_leave').doc(empId + '_' + year).set({
        empId: empId, year: year, months: months, updatedAt: Date.now()
    }).then(function() {
        loadLeaveData(empId, year);
    }).catch(function() { alert('저장에 실패했습니다.'); });
}

$(function() { loadLeaveEmps(); });
