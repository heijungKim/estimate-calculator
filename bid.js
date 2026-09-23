/* bid.js — 나라장터 입찰공고 조회
 *
 * 서비스키는 이 파일에 없다. 공고 데이터는 두 경로 중 하나로 온다.
 *
 *   1. GitHub Actions 수집분 (기본)
 *      워크플로가 1시간마다 받아 bid-data 브랜치에 올린 JSON 을 그대로 읽는다.
 *      raw.githubusercontent.com 이 CORS 를 허용해서 중계 서버가 필요 없다.
 *
 *   2. Cloudflare Worker (선택)
 *      BID_PROXY_BASE 를 채우면 화면 조건대로 실시간 조회한다.
 *
 *   둘 다 없으면 예시 데이터로 화면만 보여준다.
 *
 * 걸러내기는 어느 경로든 render() 에서 한 번 더 한다. 2번은 서버에서 이미
 * 걸러 오므로 같은 조건을 다시 적용해도 결과가 바뀌지 않는다.
 */

var _items    = [];      // 정규화된 공고 목록 (출처가 넘겨준 그대로)
var _favs     = {};      // { [id]: true } 관심공고
var _keywords = [];
var _sort     = 'closeAt';
var _source   = null;    // { mode, fetchedAt, range, keywords } 데이터 출처 정보
var _db       = null;    // Firestore. 못 쓰면 null (localStorage 로 대체)

var LS_KEYWORDS = 'bid_keywords_v1';
var LS_NOTICE   = 'bid_notice_dismissed_v1';
var LS_FAVS     = 'bid_favs_v1';     // Firestore 를 못 쓸 때만 사용

$(function() {
    initDb();
    restoreKeywords();
    renderChips();
    initDates();
    restoreNotice();
    bindEvents();

    if (!proxyBase() && !dataUrl()) $('#bid_setup').show();

    loadFavs().always(function() {
        loadBids();
    });
});

/* ── 초기화 ──────────────────────────────────────────────────── */
function initDb() {
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length && firebase.firestore) {
            _db = firebase.firestore();
        }
    } catch (e) {
        _db = null;
    }
}

function proxyBase() {
    var b = (typeof BID_PROXY_BASE !== 'undefined' && BID_PROXY_BASE) ? BID_PROXY_BASE : '';
    return String(b).replace(/\/+$/, '');
}

function dataUrl() {
    return (typeof BID_DATA_URL !== 'undefined' && BID_DATA_URL) ? String(BID_DATA_URL) : '';
}

function restoreKeywords() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(LS_KEYWORDS) || 'null'); } catch (e) {}
    if (saved && saved.length) _keywords = saved;
    else _keywords = (typeof BID_DEFAULT_KEYWORDS !== 'undefined' ? BID_DEFAULT_KEYWORDS : []).slice();
}

function saveKeywords() {
    try { localStorage.setItem(LS_KEYWORDS, JSON.stringify(_keywords)); } catch (e) {}
}

function initDates() {
    var days = (typeof BID_DEFAULT_DAYS !== 'undefined') ? BID_DEFAULT_DAYS : 7;
    var to = new Date();
    var from = new Date();
    from.setDate(from.getDate() - days);
    $('#bid_to').val(toInputDate(to));
    $('#bid_from').val(toInputDate(from));

    var kinds = (typeof BID_DEFAULT_KINDS !== 'undefined') ? BID_DEFAULT_KINDS : ['thng', 'cnstwk'];
    $('.bid-kind').each(function() {
        $(this).prop('checked', kinds.indexOf($(this).val()) > -1);
    });
}

function restoreNotice() {
    var hidden = false;
    try { hidden = localStorage.getItem(LS_NOTICE) === '1'; } catch (e) {}
    if (hidden) $('#bid_notice').hide();
}

function bindEvents() {
    $('#bid_reload').click(loadBids);
    $('#bid_reset').click(resetFilters);

    $('#bid_notice_dismiss').click(function() {
        $('#bid_notice').slideUp(150);
        try { localStorage.setItem(LS_NOTICE, '1'); } catch (e) {}
    });

    // 키워드 칩
    $('#bid_chip_input').keydown(function(e) {
        var val = $(this).val();
        if (e.which === 13) {
            e.preventDefault();
            addKeyword(val);
            $(this).val('');
        } else if (e.which === 8 && val === '' && _keywords.length) {
            // 빈 칸에서 백스페이스 → 마지막 칩 삭제
            _keywords.pop();
            saveKeywords();
            renderChips();
            render();
        }
    });
    $('#bid_chips').click(function(e) {
        if (e.target === this) $('#bid_chip_input').focus();
    });
    $(document).on('click', '.bid-chip button', function() {
        removeKeyword($(this).closest('.bid-chip').data('kw'));
    });

    // 정렬 탭
    $('.bid-view-tab').click(function() {
        $('.bid-view-tab').removeClass('active');
        $(this).addClass('active');
        _sort = $(this).data('sort');
        render();
    });

    // 수집분을 보고 있을 때는 재조회 없이 곧바로 다시 걸러내면 된다
    $('#bid_only_open, #bid_only_fav, .bid-kind').change(render);
    $('#bid_region, #bid_min_price, #bid_max_price, #bid_from, #bid_to').on('change', render);

    // 관심공고 토글
    $(document).on('click', '.bid-star', function(e) {
        e.stopPropagation();
        toggleFav($(this).closest('tr').data('id'));
    });

    // 행 클릭 → 상세
    $(document).on('click', '#bid_tbody tr', function() {
        openDetail($(this).data('id'));
    });
    $('#bid_detail_close, #bid_detail_cancel').click(function() {
        $('#bid_detail_modal').hide();
    });
    $('#bid_detail_modal').click(function(e) {
        if (e.target === this) $(this).hide();
    });
}

function resetFilters() {
    _keywords = (typeof BID_DEFAULT_KEYWORDS !== 'undefined' ? BID_DEFAULT_KEYWORDS : []).slice();
    saveKeywords();
    renderChips();
    initDates();
    $('#bid_region, #bid_min_price, #bid_max_price').val('');
    $('#bid_only_open').prop('checked', true);
    $('#bid_only_fav').prop('checked', false);
    render();
}

/* ── 키워드 칩 ───────────────────────────────────────────────── */
function addKeyword(raw) {
    // 한 번에 여러 개 붙여넣는 경우도 받아준다
    String(raw || '').split(/[,\s]+/).forEach(function(k) {
        k = k.trim();
        if (k && _keywords.indexOf(k) === -1) _keywords.push(k);
    });
    saveKeywords();
    renderChips();
    render();
}

function removeKeyword(kw) {
    var i = _keywords.indexOf(String(kw));
    if (i > -1) {
        _keywords.splice(i, 1);
        saveKeywords();
        renderChips();
        render();
    }
}

function renderChips() {
    $('#bid_chips .bid-chip').remove();
    var $input = $('#bid_chip_input');
    _keywords.forEach(function(kw) {
        $('<span class="bid-chip">')
            .attr('data-kw', kw)
            .append($('<span>').text(kw))
            .append('<button type="button" title="삭제">&times;</button>')
            .insertBefore($input);
    });
}

/* ── 관심공고 ────────────────────────────────────────────────── */
function loadFavs() {
    if (!_db) {
        try { _favs = JSON.parse(localStorage.getItem(LS_FAVS) || '{}'); } catch (e) { _favs = {}; }
        return $.Deferred().resolve().promise();
    }
    var d = $.Deferred();
    _db.collection('bid_favorites').get()
        .then(function(snap) {
            _favs = {};
            snap.forEach(function(doc) { _favs[doc.id] = true; });
            d.resolve();
        })
        .catch(function(err) {
            console.error('관심공고 로드 실패:', err);
            d.resolve();   // 실패해도 목록 조회는 진행한다
        });
    return d.promise();
}

function toggleFav(id) {
    if (!id) return;
    var on = !_favs[id];
    if (on) _favs[id] = true; else delete _favs[id];

    $('#bid_tbody tr[data-id="' + cssEscape(id) + '"] .bid-star')
        .toggleClass('on', on)
        .html(on ? '&#9733;' : '&#9734;');

    if (!_db) {
        try { localStorage.setItem(LS_FAVS, JSON.stringify(_favs)); } catch (e) {}
        return;
    }

    var ref = _db.collection('bid_favorites').doc(id);
    var p;
    if (on) {
        var rec = findItem(id) || {};
        p = ref.set({
            no: rec.no || '', ord: rec.ord || '', kind: rec.kind || '',
            name: rec.name || '', closeAt: rec.closeAt || '', url: rec.url || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } else {
        p = ref.delete();
    }
    p.catch(function(err) { console.error('관심공고 저장 실패:', err); });
}

/* ── 공고 조회 ───────────────────────────────────────────────── */
function loadBids() {
    $('#bid_reload').prop('disabled', true);
    showState('<span class="bid-spinner"></span>공고를 불러오는 중입니다…');
    $('#bid_tbody').empty();
    $('#bid_meta').text('');

    var done = function() { $('#bid_reload').prop('disabled', false); };

    if (proxyBase()) return loadFromProxy(done);
    if (dataUrl())   return loadFromData(done);

    // 출처가 없으면 화면 확인용 예시 데이터
    _items = mockItems();
    _source = { mode: 'mock' };
    done();
    render();
}

/* 1) GitHub Actions 수집분 */
function loadFromData(done) {
    // 수집 주기가 1시간이라 CDN 캐시(5분)를 굳이 피할 이유는 없지만,
    // '불러오기'를 눌렀을 때는 최신을 보여주는 게 맞다.
    fetch(dataUrl(), { cache: 'no-store' })
        .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status +
                (res.status === 404 ? ' — 아직 첫 수집이 돌지 않았습니다.' : ''));
            return res.json();
        })
        .then(function(data) {
            _items = (data && data.items) || [];
            _source = {
                mode: 'data',
                fetchedAt: data.fetchedAt,
                range: data.range,
                keywords: data.keywords || [],
            };

            // 날짜 칸을 수집 기간에 맞춘다. 수집은 14일치인데 화면 기본값이
            // 7일이면, 모아둔 공고가 이유도 없이 목록에서 빠져 보인다.
            // 여기서 맞춰두면 처음엔 수집분 전체가 보이고, 좁히는 건 사용자 몫이 된다.
            if (data.range && data.range.from && data.range.to) {
                $('#bid_from').val(dashDate(data.range.from));
                $('#bid_to').val(dashDate(data.range.to));
            }

            done();
            render();
        })
        .catch(function(err) {
            done();
            // 아직 첫 수집이 안 돈 상태라면, 오류 문구만 던지지 말고
            // 무엇을 해야 하는지까지 같이 보여준다.
            if (String(err.message).indexOf('404') > -1) $('#bid_setup').show();
            showState('수집된 공고를 불러오지 못했습니다.<code>' +
                escapeHtml(err.message) + '</code>', 'error');
        });
}

/* 2) Cloudflare Worker 실시간 조회 */
function loadFromProxy(done) {
    var kinds = $('.bid-kind:checked').map(function() { return this.value; }).get();
    if (!kinds.length) {
        done();
        showState('업무구분을 하나 이상 선택하세요.', 'error');
        return;
    }

    $.getJSON(proxyBase() + '/bids', {
        kind:     kinds.join(','),
        keywords: _keywords.join(','),
        from:     fromInputDate($('#bid_from').val()),
        to:       fromInputDate($('#bid_to').val()),
        region:   $('#bid_region').val().trim(),
        minPrice: $('#bid_min_price').val(),
        maxPrice: $('#bid_max_price').val(),
    })
    .done(function(res) {
        _items = (res && res.items) || [];
        _source = {
            mode: 'proxy',
            range: res && res.range,
            calls: res && res.meta && res.meta.upstreamCalls,
            truncated: res && res.meta && res.meta.truncated,
        };
        done();
        render();
    })
    .fail(function(xhr) {
        var detail;
        if (xhr.responseJSON && xhr.responseJSON.error) detail = xhr.responseJSON.error;
        else if (xhr.status === 0) detail = '중계 서버에 닿지 못했습니다. Worker 주소와 ALLOWED_ORIGINS 설정을 확인하세요.';
        else detail = 'HTTP ' + xhr.status + ' ' + (xhr.statusText || '');
        done();
        showState('공고를 불러오지 못했습니다.<code>' + escapeHtml(detail) + '</code>', 'error');
    });
}

/* ── 렌더 ────────────────────────────────────────────────────── */
function render() {
    var onlyOpen = $('#bid_only_open').is(':checked');
    var onlyFav  = $('#bid_only_fav').is(':checked');
    var kinds    = $('.bid-kind:checked').map(function() { return this.value; }).get();
    var region   = $('#bid_region').val().trim();
    var minPrice = numOrNull($('#bid_min_price').val());
    var maxPrice = numOrNull($('#bid_max_price').val());
    var from     = fromInputDate($('#bid_from').val());
    var to       = fromInputDate($('#bid_to').val());
    var now      = new Date();

    var list = _items.filter(function(r) {
        if (onlyFav && !_favs[r.id]) return false;
        if (kinds.length && kinds.indexOf(r.kind) === -1) return false;
        if (_keywords.length && !matchesKeyword(r, _keywords)) return false;
        if (region && (r.regions || '').indexOf(region) === -1) return false;
        if (minPrice != null && !(r.estPrice != null && r.estPrice >= minPrice)) return false;
        if (maxPrice != null && !(r.estPrice != null && r.estPrice <= maxPrice)) return false;

        var d = digits8(r.noticeAt);
        if (d && from && d < from) return false;
        if (d && to && d > to) return false;

        if (onlyOpen) {
            var c = parseDt(r.closeAt);
            if (c && c < now) return false;
        }
        return true;
    });

    list.sort(function(a, b) {
        if (_sort === 'estPrice') {
            // 금액 미기재 건은 뒤로
            return (b.estPrice || -1) - (a.estPrice || -1);
        }
        if (_sort === 'noticeAt') {
            return String(b.noticeAt || '').localeCompare(String(a.noticeAt || ''));
        }
        // 마감 임박순 — 마감 정보 없는 건은 뒤로
        return String(a.closeAt || '9999').localeCompare(String(b.closeAt || '9999'));
    });

    $('#bid_count').html('공고 <b>' + list.length + '</b>건');
    $('#bid_meta').text(metaLine());

    var $tb = $('#bid_tbody').empty();
    if (!list.length) {
        showState(_items.length
            ? '조건에 맞는 공고가 없습니다. 키워드나 기간을 넓혀보세요.'
            : '조회된 공고가 없습니다.');
        return;
    }
    hideState();

    list.forEach(function(r) {
        $tb.append(buildRow(r, now));
    });
}

/* 데이터가 언제 것인지, 무엇까지 담겨 있는지 한 줄로 알려준다. */
function metaLine() {
    if (!_source) return '';
    var bits = [];

    if (_source.mode === 'mock') {
        return '· 예시 데이터 (수집 설정 전)';
    }
    if (_source.mode === 'proxy') {
        if (_source.calls != null) bits.push('API 호출 ' + _source.calls + '회');
        if (_source.truncated) bits.push('결과가 잘렸습니다 — 기간을 좁혀보세요');
        return bits.length ? '· ' + bits.join(' · ') : '';
    }

    // 수집분
    if (_source.fetchedAt) bits.push(agoText(_source.fetchedAt) + ' 수집');
    if (_source.range) bits.push('공고일 ' + dashDate(_source.range.from) + '~' + dashDate(_source.range.to));
    bits.push('전체 ' + _items.length + '건');

    // 수집 때 안 걸린 키워드를 화면에서 찾으면 결과가 없는 게 당연한데,
    // 그 이유가 화면에 안 보이면 한참 헤매게 된다.
    var collected = _source.keywords || [];
    if (collected.length) {
        var outside = _keywords.filter(function(k) { return collected.indexOf(k) === -1; });
        if (outside.length) bits.push('수집 대상 밖 키워드: ' + outside.join(', '));
    }
    return '· ' + bits.join(' · ');
}

function buildRow(r, now) {
    var fav = !!_favs[r.id];
    var dd = ddayInfo(r.closeAt, now);

    var $tr = $('<tr>').attr('data-id', r.id);

    $tr.append($('<td>').append(
        $('<button type="button" class="bid-star">')
            .addClass(fav ? 'on' : '')
            .attr('title', fav ? '관심공고 해제' : '관심공고 담기')
            .html(fav ? '&#9733;' : '&#9734;')
    ));

    $tr.append($('<td>').append(
        $('<span class="bid-badge">')
            .addClass('bid-badge-' + r.kind)
            .text(kindLabel(r.kind))
    ));

    $tr.append($('<td>')
        .append($('<div class="bid-name">').text(r.name || '(공고명 없음)'))
        .append($('<div class="bid-inst">').text(instLine(r)))
    );

    $tr.append($('<td class="num">').text(r.estPrice != null ? comma(r.estPrice) : '—'));
    $tr.append($('<td>').css('font-size', '12.5px').text(shortRegion(r.regions)));
    $tr.append($('<td class="bid-when">').text(dateOnly(r.noticeAt)));
    $tr.append($('<td class="bid-when">').text(dateTime(r.closeAt)));
    $tr.append($('<td>').append(
        $('<span class="bid-dday">').addClass('bid-dday-' + dd.level).text(dd.text)
    ));

    return $tr;
}

function instLine(r) {
    var a = r.noticeInst || '';
    var b = r.demandInst || '';
    if (a && b && a !== b) return a + ' · 수요기관 ' + b;
    return a || b || '';
}

function shortRegion(s) {
    s = String(s || '').trim();
    if (!s) return '전국';
    // "경기도 안양시, 경기도 군포시" 처럼 길게 오는 경우가 많아 앞만 보여준다
    var parts = s.split(/\s*,\s*/).filter(Boolean);
    if (parts.length <= 1) return parts[0] || '전국';
    return parts[0] + ' 외 ' + (parts.length - 1);
}

function matchesKeyword(rec, keywords) {
    var hay = (rec.name || '') + ' ' + (rec.industry || '');
    return keywords.some(function(k) { return hay.indexOf(k) > -1; });
}

/* ── 상세 ────────────────────────────────────────────────────── */
function openDetail(id) {
    var r = findItem(id);
    if (!r) return;

    var $dl = $('<dl class="bid-detail-grid">');
    function row(k, v, cls) {
        $dl.append($('<dt>').text(k));
        $dl.append($('<dd>').addClass(cls || '').text(v == null || v === '' ? '—' : v));
    }

    row('공고번호', r.no + (r.ord && r.ord !== '000' ? ' (차수 ' + r.ord + ')' : ''));
    row('업무구분', kindLabel(r.kind));
    row('공고기관', r.noticeInst);
    row('수요기관', r.demandInst);
    $dl.append('<hr class="bid-detail-sep">');
    row('추정가격', r.estPrice != null ? comma(r.estPrice) + ' 원' : '', 'num');
    row('배정예산', r.budget != null ? comma(r.budget) + ' 원' : '', 'num');
    row('낙찰하한율', r.lowerRate != null ? r.lowerRate + ' %' : '', 'num');
    row('계약방법', r.method);
    row('업종', r.industry);
    row('참가지역', r.regions || '전국');
    $dl.append('<hr class="bid-detail-sep">');
    row('공고일시', dateTime(r.noticeAt));
    row('마감일시', dateTime(r.closeAt));
    row('개찰일시', dateTime(r.openAt));

    var $checklist = $(
        '<div class="bid-checklist">' +
        '<h4>투찰 전 확인</h4>' +
        '<label><input type="checkbox"> 참가가능지역·업종에 우리 회사가 해당하는지 확인</label>' +
        '<label><input type="checkbox"> 공고문·과업내용서 내려받아 규격과 수량 확인</label>' +
        '<label><input type="checkbox"> 견적 계산기로 제작원가 산출 (이 금액 아래로는 적자)</label>' +
        '<label><input type="checkbox"> 입찰참가자격 등록 및 제출서류 준비</label>' +
        '<label><input type="checkbox"> 마감시각 전 여유 확보 — 인증서 로그인에 시간이 걸립니다</label>' +
        '<p class="bid-checklist-note">' +
        '투찰 금액 입력과 제출은 나라장터에서 인증서로 본인 확인을 거쳐 직접 하셔야 합니다.' +
        '</p></div>'
    );

    $('#bid_detail_body').empty()
        .append($('<p class="bid-detail-name">').text(r.name || '(공고명 없음)'))
        .append($dl)
        .append($checklist);

    var url = r.url || 'https://www.g2b.go.kr/';   // 상세 URL 이 비어 오는 건도 있다
    $('#bid_detail_open').off('click').click(function() {
        window.open(url, '_blank', 'noopener');
    });

    $('#bid_detail_modal').css('display', 'flex');
}

function findItem(id) {
    for (var i = 0; i < _items.length; i++) {
        if (_items[i].id === id) return _items[i];
    }
    return null;
}

/* ── 상태 표시 ───────────────────────────────────────────────── */
function showState(html, kind) {
    $('#bid_state').html(html)
        .toggleClass('bid-state-error', kind === 'error')
        .show();
}
function hideState() {
    $('#bid_state').hide().removeClass('bid-state-error');
}

/* ── 날짜·숫자 유틸 ──────────────────────────────────────────── */

/* 업스트림 날짜 형식이 일정하지 않다.
 * "2026-09-30 17:00:00", "2026-09-30 17:00", "202609301700", "20260930" 를 모두 받는다. */
function parseDt(s) {
    s = String(s || '').trim();
    if (!s) return null;
    var d = s.replace(/\D/g, '');
    if (d.length < 8) return null;
    var y  = +d.slice(0, 4),
        mo = +d.slice(4, 6) - 1,
        da = +d.slice(6, 8),
        h  = d.length >= 10 ? +d.slice(8, 10)  : 0,
        mi = d.length >= 12 ? +d.slice(10, 12) : 0;
    var dt = new Date(y, mo, da, h, mi);
    return isNaN(dt.getTime()) ? null : dt;
}

/* 날짜 비교용 YYYYMMDD */
function digits8(s) {
    var d = String(s || '').replace(/\D/g, '');
    return d.length >= 8 ? d.slice(0, 8) : '';
}

function dashDate(s) {
    var d = digits8(s);
    return d ? d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6, 8) : '—';
}

function dateOnly(s) {
    var d = parseDt(s);
    if (!d) return '—';
    return pad(d.getMonth() + 1) + '-' + pad(d.getDate())
        + ' (' + '일월화수목금토'.charAt(d.getDay()) + ')';
}

function dateTime(s) {
    var d = parseDt(s);
    if (!d) return '—';
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
        + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

/* ISO 시각 → "12분 전" 같은 표현 */
function agoText(iso) {
    var t = new Date(iso);
    if (isNaN(t.getTime())) return '';
    var mins = Math.round((Date.now() - t.getTime()) / 60000);
    if (mins < 1)   return '방금';
    if (mins < 60)  return mins + '분 전';
    var hours = Math.round(mins / 60);
    if (hours < 24) return hours + '시간 전';
    return Math.round(hours / 24) + '일 전';
}

function ddayInfo(closeAt, now) {
    var d = parseDt(closeAt);
    if (!d) return { text: '—', level: 'normal' };

    var ms = d - now;
    if (ms < 0) return { text: '마감', level: 'closed' };

    var hours = ms / 3600000;
    var urgent = (typeof BID_URGENT_HOURS !== 'undefined') ? BID_URGENT_HOURS : 48;

    if (hours < 1)  return { text: Math.max(1, Math.round(ms / 60000)) + '분', level: 'urgent' };
    if (hours < 24) return { text: Math.floor(hours) + '시간', level: 'urgent' };

    var days = Math.floor(hours / 24);
    return {
        text: 'D-' + days,
        level: hours <= urgent ? 'urgent' : (days <= 7 ? 'soon' : 'normal'),
    };
}

function toInputDate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function fromInputDate(s) {
    return String(s || '').replace(/-/g, '');
}
function pad(n) { return n < 10 ? '0' + n : String(n); }

function comma(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function numOrNull(v) {
    if (v == null || v === '') return null;
    var n = Number(String(v).replace(/[,\s]/g, ''));
    return isFinite(n) ? n : null;
}

function kindLabel(k) {
    return { thng: '물품', cnstwk: '공사', servc: '용역' }[k] || k;
}

function escapeHtml(s) {
    return $('<div>').text(String(s == null ? '' : s)).html();
}

/* jQuery 선택자에 넣을 값 이스케이프. 공고번호에 특수문자가 섞여 오는 경우 대비. */
function cssEscape(s) {
    return String(s).replace(/["\\]/g, '\\$&');
}

/* ── 예시 데이터 (수집 설정 전 화면 확인용) ─────────────────── */
function mockItems() {
    var now = new Date();
    function at(dayOffset, hh, mm) {
        var d = new Date(now);
        d.setDate(d.getDate() + dayOffset);
        d.setHours(hh, mm || 0, 0, 0);
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
            + ' ' + pad(hh) + ':' + pad(mm || 0) + ':00';
    }
    return [
        {
            id: 'MOCK-0001-000', kind: 'thng', no: 'MOCK-0001', ord: '000',
            name: '○○초등학교 교내 안내표지판 및 간판 제작·설치',
            noticeInst: '경기도교육청', demandInst: '○○초등학교',
            noticeAt: at(-2, 10, 0), closeAt: at(1, 11, 0), openAt: at(1, 14, 0),
            estPrice: 18400000, budget: 20000000, lowerRate: 87.995,
            method: '제한경쟁 / 적격심사', industry: '광고물업',
            regions: '경기도', url: '',
        },
        {
            id: 'MOCK-0002-000', kind: 'cnstwk', no: 'MOCK-0002', ord: '000',
            name: '시청 앞 광장 옥외광고물 정비공사 (LED 사인 교체 포함)',
            noticeInst: '○○시청', demandInst: '○○시청 도시디자인과',
            noticeAt: at(-1, 9, 30), closeAt: at(4, 17, 0), openAt: at(5, 11, 0),
            estPrice: 96500000, budget: 105000000, lowerRate: 86.745,
            method: '지역제한 / 적격심사', industry: '옥외광고물설치공사업',
            regions: '경기도 안양시, 경기도 군포시', url: '',
        },
        {
            id: 'MOCK-0003-000', kind: 'thng', no: 'MOCK-0003', ord: '000',
            name: '공공도서관 홍보용 현수막 및 실사출력물 제작',
            noticeInst: '○○구청', demandInst: '○○구립도서관',
            noticeAt: at(-4, 14, 0), closeAt: at(9, 10, 0), openAt: at(9, 14, 0),
            estPrice: 4250000, budget: 5000000, lowerRate: 87.995,
            method: '소액 수의계약', industry: '광고물업',
            regions: '서울특별시', url: '',
        },
        {
            id: 'MOCK-0004-000', kind: 'cnstwk', no: 'MOCK-0004', ord: '000',
            name: '체육공원 채널문자 사인탑 신설공사',
            noticeInst: '○○군청', demandInst: '○○군 체육시설관리사업소',
            noticeAt: at(-6, 11, 0), closeAt: at(-1, 17, 0), openAt: at(0, 11, 0),
            estPrice: 43800000, budget: 48000000, lowerRate: 86.745,
            method: '지역제한 / 적격심사', industry: '옥외광고물설치공사업',
            regions: '강원특별자치도', url: '',
        },
    ];
}
