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

    // 팀별 그룹핑
    var groups = {};
    var groupOrder = [];
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

    $('.leave-emp-tab').click(function() {
        selectLeaveEmp($(this).data('id'));
    });
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
        .catch(function() {
            renderLeaveMonths(empId, year, {});
        });
}

// ── 월별 렌더링 ─────────────────────────────────────────────────
function renderLeaveMonths(empId, year, months) {
    var emp = null;
    _leaveEmpList.forEach(function(e) { if (e.id === empId) emp = e; });
    if (!emp) return;

    var annualDays = _leaveAnnualDays(emp.joinDate);
    var usedCount = 0, paidCount = 0, unpaidCount = 0;
    var now = new Date();
    var curYear = now.getFullYear();
    var curMonth = now.getMonth() + 1;

    for (var m = 1; m <= 12; m++) {
        var md = months[String(m)] || {};
        var isFuture = (year > curYear) || (year === curYear && m > curMonth);
        if (!isFuture) {
            if (md.used) usedCount++;
            else if (md.paidAt) paidCount++;
            else unpaidCount++;
        }
    }

    var MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    var rows = '';
    for (var m = 1; m <= 12; m++) {
        var md = months[String(m)] || { used: false, paidAt: null };
        var isFuture = (year > curYear) || (year === curYear && m > curMonth);

        var statusCell, dateCell, actionCell;

        if (isFuture) {
            statusCell = '<span class="leave-badge leave-badge-future">-</span>';
            dateCell   = '-';
            actionCell = '';
        } else if (md.used) {
            statusCell = '<span class="leave-badge leave-badge-used">사용</span>';
            dateCell   = '-';
            actionCell = '<button class="leave-undo-btn" data-month="' + m + '">취소</button>';
        } else if (md.paidAt) {
            statusCell = '<span class="leave-badge leave-badge-unpaid">미사용</span>';
            dateCell   = '<span class="leave-paid-date">' + _leaveEsc(md.paidAt) + '</span>';
            actionCell = '<button class="leave-undo-btn" data-month="' + m + '">취소</button>';
        } else {
            statusCell = '<span class="leave-badge leave-badge-unpaid">미사용</span>';
            dateCell   = '<span class="leave-nopay">미지급</span>';
            actionCell =
                '<button class="leave-use-btn"  data-month="' + m + '">사용처리</button>' +
                '<button class="leave-pay-btn"  data-month="' + m + '">지급</button>';
        }

        rows += '<tr' + (isFuture ? ' class="leave-row-future"' : '') + '>' +
            '<td class="tc leave-month-cell">' + MONTHS[m-1] + '</td>' +
            '<td class="tc">' + statusCell + '</td>' +
            '<td class="tc">' + dateCell + '</td>' +
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
            '<div class="leave-stat-item"><span class="leave-stat-label">사용</span><span class="leave-stat-val leave-stat-used">' + usedCount + '개월</span></div>' +
            '<div class="leave-stat-divider"></div>' +
            '<div class="leave-stat-item"><span class="leave-stat-label">미사용 지급</span><span class="leave-stat-val leave-stat-paid">' + paidCount + '개월</span></div>' +
            '<div class="leave-stat-divider"></div>' +
            '<div class="leave-stat-item"><span class="leave-stat-label">미지급</span><span class="leave-stat-val leave-stat-unpaid">' + unpaidCount + '개월</span></div>' +
        '</div>' +
        '<table class="leave-month-table">' +
            '<thead><tr><th>월</th><th>사용여부</th><th>지급일</th><th>액션</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>';

    $('#leave_content').html(html);

    // 연도 이동
    $('#leave_prev_year').click(function() { _leaveYear--; loadLeaveData(empId, _leaveYear); });
    $('#leave_next_year').click(function() { _leaveYear++; loadLeaveData(empId, _leaveYear); });

    // 사용처리 버튼
    $('.leave-use-btn').click(function() {
        var m = String($(this).data('month'));
        var upd = JSON.parse(JSON.stringify(months));
        if (!upd[m]) upd[m] = { used: false, paidAt: null };
        upd[m].used = true;
        upd[m].paidAt = null;
        saveLeaveData(empId, year, upd);
    });

    // 지급 버튼
    $('.leave-pay-btn').click(function() {
        var m = String($(this).data('month'));
        var upd = JSON.parse(JSON.stringify(months));
        if (!upd[m]) upd[m] = { used: false, paidAt: null };
        upd[m].paidAt = _todayStr();
        upd[m].used = false;
        saveLeaveData(empId, year, upd);
    });

    // 취소(되돌리기) 버튼
    $('.leave-undo-btn').click(function() {
        var m = String($(this).data('month'));
        var upd = JSON.parse(JSON.stringify(months));
        upd[m] = { used: false, paidAt: null };
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
