var _phDb = null;
var _phList = [];

function _phInit() {
    if (_phDb) return;
    try {
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey) return;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        _phDb = firebase.firestore();
    } catch(e) {}
}

function _phEsc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _phFmt(n) {
    return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function _phDateStr(item) {
    if (item.printedAt && item.printedAt.toDate) {
        var d = item.printedAt.toDate();
        return d.getFullYear() + '.' +
            String(d.getMonth() + 1).padStart(2, '0') + '.' +
            String(d.getDate()).padStart(2, '0') + ' ' +
            String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0');
    }
    return item.date || '';
}

// item의 날짜를 "YYYY-MM-DD" 문자열로 반환 (기간 비교용)
function _phItemDateKey(item) {
    if (item.printedAt && item.printedAt.toDate) {
        var d = item.printedAt.toDate();
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    }
    return item.date || '';
}

function getFilteredList() {
    var dateFrom = $('#ph_date_from').val();
    var dateTo   = $('#ph_date_to').val();
    var customer = $('#ph_search_customer').val().trim().toLowerCase();
    var manager  = $('#ph_search_manager').val().trim().toLowerCase();

    return _phList.filter(function(item) {
        // 기간 필터
        if (dateFrom || dateTo) {
            var key = _phItemDateKey(item);
            if (dateFrom && key < dateFrom) return false;
            if (dateTo   && key > dateTo)   return false;
        }
        // 고객명 필터
        if (customer) {
            var c = (item.customer || '').toLowerCase();
            if (c.indexOf(customer) === -1) return false;
        }
        // 담당자 필터
        if (manager) {
            var m = (item.manager || '').toLowerCase();
            if (m.indexOf(manager) === -1) return false;
        }
        return true;
    });
}

function loadPrintHistory() {
    _phInit();
    $('#ph_list').html('<p class="ph-empty">불러오는 중…</p>');
    $('#ph_result_info').hide();
    if (!_phDb) {
        $('#ph_list').html('<p class="ph-empty">Firebase 연결 오류입니다.</p>');
        return;
    }
    _phDb.collection('printHistory').orderBy('printedAt', 'desc').get()
        .then(function(snap) {
            _phList = [];
            snap.forEach(function(doc) {
                var d = doc.data();
                d.id = doc.id;
                _phList.push(d);
            });
            renderPrintHistory(_phList);
        })
        .catch(function(e) {
            $('#ph_list').html('<p class="ph-empty">내역을 불러오지 못했습니다.</p>');
            console.warn(e);
        });
}

function renderPrintHistory(list) {
    var $list = $('#ph_list');
    var $info = $('#ph_result_info');

    if (!list.length) {
        $info.hide();
        $list.html('<p class="ph-empty">' +
            (_phList.length ? '검색 결과가 없습니다.' : '저장된 출력 내역이 없습니다.') +
            '</p>');
        return;
    }

    // 결과 건수 표시 (필터가 적용된 경우)
    if (list.length < _phList.length) {
        $info.text('전체 ' + _phList.length + '건 중 ' + list.length + '건 검색됨').show();
    } else {
        $info.text('전체 ' + list.length + '건').show();
    }

    var html = '';
    list.forEach(function(item) {
        var dateStr  = _phDateStr(item);
        var customer = item.customer || '(수신처 없음)';
        var manager  = item.manager ? ' / ' + item.manager + ' 담당' : '';
        var total    = _phFmt(item.total);
        html += '<div class="ph-item" data-id="' + _phEsc(item.id) + '">' +
            '<div class="ph-item-main">' +
                '<span class="ph-date">' + _phEsc(dateStr) + '</span>' +
                '<span class="ph-customer">' + _phEsc(customer) + _phEsc(manager) + '</span>' +
                '<span class="ph-total">&#8361; ' + _phEsc(total) + '원</span>' +
            '</div>' +
            '<div class="ph-item-actions">' +
                '<button class="ph-view-btn" data-id="' + _phEsc(item.id) + '">&#128196; 보기</button>' +
                '<button class="ph-del-btn"  data-id="' + _phEsc(item.id) + '">&#128465; 삭제</button>' +
            '</div>' +
        '</div>';
    });
    $list.html(html);

    $('.ph-view-btn').click(function() {
        var id = $(this).data('id');
        var found = null;
        _phList.forEach(function(i) { if (i.id === id) found = i; });
        if (!found || !found.htmlContent) { alert('내용을 불러올 수 없습니다.'); return; }
        var win = window.open('', '_blank', 'width=960,height=1050,scrollbars=yes');
        if (!win) { alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도하세요.'); return; }
        win.document.open();
        win.document.write(found.htmlContent);
        win.document.close();
    });

    $('.ph-del-btn').click(function() {
        if (!confirm('이 출력 내역을 삭제하시겠습니까?')) return;
        var id = $(this).data('id');
        var $row = $(this).closest('.ph-item');
        _phDb.collection('printHistory').doc(id).delete()
            .then(function() {
                $row.remove();
                _phList = _phList.filter(function(i) { return i.id !== id; });
                // 삭제 후 현재 필터 기준으로 결과 건수 갱신
                var remaining = getFilteredList();
                if (!remaining.length) {
                    $('#ph_result_info').hide();
                    $list.html('<p class="ph-empty">' +
                        (_phList.length ? '검색 결과가 없습니다.' : '저장된 출력 내역이 없습니다.') +
                        '</p>');
                } else {
                    if (remaining.length < _phList.length) {
                        $('#ph_result_info').text('전체 ' + _phList.length + '건 중 ' + remaining.length + '건 검색됨').show();
                    } else {
                        $('#ph_result_info').text('전체 ' + remaining.length + '건').show();
                    }
                }
            })
            .catch(function() { alert('삭제에 실패했습니다.'); });
    });
}

$(function() {
    loadPrintHistory();

    $('#btn_ph_refresh').click(function() {
        // 검색 조건 초기화 후 전체 재로드
        $('#ph_date_from, #ph_date_to, #ph_search_customer, #ph_search_manager').val('');
        loadPrintHistory();
    });

    $('#btn_ph_search').click(function() {
        renderPrintHistory(getFilteredList());
    });

    // 엔터키 검색
    $('#ph_search_customer, #ph_search_manager').keydown(function(e) {
        if (e.key === 'Enter') renderPrintHistory(getFilteredList());
    });
    $('#ph_date_from, #ph_date_to').change(function() {
        renderPrintHistory(getFilteredList());
    });

    $('#btn_ph_reset').click(function() {
        $('#ph_date_from, #ph_date_to, #ph_search_customer, #ph_search_manager').val('');
        renderPrintHistory(_phList);
    });
});
