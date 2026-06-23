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

// ── 렌더링 ──────────────────────────────────────────────────
function renderVendors() {
    var $area = $('#vendor_list_area');
    $area.html('<p class="vendor-empty">불러오는 중…</p>');

    var vendorsList = null;
    var archiveStats = null;

    function tryRender() {
        if (vendorsList === null || archiveStats === null) return;

        $('#vendor_count').text(vendorsList.length + '개');

        if (!vendorsList.length) {
            $area.html('<p class="vendor-empty">등록된 업체가 없습니다.</p>');
            return;
        }

        var html = '';
        vendorsList.forEach(function(v) {
            var stats = archiveStats[v.name] || { count: 0, total: 0 };
            var paid   = Number(v.paid) || 0;
            var unpaid = Math.max(0, stats.total - paid);

            var infoItems = [];
            if (v.owner)   infoItems.push('대표: ' + esc(v.owner));
            if (v.phone)   infoItems.push(esc(v.phone));
            if (v.email)   infoItems.push(esc(v.email));
            if (v.address) infoItems.push(esc(v.address));

            html += '<div class="vendor-item" data-id="' + v.id + '">';

            html += '<div class="vendor-item-header">';
            html += '<div class="vendor-item-main">';
            html += '<span class="vendor-item-name">' + esc(v.name) + '</span>';
            if (infoItems.length) html += '<span class="vendor-item-info">' + infoItems.join(' · ') + '</span>';
            if (v.memo)           html += '<span class="vendor-item-memo">' + esc(v.memo) + '</span>';
            html += '</div>';
            html += '<div class="vendor-actions">';
            html += '<button class="btn-edit" data-id="' + v.id + '">수정</button>';
            html += '<button class="btn-delete" data-id="' + v.id + '">삭제</button>';
            html += '</div>';
            html += '</div>';

            html += '<div class="vendor-item-stats">';

            html += '<div class="stat-box">';
            html += '<div class="stat-label">견적서 수</div>';
            html += '<div class="stat-value">' + stats.count + '건</div>';
            html += '</div>';

            html += '<div class="stat-box">';
            html += '<div class="stat-label">총 견적액</div>';
            html += '<div class="stat-value">₩ ' + stats.total.toLocaleString('ko-KR') + '</div>';
            html += '</div>';

            html += '<div class="stat-box stat-box-paid">';
            html += '<div class="stat-label">입금 금액</div>';
            html += '<div class="stat-value-row" data-id="' + v.id + '" data-paid="' + paid + '">';
            html += '<span class="paid-value">₩ ' + paid.toLocaleString('ko-KR') + '</span>';
            html += '<button class="btn-paid-edit" data-id="' + v.id + '" data-paid="' + paid + '">수정</button>';
            html += '</div>';
            html += '</div>';

            html += '<div class="stat-box stat-box-unpaid">';
            html += '<div class="stat-label">미수 금액</div>';
            html += '<div class="stat-value' + (unpaid > 0 ? ' has-unpaid' : '') + '">₩ ' + unpaid.toLocaleString('ko-KR') + '</div>';
            html += '</div>';

            html += '</div>';
            html += '</div>';
        });

        $area.html(html);
    }

    loadVendors(function(list)  { vendorsList  = list;                    tryRender(); });
    loadArchiveList(function(l) { archiveStats = buildVendorStats(l);     tryRender(); });
}

function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
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

// ── 이벤트 ──────────────────────────────────────────────────
$(function() {
    renderVendors();

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

    // 취소 버튼
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

    // 수정 / 삭제 (이벤트 위임)
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
        var name = $(this).closest('.vendor-item').find('.vendor-item-name').text();
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
        var $row = $(this).closest('.stat-value-row');
        $row.html(
            '<input type="text" class="paid-input" value="' + currentPaid.toLocaleString('ko-KR') + '" />' +
            '<button class="btn-paid-save" data-id="' + id + '">저장</button>' +
            '<button class="btn-paid-cancel">취소</button>'
        );
        $row.find('.paid-input').focus().select();
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
