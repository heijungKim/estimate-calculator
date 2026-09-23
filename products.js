/* products.js — 입찰참가 등록물품·인증의 유효기간 관리
 *
 * 최초 등록 내용은 company.json 에서 읽는다. 갱신한 날짜는 Firestore 에
 * 저장하고 그 위에 덮어쓴다 — 날짜를 바꾸려고 코드를 고칠 일은 없어야 한다.
 *
 * 등록유효기간이 지나면 그 품명으로는 입찰에 못 들어간다. 공고를 찾아놓고
 * 투찰 당일에 알게 되면 손쓸 방법이 없어서, 한 달 전부터 눈에 띄게 알린다.
 */

var RENEW_NOTICE_DAYS = 30;   // 이 안쪽이면 '재발급 필요'
var SOON_DAYS = 60;           // 이 안쪽이면 '곧 만료'

var _company = null;
var _products = [];    // company.json + 갱신분
var _certs = [];
var _mall = [];        // 종합쇼핑몰 계약
var _db = null;
var _renewTarget = null;   // { type: 'product'|'cert', id }

var LS_OVERRIDE = 'bid_registry_v1';   // Firestore 를 못 쓸 때만 사용

$(function() {
    initDb();
    bindEvents();
    load();
});

function initDb() {
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length && firebase.firestore) {
            _db = firebase.firestore();
        }
    } catch (e) { _db = null; }
}

function bindEvents() {
    $('#renew_close, #renew_cancel').click(closeRenew);
    $('#renew_modal').click(function(e) { if (e.target === this) closeRenew(); });
    $('#renew_confirm').click(saveRenew);
    $('#renew_date, #renew_term').on('change input', updatePreview);

    $(document).on('click', '.prod-renew-btn', function() {
        openRenew($(this).data('type'), String($(this).data('id')));
    });
    $(document).on('click', '.prod-del-btn', function() {
        removeItem($(this).data('type'), String($(this).data('id')), $(this).data('name'));
    });

    $('.prod-add-btn').click(function() { openAdd($(this).data('add')); });
    $('#add_close, #add_cancel').click(closeAdd);
    $('#add_modal').click(function(e) { if (e.target === this) closeAdd(); });
    $('#add_confirm').click(saveAdd);
    $('#add_issued, #add_term').on('change input', updateAddPreview);
}

/* ── 불러오기 ────────────────────────────────────────────────── */
function load() {
    $('#prod_tbody').html('<tr><td colspan="10" class="prod-empty">불러오는 중…</td></tr>');

    fetch('company.json', { cache: 'no-store' })
        .then(function(res) {
            if (!res.ok) throw new Error('company.json HTTP ' + res.status);
            return res.json();
        })
        .then(function(data) {
            _company = data;
            return loadOverrides();
        })
        .then(function(over) {
            _products = (_company.products || []).map(function(p) {
                return $.extend({}, p, over.products[p.code] || {});
            });
            _certs = (_company.certifications || []).map(function(c) {
                return $.extend({}, c, over.certs[c.key] || {});
            });

            // company.json 에 없는 저장분 = 이 화면에서 직접 넣은 항목.
            // 품명을 새로 등록하거나 인증을 하나 더 받았을 때 코드를 고쳐야
            // 한다면 결국 아무도 안 고친다.
            Object.keys(over.products).forEach(function(code) {
                if (!_products.some(function(p) { return p.code === code; })) {
                    _products.push($.extend({ code: code, custom: true }, over.products[code]));
                }
            });
            Object.keys(over.certs).forEach(function(key) {
                if (!_certs.some(function(c) { return c.key === key; })) {
                    _certs.push($.extend({ key: key, custom: true }, over.certs[key]));
                }
            });

            _mall = (_company.shoppingMall || []).map(function(m) {
                return $.extend({}, m, over.mall[m.id] || {});
            });
            Object.keys(over.mall).forEach(function(id) {
                if (!_mall.some(function(m) { return m.id === id; })) {
                    _mall.push($.extend({ id: id, custom: true }, over.mall[id]));
                }
            });
            renderAll();
        })
        .catch(function(err) {
            console.error(err);
            $('#prod_tbody').html('<tr><td colspan="10" class="prod-empty">' +
                '등록 정보를 불러오지 못했습니다.<br>' + escapeHtml(err.message) + '</td></tr>');
        });
}

/* 갱신분. Firestore 를 못 쓰면 이 브라우저에만 남긴다. */
function loadOverrides() {
    var empty = { products: {}, certs: {}, mall: {} };

    if (!_db) {
        try {
            return $.Deferred().resolve(
                $.extend(true, empty, JSON.parse(localStorage.getItem(LS_OVERRIDE) || '{}'))
            ).promise();
        } catch (e) { return $.Deferred().resolve(empty).promise(); }
    }

    var d = $.Deferred();

    // firebase 가 돌려주는 건 네이티브 Promise 라 $.when 으로 엮으면
    // 기다리지 않고 바로 resolve 된다. Promise.all 로 직접 묶는다.
    Promise.all([
        _db.collection('bid_products').get(),
        _db.collection('bid_certifications').get(),
        _db.collection('bid_mall').get(),
    ]).then(function(snaps) {
        var out = { products: {}, certs: {}, mall: {} };
        snaps[0].forEach(function(doc) { out.products[doc.id] = doc.data(); });
        snaps[1].forEach(function(doc) { out.certs[doc.id] = doc.data(); });
        snaps[2].forEach(function(doc) { out.mall[doc.id] = doc.data(); });
        d.resolve(out);
    }).catch(function(err) {
        console.error('갱신 내역 로드 실패:', err);
        d.resolve(empty);
    });

    return d.promise();
}

/* ── 렌더 ────────────────────────────────────────────────────── */
function renderAll() {
    renderCompany();
    renderProducts();
    renderCerts();
    renderMall();
    renderSummary();
}

function renderCompany() {
    if (!_company) return;
    var fields = [];
    if (_company.fields) {
        if (_company.fields.thng) fields.push('물품');
        if (_company.fields.cnstwk) fields.push('공사');
        if (_company.fields.servc) fields.push('용역');
    }
    $('#prod_company').html('')
        .append($('<b>').text(_company.name || ''))
        .append($('<span class="sep">').text('|'))
        .append(document.createTextNode('등록분야 ' + (fields.join(', ') || '—')))
        .append($('<span class="sep">').text('|'))
        .append(document.createTextNode(_company.region || ''));
}

function renderProducts() {
    var $tb = $('#prod_tbody').empty();
    if (!_products.length) {
        $tb.html('<tr><td colspan="10" class="prod-empty">등록된 품목이 없습니다.</td></tr>');
        return;
    }

    _products.forEach(function(p) {
        var st = statusOf(p.regEnd);
        var $tr = $('<tr>');

        $tr.append($('<td class="mono">').text(dash(p.registeredAt)));
        $tr.append($('<td class="mono">').text(p.code));
        var $nm = $('<div class="prod-name">').text(p.name);
        if (p.custom) $nm.append($('<span class="prod-custom">').text('직접추가'));
        $tr.append($('<td>').append($nm));
        $tr.append($('<td>').text(p.made ? 'Y' : 'N'));
        $tr.append($('<td>').css('font-size', '12px').text(p.certDoc || '—'));
        $tr.append($('<td>').append(periodCell(p.certStart, p.certEnd)));
        $tr.append($('<td>').append(periodCell(p.regStart, p.regEnd)));
        $tr.append($('<td>').css('font-size', '12px').text(p.factory || '—'));
        $tr.append($('<td>').append(statusCell(st)));
        $tr.append($('<td>')
            .append(renewBtn('product', p.code, st))
            .append(p.custom ? delBtn('product', p.code, p.name) : ''));

        $tb.append($tr);
    });
}

function renderCerts() {
    var $tb = $('#cert_tbody').empty();
    if (!_certs.length) {
        $tb.html('<tr><td colspan="7" class="prod-empty">등록된 인증이 없습니다.</td></tr>');
        return;
    }

    _certs.forEach(function(c) {
        // 유효기간이 없는 인증(기업부설연구소 등)은 만료로 치지 않는다
        var st = (c.termMonths === null && !c.until)
            ? { key: 'none', label: '유효기간 없음', days: null }
            : statusOf(c.until);

        var $tr = $('<tr>');
        var $cn = $('<div class="prod-name">').text(c.name);
        if (c.custom) $cn.append($('<span class="prod-custom">').text('직접추가'));
        $tr.append($('<td>').append($cn));
        $tr.append($('<td>').css('font-size', '12.5px').text(c.doc || '—'));
        $tr.append($('<td>').css('font-size', '12.5px').text(c.issuer || '—'));
        $tr.append($('<td>').append(periodCell(c.issuedAt, c.until)));
        $tr.append($('<td>').append(statusCell(st)));
        $tr.append($('<td>').append($('<div class="prod-sub">').text(c.note || '')));
        $tr.append($('<td>')
            .append(renewBtn('cert', c.key, st))
            .append(c.custom ? delBtn('cert', c.key, c.name) : ''));

        $tb.append($tr);
    });
}

function renderMall() {
    var $tb = $('#mall_tbody').empty();
    if (!_mall.length) {
        $tb.html('<tr><td colspan="7" class="prod-empty">' +
            '등록된 쇼핑몰 계약이 없습니다. 계약이 있으시면 <b>계약 추가</b>로 넣어주세요.</td></tr>');
        return;
    }
    _mall.forEach(function(m) {
        var st = statusOf(m.until);
        var $tr = $('<tr>');
        $tr.append($('<td class="mono">').text(m.contractNo || '—'));
        var $nm = $('<div class="prod-name">').text(m.name || '');
        if (m.custom) $nm.append($('<span class="prod-custom">').text('직접추가'));
        $tr.append($('<td>').append($nm));
        $tr.append($('<td>').css('font-size', '12.5px').text(m.kind || '—'));
        $tr.append($('<td>').append(periodCell(m.issuedAt, m.until)));
        $tr.append($('<td>').append(statusCell(st)));
        $tr.append($('<td>').append($('<div class="prod-sub">').text(m.note || '')));
        $tr.append($('<td>')
            .append(renewBtn('mall', m.id, st))
            .append(m.custom ? delBtn('mall', m.id, m.name) : ''));
        $tb.append($tr);
    });
}

function periodCell(start, end) {
    if (!start && !end) {
        return $('<span class="prod-period none">').text('미입력');
    }
    var dead = end && parseDate(end) < startOfToday();
    return $('<span class="prod-period">')
        .addClass(dead ? 'dead' : '')
        .append(document.createTextNode(dash(start)))
        .append($('<span class="to">').text('~'))
        .append(document.createTextNode(dash(end)));
}

function statusCell(st) {
    var $s = $('<span class="prod-status">').addClass('prod-status-' + st.key).text(st.label);
    return $s;
}

function renewBtn(type, id, st) {
    return $('<button type="button" class="prod-renew-btn">')
        .toggleClass('urgent', st.key === 'dead' || st.key === 'renew')
        .attr('data-type', type)
        .attr('data-id', id)
        .text('갱신');
}

/* 만료까지 며칠 남았는지로 상태를 가린다. */
function statusOf(end) {
    if (!end) return { key: 'none', label: '미입력', days: null };
    var days = daysUntil(end);
    if (days < 0)  return { key: 'dead',  label: '만료됨', days: days };
    if (days <= RENEW_NOTICE_DAYS) return { key: 'renew', label: '재발급 필요 D-' + days, days: days };
    if (days <= SOON_DAYS) return { key: 'soon', label: '곧 만료 D-' + days, days: days };
    return { key: 'ok', label: 'D-' + days, days: days };
}

/* ── 요약 ────────────────────────────────────────────────────── */
function renderSummary() {
    var rows = [];
    _products.forEach(function(p) { rows.push({ name: p.name, end: p.regEnd, what: '등록' }); });
    _certs.forEach(function(c) {
        if (c.termMonths === null && !c.until) return;   // 유효기간 없는 인증은 제외
        rows.push({ name: c.name, end: c.until, what: '인증' });
    });
    // 쇼핑몰 계약은 재계약 절차가 길어 90일 기준으로 따로 본다
    _mall.forEach(function(m) { rows.push({ name: m.name, end: m.until, what: '쇼핑몰', mall: true }); });

    var dead = rows.filter(function(r) { return r.end && daysUntil(r.end) < 0; });
    var renew = rows.filter(function(r) {
        if (!r.end) return false;
        var d = daysUntil(r.end);
        return d >= 0 && d <= RENEW_NOTICE_DAYS;
    });
    var soon = rows.filter(function(r) {
        if (!r.end) return false;
        var d = daysUntil(r.end);
        return d > RENEW_NOTICE_DAYS && d <= SOON_DAYS;
    });
    var blank = rows.filter(function(r) { return !r.end; });

    var $box = $('#prod_summary').empty();

    if (dead.length) {
        $box.append(alertBox('danger', '&#9888;',
            '<strong>' + dead.length + '건이 만료됐습니다.</strong> ' +
            names(dead) + ' — 해당 품명으로는 지금 입찰에 참여할 수 없습니다. 재발급 후 날짜를 갱신하세요.'));
    }
    if (renew.length) {
        $box.append(alertBox('warn', '&#9203;',
            '<strong>' + renew.length + '건이 한 달 안에 만료됩니다.</strong> ' +
            namesWithDays(renew) + ' — 지금 재발급 신청하세요.'));
    }
    if (soon.length) {
        $box.append(alertBox('warn', '&#128197;',
            soon.length + '건이 두 달 안에 만료됩니다. ' + namesWithDays(soon)));
    }
    if (blank.length) {
        $box.append(alertBox('warn', '&#9998;',
            '<strong>' + blank.length + '건은 날짜가 비어 있습니다.</strong> ' +
            names(blank) + ' — 갱신 버튼으로 발급일을 넣어주세요.'));
    }
    if (!dead.length && !renew.length && !soon.length && !blank.length) {
        $box.append(alertBox('ok', '&#10003;', '모든 등록과 인증이 유효합니다.'));
    }
}

function alertBox(kind, icon, html) {
    return $('<div class="prod-alert">')
        .addClass('prod-alert-' + kind)
        .append($('<span class="prod-alert-icon">').html(icon))
        .append($('<div>').html(html));
}

function names(rows) {
    return rows.map(function(r) { return r.name; }).join(', ');
}
function namesWithDays(rows) {
    return rows.map(function(r) {
        return r.name + '(' + r.end + ', ' + daysUntil(r.end) + '일)';
    }).join(', ');
}

function delBtn(type, id, name) {
    return $('<button type="button" class="prod-del-btn" title="삭제">')
        .attr('data-type', type).attr('data-id', id).attr('data-name', name)
        .html('&#128465;');
}

/* ── 항목 추가 ───────────────────────────────────────────────── */
var _addType = null;

function openAdd(type) {
    _addType = type;
    $('#add_title').text(
        type === 'product' ? '등록물품 추가' : (type === 'mall' ? '쇼핑몰 계약 추가' : '인증 추가'));
    $('#add_product_fields').toggle(type === 'product');
    $('#add_cert_fields').toggle(type === 'cert');
    $('#add_mall_fields').toggle(type === 'mall');
    $('#add_mname, #add_mno, #add_mnote').val('');

    $('#add_code, #add_pname, #add_factory, #add_cname, #add_cdoc, #add_cissuer, #add_cnote').val('');
    $('#add_certdoc').val('직접생산증명서');
    $('#add_made').prop('checked', true);
    $('#add_regdate').val(toInputDate(new Date()));
    $('#add_issued').val(toInputDate(new Date()));
    $('#add_term').val(String(
        type === 'product' ? (_company.productTermMonths || 24)
            : type === 'mall' ? (_company.mallTermMonths || 24) : 24));
    $('#add_error').text('');
    if (_company && _company.name) $('#add_factory').attr('placeholder', _company.name);

    updateAddPreview();
    $('#add_modal').css('display', 'flex');
}

function closeAdd() { $('#add_modal').hide(); _addType = null; }

function updateAddPreview() {
    var termRaw = $('#add_term').val();
    var p = computePeriod($('#add_issued').val(), termRaw === '' ? null : Number(termRaw));
    var $box = $('#add_preview').empty();
    if (!p) { $box.append($('<span class="muted">').text('발급일을 선택하세요.')); return; }
    if (!p.end) {
        $box.append(document.createTextNode('시작일자 ')).append($('<b>').text(p.start))
            .append($('<br>')).append($('<span class="muted">').text('유효기간 없음으로 저장됩니다.'));
        return;
    }
    $box.append(document.createTextNode('시작일자 ')).append($('<b>').text(p.start))
        .append(document.createTextNode('  →  종료일자 ')).append($('<b>').text(p.end));
}

function saveAdd() {
    if (!_addType) return;
    var termRaw = $('#add_term').val();
    var months = termRaw === '' ? null : Number(termRaw);
    var period = computePeriod($('#add_issued').val(), months);
    if (!period) { $('#add_error').text('발급일을 선택하세요.'); return; }

    var id, patch;

    if (_addType === 'product') {
        var code = $('#add_code').val().replace(/\D/g, '');
        var name = $('#add_pname').val().trim();
        if (code.length !== 10) { $('#add_error').text('세부품명번호는 숫자 10자리입니다.'); return; }
        if (!name) { $('#add_error').text('세부품명을 입력하세요.'); return; }
        if (_products.some(function(p) { return p.code === code; })) {
            $('#add_error').text('이미 있는 품명번호입니다.'); return;
        }
        id = code;
        patch = {
            custom: true, code: code, name: name,
            registeredAt: $('#add_regdate').val() || period.start,
            made: $('#add_made').is(':checked'),
            certDoc: $('#add_certdoc').val().trim(),
            factory: $('#add_factory').val().trim() || (_company.name || ''),
            certStart: period.start, certEnd: period.end,
            regStart: period.start, regEnd: period.end,
            renewedAt: period.start,
        };
    } else if (_addType === 'mall') {
        var mname = $('#add_mname').val().trim();
        if (!mname) { $('#add_error').text('계약 품명을 입력하세요.'); return; }
        id = 'mall_' + Date.now().toString(36);
        patch = {
            custom: true, id: id, name: mname,
            contractNo: $('#add_mno').val().trim(),
            kind: $('#add_mkind').val(),
            note: $('#add_mnote').val().trim(),
            termMonths: months,
            issuedAt: period.start, until: period.end,
            renewedAt: period.start,
        };
    } else {
        var cname = $('#add_cname').val().trim();
        if (!cname) { $('#add_error').text('인증명을 입력하세요.'); return; }
        // 이름이 바뀌어도 문서가 갈라지지 않도록 한 번 만든 id 를 그대로 쓴다
        id = 'custom_' + Date.now().toString(36);
        patch = {
            custom: true, key: id, name: cname,
            doc: $('#add_cdoc').val().trim(),
            issuer: $('#add_cissuer').val().trim(),
            note: $('#add_cnote').val().trim(),
            termMonths: months,
            issuedAt: period.start, until: period.end,
            renewedAt: period.start,
        };
    }

    $('#add_confirm').prop('disabled', true);
    persist(_addType, id, patch)
        .then(function() {
            if (_addType === 'product') _products.push(patch);
            else if (_addType === 'mall') _mall.push(patch);
            else _certs.push(patch);
            renderAll();
            closeAdd();
        })
        .catch(function(err) {
            console.error(err);
            $('#add_error').text('저장하지 못했습니다: ' + err.message);
        })
        .then(function() { $('#add_confirm').prop('disabled', false); });
}

/* company.json 에 있는 항목은 지워도 다시 살아나므로 직접 넣은 것만 지운다. */
function removeItem(type, id, name) {
    if (!window.confirm('\u2018' + name + '\u2019 항목을 삭제할까요?')) return;

    var coll = type === 'product' ? 'bid_products'
        : type === 'mall' ? 'bid_mall' : 'bid_certifications';
    var after = function() {
        if (type === 'product') {
            _products = _products.filter(function(p) { return p.code !== id; });
        } else if (type === 'mall') {
            _mall = _mall.filter(function(m) { return m.id !== id; });
        } else {
            _certs = _certs.filter(function(c) { return c.key !== id; });
        }
        renderAll();
    };

    if (!_db) {
        try {
            var all = JSON.parse(localStorage.getItem(LS_OVERRIDE) || '{}');
            var bucket = type === 'product' ? 'products' : (type === 'mall' ? 'mall' : 'certs');
            if (all[bucket]) delete all[bucket][id];
            localStorage.setItem(LS_OVERRIDE, JSON.stringify(all));
        } catch (e) {}
        after();
        return;
    }
    _db.collection(coll).doc(id).delete().then(after).catch(function(err) {
        console.error(err);
        window.alert('삭제하지 못했습니다: ' + err.message);
    });
}

/* ── 갱신 ────────────────────────────────────────────────────── */
function openRenew(type, id) {
    var item = (type === 'product')
        ? _products.filter(function(p) { return p.code === id; })[0]
        : (type === 'mall')
            ? _mall.filter(function(m) { return m.id === id; })[0]
            : _certs.filter(function(c) { return c.key === id; })[0];
    if (!item) return;

    _renewTarget = { type: type, id: id, item: item };

    $('#renew_title').text(
        type === 'product' ? '등록물품 갱신' : (type === 'mall' ? '쇼핑몰 계약 갱신' : '인증 갱신'));
    $('#renew_target').html('')
        .append($('<b>').text(item.name))
        .append($('<span class="code">').text(
            type === 'product' ? '세부품명번호 ' + item.code
                : type === 'mall' ? (item.contractNo ? '계약번호 ' + item.contractNo : (item.kind || ''))
                : (item.doc || '')));

    // 재발급일 기본값은 오늘. 유효기간은 항목에 정해진 값을 먼저 쓴다.
    $('#renew_date').val(toInputDate(new Date()));
    var term = (type === 'product') ? (_company.productTermMonths || 24)
        : (type === 'mall') ? (item.termMonths || _company.mallTermMonths || 24)
        : item.termMonths;
    $('#renew_term').val(term === null || term === undefined ? '' : String(term));

    $('#renew_error').text('');
    updatePreview();
    $('#renew_modal').css('display', 'flex');
}

function closeRenew() {
    $('#renew_modal').hide();
    _renewTarget = null;
}

/* 재발급일과 유효기간으로 시작·종료일을 계산한다.
 * 종료일은 '시작일 + 기간 - 하루'다. 등록증의 실제 값이 그렇게 되어 있다
 * (2024-11-10 발급 → 2026-11-09 종료). */
function computePeriod(issued, months) {
    if (!issued) return null;
    var start = parseDate(issued);
    if (!start || isNaN(start.getTime())) return null;
    if (months === null) return { start: issued, end: null };

    var end = new Date(start.getFullYear(), start.getMonth() + Number(months), start.getDate());
    end.setDate(end.getDate() - 1);
    return { start: toInputDate(start), end: toInputDate(end) };
}

function updatePreview() {
    var issued = $('#renew_date').val();
    var termRaw = $('#renew_term').val();
    var months = termRaw === '' ? null : Number(termRaw);
    var p = computePeriod(issued, months);

    var $box = $('#renew_preview').empty();
    if (!p) {
        $box.append($('<span class="muted">').text('재발급일을 선택하세요.'));
        return;
    }
    if (!p.end) {
        $box.append(document.createTextNode('시작일자 '))
            .append($('<b>').text(p.start))
            .append($('<br>'))
            .append($('<span class="muted">').text('유효기간 없음으로 저장됩니다.'));
        return;
    }
    $box.append(document.createTextNode('시작일자 '))
        .append($('<b>').text(p.start))
        .append(document.createTextNode('  →  종료일자 '))
        .append($('<b>').text(p.end))
        .append($('<br>'))
        .append($('<span class="muted">').text(
            _renewTarget && _renewTarget.type === 'product'
                ? '제조생산증명 유효기간과 등록 유효기간에 같이 반영됩니다.'
                : '이 인증의 유효기간으로 저장됩니다.'));
}

function saveRenew() {
    if (!_renewTarget) return;

    var issued = $('#renew_date').val();
    var termRaw = $('#renew_term').val();
    var months = termRaw === '' ? null : Number(termRaw);
    var p = computePeriod(issued, months);

    if (!p) {
        $('#renew_error').text('재발급일을 선택하세요.');
        return;
    }

    var type = _renewTarget.type;
    var id = _renewTarget.id;
    var patch;

    if (type === 'product') {
        // 등록증에서 두 기간이 같은 날짜로 움직이므로 함께 갱신한다.
        patch = {
            certStart: p.start, certEnd: p.end,
            regStart: p.start, regEnd: p.end,
            renewedAt: issued,
        };
    } else {
        // 인증과 쇼핑몰 계약은 기간 한 쌍만 쓴다
        patch = { issuedAt: p.start, until: p.end, termMonths: months, renewedAt: issued };
    }

    $('#renew_confirm').prop('disabled', true);
    persist(type, id, patch)
        .then(function() {
            // 화면 쪽도 바로 반영
            var list = type === 'product' ? _products : (type === 'mall' ? _mall : _certs);
            var key = type === 'product' ? 'code' : (type === 'mall' ? 'id' : 'key');
            list.forEach(function(x) { if (x[key] === id) $.extend(x, patch); });
            renderAll();
            closeRenew();
        })
        .catch(function(err) {
            console.error(err);
            $('#renew_error').text('저장하지 못했습니다: ' + err.message);
        })
        .then(function() {
            $('#renew_confirm').prop('disabled', false);
        });
}

function persist(type, id, patch) {
    var coll = type === 'product' ? 'bid_products'
        : type === 'mall' ? 'bid_mall' : 'bid_certifications';

    if (!_db) {
        return new Promise(function(resolve, reject) {
            try {
                var all = JSON.parse(localStorage.getItem(LS_OVERRIDE) || '{}');
                var bucket = type === 'product' ? 'products' : (type === 'mall' ? 'mall' : 'certs');
                if (!all[bucket]) all[bucket] = {};
                all[bucket][id] = $.extend({}, all[bucket][id], patch);
                localStorage.setItem(LS_OVERRIDE, JSON.stringify(all));
                resolve();
            } catch (e) { reject(e); }
        });
    }

    return _db.collection(coll).doc(id).set(
        $.extend({}, patch, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }),
        { merge: true }
    );
}

/* ── 날짜 유틸 ───────────────────────────────────────────────── */
function parseDate(s) {
    if (!s) return null;
    var d = String(s).replace(/\D/g, '');
    if (d.length < 8) return null;
    return new Date(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8));
}

function startOfToday() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

/* 만료일까지 남은 일수. 만료일 당일은 0(아직 유효). */
function daysUntil(end) {
    var d = parseDate(end);
    if (!d) return null;
    return Math.round((d - startOfToday()) / 86400000);
}

function toInputDate(d) {
    if (typeof d === 'string') return d;
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function pad(n) { return n < 10 ? '0' + n : String(n); }
function dash(s) { return s || '—'; }

function escapeHtml(s) {
    return $('<div>').text(String(s == null ? '' : s)).html();
}
