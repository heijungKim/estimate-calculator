// ── Firebase 초기화 ──────────────────────────────────────────
var _db = null;

function _initDB() {
    if (_db) return _db;
    try {
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') return null;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        _db = firebase.firestore();
    } catch(e) { _db = null; }
    return _db;
}

// ── CRUD ─────────────────────────────────────────────────────
function loadVendors(cb) {
    var db = _initDB();
    if (!db) { cb([]); return; }
    db.collection('vendors').orderBy('createdAt', 'desc').get()
        .then(function(snap) {
            var list = [];
            snap.forEach(function(doc) {
                list.push(Object.assign({ id: doc.id }, doc.data()));
            });
            cb(list);
        })
        .catch(function() { cb([]); });
}

function addVendor(data, cb) {
    var db = _initDB();
    if (!db) { cb(null); return; }
    data.createdAt = Date.now();
    db.collection('vendors').add(data)
        .then(function(ref) { cb(ref.id); })
        .catch(function() { cb(null); });
}

function updateVendor(id, data, cb) {
    var db = _initDB();
    if (!db) { cb(false); return; }
    db.collection('vendors').doc(id).update(data)
        .then(function() { cb(true); })
        .catch(function() { cb(false); });
}

function deleteVendor(id, cb) {
    var db = _initDB();
    if (!db) { cb(false); return; }
    db.collection('vendors').doc(id).delete()
        .then(function() { cb(true); })
        .catch(function() { cb(false); });
}

// ── 편집 상태 ────────────────────────────────────────────────
var editingId = null;

// ── 견적 상태 클래스 ─────────────────────────────────────────
var ARC_STATUS_CLASS = { '대기': 'st_wait', '미납': 'st_unpaid', '부분 납부': 'st_partial', '완납': 'st_paid' };

// ── 검색 필터 상태 ───────────────────────────────────────────
var _vFilter = { name: '', owner: '', phone: '', email: '' };

function applyVendorFilter(list) {
    return list.filter(function(v) {
        if (_vFilter.name  && (v.name  || '').indexOf(_vFilter.name)  === -1) return false;
        if (_vFilter.owner && (v.owner || '').indexOf(_vFilter.owner) === -1) return false;
        if (_vFilter.phone && (v.phone || '').indexOf(_vFilter.phone) === -1) return false;
        if (_vFilter.email && (v.email || '').indexOf(_vFilter.email) === -1) return false;
        return true;
    });
}

// ── 아카이브 로드 (견적 통계용) ──────────────────────────────
function loadArchiveList(cb) {
    var db = _initDB();
    if (!db) { cb([]); return; }
    db.collection('estimates').doc('archive_list').get()
        .then(function(doc) { cb(doc.exists ? (doc.data().list || []) : []); })
        .catch(function() { cb([]); });
}

function buildVendorStats(archiveList) {
    var stats = {};
    archiveList.forEach(function(arc) {
        var co = arc.company || '';
        if (!co) return;
        if (!stats[co]) stats[co] = { count: 0, total: 0 };
        stats[co].count++;
        stats[co].total += Number(arc.total) || 0;
    });
    return stats;
}

function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function fmt(n) {
    return Number(n || 0).toLocaleString('ko-KR');
}

// ── 렌더링 (테이블) ──────────────────────────────────────────
var _cachedVendors      = null;
var _cachedStats        = null;
var _cachedArchiveList  = null;

function renderVendors() {
    var $area = $('#vendor_list_area');
    $area.html('<p class="vendor-empty">불러오는 중…</p>');

    _cachedVendors     = null;
    _cachedStats       = null;
    _cachedArchiveList = null;

    function tryRender() {
        if (_cachedVendors === null || _cachedStats === null) return;

        var filtered = applyVendorFilter(_cachedVendors);
        $('#vendor_count').text(_cachedVendors.length + '개' + (filtered.length < _cachedVendors.length ? ' (검색 ' + filtered.length + '개)' : ''));

        if (!filtered.length) {
            var msg = _cachedVendors.length ? '검색 결과가 없습니다.' : '등록된 업체가 없습니다.';
            $area.html('<p class="vendor-empty">' + msg + '</p>');
            return;
        }

        var rows = filtered.map(function(v) {
            var stats  = _cachedStats[v.name] || { count: 0, total: 0 };
            var paid   = Number(v.paid) || 0;
            var unpaid = Math.max(0, stats.total - paid);

            return '<tr data-id="' + v.id + '">' +
                '<td class="vt-name">' + esc(v.name) + (v.memo ? '<span class="vt-memo" title="' + esc(v.memo) + '">메모</span>' : '') + '</td>' +
                '<td>' + esc(v.owner || '-') + '</td>' +
                '<td>' + esc(v.phone || '-') + '</td>' +
                '<td>' + esc(v.email || '-') + '</td>' +
                '<td class="tc"><button class="vt-count-btn" data-name="' + esc(v.name) + '">' + stats.count + '건</button></td>' +
                '<td class="tr">₩ ' + fmt(stats.total) + '</td>' +
                '<td class="tr vt-paid-cell" data-id="' + v.id + '" data-paid="' + paid + '">' +
                    '<span class="vt-paid-val">₩ ' + fmt(paid) + '</span>' +
                    '<button class="btn-paid-edit" data-id="' + v.id + '" data-paid="' + paid + '">수정</button>' +
                '</td>' +
                '<td class="tr' + (unpaid > 0 ? ' has-unpaid' : '') + '">₩ ' + fmt(unpaid) + '</td>' +
                '<td class="vt-actions">' +
                    '<button class="btn-edit" data-id="' + v.id + '">수정</button>' +
                    '<button class="btn-delete" data-id="' + v.id + '">삭제</button>' +
                '</td>' +
            '</tr>';
        }).join('');

        $area.html(
            '<div class="vt-wrap">' +
            '<table class="vendor-table">' +
            '<thead><tr>' +
                '<th>업체명</th><th>대표자</th><th>연락처</th><th>이메일</th>' +
                '<th class="tc">견적 수</th><th class="tr">총 견적액</th>' +
                '<th class="tr">입금액</th><th class="tr">미수액</th><th>관리</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
            '</table>' +
            '</div>'
        );
    }

    loadVendors(function(list) {
        _cachedVendors = list;
        tryRender();
    });
    loadArchiveList(function(l) {
        _cachedArchiveList = l;
        _cachedStats = buildVendorStats(l);
        tryRender();
    });
}

// ── 업체별 견적 팝업 ─────────────────────────────────────────
function showVendorEstimates(vendorName) {
    var list = (_cachedArchiveList || []).filter(function(arc) {
        return arc.company === vendorName;
    });
    list.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });

    $('#vest_title').text('"' + vendorName + '" 견적 목록 (' + list.length + '건)');

    var $body = $('#vest_body');
    if (!list.length) {
        $body.html('<p class="vendor-empty">해당 업체의 견적이 없습니다.</p>');
    } else {
        var rows = list.map(function(arc) {
            var st = arc.status || '-';
            var stCls = ARC_STATUS_CLASS[st] || '';
            return '<tr>' +
                '<td class="vest-name">' + esc(arc.name || '-') + '</td>' +
                '<td class="tc">' + esc(arc.date || '-') + '</td>' +
                '<td class="tr">₩ ' + (arc.totalFormatted || fmt(arc.total)) + '</td>' +
                '<td class="tc"><span class="arc-status ' + stCls + '">' + esc(st) + '</span></td>' +
                '<td class="tc">' + esc(arc.proceed || '-') + '</td>' +
            '</tr>';
        }).join('');

        $body.html(
            '<table class="vest-table">' +
            '<thead><tr>' +
                '<th>견적명</th><th class="tc">날짜</th><th class="tr">금액</th>' +
                '<th class="tc">상태</th><th class="tc">진행</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
            '</table>'
        );
    }

    $('#vendor_est_modal').fadeIn(200, function(){ $(this).css('display', 'flex'); });
}

function closeEstModal() {
    $('#vendor_est_modal').fadeOut(200);
}

function reRenderFiltered() {
    if (_cachedVendors === null || _cachedStats === null) return;

    var $area = $('#vendor_list_area');
    var filtered = applyVendorFilter(_cachedVendors);
    $('#vendor_count').text(_cachedVendors.length + '개' + (filtered.length < _cachedVendors.length ? ' (검색 ' + filtered.length + '개)' : ''));

    if (!filtered.length) {
        var msg = _cachedVendors.length ? '검색 결과가 없습니다.' : '등록된 업체가 없습니다.';
        $area.html('<p class="vendor-empty">' + msg + '</p>');
        return;
    }

    var rows = filtered.map(function(v) {
        var stats  = _cachedStats[v.name] || { count: 0, total: 0 };
        var paid   = Number(v.paid) || 0;
        var unpaid = Math.max(0, stats.total - paid);

        return '<tr data-id="' + v.id + '">' +
            '<td class="vt-name">' + esc(v.name) + (v.memo ? '<span class="vt-memo" title="' + esc(v.memo) + '">메모</span>' : '') + '</td>' +
            '<td>' + esc(v.owner || '-') + '</td>' +
            '<td>' + esc(v.phone || '-') + '</td>' +
            '<td>' + esc(v.email || '-') + '</td>' +
            '<td class="tc">' + stats.count + '건</td>' +
            '<td class="tr">₩ ' + fmt(stats.total) + '</td>' +
            '<td class="tr vt-paid-cell" data-id="' + v.id + '" data-paid="' + paid + '">' +
                '<span class="vt-paid-val">₩ ' + fmt(paid) + '</span>' +
                '<button class="btn-paid-edit" data-id="' + v.id + '" data-paid="' + paid + '">수정</button>' +
            '</td>' +
            '<td class="tr' + (unpaid > 0 ? ' has-unpaid' : '') + '">₩ ' + fmt(unpaid) + '</td>' +
            '<td class="vt-actions">' +
                '<button class="btn-edit" data-id="' + v.id + '">수정</button>' +
                '<button class="btn-delete" data-id="' + v.id + '">삭제</button>' +
            '</td>' +
        '</tr>';
    }).join('');

    if ($area.find('.vendor-table').length) {
        $area.find('tbody').html(rows);
    } else {
        $area.html(
            '<div class="vt-wrap">' +
            '<table class="vendor-table">' +
            '<thead><tr>' +
                '<th>업체명</th><th>대표자</th><th>연락처</th><th>이메일</th>' +
                '<th class="tc">견적 수</th><th class="tr">총 견적액</th>' +
                '<th class="tr">입금액</th><th class="tr">미수액</th><th>관리</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
            '</table>' +
            '</div>'
        );
    }
}

// ── 모달 열기/닫기 ────────────────────────────────────────────
function openVendorModal() {
    $('#vendor_form_modal').fadeIn(200, function(){ $(this).css('display', 'flex'); });
    setTimeout(function(){ $('#v_name').focus(); }, 220);
}

function closeVendorModal() {
    $('#vendor_form_modal').fadeOut(200);
    resetForm();
}

// ── 폼 초기화 ────────────────────────────────────────────────
function resetForm() {
    editingId = null;
    $('#vendor_form')[0].reset();
    $('#v_name').removeClass('error');
    $('#form_error').text('');
    $('#form_title_text').text('업체 등록');
    $('#btn_submit').text('✓ 등록하기');
    $('#btn_cancel_edit').hide();
}

function fillForm(v) {
    editingId = v.id;
    $('#v_name').val(v.name || '');
    $('#v_owner').val(v.owner || '');
    $('#v_phone').val(v.phone || '');
    $('#v_email').val(v.email || '');
    $('#v_address').val(v.address || '');
    $('#v_memo').val(v.memo || '');
    $('#form_title_text').text('업체 수정');
    $('#btn_submit').text('✓ 저장하기');
    $('#btn_cancel_edit').show();
    openVendorModal();
}

// ── 이벤트 바인딩 ────────────────────────────────────────────
$(function() {
    renderVendors();

    // 업체별 견적 팝업
    $('#vendor_list_area').on('click', '.vt-count-btn', function() {
        showVendorEstimates($(this).data('name'));
    });
    $('#vest_modal_close, #vest_close_btn').on('click', closeEstModal);
    $('#vendor_est_modal').on('click', function(e) {
        if (e.target === this) closeEstModal();
    });

    // 검색 필터
    $('#vs_name, #vs_owner, #vs_phone, #vs_email').on('input', function() {
        _vFilter.name  = $.trim($('#vs_name').val());
        _vFilter.owner = $.trim($('#vs_owner').val());
        _vFilter.phone = $.trim($('#vs_phone').val());
        _vFilter.email = $.trim($('#vs_email').val());
        reRenderFiltered();
    });

    $('#btn_vs_reset').on('click', function() {
        _vFilter = { name: '', owner: '', phone: '', email: '' };
        $('#vs_name, #vs_owner, #vs_phone, #vs_email').val('');
        reRenderFiltered();
    });

    // 업체 등록 버튼
    $('#btn_add_vendor').on('click', function() {
        resetForm();
        openVendorModal();
    });

    // 모달 닫기
    $('#vendor_modal_close').on('click', closeVendorModal);
    $('#vendor_form_modal').on('click', function(e) {
        if (e.target === this) closeVendorModal();
    });
    $('#btn_cancel_edit').on('click', closeVendorModal);

    // 폼 제출
    $('#vendor_form').on('submit', function(e) {
        e.preventDefault();
        var name = $.trim($('#v_name').val());
        if (!name) {
            $('#v_name').addClass('error').focus();
            $('#form_error').text('업체명은 필수 항목입니다.');
            return;
        }
        $('#v_name').removeClass('error');
        $('#form_error').text('');

        var data = {
            name:    name,
            owner:   $.trim($('#v_owner').val()),
            phone:   $.trim($('#v_phone').val()),
            email:   $.trim($('#v_email').val()),
            address: $.trim($('#v_address').val()),
            memo:    $.trim($('#v_memo').val())
        };

        $('#btn_submit').prop('disabled', true).text('저장 중...');

        if (editingId) {
            updateVendor(editingId, data, function(ok) {
                $('#btn_submit').prop('disabled', false);
                if (ok) { closeVendorModal(); renderVendors(); }
                else { $('#form_error').text('저장에 실패했습니다. 다시 시도해주세요.'); }
            });
        } else {
            addVendor(data, function(newId) {
                $('#btn_submit').prop('disabled', false);
                if (newId) { closeVendorModal(); renderVendors(); }
                else { $('#form_error').text('등록에 실패했습니다. 다시 시도해주세요.'); }
            });
        }
    });

    // 수정 / 삭제
    $('#vendor_list_area').on('click', '.btn-edit', function() {
        var id = $(this).data('id');
        var db = _initDB();
        if (!db) return;
        db.collection('vendors').doc(id).get().then(function(doc) {
            if (doc.exists) fillForm(Object.assign({ id: doc.id }, doc.data()));
        });
    });

    $('#vendor_list_area').on('click', '.btn-delete', function() {
        var id = $(this).data('id');
        var name = $(this).closest('tr').find('.vt-name').text();
        if (!confirm('"' + name + '" 업체를 삭제하시겠습니까?')) return;
        deleteVendor(id, function(ok) {
            if (ok) renderVendors();
            else alert('삭제에 실패했습니다.');
        });
    });

    // 입금 금액 수정
    $('#vendor_list_area').on('click', '.btn-paid-edit', function() {
        var id = $(this).data('id');
        var currentPaid = Number($(this).data('paid')) || 0;
        var $cell = $(this).closest('.vt-paid-cell');
        $cell.html(
            '<input type="text" class="paid-input" value="' + currentPaid.toLocaleString('ko-KR') + '" />' +
            '<button class="btn-paid-save" data-id="' + id + '">저장</button>' +
            '<button class="btn-paid-cancel">취소</button>'
        );
        $cell.find('.paid-input').focus().select();
    });

    $('#vendor_list_area').on('click', '.btn-paid-save', function() {
        var id = $(this).data('id');
        var raw = $(this).siblings('.paid-input').val();
        var newPaid = parseInt(String(raw).replace(/[^0-9]/g, '')) || 0;
        updateVendor(id, { paid: newPaid }, function(ok) {
            if (ok) renderVendors();
            else alert('저장에 실패했습니다.');
        });
    });

    $('#vendor_list_area').on('click', '.btn-paid-cancel', function() {
        renderVendors();
    });

    $('#vendor_list_area').on('keydown', '.paid-input', function(e) {
        if (e.which === 13) $(this).siblings('.btn-paid-save').click();
        if (e.which === 27) $(this).siblings('.btn-paid-cancel').click();
    });
});
