// ── 상수 ────────────────────────────────────────────────────
var ARCHIVE_KEY = 'estimate_archives_v1';
var ARC_STATUS_CLASS = { '대기': 'st_wait', '미납': 'st_unpaid', '부분 납부': 'st_partial', '완납': 'st_paid' };
var _arcFilter = { name: '', company: '', dateFrom: '', dateTo: '', status: '', proceed: '' };
var _archivesDoc = null;

// ── Firebase 초기화 ──────────────────────────────────────────
function _initFirestore() {
    if (_archivesDoc) return;
    try {
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') return;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        _archivesDoc = firebase.firestore().collection('estimates').doc('archive_list');
    } catch(e) {}
}

// ── 데이터 CRUD ──────────────────────────────────────────────
function getArchives(cb) {
    _initFirestore();
    if (_archivesDoc) {
        _archivesDoc.get()
            .then(function(doc) { cb(doc.exists ? (doc.data().list || []) : []); })
            .catch(function() {
                try { cb(JSON.parse(localStorage.getItem(ARCHIVE_KEY)) || []); } catch(e) { cb([]); }
            });
    } else {
        try { cb(JSON.parse(localStorage.getItem(ARCHIVE_KEY)) || []); } catch(e) { cb([]); }
    }
}

function setArchives(list, cb) {
    _initFirestore();
    if (_archivesDoc) {
        _archivesDoc.set({ list: list })
            .then(function() { if (cb) cb(); })
            .catch(function() {
                try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list)); } catch(e) {}
                if (cb) cb();
            });
    } else {
        try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list)); } catch(e) {}
        if (cb) cb();
    }
}

// ── 필터 ─────────────────────────────────────────────────────
function applyArchiveFilter(list) {
    var f = _arcFilter;
    return list.filter(function(a) {
        if (f.name     && (a.name    || '').indexOf(f.name)    === -1) return false;
        if (f.company  && (a.company || '').indexOf(f.company) === -1) return false;
        if (f.dateFrom && (a.date || '') < f.dateFrom) return false;
        if (f.dateTo   && (a.date || '') > f.dateTo)   return false;
        if (f.status   && (a.status  || '대기') !== f.status)  return false;
        if (f.proceed  && (a.proceed || '') !== f.proceed)      return false;
        return true;
    });
}

// ── 헬퍼 ─────────────────────────────────────────────────────
function escHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function reformatLiDisplay($li) {
    if ($li.hasClass("fmted")) return;
    $li.addClass("fmted");
    $li.contents().each(function() {
        if (this.nodeType !== 3) return;
        var txt = this.nodeValue;
        if (txt.indexOf('/') === -1) return;
        var parts = txt.split(/\s*\/\s*/);
        var frag  = document.createDocumentFragment();
        parts.forEach(function(p, i) {
            if (i > 0) {
                frag.appendChild(document.createElement('br'));
                var sep = document.createElement('span');
                sep.className   = 'li-sep';
                sep.textContent = '/ ';
                frag.appendChild(sep);
            }
            frag.appendChild(document.createTextNode(p));
        });
        $(this).replaceWith(frag);
    });
}

function numberToKorean(n) {
    if (!n || n === 0) return '영';
    var units = ['', '만', '억', '조'];
    var small = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    var place  = ['', '십', '백', '천'];
    var result = '';
    var ui = 0;
    while (n > 0) {
        var chunk = n % 10000;
        if (chunk) {
            var s = '', tmp = chunk;
            for (var pi = 0; pi < 4; pi++) {
                var d = tmp % 10;
                if (d) {
                    if (pi === 0) s = small[d] + s;
                    else s = (d === 1 ? '' : small[d]) + place[pi] + s;
                }
                tmp = Math.floor(tmp / 10);
            }
            result = s + units[ui] + result;
        }
        n = Math.floor(n / 10000);
        ui++;
    }
    return result;
}

function getEstimateItems($src) {
    var items = [];
    var $lis = $src ? $src.find("li") : $(".total_list ul li");
    $lis.each(function(i) {
        var $li = $(this);
        var priceText = $li.find(".list_price").text().trim();
        var priceNum  = Number(priceText.replace(/[^0-9]/g, ''));
        var $clone = $li.clone();
        $clone.find(".remove_btn, .price_breakdown, .number").remove();
        var fullText = $clone.text();
        var idx = fullText.indexOf('견적 비용');
        if (idx > -1) fullText = fullText.substring(0, idx);
        fullText = fullText.trim().replace(/\s*\/\s*/g, '\n').replace(/\n+/g, '\n');
        var lines = fullText.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
        var category = lines[0] || '';
        var details  = lines.slice(1).join('\n');
        var bdParts = [];
        $li.find(".bd_item").each(function(){ bdParts.push($(this).text().trim()); });
        items.push({ no: i + 1, category: category, details: details, breakdown: bdParts.join(' / '), priceText: priceText, priceNum: priceNum });
    });
    return items;
}

function buildPrintDoc(items, totalNum, customer, manager, notes) {
    var totalFormatted = String(totalNum).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var totalKorean    = numberToKorean(totalNum);
    var today  = new Date();
    var dateStr = today.getFullYear() + '년 ' + (today.getMonth()+1) + '월 ' + today.getDate() + '일';
    var estNo  = String(today.getFullYear()) + ('0'+(today.getMonth()+1)).slice(-2) + ('0'+today.getDate()).slice(-2) + '-' + String(Math.floor(Math.random()*900)+100);
    var rowsHtml = items.map(function(it) {
        var detailLines = it.details.split('\n').map(function(d){ return d ? '<div>' + escHtml(d) + '</div>' : ''; }).join('');
        if (it.breakdown) detailLines += '<div class="bd-row">&#9658; ' + escHtml(it.breakdown) + '</div>';
        return '<tr><td class="tc">' + it.no + '</td><td>' + escHtml(it.category) + '</td><td>' + detailLines + '</td><td class="tr">' + escHtml(it.priceText) + '원</td></tr>';
    }).join('');
    var managerRow = manager ? '<div class="info-row"><span class="info-label">담 당 자</span><span>' + escHtml(manager) + '</span></div>' : '';
    var notesBlock = notes   ? '<div class="custom-notes"><strong>비고</strong><br>' + escHtml(notes).replace(/\n/g,'<br>') + '</div>' : '';
    return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>견적서</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:"맑은 고딕","Malgun Gothic",AppleGothic,sans-serif;padding:20mm;font-size:11pt;color:#000;background:#fff}@media print{body{padding:15mm}.no-print{display:none!important}}.no-print{text-align:center;margin-bottom:18px}.print-btn{padding:9px 36px;font-size:12pt;cursor:pointer;background:#1a1a2e;color:#fff;border:none;border-radius:5px}h1{text-align:center;font-size:22pt;letter-spacing:10px;margin-bottom:14px}hr.thick{border:none;border-top:2.5px solid #000;margin:10px 0}hr.thin{border:none;border-top:1px solid #888;margin:8px 0}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.info-row{display:flex;align-items:center;margin-bottom:5px;font-size:11pt}.info-label{width:75px;font-weight:bold;flex-shrink:0}.total-box{border:2px solid #000;padding:10px 16px;text-align:center;margin:14px 0;font-size:13pt;font-weight:bold;background:#fafafa}table{width:100%;border-collapse:collapse;margin-top:14px}th{background:#e8e8e8;border:1px solid #555;padding:8px;text-align:center;font-size:11pt}td{border:1px solid #666;padding:7px 9px;vertical-align:top;font-size:10pt;line-height:1.6}td.tc{text-align:center}td.tr{text-align:right;white-space:nowrap}.bd-row{font-size:9pt;color:#555;margin-top:3px}.total-row td{font-weight:bold;background:#efefef;font-size:11pt}.total-row .tlabel{text-align:center}.notes{margin-top:20px;font-size:10pt;line-height:1.9;color:#333}.custom-notes{margin-top:12px;padding:9px 13px;border:1px solid #bbb;background:#f8f8f8;font-size:10pt;line-height:1.8}</style></head><body><div class="no-print"><button class="print-btn" onclick="window.print()">인쇄하기</button></div><h1>견 &nbsp; 적 &nbsp; 서</h1><hr class="thick"><div class="info-grid"><div><div class="info-row"><span class="info-label">수 &nbsp; 신</span><span>' + escHtml(customer) + '&nbsp;귀중</span></div>' + managerRow + '</div><div><div class="info-row"><span class="info-label">작 성 일</span><span>' + dateStr + '</span></div><div class="info-row"><span class="info-label">견적번호</span><span>' + estNo + '</span></div></div></div><hr class="thin"><div class="total-box">합계금액 &nbsp; 일금 &nbsp;<strong>' + totalKorean + '원정</strong>&nbsp;&nbsp;( &#8361;&nbsp;' + totalFormatted + ' )</div><table><thead><tr><th style="width:44px">No.</th><th style="width:140px">품&nbsp;&nbsp;목</th><th>세&nbsp;부&nbsp;내&nbsp;용</th><th style="width:116px">금&nbsp;&nbsp;액</th></tr></thead><tbody>' + rowsHtml + '</tbody><tfoot><tr class="total-row"><td colspan="3" class="tlabel">합 &nbsp; 계</td><td class="tr">' + totalFormatted + '원</td></tr></tfoot></table><div class="notes"><p>&#8251; 상기 금액은 부가세 포함 금액입니다.</p><p>&#8251; 본 견적서는 발행일로부터 30일간 유효합니다.</p></div>' + notesBlock + '</body></html>';
}

function openPrintWindow(html) {
    var win = window.open('', '_blank', 'width=960,height=1050,scrollbars=yes');
    if (!win) { alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요."); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
}

// ── 렌더링 ───────────────────────────────────────────────────
function renderArchiveList() {
    _initFirestore();
    var $el = $("#archive_list");
    if (_archivesDoc) $el.html('<p class="archive_empty">불러오는 중…</p>');
    getArchives(function(allList) {
        var list = applyArchiveFilter(allList);
        if (!list.length) {
            var msg = allList.length ? '검색 결과가 없습니다.' : '저장된 견적이 없습니다.';
            $el.html('<p class="archive_empty">' + msg + '</p>');
            return;
        }
        var groupOrder = [];
        var groups = {};
        list.forEach(function(arc) {
            var co = arc.company || '업체 미지정';
            if (!groups[co]) { groups[co] = []; groupOrder.push(co); }
            groups[co].push(arc);
        });
        var html = '';
        groupOrder.forEach(function(company) {
            var items = groups[company];
            var coTotal = items.reduce(function(s, a){ return s + (Number(a.total) || 0); }, 0);
            html += '<div class="archive_company_group">';
            html +=   '<div class="archive_company_header">';
            html +=     '<span class="company_name">' + escHtml(company) + '</span>';
            html +=     '<span class="company_stats">견적 ' + items.length + '건 &middot; 합계 &#8361;&nbsp;' + coTotal.toLocaleString('ko-KR') + '</span>';
            html +=   '</div>';
            items.forEach(function(arc) {
                var st  = arc.status || '대기';
                var stClass = ARC_STATUS_CLASS[st] || 'st_wait';
                var proc = arc.proceed || '';
                var procClass = proc === 'O' ? 'proceed_o' : (proc === 'X' ? 'proceed_x' : 'proceed_none');
                var procText  = proc || '-';
                html +=
                    '<div class="archive_item" data-id="' + arc.id + '">' +
                        '<div class="archive_item_left">' +
                            '<div class="archive_name_row">' +
                                '<span class="arc_proceed_badge ' + procClass + '" title="진행 여부">' + procText + '</span>' +
                                '<span class="archive_name">' + escHtml(arc.name) + '</span>' +
                                '<span class="arc_status_badge ' + (proc === 'O' ? stClass : 'st_none') + '">' + (proc === 'O' ? st : '-') + '</span>' +
                            '</div>' +
                            '<span class="archive_meta">' + escHtml(arc.date) + ' &middot; ' +
                                arc.itemCount + '개 항목 &middot; &#8361;&nbsp;' + arc.totalFormatted +
                            '</span>' +
                        '</div>' +
                        '<div class="archive_item_right">' +
                            '<button class="archive_view_btn" data-id="' + arc.id + '">내역 보기</button>' +
                            '<button class="archive_del_btn"  data-id="' + arc.id + '">삭제</button>' +
                        '</div>' +
                    '</div>';
            });
            html += '</div>';
        });
        $el.html(html);
    });
}

// ── 내역 보기 모달 ───────────────────────────────────────────
function showArchiveDetail(id) {
    getArchives(function(list) {
        var arc = list.filter(function(a){ return a.id === id; })[0];
        if (!arc) return;
        $("#archive_detail_modal").data("current-id", id);
        $("#detail_modal_title").text(arc.name);
        $("#detail_modal_date").text((arc.company ? '[' + arc.company + '] ' : '') + arc.date);
        $("#detail_total_num").text(arc.totalFormatted);

        var proc = arc.proceed || '';
        $('.btn_proceed').removeClass('proceed_active');
        if (proc) $('.btn_proceed[data-val="' + proc + '"]').addClass('proceed_active');
        _togglePaymentFields(proc === 'O');

        var st = arc.status || '대기';
        var stClass = ARC_STATUS_CLASS[st] || 'st_wait';
        $("#detail_status_sel").val(st)
            .removeClass('st_wait st_unpaid st_partial st_paid')
            .addClass(stClass);

        var paid    = Number(arc.paid)  || 0;
        var totalNum = Number(arc.total) || 0;
        $("#detail_paid_input").val(paid > 0 ? paid.toLocaleString('ko-KR') : '');
        $("#detail_paid_full_chk").prop('checked', paid > 0 && paid >= totalNum);

        var $temp = $("<ul>").html(arc.itemsHtml);
        $temp.find(".remove_btn").remove();
        $temp.find("li").each(function(i){
            $(this).find(".number").text((i+1) + ". ");
            reformatLiDisplay($(this));
        });
        $("#detail_items_list").html($temp.html());
        $("#archive_detail_modal").fadeIn(200, function(){ $(this).css("display","flex"); });
    });
}

function _togglePaymentFields(enabled) {
    $('#detail_payment_fields').toggleClass('payment_disabled', !enabled);
}

// ── 상태/납부 업데이트 ───────────────────────────────────────
function updateArchiveStatus(id, newStatus) {
    getArchives(function(list) {
        list.forEach(function(a) { if (a.id === id) a.status = newStatus; });
        setArchives(list);
    });
}

function updateArchiveProceed(id, proceed) {
    getArchives(function(list) {
        list.forEach(function(a) { if (a.id === id) a.proceed = proceed; });
        setArchives(list);
    });
}

function updateArchivePayment(id, paid, status) {
    getArchives(function(list) {
        list.forEach(function(a) {
            if (a.id !== id) return;
            a.paid = paid;
            if (status) a.status = status;
        });
        setArchives(list);
    });
}

function deleteArchive(id) {
    if (!confirm("이 견적을 삭제하시겠습니까?")) return;
    getArchives(function(list) {
        setArchives(list.filter(function(a){ return a.id !== id; }), function() {
            renderArchiveList();
        });
    });
}

function printFromArchive(id) {
    getArchives(function(list) {
        var arc = list.filter(function(a){ return a.id === id; })[0];
        if (!arc) return;
        var $temp = $("<ul>").html(arc.itemsHtml);
        var items = getEstimateItems($temp);
        openPrintWindow(buildPrintDoc(items, arc.total, arc.name, '', ''));
        $("#archive_detail_modal").fadeOut(200);
    });
}

// ── 날짜 헬퍼 ────────────────────────────────────────────────
function _fmtDate(d) {
    return d.getFullYear() + '-' + ('0'+(d.getMonth()+1)).slice(-2) + '-' + ('0'+d.getDate()).slice(-2);
}

// ── 이벤트 바인딩 ────────────────────────────────────────────
$(function() {
    renderArchiveList();

    // 목록 클릭
    $(document).on("click", ".archive_view_btn", function() {
        showArchiveDetail($(this).data("id"));
    });
    $(document).on("click", ".archive_del_btn", function() {
        deleteArchive($(this).data("id"));
    });

    // 내역 보기 모달
    $("#detail_modal_close").click(function() {
        $("#archive_detail_modal").fadeOut(200);
    });
    $("#archive_detail_modal").click(function(e) {
        if (e.target === this) $(this).fadeOut(200);
    });
    $("#detail_print_btn").click(function() {
        printFromArchive($("#archive_detail_modal").data("current-id"));
    });

    // 검색 필터
    $('#search_name, #search_company').on('input', function() {
        _arcFilter.name    = $.trim($('#search_name').val());
        _arcFilter.company = $.trim($('#search_company').val());
        renderArchiveList();
    });
    $('#search_status').on('change', function() {
        _arcFilter.status = $(this).val();
        renderArchiveList();
    });
    $('#search_proceed').on('change', function() {
        _arcFilter.proceed = $(this).val();
        renderArchiveList();
    });
    $('#search_date_from, #search_date_to').on('change', function() {
        _arcFilter.dateFrom = $('#search_date_from').val();
        _arcFilter.dateTo   = $('#search_date_to').val();
        $('.arc_date_quick').removeClass('arc_date_quick_active');
        renderArchiveList();
    });

    // 기간 빠른 버튼
    $(document).on('click', '.arc_date_quick', function() {
        var range = $(this).data('range');
        var now   = new Date();
        var from, to;
        if (range === 'today') {
            from = to = _fmtDate(now);
        } else if (range === 'yesterday') {
            var y = new Date(now); y.setDate(y.getDate() - 1);
            from = to = _fmtDate(y);
        } else if (range === 'thismonth') {
            from = _fmtDate(new Date(now.getFullYear(), now.getMonth(), 1));
            to   = _fmtDate(now);
        } else if (range === 'lastmonth') {
            from = _fmtDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
            to   = _fmtDate(new Date(now.getFullYear(), now.getMonth(), 0));
        }
        $('#search_date_from').val(from);
        $('#search_date_to').val(to);
        _arcFilter.dateFrom = from;
        _arcFilter.dateTo   = to;
        $('.arc_date_quick').removeClass('arc_date_quick_active');
        $(this).addClass('arc_date_quick_active');
        renderArchiveList();
    });

    $('#btn_search_reset').on('click', function() {
        _arcFilter = { name: '', company: '', dateFrom: '', dateTo: '', status: '', proceed: '' };
        $('#search_name').val('');
        $('#search_company').val('');
        $('#search_date_from').val('');
        $('#search_date_to').val('');
        $('#search_status').val('');
        $('#search_proceed').val('');
        $('.arc_date_quick').removeClass('arc_date_quick_active');
        renderArchiveList();
    });

    // 진행 여부
    $(document).on('click', '.btn_proceed', function() {
        var id  = $("#archive_detail_modal").data("current-id");
        var val = $(this).data('val');
        $('.btn_proceed').removeClass('proceed_active');
        $(this).addClass('proceed_active');
        _togglePaymentFields(val === 'O');
        updateArchiveProceed(id, val);
        var $badge = $('[data-id="' + id + '"] .arc_proceed_badge');
        $badge.text(val).removeClass('proceed_o proceed_x proceed_none').addClass(val === 'O' ? 'proceed_o' : 'proceed_x');
    });

    // 상태 변경
    $(document).on('change', '#detail_status_sel', function() {
        var id = $("#archive_detail_modal").data("current-id");
        var newStatus = $(this).val();
        var stClass = ARC_STATUS_CLASS[newStatus] || 'st_wait';
        $(this).removeClass('st_wait st_unpaid st_partial st_paid').addClass(stClass);
        updateArchiveStatus(id, newStatus);
        $('[data-id="' + id + '"] .arc_status_badge').removeClass('st_wait st_unpaid st_partial st_paid').addClass(stClass).text(newStatus);
    });

    // 완납 체크박스
    $(document).on('change', '#detail_paid_full_chk', function() {
        var id = $("#archive_detail_modal").data("current-id");
        if (!$(this).is(':checked')) return;
        var totalNum = parseInt($("#detail_total_num").text().replace(/[^0-9]/g, '')) || 0;
        $("#detail_paid_input").val(totalNum > 0 ? totalNum.toLocaleString('ko-KR') : '');
        var stClass = ARC_STATUS_CLASS['완납'];
        $("#detail_status_sel").val('완납').removeClass('st_wait st_unpaid st_partial st_paid').addClass(stClass);
        updateArchivePayment(id, totalNum, '완납');
        $('[data-id="' + id + '"] .arc_status_badge').removeClass('st_wait st_unpaid st_partial st_paid').addClass(stClass).text('완납');
    });

    // 입금 금액
    $(document).on('input', '#detail_paid_input', function() {
        var raw = this.value.replace(/[^0-9]/g, '');
        var paid = parseInt(raw) || 0;
        this.value = raw;
        var totalNum = parseInt($("#detail_total_num").text().replace(/[^0-9]/g, '')) || 0;
        $("#detail_paid_full_chk").prop('checked', paid > 0 && paid >= totalNum);
        var newStatus = null;
        if (paid > 0 && paid < totalNum)       newStatus = '부분 납부';
        else if (paid > 0 && paid >= totalNum) newStatus = '완납';
        if (newStatus) {
            var stClass = ARC_STATUS_CLASS[newStatus];
            $("#detail_status_sel").val(newStatus).removeClass('st_wait st_unpaid st_partial st_paid').addClass(stClass);
        }
    });

    $(document).on('blur', '#detail_paid_input', function() {
        var raw = this.value.replace(/[^0-9]/g, '');
        var paid = parseInt(raw) || 0;
        this.value = paid > 0 ? paid.toLocaleString('ko-KR') : '';
        var id = $("#archive_detail_modal").data("current-id");
        var newStatus = $("#detail_status_sel").val();
        updateArchivePayment(id, paid, newStatus);
        var stClass = ARC_STATUS_CLASS[newStatus] || 'st_wait';
        $('[data-id="' + id + '"] .arc_status_badge').removeClass('st_wait st_unpaid st_partial st_paid').addClass(stClass).text(newStatus);
    });
});
