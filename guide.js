/* guide.js — 입찰 가이드
 *
 * 서류 목록은 bid-docs.js 에서, 등록 현황은 company.json 에서 가져온다.
 * 가이드에 숫자를 손으로 박아두면 등록을 갱신했을 때 가이드만 옛날 값이
 * 남는다. 화면이 실제 데이터를 읽게 한다.
 */

var _company = null;

$(function() {
    renderDocs();
    fetch('company.json', { cache: 'no-store' })
        .then(function(res) {
            if (!res.ok) throw new Error('company.json HTTP ' + res.status);
            return res.json();
        })
        .then(function(data) {
            _company = data;
            renderReady();
            renderOurs();
        })
        .catch(function(err) {
            console.error(err);
            $('#gd_ready').html('<tr><td colspan="3" class="gd-empty">등록 정보를 불러오지 못했습니다.</td></tr>');
            $('#gd_ours').html('<p class="gd-empty">등록 정보를 불러오지 못했습니다.</p>');
        });
});

/* ── 1. 사전 준비 ─────────────────────────────────────────────
 * 현재 상태는 등록 내용에서 계산한다. 가이드가 실제와 어긋나면 안 본다. */
function renderReady() {
    var rows = [
        {
            name: '사업자용 공동인증서',
            src: { name: '금융기관 · 인증기관', url: '' },
            state: { kind: 'todo', text: '만료일 확인' },
        },
        {
            name: '개인용 인증서 (투찰 담당자)',
            src: { name: '금융기관 · 인증기관', url: '' },
            state: { kind: 'todo', text: '담당자 명의로 필요' },
        },
        {
            name: '나라장터 입찰참가자격 등록',
            src: BID_DOC_SOURCES.g2b,
            state: readyStateForRegistration(),
        },
        {
            name: '직접생산확인증명서',
            src: BID_DOC_SOURCES.smpp,
            state: readyStateForProducts(),
        },
        {
            name: '중소기업 확인서',
            src: BID_DOC_SOURCES.smes,
            state: { kind: 'todo', text: '중기간 경쟁제품 입찰 시 필요' },
        },
        {
            name: '나라장터 보안모듈',
            src: BID_DOC_SOURCES.g2b,
            state: { kind: 'todo', text: '투찰 PC 에 미리 설치' },
        },
    ];

    var $tb = $('#gd_ready').empty();
    rows.forEach(function(r) {
        var $tr = $('<tr>');
        $tr.append($('<td>').append($('<b>').text(r.name)));
        $tr.append($('<td>').append(srcLink(r.src)));
        $tr.append($('<td>').append(
            $('<span class="gd-state">').addClass('gd-state-' + r.state.kind).text(r.state.text)));
        $tb.append($tr);
    });
}

function readyStateForRegistration() {
    if (!_company) return { kind: 'todo', text: '확인 필요' };
    var f = _company.fields || {};
    var got = [];
    if (f.thng) got.push('물품');
    if (f.cnstwk) got.push('공사');
    if (f.servc) got.push('용역');
    return { kind: 'ok', text: '등록 완료 — ' + (got.join(', ') || '없음') };
}

function readyStateForProducts() {
    if (!_company || !_company.products) return { kind: 'todo', text: '확인 필요' };
    var today = startOfToday();
    var alive = 0, dead = [];
    _company.products.forEach(function(p) {
        if (p.regEnd && parseDate(p.regEnd) >= today) alive++;
        else dead.push(p.name);
    });
    if (dead.length) {
        return { kind: 'bad', text: alive + '개 유효 · ' + dead.join(', ') + ' 만료' };
    }
    return { kind: 'ok', text: alive + '개 품목 유효' };
}

/* ── 4. 서류 ─────────────────────────────────────────────────── */
function renderDocs() {
    var $box = $('#gd_docs').empty();

    BID_STAGES.forEach(function(stage) {
        var list = BID_DOCUMENTS.filter(function(d) { return d.stage === stage.key; });
        if (!list.length) return;

        var $sec = $('<div class="gd-docgroup">');
        $sec.append($('<h4>').text(stage.title));
        if (stage.note) $sec.append($('<p class="gd-docgroup-note">').text(stage.note));

        var $tb = $('<tbody>');
        list.forEach(function(d) {
            var $tr = $('<tr>');

            var $nm = $('<td>').append($('<b>').text(d.name));
            if (d.gain) $nm.append($('<span class="gd-gain">').text('가점'));
            if (d.kinds) {
                $nm.append($('<span class="gd-only">').text(
                    d.kinds.map(kindLabel).join('·') + ' 전용'));
            }
            $tr.append($nm);
            $tr.append($('<td>').append(srcLink(bidDocSource(d))));
            $tr.append($('<td class="gd-docnote">').text(d.note || ''));
            $tb.append($tr);
        });

        $sec.append($('<div class="gd-table-wrap">').append(
            $('<table class="gd-table">')
                .append('<thead><tr><th style="width:230px">서류</th>' +
                        '<th style="width:260px">발급처</th><th>비고</th></tr></thead>')
                .append($tb)
        ));
        $box.append($sec);
    });
}

function srcLink(src) {
    if (!src) return $('<span class="gd-nosrc">').text('—');
    if (!src.url) return $('<span class="gd-nosrc">').text(src.name);
    return $('<a target="_blank" rel="noopener">')
        .attr('href', src.url).text(src.name + ' ↗');
}

/* ── 6. 우리 회사에 해당하는 것 ──────────────────────────────── */
function renderOurs() {
    var $box = $('#gd_ours').empty();
    if (!_company) return;

    var f = _company.fields || {};
    if (!f.cnstwk) {
        $box.append(note('bad',
            '공사는 참여할 수 없습니다. 등록증에 공사 분야 체크가 없고 업종(면허) 목록도 비어 있습니다. ' +
            '옥외광고물 설치공사 공고가 보여도 투찰이 안 됩니다.'));
    }

    var certs = _company.certifications || [];
    if (certs.length) {
        $box.append(note('good',
            '가점 ' + certs.length + '종을 갖고 계십니다 — ' +
            certs.map(function(c) { return c.name; }).join(', ') + '. ' +
            '소액 물품 적격심사에서 순위를 바꾸는 폭입니다. 확인서를 빠짐없이 첨부하세요.'));
    }

    // 만료·임박 품목
    var today = startOfToday();
    var dead = [], soon = [];
    (_company.products || []).forEach(function(p) {
        if (!p.regEnd) return;
        var days = Math.round((parseDate(p.regEnd) - today) / 86400000);
        if (days < 0) dead.push(p.name + ' (' + p.regEnd + ')');
        else if (days <= 60) soon.push(p.name + ' (' + p.regEnd + ', ' + days + '일)');
    });

    if (dead.length) {
        $box.append(note('bad', '등록이 만료된 품목: ' + dead.join(', ') +
            ' — 해당 품명 공고는 지금 참여할 수 없습니다.'));
    }
    if (soon.length) {
        $box.append(note('warn', '곧 만료: ' + soon.join(', ') + ' — 재발급을 서두르세요.'));
    }

    $box.append($('<p class="gd-ours-link">').append(
        $('<a href="products.html">').text('등록 품목·인증 관리 →')));
}

function note(kind, text) {
    return $('<div class="gd-note-box">').addClass('gd-note-' + kind).text(text);
}

/* ── 잡다한 것들 ─────────────────────────────────────────────── */
function kindLabel(k) {
    return { thng: '물품', cnstwk: '공사', servc: '용역' }[k] || k;
}
function parseDate(s) {
    var d = String(s || '').replace(/\D/g, '');
    if (d.length < 8) return null;
    return new Date(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8));
}
function startOfToday() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
