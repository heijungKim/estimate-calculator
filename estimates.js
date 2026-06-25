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

function parseBdRow(t) {
    t = (t || '').trim();
    var eqIdx = t.lastIndexOf('='), mulIdx = t.lastIndexOf('×');
    if (mulIdx < 0) mulIdx = t.lastIndexOf('x');
    if (eqIdx > 0 && mulIdx > 0 && mulIdx < eqIdx) {
        var before = t.substring(0, mulIdx).trim();
        var after  = t.substring(mulIdx + 1, eqIdx).trim();
        var totalPart = t.substring(eqIdx + 1).trim();
        var tM = totalPart.match(/([\d,]+)/), uM = after.match(/([\d,]+)/);
        var total = tM ? tM[1] : '', unit = uM ? uM[1] : '';
        return { name: before, qty: '', unit: unit, total: total };
    }
    var m2 = t.match(/^(.+?)\s+([\d,]+)원?$/);
    if (m2) return { name: m2[1].trim(), qty: '', unit: '', total: m2[2] };
    return null;
}

function buildPrintDoc(items, totalNum, customer, manager, notes) {
    var _f = function(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
    var totalFormatted = _f(totalNum);
    var totalKorean = numberToKorean(totalNum);
    var today = new Date();
    var mm = ('0' + (today.getMonth()+1)).slice(-2), dd = ('0' + today.getDate()).slice(-2);
    var dateStr = today.getFullYear() + '년 ' + mm + '월 ' + dd + '일';
    var estNo = String(Math.floor(Math.random() * 9000) + 1000);

    var tableRows = [];
    items.forEach(function(item) {
        var chItemLines = [];
        if (item.details && item.details.indexOf('[담긴 항목') > -1) {
            item.details.split('\n').forEach(function(ln) {
                var m = ln.trim().match(/^\((\d+)\)\s+(.+?)\s+→\s+([\d,]+)원/);
                if (m) chItemLines.push({ name: item.category + ' - ' + m[2], qty: '1', unit: m[3], total: m[3] });
            });
        }
        if (item.breakdown) {
            var parts = item.breakdown.split(' / '), added = false;
            parts.forEach(function(p) {
                if (chItemLines.length > 0 && p.indexOf('담긴 항목 합계') > -1) return;
                var r = parseBdRow(p);
                if (r) { tableRows.push(r); added = true; }
            });
            chItemLines.forEach(function(r) { tableRows.push(r); added = true; });
            if (!added) tableRows.push({ name: item.category, qty: '1', unit: _f(item.priceNum), total: _f(item.priceNum) });
        } else {
            if (chItemLines.length > 0) {
                chItemLines.forEach(function(r) { tableRows.push(r); });
            } else {
                tableRows.push({ name: item.category, qty: '1', unit: _f(item.priceNum), total: _f(item.priceNum) });
            }
        }
    });

    var rowsHtml = '';
    tableRows.forEach(function(r) {
        rowsHtml += '<tr><td>' + escHtml(r.name) + '</td><td class="tc">' + escHtml(r.qty) + '</td><td class="tr">' + escHtml(r.unit) + '</td><td class="tr">' + escHtml(r.total) + '</td></tr>';
    });
    for (var ei = tableRows.length; ei < 15; ei++) rowsHtml += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';

    var managerLine = manager ? '<tr><td class="il">담&nbsp;&nbsp;&nbsp;당:</td><td>' + escHtml(manager) + '</td></tr>' : '';
    var notesBlock = notes ? '<div class="notes-box"><strong>비고</strong><br>' + escHtml(notes).replace(/\n/g,'<br>') + '</div>' : '';

    return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>견적서</title><style>' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    'body{font-family:"맑은 고딕","Malgun Gothic",sans-serif;padding:14mm 18mm;font-size:10pt;color:#000;background:#fff}' +
    '@media print{body{padding:10mm 14mm}.no-print{display:none!important}}' +
    '.no-print{text-align:center;margin-bottom:14px}.print-btn{padding:8px 32px;font-size:11pt;cursor:pointer;background:#1a1a2e;color:#fff;border:none;border-radius:4px}' +
    'h1{text-align:center;font-size:28pt;letter-spacing:18px;font-weight:bold;margin-bottom:2px}' +
    '.title-line{border:none;border-top:3px double #000;margin:2px auto 14px;width:60%}' +
    '.info-section{display:flex;gap:12px;margin-bottom:8px}.info-left{flex:1}.info-right{flex:1}' +
    '.info-left table{border-collapse:collapse;font-size:10pt;width:100%}.info-left td{padding:2px 4px;vertical-align:top}' +
    '.il{font-weight:bold;white-space:nowrap;width:80px}' +
    '.customer-line{font-size:11pt;font-weight:bold;padding:3px 4px}' +
    '.supplier-box{border:2px solid #000;display:flex;height:100%}' +
    '.supplier-label{writing-mode:vertical-lr;text-align:center;font-weight:bold;font-size:14pt;padding:6px 5px;border-right:2px solid #000;letter-spacing:10px;background:#f8f8f8}' +
    '.supplier-table{border-collapse:collapse;flex:1;font-size:9.5pt}' +
    '.supplier-table td{border:1px solid #000;padding:4px 8px}' +
    '.supplier-table td.sl{font-weight:bold;text-align:center;white-space:nowrap;width:50px;background:#f8f8f8}' +
    '.intro{font-size:10.5pt;margin:8px 0 6px 16px;font-weight:bold}' +
    '.total-box{border:2px solid #000;padding:9px 18px;margin:6px 0 10px;font-size:12pt;font-weight:bold;display:flex;justify-content:space-between;background:#fafafa}' +
    '.items-table{width:100%;border-collapse:collapse}' +
    '.items-table th{border:2px solid #000;padding:6px 8px;background:#f0f0f0;font-size:9.5pt;text-align:center;font-weight:bold}' +
    '.items-table td{border:1px solid #000;padding:5px 8px;font-size:9.5pt}' +
    '.items-table td.tc{text-align:center}.items-table td.tr{text-align:right;font-variant-numeric:tabular-nums}' +
    '.items-table tfoot td{border:2px solid #000;font-weight:bold;font-size:9.5pt;padding:5px 8px}' +
    '.items-table tfoot td.tl{text-align:right;letter-spacing:3px}' +
    '.footer-mark{text-align:center;margin-top:12px;font-size:9pt;color:#666;letter-spacing:4px;border-top:1px solid #ccc;padding-top:8px}' +
    '.notes-box{margin-top:10px;padding:8px 12px;border:1px solid #aaa;font-size:9.5pt;line-height:1.7}' +
    '</style></head><body>' +
    '<div class="no-print"><button class="print-btn" onclick="window.print()">인쇄하기</button></div>' +
    '<h1>견 적 서</h1><hr class="title-line">' +
    '<div class="info-section"><div class="info-left"><table>' +
      '<tr><td class="il">견적일자:</td><td>' + dateStr + '</td></tr>' +
      '<tr><td colspan="2" class="customer-line">' + escHtml(customer || '') + '&nbsp;&nbsp;귀하</td></tr>' +
      '<tr><td class="il">수&nbsp;&nbsp;&nbsp;신:</td><td></td></tr>' +
      '<tr><td class="il">제&nbsp;&nbsp;&nbsp;목:</td><td></td></tr>' +
      '<tr><td class="il">견적번호:</td><td>' + estNo + '</td></tr>' +
      '<tr><td class="il">유효기간:</td><td></td></tr>' +
      managerLine +
      '<tr><td class="il">지불조건:</td><td></td></tr>' +
    '</table></div><div class="info-right"><div class="supplier-box">' +
      '<div class="supplier-label">공<br>급<br>자</div>' +
      '<table class="supplier-table">' +
        '<tr><td class="sl">등록<br>번호</td><td colspan="3">308-04-88155</td></tr>' +
        '<tr><td class="sl">상호</td><td>우성디지탈</td><td class="sl">성명</td><td>김일웅</td></tr>' +
        '<tr><td class="sl">주소</td><td colspan="3">경기도 양주시 고암동 388</td></tr>' +
        '<tr><td class="sl">업태</td><td>서비스</td><td class="sl">종목</td><td>광고업</td></tr>' +
      '</table></div></div></div>' +
    '<p class="intro">아래와같이 견적합니다.</p>' +
    '<div class="total-box"><span>합계금액: 일금&nbsp;&nbsp;' + totalKorean + '원정</span><span>(&#8361;' + totalFormatted + '-)</span></div>' +
    '<table class="items-table"><thead><tr>' +
      '<th style="width:auto">품목 코드 및 품목명</th><th style="width:70px">수 량</th><th style="width:100px">단 가</th><th style="width:100px">공급가액</th>' +
    '</tr></thead><tbody>' + rowsHtml + '</tbody><tfoot>' +
      '<tr><td class="tl" colspan="3">공급가계:</td><td class="tr">' + totalFormatted + '</td></tr>' +
      '<tr><td class="tl" colspan="3">세 액 계:</td><td class="tr"></td></tr>' +
      '<tr><td class="tl" colspan="3">합&nbsp;&nbsp;&nbsp;계:</td><td class="tr">' + totalFormatted + '</td></tr>' +
    '</tfoot></table>' +
    notesBlock +
    '<div class="footer-mark">※ ※ ※ ※ ※ ※ ※ 이 하 &nbsp; 여 백 ※ ※ ※ ※ ※ ※ ※</div>' +
    '</body></html>';
}

function openPrintWindow(html) {
    var win = window.open('', '_blank', 'width=960,height=1050,scrollbars=yes');
    if (!win) { alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요."); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
}

// ── 렌더링 (테이블) ──────────────────────────────────────────
function renderArchiveList() {
    _initFirestore();
    var $el = $("#archive_list");
    if (_archivesDoc) $el.html('<p class="archive_empty">불러오는 중…</p>');
    getArchives(function(allList) {
        var list = applyArchiveFilter(allList);

        var countText = allList.length + '건';
        if (list.length < allList.length) countText += ' (검색 ' + list.length + '건)';
        $('#arc_count').text(countText);

        // 합계 계산
        var sumTotal = 0, sumProceed = 0, sumPaid = 0;
        list.forEach(function(a) {
            var t = Number(a.total) || 0;
            var p = Number(a.paid)  || 0;
            sumTotal += t;
            if (a.proceed === 'O') {
                sumProceed += t;
                sumPaid    += p;
            }
        });
        var sumUnpaid = Math.max(0, sumProceed - sumPaid);
        var fk = function(n) { return n.toLocaleString('ko-KR'); };
        $('#arc_summary').html(
            '<div class="arc-sum-item">' +
                '<span class="arc-sum-label">견적 수</span>' +
                '<span class="arc-sum-value">' + list.length + '건</span>' +
            '</div>' +
            '<div class="arc-sum-item">' +
                '<span class="arc-sum-label">견적 금액</span>' +
                '<span class="arc-sum-value">&#8361; ' + fk(sumTotal) + '</span>' +
            '</div>' +
            '<div class="arc-sum-item sum-proceed">' +
                '<span class="arc-sum-label">진행 견적 금액</span>' +
                '<span class="arc-sum-value">&#8361; ' + fk(sumProceed) + '</span>' +
            '</div>' +
            '<div class="arc-sum-item sum-paid">' +
                '<span class="arc-sum-label">입금 금액</span>' +
                '<span class="arc-sum-value">&#8361; ' + fk(sumPaid) + '</span>' +
            '</div>' +
            '<div class="arc-sum-item sum-unpaid">' +
                '<span class="arc-sum-label">미수 금액</span>' +
                '<span class="arc-sum-value">&#8361; ' + fk(sumUnpaid) + '</span>' +
            '</div>'
        );

        if (!list.length) {
            var msg = allList.length ? '검색 결과가 없습니다.' : '저장된 견적이 없습니다.';
            $el.html('<p class="archive_empty">' + msg + '</p>');
            return;
        }

        list = list.slice().sort(function(a, b) {
            return (b.date || '').localeCompare(a.date || '');
        });

        var rows = list.map(function(arc, idx) {
            var st      = arc.status || '대기';
            var stClass = ARC_STATUS_CLASS[st] || 'st_wait';
            var proc    = arc.proceed || '';
            var procClass = proc === 'O' ? 'proceed_o' : (proc === 'X' ? 'proceed_x' : 'proceed_none');
            var showSt  = proc === 'O';

            return '<tr data-id="' + arc.id + '">' +
                '<td class="tc">' + (idx + 1) + '</td>' +
                '<td class="arc-tbl-name">' + escHtml(arc.name) + '</td>' +
                '<td>' + escHtml(arc.company || '-') + '</td>' +
                '<td class="tc">' + escHtml(arc.date || '-') + '</td>' +
                '<td class="tr">&#8361; ' + escHtml(arc.totalFormatted || '') + '</td>' +
                '<td class="tc">' + (arc.itemCount || 0) + '개</td>' +
                '<td class="tc"><span class="arc-tbl-proceed ' + procClass + '">' + (proc || '-') + '</span></td>' +
                '<td class="tc"><span class="arc-tbl-status arc_status_badge ' + (showSt ? stClass : 'st_none') + '">' + (showSt ? st : '-') + '</span></td>' +
                '<td class="arc-tbl-actions">' +
                    '<button class="archive_view_btn" data-id="' + arc.id + '">내역</button>' +
                    '<button class="archive_del_btn"  data-id="' + arc.id + '">삭제</button>' +
                '</td>' +
            '</tr>';
        }).join('');

        $el.html(
            '<div class="arc-tbl-wrap">' +
            '<table class="arc-table">' +
            '<thead><tr>' +
                '<th class="tc">No.</th><th>견적명</th><th>업체명</th>' +
                '<th class="tc">날짜</th><th class="tr">금액</th><th class="tc">항목</th>' +
                '<th class="tc">진행</th><th class="tc">상태</th><th>관리</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
            '</table>' +
            '</div>'
        );
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
        var custName = (arc.company ? arc.company + ' ' : '') + (arc.name || '');
        openPrintWindow(buildPrintDoc(items, arc.total, custName, '', ''));
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
        var $badge = $('[data-id="' + id + '"] .arc-tbl-proceed');
        $badge.text(val).removeClass('proceed_o proceed_x proceed_none').addClass(val === 'O' ? 'proceed_o' : 'proceed_x');
    });

    // 상태 변경
    $(document).on('change', '#detail_status_sel', function() {
        var id = $("#archive_detail_modal").data("current-id");
        var newStatus = $(this).val();
        var stClass = ARC_STATUS_CLASS[newStatus] || 'st_wait';
        $(this).removeClass('st_wait st_unpaid st_partial st_paid').addClass(stClass);
        updateArchiveStatus(id, newStatus);
        $('[data-id="' + id + '"] .arc-tbl-status').removeClass('st_wait st_unpaid st_partial st_paid').addClass(stClass).text(newStatus);
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
        $('[data-id="' + id + '"] .arc-tbl-status').removeClass('st_wait st_unpaid st_partial st_paid').addClass(stClass).text('완납');
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
        $('[data-id="' + id + '"] .arc-tbl-status').removeClass('st_wait st_unpaid st_partial st_paid').addClass(stClass).text(newStatus);
    });
});
