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

// ── 렌더링 ──────────────────────────────────────────────────
function renderVendors() {
    loadVendors(function(list) {
        var $area = $('#vendor_list_area');
        $('#vendor_count').text(list.length + '개');

        if (!list.length) {
            $area.html('<p class="vendor-empty" id="vendor_empty_msg">등록된 업체가 없습니다.</p>');
            return;
        }

        var html = '<table class="vendor-table"><thead><tr>';
        html += '<th>업체명</th><th>대표자</th><th>연락처</th><th>이메일</th><th>주소</th><th>메모</th><th></th>';
        html += '</tr></thead><tbody>';

        list.forEach(function(v) {
            html += '<tr data-id="' + v.id + '">';
            html += '<td class="vendor-name-cell">' + esc(v.name) + '</td>';
            html += '<td>' + esc(v.owner) + '</td>';
            html += '<td>' + esc(v.phone) + '</td>';
            html += '<td>' + esc(v.email) + '</td>';
            html += '<td>' + esc(v.address) + '</td>';
            html += '<td class="vendor-memo-cell" title="' + esc(v.memo) + '">' + esc(v.memo) + '</td>';
            html += '<td><div class="vendor-actions">';
            html += '<button class="btn-edit" data-id="' + v.id + '">수정</button>';
            html += '<button class="btn-delete" data-id="' + v.id + '">삭제</button>';
            html += '</div></td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        $area.html(html);
    });
}

function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
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
    $('html, body').animate({ scrollTop: $('#vendor_form_card').offset().top - 20 }, 200);
    $('#v_name').focus();
}

// ── 이벤트 ──────────────────────────────────────────────────
$(function() {
    renderVendors();

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
                if (ok) { resetForm(); renderVendors(); }
                else { $('#form_error').text('저장에 실패했습니다. 다시 시도해주세요.'); }
            });
        } else {
            addVendor(data, function(newId) {
                $('#btn_submit').prop('disabled', false);
                if (newId) { resetForm(); renderVendors(); }
                else { $('#form_error').text('등록에 실패했습니다. 다시 시도해주세요.'); }
            });
        }
    });

    // 취소
    $('#btn_cancel_edit').on('click', resetForm);

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
        var name = $(this).closest('tr').find('.vendor-name-cell').text();
        if (!confirm('"' + name + '" 업체를 삭제하시겠습니까?')) return;
        deleteVendor(id, function(ok) {
            if (ok) renderVendors();
            else alert('삭제에 실패했습니다.');
        });
    });
});
