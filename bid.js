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
var _company  = null;    // 입찰참가자격 등록 내용 (수집 파일에 함께 실려 온다)
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

    $.when(loadFavs(), loadAllChecks()).always(function() {
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
    $('#bid_only_open, #bid_only_fav, .bid-kind, #bid_rel').change(render);
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
    $('#bid_rel').val('');
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
                relevance: (data.meta && data.meta.relevance) || null,
            };
            // 등록 내용을 알아야 '투찰 가능'을 표시하고 준비 목록을 짤 수 있다.
            _company = data.company || null;

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
    var relWant  = $('#bid_rel').val();
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
        if (relWant === 'registered' && r.relevance !== 'registered') return false;
        // '확인 필요'는 품명번호가 안 맞아 공고명만 걸린 건들이다
        if (relWant === 'ready' && r.relevance === 'keyword') return false;
        if (_keywords.length && !matchesKeyword(r, _keywords)) return false;
        if (region && !matchesRegion(r, region)) return false;
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
    if (_source.relevance && _source.relevance.registered) {
        bits.push('투찰가능 ' + _source.relevance.registered + '건');
    }

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

    var $kind = $('<td>').append(
        $('<span class="bid-badge">')
            .addClass('bid-badge-' + r.kind)
            .text(kindLabel(r.kind))
    );
    // 등록물품과 대조한 결과. 투찰할 수 있는 건인지가 목록에서 바로 보여야
    // 훑는 시간이 줄어든다.
    if (r.relevance) {
        $kind.append($('<span class="bid-rel">')
            .addClass('bid-rel-' + r.relevance)
            .attr('title', relDesc(r.relevance))
            .text(relLabel(r.relevance)));
    }
    $tr.append($kind);

    var $name = $('<div class="bid-name">').text(r.name || '(공고명 없음)');
    // 지역제한·업종제한은 참가 자격을 가르므로 목록에서 바로 보여준다.
    if (r.regionLimit) {
        // 판단 기준(본사소재지 등)은 길어서 상세에서 보여준다.
        $name.append($('<span class="bid-tag">').attr('title', r.regionLimit + ' 기준').text('지역제한'));
    }
    if (r.industryLimit) {
        $name.append($('<span class="bid-tag">').text('업종제한'));
    }

    $tr.append($('<td>')
        .append($name)
        .append($('<div class="bid-inst">').text(instLine(r)))
    );

    $tr.append($('<td>').append($('<div class="bid-industry">').text(industryText(r))));
    $tr.append($('<td class="num">').text(r.estPrice != null ? comma(r.estPrice) : '—'));
    $tr.append($('<td class="bid-when">').text(dateOnly(r.noticeAt)));
    $tr.append($('<td class="bid-when">').text(dateTime(r.closeAt)));
    $tr.append($('<td>').append(
        $('<span class="bid-dday">').addClass('bid-dday-' + dd.level).text(dd.text)
    ));
    $tr.append($('<td class="bid-prog-cell">').append(progressBadge(r)));

    return $tr;
}

/* 서류를 몇 개나 챙겼는지. 목록에서 바로 보여야 어디까지 했는지 안다. */
function progressBadge(r) {
    var docs = (typeof bidDocsFor === 'function') ? bidDocsFor(r) : [];
    if (!docs.length) return $('<span class="bid-prog none">').text('—');
    var checks = loadChecks(r.id);
    var done = docs.filter(function(d) { return checks[d.key]; }).length;
    var cls = done === 0 ? 'none' : (done === docs.length ? 'full' : 'part');
    return $('<span class="bid-prog">').addClass(cls).text(done + '/' + docs.length);
}

function updateRowProgress(id) {
    var r = findItem(id);
    if (!r) return;
    var $cell = $('#bid_tbody tr[data-id="' + cssEscape(id) + '"] .bid-prog-cell');
    if ($cell.length) $cell.empty().append(progressBadge(r));
}

function instLine(r) {
    var a = r.noticeInst || '';
    var b = r.demandInst || '';
    if (a && b && a !== b) return a + ' · 수요기관 ' + b;
    return a || b || '';
}

/* 물품은 세부품명, 공사는 주공종명. 목록 API 에 업종(indstrytyNm)이
 * 아예 없어서 그 자리에 들어갈 수 있는 가장 가까운 값이다. */
function industryText(r) {
    var s = String(r.industry || '').trim();
    if (!s) return '—';
    return s;
}

function regionText(r) {
    var s = String(r.regions || '').trim();
    if (!s) return '';
    // "경기도 안양시, 경기도 군포시" 처럼 길게 오는 경우가 많아 앞만 보여준다
    var parts = s.split(/\s*,\s*/).filter(Boolean);
    if (parts.length <= 1) return parts[0] || '';
    return parts[0] + ' 외 ' + (parts.length - 1);
}

function relLabel(rel) {
    return {
        registered: '투찰가능',
        expired:    '등록만료',
        group:      '품명추가',
        keyword:    '확인필요',
    }[rel] || rel;
}

function relDesc(rel) {
    return {
        registered: '입찰참가 등록물품과 세부품명번호가 일치합니다',
        expired:    '등록물품이지만 등록유효기간이 지났습니다 — 갱신해야 참가할 수 있습니다',
        group:      '같은 품명군이지만 등록물품은 아닙니다 — 품명 추가 등록이 필요합니다',
        keyword:    '세부품명번호가 맞지 않고 공고명만 걸렸습니다 — 공고문을 확인하세요',
    }[rel] || '';
}

/* 공고의 세부품명번호에 해당하는 등록물품 */
function registeredProduct(r) {
    if (!_company || !_company.products || !r.productCode) return null;
    for (var i = 0; i < _company.products.length; i++) {
        if (_company.products[i].code === r.productCode) return _company.products[i];
    }
    return null;
}

function matchesKeyword(rec, keywords) {
    var hay = (rec.name || '') + ' ' + (rec.industry || '') + ' ' + (rec.spec || '');
    return keywords.some(function(k) { return hay.indexOf(k) > -1; });
}

/* 목록 API 에 참가가능지역이 없어 공사 현장지역과 기관명을 함께 본다.
 * 참가자격을 판정하는 게 아니라 훑어볼 범위를 좁히는 용도다. */
function matchesRegion(rec, region) {
    var hay = (rec.regions || '') + ' ' + (rec.noticeInst || '') + ' ' + (rec.demandInst || '');
    return hay.indexOf(region) > -1;
}

/* ── 상세 ────────────────────────────────────────────────────── */
function openDetail(id) {
    var r = findItem(id);
    if (!r) return;

    var dd = ddayInfo(r.closeAt, new Date());
    var $head = $('<div class="bid-detail-head">')
        .append($('<p class="bid-detail-name">').text(r.name || '(공고명 없음)'))
        .append($('<div class="bid-detail-due">')
            .append($('<span class="when">').text('마감 ' + dateTime(r.closeAt)))
            .append($('<span class="bid-dday">').addClass('bid-dday-' + dd.level).text(dd.text)));

    var $cols = $('<div class="bid-detail-cols">')
        .append($('<div>')
            .append($('<p class="bid-col-title">').text('공고 정보'))
            .append(buildInfoGrid(r))
            .append(buildCalc(r)))
        .append($('<div>')
            .append($('<p class="bid-col-title">').text('투찰 준비'))
            .append(buildSteps(r)));

    _wizStep = 0;   // 공고를 새로 열면 첫 단계부터
    $('#bid_detail_body').empty().append($head).append($cols);
    $('#bid_detail_body').scrollTop(0);

    var url = r.url || 'https://www.g2b.go.kr/';   // 상세 URL 이 비어 오는 건도 있다
    $('#bid_detail_open').off('click').click(function() {
        window.open(url, '_blank', 'noopener');
    });

    $('#bid_detail_modal').css('display', 'flex');
}

/* ── 왼쪽: 공고 정보 ── */
function buildInfoGrid(r) {
    var $dl = $('<dl class="bid-detail-grid">');
    function row(k, v, cls) {
        if (v == null || v === '') v = '—';
        $dl.append($('<dt>').text(k));
        $dl.append($('<dd>').addClass(cls || '').text(v));
    }
    function sep() { $dl.append('<hr class="bid-detail-sep">'); }

    row('공고번호', r.no + (r.ord && r.ord !== '000' ? '  (차수 ' + r.ord + ')' : ''));
    row('업무구분', kindLabel(r.kind));
    row('공고기관', r.noticeInst);
    row('수요기관', r.demandInst);
    sep();
    row('품명·공종', r.industry);
    row('규격', r.spec);
    row('수량', r.qty != null ? comma(r.qty) + (r.unit ? ' ' + r.unit : '') : '', 'num');
    sep();
    row('추정가격', r.estPrice != null ? comma(r.estPrice) + ' 원' : '', 'num');
    row('배정예산', r.budget != null ? comma(r.budget) + ' 원' : '', 'num');
    row('낙찰하한율', r.lowerRate != null ? r.lowerRate + ' %' : '', 'num');
    if (r.prdprcTotal) {
        row('예비가격', r.prdprcTotal + '개 중 ' + (r.prdprcDrawn || '?') + '개 추첨');
    }
    row('계약방법', r.method);
    row('낙찰방법', r.bidMethod);
    sep();
    row('지역제한', r.regionLimit ? r.regionLimit + ' 기준' : '없음', r.regionLimit ? 'warn' : '');
    row('업종제한', r.industryLimit ? '있음' : '없음', r.industryLimit ? 'warn' : '');
    row('현장지역', regionText(r));
    sep();
    row('공고일시', dateTime(r.noticeAt));
    row('마감일시', dateTime(r.closeAt));
    row('개찰일시', dateTime(r.openAt));
    if (r.briefingAt) {
        row('현장설명회', dateTime(r.briefingAt) + (r.briefingPlace ? '  ' + r.briefingPlace : ''), 'warn');
    }
    if (r.officer || r.officerTel) {
        sep();
        row('담당자', [r.officer, r.officerTel].filter(Boolean).join('  ·  '));
    }

    var $wrap = $('<div>').append($dl);
    if (r.specUrl) {
        $wrap.append($('<a class="bid-doc-link" target="_blank" rel="noopener">')
            .attr('href', r.specUrl).text('규격서·공고문 내려받기 →'));
    }
    return $wrap;
}

/* ── 투찰금액 산정 ───────────────────────────────────────────
 * 개찰 전에는 예정가격을 알 수 없어 확정값이 아니라 확률로 본다.
 * '낙찰 확률'이라고 부르지 않는다 — 경쟁사가 몇 곳이고 얼마를 쓸지
 * 모르니 계산할 수 없다. 여기서 내는 건 '무효가 되지 않을 확률'이다.
 */
function buildCalc(r) {
    var $box = $('<div class="bid-calc">');
    $box.append($('<h4>').text('투찰금액 산정'));

    if (r.lowerRate == null) {
        $box.append($('<p class="bid-calc-na">').text(
            '이 공고에는 낙찰하한율이 없습니다. 수의계약이거나 낙찰자 결정방법이 ' +
            '달라 계산이 성립하지 않습니다 — 공고문의 낙찰자 결정방법을 확인하세요.'));
        return $box;
    }

    var saved = loadChecks(r.id);
    var defBase = saved._base || bidBaseFromEstimate(r.estPrice) || '';

    var $in = $('<div class="bid-calc-inputs">');
    function field(label, id, value, hint, attrs) {
        var $f = $('<div class="bid-calc-field">');
        $f.append($('<label>').attr('for', id).text(label));
        var $i = $('<input type="number">').attr('id', id).val(value);
        if (attrs) $i.attr(attrs);
        $f.append($i);
        if (hint) $f.append($('<span class="bid-calc-hint">').text(hint));
        $in.append($f);
        return $i;
    }

    var $base = field('기초금액 (원)', 'calc_base', defBase,
        r.estPrice && !saved._base ? '추정가격 × 1.1 로 어림한 값. 공고에 공표되면 그 값을 넣으세요' : '',
        { step: 10000, min: 0 });
    var $rate = field('낙찰하한율 (%)', 'calc_rate', saved._rate || r.lowerRate,
        '', { step: 0.001, min: 0 });
    var $cost = field('우리 제작원가 (원)', 'calc_cost', saved._cost || '',
        '견적 계산기로 뽑은 금액', { step: 10000, min: 0 });

    var $sf = $('<div class="bid-calc-field">');
    $sf.append($('<label for="calc_spread">').text('예비가격 변동폭'));
    var $spread = $('<select id="calc_spread">')
        .append('<option value="0.02">±2%</option>')
        .append('<option value="0.03">±3%</option>')
        .val(String(saved._spread || 0.02));
    $sf.append($spread);
    $in.append($sf);

    var $tf = $('<div class="bid-calc-field">');
    $tf.append($('<label for="calc_target">').text('목표 유효확률'));
    var $target = $('<select id="calc_target">')
        .append('<option value="0.7">70%</option>')
        .append('<option value="0.8">80%</option>')
        .append('<option value="0.9">90%</option>')
        .append('<option value="0.95">95%</option>')
        .append('<option value="0.99">99%</option>')
        .val(String(saved._target || 0.9));
    $tf.append($target);
    $in.append($tf);

    $box.append($in);
    var $out = $('<div class="bid-calc-out">');
    $box.append($out);

    function run() {
        var res = bidCalc({
            base: $base.val(), rate: Number($rate.val()) / 100,
            spread: Number($spread.val()), cost: $cost.val(),
            target: Number($target.val()),
            total: r.prdprcTotal, drawn: r.prdprcDrawn,
        });
        renderCalc($out, res, r);
    }

    // 입력은 공고별로 남긴다. 다시 열었을 때 원가를 또 넣게 하면 안 쓴다.
    function persistAndRun(key, $el) {
        saveCalcInput(r.id, key, $el.val());
        run();
    }
    $base.on('input change', function() { persistAndRun('_base', $base); });
    $rate.on('input change', function() { persistAndRun('_rate', $rate); });
    $cost.on('input change', function() { persistAndRun('_cost', $cost); });
    $spread.on('change', function() { persistAndRun('_spread', $spread); });
    $target.on('change', function() { persistAndRun('_target', $target); });

    run();
    return $box;
}

function renderCalc($out, res, r) {
    $out.empty();
    if (!res) {
        $out.append($('<p class="bid-calc-na">').text('기초금액과 낙찰하한율을 넣어주세요.'));
        return;
    }

    var rec = res.recommend;
    var $rec = $('<div class="bid-calc-rec">')
        .append($('<span class="label">').text('권장 투찰금액'))
        .append($('<span class="amt">').text(comma(rec.amount) + ' 원'))
        .append($('<span class="sub">').text(
            '투찰률 ' + (rec.t * 100).toFixed(3) + '% · 유효확률 ' +
            Math.round(rec.valid * 100) + '%' + (rec.reason ? ' · ' + rec.reason : '')));
    if (rec.margin != null) {
        $rec.append($('<span class="margin">')
            .addClass(rec.margin < 0 ? 'bad' : (rec.margin < 0.05 ? 'thin' : 'ok'))
            .text('원가 대비 ' + (rec.margin >= 0 ? '+' : '') + (rec.margin * 100).toFixed(1) + '%'));
    }
    $out.append($rec);

    // 투찰률별 표. 하한율 근처만 보여준다 — 멀리 가면 볼 이유가 없다.
    var $tb = $('<tbody>');
    res.rows.forEach(function(row) {
        var diff = row.t - (res.floor.t);
        if (diff < -0.0021 || diff > 0.0151) return;
        var $tr = $('<tr>');
        if (Math.abs(row.t - rec.t) < 0.0005) $tr.addClass('pick');
        if (row.belowCost) $tr.addClass('below');
        $tr.append($('<td>').text((row.t * 100).toFixed(3) + '%'));
        $tr.append($('<td class="num">').text(comma(row.amount)));
        $tr.append($('<td class="num">').append(probBar(row.valid)));
        $tr.append($('<td class="num">').text(
            row.margin == null ? '—' : (row.margin >= 0 ? '+' : '') + (row.margin * 100).toFixed(1) + '%'));
        $tb.append($tr);
    });

    $out.append($('<table class="bid-calc-table">')
        .append('<thead><tr><th>투찰률</th><th>투찰금액</th>' +
                '<th>유효확률</th><th>원가대비</th></tr></thead>')
        .append($tb));

    $out.append($('<p class="bid-calc-note">').html(
        '<b>유효확률은 낙찰 확률이 아닙니다.</b> 내 금액이 낙찰하한가 이상이어서 ' +
        '무효가 되지 않을 확률입니다. 실제 낙찰은 유효한 입찰 중 최저가가 가져가는데, ' +
        '경쟁사가 몇 곳이고 얼마를 쓸지는 알 수 없습니다. ' +
        '확률을 높이면 무효 위험은 줄지만 최저가 경쟁에서는 밀립니다.'));

    $out.append($('<p class="bid-calc-note">').text(
        '예비가격 ' + (r.prdprcTotal || 15) + '개 중 ' + (r.prdprcDrawn || 4) +
        '개를 추첨해 평균낸 값이 예정가격이라는 전제로 계산합니다. ' +
        '예정가격 흩어짐 ±' + (res.sigmaRel * 100).toFixed(2) + '% (1σ).'));
}

function probBar(p) {
    var pct = Math.round(p * 100);
    var cls = pct >= 90 ? 'hi' : (pct >= 70 ? 'mid' : 'lo');
    return $('<span class="bid-prob">').addClass(cls)
        .append($('<span class="fill">').css('width', Math.max(2, pct) + '%'))
        .append($('<span class="txt">').text(pct + '%'));
}

/* 계산기 입력값도 체크 상태와 같은 문서에 담는다. */
function saveCalcInput(id, key, value) {
    if (!_checks[id]) _checks[id] = {};
    if (value === '' || value == null) delete _checks[id][key];
    else _checks[id][key] = value;

    if (!_db) {
        try { localStorage.setItem(LS_CHECKS, JSON.stringify(_checks)); } catch (e) {}
        return;
    }
    var patch = {};
    patch[key] = (value === '' || value == null)
        ? firebase.firestore.FieldValue.delete() : value;
    _db.collection('bid_checklists').doc(id).set(patch, { merge: true })
        .catch(function(err) { console.error('계산 입력 저장 실패:', err); });
}

/* ── 오른쪽: 투찰 준비 단계 ──────────────────────────────────
 * 공고마다 챙길 것이 다르다. 지역제한이 걸렸는지, 현장설명회가 있는지,
 * 공사인지 물품인지에 따라 항목을 바꿔 넣는다. 일반론만 늘어놓으면
 * 읽지 않게 되고, 정작 그 공고에서 발목 잡히는 것을 놓친다.
 */
/* 한 번에 한 단계만 보여준다. 전부 펼쳐두면 읽지 않고 넘긴다. */
var _wizStep = 0;

function buildSteps(r) {
    var $box = $('<div class="bid-wiz">');
    renderWizard($box, r);
    return $box;
}

function renderWizard($box, r) {
    var checks = loadChecks(r.id);
    var auto = autoChecks(r);
    var steps = prepSteps(r);
    if (_wizStep >= steps.length) _wizStep = steps.length - 1;
    if (_wizStep < 0) _wizStep = 0;

    var step = steps[_wizStep];
    $box.empty();

    // 막힌 것이 있으면 단계를 밟기 전에 먼저 알린다
    var blocked = autoSummary(r, auto);
    if (blocked) $box.append(blocked);

    // 진행 표시
    var $bar = $('<div class="bid-wiz-bar">');
    steps.forEach(function(st, i) {
        var d = stepDone(st, checks, auto);
        var $dot = $('<button type="button" class="bid-wiz-dot">')
            .toggleClass('on', i === _wizStep)
            .toggleClass('done', d.done === d.total && d.total > 0)
            .attr('title', st.title)
            .append($('<span class="n">').text(i + 1))
            .append($('<span class="t">').text(st.short || st.title));
        $dot.on('click', function() { _wizStep = i; renderWizard($box, r); });
        $bar.append($dot);
    });
    $box.append($bar);

    // 현재 단계
    var $panel = $('<div class="bid-wiz-panel">');
    var d = stepDone(step, checks, auto);
    $panel.append($('<div class="bid-wiz-head">')
        .append($('<h5>').text(step.title))
        .append($('<span class="cnt">').text(d.done + '/' + d.total)));
    if (step.note) $panel.append($('<p class="bid-wiz-note">').text(step.note));

    step.items.forEach(function(it) {
        $panel.append(buildItem(it, r, step, checks, auto, $box));
    });

    if (step.standingNote) {
        $panel.append($('<div class="bid-wiz-standing">')
            .append($('<span>').text(step.standingNote))
            .append($('<a href="products.html">').text('상시 준비 확인 \u2192')));
    }

    $box.append($panel);

    // 이동
    var $nav = $('<div class="bid-wiz-nav">');
    var $prev = $('<button type="button" class="bid-wiz-btn ghost">').text('\u2190 이전')
        .prop('disabled', _wizStep === 0);
    $prev.on('click', function() { _wizStep--; renderWizard($box, r); });
    $nav.append($prev);

    if (_wizStep < steps.length - 1) {
        var $next = $('<button type="button" class="bid-wiz-btn">').text('다음 \u2192');
        $next.on('click', function() { _wizStep++; renderWizard($box, r); });
        $nav.append($next);
    } else {
        $nav.append($('<span class="bid-wiz-last">').text('마지막 단계입니다'));
    }
    $box.append($nav);

    // 마지막 단계에서만 붙인다. 매 단계마다 같은 경고를 보면 안 읽게 된다.
    if (_wizStep === steps.length - 1) {
        $box.append($('<p class="bid-steps-note">').html(
            '<b>투찰 금액 입력과 제출은 나라장터에서 직접 하셔야 합니다.</b> ' +
            '전자입찰은 인증서로 본인 신원확인을 거치도록 되어 있어, 프로그램이 ' +
            '대신 투찰하게 만들면 인증서 관리 의무 위반이자 입찰방해·부정당업자 ' +
            '제재 대상이 될 수 있습니다.'));
    }
}

/* 항목 하나 그리기. 자동으로 확정된 것은 체크박스를 주지 않는다. */
function buildItem(it, r, step, checks, auto, $box) {
    var au = auto[it.k];
    var autoDone = !step.docs && au && au.state === 'ok';

    var $label = $('<label class="bid-check-item">')
        .toggleClass('warn', !!it.warn || (au && au.state === 'warn'))
        .toggleClass('auto-ok', !!autoDone)
        .toggleClass('auto-fail', !!(au && au.state === 'fail'));

    var $cb;
    if (autoDone) {
        $cb = $('<span class="bid-auto-mark ok">').html('&#10003;');
    } else if (au && au.state === 'fail') {
        $cb = $('<span class="bid-auto-mark fail">').html('&#10007;');
    } else {
        $cb = $('<input type="checkbox">')
            .prop('checked', !!checks[it.k]).attr('data-k', it.k);
    }

    var $txt = $('<span>');
    if (it.sub !== undefined) {
        var $nm = $('<span class="bid-doc-name">').text(it.t);
        if (it.gain) $nm.append($('<span class="bid-doc-gain">').text('가점'));
        $txt.append($nm);
        if (it.sub) $txt.append($('<span class="bid-doc-note">').text(it.sub));
        if (it.link) {
            $txt.append($('<a class="bid-doc-src" target="_blank" rel="noopener">')
                .attr('href', it.link).text(it.linkText));
        }
    } else if (it.link) {
        $txt.append(document.createTextNode(it.t + ' '))
            .append($('<a>').attr('href', it.link).attr('target', '_blank')
                .text(it.linkText || '열기 \u2192'));
    } else {
        $txt.text(it.t);
    }

    if (au) {
        $txt.append($('<span class="bid-auto-why">').addClass(au.state).text(au.why));
    }

    if ($cb.is('input')) {
        $cb.on('change', function() {
            saveCheck(r.id, it.k, this.checked);
            renderWizard($box, r);
        });
    }
    return $label.append($cb).append($txt);
}

/* 단계의 진행 정도. 자동 확인된 것도 완료로 친다. */
function stepDone(step, checks, auto) {
    var done = 0;
    step.items.forEach(function(it) {
        var au = auto[it.k];
        if ((!step.docs && au && au.state === 'ok') || checks[it.k]) done++;
    });
    return { done: done, total: step.items.length };
}
function refreshStepCount($step) {
    var total = $step.find('.bid-check-item').length;
    // 자동으로 확인된 항목도 완료로 친다
    var done = $step.find('input:checked').length + $step.find('.bid-auto-mark.ok').length;
    $step.find('.bid-step-count').text(done + '/' + total);
    $step.toggleClass('done', done === total && total > 0);
}

/* 자동 판정 결과를 맨 위에 한 줄로. 막힌 것이 있으면 그것부터 보여준다. */
/* 막힌 것이 있을 때만 배너를 낸다. 잘 되고 있을 때는 조용한 편이 낫다. */
function autoSummary(r, auto) {
    var fails = [];
    Object.keys(auto).forEach(function(k) {
        if (k.indexOf('d_') === 0) return;   // 서류 보유 판정은 따로 본다
        if (auto[k].state === 'fail') fails.push(auto[k].why);
    });
    if (!fails.length) return null;

    return $('<div class="bid-auto-summary blocked">')
        .append($('<b>').text('지금은 투찰할 수 없습니다'))
        .append($('<span>').text(fails.join(' · ')));
}
function autoChecks(r) {
    var a = {};
    var prod = registeredProduct(r);
    var today = startOfToday();
    var comp = _company || {};

    // 등록분야 — 여기서 막히면 나머지는 의미가 없다
    if (comp.fields) {
        a.field = comp.fields[r.kind]
            ? { state: 'ok',   why: '등록분야에 ' + kindLabel(r.kind) + ' 포함' }
            : { state: 'fail', why: '등록분야에 ' + kindLabel(r.kind) + '이(가) 없습니다 — 투찰할 수 없습니다' };
    }

    // 등록물품 대조
    if (r.relevance === 'registered' && prod) {
        a.prod = { state: 'ok', why: '\u2018' + prod.name + '\u2019 · 등록유효 ' + prod.regEnd + '까지' };
    } else if (r.relevance === 'expired' && prod) {
        a.prod = { state: 'fail', why: '\u2018' + prod.name + '\u2019 등록유효기간 ' + prod.regEnd + ' 지남 — 갱신해야 참가할 수 있습니다' };
    } else if (r.relevance === 'group') {
        a.prod = { state: 'warn', why: '등록물품이 아닙니다 (' + (r.industry || r.productCode || '품명 미상') + ') — 품명 추가 등록이 필요할 수 있습니다' };
    } else if (r.relevance === 'keyword') {
        a.prod = { state: 'warn', why: '세부품명번호가 우리 등록물품과 맞지 않습니다 — 공고문에서 품명 확인' };
    }

    // 지역제한 — 제한이 없을 때만 확정할 수 있다.
    // 걸려 있으면 본사소재지가 해당하는지는 공고문을 봐야 안다.
    a.rgn = r.regionLimit
        ? { state: 'warn', why: r.regionLimit + ' 기준 — 본사(' + (comp.region || '소재지') + ')가 해당하는지 확인' }
        : { state: 'ok',   why: '지역제한 없음' };

    a.ind = r.industryLimit
        ? { state: 'warn', why: '업종제한 공고 — 해당 업종으로 등록되어 있는지 확인' }
        : { state: 'ok',   why: '업종제한 없음' };

    // 직접생산확인증명서 — 등록 품목의 증명 유효기간으로 판정
    if (prod) {
        var alive = prod.certEnd && parseDt(prod.certEnd) >= today;
        a.dpc = alive
            ? { state: 'ok',   why: '직접생산증명 유효 ' + prod.certEnd + '까지' }
            : { state: 'fail', why: '직접생산증명 만료' + (prod.certEnd ? ' (' + prod.certEnd + ')' : '') };
        a.d_direct = a.dpc;
    }

    // 금액 관련은 근거만 붙이고 완료 처리하지 않는다. 자동으로 체크해버리면
    // 정작 금액을 정할 때 봐야 할 경고가 목록에서 사라진다.
    if (r.lowerRate != null) {
        a.low = { state: 'info', why: '공고에 ' + r.lowerRate + '% 로 명시되어 있습니다' };
    }
    if (r.prdprcTotal) {
        a.prd = { state: 'info', why: r.prdprcTotal + '개 중 ' + (r.prdprcDrawn || '?') + '개 추첨' };
    }

    var close = parseDt(r.closeAt);
    if (close && close < new Date()) a.time = { state: 'fail', why: '이미 마감되었습니다' };

    // 가점 인증 보유 여부
    var map = { women: 'd_women', mainbiz: 'd_mainbiz', designLab: 'd_rnd' };
    (comp.certifications || []).forEach(function(c) {
        var key = map[c.key];
        if (!key) return;
        if (c.termMonths === null && !c.until) {
            a[key] = { state: 'ok', why: '보유 · 유효기간 없음' };
        } else if (!c.until) {
            a[key] = { state: 'warn', why: '발급일이 비어 있습니다 — 등록 품목·인증에서 넣어주세요' };
        } else if (parseDt(c.until) < today) {
            a[key] = { state: 'fail', why: '유효기간 ' + c.until + ' 지남 — 점수가 인정되지 않습니다' };
        } else {
            a[key] = { state: 'ok', why: '보유 · 유효 ' + c.until + '까지' };
        }
    });

    return a;
}

function startOfToday() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

/* 공고 성격에 따라 준비 항목을 짜맞춘다. */
function prepSteps(r) {
    var steps = [];
    var isCnstwk = r.kind === 'cnstwk';

    /* 1 ─ 참가할 수 있나. 대부분 등록 내용으로 판정된다. */
    var s1 = { title: '이 공고에 참가할 수 있나', short: '참가자격', items: [] };
    s1.items.push({ k: 'field', t: '등록분야' });
    s1.items.push({ k: 'prod',  t: '입찰참가 등록물품', link: 'products.html', linkText: '등록 품목 열기 \u2192' });
    s1.items.push({ k: 'rgn',   t: '지역제한' });
    s1.items.push({ k: 'ind',   t: '업종제한' });
    s1.items.push({ k: 'ban',   t: '부정당업자 제재 이력이 없는지 확인' });
    s1.standingNote = '인증서·등록·확인서는 상시 준비에서 관리합니다.';
    steps.push(s1);

    /* 2 ─ 무엇을 만드나. 공고마다 완전히 다르다. */
    var s2 = { title: '무엇을 만드나', short: '규격 확인', items: [] };
    s2.items.push({ k: 'doc', t: '공고문을 내려받아 과업 범위와 특수조건을 읽기' });
    if (r.spec) {
        s2.items.push({ k: 'spec',
            t: '규격 확인: ' + r.spec + (r.qty != null ? '  /  ' + comma(r.qty) + (r.unit || '') : '') });
    } else {
        s2.items.push({ k: 'spec', t: '규격서·물량내역서로 정확한 사양과 수량 확인' });
    }
    s2.items.push({ k: 'site', t: '설치 현장 여건 확인 — 진입로, 고소작업 여부, 전기 인입, 주차' });
    if (isCnstwk) {
        s2.items.push({ k: 'perm', t: '옥외광고물 허가·신고 대상인지, 누가 처리하는지 확인' });
    }
    if (r.briefingAt) {
        s2.items.push({ k: 'brief', warn: true,
            t: '현장설명회 ' + dateTime(r.briefingAt) + (r.briefingPlace ? '  ·  ' + r.briefingPlace : '') +
               ' — 참석이 의무인 공고는 빠지면 입찰이 무효입니다' });
    }
    if (r.officerTel) {
        s2.items.push({ k: 'call',
            t: '애매한 규격은 담당자에게 확인 — ' + [r.officer, r.officerTel].filter(Boolean).join(' ') });
    }
    steps.push(s2);

    /* 3 ─ 얼마에 쓰나. 왼쪽 계산기와 짝이다. */
    var s3 = { title: '얼마에 쓰나', short: '금액', items: [] };
    s3.items.push({ k: 'cost', link: 'index.html', linkText: '견적 계산기 열기 \u2192',
        t: '제작원가를 뽑기.' });
    s3.items.push({ k: 'sub', t: '외주 단가 확인 — 시트 출력, 절곡, 도장, 전기공사 등' });
    s3.items.push({ k: 'extra', t: '부대비용 반영 — 운반비, 크레인·고소차, 야간·휴일 작업, 폐기물 처리' });
    s3.items.push({ k: 'vat', t: '부가세 별도인지 포함인지 확인 (추정가격은 보통 부가세 별도)' });
    if (r.lowerRate != null) {
        s3.items.push({ k: 'low', warn: true,
            t: '낙찰하한율 ' + r.lowerRate + '% — 이 아래로 쓰면 무효 처리됩니다' });
        s3.items.push({ k: 'amt_fix', t: '왼쪽 투찰금액 산정에서 원가를 넣고 금액을 정하기' });
    } else {
        s3.items.push({ k: 'low', t: '낙찰하한율이 없는 공고입니다 — 공고문의 낙찰자 결정방법 확인' });
    }
    if (r.prdprcTotal) {
        s3.items.push({ k: 'prd',
            t: '복수예비가격 ' + r.prdprcTotal + '개 중 ' + (r.prdprcDrawn || '?') +
               '개를 추첨해 기초금액이 정해집니다 — 개찰 전에는 확정 금액을 알 수 없습니다' });
    }
    steps.push(s3);

    /* 4 ─ 이번에 낼 서류. 상시 준비분은 빼고 이 공고에만 해당하는 것만. */
    var perBid = (typeof bidDocsPerBid === 'function') ? bidDocsPerBid(r) : [];
    var standing = (typeof bidDocsStanding === 'function') ? bidDocsStanding(r) : [];
    if (perBid.length) {
        var byStage = {};
        perBid.forEach(function(d) { (byStage[d.stage] = byStage[d.stage] || []).push(d); });

        var s4 = { title: '이번에 낼 서류', short: '서류', docs: true, items: [] };
        (typeof BID_STAGES !== 'undefined' ? BID_STAGES : []).forEach(function(st) {
            (byStage[st.key] || []).forEach(function(d) {
                var srcInfo = bidDocSource(d);
                s4.items.push({
                    k: d.key,
                    t: d.name,
                    sub: '[' + st.title + '] ' + (d.note || ''),
                    gain: !!d.gain,
                    link: srcInfo ? srcInfo.url : null,
                    linkText: srcInfo ? srcInfo.name + ' \u2192' : null,
                });
            });
        });
        if (standing.length) {
            s4.standingNote = '확인서·증명서 ' + standing.length + '건은 상시 준비에서 관리합니다.';
        }
        steps.push(s4);
    }

    /* 5 ─ 투찰 */
    var s5 = { title: '투찰', short: '투찰', items: [] };
    s5.items.push({ k: 'time', warn: true,
        t: '마감 ' + dateTime(r.closeAt) + ' — 최소 30분 전에 접속. 인증서 로그인과 보안모듈에서 시간을 까먹습니다' });
    s5.items.push({ k: 'amt', t: '투찰금액 자릿수 확인 후 제출 (제출하면 수정할 수 없습니다)' });
    s5.standingNote = '인증서와 보안모듈은 상시 준비에서 관리합니다.';
    steps.push(s5);

    return steps;
}
/* ── 확인 목록 저장 ──────────────────────────────────────────
 * 공고별로 이 브라우저에 남긴다. 준비는 며칠에 걸쳐 하게 되는데
 * 창을 닫을 때마다 초기화되면 체크 자체를 안 하게 된다.
 */
var LS_CHECKS = 'bid_checklist_v1';
var _checks = {};   // { [공고id]: { [항목키]: 1 } }

/* 준비는 며칠에 걸쳐 하고 담당자가 바뀌기도 한다. 브라우저에만 두면
 * 다른 PC 에서 열었을 때 아무것도 안 보인다. Firestore 에 둔다. */
function loadAllChecks() {
    if (!_db) {
        try { _checks = JSON.parse(localStorage.getItem(LS_CHECKS) || '{}'); }
        catch (e) { _checks = {}; }
        return $.Deferred().resolve().promise();
    }
    var d = $.Deferred();
    _db.collection('bid_checklists').get()
        .then(function(snap) {
            _checks = {};
            snap.forEach(function(doc) { _checks[doc.id] = doc.data() || {}; });
            d.resolve();
        })
        .catch(function(err) {
            console.error('준비 현황 로드 실패:', err);
            d.resolve();
        });
    return d.promise();
}

function loadChecks(id) { return _checks[id] || {}; }

function saveCheck(id, key, on) {
    if (!_checks[id]) _checks[id] = {};
    if (on) _checks[id][key] = 1; else delete _checks[id][key];

    if (!_db) {
        try {
            if (!Object.keys(_checks[id]).length) delete _checks[id];
            localStorage.setItem(LS_CHECKS, JSON.stringify(_checks));
        } catch (e) {}
        updateRowProgress(id);
        return;
    }

    var patch = {};
    patch[key] = on ? 1 : firebase.firestore.FieldValue.delete();
    _db.collection('bid_checklists').doc(id).set(patch, { merge: true })
        .catch(function(err) { console.error('준비 현황 저장 실패:', err); });
    updateRowProgress(id);
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
