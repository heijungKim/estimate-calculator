// ============================================================
// 단가 설정 (기본값 - 단가설정 모달에서 변경 가능)
// ============================================================
var DEFAULT_PRICES = {
    // 사인탑 비조명 (m²)
    sign01_flex_print: 30000, sign01_flex_sheet: 32000, sign01_tension_none: 22000,
    // 사인탑 조명 (m²)
    sign02_flex_print: 38000, sign02_flex_sheet: 40000, sign02_tension_none: 30000,
    // 사인탑 돌출 (세로 m당)
    sign03_w800: 70000, sign03_w900: 75000, sign03_w1000: 80000, sign03_w1100: 85000, sign03_w1200: 90000,
    // 사인탑 돌출 화면작업
    sign03_flex_uv: 8000, sign03_flex_sol: 7000, sign03_flex_sheet: 10000,
    // 사인탑 공통
    sign_led: 4500, sign_sten_molding: 20000, sign_color_paint_nol: 10000, sign_color_paint_light: 10000,
    // 사인탑 까치발 (개당)
    angle_w200: 2000, angle_w250: 2500, angle_w300: 3000, angle_w400: 3500, angle_w500: 4000, angle_w600: 4200, angle_w700: 4500,
    angle_w800: 4800, angle_w900: 5000, angle_w1000: 5800, angle_w1100: 5800,
    angle_w1200: 6000, angle_w1300: 6800, angle_w1400: 6800, angle_w1500: 6800,
    angle_w1600: 7000, angle_w1700: 7200, angle_w1800: 7400, angle_w1900: 7600, angle_w2000: 8200,
    // 알루미늄 채널 - 영문 (글자당)
    ch_taka_eng_30: 25000, ch_taka_eng_40: 28000, ch_taka_eng_50: 34000, ch_taka_eng_60: 40000,
    ch_taka_eng_70: 43000, ch_taka_eng_80: 48000, ch_taka_eng_90: 50000, ch_taka_eng_100: 54000,
    ch_taka_eng_110: 66000, ch_taka_eng_120: 78000, ch_taka_eng_130: 94000, ch_taka_eng_140: 115000, ch_taka_eng_150: 130000, ch_taka_eng_160: 0, ch_taka_eng_170: 0, ch_taka_eng_180: 0,
    // 알루미늄 채널 - 한글 (글자당)
    ch_taka_kor_30: 25000, ch_taka_kor_40: 28000, ch_taka_kor_50: 34000, ch_taka_kor_60: 40000,
    ch_taka_kor_70: 43000, ch_taka_kor_80: 48000, ch_taka_kor_90: 50000, ch_taka_kor_100: 54000,
    ch_taka_kor_110: 66000, ch_taka_kor_120: 78000, ch_taka_kor_130: 94000, ch_taka_kor_140: 115000, ch_taka_kor_150: 130000, ch_taka_kor_160: 0, ch_taka_kor_170: 0, ch_taka_kor_180: 0,
    // 알루미늄 채널 - 흘림체 (글자당)
    ch_taka_got_30: 25000, ch_taka_got_40: 28000, ch_taka_got_50: 34000, ch_taka_got_60: 40000,
    ch_taka_got_70: 43000, ch_taka_got_80: 48000, ch_taka_got_90: 50000, ch_taka_got_100: 54000,
    ch_taka_got_110: 66000, ch_taka_got_120: 78000, ch_taka_got_130: 94000, ch_taka_got_140: 115000, ch_taka_got_150: 130000, ch_taka_got_160: 0, ch_taka_got_170: 0, ch_taka_got_180: 0,
    // 티타늄골드채널 - 영문 (글자당)
    ch_titan_eng_20: 0, ch_titan_eng_25: 0, ch_titan_eng_30: 0, ch_titan_eng_35: 0, ch_titan_eng_40: 0, ch_titan_eng_45: 0, ch_titan_eng_50: 0, ch_titan_eng_60: 0, ch_titan_eng_70: 0, ch_titan_eng_80: 0, ch_titan_eng_90: 0, ch_titan_eng_100: 0,
    // 티타늄골드채널 - 한글 (글자당)
    // 티타늄골드채널 - 흘림체 (글자당)
    ch_titan_got_20: 0, ch_titan_got_25: 0, ch_titan_got_30: 0, ch_titan_got_35: 0, ch_titan_got_40: 0, ch_titan_got_45: 0, ch_titan_got_50: 0, ch_titan_got_60: 0, ch_titan_got_70: 0, ch_titan_got_80: 0, ch_titan_got_90: 0, ch_titan_got_100: 0,
    // 스텐채널 - 영문 (글자당)
    ch_sten_eng_20: 0, ch_sten_eng_25: 0, ch_sten_eng_30: 0, ch_sten_eng_35: 0, ch_sten_eng_40: 0, ch_sten_eng_45: 0, ch_sten_eng_50: 0, ch_sten_eng_60: 0, ch_sten_eng_70: 0, ch_sten_eng_80: 0, ch_sten_eng_90: 0, ch_sten_eng_100: 0,
    // 스텐채널 - 한글 (글자당)
    // 스텐채널 - 흘림체 (글자당)
    ch_sten_got_20: 0, ch_sten_got_25: 0, ch_sten_got_30: 0, ch_sten_got_35: 0, ch_sten_got_40: 0, ch_sten_got_45: 0, ch_sten_got_50: 0, ch_sten_got_60: 0, ch_sten_got_70: 0, ch_sten_got_80: 0, ch_sten_got_90: 0, ch_sten_got_100: 0,
    // 갈바채널 ×1.3 - 영문 (글자당)
    ch_galva_eng_30: 0, ch_galva_eng_35: 0, ch_galva_eng_40: 0, ch_galva_eng_45: 0, ch_galva_eng_50: 0, ch_galva_eng_60: 0, ch_galva_eng_70: 0, ch_galva_eng_80: 0, ch_galva_eng_90: 0, ch_galva_eng_100: 0,
    // 갈바채널 ×1.3 - 한글 (글자당)
    // 갈바채널 ×1.3 - 흘림체 (글자당)
    ch_galva_got_30: 0, ch_galva_got_35: 0, ch_galva_got_40: 0, ch_galva_got_45: 0, ch_galva_got_50: 0, ch_galva_got_60: 0, ch_galva_got_70: 0, ch_galva_got_80: 0, ch_galva_got_90: 0, ch_galva_got_100: 0,
    // 갈바오사이채널 ×1.3 - 영문 (글자당)
    ch_gosa_eng_30: 0, ch_gosa_eng_35: 0, ch_gosa_eng_40: 0, ch_gosa_eng_45: 0, ch_gosa_eng_50: 0, ch_gosa_eng_60: 0, ch_gosa_eng_70: 0, ch_gosa_eng_80: 0, ch_gosa_eng_90: 0, ch_gosa_eng_100: 0,
    // 갈바오사이채널 ×1.3 - 한글 (글자당)
    // 갈바오사이채널 ×1.3 - 흘림체 (글자당)
    ch_gosa_got_30: 0, ch_gosa_got_35: 0, ch_gosa_got_40: 0, ch_gosa_got_45: 0, ch_gosa_got_50: 0, ch_gosa_got_60: 0, ch_gosa_got_70: 0, ch_gosa_got_80: 0, ch_gosa_got_90: 0, ch_gosa_got_100: 0,
    // 일체형 채널 - 영문 (글자당)
    ch_ilche_eng_20: 0, ch_ilche_eng_25: 0, ch_ilche_eng_30: 0, ch_ilche_eng_35: 0, ch_ilche_eng_40: 0, ch_ilche_eng_45: 0, ch_ilche_eng_50: 0, ch_ilche_eng_55: 0, ch_ilche_eng_60: 0, ch_ilche_eng_65: 0, ch_ilche_eng_70: 0,
    // 일체형 채널 - 한글 (글자당)
    ch_ilche_kor_20: 0, ch_ilche_kor_25: 0, ch_ilche_kor_30: 0, ch_ilche_kor_35: 0, ch_ilche_kor_40: 0, ch_ilche_kor_45: 0, ch_ilche_kor_50: 0, ch_ilche_kor_55: 0, ch_ilche_kor_60: 0, ch_ilche_kor_65: 0, ch_ilche_kor_70: 0,
    // 일체형 채널 - 흘림체 (글자당)
    ch_ilche_got_20: 0, ch_ilche_got_25: 0, ch_ilche_got_30: 0, ch_ilche_got_35: 0, ch_ilche_got_40: 0, ch_ilche_got_45: 0, ch_ilche_got_50: 0, ch_ilche_got_55: 0, ch_ilche_got_60: 0, ch_ilche_got_65: 0, ch_ilche_got_70: 0,
		// 에폭시채널 (글자당)
		ch_epox_eng_20: 0, ch_epox_eng_25: 0, ch_epox_eng_30: 0, ch_epox_eng_35: 0, ch_epox_eng_40: 0, ch_epox_eng_45: 0, ch_epox_eng_50: 0, ch_epox_eng_55: 0, ch_epox_eng_60: 0, ch_epox_eng_65: 0, ch_epox_eng_70: 0,
		ch_epox_kor_20: 0, ch_epox_kor_25: 0, ch_epox_kor_30: 0, ch_epox_kor_35: 0, ch_epox_kor_40: 0, ch_epox_kor_45: 0, ch_epox_kor_50: 0, ch_epox_kor_55: 0, ch_epox_kor_60: 0, ch_epox_kor_65: 0, ch_epox_kor_70: 0,
		ch_epox_got_20: 0, ch_epox_got_25: 0, ch_epox_got_30: 0, ch_epox_got_35: 0, ch_epox_got_40: 0, ch_epox_got_45: 0, ch_epox_got_50: 0, ch_epox_got_55: 0, ch_epox_got_60: 0, ch_epox_got_65: 0, ch_epox_got_70: 0,
    // 채널문자 LED (개당)
    ch_led_white: 450, ch_led_warm: 500, ch_led_rgb: 800, ch_led_panorama: 3500, ch_led_color: 500,
    // 채널문자 LED 위치 추가금액 (글자당) - 갈바/갈바오사이/스텐채널
    ch_led_pos_jeon: 0, ch_led_pos_hu: 0, ch_led_pos_jeonhu: 0,
    // 채널문자 기타
    ch_ggachi_200: 2000, ch_ggachi_250: 2500, ch_ggachi_300: 3000, ch_ggachi_400: 3500,
    ch_complete: 100000,
    ch_trusbar_150: 25000, ch_trusbar_200: 30000, ch_trusbar_250: 40000, ch_trusbar_300: 40000, ch_trusbar_400: 60000,
    // 후렉스 출력 (m²)
    flex_uv_double: 8000, flex_sol: 7000, flex_high_bright: 11000, flex_punch: 5000, flex_freq: 8000,
    // UV 실사 (m²)
    uv_white: 10000, uv_white_grey: 10000, uv_clear: 10000,
    uv_clear_mirror: 15000, uv_clear_black: 25000,
    uv_punch_pet: 7000, uv_light_white: 13000, uv_embo: 10000, uv_cut: 2000,
    // 솔벤 실사 (m²)
    sol_white: 10000, sol_white_grey: 10000, sol_oneway: 13000, sol_light_white: 13000,
    sol_embo: 10000, sol_high_reflect: 40000, sol_banner: 6000, sol_cut: 2000, sol_coat: 3000,
    // 공통자재
    cm_floodlight: 0,
    cm_timer_20a: 0, cm_timer_30a: 0, cm_timer_50a: 0,
    cm_smps_60w: 0, cm_smps_100w: 0, cm_smps_150w: 0, cm_smps_200w: 0, cm_smps_300w: 0, cm_smps_400w: 0, cm_smps_500w: 0,
    cm_fluorescent: 0,
    cm_led_ctrl_1ch: 0, cm_led_ctrl_2ch: 0, cm_led_ctrl_3ch: 0,
    cm_led_white: 450, cm_led_warm: 500, cm_led_rgb: 800, cm_led_panorama: 3500, cm_led_color: 500,
};

var PRICES = JSON.parse(JSON.stringify(DEFAULT_PRICES));
var _chItems = []; // 채널문자 담기 목록 [{label, details, price}]

// ── 단가 Firebase 연동 ──────────────────────────────────────
var _pricesDoc = null;
function _initPricesDoc() {
    if (_pricesDoc) return;
    try {
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') return;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        _pricesDoc = firebase.firestore().collection('settings').doc('unit_prices');
    } catch(e) {}
}
function savePricesToFirebase(data) {
    _initPricesDoc();
    if (!_pricesDoc) return;
    _pricesDoc.set(data).catch(function(){});
}

function getSignDimensions() {
    var w, h;
    if($("#sigh_option03").is(":checked")) {
        if($("#sigh_angle_width_800").is(":checked"))       w = 0.8;
        else if($("#sigh_angle_width_900").is(":checked"))  w = 0.9;
        else if($("#sigh_angle_width_1000").is(":checked")) w = 1.0;
        else if($("#sigh_angle_width_1100").is(":checked")) w = 1.1;
        else                                                w = 1.2;
        h = nv("#sigh_vertical") / 1000;
        if(h < 1.5 && h > 0) h = 1.5;
    } else {
        w = nv("#sigh_row") / 1000;
        h = nv("#sigh_vertical") / 1000;
        if($("#sigh_option_row").is(":checked")) {
            if(w < 1.5 && w > 0) w = 1.5;
            if(h < 1   && h > 0) h = 1;
        } else {
            if(w < 1   && w > 0) w = 1;
            if(h < 1.5 && h > 0) h = 1.5;
        }
    }
    return { w: w || 0, h: h || 0 };
}

function getBackdropPrice() {
    if(!$("#sigh_backdrop_yes").is(":checked")) return 0;
    var d = getSignDimensions();
    if(d.w <= 0 || d.h <= 0) return 0;
    return d.w * d.h * 3000;
}

function getBackdropColorPrice() {
    if(!$("#sigh_frame_color_custom").is(":checked")) return 0;
    var d = getSignDimensions();
    if(d.w <= 0 || d.h <= 0) return 0;
    return (d.w + d.h + d.w + d.h) * 6000;
}

function getDeungbakPrice() {
    if(!$("#sigh_deungbak_yes").is(":checked")) return 0;
    var d = getSignDimensions();
    var posId = $("input[name='sigh_deungbak_pos']:checked").attr("id") || "sigh_deungbak_top";
    var len = 0;
    if(posId === "sigh_deungbak_top"    || posId === "sigh_deungbak_bottom") len = d.w;
    else if(posId === "sigh_deungbak_left"  || posId === "sigh_deungbak_right")  len = d.h;
    else if(posId === "sigh_deungbak_center") len = d.w;
    else if(posId === "sigh_deungbak_all")    len = 2 * (d.w + d.h);
    if(len <= 0) return 0;
    if($("#sigh_deungbak_galva").is(":checked")) {
        return len <= 5 ? 300000 : 300000 + Math.ceil(len - 5) * 50000;
    } else {
        var per3m = $("#sigh_kyungbak_50").is(":checked") ? 60000 : 80000;
        return Math.ceil(len / 3) * per3m;
    }
}

function getAnglePrice(count) {
    var n = Number(count) || 0;
    if($("#sigh_angle_width_200").is(":checked"))  return PRICES.angle_w200 * n;
    if($("#sigh_angle_width_250").is(":checked"))  return PRICES.angle_w250 * n;
    if($("#sigh_angle_width_300").is(":checked"))  return PRICES.angle_w300 * n;
    if($("#sigh_angle_width_400").is(":checked"))  return PRICES.angle_w400 * n;
    if($("#sigh_angle_width_500").is(":checked"))  return PRICES.angle_w500 * n;
    if($("#sigh_angle_width_600").is(":checked"))  return PRICES.angle_w600 * n;
    if($("#sigh_angle_width_700").is(":checked"))  return PRICES.angle_w700 * n;
    if($("#sigh_angle_width_800").is(":checked"))  return PRICES.angle_w800 * n;
    if($("#sigh_angle_width_900").is(":checked"))  return PRICES.angle_w900 * n;
    if($("#sigh_angle_width_1000").is(":checked")) return PRICES.angle_w1000 * n;
    if($("#sigh_angle_width_1100").is(":checked")) return PRICES.angle_w1100 * n;
    if($("#sigh_angle_width_1200").is(":checked")) return PRICES.angle_w1200 * n;
    if($("#sigh_angle_width_1300").is(":checked")) return PRICES.angle_w1300 * n;
    if($("#sigh_angle_width_1400").is(":checked")) return PRICES.angle_w1400 * n;
    if($("#sigh_angle_width_1500").is(":checked")) return PRICES.angle_w1500 * n;
    if($("#sigh_angle_width_1600").is(":checked")) return PRICES.angle_w1600 * n;
    if($("#sigh_angle_width_1700").is(":checked")) return PRICES.angle_w1700 * n;
    if($("#sigh_angle_width_1800").is(":checked")) return PRICES.angle_w1800 * n;
    if($("#sigh_angle_width_1900").is(":checked")) return PRICES.angle_w1900 * n;
    if($("#sigh_angle_width_2000").is(":checked")) return PRICES.angle_w2000 * n;
    return 0;
}

// ── 최종 가격 10원 단위 반올림 ────────────────────────────
function _r10(v){ return Math.round(v/10)*10; }

// ── 콤마 제거 후 숫자 반환 헬퍼 ────────────────────────────
function nv(sel) {
    return Number(($(sel).val() || '').toString().replace(/,/g, ''));
}
// 숫자를 콤마 포함 문자열로 변환
function fmtNum(n) {
    return n >= 1000 ? Number(n).toLocaleString('ko-KR') : String(n);
}
// 입력 이벤트용 콤마 포맷터 (커서 위치 보정)
function formatCommaInput(el) {
    var oldVal = el.value;
    var selStart = el.selectionStart;

    // 포맷 전 커서 앞에 있는 순수 숫자 개수
    var digitsBefore = oldVal.slice(0, selStart).replace(/[^0-9]/g, '').length;

    var raw = oldVal.replace(/[^0-9]/g, '');
    if (!raw) { el.value = ''; return; }
    var newVal = Number(raw).toLocaleString('ko-KR');
    el.value = newVal;

    // 새 문자열에서 digitsBefore 번째 숫자 뒤로 커서 복원
    var newPos = newVal.length;
    if (digitsBefore === 0) {
        newPos = 0;
    } else {
        var counted = 0;
        for (var i = 0; i < newVal.length; i++) {
            if (/[0-9]/.test(newVal[i])) counted++;
            if (counted === digitsBefore) { newPos = i + 1; break; }
        }
    }
    el.setSelectionRange(newPos, newPos);
}

function addExtraCostRow() {
    var $row = $("<div class='extra-cost-row'>" +
        "<input type='text' class='extra-cost-name' placeholder='항목명' />" +
        "<input type='text' inputmode='numeric' class='extra-cost-amount comma-fmt' placeholder='금액' />" +
        "<span class='extra-cost-won'>원</span>" +
        "<button type='button' class='btn-remove-extra' title='삭제'>&#10005;</button>" +
    "</div>");
    $("#extra_cost_list").append($row);
    $row.find(".extra-cost-amount").on("input", function(){ formatCommaInput(this); syncExtraCosts(); });
    $row.find(".btn-remove-extra").on("click", function(){ $(this).closest(".extra-cost-row").remove(); syncExtraCosts(); });
}

function extraCostBdItems() {
    var out = '';
    $(".extra-cost-row").each(function(){
        var _n = $.trim($(this).find(".extra-cost-name").val()) || '추가금액';
        var _a = parseInt(String($(this).find(".extra-cost-amount").val()).replace(/[^0-9]/g,'')) || 0;
        if(_a > 0) out += "<span class='bd_item'>" + _n + " × 1개 = " + String(_a).replace(/\B(?=(\d{3})+(?!\d))/g,',') + "원</span>";
    });
    return out;
}
function syncExtraCosts() {
    var total = 0;
    $(".extra-cost-amount").each(function(){
        total += parseInt(String(this.value).replace(/[^0-9]/g,'')) || 0;
    });
    $("#more_order_price").val(total).trigger("change");
}

function getExtraCostText() {
    var parts = [];
    $(".extra-cost-row").each(function(){
        var name = $.trim($(this).find(".extra-cost-name").val()) || '추가';
        var raw  = $(this).find(".extra-cost-amount").val() || '0';
        var amt  = parseInt(String(raw).replace(/[^0-9]/g,'')) || 0;
        if (amt > 0) parts.push(name + " " + fmtNum(amt) + "원");
    });
    return parts.join(" / ");
}

function applyPrices() {
    Object.keys(DEFAULT_PRICES).forEach(function(key) {
        var val = parseFloat(String($("#p_" + key).val()).replace(/,/g, ''));
        if(!isNaN(val) && val >= 0) PRICES[key] = val;
    });
}

function resetPrices() {
    PRICES = JSON.parse(JSON.stringify(DEFAULT_PRICES));
    Object.keys(DEFAULT_PRICES).forEach(function(key) {
        $("#p_" + key).val(fmtNum(DEFAULT_PRICES[key]));
    });
}

//window popup script
function winPop(url) {
    window.open(url, "popup", "width=300,height=300,left=10,top=10,resizable=no,scrollbars=no");
}
/**
 * document.location.href split
 * return array Param
 */
function getQueryString(sKey)
{
    var sQueryString = document.location.search.substring(1);
    var aParam       = {};

    if (sQueryString) {
        var aFields = sQueryString.split("&");
        var aField  = [];
        for (var i=0; i<aFields.length; i++) {
            aField = aFields[i].split('=');
            aParam[aField[0]] = aField[1];
        }
    }

    aParam.page = aParam.page ? aParam.page : 1;
    return sKey ? aParam[sKey] : aParam;
};

$(function(){
    // tab
    $.eTab = function(ul){
        $(ul).find('a').on('click', function(){
            var _li = $(this).parent('li').addClass('selected').siblings().removeClass('selected'),
                _target = $(this).attr('href'),
                _siblings = '.' + $(_target).attr('class');
            $(_target).show().siblings(_siblings).hide();
            return false
        });
    }
    if ( window.call_eTab ) {
        call_eTab();
    };
});



$(".woosung_wrap .tab_area ul li").click(function(){
	$(".woosung_wrap .tab_area ul li").removeClass("active");
	$(this).addClass("active");
	if($(this).hasClass("child01")){ //사인탑
		set_sign_top();
	}else if($(this).hasClass("child02")){ //채널문자
		set_channel_top();
	}else if($(this).hasClass("child03")){ //간판프레임
		set_frame_top();
	}else if($(this).hasClass("child04")){ //실사출력
		set_actual_top();
	}else if($(this).hasClass("child06")){ //공통자재
		set_common_material_top();
	}else{ // 스카시
		set_skasi_top();
	}

});

//사인탑
function set_sign_top(){ //사인탑 초기설정
	$("#option_table thead,#option_table tbody").html("");
	$("#option_table thead").html("<tr id='sign_option_area'><th>품목</th><td><label><input type='radio' name='sigh_option' id='sigh_option01'>비조명</label><label><input type='radio' name='sigh_option' id='sigh_option02'>조명</label><label><input type='radio' name='sigh_option' id='sigh_option03'>돌출</label></td></tr>");
	$("#sign_option_area input").change(function(){
		set_sign_top_option_select();
	});
}

function set_sign_top_option_select(){
	var append_html = "";
	if($("#sigh_option01").is(":checked")){ //비조명
		append_html += "<tr>";
			append_html += "<th>방향선택</th>";
			append_html += "<td><label><input type='radio' name='sigh_option_direction' id='sigh_option_row' checked='checked'>가로형</label><label><input type='radio' name='sigh_option_direction' id='sigh_option_vertical'>세로형</label></td>";
		append_html += "</tr>";	
		append_html += "<tr class='sigh_row'>";
			append_html += "<th>가로 (1500기본)</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='sigh_row'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr class='sigh_vertical'>";
			append_html += "<th>세로 (1000 기본)</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='sigh_vertical'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>화면작업</th>";
			append_html += "<td><label><input type='radio' name='sigh_display' id='sigh_display_01' checked='checked'>후렉스출력</label><label><input type='radio' name='sigh_display' id='sigh_display_02'>후렉스시트</label><label><input type='radio' name='sigh_display' id='sigh_display_03' >텐션없음</label></td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>프레임색상</th>";
			append_html += "<td><label><input type='radio' name='sigh_frame_color' id='sigh_frame_color_white' checked='checked'>백색</label><label><input type='radio' name='sigh_frame_color' id='sigh_frame_color_custom'>지정색도장</label><label><input type='radio' name='sigh_frame_color' id='sigh_frame_color_stan' >스텐몰딩(뚜껑만)</label></td>";
		append_html += "</tr>";	
		append_html += "<tr class='frame_custom_row add_row'>";
			append_html += "<th>색상</th>";
			append_html += "<td><input type='text' id='frame_custom_text' placeholder='색상을 입력해주세요.'></td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>까치발</th>";
			append_html += "<td><label><input type='radio' name='sigh_angle' id='sigh_angle_no' checked='checked'>없음</label><label><input type='radio' name='sigh_angle' id='sigh_angle_yes'>있음</label></td>";
		append_html += "</tr>";	
		append_html += "<tr class='sigh_angle_option add_row'>";
			append_html += "<th>크기</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_200' checked='checked'>200mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_250'>250mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_300'>300mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_400'>400mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_500'>500mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_600'>600mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_700'>700mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_800'>800mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_900'>900mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1000'>1000mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1100'>1100mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1200'>1200mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1300'>1300mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1400'>1400mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1500'>1500mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1600'>1600mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1700'>1700mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1800'>1800mm</label>";
                append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1900'>1900mm</label>";
                append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_2000'>2000mm</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr class='sigh_angle_option add_row'>";
			append_html += "<th>수량</th>";
			append_html += "<td><input type='number' id='sigh_angle_count' placeholder='수량을 입력해주세요.'>개</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>뒷판작업</th>";
			append_html += "<td><label><input type='radio' name='sigh_backdrop' id='sigh_backdrop_no' checked='checked'>없음</label><label><input type='radio' name='sigh_backdrop' id='sigh_backdrop_yes'>있음</label></td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>등박스</th>";
			append_html += "<td><label><input type='radio' name='sigh_deungbak' id='sigh_deungbak_no' checked='checked'>없음</label><label><input type='radio' name='sigh_deungbak' id='sigh_deungbak_yes'>있음</label></td>";
		append_html += "</tr>";
		append_html += "<tr class='sigh_deungbak_option add_row'>";
			append_html += "<th>등박스 종류</th>";
			append_html += "<td><label><input type='radio' name='sigh_deungbak_type' id='sigh_deungbak_galva' checked='checked'>갈바등박스</label><label><input type='radio' name='sigh_deungbak_type' id='sigh_deungbak_kyung'>경관바</label></td>";
		append_html += "</tr>";
		append_html += "<tr class='sigh_kyungbak_option add_row'>";
			append_html += "<th>경관바 평수</th>";
			append_html += "<td><label><input type='radio' name='sigh_kyungbak_size' id='sigh_kyungbak_50' checked='checked'>평50</label><label><input type='radio' name='sigh_kyungbak_size' id='sigh_kyungbak_70'>평70-100</label></td>";
		append_html += "</tr>";
		append_html += "<tr class='sigh_pos_option add_row'>";
			append_html += "<th>위치</th>";
			append_html += "<td><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_top' checked='checked'>상단</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_bottom'>하단</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_left'>좌측</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_right'>우측</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_center'>중앙</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_all'>사방테두리</label></td>";
		append_html += "</tr>";
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";

		append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";
		$("#option_table tbody").html(append_html);
	}else if($("#sigh_option02").is(":checked")){ //조명
		append_html += "<tr>";
			append_html += "<th>방향선택</th>";
			append_html += "<td><label><input type='radio' name='sigh_option_direction' id='sigh_option_row' checked='checked'>가로형</label><label><input type='radio' name='sigh_option_direction' id='sigh_option_vertical'>세로형</label></td>";
		append_html += "</tr>";	
		append_html += "<tr class='sigh_row'>";
			append_html += "<th>가로 (1500기본)</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='sigh_row'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr class='sigh_vertical'>";
			append_html += "<th>세로 (1000 기본)</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='sigh_vertical'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>화면작업</th>";
			append_html += "<td><label><input type='radio' name='sigh_display' id='sigh_display_01' checked='checked'>후렉스출력</label><label><input type='radio' name='sigh_display' id='sigh_display_02'>후렉스시트</label><label><input type='radio' name='sigh_display' id='sigh_display_03' >텐션없음</label></td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>등조립</th>";
			append_html += "<td><label><input type='radio' name='sigh_light' id='sigh_light_non' checked='checked'>없음</label><label><input type='radio' name='sigh_light' id='sigh_light_led' >LED형광등조립</label></td>";
		append_html += "</tr>";	
		append_html += "<tr class='sigh_light_led add_row'>";
			append_html += "<th>등조립 수량</th>";
			append_html += "<td><input type='number' id='sigh_light_led_count' placeholder='수량을 입력해주세요.'> 개</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>프레임색상</th>";
			append_html += "<td><label><input type='radio' name='sigh_frame_color' id='sigh_frame_color_white' checked='checked'>백색</label><label><input type='radio' name='sigh_frame_color' id='sigh_frame_color_custom'>지정색도장</label><label><input type='radio' name='sigh_frame_color' id='sigh_frame_color_stan' >스텐몰딩(뚜껑만)</label></td>";
		append_html += "</tr>";	
		append_html += "<tr class='frame_custom_row add_row'>";
			append_html += "<th>색상</th>";
			append_html += "<td><input type='text' id='frame_custom_text' placeholder='색상을 입력해주세요.'></td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>까치발</th>";
			append_html += "<td><label><input type='radio' name='sigh_angle' id='sigh_angle_no' checked='checked'>없음</label><label><input type='radio' name='sigh_angle' id='sigh_angle_yes'>있음</label></td>";
		append_html += "</tr>";	
		append_html += "<tr class='sigh_angle_option add_row'>";
			append_html += "<th>크기</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_200' checked='checked'>200mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_250'>250mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_300'>300mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_400'>400mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_500'>500mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_600'>600mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_700'>700mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_800'>800mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_900'>900mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1000'>1000mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1100'>1100mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1200'>1200mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1300'>1300mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1400'>1400mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1500'>1500mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1600'>1600mm</label>";
        		append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1700'>1700mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1800'>1800mm</label>";
                append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1900'>1900mm</label>";
                append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_2000'>2000mm</label>";
        		
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr class='sigh_angle_option add_row'>";
			append_html += "<th>수량</th>";
			append_html += "<td><input type='number' id='sigh_angle_count' placeholder='수량을 입력해주세요.'>개</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>등조립 수량</th>";
			append_html += "<td><span>가로길이가 1200㎜ 미만일 경우 등조립은 별도로 문의하셔야 합니다.</span></td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>뒷판작업</th>";
			append_html += "<td><label><input type='radio' name='sigh_backdrop' id='sigh_backdrop_no' checked='checked'>없음</label><label><input type='radio' name='sigh_backdrop' id='sigh_backdrop_yes'>있음</label></td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>등박스</th>";
			append_html += "<td><label><input type='radio' name='sigh_deungbak' id='sigh_deungbak_no' checked='checked'>없음</label><label><input type='radio' name='sigh_deungbak' id='sigh_deungbak_yes'>있음</label></td>";
		append_html += "</tr>";
		append_html += "<tr class='sigh_deungbak_option add_row'>";
			append_html += "<th>등박스 종류</th>";
			append_html += "<td><label><input type='radio' name='sigh_deungbak_type' id='sigh_deungbak_galva' checked='checked'>갈바등박스</label><label><input type='radio' name='sigh_deungbak_type' id='sigh_deungbak_kyung'>경관바</label></td>";
		append_html += "</tr>";
		append_html += "<tr class='sigh_kyungbak_option add_row'>";
			append_html += "<th>경관바 평수</th>";
			append_html += "<td><label><input type='radio' name='sigh_kyungbak_size' id='sigh_kyungbak_50' checked='checked'>평50</label><label><input type='radio' name='sigh_kyungbak_size' id='sigh_kyungbak_70'>평70-100</label></td>";
		append_html += "</tr>";
		append_html += "<tr class='sigh_pos_option add_row'>";
			append_html += "<th>위치</th>";
			append_html += "<td><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_top' checked='checked'>상단</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_bottom'>하단</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_left'>좌측</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_right'>우측</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_center'>중앙</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_all'>사방테두리</label></td>";
		append_html += "</tr>";
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";
		$("#option_table tbody").html(append_html);
	}else{ //돌출
		append_html += "<tr>";
			append_html += "<th>가로 (800기본)</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_200' checked='checked'>200mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_250'>250mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_300'>300mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_400'>400mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_500'>500mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_600'>600mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_700'>700mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_800'>800mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_900'>900mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1000'>1000mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1100'>1100mm</label>";
				append_html += "<label><input type='radio' name='sigh_angle_width' id='sigh_angle_width_1200'>1200mm</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>세로 (1500기본)</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='sigh_vertical'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>화면작업</th>";
			append_html += "<td><label><input type='radio' name='sigh_display' id='sigh_display_01' checked='checked'>후렉스출력</label><label><input type='radio' name='sigh_display' id='sigh_display_02'>후렉스시트</label><label><input type='radio' name='sigh_display' id='sigh_display_03' >텐션없음</label></td>";
		append_html += "</tr>";	
        append_html += "<tr class='sigh_display_01_option add_row' style='display:table-row;'>";
			append_html += "<th>후렉스 출력 타입</th>";
			append_html += "<td>";
        		append_html += "<label><input type='radio' name='sigh_display_type' id='sigh_display_type01' checked='checked'>UV 양면</label>";
        		append_html += "<label><input type='radio' name='sigh_display_type' id='sigh_display_type02'>UV 단면</label>";
       			append_html += "<label><input type='radio' name='sigh_display_type' id='sigh_display_type03' >강솔벤</label></td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>등조립</th>";
			append_html += "<td><label><input type='radio' name='sigh_light' id='sigh_light_non' checked='checked'>없음</label><label><input type='radio' name='sigh_light' id='sigh_light_led' >LED형광등조립</label></td>";
		append_html += "</tr>";	
        append_html += "<tr class='sigh_light_led add_row'>";
			append_html += "<th>등조립 수량</th>";
			append_html += "<td><input type='number' id='sigh_light_led_count' placeholder='수량을 입력해주세요.'> 개</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>프레임색상</th>";
			append_html += "<td><label><input type='radio' name='sigh_frame_color' id='sigh_frame_color_white' checked='checked'>백색</label><label><input type='radio' name='sigh_frame_color' id='sigh_frame_color_custom'>지정색도장</label><label><input type='radio' name='sigh_frame_color' id='sigh_frame_color_stan' >스텐몰딩(뚜껑만)</label></td>";
		append_html += "</tr>";	
		append_html += "<tr class='frame_custom_row add_row'>";
			append_html += "<th>색상</th>";
			append_html += "<td><input type='text' id='frame_custom_text' placeholder='색상을 입력해주세요.'></td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>시공발통</th>";
			append_html += "<td><label><input type='radio' name='sigh_baltong' id='sigh_baltong_normal' checked='checked'>기본 발통</label><label><input type='radio' name='sigh_baltong' id='sigh_baltong_ubolt'>U볼트부착(구멍없음)</label><label><input type='radio' name='sigh_baltong' id='sigh_baltong_none'>발통없음</label><label><input type='radio' name='sigh_baltong' id='sigh_baltong_stan'>갈바 발통</label></td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>등조립 수량</th>";
			append_html += "<td><span>가로길이가 1200㎜ 미만일 경우 등조립은 별도로 문의하셔야 합니다.</span></td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>뒷판작업</th>";
			append_html += "<td><label><input type='radio' name='sigh_backdrop' id='sigh_backdrop_no' checked='checked'>없음</label><label><input type='radio' name='sigh_backdrop' id='sigh_backdrop_yes'>있음</label></td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>등박스</th>";
			append_html += "<td><label><input type='radio' name='sigh_deungbak' id='sigh_deungbak_no' checked='checked'>없음</label><label><input type='radio' name='sigh_deungbak' id='sigh_deungbak_yes'>있음</label></td>";
		append_html += "</tr>";
		append_html += "<tr class='sigh_deungbak_option add_row'>";
			append_html += "<th>등박스 종류</th>";
			append_html += "<td><label><input type='radio' name='sigh_deungbak_type' id='sigh_deungbak_galva' checked='checked'>갈바등박스</label><label><input type='radio' name='sigh_deungbak_type' id='sigh_deungbak_kyung'>경관바</label></td>";
		append_html += "</tr>";
		append_html += "<tr class='sigh_kyungbak_option add_row'>";
			append_html += "<th>경관바 평수</th>";
			append_html += "<td><label><input type='radio' name='sigh_kyungbak_size' id='sigh_kyungbak_50' checked='checked'>평50</label><label><input type='radio' name='sigh_kyungbak_size' id='sigh_kyungbak_70'>평70-100</label></td>";
		append_html += "</tr>";
		append_html += "<tr class='sigh_pos_option add_row'>";
			append_html += "<th>위치</th>";
			append_html += "<td><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_top' checked='checked'>상단</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_bottom'>하단</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_left'>좌측</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_right'>우측</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_center'>중앙</label><label><input type='radio' name='sigh_deungbak_pos' id='sigh_deungbak_all'>사방테두리</label></td>";
		append_html += "</tr>";
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";
		$("#option_table tbody").html(append_html);
	}
	sign_frame_custom();
	sigh_angle();
	sign_more_order();
	sigh_light_led();
    hoorex_type();
	sigh_deungbak_handler();
	$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_option_direction']").change(function(){
		if($(this).attr("id") == "sigh_option_row"){
			$(".sigh_row th").text("가로 (1500기본)");
			$(".sigh_vertical th").text("세로 (1000 기본)");
		}else{
			$(".sigh_row th").text("가로 (1000 기본)");
			$(".sigh_vertical th").text("세로 (1500기본)");
		}

	});
}

function sign_frame_custom(){
	$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_frame_color']").click(function(){
		if($(this).attr("id") == "sigh_frame_color_custom"){
			$(".woosung_wrap .contents_wrap #option_table .frame_custom_row").css({"display":"table-row"});
		}else{
			$(".woosung_wrap .contents_wrap #option_table .frame_custom_row").hide();
		}
		
	});

}
function sigh_light_led(){
	if($("#sigh_option02").is(":checked")){
		$("#sigh_row,#sigh_vertical").change(function(){
			var target_w = nv("#sigh_row");
			var target_h = nv("#sigh_vertical");
			$("#sigh_light_led_count").val(Math.round( target_w * 0.005 ) * Math.round( target_h * 0.001 ));
		});
	}
    if($("#sigh_option03").is(":checked")){
		$("input[name='sigh_angle_width'],#sigh_vertical").change(function(){
			var target_w = Number($("input[name='sigh_angle_width']:checked").parent().text().split("mm")[0]);
			var target_h = nv("#sigh_vertical");
			$("#sigh_light_led_count").val(Math.round( target_w * 0.005 ) * Math.round( target_h * 0.001 ));
		});
     
	}
	$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_light']").click(function(){
		if($("#sigh_option02,#sigh_option03").is(":checked")){
			if($(this).attr("id") == "sigh_light_led"){
				$(".woosung_wrap .contents_wrap #option_table .sigh_light_led").css({"display":"table-row"});
			}else{
				$(".woosung_wrap .contents_wrap #option_table .sigh_light_led").hide();
			}
		}
		
	});

}
function _autoSelectSighAngle(){
	if(!$("#sigh_option_row").is(":checked")) return;
	if(!$("#sigh_angle_yes").is(":checked")) return;
	var val = parseInt($("#sigh_vertical").val().replace(/,/g,"")) || 0;
	if(val <= 0) return;
	var sizes = [200,250,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000];
	var sel = sizes[sizes.length - 1];
	for(var i = 0; i < sizes.length; i++){
		if(sizes[i] >= val){ sel = sizes[i]; break; }
	}
	$("#sigh_angle_width_" + sel).prop("checked", true);
}
function sigh_angle(){
	$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_angle']").click(function(){
		if($(this).attr("id") == "sigh_angle_yes"){
			$(".woosung_wrap .contents_wrap #option_table .sigh_angle_option").css({"display":"table-row"});
			_autoSelectSighAngle();
		}else{
			$(".woosung_wrap .contents_wrap #option_table .sigh_angle_option").hide();
		}
	});
	$(document).on("input change", "#sigh_vertical", function(){
		_autoSelectSighAngle();
	});
}
function sigh_deungbak_handler(){
	$("input[name='sigh_deungbak']").click(function(){
		if($(this).attr("id") === "sigh_deungbak_yes"){
			$(".sigh_deungbak_option").css({"display":"table-row"});
			$(".sigh_pos_option").css({"display":"table-row"});
		}else{
			$(".sigh_deungbak_option, .sigh_kyungbak_option, .sigh_pos_option").hide();
		}
	});
	$("input[name='sigh_deungbak_type']").click(function(){
		if($(this).attr("id") === "sigh_deungbak_kyung"){
			$(".sigh_kyungbak_option").css({"display":"table-row"});
			$(".sigh_pos_option").css({"display":"table-row"});
		}else{
			$(".sigh_kyungbak_option").hide();
			$(".sigh_pos_option").css({"display":"table-row"});
		}
	});
}
function sign_more_order(){
	$(".woosung_wrap .contents_wrap #option_table td label input[name='sign_more_order']").click(function(){
		if($(this).attr("id") == "sign_more_order_yes"){
			$(".woosung_wrap .contents_wrap #option_table .sign_more_order_content").css({"display":"table-row"});
		}else{
			$(".woosung_wrap .contents_wrap #option_table .sign_more_order_content").hide();
		}
		
	});

}
function hoorex_type(){
    $(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_display']").click(function(){
		if($(this).attr("id") == "sigh_display_01"){
			$(".woosung_wrap .contents_wrap #option_table .sigh_display_01_option").css({"display":"table-row"});
		}else{
			$(".woosung_wrap .contents_wrap #option_table .sigh_display_01_option").hide();
		}
		
	});
}

//사인탑
//채널문자
	// 단가표(DEFAULT_PRICES) 행 기준으로 크기 라디오 버튼 생성
	function _chSizeBtns(pricePrefix) {
		var html = '', sizes = [];
		Object.keys(DEFAULT_PRICES).forEach(function(k) {
			if (k.indexOf(pricePrefix) === 0) {
				var sz = parseInt(k.slice(pricePrefix.length));
				if (!isNaN(sz)) sizes.push(sz);
			}
		});
		sizes.sort(function(a, b) { return a - b; });
		sizes.forEach(function(sz, i) {
			html += "<label><input type='radio' name='channel_size' id='channel_size_" + sz + "'" + (i === 0 ? " checked='checked'" : "") + ">" + sz + "cm</label>";
		});
		return html;
	}

	function set_channel_top(){ //사인탑 초기설정
		$("#option_table thead,#option_table tbody").html("");
		var setting_html = "";
		setting_html +="<tr id='channel_option_area'>";
			setting_html +="<th>품목</th>";
			setting_html +="<td>";
				setting_html +="<label><input type='radio' name='channel_option' id='channel_option01'>알루미늄 채널</label>";
				setting_html +="<label><input type='radio' name='channel_option' id='channel_option02'>갈바채널</label>";
				setting_html +="<label><input type='radio' name='channel_option' id='channel_option04'>에폭시채널</label>";
				setting_html +="<label><input type='radio' name='channel_option' id='channel_option05'>일체형채널</label>";
				setting_html +="<label><input type='radio' name='channel_option' id='channel_option06'>스텐채널</label>";
				setting_html +="<label><input type='radio' name='channel_option' id='channel_option07'>티타늄골드채널</label>";

			setting_html +="</td>";
		setting_html +="</tr";
		$("#option_table thead").html(setting_html);
		$("#channel_option_area input").change(function(){
			set_channel_top_option_select();
		});
	}
	function set_channel_top_option_select(){
		var append_html = "";
		if($("#channel_option02").is(":checked")){
			append_html += "<tr>";
				append_html += "<th>채널 종류</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_galva_type' id='channel_galva_glja' checked='checked'>글자채널(입체글자형)</label>";
					append_html += "<label><input type='radio' name='channel_galva_type' id='channel_galva_laser'>레이저타공채널(박스/바)</label>";
					append_html += "<label><input type='radio' name='channel_galva_type' id='channel_galva_gosa'>오사이채널(캡/프레임형)</label>";
				append_html += "</td>";
			append_html += "</tr>";
		}
		if($("#channel_option06").is(":checked")){
			append_html += "<tr>";
				append_html += "<th>채널 종류</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_sten_type' id='channel_sten_glja' checked='checked'>글자채널(입체글자형)</label>";
					append_html += "<label><input type='radio' name='channel_sten_type' id='channel_sten_laser'>레이저타공채널(박스/바)</label>";
					append_html += "<label><input type='radio' name='channel_sten_type' id='channel_sten_gosa'>오사이채널(캡/프레임형)</label>";
				append_html += "</td>";
			append_html += "</tr>";
		}
		if($("input[name='channel_option']:checked").length){ //채널문자 품목 선택됨
            append_html += "<tr>";
           	 	append_html += "<th>트러스바</th>";
            	append_html += "<td><label><input type='radio' name='channel_trusbar' id='channel_trusbar_none' checked='checked'>없음</label><label><input type='radio' name='channel_trusbar' id='channel_trusbar00'>150폭</label><label><input type='radio' name='channel_trusbar' id='channel_trusbar01'>200폭</label><label><input type='radio' name='channel_trusbar' id='channel_trusbar02'>250폭</label><label><input type='radio' name='channel_trusbar' id='channel_trusbar03'>300폭</label><label><input type='radio' name='channel_trusbar' id='channel_trusbar04'>400폭</label><label><input type='radio' name='channel_trusbar' id='channel_trusbar05'>주문제작</label></td>";
            append_html += "</tr>";
            append_html += "</tr>";
            append_html += "<tr class='channel_trusbar add_row'>";
            	append_html += "<th>트러스바 길이</th>";
            	append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='channel_trusbar_width' placeholder='길이을 입력해주세요.'> mm</td>";
            append_html += "</tr>";
            append_html += "<tr class='channel_trusbar_custom add_row'>";
            	append_html += "<th>주문제작 사이즈</th>";
            	append_html += "<td>";
            	append_html += "가로 <input type='text' inputmode='numeric' class='comma-fmt' id='channel_trusbar_custom_w' placeholder='가로' style='width:80px'> mm &nbsp;&nbsp;";
            	append_html += "세로 <input type='text' inputmode='numeric' class='comma-fmt' id='channel_trusbar_custom_h' placeholder='세로' style='width:80px'> mm &nbsp;&nbsp;";
            	append_html += "두께 <input type='text' inputmode='numeric' class='comma-fmt' id='channel_trusbar_custom_t' placeholder='두께' style='width:80px'> mm";
            	append_html += "</td>";
            append_html += "</tr>";
            append_html += "<tr class='channel_trusbar_custom add_row'>";
            	append_html += "<th>트러스 주문제작 추가금</th>";
            	append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='channel_trusbar_custom_price' placeholder='추가금을 입력해주세요.'> 원</td>";
            append_html += "</tr>";
            append_html += "<tr class='ch_ggachi_main_row add_row'>";
				append_html += "<th>까치발</th>";
                append_html += "<td><label><input type='radio' name='channel_more_order' id='channel_more_order_no' checked='checked'>없음</label><label><input type='radio' name='channel_more_order' id='channel_more_order_option01'>있음</label></td>";
            append_html += "</tr>";
            append_html += "<tr class='channel_more_order_option01 add_row ch_ggachi_main_row'>";
                append_html += "<th>까치발 갯수</th>";
                append_html += "<td>";
                    append_html += "<input type='radio' name='ch_ggachi_size' id='ch_ggachi_size_200' checked='checked' style='display:none'>";
                    append_html += "<input type='number' id='channel_more_order_count' placeholder='까치발 갯수를 입력하세요'/>";
                append_html += "</td>";
            append_html += "</tr>";
            append_html += "<tr>";
            	append_html += "<th>완조립</th>";
            	append_html += "<td><label><input type='radio' name='channel_complete' id='channel_complete_none' checked='checked'>없음</label><label><input type='radio' name='channel_complete' id='channel_complete_normal'>일반 완조립</label><label><input type='radio' name='channel_complete' id='channel_complete_premium'>고급 완조립</label></td>";
            append_html += "</tr>";	
            append_html += "<tr>";
            	append_html += "<th>SMPS</th>";
            	append_html += "<td>";
            		append_html += "<label><input type='radio' name='ch_smps_spec' id='ch_smps_none' checked='checked'>없음</label>";
            		append_html += "<label><input type='radio' name='ch_smps_spec' id='ch_smps_60w'>60W</label>";
            		append_html += "<label><input type='radio' name='ch_smps_spec' id='ch_smps_100w'>100W</label>";
            		append_html += "<label><input type='radio' name='ch_smps_spec' id='ch_smps_150w'>150W</label>";
            		append_html += "<label><input type='radio' name='ch_smps_spec' id='ch_smps_200w'>200W</label>";
            		append_html += "<label><input type='radio' name='ch_smps_spec' id='ch_smps_300w'>300W</label>";
            		append_html += "<label><input type='radio' name='ch_smps_spec' id='ch_smps_400w'>400W</label>";
            		append_html += "<label><input type='radio' name='ch_smps_spec' id='ch_smps_500w'>500W</label>";
            	append_html += "</td>";
            append_html += "</tr>";
            append_html += "<tr class='ch_smps_qty_row add_row'>";
            	append_html += "<th>SMPS 수량</th>";
            	append_html += "<td><input type='number' id='ch_smps_qty' placeholder='수량' min='0' value='0'> 개</td>";
            append_html += "</tr>";
			}
			if($("#channel_option01").is(":checked")){ // 알루미늄 채널
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_eng' checked='checked'>영문(숫자)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_kor'>한글(고딕)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_got'>한글(흘림)</label>";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>크기</th>";
				append_html += "<td>" + _chSizeBtns('ch_taka_eng_') + "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_taka_width add_row'>";
				append_html += "<th>가로</th>";
				append_html += "<td><input type='number' id='channel_taka_width' placeholder='가로 사이즈를 입력하세요.'> cm</td>";
			append_html += "</tr>";	
			append_html += "<tr class='channel_taka_width add_row'>";
				append_html += "<th>세로</th>";
				append_html += "<td><input type='number' id='channel_taka_vertical' placeholder='세로 사이즈를 입력하세요.'> cm</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>뚜껑 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_trim_color' id='channel_trim_color_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_trim_color' id='channel_trim_color_black'>흑색</label>";
					append_html += "<label><input type='radio' name='channel_trim_color' id='channel_trim_color_custom'>컬러</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
			append_html += "<th>입체 색상(몸통)</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_none'>없음</label><label><input type='radio' name='channel_solid_color' id='channel_solid_color_white' checked='checked'>백색</label>";
				append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_black'>흑색</label>";
				append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_custom'>컬러</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>LED 색상</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_none' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_white'>백색</label>";
				append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_wram'>웜(전구색)</label>";
				append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_rgb'>RGB</label>";
				append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_panorama'>파노라마</label>";
				append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_red'>적색</label>";
				append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_blue'>청색</label>";
				append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_green'>녹색</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr class='channel_led_count'>";
			append_html += "<th>LED 예상 개수</th>";
			append_html += "<td><span>0개</span></td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>수량</th>";
			append_html += "<td><input type='number' id='channel_content' placeholder='수량을 입력해주세요.'></td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>화면 작업</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_no' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_yes'>있음</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr class='channel_led_display_work add_row'>";
			append_html += "<th>작업 내용</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type01' checked='checked'>조명용 부착</label>";
				append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type02'>컷팅후 부착</label>";
				append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type03'>컷팅후 부착(2도)</label>";
				append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type04'>실사 부착</label>";
				append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type05'>타공시트 출력</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";		
		}else if($("#channel_option02").is(":checked")){ // 갈바채널
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_eng' checked='checked'>영문(숫자)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_kor'>한글(고딕)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_got'>한글(흘림)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>크기</th>";
				append_html += "<td>" + _chSizeBtns('ch_galva_eng_') + "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_galva_notgosa_row'>";
				append_html += "<th>뚜껑 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_trim_color' id='channel_trim_color_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_trim_color' id='channel_trim_color_black'>흑색</label>";
					append_html += "<label><input type='radio' name='channel_trim_color' id='channel_trim_color_custom'>지정색도장</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>입체 색상(몸통)</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_none'>없음</label><label><input type='radio' name='channel_solid_color' id='channel_solid_color_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_black'>흑색</label>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_custom'>지정색도장</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>전광</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_jeon' id='channel_led_jeon_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon' id='channel_led_jeon_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_jeon_color_row add_row'>";
				append_html += "<th>전광 LED 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_warm'>웜(전구색)</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_rgb'>RGB</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_panorama'>파노라마</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_red'>적색</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_blue'>청색</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_green'>녹색</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='ch_led_jeon_count_row add_row'>";
				append_html += "<th>전광 LED 개수</th>";
				append_html += "<td><input type='number' id='ch_led_jeon_count' min='0' placeholder='개수를 입력하세요'> 개</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>후광</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_hu' id='channel_led_hu_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_hu' id='channel_led_hu_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_hu_color_row add_row'>";
				append_html += "<th>후광 LED 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_warm'>웜(전구색)</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_rgb'>RGB</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_panorama'>파노라마</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_red'>적색</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_blue'>청색</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_green'>녹색</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='ch_led_hu_count_row add_row'>";
				append_html += "<th>후광 LED 개수</th>";
				append_html += "<td><input type='number' id='ch_led_hu_count' min='0' placeholder='개수를 입력하세요'> 개</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>수량</th>";
				append_html += "<td><input type='number' id='channel_content' placeholder='수량을 입력해주세요.'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>화면 작업</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_display_work add_row'>";
				append_html += "<th>작업 내용</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type01' checked='checked'>조명용 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type02'>컷팅후 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type03'>컷팅후 부착(2도)</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type04'>실사 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type05'>타공시트 출력</label>";
					append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";
		}else if($("#channel_option04").is(":checked")){ // 에폭시채널
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_eng' checked='checked'>영문(숫자)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_kor'>한글(고딕)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_got'>한글(흘림)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>크기</th>";
				append_html += "<td>" + _chSizeBtns('ch_epox_eng_') + "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>입체 색상(몸통)</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_none'>없음</label><label><input type='radio' name='channel_solid_color' id='channel_solid_color_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_custom'>지정색도장</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>LED 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_none' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_white'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_wram'>웜(전구색)</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_rgb'>RGB</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_panorama'>파노라마</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_red'>적색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_blue'>청색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_green'>녹색</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_count'>";
				append_html += "<th>LED 예상 개수</th>";
				append_html += "<td><span>0개</span></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>수량</th>";
				append_html += "<td><input type='number' id='channel_content' placeholder='수량을 입력해주세요.'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>화면 작업</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_display_work add_row'>";
				append_html += "<th>작업 내용</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type01' checked='checked'>조명용 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type02'>컷팅후 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type03'>컷팅후 부착(2도)</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type04'>실사 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type05'>타공시트 출력</label>";
					append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";
		}else if($("#channel_option05").is(":checked")){ // 2PC일체형
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_eng' checked='checked'>영문(숫자)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_kor'>한글(고딕)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_got'>한글(흘림)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>크기</th>";
				append_html += "<td>" + _chSizeBtns('ch_ilche_eng_') + "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>입체 색상(몸통)</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_none'>없음</label><label><input type='radio' name='channel_solid_color' id='channel_solid_color_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_custom'>지정색도장</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>LED 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_none' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_white'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_wram'>웜(전구색)</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_rgb'>RGB</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_panorama'>파노라마</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_red'>적색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_blue'>청색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_green'>녹색</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_count'>";
				append_html += "<th>LED 예상 개수</th>";
				append_html += "<td><span>0개</span></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>수량</th>";
				append_html += "<td><input type='number' id='channel_content' placeholder='수량을 입력해주세요.'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>화면 작업</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_display_work add_row'>";
				append_html += "<th>작업 내용</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type01' checked='checked'>조명용 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type02'>컷팅후 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type03'>컷팅후 부착(2도)</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type04'>실사 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type05'>타공시트 출력</label>";
					append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";	
		}else if($("#channel_option06").is(":checked")){ // 스텐채널
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_eng' checked='checked'>영문(숫자)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_kor'>한글(고딕)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_got'>한글(흘림)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>크기</th>";
				append_html += "<td>" + _chSizeBtns('ch_sten_eng_') + "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>입체 색상(몸통)</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_none'>없음</label><label><input type='radio' name='channel_solid_color' id='channel_solid_color_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_custom'>지정색도장</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>전광</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_jeon' id='channel_led_jeon_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon' id='channel_led_jeon_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_jeon_color_row add_row'>";
				append_html += "<th>전광 LED 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_warm'>웜(전구색)</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_rgb'>RGB</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_panorama'>파노라마</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_red'>적색</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_blue'>청색</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_green'>녹색</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='ch_led_jeon_count_row add_row'>";
				append_html += "<th>전광 LED 개수</th>";
				append_html += "<td><input type='number' id='ch_led_jeon_count' min='0' placeholder='개수를 입력하세요'> 개</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>후광</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_hu' id='channel_led_hu_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_hu' id='channel_led_hu_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_hu_color_row add_row'>";
				append_html += "<th>후광 LED 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_warm'>웜(전구색)</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_rgb'>RGB</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_panorama'>파노라마</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_red'>적색</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_blue'>청색</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_green'>녹색</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='ch_led_hu_count_row add_row'>";
				append_html += "<th>후광 LED 개수</th>";
				append_html += "<td><input type='number' id='ch_led_hu_count' min='0' placeholder='개수를 입력하세요'> 개</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>수량</th>";
				append_html += "<td><input type='number' id='channel_content' placeholder='수량을 입력해주세요.'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>화면 작업</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_display_work add_row'>";
				append_html += "<th>작업 내용</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type01' checked='checked'>조명용 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type02'>컷팅후 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type03'>컷팅후 부착(2도)</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type04'>실사 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type05'>타공시트 출력</label>";
					append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";
		}else if($("#channel_option07").is(":checked")){ // 티타늄골드채널
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_eng' checked='checked'>영문(숫자)</label>";	
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_kor'>한글(고딕)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_got'>한글(흘림)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>크기</th>";
				append_html += "<td>";
						append_html += _chSizeBtns('ch_titan_eng_');
					append_html += "</td>";
				append_html += "</tr>";
				append_html += "<th>입체 색상(몸통)</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_none'>없음</label><label><input type='radio' name='channel_solid_color' id='channel_solid_color_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_custom'>지정색도장</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>전광</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_jeon' id='channel_led_jeon_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon' id='channel_led_jeon_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_jeon_color_row add_row'>";
				append_html += "<th>전광 LED 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_warm'>웜(전구색)</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_rgb'>RGB</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_panorama'>파노라마</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_red'>적색</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_blue'>청색</label>";
					append_html += "<label><input type='radio' name='channel_led_jeon_color' id='channel_led_jeon_green'>녹색</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='ch_led_jeon_count_row add_row'>";
				append_html += "<th>전광 LED 개수</th>";
				append_html += "<td><input type='number' id='ch_led_jeon_count' min='0' placeholder='개수를 입력하세요'> 개</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>후광</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_hu' id='channel_led_hu_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_hu' id='channel_led_hu_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_hu_color_row add_row'>";
				append_html += "<th>후광 LED 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_warm'>웜(전구색)</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_rgb'>RGB</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_panorama'>파노라마</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_red'>적색</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_blue'>청색</label>";
					append_html += "<label><input type='radio' name='channel_led_hu_color' id='channel_led_hu_green'>녹색</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='ch_led_hu_count_row add_row'>";
				append_html += "<th>후광 LED 개수</th>";
				append_html += "<td><input type='number' id='ch_led_hu_count' min='0' placeholder='개수를 입력하세요'> 개</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>수량</th>";
				append_html += "<td><input type='number' id='channel_content' placeholder='수량을 입력해주세요.'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>화면 작업</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_display_work add_row'>";
				append_html += "<th>작업 내용</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type01' checked='checked'>조명용 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type02'>컷팅후 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type03'>컷팅후 부착(2도)</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type04'>실사 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type05'>타공시트 출력</label>";
					append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";	
		}else if($("#channel_option08").is(":checked")){ // 스탠채널
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_eng' checked='checked'>영문(숫자)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_kor'>한글(고딕)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_got'>한글(흘림)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>크기</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_30' checked='checked'>30cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_40'>40cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_50'>50cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_60'>60cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_70'>70cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_80'>80cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_90'>90cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_100'>100cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_110'>110cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_120'>120cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_130'>130cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_140'>140cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_150'>150cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_160'>160cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_170'>170cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_180'>180cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_190'>190cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_200'>200cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_210'>210cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_220'>220cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_230'>230cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_240'>240cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_250'>250cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_300'>300cm</label>";
					//append_html += "<label><input type='radio' name='channel_size' id='channel_size_custom'>직접입력</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>뚜껑 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_trim_color' id='channel_trim_color_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_trim_color' id='channel_trim_color_black'>흑색</label>";
					append_html += "<label><input type='radio' name='channel_trim_color' id='channel_trim_color_custom'>지정색도장</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>입체 색상(몸통)</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_none'>없음</label><label><input type='radio' name='channel_solid_color' id='channel_solid_color_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_black'>흑색</label>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_custom'>지정색도장</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>LED 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_none' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_white'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_wram'>웜(전구색)</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_rgb'>RGB</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_panorama'>파노라마</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_red'>적색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_blue'>청색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_green'>녹색</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_count'>";
				append_html += "<th>LED 예상 개수</th>";
				append_html += "<td><span>0개</span></td>";
			append_html += "</tr>";
	
			append_html += "<tr>";
				append_html += "<th>수량</th>";
				append_html += "<td><input type='number' id='channel_content' placeholder='수량을 입력해주세요.'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>화면 작업</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_display_work add_row'>";
				append_html += "<th>작업 내용</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type01' checked='checked'>조명용 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type02'>컷팅후 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type03'>컷팅후 부착(2도)</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type04'>실사 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type05'>타공시트 출력</label>";
					append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";		
			append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";	
		}else if($("#channel_option09").is(":checked")){ // 스텐오사이
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_eng' checked='checked'>영문(숫자)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_kor'>한글(고딕)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_got'>한글(흘림)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>크기</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_30' checked='checked'>30cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_40'>40cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_50'>50cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_60'>60cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_70'>70cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_80'>80cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_90'>90cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_100'>100cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_110'>110cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_120'>120cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_130'>130cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_140'>140cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_150'>150cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_160'>160cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_170'>170cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_180'>180cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_190'>190cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_200'>200cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_210'>210cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_220'>220cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_230'>230cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_240'>240cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_250'>250cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_300'>300cm</label>";
					//append_html += "<label><input type='radio' name='channel_size' id='channel_size_custom'>직접입력</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>입체 색상(몸통)</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_none'>없음</label><label><input type='radio' name='channel_solid_color' id='channel_solid_color_white' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_black'>흑색</label>";
					append_html += "<label><input type='radio' name='channel_solid_color' id='channel_solid_color_custom'>지정색도장</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>LED 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_none' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_white'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_wram'>웜(전구색)</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_rgb'>RGB</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_panorama'>파노라마</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_red'>적색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_blue'>청색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_green'>녹색</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_count'>";
				append_html += "<th>LED 예상 개수</th>";
				append_html += "<td><span>0개</span></td>";
			append_html += "</tr>";
	
			append_html += "<tr>";
				append_html += "<th>수량</th>";
				append_html += "<td><input type='number' id='channel_content' placeholder='수량을 입력해주세요.'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>화면 작업</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_no' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work' id='channel_led_display_work_yes'>있음</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_display_work add_row'>";
				append_html += "<th>작업 내용</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type01' checked='checked'>조명용 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type02'>컷팅후 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type03'>컷팅후 부착(2도)</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type04'>실사 부착</label>";
					append_html += "<label><input type='radio' name='channel_led_display_work_type' id='channel_led_display_work_type05'>타공시트 출력</label>";
					append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
			append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";	
		}else if($("#channel_option10").is(":checked")){ // 스텐밀러/헤어라인
			append_html += "<tr>";
				append_html += "<th>재질</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_material' id='channel_material03' checked='checked'>밀러</label>";
					append_html += "<label><input type='radio' name='channel_material' id='channel_material04'>헤어라인</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_eng' checked='checked'>영문(숫자)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_kor'>한글(고딕)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_got'>한글(흘림)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>크기</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_20' checked='checked'>20cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_30'>30cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_40'>40cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_50'>50cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_60'>60cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_70'>70cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_80'>80cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_90'>90cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_100'>100cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_110'>110cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_120'>120cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_130'>130cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_140'>140cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_150'>150cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_160'>160cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_170'>170cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_180'>180cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_190'>190cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_200'>200cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_210'>210cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_220'>220cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_230'>230cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_240'>240cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_250'>250cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_300'>300cm</label>";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>LED 색상(후광)</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_none' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_white'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_wram'>웜(전구색)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_count'>";
				append_html += "<th>LED 예상 개수</th>";
				append_html += "<td><span>0개</span></td>";
			append_html += "</tr>";
	
			append_html += "<tr>";
				append_html += "<th>수량</th>";
				append_html += "<td><input type='number' id='channel_content' placeholder='수량을 입력해주세요.'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
			append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";	
		}else{ // 골드스텐/블랙
			append_html += "<tr>";
				append_html += "<th>재질</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_material' id='channel_material05' checked='checked'>골드</label>";
					append_html += "<label><input type='radio' name='channel_material' id='channel_material06'>블랙</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_eng' checked='checked'>영문(숫자)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_kor'>한글(고딕)</label>";
					append_html += "<label><input type='radio' name='channel_text_form' id='channel_text_got'>한글(흘림)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>크기</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_20' checked='checked'>20cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_30'>30cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_40'>40cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_50'>50cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_60'>60cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_70'>70cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_80'>80cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_90'>90cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_100'>100cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_110'>110cm</label>";
					append_html += "<label><input type='radio' name='channel_size' id='channel_size_120'>120cm</label>";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>LED 색상(후광)</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_none' checked='checked'>없음</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_white'>백색</label>";
					append_html += "<label><input type='radio' name='channel_led_color' id='channel_led_color_wram'>웜(전구색)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr class='channel_led_count'>";
				append_html += "<th>LED 예상 개수</th>";
				append_html += "<td><span>0개</span></td>";
			append_html += "</tr>";
	
			append_html += "<tr>";
				append_html += "<th>수량</th>";
				append_html += "<td><input type='number' id='channel_content' placeholder='수량을 입력해주세요.'></td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
			append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";	
		}
		$("#option_table tbody").html(append_html);

		// 담기 UI + 섹션 헤더 삽입
		_chItems = [];

		// 문자형태 행 앞에 반복구간 헤더 삽입
		var $formRow = $("#option_table tbody tr").filter(function(){
			return $(this).find("th").first().text().trim() === "문자형태";
		}).first();
		var _chSectionHtml =
			"<tr class='ch-section-header-tr'>" +
			"<td colspan='2'>" +
			"<div class='ch-section-header'>" +
			"<span class='ch-section-icon'>&#8635;</span>" +
			"<span class='ch-section-title'>문자 항목 설정</span>" +
			"<span class='ch-section-sub'>아래 옵션을 선택하고 <strong>담기</strong> 버튼으로 항목을 추가하세요 (여러 번 반복 가능)</span>" +
			"</div>" +
			"</td></tr>";
		$(_chSectionHtml).insertBefore($formRow);

		// 문자형태 ~ 추가금액 사이의 rows에 ch-repeat-row 클래스 부여
		var _inRange = false;
		$("#option_table tbody tr").each(function(){
			var thTxt = $(this).find("th").first().text().trim();
			if(thTxt === "문자형태") _inRange = true;
			if(thTxt === "추가 금액") { _inRange = false; return; }
			if(_inRange) $(this).addClass("ch-repeat-row");
		});

		// 추가금액 행 바로 위에 담기 버튼 행 삽입
		var $extraRow = $("#option_table tbody tr").filter(function(){
			return $(this).find("th").first().text().trim() === "추가 금액";
		}).first();
		var _chAddHtml =
			"<tr class='ch-items-row ch-repeat-row' id='ch_items_header_row'>" +
			"<th>담긴 항목</th>" +
			"<td>" +
			"<div id='ch_items_area'></div>" +
			"<div class='ch-add-bar'>" +
			"<input type='text' id='ch_item_detail' placeholder='세부 내역 (선택사항)' style='flex:1;min-width:120px;max-width:280px;padding:4px 8px;border:1px solid #ccc;border-radius:4px;font-size:0.9em;'>" +
			"<button type='button' id='btn_add_ch_item' class='btn-ch-add-item'>+ 담기</button>" +
			"<span class='ch-item-preview-wrap'> 예상 금액: <em id='ch_item_preview' class='ch-item-preview-val'>-</em></span>" +
			"</div>" +
			"</td></tr>";
		$(_chAddHtml).insertBefore($extraRow);
		$("#btn_add_ch_item").click(addChannelItem);

		//channel_size_custom();
		channel_trim_color_custom();
		channel_solid_color_custom();
		$(".woosung_wrap .contents_wrap #option_table td label input[name='channel_led_color'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_size']").click(function(){
			channel_led_count_set();
		});
		channel_more_order_custom();
		channel_display_work_custom();
        channel_trusbar();
        channel_galva_type_handler();
        channel_sten_type_handler();
        $(".woosung_wrap .contents_wrap #option_table td label input[name='channel_led_jeon'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_led_hu']").click(function(){
            channel_led_count_set();
        });
        channel_led_count_set();
	}
	function channel_galva_type_handler(){
        $("input[name='channel_galva_type']").click(function(){
            var id = $(this).attr("id");
            if(id === "channel_galva_gosa"){
                $(".channel_galva_notgosa_row").hide();
            } else {
                $(".channel_galva_notgosa_row").css("display","table-row");
            }
            chnnel_taka_cal();
        });
    }
    function channel_sten_type_handler(){
        $("input[name='channel_sten_type']").click(function(){
            chnnel_taka_cal();
        });
    }
	function channel_trusbar(){
        $(".woosung_wrap .contents_wrap #option_table .ch_ggachi_main_row").hide();
        $(".woosung_wrap .contents_wrap #option_table td label input[name='channel_trusbar']").click(function(){
			if($(this).attr("id") == "channel_trusbar05"){
				$(".woosung_wrap .contents_wrap #option_table .channel_trusbar").hide();
				$(".woosung_wrap .contents_wrap #option_table .channel_trusbar_custom").css({"display":"table-row"});
				$(".woosung_wrap .contents_wrap #option_table .ch_ggachi_main_row").css({"display":"table-row"});
			}else if($(this).attr("id") != "channel_trusbar_none"){
				$(".woosung_wrap .contents_wrap #option_table .channel_trusbar").css({"display":"table-row"});
				$(".woosung_wrap .contents_wrap #option_table .channel_trusbar_custom").hide();
				$(".woosung_wrap .contents_wrap #option_table .ch_ggachi_main_row").css({"display":"table-row"});
			}else{
				$(".woosung_wrap .contents_wrap #option_table .channel_trusbar").hide();
				$(".woosung_wrap .contents_wrap #option_table .channel_trusbar_custom").hide();
				$(".woosung_wrap .contents_wrap #option_table .ch_ggachi_main_row").hide();
				$("#channel_more_order_no").prop("checked", true);
			}
		});
    }
	function channel_size_custom(){
		$(".woosung_wrap .contents_wrap #option_table td label input[name='channel_size']").click(function(){
			if($(this).attr("id") == "channel_size_custom"){
				$(".woosung_wrap .contents_wrap #option_table .channel_taka_width").css({"display":"table-row"});
			}else{
				$(".woosung_wrap .contents_wrap #option_table .channel_taka_width").hide();
			}
			
		});

	}
	function channel_trim_color_custom(){
		$(".woosung_wrap .contents_wrap #option_table td label input[name='channel_trim_color']").click(function(){
			if($(this).attr("id") == "channel_trim_color_custom"){
				$(".woosung_wrap .contents_wrap #option_table .channel_trim_color").css({"display":"table-row"});
			}else{
				$(".woosung_wrap .contents_wrap #option_table .channel_trim_color").hide();
			}
			
		});

	}
	function channel_solid_color_custom(){
		$(".woosung_wrap .contents_wrap #option_table td label input[name='channel_solid_color']").click(function(){
			if($(this).attr("id") == "channel_solid_color_custom"){
				$(".woosung_wrap .contents_wrap #option_table .channel_solid_color").css({"display":"table-row"});
			}else{
				$(".woosung_wrap .contents_wrap #option_table .channel_solid_color").hide();
			}
			
		});

	}
	function _chGetLedCount(){
		if(!$("#channel_option05").is(":checked")){
			if($("#channel_size_20").is(":checked"))       return 10;
			else if($("#channel_size_30").is(":checked"))  return 15;
			else if($("#channel_size_40").is(":checked"))  return 20;
			else if($("#channel_size_50").is(":checked"))  return 30;
			else if($("#channel_size_60").is(":checked"))  return 35;
			else if($("#channel_size_70").is(":checked"))  return 45;
			else if($("#channel_size_80").is(":checked"))  return 60;
			else if($("#channel_size_90").is(":checked"))  return 70;
			else if($("#channel_size_100").is(":checked")) return 80;
			else if($("#channel_size_110").is(":checked")) return 100;
			else if($("#channel_size_120").is(":checked")) return 115;
			else if($("#channel_size_130").is(":checked")) return 140;
			else if($("#channel_size_140").is(":checked")) return 160;
			else if($("#channel_size_150").is(":checked")) return 180;
			else if($("#channel_size_160").is(":checked")) return 200;
			else if($("#channel_size_170").is(":checked")) return 220;
			else if($("#channel_size_180").is(":checked")) return 240;
			else if($("#channel_size_190").is(":checked")) return 260;
			else if($("#channel_size_200").is(":checked")) return 280;
			else if($("#channel_size_210").is(":checked")) return 300;
			else if($("#channel_size_220").is(":checked")) return 320;
			else if($("#channel_size_230").is(":checked")) return 340;
			else if($("#channel_size_240").is(":checked")) return 360;
			else if($("#channel_size_250").is(":checked")) return 380;
			else if($("#channel_size_300").is(":checked")) return 540;
			else return 0;
		}else{
			if($("#channel_size_20").is(":checked"))       return 20;
			else if($("#channel_size_25").is(":checked"))  return 25;
			else if($("#channel_size_30").is(":checked"))  return 30;
			else if($("#channel_size_35").is(":checked"))  return 35;
			else if($("#channel_size_40").is(":checked"))  return 40;
			else if($("#channel_size_45").is(":checked"))  return 45;
			else if($("#channel_size_50").is(":checked"))  return 50;
			else if($("#channel_size_60").is(":checked"))  return 60;
			else if($("#channel_size_70").is(":checked"))  return 70;
			else if($("#channel_size_80").is(":checked"))  return 90;
			else if($("#channel_size_90").is(":checked"))  return 130;
			else if($("#channel_size_100").is(":checked")) return 140;
			else return 0;
		}
	}
	function _chLedCountBySize(){
		var cnt = _chGetLedCount();
		$(".channel_led_count td span").text(cnt > 0 ? cnt + "개" : "0개");
	}
	function channel_led_count_set(){
		var isNewLed = ($("#channel_option02").is(":checked") || $("#channel_option06").is(":checked"));
		if(isNewLed){
			var jeonOn = $("#channel_led_jeon_yes").is(":checked");
			var huOn   = $("#channel_led_hu_yes").is(":checked");
			var est = _chGetLedCount();
			if(jeonOn){
				$(".channel_led_jeon_color_row").css("display","table-row");
				$(".ch_led_jeon_count_row").css("display","table-row");
				if(est > 0) $("#ch_led_jeon_count").val(est);
			} else {
				$(".channel_led_jeon_color_row").hide();
				$(".ch_led_jeon_count_row").hide();
			}
			if(huOn){
				$(".channel_led_hu_color_row").css("display","table-row");
				$(".ch_led_hu_count_row").css("display","table-row");
				$(".ch_led_hu_ggachi_row").css("display","table-row");
				if(est > 0) $("#ch_led_hu_count").val(est);
			} else {
				$(".channel_led_hu_color_row").hide();
				$(".ch_led_hu_count_row").hide();
				$(".ch_led_hu_ggachi_row").hide();
			}
			if(jeonOn || huOn) $(".channel_led_count").hide();
			else               $(".channel_led_count").css("display","table-row");
		} else if(!$("#channel_led_color_none").is(":checked")){ //LED색상 선택했을때 (기존 옵션)
			$(".channel_led_pos_row").css("display","table-row");
			_chLedCountBySize();
		}else{	//LED색상 선택안했을때
			$(".channel_led_pos_row").hide();
			$(".channel_led_count td span").text("0개");
		}

	}
	function channel_more_order_custom(){
		$(".woosung_wrap .contents_wrap #option_table td label input[name='channel_more_order']").click(function(){
			if($(this).attr("id") == "channel_more_order_option01"){

				$(".channel_more_order_option02").hide();
				$(".channel_more_order_option01").css({"display":"table-row"});
			}else if($(this).attr("id") == "channel_more_order_option02"){
				
				$(".channel_more_order_option01").hide();
				$(".channel_more_order_option02").css({"display":"table-row"});
			}else{
				$(".channel_more_order_option01,.channel_more_order_option02").hide();
			}
			
		});

	}
	function channel_display_work_custom(){
		$(".woosung_wrap .contents_wrap #option_table td label input[name='channel_led_display_work']").click(function(){
			if($(this).attr("id") == "channel_led_display_work_yes"){
				$(".woosung_wrap .contents_wrap #option_table .channel_led_display_work").css({"display":"table-row"});
			}else{
				$(".woosung_wrap .contents_wrap #option_table .channel_led_display_work").hide();
			}
			
		});

	}
//채널문자

//간판 프레임
function set_frame_top(){ //사인탑 초기설정
	$("#option_table thead,#option_table tbody").html("");
	$("#option_table thead").html("<tr id='frame_option_area'><th>품목</th><td><label><input type='radio' name='frame_option' id='frame_option01'>전면 프레임</label><label><input type='radio' name='frame_option' id='frame_option02'>돌출프레임</label><label><input type='radio' name='frame_option' id='frame_option03'>입간판</label><label><input type='radio' name='frame_option' id='frame_option04'>지주간판</label></td></tr>");
	$("#frame_option_area input").change(function(){
		set_frame_top_option_select();
	});
}
function set_frame_top_option_select(){
	var append_html = "";
	if($("#frame_option01").is(":checked")){ //전면프레임
		append_html += "<tr>";
			append_html += "<th>재질</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_type' id='frame_type01' checked='checked'>갈바</label>";
				append_html += "<label><input type='radio' name='frame_type' id='frame_type02'>스텐</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr class='frame_type02 add_row'>";
			append_html += "<th>스텐 종류</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_type02_type' id='frame_type02_type01' checked='checked'>스텐밀러</label>";
				append_html += "<label><input type='radio' name='frame_type02_type' id='frame_type02_type02'>스텐헤어라인</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>가로</th>";
			append_html += "<td><input type='number' id='frame_width' placeholder='가로값을 입력해주세요.'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>세로</th>";
			append_html += "<td>";
				append_html += "<input type='number' id='frame_vertical' placeholder='세로값을 입력해주세요.'> mm";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>입체</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_solid' id='channel_solid_color_white' checked='checked'>기본 1000mm</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>색상</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_black' checked='checked'>흑색</label>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_white'>백색</label>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_custom'>지정색 도장</label>";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_custom_color add_row'>";
			append_html += "<th>색상</th>";
			append_html += "<td><input type='text' id='frame_custom_text' placeholder='색상을 입력해주세요.'></td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>시공앵글</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_angle' id='frame_angle_no' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='frame_angle' id='frame_angle_yes'>있음</label>";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_angle add_row'>";
			append_html += "<th>크기</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_200' checked='checked'>200mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_300'>300mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_400'>400mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_500'>500mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_600'>600mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_700'>700mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_800'>800mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_900'>900mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_1000'>1000mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_1100'>1100mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_1200'>1200mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_1300'>1300mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_1400'>1400mm</label>";
				append_html += "<label><input type='radio' name='frame_angle_size' id='frame_angle_size_1500'>1500mm</label>";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_angle add_row'>";
			append_html += "<th>수량</th>";
			append_html += "<td>";
				append_html += "<input type='number' id='frame_angle_count'> 개";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr>";
			append_html += "<th>추가작업</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_more_order' id='frame_more_order_no' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='frame_more_order' id='frame_more_order_yes'>있음</label>";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_more_order add_row'>";
			append_html += "<th>크기</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_more_order_type' id='frame_more_order_type01' checked='checked'>보강대 작업</label>";
				append_html += "<label><input type='radio' name='frame_more_order_type' id='frame_more_order_type02'>착판작업</label>";
				append_html += "<label><input type='radio' name='frame_more_order_type' id='frame_more_order_type03'>기타작업</label>";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_more_order_type02 add_row'>";
			append_html += "<th>착판내용</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_more_order_type02_text' id='frame_more_order_type02_text_en' checked='checked'>영문(5000)</label>";
				append_html += "<label><input type='radio' name='frame_more_order_type02_text' id='frame_more_order_type02_text_kr'>한글(10000)</label>";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_more_order_type03 add_row'>";
			append_html += "<th>상세내용</th>";
			append_html += "<td>";
				append_html += "<input type='text' id='frame_more_order_type03_custom'>";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_more_order add_row frame_more_order_count'>";
			append_html += "<th>수량</th>";
			append_html += "<td>";
				append_html += "<input type='number' id='frame_more_order_count'> 개";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_more_order_type03 add_row'>";
			append_html += "<th>추가 금액</th>";
			append_html += "<td>";
				append_html += "<input type='number' id='frame_more_order_type03_price'> 원";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th  class='coution'><span>※참고</span></th>";
			append_html += "<td>";
				append_html += "<span>※ 기본길이 : 2m, 1000폭 이상 화면 골작업 포함</span>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";	
	}else if($("#frame_option02").is(":checked")){ //돌출 프레임
		append_html += "<tr>";
			append_html += "<th>재질</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_type' id='frame_type01' checked='checked'>갈바</label>";
				append_html += "<label><input type='radio' name='frame_type' id='frame_type02'>스텐</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr class='frame_type02 add_row'>";
			append_html += "<th>스텐 종류</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_type02_type' id='frame_type02_type01' checked='checked'>스텐밀러</label>";
				append_html += "<label><input type='radio' name='frame_type02_type' id='frame_type02_type02'>스텐헤어라인</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>가로(기본 800)</th>";
			append_html += "<td><input type='number' id='frame_width' placeholder='가로값을 입력해주세요.'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>세로(기본 1500)</th>";
			append_html += "<td><input type='number' id='frame_vertical' placeholder='세로값을 입력해주세요.'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>두께</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_thickness' id='frame_thickness250' checked='checked'>250mm</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>프레임색상</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_black' checked='checked'>흑색</label>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_white'>백색</label>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_custom'>지정색 도장</label>";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_custom_color add_row'>";
			append_html += "<th>색상</th>";
			append_html += "<td><input type='text' id='frame_custom_text' placeholder='색상을 입력해주세요.'></td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>시공방법</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_construction' id='frame_construction01' checked='checked'>양카발통</label>";
				append_html += "<label><input type='radio' name='frame_construction' id='frame_construction02'>u볼트 부착(구멍없음)</label>";
				append_html += "<label><input type='radio' name='frame_construction' id='frame_construction03'>발통 없음</label>";
				append_html += "<label><input type='radio' name='frame_construction' id='frame_construction04'>스탠 발통</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>추가작업</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_more_order' id='frame_more_order_no' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='frame_more_order' id='frame_more_order_yes'>있음</label>";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_more_order add_row'>";
			append_html += "<th>크기</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_more_order_type' id='frame_more_order_type01' checked='checked'>화면 작업</label>";
				append_html += "<label><input type='radio' name='frame_more_order_type' id='frame_more_order_type02'>착판 작업</label>";
				append_html += "<label><input type='radio' name='frame_more_order_type' id='frame_more_order_type03'>기타</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr class='frame_more_order add_row'>";
			append_html += "<th>상세내용</th>";
			append_html += "<td>";
				append_html += "<input type='text' id='frame_more_order_custom'>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";		
		append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";	
	}else if($("#frame_option03").is(":checked")){ //입간판
		append_html += "<tr>";
			append_html += "<th>재질</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_type' id='frame_type01' checked='checked'>갈바</label>";
				append_html += "<label><input type='radio' name='frame_type' id='frame_type02'>스텐</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr class='frame_type02 add_row'>";
			append_html += "<th>스텐 종류</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_type02_type' id='frame_type02_type01' checked='checked'>스텐밀러</label>";
				append_html += "<label><input type='radio' name='frame_type02_type' id='frame_type02_type02'>스텐헤어라인</label>";
			append_html += "</td>";
		append_html += "</tr>";		
		append_html += "<tr>";
			append_html += "<th>프레임모양</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_shape' id='frame_shape01' checked='checked'>고정식</label>";
				append_html += "<label><input type='radio' name='frame_shape' id='frame_shape02'>스텐드</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>크기</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_size' id='frame_size01' checked='checked'>600 x 1500</label>";
				append_html += "<label><input type='radio' name='frame_size' id='frame_size02'>600 x 1800</label>";
				append_html += "<label><input type='radio' name='frame_size' id='frame_size03'>600 x 2000</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr class='frame_type_fun'>";
			append_html += "<th>프레임색상</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_black' checked='checked'>흑색</label>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_white'>백색</label>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_custom'>지정색 도장</label>";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_custom_color add_row'>";
			append_html += "<th>색상</th>";
			append_html += "<td><input type='text' id='frame_custom_text' placeholder='색상을 입력해주세요.'></td>";
		append_html += "</tr>";	
		append_html += "<tr class='frame_shape01 add_row' style='display:table-row';>";
			append_html += "<th>시공방법</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_shape01_type' id='frame_shape01_type01' checked='checked'>양카볼트고정</label>";
				append_html += "<label><input type='radio' name='frame_shape01_type' id='frame_shape01_type02'>기초매립</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr class='frame_shape02 add_row'>";
			append_html += "<th>시공방법</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_shape02_type' id='frame_shape02_type01' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='frame_shape02_type' id='frame_shape02_type02'>이동식바퀴부착</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>추가작업</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_more_order' id='frame_more_order_no' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='frame_more_order' id='frame_more_order_yes'>있음</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr class='frame_more_order add_row'>";
			append_html += "<th>작업내용</th>";
			append_html += "<td>";
				append_html += "<input type='text' id='frame_more_order_custom' placeholder='작업내용을 입력해주세요.'>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";	
	}else{
		append_html += "<tr>";
			append_html += "<th>제작방식</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_product_type' id='frame_product_type01' checked='checked'>사인탑형</label>";
				append_html += "<label><input type='radio' name='frame_product_type' id='frame_product_type02'>통프레임형</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>재질</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_type' id='frame_type01' checked='checked'>갈바</label>";
				append_html += "<label><input type='radio' name='frame_type' id='frame_type02'>스텐</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr class='frame_type02 add_row'>";
			append_html += "<th>스텐 종류</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_type02_type' id='frame_type02_type01' checked='checked'>스텐밀러</label>";
				append_html += "<label><input type='radio' name='frame_type02_type' id='frame_type02_type02'>스텐헤어라인</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>종류</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_product_kind' id='frame_product_kind01' checked='checked'>양면</label>";
				append_html += "<label><input type='radio' name='frame_product_kind' id='frame_product_kind02'>삼각</label>";
				append_html += "<label><input type='radio' name='frame_product_kind' id='frame_product_kind03'>사각</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>가로(기본)</th>";
			append_html += "<td><input type='number' id='frame_width' placeholder='가로값을 입력해주세요.'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>세로(기본 3000)</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='frame_product_vertical'  placeholder='세로값을 입력해주세요.'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>두께</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_product_thickness' id='frame_product_thickness'>250mm</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr class='frame_type_fun'>";
			append_html += "<th>프레임색상</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_black' checked='checked'>흑색</label>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_white'>백색</label>";
				append_html += "<label><input type='radio' name='frame_color' id='frame_color_custom'>지정색 도장</label>";
			append_html += "</td>";
		append_html += "</tr>"
		append_html += "<tr class='frame_custom_color add_row'>";
			append_html += "<th>색상</th>";
			append_html += "<td><input type='text' id='frame_custom_text' placeholder='색상을 입력해주세요.'></td>";
		append_html += "</tr>";	
		append_html += "<tr class='frame_shape01 add_row' style='display:table-row';>";
			append_html += "<th>시공방법</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_shape01_type' id='frame_shape01_type01' checked='checked'>양카볼트고정</label>";
				append_html += "<label><input type='radio' name='frame_shape01_type' id='frame_shape01_type02'>기초매립</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>추가작업</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='frame_more_order' id='frame_more_order_no' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='frame_more_order' id='frame_more_order_yes'>있음</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr class='frame_more_order add_row'>";
			append_html += "<th>작업내용</th>";
			append_html += "<td>";
				append_html += "<input type='text' id='frame_more_order_custom' placeholder='작업내용을 입력해주세요.'>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";	
	}

	$("#option_table tbody").html(append_html);
	frame_stan_type();
	frame_color_custom();
	frame_angle();
	frame_more_order();
	frame_more_order_type();
	frame_shape01();
	frame_shape02();
}

function frame_stan_type(){	
	$(".woosung_wrap .contents_wrap #option_table td label input[name='frame_type']").click(function(){
		if($(this).attr("id") == "frame_type02"){
			$(".woosung_wrap .contents_wrap #option_table .frame_type02").css({"display":"table-row"});
			if($("#frame_option03").is(":checked")){
				$(".frame_type_fun").hide();
			}
		}else{
			$(".woosung_wrap .contents_wrap #option_table .frame_type02").hide();
			if($("#frame_option03").is(":checked")){
				$(".frame_type_fun").css({"display":"table-row"});
			}
		}
		
	});
}
function frame_color_custom(){	
	$(".woosung_wrap .contents_wrap #option_table td label input[name='frame_color']").click(function(){
		if($(this).attr("id") == "frame_color_custom"){
			$(".woosung_wrap .contents_wrap #option_table .frame_custom_color").css({"display":"table-row"});
		}else{
			$(".woosung_wrap .contents_wrap #option_table .frame_custom_color").hide();
		}
		
	});
}
function frame_angle(){	
	$(".woosung_wrap .contents_wrap #option_table td label input[name='frame_angle']").click(function(){
		if($(this).attr("id") == "frame_angle_yes"){
			$(".woosung_wrap .contents_wrap #option_table .frame_angle").css({"display":"table-row"});
		}else{
			$(".woosung_wrap .contents_wrap #option_table .frame_angle").hide();
		}
		
	});
}
function frame_more_order(){	
	$(".woosung_wrap .contents_wrap #option_table td label input[name='frame_more_order']").click(function(){
		if($(this).attr("id") == "frame_more_order_yes"){
			$(".woosung_wrap .contents_wrap #option_table .frame_more_order").css({"display":"table-row"});
		}else{
			$(".woosung_wrap .contents_wrap #option_table .frame_more_order").hide();
		}
		
	});
}
function frame_more_order_type(){	
	$(".woosung_wrap .contents_wrap #option_table td label input[name='frame_more_order_type']").click(function(){
		if($(this).attr("id") == "frame_more_order_type02"){
			$(".woosung_wrap .contents_wrap #option_table .frame_more_order_type03").hide();
			$(".woosung_wrap .contents_wrap #option_table .frame_more_order_type02,.frame_more_order_count").css({"display":"table-row"});
		}else if($(this).attr("id") == "frame_more_order_type03"){
			$(".woosung_wrap .contents_wrap #option_table .frame_more_order_type02,.frame_more_order_count").hide();
			$(".woosung_wrap .contents_wrap #option_table .frame_more_order_type03").css({"display":"table-row"});
		}else{
			$(".woosung_wrap .contents_wrap #option_table .frame_more_order_type03,.woosung_wrap .contents_wrap #option_table .frame_more_order_type02").hide();
			$(".frame_more_order_count").css({"display":"table-row"});
		}
		
	});
}
function frame_shape01(){
	$(".woosung_wrap .contents_wrap #option_table td label input[name='frame_shape']").click(function(){
		if($(this).attr("id") == "frame_shape01"){
			$(".woosung_wrap .contents_wrap #option_table .frame_shape01").css({"display":"table-row"});
		}else{
			$(".woosung_wrap .contents_wrap #option_table .frame_shape01").hide();
		}
		
	});
}
function frame_shape02(){
	$(".woosung_wrap .contents_wrap #option_table td label input[name='frame_shape']").click(function(){
		if($(this).attr("id") == "frame_shape02"){
			$(".woosung_wrap .contents_wrap #option_table .frame_shape02").css({"display":"table-row"});
		}else{
			$(".woosung_wrap .contents_wrap #option_table .frame_shape02").hide();
		}
		
	});
}
//간판 프레임

//실사출력
function set_actual_top(){ //실사출력 초기설정
	$("#option_table thead,#option_table tbody").html("");
	$("#option_table thead").html("<tr id='actual_option_area'><th>품목</th><td><label><input type='radio' name='actual_option' id='actual_option01'>후렉스</label><label><input type='radio' name='actual_option' id='actual_option02'>UV실사</label><label><input type='radio' name='actual_option' id='actual_option03'>솔벤실사</label><label><input type='radio' name='actual_option' id='actual_option04'>수성실사</label></td></tr>");
	$("#actual_option_area input").change(function(){
		set_actual_top_option_select();
	});
}
function set_actual_top_option_select(){

	var append_html = "";
	if($("#actual_option01").is(":checked")){ //현수막/텐트천
		append_html += "<tr>";
			append_html += "<th>기계 종류</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='actual_type' id='actual_type01' checked='checked'>UV 양면</label>";
				append_html += "<label><input type='radio' name='actual_type' id='actual_type02'>UV 단면</label>";
				append_html += "<label><input type='radio' name='actual_type' id='actual_type03'>강솔벤</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>가로 (기장)</th>";
			append_html += "<td>";
				append_html += "<input type='text' inputmode='numeric' class='comma-fmt' id='frame_product_width' placeholder='가로값을 입력해주세요'> mm ";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>세로 (폭)</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='frame_product_vertical' placeholder='세로값을 입력해주세요'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>타공</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='actual_punch' id='actual_punch01' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='actual_punch' id='actual_punch02'>있음</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr class='actual_punch add_row'>";
			append_html += "<th>타공 개수</th>";
			append_html += "<td>";
				append_html += "<input type='number' id='actual_punch_count' placeholder='타공 개수를 입력해주세요'> 개";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>추가 작업</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order01' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order02'>고주파(중간연결)</label>";
        		append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order03'>고주파(사방연결)</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>추가 입력 사항</th>";
			append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
		append_html += "</tr>";	

	}else if($("#actual_option02").is(":checked")){ //UV실사
		append_html += "<tr>";
			append_html += "<th>소재</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material01' checked='checked'>LG 백색시트</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material02'>LG 백색시트(그레이)</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material03'>LG 클리어(투명시트)</label>";
				//append_html += "<label><input type='radio' name='actual_material' id='actual_material04'>타공 페트</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material05'>LG 조명용 백색</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material06'>엠보(안개시트)</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr class='actual_material03 add_row'>";
			append_html += "<th>레이어 수</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='actual_material03' id='actual_material03_01' checked='checked'>1 레이어</label>";
				append_html += "<label><input type='radio' name='actual_material03' id='actual_material03_02'>2 레이어</label>";
				append_html += "<label><input type='radio' name='actual_material03' id='actual_material03_03'>3 레이어</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>가로</th>";
			append_html += "<td>";
				append_html += "<input type='text' inputmode='numeric' class='comma-fmt' id='frame_product_width' placeholder='가로값을 입력해주세요'> mm ";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>세로</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='frame_product_vertical' placeholder='세로값을 입력해주세요'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>후가공</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order01' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order02'>재단</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr class='actual_more_order01 add_row'>";
			append_html += "<th>재단</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='actual_more_order_price' placeholder='추가 금액을 입력해주세요' disabled='disabled'> 원</td>";
		append_html += "</tr>";
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
		append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";		

	}else if($("#actual_option03").is(":checked")){ //솔벤실사
		append_html += "<tr>";
			append_html += "<th>소재</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material01' checked='checked'>LG 백색시트</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material02'>LG 백색시트(그레이)</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material03'>원웨이(타공)</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material04'>LG 조명용 백색</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material05'>엠보(안개시트)</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material06'>고휘도반사</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material07'>솔벤현수막</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>가로</th>";
			append_html += "<td>";
				append_html += "<input type='text' inputmode='numeric' class='comma-fmt' id='frame_product_width' placeholder='가로값을 입력해주세요'> mm ";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>세로</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='frame_product_vertical' placeholder='세로값을 입력해주세요'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>후가공</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order01'>없음</label>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order02'>재단</label>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order03'>코팅</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr class='actual_more_order01 add_row'>";
			append_html += "<th>재단</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='actual_more_order_price' placeholder='추가 금액을 입력해주세요'> 원</td>";
		append_html += "</tr>";
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
		append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";		
	}else{ //수성실사
		append_html += "<tr>";
			append_html += "<th>소재</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material01' checked='checked'>현수막</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material02'>켈(백색)</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material03'>켈(그레이)</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material04'>유포(백색)</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material05'>유포(그레이)</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material06'>페트</label>";
				append_html += "<label><input type='radio' name='actual_material' id='actual_material07'>백릿</label>";
			append_html += "</td>";
		append_html += "</tr>";
		append_html += "<tr>";
			append_html += "<th>가로(기장)</th>";
			append_html += "<td>";
				append_html += "<input type='text' inputmode='numeric' class='comma-fmt' id='frame_product_width' placeholder='가로값을 입력해주세요'> mm ";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>세로(폭)</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='frame_product_vertical' placeholder='세로값을 입력해주세요'> mm</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>후가공</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order01' checked='checked'>없음</label>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order02'>재단</label>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order03'>아일렛 펀칭</label>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order04'>미싱</label>";
				append_html += "<label><input type='radio' name='actual_more_order' id='actual_more_order05'>사방 미싱</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr class='actual_more_order_mising add_row'>";
			append_html += "<th>마감작업</th>";
			append_html += "<td>";
				append_html += "<label><input type='radio' name='actual_more_order_mising' id='actual_more_order_mising01' checked='checked'>끈고리 미싱</label>";
				append_html += "<label><input type='radio' name='actual_more_order_mising' id='actual_more_order_mising02'>각목 미싱</label>";
				append_html += "<label><input type='radio' name='actual_more_order_mising' id='actual_more_order_mising03'>봉 미싱</label>";
				append_html += "<label><input type='radio' name='actual_more_order_mising' id='actual_more_order_mising04'>접이 미싱</label>";
				append_html += "<label><input type='radio' name='actual_more_order_mising' id='actual_more_order_mising05'>줄 미싱</label>";
				append_html += "<label><input type='radio' name='actual_more_order_mising' id='actual_more_order_mising06'>납작끈 돌려 미싱</label>";
				append_html += "<label><input type='radio' name='actual_more_order_mising' id='actual_more_order_mising07'>양면 테이프</label>";
			append_html += "</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
			append_html += "<th>재단</th>";
			append_html += "<td><input type='text' inputmode='numeric' class='comma-fmt' id='actual_more_order_price' placeholder='추가 금액을 입력해주세요' disabled='disabled'> 원</td>";
		append_html += "</tr>";	
		append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
		append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";	
	}

	$("#option_table tbody").html(append_html);

	if($("#actual_option01,#actual_option02,#actual_option03,#actual_option04").is(":checked")){
		$("<tr><th>수량</th><td><input type='number' id='actual_quantity' placeholder='수량' value='1' min='1'> 개</td></tr>")
			.insertBefore($("#option_table tbody tr:has(th:contains('추가 금액'))"));
	}

	actual_punch();
}

function actual_punch(){
	$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_punch']").click(function(){
		if($(this).attr("id") == "actual_punch02"){
			$(".woosung_wrap .contents_wrap #option_table .actual_punch").css({"display":"table-row"});
		}else{
			$(".woosung_wrap .contents_wrap #option_table .actual_punch").hide();
		}
		
	});

	$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_material']").click(function(){
        if($("#actual_material01").is(":checked")){
			$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order']").parent().show();
		}else{
			$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order']").parent().hide();
			$("#actual_more_order01,#actual_more_order02,#actual_more_order03").parent().show();
			
		}
		if($(this).attr("id") == "actual_material03"){
			$(".woosung_wrap .contents_wrap #option_table .actual_material03").css({"display":"table-row"});
		}else{
			$(".woosung_wrap .contents_wrap #option_table .actual_material03").hide();
		}
		 if($("#actual_option04").is(":checked")){
             if($("#actual_material01").is(":checked") || $("#actual_material06").is(":checked")){
             	$("#actual_more_order03").parent().show();
             }else{
             	$("#actual_more_order03").parent().hide();    
             }
         }
	});
    

	$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order']").click(function(){
		if($("#actual_option04").is(":checked")){
			if($(this).attr("id") == "actual_more_order04" || $(this).attr("id") == "actual_more_order05"){
				$(".woosung_wrap .contents_wrap #option_table .actual_more_order_mising").css({"display":"table-row"});
			}else{
				$(".woosung_wrap .contents_wrap #option_table .actual_more_order_mising").hide();
			}
		}else{
			if($(this).attr("id") == "actual_more_order02" || $(this).attr("id") == "actual_more_order03"){
				$(".woosung_wrap .contents_wrap #option_table .actual_more_order01").css({"display":"table-row"});
                $(".actual_more_order01 th").text($(this).parent().text());
			}else{
				$(".woosung_wrap .contents_wrap #option_table .actual_more_order01").hide();
			}
		}
		
	});

}
//실사출력


//스카시
	function set_skasi_top(){
		$("#option_table thead,#option_table tbody").html("");
		$("#option_table thead").html("<tr id='actual_option_area'><th>품목</th><td><label><input type='radio' name='actual_option' id='skasi_option01'>고무</label><label><input type='radio' name='actual_option' id='skasi_option02'>아크릴</label><label><input type='radio' name='actual_option' id='skasi_option03'>포멕스</label><label><input type='radio' name='actual_option' id='skasi_option04'>실사 아크릴</label></td></tr>");
		$("#actual_option_area input").change(function(){
			set_skasi_top_option_select();
		});
	}

	function set_skasi_top_option_select(){
		var append_html = "";
		if($("#skasi_option01").is(":checked")){ //고무
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_text_form' id='skasi_text_form01' checked='checked'>흘림체</label>";
					append_html += "<label><input type='radio' name='skasi_text_form' id='skasi_text_form02'>필기체 & 한문</label>";
					append_html += "<label><input type='radio' name='skasi_text_form' id='skasi_text_form03'>모양(캐릭터,도형 등등..)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>두께</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb01' checked='checked'>10T ~ 30T</label>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb02'>50T</label>";
				append_html += "</td>";
			append_html += "</tr>";		
			append_html += "<tr>";
				append_html += "<th>알루미늄 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio'  name='skasicolor_type' id='skasicolor_type01' checked='checked'>일반</label>";
            		append_html += "<label><input type='radio'  name='skasicolor_type' id='skasicolor_type02' >수입금 / 은색</label>";
				append_html += "</td>";
			append_html += "</tr>";	
            append_html += "<tr>";
				append_html += "<th>수량 (총 글자수)</th>";
				append_html += "<td>";
					append_html += "<input type='text'  id='skasicolor_count' placeholder='수량을 입력해주세요.'> 개";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>고무 색상</th>";
				append_html += "<td>";
					append_html += "<input type='text'  id='skasi_color02' placeholder='색상을 입력해주세요.'>";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>크기</th>";
				append_html += "<td>";
					append_html += "<select id='skasi_width'>";
						append_html += "<option value=''>크기를 선택하세요.</option>";
						append_html += "<option value='10'>10</option>";
						append_html += "<option value='15'>15</option>";
						append_html += "<option value='20'>20</option>";
						append_html += "<option value='25'>25</option>";
						append_html += "<option value='30'>30</option>";
						append_html += "<option value='35'>35</option>";
						append_html += "<option value='40'>40</option>";
						append_html += "<option value='45'>45</option>";
						append_html += "<option value='50'>50</option>";
						append_html += "<option value='55'>55</option>";
						append_html += "<option value='60'>60</option>";
						append_html += "<option value='65'>65</option>";
						append_html += "<option value='70'>70</option>";
						append_html += "<option value='75'>75</option>";
						append_html += "<option value='80'>80</option>";
						append_html += "<option value='85'>85</option>";
						append_html += "<option value='90'>90</option>";
						append_html += "<option value='95'>95</option>";
						append_html += "<option value='100'>100</option>";
						append_html += "<option value='105'>105</option>";
						append_html += "<option value='110'>110</option>";
						append_html += "<option value='115'>115</option>";
						append_html += "<option value='120'>120</option>";
                        append_html += "<option value='125'>125</option>";
                        append_html += "<option value='130'>130</option>";
                        append_html += "<option value='135'>135</option>";
                        append_html += "<option value='140'>140</option>";
                        append_html += "<option value='145'>145</option>";
                        append_html += "<option value='150'>150</option>";
					append_html += "</select>";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>화면 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color01' checked='checked'>기본색상</label>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color02'>시트부착</label>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color03'>실사부착</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";	
		}else if($("#skasi_option02").is(":checked")){ //아크릴
            append_html += "<tr>";
				append_html += "<th>아크릴 타입</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_acrylic' id='skasi_acrylic01' checked='checked'>아크릴</label>";
					append_html += "<label><input type='radio' name='skasi_acrylic' id='skasi_acrylic02'>밀러 아크릴</label>";
				append_html += "</td>";
			append_html += "</tr>"
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_text_form' id='skasi_text_form01' checked='checked'>한글</label>";
					append_html += "<label><input type='radio' name='skasi_text_form' id='skasi_text_form02'>영문</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>두께</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb01' checked='checked'>2T ~ 3T</label>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb02'>5T</label>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb03'>8T</label>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb04'>10T</label>";
				append_html += "</td>";
			append_html += "</tr>";
            append_html += "<tr>";
				append_html += "<th>수량(총 글자수)</th>";
				append_html += "<td>";
					append_html += "<input type='text'  id='skasi_acrylic_count' placeholder='총 글자수를 입력해주세요.'> 개";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>색상</th>";
				append_html += "<td>";
					append_html += "<input type='text'  id='skasi_color01' placeholder='색상을 입력해주세요.'>";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
			append_html += "<th>크기 단위(mm)</th>";
				append_html += "<td>";
					append_html += "<select id='skasi_width'>";
						append_html += "<option value=''>크기를 선택하세요.</option>";
						append_html += "<option value='30'>30미만</option>";
						append_html += "<option value='40'>40</option>";
						append_html += "<option value='50'>50</option>";
						append_html += "<option value='60'>60</option>";
						append_html += "<option value='70'>70</option>";
						append_html += "<option value='80'>80</option>";
						append_html += "<option value='90'>90</option>";
						append_html += "<option value='100'>100</option>";
						append_html += "<option value='110'>110</option>";
						append_html += "<option value='120'>120</option>";
						append_html += "<option value='130'>130</option>";
						append_html += "<option value='140'>140</option>";
						append_html += "<option value='150'>150</option>";
						append_html += "<option value='160'>160</option>";
						append_html += "<option value='170'>170</option>";
						append_html += "<option value='180'>180</option>";
						append_html += "<option value='190'>190</option>";
						append_html += "<option value='200'>200</option>";
						append_html += "<option value='210'>210</option>";
						append_html += "<option value='220'>220</option>";
						append_html += "<option value='230'>230</option>";
						append_html += "<option value='240'>240</option>";
						append_html += "<option value='250'>250</option>";
						append_html += "<option value='260'>260</option>";
            			append_html += "<option value='270'>270</option>";
                        append_html += "<option value='280'>280</option>";
                        append_html += "<option value='290'>290</option>";
                        append_html += "<option value='300'>300</option>";
                        append_html += "<option value='310'>310</option>";
                        append_html += "<option value='320'>320</option>";
                        append_html += "<option value='330'>330</option>";
                        append_html += "<option value='340'>340</option>";
                        append_html += "<option value='350'>350</option>";
                        append_html += "<option value='360'>360</option>";
                        append_html += "<option value='370'>370</option>";
                        append_html += "<option value='380'>380</option>";
                        append_html += "<option value='390'>390</option>";
                        append_html += "<option value='400'>400</option>";
					append_html += "</select>";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>화면 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color01' checked='checked'>기본색상</label>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color02'>시트부착</label>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color03'>실사부착</label>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color04'>도색</label>";
				append_html += "</td>";
			append_html += "</tr>";	
            append_html += "<tr class='skasi_screen_color_count add_row'>";
				append_html += "<th>도색 가지수</th>";
				append_html += "<td><input type='number' id='skasi_screen_color_count' placeholder='색상 가지수를 입력해주세요'> 개</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";		
			append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";	
		}else if($("#skasi_option03").is(":checked")){ //포멕스
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_text_form' id='skasi_text_form01' checked='checked'>사각형</label>";
					append_html += "<label><input type='radio' name='skasi_text_form' id='skasi_text_form02'>모양</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>두께</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb01' checked='checked'>2T</label>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb02'>3T</label>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb03'>5T</label>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb04'>8T</label>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb05'>10T</label>";
            		append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb06'>폼보드(5T)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>색상</th>";
				append_html += "<td>";
            		append_html += "<label><input type='radio' name='pomex_color' id='pomex_color01' checked='checked'>백색</label>";
					append_html += "<label><input type='radio' name='pomex_color' id='pomex_color02'>검정색</label>";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>가로</th>";
				append_html += "<td>";
					append_html += "<input type='number' id='skasi_product_width' placeholder='가로값을 입력해주세요'> mm ";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>세로</th>";
				append_html += "<td><input type='number' id='skasi_product_vertical' placeholder='세로값을 입력해주세요'> mm</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>화면 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color01' checked='checked'>기본색상</label>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color02'>시트부착</label>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color03'>평판인쇄</label>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color04'>양면 평판인쇄</label>";
				append_html += "</td>";
			append_html += "</tr>";	
            append_html += "<tr>";
				append_html += "<th>양면 테이프</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='both_size_tape' id='both_size_tape01' checked='checked'>사용</label>";
					append_html += "<label><input type='radio' name='both_size_tape' id='both_size_tape02'>미사용</label>";
				append_html += "</td>";
			append_html += "</tr>";	
            append_html += "<tr>";
				append_html += "<th>수량</th>";
				append_html += "<td><input type='number' id='pomex_count' placeholder='수량을 입력해주세요.'> 개</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";	
			
		}else{ //실사 아크릴
			append_html += "<tr>";
				append_html += "<th>문자형태</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_text_form' id='skasi_text_form01' checked='checked'>모양(캐릭터,도형 등등..)</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>두께</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_thumb' id='skasi_thumb01' checked='checked'>5T</label>";
				append_html += "</td>";
			append_html += "</tr>";
			append_html += "<tr>";
				append_html += "<th>색상</th>";
				append_html += "<td>";
					append_html += "<input type='text'  id='skasi_color01' placeholder='색상을 입력해주세요.'>";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr class='skasi_text_form03_02'>";
				append_html += "<th>가로</th>";
				append_html += "<td>";
					append_html += "<input type='number' id='skasi_product_width' placeholder='가로값을 입력해주세요'> mm ";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr class='skasi_text_form03_02'>";
				append_html += "<th>세로</th>";
				append_html += "<td><input type='number' id='skasi_product_vertical' placeholder='세로값을 입력해주세요'> mm</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>화면 색상</th>";
				append_html += "<td>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color01' checked='checked'>기본색상</label>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color02'>시트부착</label>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color03'>실사부착</label>";
					append_html += "<label><input type='radio' name='skasi_screen_color' id='skasi_screen_color04'>평판인쇄</label>";
				append_html += "</td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>추가 금액</th>";
				append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
			append_html += "</tr>";	
			append_html += "<tr>";
				append_html += "<th>추가 입력 사항</th>";
				append_html += "<td><textarea id='add_more_text' placeholder='추가 입력 사항을 입력해주세요'></textarea></td>";
			append_html += "</tr>";	
		}

		$("#option_table tbody").html(append_html);
		skasi_text_form03();
        skasi_screen_color_count();
      
	}

	function skasi_text_form03(){
		$(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_text_form']").click(function(){
			if($("#skasi_option04").is(":checked")){
				if($(this).attr("id") == "skasi_text_form03"){
					$(".woosung_wrap .contents_wrap #option_table .skasi_text_form03_01").hide();
					$(".woosung_wrap .contents_wrap #option_table .skasi_text_form03_02").css({"display":"table-row"});
				}else{
					$(".woosung_wrap .contents_wrap #option_table .skasi_text_form03_01").css({"display":"table-row"});
					$(".woosung_wrap .contents_wrap #option_table .skasi_text_form03_02").hide();
				}
			}
			
		});
	}
    function skasi_screen_color_count(){
            $(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_screen_color']").click(function(){
                if($("#skasi_screen_color04").is(":checked")){
                    $(".woosung_wrap .contents_wrap #option_table .skasi_screen_color_count").css({"display":"table-row"});
                }else{
                    $(".woosung_wrap .contents_wrap #option_table .skasi_screen_color_count").hide();
                }

            });
        }

//스카시
//초기설정


//견적 프로그램 시작

$(".woosung_wrap .tab_area ul li").click(function(){
	if($(this).hasClass("child01")){ //사인탑
    	 $(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_option']").click(function(){
        	if($(this).attr("id") == "sigh_option01"){ //비조명
                sign_top_01();
            }else if($(this).attr("id") == "sigh_option02"){ //조명          
                sign_top_02();
            }else if($(this).attr("id") == "sigh_option03"){ //돌출
                sign_top_03();
            }
        });
    }else if($(this).hasClass("child02")){ //채널문자
        $(".woosung_wrap .contents_wrap #option_table td label input[name='channel_option']").click(function(){
            chnnel_taka();
        });
    }else if($(this).hasClass("child03")){ //간판프레임
        
    }else if($(this).hasClass("child04")){ //실사출력
      	$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_option']").click(function(){
        	if($(this).attr("id") == "actual_option01"){ //후렉스
                whoorex();
            }else if($(this).attr("id") == "actual_option02"){ //UV실사
                uv_silsa();
            }else if($(this).attr("id") == "actual_option03"){ //솔벤실사
                solven_silsa();
            }else if($(this).attr("id") == "actual_option04"){ //수성실사
                soosung_silsa();
            }
        });
        
    }else if($(this).hasClass("child05")){ //스카시
        $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_option']").click(function(){
        	if($(this).attr("id") == "skasi_option01"){ //고무
            	skasi_gomoo();
            }else if($(this).attr("id") == "skasi_option02"){ //아크릴
              skasi_acrylic();
            }else if($(this).attr("id") == "skasi_option03"){ //포멕스
                skasi_pomex();
            }else if($(this).attr("id") == "skasi_option04"){ //실사 아크릴
                
            }
        });
    }else if($(this).hasClass("child06")){ //공통자재
        common_material_calc();
    }

    $(".order_info .right_area #order_price").text(0);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////계산식



function sign_top_01(){ //사인탑_비조명
    console.log(22);
   setTimeout(function(){
	$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_option']").click(function(){
        $("#sigh_row,#sigh_vertical,#more_order_price,#add_more_text,#more_order_price,#add_more_text,#sigh_angle_count,#frame_custom_text,#sign_more_order_content").val("");
        $("#sigh_option_row,#sigh_display_01,#sigh_frame_color_white,#sigh_angle_no,#sign_more_order_no,#sigh_angle_width_200").prop("checked",true);
   
        //초기 리셋
    	sign_top_01_cal();
         
    });
    $("#sigh_row,#sigh_vertical,#frame_custom_text,#sigh_angle_count,#sign_more_order_content,#more_order_price,#add_more_text").bind("change keyup paste", function(){
    	sign_top_01_cal();
      
    });

    $("input[name='sigh_option'],input[name='sigh_option_direction'],input[name='sigh_display'],input[name='sigh_frame_color'],input[name='sigh_angle'],input[name='sign_more_order'],input[name='sigh_backdrop'],input[name='sigh_deungbak'],input[name='sigh_deungbak_type'],input[name='sigh_kyungbak_size'],input[name='sigh_deungbak_pos']").click(function(){
    	sign_top_01_cal();
 
    });
 
   },1000);

}
function sign_top_01_cal(){ //사인탑_비조명 계산
    var target_width = nv("#sigh_row")/1000;
    var target_vertical = nv("#sigh_vertical")/1000;
    if($("#sigh_option_row").is(":checked")){
        if(target_width <= 1.5 && target_width != 0) target_width = 1.5;
        if(target_vertical <= 1 && target_vertical != 0) target_vertical = 1;
    }else{
        if(target_width <= 1 && target_width != 0) target_width = 1;
        if(target_vertical <= 1.5 && target_vertical != 0) target_vertical = 1.5;
    }
    var color_price = 0, total_price = 0, angle_price = 0;

    if($("#sigh_display_01").is(":checked")){
        total_price = (target_width * target_vertical) * PRICES.sign01_flex_print;
    }else if($("#sigh_display_02").is(":checked")){
        total_price = (target_width * target_vertical) * PRICES.sign01_flex_sheet;
    }else if($("#sigh_display_03").is(":checked")){
        total_price = (target_width * target_vertical) * PRICES.sign01_tension_none;
    }

    if($("#sigh_frame_color_custom").is(":checked")){
        color_price = Math.round(target_width * target_vertical) * PRICES.sign_color_paint_nol;
    }else if($("#sigh_frame_color_stan").is(":checked")){
        color_price = ((target_width*2) + (target_vertical*2)) * PRICES.sign_sten_molding;
    }

    if($("#sigh_angle_yes").is(":checked")){
        angle_price = getAnglePrice(Number($("#sigh_angle_count").val()));
    }

    var backdrop_price = getBackdropPrice();
    var backdrop_color_price = getBackdropColorPrice();
    var deungbak_price = getDeungbakPrice();
    $("#order_price").text(String(_r10(total_price+color_price+angle_price+backdrop_price+backdrop_color_price+deungbak_price+nv("#more_order_price"))).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}

function sign_top_02(){ //사인탑_조명
   setTimeout(function(){
	$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_option']").click(function(){
        $("#sigh_row,#sigh_vertical,#more_order_price,#add_more_text,#sigh_light_led_count,#frame_custom_text,#sigh_angle_count,#sign_more_order_content,#sign_more_order_price,#sign_etc").val("");
        $("#sigh_option_row,#sigh_display_01,#sigh_light_non,#sigh_frame_color_white,#sigh_angle_no,#sigh_angle_width_800,#sign_more_order_no").prop("checked",true);
   
        //초기 리셋
    	sign_top_02_cal();
         
    });
    $("#sigh_row,#sigh_vertical,#more_order_price,#add_more_text,#sigh_light_led_count,#frame_custom_text,#sigh_angle_count,#sign_more_order_content,#sign_more_order_price,#sign_etc,#more_order_price,#add_more_text").bind("change keyup paste", function(){
    	sign_top_02_cal();
      
    });

    $("input[name='sigh_option_direction'],input[name='sigh_display'],input[name='sigh_light'],input[name='sigh_frame_color'],input[name='sigh_angle'],input[name='sigh_angle_width'],input[name='sign_more_order'],input[name='sigh_backdrop'],input[name='sigh_deungbak'],input[name='sigh_deungbak_type'],input[name='sigh_kyungbak_size'],input[name='sigh_deungbak_pos']").click(function(){
    	sign_top_02_cal();
 
    });
 
   },1000);

}
function sign_top_02_cal(){ //사인탑_조명 계산
    
    var target_width = nv("#sigh_row")/1000;
    var target_vertical = nv("#sigh_vertical")/1000;
    if($("#sigh_option_row").is(":checked")){ //가로형
      if(target_width <= 1.5 && target_width != 0){
         target_width = 1.5;
       }
        if(target_vertical <= 1 && target_vertical != 0){
         target_vertical = 1;
       }
    }else{ //세로형
        if(target_width <= 1 && target_width != 0){
         target_width = 1;
       }
       if(target_vertical <= 1.5 && target_vertical != 0){
         target_vertical = 1.5;
       }
    }
    var color_price  = 0;
   	var total_price = 0;
    var angle_price = 0;
    var led_price = 0;
    if($("#sigh_display_01").is(":checked")){
     	total_price =(target_width * target_vertical) * PRICES.sign02_flex_print;
    }else if($("#sigh_display_02").is(":checked")){
    	total_price = (target_width * target_vertical) * PRICES.sign02_flex_sheet;
    }else if($("#sigh_display_03").is(":checked")){
    	total_price = (target_width * target_vertical) * PRICES.sign02_tension_none;
    }
    
    if($("#sigh_frame_color_white").is(":checked")){
       color_price = 0;
    }else if($("#sigh_frame_color_custom").is(":checked")){
       if($("#sigh_option_row").is(":checked")){ //가로형     
  			if(Math.round(target_width) <= 5){
              color_price = 50000;
           }else{
               color_price = target_width * PRICES.sign_color_paint_light;
           } 
          // color_price = Math.round(target_width * target_vertical) * 10000 ;           
       }else{	//세로형
        	if(Math.round(target_vertical) <= 5){
              color_price = 50000;
           }else{
               color_price = target_vertical * PRICES.sign_color_paint_light;
           }        
        
        }
    }else if($("#sigh_frame_color_stan").is(":checked")){
     	color_price = ((target_width *2) + (target_vertical *2) ) * 20000;
    }
 	

    if($("#sigh_angle_yes").is(":checked")){
        if($("#sigh_angle_width_800").is(":checked")){
       		angle_price = 4800 * Number($("#sigh_angle_count").val());
        }else if($("#sigh_angle_width_900").is(":checked")){
            angle_price = 5000 * Number($("#sigh_angle_count").val());
       }else if($("#sigh_angle_width_1000").is(":checked")){
           angle_price = 5800 * Number($("#sigh_angle_count").val());
       }else if($("#sigh_angle_width_1100").is(":checked")){
           angle_price = 5800 * Number($("#sigh_angle_count").val());
       }else if($("#sigh_angle_width_1200").is(":checked")){
           angle_price = 6000 * Number($("#sigh_angle_count").val());
       }else if($("#sigh_angle_width_1300").is(":checked")){
           angle_price = 6800 * Number($("#sigh_angle_count").val());
       }else if($("#sigh_angle_width_1400").is(":checked")){
           angle_price = 6800 * Number($("#sigh_angle_count").val());
       }else if($("#sigh_angle_width_1500").is(":checked")){
           angle_price = 6800 * Number($("#sigh_angle_count").val());
       }else if($("#sigh_angle_width_1600").is(":checked")){
           angle_price = 7000 * Number($("#sigh_angle_count").val());
       }else if($("#sigh_angle_width_1700").is(":checked")){
           angle_price = 7200 * Number($("#sigh_angle_count").val());
       }else if($("#sigh_angle_width_1800").is(":checked")){
           angle_price = 7400 * Number($("#sigh_angle_count").val());
       }else if($("#sigh_angle_width_1900").is(":checked")){
           angle_price = 7600 * Number($("#sigh_angle_count").val());
       }else if($("#sigh_angle_width_2000").is(":checked")){
           angle_price = 8200 * Number($("#sigh_angle_count").val());
       }else{
           angle_price = 0;
       }
    }
    if($("#sigh_light_led").is(":checked")){
        led_price = Number($("#sigh_light_led_count").val()) * 4500;
    }

    var backdrop_price = getBackdropPrice();
    var backdrop_color_price = getBackdropColorPrice();
    var deungbak_price = getDeungbakPrice();
	$("#order_price").text(String(_r10(total_price+color_price+angle_price+led_price+backdrop_price+backdrop_color_price+deungbak_price+nv("#more_order_price"))).replace(/\B(?=(\d{3})+(?!\d))/g, ","));

}

function sign_top_03(){ //사인탑_돌출
	setTimeout(function(){
        
	$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_option']").click(function(){
        $("#sigh_vertical,#frame_custom_text,#sign_more_order_content,#sign_more_order_price,#sign_etc,#more_order_price,#add_more_text").val("");
        $("#sigh_angle_width_800,#sigh_display_01,#sigh_display_type01,#sigh_light_non,#sigh_angle_no,#sigh_frame_color_white,#sigh_baltong_normal,#sign_more_order_no").prop("checked",true);
   
        //초기 리셋
    	sign_top_03_cal();
         
    });
    $("#sigh_vertical,#frame_custom_text,#sign_more_order_content,#sign_more_order_price,#sign_etc,#more_order_price,#add_more_text").bind("change keyup paste", function(){
    	sign_top_03_cal();
      
    });

    $("input[name='sigh_angle_width'],input[name='sigh_display'],input[name='sigh_light'],input[name='sigh_frame_color'],input[name='sigh_baltong'],input[name='sign_more_order'],input[name='sigh_backdrop'],input[name='sigh_deungbak'],input[name='sigh_deungbak_type'],input[name='sigh_kyungbak_size'],input[name='sigh_deungbak_pos']").click(function(){
    	sign_top_03_cal();
 
    });
 	 },1000);

}
function sign_top_03_cal(){ //사인탑_돌출 계산
    
    var target_width = 0;
 	var target_vertical = nv("#sigh_vertical")/1000;
    var total_price = 0;
    var woorex_price = 0;
    var led_price = 0;
    var color_price = 0;
    var bal_tong_price = 0;
    
    if(target_vertical <= 1.5 && target_vertical != 0){
        target_vertical = 1.5;
    }
   
    if($("#sigh_angle_width_800").is(":checked")){
        target_width = 800/1000;
        total_price = target_vertical * 70000;
    }else if($("#sigh_angle_width_900").is(":checked")){
        target_width = 900/1000;
        total_price = target_vertical * 75000
    }else if($("#sigh_angle_width_1000").is(":checked")){
        target_width = 1000/1000;
        total_price = target_vertical * 80000
    }else if($("#sigh_angle_width_1100").is(":checked")){
        target_width = 1100/1000;
        total_price = target_vertical * 85000;
    }else if($("#sigh_angle_width_1200").is(":checked")){
        target_width = 1200/1000;
        total_price = target_vertical * 90000;
    }
   
    if($("#sigh_display_01").is(":checked")){
        if($("#sigh_display_type01").is(":checked")){
            if(target_width <= 1){
                 woorex_price = (1 * target_vertical) * 8000;
            }else{
                 woorex_price = (target_width * target_vertical) * 8000;
            }
            
        }else{
            if(target_width <= 1){
                 woorex_price = (1 * target_vertical) * 7000;
            }else{
                 woorex_price = (target_width * target_vertical) * 7000;
            }
        }
    }else if($("#sigh_display_02").is(":checked")){
    	woorex_price = 10000;
    }else if($("#sigh_display_03").is(":checked")){
		woorex_price = 0;    
    }
	 woorex_price = woorex_price * 2;

    if($("#sigh_light_led").is(":checked")){
        led_price = Number($("#sigh_light_led_count").val()) * 4500;
    }else{
    	led_price = 0;
    }
    
    if($("#sigh_frame_color_white").is(":checked")){
        color_price = 0;
    }else if($("#sigh_frame_color_custom").is(":checked")){
        if(target_vertical <= 5){
            color_price = 50000;
        }else{
            color_price = color_price *10000; 
        }
    }else if($("#sigh_frame_color_stan").is(":checked")){
        color_price = (((target_width *2) + (target_vertical *2) ) * 20000) * 2;
    }
  
    if($("#sigh_baltong_normal").is(":checked")){
       bal_tong_price = 0;
    }else if($("#sigh_baltong_ubolt").is(":checked")){
       bal_tong_price = 30000;
    }else if($("#sigh_baltong_none").is(":checked")){
       bal_tong_price = 0;
    }else if($("#sigh_baltong_stan").is(":checked")){
       bal_tong_price = 100000;
    }

    var backdrop_price = getBackdropPrice();
    var backdrop_color_price = getBackdropColorPrice();
    var deungbak_price = getDeungbakPrice();
	$("#order_price").text(String(_r10(total_price+woorex_price+led_price+color_price+bal_tong_price+backdrop_price+backdrop_color_price+deungbak_price+nv("#more_order_price"))).replace(/\B(?=(\d{3})+(?!\d))/g, ","));

}

///사인탑
function chnnel_taka(){ //채널 타카식
    setTimeout(function(){
        $(".woosung_wrap .contents_wrap #option_table td label input[name='channel_option']").click(function(){
            $("#frame_product_width,#frame_product_vertical,#more_order_price,#add_more_text,#actual_punch_count,#channel_trusbar_width").val("");
            $("#channel_text_eng,#channel_size_30,#channel_trim_color_white,#channel_solid_color_white,#channel_led_color_none,#channel_more_order_no,#channel_led_display_work_no,#channel_trim_custom_color_red,#channel_solid_custom_color_red,#ch_ggachi_size_200,#channel_more_order_option02_type01,#channel_led_display_work_type01,#channel_trusbar_none").prop("checked",true);

            //초기 리셋
            chnnel_taka_cal();

        });
       
        $(".woosung_wrap .contents_wrap #option_table td label input[name='channel_text_form'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_size'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_trim_color'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_solid_color'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_led_color'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_led_jeon'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_led_jeon_color'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_led_hu'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_led_hu_color'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_galva_type'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_sten_type'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_trusbar'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_more_order'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_led_display_work'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_led_display_work_type']").click(function(){
            chnnel_taka_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td label input[name='channel_trim_custom_color'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_solid_custom_color'],.woosung_wrap .contents_wrap #option_table td label input[name='channel_complete']").click(function(){
            chnnel_taka_cal();

        });
        $("#channel_content,#more_order_price,#channel_trusbar_width,#channel_trusbar_custom_price,#channel_more_order_count,#ch_smps_qty").bind("change keyup paste", function(){
            chnnel_taka_cal();
        });
        $("input[name='ch_smps_spec']").click(function(){
            if($(this).attr("id") === "ch_smps_none") $(".ch_smps_qty_row").hide();
            else $(".ch_smps_qty_row").css("display","table-row");
            chnnel_taka_cal();
        });
    },500);
}
// ── 채널문자 글자단가(현재 폼 상태) 계산 ──────────────────────
var _lastChBaseUnit = 0, _lastChCustomOrder = 0, _lastChBaseUnitOrig = 0, _lastCh13x = false;
function _getChCurrentItemPrice() {
    applyPrices();
    var _pricePrefix;
    if($("#channel_text_eng").is(":checked"))      _pricePrefix = "eng";
    else if($("#channel_text_got").is(":checked")) _pricePrefix = "got";
    else                                           _pricePrefix = "kor";

    var chennel_width = 0, _sz = null;
    if($("#channel_option05").is(":checked")){
        if($("#channel_size_20").is(":checked")) _sz="20";
        else if($("#channel_size_25").is(":checked")) _sz="25";
        else if($("#channel_size_30").is(":checked")) _sz="30";
        else if($("#channel_size_35").is(":checked")) _sz="35";
        else if($("#channel_size_40").is(":checked")) _sz="40";
        else if($("#channel_size_45").is(":checked")) _sz="45";
        else if($("#channel_size_50").is(":checked")) _sz="50";
        else if($("#channel_size_55").is(":checked")) _sz="55";
        else if($("#channel_size_60").is(":checked")) _sz="60";
        else if($("#channel_size_65").is(":checked")) _sz="65";
        else if($("#channel_size_70").is(":checked")) _sz="70";
        if(_sz) chennel_width = PRICES["ch_ilche_"+_pricePrefix+"_"+_sz]||0;
    } else if($("#channel_option04").is(":checked")){
        if($("#channel_size_20").is(":checked")) _sz="20";
        else if($("#channel_size_25").is(":checked")) _sz="25";
        else if($("#channel_size_30").is(":checked")) _sz="30";
        else if($("#channel_size_35").is(":checked")) _sz="35";
        else if($("#channel_size_40").is(":checked")) _sz="40";
        else if($("#channel_size_45").is(":checked")) _sz="45";
        else if($("#channel_size_50").is(":checked")) _sz="50";
        else if($("#channel_size_55").is(":checked")) _sz="55";
        else if($("#channel_size_60").is(":checked")) _sz="60";
        else if($("#channel_size_65").is(":checked")) _sz="65";
        else if($("#channel_size_70").is(":checked")) _sz="70";
        if(_sz) chennel_width = PRICES["ch_epox_"+_pricePrefix+"_"+_sz]||0;
    } else if($("#channel_option02").is(":checked")){
        if($("#channel_size_30").is(":checked")) _sz="30";
        else if($("#channel_size_35").is(":checked")) _sz="35";
        else if($("#channel_size_40").is(":checked")) _sz="40";
        else if($("#channel_size_45").is(":checked")) _sz="45";
        else if($("#channel_size_50").is(":checked")) _sz="50";
        else if($("#channel_size_60").is(":checked")) _sz="60";
        else if($("#channel_size_70").is(":checked")) _sz="70";
        else if($("#channel_size_80").is(":checked")) _sz="80";
        else if($("#channel_size_90").is(":checked")) _sz="90";
        else if($("#channel_size_100").is(":checked")) _sz="100";
        if(_sz) {
            var _galvaSub = $("input[name='channel_galva_type']:checked").attr("id") || "channel_galva_glja";
            var _galvaKey = _galvaSub === "channel_galva_gosa" ? "ch_gosa_" :
                            _galvaSub === "channel_galva_laser" ? "ch_galva_laser_" : "ch_galva_";
            chennel_width = PRICES[_galvaKey+(_pricePrefix==="kor"?"eng":_pricePrefix)+"_"+_sz]||0;
        }
    } else if($("#channel_option06").is(":checked")){
        if($("#channel_size_20").is(":checked")) _sz="20";
        else if($("#channel_size_25").is(":checked")) _sz="25";
        else if($("#channel_size_30").is(":checked")) _sz="30";
        else if($("#channel_size_35").is(":checked")) _sz="35";
        else if($("#channel_size_40").is(":checked")) _sz="40";
        else if($("#channel_size_45").is(":checked")) _sz="45";
        else if($("#channel_size_50").is(":checked")) _sz="50";
        else if($("#channel_size_60").is(":checked")) _sz="60";
        else if($("#channel_size_70").is(":checked")) _sz="70";
        else if($("#channel_size_80").is(":checked")) _sz="80";
        else if($("#channel_size_90").is(":checked")) _sz="90";
        else if($("#channel_size_100").is(":checked")) _sz="100";
        if(_sz) {
            var _stenSub = $("input[name='channel_sten_type']:checked").attr("id") || "channel_sten_glja";
            var _stenKey = _stenSub === "channel_sten_gosa" ? "ch_sten_gosa_" :
                           _stenSub === "channel_sten_laser" ? "ch_sten_laser_" : "ch_sten_";
            chennel_width = PRICES[_stenKey+(_pricePrefix==="kor"?"eng":_pricePrefix)+"_"+_sz]||0;
        }
    } else if($("#channel_option07").is(":checked")){
        if($("#channel_size_20").is(":checked")) _sz="20";
        else if($("#channel_size_25").is(":checked")) _sz="25";
        else if($("#channel_size_30").is(":checked")) _sz="30";
        else if($("#channel_size_35").is(":checked")) _sz="35";
        else if($("#channel_size_40").is(":checked")) _sz="40";
        else if($("#channel_size_45").is(":checked")) _sz="45";
        else if($("#channel_size_50").is(":checked")) _sz="50";
        else if($("#channel_size_60").is(":checked")) _sz="60";
        else if($("#channel_size_70").is(":checked")) _sz="70";
        else if($("#channel_size_80").is(":checked")) _sz="80";
        else if($("#channel_size_90").is(":checked")) _sz="90";
        else if($("#channel_size_100").is(":checked")) _sz="100";
        if(_sz) chennel_width = PRICES["ch_titan_"+(_pricePrefix==="kor"?"eng":_pricePrefix)+"_"+_sz]||0;
    } else {
        if($("#channel_size_30").is(":checked")) _sz="30";
        else if($("#channel_size_40").is(":checked")) _sz="40";
        else if($("#channel_size_50").is(":checked")) _sz="50";
        else if($("#channel_size_60").is(":checked")) _sz="60";
        else if($("#channel_size_70").is(":checked")) _sz="70";
        else if($("#channel_size_80").is(":checked")) _sz="80";
        else if($("#channel_size_90").is(":checked")) _sz="90";
        else if($("#channel_size_100").is(":checked")) _sz="100";
        else if($("#channel_size_110").is(":checked")) _sz="110";
        else if($("#channel_size_120").is(":checked")) _sz="120";
        else if($("#channel_size_130").is(":checked")) _sz="130";
        else if($("#channel_size_140").is(":checked")) _sz="140";
        else if($("#channel_size_150").is(":checked")) _sz="150";
        else if($("#channel_size_160").is(":checked")) _sz="160";
        else if($("#channel_size_170").is(":checked")) _sz="170";
        else if($("#channel_size_180").is(":checked")) _sz="180";
        if(_sz) chennel_width = PRICES["ch_taka_"+_pricePrefix+"_"+_sz]||0;
    }

    var custom_order = 0;
    if($("#channel_led_display_work_yes").is(":checked")){
        if($("#channel_led_display_work_type01").is(":checked"))           custom_order = 0.3;
        else if($("#channel_led_display_work_type02").is(":checked"))      custom_order = 0.2;
        else if($("#channel_led_display_work_type03").is(":checked")) custom_order = 0.4;
        else if($("#channel_led_display_work_type04").is(":checked")) custom_order = 0.3;
        else if($("#channel_led_display_work_type05").is(":checked")) custom_order = 0.5;
        else if($("#channel_led_display_work_type06").is(":checked")) custom_order = 0.3;
    }

    var _ledCnt = parseInt($(".channel_led_count td span").text()) || 0;
    var led_price = 0;
    var qty = Number($("#channel_content").val()) || 0;

    var isNewLedOpt = ($("#channel_option02").is(":checked") || $("#channel_option06").is(":checked") || $("#channel_option07").is(":checked"));
    if(isNewLedOpt) {
        // 신형(갈바/스텐/티타늄): 전광·후광 각각 input에서 개수 읽기, 없으면 크기 추정값
        var _estCnt = _chGetLedCount() || 0;
        var _jeonCnt = parseInt($("#ch_led_jeon_count").val());
        if(isNaN(_jeonCnt) || _jeonCnt < 0) _jeonCnt = _estCnt;
        var _huCnt = parseInt($("#ch_led_hu_count").val());
        if(isNaN(_huCnt) || _huCnt < 0) _huCnt = _estCnt;

        // 전광 LED (1세트 기준)
        if($("#channel_led_jeon_yes").is(":checked")) {
            var _jU = 0;
            if($("#channel_led_jeon_white").is(":checked"))       _jU = PRICES.ch_led_white;
            else if($("#channel_led_jeon_warm").is(":checked"))   _jU = PRICES.ch_led_warm;
            else if($("#channel_led_jeon_rgb").is(":checked"))    _jU = PRICES.ch_led_rgb;
            else if($("#channel_led_jeon_panorama").is(":checked"))_jU = PRICES.ch_led_panorama;
            else if($("#channel_led_jeon_red,#channel_led_jeon_blue,#channel_led_jeon_green").is(":checked")) _jU = PRICES.ch_led_color;
            led_price += _jU * _jeonCnt + (PRICES.ch_led_pos_jeon || 0);
        }
        // 후광 LED (1세트 기준)
        if($("#channel_led_hu_yes").is(":checked")) {
            var _hU = 0;
            if($("#channel_led_hu_white").is(":checked"))       _hU = PRICES.ch_led_white;
            else if($("#channel_led_hu_warm").is(":checked"))   _hU = PRICES.ch_led_warm;
            else if($("#channel_led_hu_rgb").is(":checked"))    _hU = PRICES.ch_led_rgb;
            else if($("#channel_led_hu_panorama").is(":checked"))_hU = PRICES.ch_led_panorama;
            else if($("#channel_led_hu_red,#channel_led_hu_blue,#channel_led_hu_green").is(":checked")) _hU = PRICES.ch_led_color;
            led_price += _hU * _huCnt + (PRICES.ch_led_pos_hu || 0);
        }
    } else {
        if($("#channel_led_color_white").is(":checked"))         led_price = PRICES.ch_led_white * _ledCnt;
        else if($("#channel_led_color_wram").is(":checked"))     led_price = PRICES.ch_led_warm  * _ledCnt;
        else if($("#channel_led_color_rgb").is(":checked"))      led_price = PRICES.ch_led_rgb   * _ledCnt;
        else if($("#channel_led_color_panorama").is(":checked")) led_price = PRICES.ch_led_panorama * _ledCnt;
        else if($("#channel_led_color_red,#channel_led_color_blue,#channel_led_color_green").is(":checked")) led_price = PRICES.ch_led_color * _ledCnt;
    }

    // 1.3배 적용 — 갈바/스텐(레이저 타공 제외)·티타늄골드에만
    var _galvaSubId = $("input[name='channel_galva_type']:checked").attr("id") || "";
    var _stenSubId  = $("input[name='channel_sten_type']:checked").attr("id")  || "";
    var _apply13x = (
        ($("#channel_option02").is(":checked") && _galvaSubId !== "channel_galva_laser") ||
        ($("#channel_option06").is(":checked") && _stenSubId  !== "channel_sten_laser")  ||
        $("#channel_option07").is(":checked")
    );
    _lastChBaseUnitOrig = chennel_width;
    _lastCh13x = _apply13x;
    if (_apply13x) chennel_width = Math.ceil(chennel_width * 1.3 / 5000) * 5000;

    // (1세트 단가 + LED) × 수량 → 수량이 전체 금액에 곱해짐
    var _unitPrice = (chennel_width + chennel_width * custom_order) + led_price;
    var _basePrice = Math.floor(_unitPrice * qty);
    _lastChBaseUnit = chennel_width;
    _lastChCustomOrder = custom_order;
    if($("#channel_solid_color_none").is(":checked")) return Math.floor(_basePrice * 1.006);
    return _basePrice;
}

// ── 담기 버튼: 현재 폼 항목을 _chItems에 추가 ──────────────────
function addChannelItem() {
    var qty = Number($("#channel_content").val()) || 0;
    if(qty <= 0) { alert("수량을 입력해주세요."); return; }

    var price = _getChCurrentItemPrice(); // 호출 후 _lastChBaseUnit, _lastChCustomOrder 세팅됨
    if(price <= 0) { alert("크기 또는 문자형태를 선택해주세요."); return; }

    applyPrices();

    // 컴포넌트 텍스트 수집
    var _channelTypeName = $("input[name='channel_option']:checked").parent("label").text().trim() || "채널문자";
    var _sizeText        = $("input[name='channel_size']:checked").parent("label").text().trim();
    var _textFormText    = $("input[name='channel_text_form']:checked").parent("label").text().trim();
    var _trimColorText   = $("input[name='channel_trim_color']:checked").parent("label").text().trim();
    var _solidColorText  = $("input[name='channel_solid_color']:checked").parent("label").text().trim();
    var _dispWorkName    = "";
    if($("#channel_led_display_work_yes").is(":checked")){
        _dispWorkName = $("input[name='channel_led_display_work_type']:checked").parent("label").text().trim();
    }

    var _ledCntNum = parseInt($(".channel_led_count td span").text()) || 0;
    var _isNewLedOpt = ($("#channel_option02").is(":checked") || $("#channel_option06").is(":checked") || $("#channel_option07").is(":checked"));
    // 신형(갈바/스텐): 전광/후광 분리
    var _jeonColorText = '', _jeonLedPrice = 0, _jeonLedCntNum = 0;
    var _huColorText = '', _huLedPrice = 0, _huLedCntNum = 0;
    // 구형: 단일 LED
    var _ledColorText = '', _ledUnitP = 0, _ledPriceNum = 0;
    if(_isNewLedOpt) {
        // 신형: input에서 개수 읽기, 없으면 크기 추정값
        var _estCntNum = _chGetLedCount() || 0;
        if($("#channel_led_jeon_yes").is(":checked")){
            _jeonColorText = $("input[name='channel_led_jeon_color']:checked").parent("label").text().trim();
            _jeonLedCntNum = parseInt($("#ch_led_jeon_count").val());
            if(isNaN(_jeonLedCntNum) || _jeonLedCntNum < 0) _jeonLedCntNum = _estCntNum;
            var _jU2 = 0;
            if($("#channel_led_jeon_white").is(":checked"))        _jU2 = PRICES.ch_led_white;
            else if($("#channel_led_jeon_warm").is(":checked"))    _jU2 = PRICES.ch_led_warm;
            else if($("#channel_led_jeon_rgb").is(":checked"))     _jU2 = PRICES.ch_led_rgb;
            else if($("#channel_led_jeon_panorama").is(":checked"))_jU2 = PRICES.ch_led_panorama;
            else if($("#channel_led_jeon_red,#channel_led_jeon_blue,#channel_led_jeon_green").is(":checked")) _jU2 = PRICES.ch_led_color;
            _jeonLedPrice = _jU2 * _jeonLedCntNum + (PRICES.ch_led_pos_jeon || 0);
        }
        if($("#channel_led_hu_yes").is(":checked")){
            _huColorText = $("input[name='channel_led_hu_color']:checked").parent("label").text().trim();
            _huLedCntNum = parseInt($("#ch_led_hu_count").val());
            if(isNaN(_huLedCntNum) || _huLedCntNum < 0) _huLedCntNum = _estCntNum;
            var _hU2 = 0;
            if($("#channel_led_hu_white").is(":checked"))        _hU2 = PRICES.ch_led_white;
            else if($("#channel_led_hu_warm").is(":checked"))    _hU2 = PRICES.ch_led_warm;
            else if($("#channel_led_hu_rgb").is(":checked"))     _hU2 = PRICES.ch_led_rgb;
            else if($("#channel_led_hu_panorama").is(":checked"))_hU2 = PRICES.ch_led_panorama;
            else if($("#channel_led_hu_red,#channel_led_hu_blue,#channel_led_hu_green").is(":checked")) _hU2 = PRICES.ch_led_color;
            _huLedPrice = _hU2 * _huLedCntNum + (PRICES.ch_led_pos_hu || 0);
        }
    } else {
        if(!$("#channel_led_color_none").is(":checked")){
            _ledColorText = $("input[name='channel_led_color']:checked").parent("label").text();
            if($("#channel_led_color_white").is(":checked"))        _ledUnitP = PRICES.ch_led_white;
            else if($("#channel_led_color_wram").is(":checked"))    _ledUnitP = PRICES.ch_led_warm;
            else if($("#channel_led_color_rgb").is(":checked"))     _ledUnitP = PRICES.ch_led_rgb;
            else if($("#channel_led_color_panorama").is(":checked"))_ledUnitP = PRICES.ch_led_panorama;
            else if($("#channel_led_color_red,#channel_led_color_blue,#channel_led_color_green").is(":checked")) _ledUnitP = PRICES.ch_led_color;
        }
        _ledPriceNum = _ledUnitP * _ledCntNum;
    }
    // 갈바/스텐 서브타입
    var _galvaStenSubText = '';
    if($("#channel_option02").is(":checked")) _galvaStenSubText = $("input[name='channel_galva_type']:checked").parent("label").text().trim();
    else if($("#channel_option06").is(":checked")) _galvaStenSubText = $("input[name='channel_sten_type']:checked").parent("label").text().trim();

    // UI 표시용 라벨
    var label = _channelTypeName;
    if(_galvaStenSubText) label += " [" + _galvaStenSubText + "]";
    label += " " + _sizeText;
    label += " / 수량: " + qty + "개";
    label += " / 문자형태: " + _textFormText;
    if(_trimColorText)  label += " / 트림: " + _trimColorText;
    if(_solidColorText) label += " / 입체: " + _solidColorText;
    if(_jeonColorText)  label += " / 전광: " + _jeonColorText + " " + _jeonLedCntNum + "개";
    if(_huColorText)    label += " / 후광: " + _huColorText + " " + _huLedCntNum + "개";
    if(_ledColorText && _ledCntNum > 0) label += " / LED: " + _ledColorText + " " + _ledCntNum + "개";
    else if(_ledColorText)              label += " / LED: " + _ledColorText;
    if(_dispWorkName)   label += " / 화면작업: " + _dispWorkName;

    var _detail = $.trim($("#ch_item_detail").val());
    _chItems.push({
        label: label, detail: _detail, price: price,
        channelTypeName: _channelTypeName, sizeText: _sizeText,
        textFormText: _textFormText, trimColorText: _trimColorText,
        solidColorText: _solidColorText, dispWorkName: _dispWorkName,
        qty: qty, baseUnit: _lastChBaseUnit, customOrder: _lastChCustomOrder,
        ledColor: _ledColorText, ledCnt: _ledCntNum, ledUnit: _ledUnitP, ledPrice: _ledPriceNum,
        jeonColor: _jeonColorText, huColor: _huColorText,
        jeonLedPrice: _jeonLedPrice, huLedPrice: _huLedPrice,
        jeonLedCnt: _jeonLedCntNum, huLedCnt: _huLedCntNum,
        galvaStenSubText: _galvaStenSubText,
        is13x: _lastCh13x, baseUnitOrig: _lastChBaseUnitOrig
    });
    $("#ch_item_detail").val('');
    renderChItems();
    chnnel_taka_cal();
}

// ── 담긴 항목 렌더링 ─────────────────────────────────────────
function renderChItems() {
    var $area = $("#ch_items_area");
    if(!$area.length) return;
    var fmt = function(n){ return String(_r10(n)).replace(/\B(?=(\d{3})+(?!\d))/g,","); };

    if(_chItems.length === 0) {
        $area.html("<p class='ch-items-empty'>담긴 항목이 없습니다. 옵션 선택 후 담기 버튼을 눌러주세요.</p>");
        return;
    }
    var html = "<ul class='ch-items-list'>";
    $.each(_chItems, function(i, item) {
        var _detailHtml = item.detail ? "<span class='ch-items-detail'>" + item.detail + "</span>" : "";
        html += "<li class='ch-items-item'>" +
            "<span class='ch-items-idx'>" + (i+1) + "</span>" +
            "<span class='ch-items-label'>" + item.label + _detailHtml + "</span>" +
            "<span class='ch-items-price'>" + fmt(item.price) + "원</span>" +
            "<button type='button' class='ch-items-remove' data-idx='" + i + "'>×</button>" +
            "</li>";
    });
    html += "</ul>";
    $area.html(html);
    $area.find(".ch-items-remove").click(function(){
        var idx = parseInt($(this).data("idx"));
        _chItems.splice(idx, 1);
        renderChItems();
        chnnel_taka_cal();
    });
}

// 트러스바 계산: 5000mm 미만 정액 / 5000mm 이상 m당 단가
function _calcTrusbar() {
    var mm = nv("#channel_trusbar_width") || 0;
    if ($("#channel_trusbar05").is(":checked")) {
        return { price: nv("#channel_trusbar_custom_price") || 0, pok: "", isCustom: true };
    }
    var pok = "", fixedPrice = 0, ratePerM = 0;
    if      ($("#channel_trusbar00").is(":checked")) { pok = "150폭"; fixedPrice = 150000; ratePerM = 30000; }
    else if ($("#channel_trusbar01").is(":checked")) { pok = "200폭"; fixedPrice = 150000; ratePerM = 30000; }
    else if ($("#channel_trusbar02").is(":checked")) { pok = "250폭"; fixedPrice = 200000; ratePerM = 40000; }
    else if ($("#channel_trusbar03").is(":checked")) { pok = "300폭"; fixedPrice = 200000; ratePerM = 40000; }
    else if ($("#channel_trusbar04").is(":checked")) { pok = "400폭"; fixedPrice = 350000; ratePerM = 70000; }
    if (!pok || mm <= 0) return { price: 0, pok: pok, mm: mm, isFixed: true, isCustom: false, ratePerM: 0 };
    var isFixed = mm < 5000;
    var price = isFixed ? fixedPrice : Math.floor(mm / 1000 * ratePerM);
    return { price: price, pok: pok, mm: mm, isFixed: isFixed, isCustom: false, ratePerM: ratePerM };
}

function chnnel_taka_cal(){ //채널 타카 계산
    applyPrices(); // 단가 패널 최신값을 PRICES에 반영
    var trusbar_price = 0;
    var ggachi_price = 0;
    var complete_price = 0;

    trusbar_price = _calcTrusbar().price;

    if($("#channel_more_order_option01").is(":checked")){ //까치발 - 트러스바 폭 기준 단가 연동
        var _chGgUnit = PRICES.ch_ggachi_200; // 기본값
        if($("#channel_trusbar02").is(":checked"))      _chGgUnit = PRICES.ch_ggachi_250;
        else if($("#channel_trusbar03").is(":checked")) _chGgUnit = PRICES.ch_ggachi_300;
        else if($("#channel_trusbar04").is(":checked")) _chGgUnit = PRICES.ch_ggachi_400;
        ggachi_price = Number($("#channel_more_order_count").val()) * _chGgUnit;
    }

    if($("#channel_complete_normal").is(":checked"))        complete_price = 100000;
    else if($("#channel_complete_premium").is(":checked"))  complete_price = 150000;

    // 담긴 항목 합산
    var items_total = 0;
    $.each(_chItems, function(i, item){ items_total += item.price; });

    // 담기 버튼 예상 금액 업데이트
    var previewPrice = _getChCurrentItemPrice();
    var fmt = function(n){ return String(_r10(n)).replace(/\B(?=(\d{3})+(?!\d))/g,","); };
    $("#ch_item_preview").text(previewPrice > 0 ? fmt(previewPrice) + "원" : "-");

    var smps_price = (parseInt($("#ch_smps_qty").val()) || 0) * _getChSmpsUnit();
    var total = _r10(trusbar_price + ggachi_price + complete_price + items_total + smps_price + nv("#more_order_price"));
    $("#order_price").text(String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}
function whoorex(){ //후렉스
   setTimeout(function(){
	$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_type']").click(function(){
        $("#frame_product_width,#frame_product_vertical,#more_order_price,#add_more_text,#actual_punch_count").val("");
        $("#actual_punch01,#actual_more_order01").prop("checked",true);
   
        //초기 리셋
    	whoorex_cal();
         
    });
    $(".woosung_wrap .contents_wrap #option_table td input#frame_product_width,.woosung_wrap .contents_wrap #option_table td input#frame_product_vertical").bind("change keyup paste", function(){
    	whoorex_cal();
      
    });
    $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_punch'],.woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order']").click(function(){
    	whoorex_cal();
 
    });
    $(".woosung_wrap .contents_wrap #option_table td label input#frame_product_width,.woosung_wrap .contents_wrap #option_table td input#more_order_price").bind("change keyup paste", function(){
    	whoorex_cal();
    });
    $("#actual_quantity").bind("change keyup paste", function(){
    	whoorex_cal();
    });
   },500);
    
}
function whoorex_cal(){ //후렉스 계산
    
    
    var target_width = nv("#frame_product_width")/1000;
    var target_vertical = nv("#frame_product_vertical")/1000;
	var frequency_price = 0;
    var hole_price = 0;
    
   	var total_price = 0;
    
    if(target_vertical > 2.2){ //2.2 이상일때
    	 total_price = (target_width * target_vertical) * PRICES.flex_high_bright;
    }else{
        if($("#actual_type01").is(":checked")){
            if(target_vertical <= 1){
                total_price = (target_width * 1) * PRICES.flex_uv_double;
            }else{
                total_price = (target_width * target_vertical) * PRICES.flex_uv_double;
            }
        }else{
            if(target_vertical <= 1){
                total_price = (target_width * 1) * PRICES.flex_sol;
            }else{
                total_price = (target_width * target_vertical) * PRICES.flex_sol;
            }
        }
    }
    if($("#actual_punch02").is(":checked")){
        hole_price = (target_width * target_vertical) * PRICES.flex_punch;
    }

    if($("#actual_more_order02").is(":checked")){
    	frequency_price = target_width * PRICES.flex_freq;
    }else if($("#actual_more_order03").is(":checked")){
        frequency_price = ((target_width * 3) + (target_vertical * 2)) * PRICES.flex_freq;
    }

  
    var flex_qty = parseInt($("#actual_quantity").val()) || 1;
    var subtotal = (total_price + frequency_price + hole_price) * flex_qty;

    $(".order_info .right_area #order_price").text(String(_r10(subtotal + nv("#more_order_price"))).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}
function uv_silsa(){ //UV실사
	setTimeout(function(){
        $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_material']").click(function(){
            $("#frame_product_width,#frame_product_vertical,#actual_more_order_price,#more_order_price,#add_more_text,#actual_punch_count").val("");
            $("#actual_more_order01,#actual_material03_01").prop("checked",true);
          
            //초기 리셋
            uv_silsa_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td input#frame_product_width,.woosung_wrap .contents_wrap #option_table td input#frame_product_vertical").bind("change keyup paste", function(){
            uv_silsa_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_punch'],.woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order'],.woosung_wrap .contents_wrap #option_table td label input[name='actual_material03']").click(function(){
            uv_silsa_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td label input#frame_product_width,.woosung_wrap .contents_wrap #option_table td input#more_order_price,.woosung_wrap .contents_wrap #option_table td label input#frame_product_width,.woosung_wrap .contents_wrap #option_table td input#actual_more_order_price").bind("change keyup paste", function(){
            uv_silsa_cal();
        });
        $("#actual_quantity").bind("change keyup paste", function(){ uv_silsa_cal(); });
   },500);
}

function uv_silsa_cal(){ //UV실사 계산
    	
    var target_width = nv("#frame_product_width")/1000;
    var target_vertical = nv("#frame_product_vertical")/1000;
	var frequency_price = 0;
   	var total_price = 0;
    
  

    if($("#actual_material01").is(":checked")){ //LG 백색시트
        total_price = (target_width * target_vertical) * PRICES.uv_white;
    }else if($("#actual_material02").is(":checked")){ //LG 백색시트(그레이)
        total_price = (target_width * target_vertical) * PRICES.uv_white_grey;
    }else if($("#actual_material03").is(":checked")){ //LG 클리어(투명시트)
        if($("#actual_material03_01").is(":checked")){
            total_price = (target_width * target_vertical) * PRICES.uv_clear;
        }else if($("#actual_material03_02").is(":checked")){
            total_price = (target_width * target_vertical) * PRICES.uv_clear_mirror;
        }else if($("#actual_material03_03").is(":checked")){
            total_price = (target_width * target_vertical) * PRICES.uv_clear_black;
        }
    }else if($("#actual_material04").is(":checked")){ //타공 페트
        total_price = (target_width * target_vertical) * PRICES.uv_punch_pet;
    }else if($("#actual_material05").is(":checked")){ //LG 조명용 백색
        total_price = (target_width * target_vertical) * PRICES.uv_light_white;
    }else if($("#actual_material06").is(":checked")){ //엠보(안개 시트)
        total_price = (target_width * target_vertical) * PRICES.uv_embo;
    }

    if($("#actual_more_order02").is(":checked")){
        $("#actual_more_order_price").val(fmtNum(Math.floor((target_width * target_vertical) * PRICES.uv_cut))); //재단 가격 입력
	}else{
        $("#actual_more_order_price").val(0); //재단 가격 입력
    }
    var _aqty = parseInt($("#actual_quantity").val()) || 1;
    $("#order_price").text(String(_r10((total_price + nv("#actual_more_order_price")) * _aqty + nv("#more_order_price"))).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}

function solven_silsa(){ //솔벤실사
	setTimeout(function(){
        $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_material']").click(function(){
            $("#frame_product_width,#frame_product_vertical,#actual_more_order_price,#more_order_price,#add_more_text,#actual_punch_count").val("");
            $("#actual_more_order01").prop("checked",true);
          
            //초기 리셋
            solven_silsa_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td input#frame_product_width,.woosung_wrap .contents_wrap #option_table td input#frame_product_vertical").bind("change keyup paste", function(){
            solven_silsa_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order'],.woosung_wrap .contents_wrap #option_table td label input[name='actual_material03']").click(function(){
            solven_silsa_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td input#more_order_price").bind("change keyup paste", function(){
            solven_silsa_cal();
        });
        $("#actual_quantity").bind("change keyup paste", function(){ solven_silsa_cal(); });
   },500);
}

function solven_silsa_cal(){ //솔벤실사 계산
    	
    var target_width = nv("#frame_product_width")/1000;
    var target_vertical = nv("#frame_product_vertical")/1000;
	var frequency_price = 0;
   	var total_price = 0;
    
  

    if($("#actual_material01").is(":checked")){ //LG 백색시트
        total_price = (target_width * target_vertical) * PRICES.sol_white;
    }else if($("#actual_material02").is(":checked")){ //LG 백색시트(그레이)
        total_price = (target_width * target_vertical) * PRICES.sol_white_grey;
    }else if($("#actual_material03").is(":checked")){ //원웨이(타공)
        total_price = (target_width * target_vertical) * PRICES.sol_oneway;
    }else if($("#actual_material04").is(":checked")){ //LG 조명용 백색
        total_price = (target_width * target_vertical) * PRICES.sol_light_white;
    }else if($("#actual_material05").is(":checked")){ //엠보(안개시트)
        total_price = (target_width * target_vertical) * PRICES.sol_embo;
    }else if($("#actual_material06").is(":checked")){ //고휘도반사
        total_price = (target_width * target_vertical) * PRICES.sol_high_reflect;
    }else if($("#actual_material07").is(":checked")){ //솔벤현수막
        total_price = (target_width * target_vertical) * PRICES.sol_banner;
    }

    if($("#actual_more_order02").is(":checked")){
        $("#actual_more_order_price").val(fmtNum(Math.floor((target_width * target_vertical) * PRICES.sol_cut))); //재단 가격 입력
	}else if($("#actual_more_order03").is(":checked")){
        $("#actual_more_order_price").val(fmtNum(Math.floor((target_width * target_vertical) * PRICES.sol_coat))); //코팅 가격 입력
	}else{
        $("#actual_more_order_price").val(0); //재단 & 코팅 미포함
    }
    var _aqty = parseInt($("#actual_quantity").val()) || 1;
    $("#order_price").text(String(_r10((total_price + nv("#actual_more_order_price")) * _aqty + nv("#more_order_price"))).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}

function soosung_silsa(){ //수성실사
	setTimeout(function(){
        $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_material']").click(function(){
            $("#frame_product_width,#frame_product_vertical,#actual_more_order_price,#more_order_price,#add_more_text").val("");
            $("#actual_more_order01,#actual_more_order_mising01").prop("checked",true);
          
            //초기 리셋
            soosung_silsa_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td input#frame_product_width,.woosung_wrap .contents_wrap #option_table td input#frame_product_vertical").bind("change keyup paste", function(){
            soosung_silsa_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order'],.woosung_wrap .contents_wrap #option_table td label input[name='actual_material03'],.woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order_mising']").click(function(){
            soosung_silsa_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td input#more_order_price").bind("change keyup paste", function(){
            soosung_silsa_cal();
        });
        $("#actual_quantity").bind("change keyup paste", function(){ soosung_silsa_cal(); });
   },500);
}

function soosung_silsa_cal(){ //수성실사 계산
    	
    var target_width = nv("#frame_product_width")/1000;
    var target_vertical = nv("#frame_product_vertical")/1000;
	var frequency_price = 0;
   	var total_price = 0;
    
  
	if(target_width != 0 && target_vertical != 0){
        if($("#actual_material01").is(":checked")){ //현수막
            if(target_vertical <= 0.9){
                if(target_width < 3){
                    total_price = target_width * 2000;
                }else if(target_width <= 4){
                    total_price = 7000;
                }else{
                    total_price = target_width * 2000;
                }
            }else if(target_vertical <= 1.1){
                if(target_width < 3){
                    total_price = target_width * 3000;
                }else if(target_width <= 4){
                    total_price = 10000;
                }else{
                    total_price = target_width * 3000;
                }
            }else if(target_vertical <= 1.27){
                if(target_width < 3){
                    total_price = target_width * 4000;
                }else if(target_width <= 4){
                    total_price = 12000;
                }else{
                    total_price = target_width * 4000;
                }
            }else if(target_vertical <= 1.5){
                if(target_width < 3){
                    total_price = target_width * 5000;
                }else if(target_width <= 4){
                    total_price = 15000;
                }else{
                    total_price = target_width * 5000;
                }
            }else if(target_vertical <= 1.8){
                total_price = target_width * target_vertical * 4000;
            }else{
                total_price = target_width * target_vertical * 5000;
            }
        }else if($("#actual_material02").is(":checked")){ //켈(백색)
            total_price = (target_width * target_vertical) * 10000;
        }else if($("#actual_material03").is(":checked")){ //켈(그레이)
            total_price = (target_width * target_vertical) * 10000;
        }else if($("#actual_material04").is(":checked")){ //유포(백색)
            total_price = (target_width * target_vertical) * 8000;
        }else if($("#actual_material05").is(":checked")){ //유포(그레이)
            total_price = (target_width * target_vertical) * 8000;
        }else if($("#actual_material06").is(":checked")){ //페트
      
            if(target_width <= 0.6 && target_vertical <= 1.8){
                total_price = 10000;
            }else{
                total_price = (target_width * target_vertical) * 10000;
            }

        }else if($("#actual_material07").is(":checked")){ //백릿
            total_price = (target_width * target_vertical) * 13000;
        }
 	}
    	console.log(total_price);
    if($("#actual_material01").is(":checked")){
        if(target_vertical >= 1.8){
             if($("#actual_more_order_mising06").is(":checked") || $("#actual_more_order_mising07").is(":checked")){
                  $("#actual_more_order_price").val(fmtNum(Math.floor(target_width * target_vertical * 1000)));
			 }else{
                $("#actual_more_order_price").val(0); //서비스
        	}

         }else{
           if($("#actual_more_order01").is(":checked")){
           	 	$("#actual_more_order_price").val(0); //재단 없음
            }else if($("#actual_more_order05").is(":checked")){
                $("#actual_more_order_price").val(fmtNum(Math.floor(target_width * 1000))); //사방 미싱
            }else{
                 $("#actual_more_order_price").val(0); //재단,아일렛 펀칭,미싱 서비스
            }
    	}

     }else{
         if($("#actual_more_order02").is(":checked")){
            $("#actual_more_order_price").val(fmtNum(Math.floor((target_width * target_vertical) * 2000))); //재단 가격 입력
        }else if($("#actual_more_order03").is(":checked")){
            $("#actual_more_order_price").val(0); //아일렛 펀칭 가격 입력
        }else{
            $("#actual_more_order_price").val(0); //재단 & 코팅 미포함
        }
         
     }

  
    var _aqty = parseInt($("#actual_quantity").val()) || 1;
    $("#order_price").text(String(_r10((total_price + nv("#actual_more_order_price")) * _aqty + nv("#more_order_price"))).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}

function skasi_gomoo(){ //스카시 고무 계산
	setTimeout(function(){
        $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_option']").click(function(){
            $("#skasicolor_count,#skasi_color02,#skasi_width,#more_order_price,#add_more_text").val("");
            $("#skasi_text_form01,#skasi_thumb01,#skasicolor_type01,#skasi_screen_color01").prop("checked",true);
          
            //초기 리셋
            skasi_gomoo_cal();

        });
        $("#skasicolor_count,#skasi_color02,#skasi_width,#more_order_price,#add_more_text").bind("change keyup paste", function(){
            skasi_gomoo_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_text_form'],.woosung_wrap .contents_wrap #option_table td label input[name='skasi_thumb'],.woosung_wrap .contents_wrap #option_table td label input[name='skasicolor_type'],.woosung_wrap .contents_wrap #option_table td label input[name='skasi_screen_color']").click(function(){
            skasi_gomoo_cal();

        });
   },500);
}

function skasi_gomoo_cal(){ //스카시 고무 계산
   
    var total_count = $("#skasicolor_count").val(); //총 글자수
    var seat_count = $("#skasi_screen_color_count").val(); // 시트지 글자수
    var skasi_width = $("#skasi_width").val(); // 스카시 각수
	var price = 0; //단가
    
    if($("#skasi_thumb01").is(":checked")){ // 10~30T
        if($("#skasicolor_type01").is(":checked")){ //알루미늄 색상 - 일반
			if(skasi_width == 10){  // 각수
                price = 2000;
            }else if(skasi_width == 15){
            	price = 2500;
            }else if(skasi_width == 20){
            	price = 3000;
            }else if(skasi_width == 25){
            	price = 3500;
            }else if(skasi_width == 30){
                price = 4000;	
            }else if(skasi_width == 35){
                price = 5400;
            }else if(skasi_width == 40){
                price = 7100;
            }else if(skasi_width == 45){
                price = 9000;
            }else if(skasi_width == 50){
                price = 11000;
            }else if(skasi_width == 55){
                price = 13400;
            }else if(skasi_width == 60){
                price = 16000;
            }else if(skasi_width == 65){
                price = 18700;
            }else if(skasi_width == 70){
                price = 21700;
            }else if(skasi_width == 75){
                price = 25000;
            }else if(skasi_width == 80){
                price = 28400;
            }else if(skasi_width == 85){
                price = 32100;
            }else if(skasi_width == 90){
                price = 36000;
            }else if(skasi_width == 95){
                price = 40100;
            }else if(skasi_width == 100){
                price = 44400;
            }else if(skasi_width == 105){
                price = 49000;
            }else if(skasi_width == 110){
                price = 53700;
            }else if(skasi_width == 115){
                price = 58700;
            }else if(skasi_width == 120){
                price = 64000;
            }else if(skasi_width == 125){
                price = 69400;
            }else if(skasi_width == 130){
                price = 75100;
            }else if(skasi_width == 135){
                price = 81000;
            }else if(skasi_width == 140){
                price = 87000;
            }else if(skasi_width == 145){
                price = 93400;
            }else if(skasi_width == 150){
                price = 100000;
            }
        }else if($("#skasicolor_type02").is(":checked")){ //알루미늄 색상 - 수입 (금 / 은색)
            if(skasi_width == 10){  // 각수
                    price = 3000;
                }else if(skasi_width == 15){
                    price = 4000;
                }else if(skasi_width == 20){
                    price = 5000;
                }else if(skasi_width == 25){
                    price = 6000;
                }else if(skasi_width == 30){
                    price = 7000;	
                }else if(skasi_width == 35){
                    price = 9500;
                }else if(skasi_width == 40){
                    price = 12400;
                }else if(skasi_width == 45){
                    price = 15700;
                }else if(skasi_width == 50){
                    price = 19400;
                }else if(skasi_width == 55){
                    price = 23500;
                }else if(skasi_width == 60){
                    price = 28000;
                }else if(skasi_width == 65){
                    price = 32800;
                }else if(skasi_width == 70){
                    price = 38100;
                }else if(skasi_width == 75){
                    price = 43700;
                }else if(skasi_width == 80){
                    price = 49700;
                }else if(skasi_width == 85){
                    price = 56100;
                }else if(skasi_width == 90){
                    price = 63000;
                }else if(skasi_width == 95){
                    price = 70100;
                }else if(skasi_width == 100){
                    price = 77700;
                }else if(skasi_width == 105){
                    price = 85700;
                }else if(skasi_width == 110){
                    price = 94100;
                }else if(skasi_width == 115){
                    price = 102800;
                }else if(skasi_width == 120){
                    price = 112000;
                }else if(skasi_width == 125){
                    price = 121500;
                }else if(skasi_width == 130){
                    price = 131400;
                }else if(skasi_width == 135){
                    price = 141700;
                }else if(skasi_width == 140){
                    price = 152400;
                }else if(skasi_width == 145){
                    price = 163500;
                }else if(skasi_width == 150){
                    price = 175000;
                }
        }
    }else if($("#skasi_thumb02").is(":checked")){ // 50T
        if($("#skasicolor_type01").is(":checked")){ //알루미늄 색상 - 일반
           if(skasi_width == 10){  // 각수
                price = 2500;
            }else if(skasi_width == 15){
            	price = 3000;
            }else if(skasi_width == 20){
            	price = 3700;
            }else if(skasi_width == 25){
            	price = 4500;
            }else if(skasi_width == 30){
                price = 5000;	
            }else if(skasi_width == 35){
                price = 6800;
            }else if(skasi_width == 40){
                price = 8800;
            }else if(skasi_width == 45){
                price = 11200;
            }else if(skasi_width == 50){
                price = 13800;
            }else if(skasi_width == 55){
                price = 16800;
            }else if(skasi_width == 60){
                price = 20000;
            }else if(skasi_width == 65){
                price = 23400;
            }else if(skasi_width == 70){
                price = 27200;
            }else if(skasi_width == 75){
                price = 31200;
            }else if(skasi_width == 80){
                price = 35500;
            }else if(skasi_width == 85){
                price = 40100;
            }else if(skasi_width == 90){
                price = 45000;
            }else if(skasi_width == 95){
                price = 50100;
            }else if(skasi_width == 100){
                price = 55500;
            }else if(skasi_width == 105){
                price = 61200;
            }else if(skasi_width == 110){
                price = 67200;
            }else if(skasi_width == 115){
                price = 73400;
            }else if(skasi_width == 120){
                price = 80000;
            }else if(skasi_width == 125){
                price = 86800;
            }else if(skasi_width == 130){
                price = 93800;
            }else if(skasi_width == 135){
                price = 101200;
            }else if(skasi_width == 140){
                price = 108800;
            }else if(skasi_width == 145){
                price = 116800;
            }else if(skasi_width == 150){
                price = 125000;
            }
        }else if($("#skasicolor_type02").is(":checked")){ //알루미늄 색상 - 수입 (금 / 은색)
        	if(skasi_width == 10){  // 각수
                    price = 4000;
                }else if(skasi_width == 15){
                    price = 5000;
                }else if(skasi_width == 20){
                    price = 6000;
                }else if(skasi_width == 25){
                    price = 7000;
                }else if(skasi_width == 30){
                    price = 8000;	
                }else if(skasi_width == 35){
                    price = 10800;
                }else if(skasi_width == 40){
                    price = 14200;
                }else if(skasi_width == 45){
                    price = 18000;
                }else if(skasi_width == 50){
                    price = 22200;
                }else if(skasi_width == 55){
                    price = 26800;
                }else if(skasi_width == 60){
                    price = 32000;
                }else if(skasi_width == 65){
                    price = 37500;
                }else if(skasi_width == 70){
                    price = 43500;
                }else if(skasi_width == 75){
                    price = 50000;
                }else if(skasi_width == 80){
                    price = 56800;
                }else if(skasi_width == 85){
                    price = 64200;
                }else if(skasi_width == 90){
                    price = 72000;
                }else if(skasi_width == 95){
                    price = 80200;
                }else if(skasi_width == 100){
                    price = 88800;
                }else if(skasi_width == 105){
                    price = 98000;
                }else if(skasi_width == 110){
                    price = 107500;
                }else if(skasi_width == 115){
                    price = 117500;
                }else if(skasi_width == 120){
                    price = 128000;
                }else if(skasi_width == 125){
                    price = 138800;
                }else if(skasi_width == 130){
                    price = 150200;
                }else if(skasi_width == 135){
                    price = 162000;
                }else if(skasi_width == 140){
                    price = 174200;
                }else if(skasi_width == 145){
                    price = 186800;
                }else if(skasi_width == 150){
                    price = 200000;
                }
        }
     }
    if($("#skasi_screen_color01").is(":checked")){
       	price = price;
    }else{
        price = price * 1.5;
    }

	$("#order_price").text(String(_r10((total_count*price)+nv("#more_order_price"))).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    //console.log(Math.floor(total_price + nv("#actual_more_order_price") + nv("#more_order_price")));
}

function skasi_acrylic(){ //스카시 아크릴 계산
	setTimeout(function(){
        $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_option']").click(function(){
            $("#skasi_color01,#skasi_width,#more_order_price,#add_more_text,#skasi_screen_color_count").val("");
            $("#skasi_acrylic01,#skasi_text_form01,#skasi_thumb01,#skasi_screen_color01").prop("checked",true);
          
            //초기 리셋
            skasi_acrylic_cal();

        });
        $("#skasi_color01,#skasi_width,#more_order_price,#add_more_text,#skasi_screen_color_count,#skasi_acrylic_count").bind("change keyup paste", function(){
            skasi_acrylic_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_acrylic'],.woosung_wrap .contents_wrap #option_table td label input[name='skasi_acrylic'],.woosung_wrap .contents_wrap #option_table td label input[name='skasi_thumb'],.woosung_wrap .contents_wrap #option_table td label input[name='skasi_screen_color']").click(function(){
            skasi_acrylic_cal();

        });
   },500);
}

function skasi_acrylic_cal(){ //스카시 아크릴 계산
    
   	var total_count = $("#skasi_acrylic_count").val(); //총 글자수
    var skasi_width = $("#skasi_width").val(); // 스카시 각수
	var price = 0; //단가
    var total_price = 0; //총 금액
    
    if($("#skasi_text_form01").is(":checked")){ //한글
        if($("#skasi_thumb01").is(":checked")){ //2~3T
            if(skasi_width ==  30){ //각수
               	price = 400;
            }else if(skasi_width == 40){ 
           		price = 500;
            }else if(skasi_width == 50){ 
            	price = 600;
            }else if(skasi_width == 60){ 
            	price = 700;
            }else if(skasi_width == 70){ 
            	price = 900;
            }else if(skasi_width == 80){ 
            	price = 1000;
            }else if(skasi_width == 90){ 
            	price = 1100;
            }else if(skasi_width == 100){ 
            	price = 1400;
            }else if(skasi_width == 110){ 
            	price = 1500;
            }else if(skasi_width == 120){ 
            	price = 1700;
            }else if(skasi_width == 130){ 
            	price = 1800;
            }else if(skasi_width == 140){ 
            	price = 2000;
            }else if(skasi_width == 150){ 
            	price = 2100;
            }else if(skasi_width == 160){ 
            	price = 2500;
            }else if(skasi_width == 170){ 
            	price = 2600;
            }else if(skasi_width == 180){ 
            	price = 2700;
            }else if(skasi_width == 190){ 
            	price = 3000;
            }else if(skasi_width == 200){ 
            	price = 3200;
            }else if(skasi_width == 210){ 
            	price = 3400;
            }else if(skasi_width == 220){ 
            	price = 3600;
            }else if(skasi_width == 230){ 
            	price = 3800;
            }else if(skasi_width == 240){ 
            	price = 4100;
            }else if(skasi_width == 250){ 
            	price = 4400;
            }else if(skasi_width == 260){ 
            	price = 4600;
            }else if(skasi_width == 270){ 
            	price = 4900;
            }else if(skasi_width == 280){ 
            	price = 5200;
            }else if(skasi_width == 290){ 
            	price = 5400;
            }else if(skasi_width == 300){ 
            	price = 5700;
            }else if(skasi_width == 310){ 
            	price = 5900;
            }else if(skasi_width == 320){ 
            	price = 6300;
            }else if(skasi_width == 330){ 
            	price = 6600;
            }else if(skasi_width == 340){ 
            	price = 7100;
            }else if(skasi_width == 350){ 
            	price = 7500;
            }else if(skasi_width == 360){ 
            	price = 7900;
            }else if(skasi_width == 370){ 
            	price = 8200;
            }else if(skasi_width == 380){ 
            	price = 8600;
            }else if(skasi_width == 390){ 
            	price = 9000;
            }else if(skasi_width == 400){ 
            	price = 9500;
            }
        }else if($("#skasi_thumb02").is(":checked")){ //5T
        	  if(skasi_width ==  30){ //각수
               	price = 600;
            }else if(skasi_width == 40){ 
           		price = 700;
            }else if(skasi_width == 50){ 
            	price = 900;
            }else if(skasi_width == 60){ 
            	price = 1000;
            }else if(skasi_width == 70){ 
            	price = 1200;
            }else if(skasi_width == 80){ 
            	price = 1500;
            }else if(skasi_width == 90){ 
            	price = 1800;
            }else if(skasi_width == 100){ 
            	price = 1900;
            }else if(skasi_width == 110){ 
            	price = 2100;
            }else if(skasi_width == 120){ 
            	price = 2500;
            }else if(skasi_width == 130){ 
            	price = 2700;
            }else if(skasi_width == 140){ 
            	price = 3000;
            }else if(skasi_width == 150){ 
            	price = 3200;
            }else if(skasi_width == 160){ 
            	price = 3400;
            }else if(skasi_width == 170){ 
            	price = 3800;
            }else if(skasi_width == 180){ 
            	price = 4100;
            }else if(skasi_width == 190){ 
            	price = 4400;
            }else if(skasi_width == 200){ 
            	price = 4700;
            }else if(skasi_width == 210){ 
            	price = 5000;
            }else if(skasi_width == 220){ 
            	price = 5400;
            }else if(skasi_width == 230){ 
            	price = 5700;
            }else if(skasi_width == 240){ 
            	price = 6000;
            }else if(skasi_width == 250){ 
            	price = 6400;
            }else if(skasi_width == 260){ 
            	price = 6900;
            }else if(skasi_width == 270){ 
            	price = 7200;
            }else if(skasi_width == 280){ 
            	price = 7500;
            }else if(skasi_width == 290){ 
            	price = 7700;
            }else if(skasi_width == 300){ 
            	price = 8000;
            }else if(skasi_width == 310){ 
            	price = 8500;
            }else if(skasi_width == 320){ 
            	price = 9000;
            }else if(skasi_width == 330){ 
            	price = 9600;
            }else if(skasi_width == 340){ 
            	price = 10100;
            }else if(skasi_width == 350){ 
            	price = 10600;
            }else if(skasi_width == 360){ 
            	price = 11100;
            }else if(skasi_width == 370){ 
            	price = 11700;
            }else if(skasi_width == 380){ 
            	price = 12200;
            }else if(skasi_width == 390){ 
            	price = 12700;
            }else if(skasi_width == 400){ 
            	price = 13000;
            }
           
        }else if($("#skasi_thumb03").is(":checked")){ //8T
        	if(skasi_width ==  30){ //각수
               	price = 900;
            }else if(skasi_width == 40){ 
           		price = 1200;
            }else if(skasi_width == 50){ 
            	price = 1500;
            }else if(skasi_width == 60){ 
            	price = 1900;
            }else if(skasi_width == 70){ 
            	price = 2300;
            }else if(skasi_width == 80){ 
            	price = 2600;
            }else if(skasi_width == 90){ 
            	price = 3000;
            }else if(skasi_width == 100){ 
            	price = 3300;
            }else if(skasi_width == 110){ 
            	price = 3700;
            }else if(skasi_width == 120){ 
            	price = 4100;
            }else if(skasi_width == 130){ 
            	price = 4600;
            }else if(skasi_width == 140){ 
            	price = 5000;
            }else if(skasi_width == 150){ 
            	price = 5400;
            }else if(skasi_width == 160){ 
            	price = 5900;
            }else if(skasi_width == 170){ 
            	price = 6400;
            }else if(skasi_width == 180){ 
            	price = 6900;
            }else if(skasi_width == 190){ 
            	price = 7300;
            }else if(skasi_width == 200){ 
            	price = 8000;
            }else if(skasi_width == 210){ 
            	price = 8600;
            }else if(skasi_width == 220){ 
            	price = 9000;
            }else if(skasi_width == 230){ 
            	price = 9600;
            }else if(skasi_width == 240){ 
            	price = 10100;
            }else if(skasi_width == 250){ 
            	price = 10800;
            }else if(skasi_width == 260){ 
            	price = 11200;
            }else if(skasi_width == 270){ 
            	price = 11800;
            }else if(skasi_width == 280){ 
            	price = 12400;
            }else if(skasi_width == 290){ 
            	price = 12900;
            }else if(skasi_width == 300){ 
            	price = 13500;
            }else if(skasi_width == 310){ 
            	price = 14200;
            }else if(skasi_width == 320){ 
            	price = 14900;
            }else if(skasi_width == 330){ 
            	price = 15500;
            }else if(skasi_width == 340){ 
            	price = 16200;
            }else if(skasi_width == 350){ 
            	price = 16800;
            }else if(skasi_width == 360){ 
            	price = 17400;
            }else if(skasi_width == 370){ 
            	price = 18100;
            }else if(skasi_width == 380){ 
            	price = 18800;
            }else if(skasi_width == 390){ 
            	price = 19400;
            }else if(skasi_width == 400){ 
            	price = 20000;
            }
        }else{ //10T
        	if(skasi_width ==  30){ //각수
               	price = 1400;
            }else if(skasi_width == 40){ 
           		price = 1900;
            }else if(skasi_width == 50){ 
            	price = 2600;
            }else if(skasi_width == 60){ 
            	price = 3000;
            }else if(skasi_width == 70){ 
            	price = 3400;
            }else if(skasi_width == 80){ 
            	price = 3800;
            }else if(skasi_width == 90){ 
            	price = 4500;
            }else if(skasi_width == 100){ 
            	price = 5200;
            }else if(skasi_width == 110){ 
            	price = 5700;
            }else if(skasi_width == 120){ 
            	price = 6400;
            }else if(skasi_width == 130){ 
            	price = 7100;
            }else if(skasi_width == 140){ 
            	price = 7700;
            }else if(skasi_width == 150){ 
            	price = 8400;
            }else if(skasi_width == 160){ 
            	price = 9000;
            }else if(skasi_width == 170){ 
            	price = 9700;
            }else if(skasi_width == 180){ 
            	price = 10300;
            }else if(skasi_width == 190){ 
            	price = 11700;
            }else if(skasi_width == 200){ 
            	price = 12300;
            }else if(skasi_width == 210){ 
            	price = 12900;
            }else if(skasi_width == 220){ 
            	price = 13500;
            }else if(skasi_width == 230){ 
            	price = 14200;
            }else if(skasi_width == 240){ 
            	price = 14900;
            }else if(skasi_width == 250){ 
            	price = 15500;
            }else if(skasi_width == 260){ 
            	price = 16300;
            }else if(skasi_width == 270){ 
            	price = 17400;
            }else if(skasi_width == 280){ 
            	price = 18100;
            }else if(skasi_width == 290){ 
            	price = 18800;
            }else if(skasi_width == 300){ 
            	price = 19400;
            }else if(skasi_width == 310){ 
            	price = 20000;
            }else if(skasi_width == 320){ 
            	price = 20700;
            }else if(skasi_width == 330){ 
            	price = 22000;
            }else if(skasi_width == 340){ 
            	price = 23300;
            }else if(skasi_width == 350){ 
            	price = 24600;
            }else if(skasi_width == 360){ 
            	price = 25900;
            }else if(skasi_width == 370){ 
            	price = 27100;
            }else if(skasi_width == 380){ 
            	price = 28500;
            }else if(skasi_width == 390){ 
            	price = 29700;
            }else if(skasi_width == 400){ 
            	price = 31000;
            }
        }
        
   }else{ //영문
      
   	if($("#skasi_thumb01").is(":checked")){ //2~3T
        
            if(skasi_width ==  30){ //각수
               	price = 300;
            }else if(skasi_width == 40){ 
           		price = 400;
            }else if(skasi_width == 50){ 
            	price = 500;
            }else if(skasi_width == 60){ 
            	price = 600;
            }else if(skasi_width == 70){ 
            	price = 700;
            }else if(skasi_width == 80){ 
            	price = 900;
            }else if(skasi_width == 90){ 
            	price = 1000;
            }else if(skasi_width == 100){ 
            	price = 1100;
            }else if(skasi_width == 110){ 
            	price = 1200;
            }else if(skasi_width == 120){ 
            	price = 1500;
            }else if(skasi_width == 130){ 
            	price = 1700;
            }else if(skasi_width == 140){ 
            	price = 1800;
            }else if(skasi_width == 150){ 
            	price = 1900;
            }else if(skasi_width == 160){ 
            	price = 2000;
            }else if(skasi_width == 170){ 
            	price = 2100;
            }else if(skasi_width == 180){ 
            	price = 2300;
            }else if(skasi_width == 190){ 
            	price = 2500;
            }else if(skasi_width == 200){ 
            	price = 2700;
            }else if(skasi_width == 210){ 
            	price = 2900;
            }else if(skasi_width == 220){ 
            	price = 3100;
            }else if(skasi_width == 230){ 
            	price = 3200;
            }else if(skasi_width == 240){ 
            	price = 3400;
            }else if(skasi_width == 250){ 
            	price = 3700;
            }else if(skasi_width == 260){ 
            	price = 3900;
            }else if(skasi_width == 270){ 
            	price = 4100;
            }else if(skasi_width == 280){ 
            	price = 4400;
            }else if(skasi_width == 290){ 
            	price = 4500;
            }else if(skasi_width == 300){ 
            	price = 4700;
            }else if(skasi_width == 310){ 
            	price = 4900;
            }else if(skasi_width == 320){ 
            	price = 5000;
            }else if(skasi_width == 330){ 
            	price = 5100;
            }else if(skasi_width == 340){ 
            	price = 5200;
            }else if(skasi_width == 350){ 
            	price = 5300;
            }else if(skasi_width == 360){ 
            	price = 5400;
            }else if(skasi_width == 370){ 
            	price = 5600;
            }else if(skasi_width == 380){ 
            	price = 5700;
            }else if(skasi_width == 390){ 
            	price = 5800;
            }else if(skasi_width == 400){ 
            	price = 5900;
            }
        }else if($("#skasi_thumb02").is(":checked")){ //5T
        	  if(skasi_width ==  30){ //각수
               	price = 500;
            }else if(skasi_width == 40){ 
           		price = 600;
            }else if(skasi_width == 50){ 
            	price = 700;
            }else if(skasi_width == 60){ 
            	price = 900;
            }else if(skasi_width == 70){ 
            	price = 1000;
            }else if(skasi_width == 80){ 
            	price = 1100;
            }else if(skasi_width == 90){ 
            	price = 1200;
            }else if(skasi_width == 100){ 
            	price = 1500;
            }else if(skasi_width == 110){ 
            	price = 1800;
            }else if(skasi_width == 120){ 
            	price = 1900;
            }else if(skasi_width == 130){ 
            	price = 2100;
            }else if(skasi_width == 140){ 
            	price = 2300;
            }else if(skasi_width == 150){ 
            	price = 2600;
            }else if(skasi_width == 160){ 
            	price = 2700;
            }else if(skasi_width == 170){ 
            	price = 3100;
            }else if(skasi_width == 180){ 
            	price = 3300;
            }else if(skasi_width == 190){ 
            	price = 3700;
            }else if(skasi_width == 200){ 
            	price = 3800;
            }else if(skasi_width == 210){ 
            	price = 4100;
            }else if(skasi_width == 220){ 
            	price = 4400;
            }else if(skasi_width == 230){ 
            	price = 4600;
            }else if(skasi_width == 240){ 
            	price = 5000;
            }else if(skasi_width == 250){ 
            	price = 5300;
            }else if(skasi_width == 260){ 
            	price = 5500;
            }else if(skasi_width == 270){ 
            	price = 5800;
            }else if(skasi_width == 280){ 
            	price = 6000;
            }else if(skasi_width == 290){ 
            	price = 6300;
            }else if(skasi_width == 300){ 
            	price = 6500;
            }else if(skasi_width == 310){ 
            	price = 6900;
            }else if(skasi_width == 320){ 
            	price = 7100;
            }else if(skasi_width == 330){ 
            	price = 7300;
            }else if(skasi_width == 340){ 
            	price = 7600;
            }else if(skasi_width == 350){ 
            	price = 7900;
            }else if(skasi_width == 360){ 
            	price = 8100;
            }else if(skasi_width == 370){ 
            	price = 8400;
            }else if(skasi_width == 380){ 
            	price = 8800;
            }else if(skasi_width == 390){ 
            	price = 9100;
            }else if(skasi_width == 400){ 
            	price = 9600;
            }
           
        }else if($("#skasi_thumb03").is(":checked")){ //8T
        	if(skasi_width ==  30){ //각수
               	price = 700;
            }else if(skasi_width == 40){ 
           		price = 900;
            }else if(skasi_width == 50){ 
            	price = 1100;
            }else if(skasi_width == 60){ 
            	price = 1400;
            }else if(skasi_width == 70){ 
            	price = 1800;
            }else if(skasi_width == 80){ 
            	price = 2000;
            }else if(skasi_width == 90){ 
            	price = 2300;
            }else if(skasi_width == 100){ 
            	price = 2600;
            }else if(skasi_width == 110){ 
            	price = 3000;
            }else if(skasi_width == 120){ 
            	price = 3300;
            }else if(skasi_width == 130){ 
            	price = 3600;
            }else if(skasi_width == 140){ 
            	price = 3900;
            }else if(skasi_width == 150){ 
            	price = 4400;
            }else if(skasi_width == 160){ 
            	price = 4700;
            }else if(skasi_width == 170){ 
            	price = 5200;
            }else if(skasi_width == 180){ 
            	price = 5500;
            }else if(skasi_width == 190){ 
            	price = 6000;
            }else if(skasi_width == 200){ 
            	price = 6400;
            }else if(skasi_width == 210){ 
            	price = 7000;
            }else if(skasi_width == 220){ 
            	price = 7300;
            }else if(skasi_width == 230){ 
            	price = 7900;
            }else if(skasi_width == 240){ 
            	price = 8400;
            }else if(skasi_width == 250){ 
            	price = 9000;
            }else if(skasi_width == 260){ 
            	price = 9500;
            }else if(skasi_width == 270){ 
            	price = 9900;
            }else if(skasi_width == 280){ 
            	price = 10300;
            }else if(skasi_width == 290){ 
            	price = 10800;
            }else if(skasi_width == 300){ 
            	price = 11100;
            }else if(skasi_width == 310){ 
            	price = 11500;
            }else if(skasi_width == 320){ 
            	price = 11800;
            }else if(skasi_width == 330){ 
            	price = 12300;
            }else if(skasi_width == 340){ 
            	price = 12700;
            }else if(skasi_width == 350){ 
            	price = 13000;
            }else if(skasi_width == 360){ 
            	price = 13500;
            }else if(skasi_width == 370){ 
            	price = 13800;
            }else if(skasi_width == 380){ 
            	price = 14200;
            }else if(skasi_width == 390){ 
            	price = 14600;
            }else if(skasi_width == 400){ 
            	price = 15000;
            }
        }else{ //10T
        	if(skasi_width ==  30){ //각수
               	price = 1100;
            }else if(skasi_width == 40){ 
           		price = 1500;
            }else if(skasi_width == 50){ 
            	price = 1900;
            }else if(skasi_width == 60){ 
            	price = 2100;
            }else if(skasi_width == 70){ 
            	price = 2600;
            }else if(skasi_width == 80){ 
            	price = 3100;
            }else if(skasi_width == 90){ 
            	price = 3400;
            }else if(skasi_width == 100){ 
            	price = 3800;
            }else if(skasi_width == 110){ 
            	price = 4400;
            }else if(skasi_width == 120){ 
            	price = 4900;
            }else if(skasi_width == 130){ 
            	price = 5400;
            }else if(skasi_width == 140){ 
            	price = 5900;
            }else if(skasi_width == 150){ 
            	price = 6400;
            }else if(skasi_width == 160){ 
            	price = 7000;
            }else if(skasi_width == 170){ 
            	price = 7500;
            }else if(skasi_width == 180){ 
            	price = 8100;
            }else if(skasi_width == 190){ 
            	price = 8600;
            }else if(skasi_width == 200){ 
            	price = 9200;
            }else if(skasi_width == 210){ 
            	price = 9900;
            }else if(skasi_width == 220){ 
            	price = 10600;
            }else if(skasi_width == 230){ 
            	price = 11200;
            }else if(skasi_width == 240){ 
            	price = 11800;
            }else if(skasi_width == 250){ 
            	price = 12900;
            }else if(skasi_width == 260){ 
            	price = 13500;
            }else if(skasi_width == 270){ 
            	price = 14200;
            }else if(skasi_width == 280){ 
            	price = 14900;
            }else if(skasi_width == 290){ 
            	price = 15500;
            }else if(skasi_width == 300){ 
            	price = 16100;
            }else if(skasi_width == 310){ 
            	price = 16600;
            }else if(skasi_width == 320){ 
            	price = 17100;
            }else if(skasi_width == 330){ 
            	price = 17600;
            }else if(skasi_width == 340){ 
            	price = 18100;
            }else if(skasi_width == 350){ 
            	price = 19400;
            }else if(skasi_width == 360){ 
            	price = 20000;
            }else if(skasi_width == 370){ 
            	price = 20700;
            }else if(skasi_width == 380){ 
            	price = 21400;
            }else if(skasi_width == 390){ 
            	price = 22000;
            }else if(skasi_width == 400){ 
            	price = 22600;
            }
        }    
   }
    
    if($("#skasi_acrylic01").is(":checked")){ //아크릴
        if($("#skasi_screen_color01").is(":checked")){ //기본
            total_price = total_count * price;
        }else if($("#skasi_screen_color04").is(":checked")){ // 도색색상
            total_price = total_count * price + (20000 * Number($("#skasi_screen_color_count").val()));
        }else{ //시트 & 실사부착
            total_price = total_count * price * 1.5;
        }
    }else{ //밀러 아크릴
        if($("#skasi_screen_color01").is(":checked")){ //기본
            total_price = total_count * price * 2;
        }else if($("#skasi_screen_color04").is(":checked")){ // 도색색상
            total_price = total_count * price * 2 + (20000 * Number($("#skasi_screen_color_count").val()));
        }else{ //시트 & 실사부착
            total_price = total_count * price * 1.5 * 2;
        }

    }
    
 
    
	$("#order_price").text(String(_r10((total_price)+nv("#more_order_price"))).replace(/\B(?=(\d{3})+(?!\d))/g, ","));

}

function skasi_pomex(){ //스카시 포멕스 계산
	setTimeout(function(){
        $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_option']").click(function(){
            $("#skasi_product_width,#skasi_product_vertical,#more_order_price,#add_more_text,#pomex_count").val("");
            $("#skasi_text_form01,#skasi_thumb01,#pomex_color01,#skasi_screen_color01,#both_size_tape01").prop("checked",true);
          
            //초기 리셋
            skasi_pomex_cal();

        });
        $("#skasi_product_width,#skasi_product_vertical,#more_order_price,#add_more_text,#pomex_count").bind("change keyup paste", function(){
            skasi_pomex_cal();

        });
        $(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_text_form'],.woosung_wrap .contents_wrap #option_table td label input[name='skasi_thumb'],.woosung_wrap .contents_wrap #option_table td label input[name='pomex_color'],.woosung_wrap .contents_wrap #option_table td label input[name='skasi_screen_color'],.woosung_wrap .contents_wrap #option_table td label input[name='both_size_tape']").click(function(){
            skasi_pomex_cal();

        });
   },500);
}

function skasi_pomex_cal(){ //스카시 포멕스 계산
	var total_price = 0;
    var pomex_width = Number($("#skasi_product_width").val()) / 1000;
    var pomex_vetical = Number($("#skasi_product_vertical").val()) / 1000;
    var price = 0;	
    var total_meter = pomex_width * pomex_vetical
	 
    if($("#skasi_text_form01").is(":checked")){ // 사각형
        if(total_meter <= 0.01){
            if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 3.5;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 20000 * 3.5;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 30000 * 3.5;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 35000 * 3.5;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 40000 * 3.5;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 17000 * 3.5;
            }
        }else if(total_meter <= 0.04){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 3;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 20000 * 3;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 30000 * 3;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 35000 * 3;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 40000 * 3;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 17000 * 3;
            }
        }else if(total_meter <= 0.09){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 2.9;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 20000 * 2.9;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 30000 * 2.9;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 35000 * 2.9;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 40000 * 2.9;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 17000 * 2.9;
            }
        }else if(total_meter <= 0.16){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 2.8;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 20000 * 2.8;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 30000 * 2.8;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 35000 * 2.8;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 40000 * 2.8;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 17000 * 2.8;
            }
        }else if(total_meter <= 0.25){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 2.6;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 20000 * 2.6;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 30000 * 2.6;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 35000 * 2.6;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 40000 * 2.6;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 17000 * 2.6;
            }
        }else if(total_meter <= 0.36){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 2.1;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 20000 * 2.1;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 30000 * 2.1;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 35000 * 2.1;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 40000 * 2.1;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 17000 * 2.1;
            }
        }else if(total_meter <= 0.49){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 1.8;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 20000 * 1.8;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 30000 * 1.8;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 35000 * 1.8;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 40000 * 1.8;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 17000 * 1.8;
            }
        }else if(total_meter <= 0.64){
            if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 1.5;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
                price = total_meter * 20000 * 1.5;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
                price = total_meter * 30000 * 1.5;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
                price = total_meter * 35000 * 1.5;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
                price = total_meter * 40000 * 1.5;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
                price = total_meter * 17000 * 1.5;
            }
        }else if(total_meter <= 0.81){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 1.3;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 20000 * 1.3;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 30000 * 1.3;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 35000 * 1.3;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 40000 * 1.3;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 17000 * 1.3;
            }
        }else if(total_meter <= 1.69){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 1.2;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 20000 * 1.2;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 30000 * 1.2;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 35000 * 1.2;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 40000 * 1.2;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 17000 * 1.2;
            }
        }else if(total_meter <= 2.76){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 1.1;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 20000 * 1.1;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 30000 * 1.1;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 35000 * 1.1;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 40000 * 1.1;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 17000 * 1.1;
            }
        }else if(total_meter >= 2.77){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 17000 * 1;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 20000 * 1;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 30000 * 1;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 35000 * 1;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 40000 * 1;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 17000 * 1;
            }
        }
    }else{ // 모양
    	if(total_meter <= 0.01){
            if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 3.5;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 25000 * 3.5;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 35000 * 3.5;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 45000 * 3.5;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 50000 * 3.5;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 25000 * 3.5;
            }
        }else if(total_meter <= 0.04){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 3;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 25000 * 3;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 35000 * 3;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 45000 * 3;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 50000 * 3;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 25000 * 3;
            }
        }else if(total_meter <= 0.09){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 2.9;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 25000 * 2.9;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 35000 * 2.9;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 45000 * 2.9;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 50000 * 2.9;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 25000 * 2.9;
            }
        }else if(total_meter <= 0.16){
           
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 2.8;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 25000 * 2.8;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 35000 * 2.8;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 45000 * 2.8;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 50000 * 2.8;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 25000 * 2.8;
            }
        }else if(total_meter <= 0.25){
          
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 2.6;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 25000 * 2.6;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 35000 * 2.6;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 45000 * 2.6;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 50000 * 2.6;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 25000 * 2.6;
            }
        }else if(total_meter <= 0.36){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 2.1;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 25000 * 2.1;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 35000 * 2.1;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 45000 * 2.1;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 50000 * 2.1;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 25000 * 2.1;
            }
        }else if(total_meter <= 0.49){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 1.8;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 25000 * 1.8;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 35000 * 1.8;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 45000 * 1.8;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 50000 * 1.8;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 25000 * 1.8;
            }
        }else if(total_meter <= 0.64){
            if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 1.5;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
                price = total_meter * 25000 * 1.5;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
                price = total_meter * 35000 * 1.5;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
                price = total_meter * 45000 * 1.5;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
                price = total_meter * 50000 * 1.5;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
                price = total_meter * 25000 * 1.5;
            }
        }else if(total_meter <= 0.81){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 1.3;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 25000 * 1.3;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 35000 * 1.3;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 45000 * 1.3;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 50000 * 1.3;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 25000 * 1.3;
            }
        }else if(total_meter <= 1.69){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 1.2;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 25000 * 1.2;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 35000 * 1.2;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 45000 * 1.2;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 50000 * 1.2;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 25000 * 1.2;
            }
        }else if(total_meter <= 2.76){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 1.1;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 25000 * 1.1;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 35000 * 1.1;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 45000 * 1.1;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 50000 * 1.1;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 25000 * 1.1;
            }
        }else if(total_meter >= 2.77){
			if($("#skasi_thumb01").is(":checked")){ // 2T
                price = total_meter * 20000 * 1;
            }else if($("#skasi_thumb02").is(":checked")){ // 3T
				price = total_meter * 25000 * 1;
            }else if($("#skasi_thumb03").is(":checked")){ // 5T
				price = total_meter * 35000 * 1;
            }else if($("#skasi_thumb04").is(":checked")){ // 8T
				price = total_meter * 45000 * 1;
            }else if($("#skasi_thumb05").is(":checked")){ // 10T
				price = total_meter * 50000 * 1;
            }else if($("#skasi_thumb06").is(":checked")){ // 폼보드T
				price = total_meter * 25000 * 1;
            }
        }
    }
     total_price = price;
    if($("#pomex_color02").is(":checked")){ //색상
       total_price = total_price * 1.2;
    }else{
       total_price = total_price;
    }
    if($("#skasi_screen_color01").is(":checked")){ // 화면 색상
        total_price = total_price;
    }else if($("#skasi_screen_color04")){
          total_price = total_price * 1.5;
    }else{
          total_price = total_price;
    }
    
    if($("#both_size_tape01").is(":checked")){ // 양면 테이프
        total_price = total_price * 1.5;
    }else{
        total_price = total_price ;
    }

    $("#order_price").text(String(_r10((total_price * Number($("#pomex_count").val()))+nv("#more_order_price"))).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}

// ── 공통자재 ─────────────────────────────────────────────────
function set_common_material_top(){
    applyPrices();
    var setting_html = "<tr><th colspan='2'>공통자재</th></tr>";
    $("#option_table thead").html(setting_html);

    var append_html = "";

    // 투광기
    append_html += "<tr><th>투광기</th><td class='cm-row'>";
    append_html += "<input type='number' class='cm-qty' id='cm_qty_cm_floodlight' placeholder='수량' min='0' value='0' data-key='cm_floodlight'> 개";
    append_html += "</td></tr>";

    // 전자 타이머
    append_html += "<tr><th>전자 타이머</th><td class='cm-row'>";
    append_html += "<label><input type='radio' name='cm_timer_spec' id='cm_timer_none' checked='checked'>없음</label>";
    append_html += "<label><input type='radio' name='cm_timer_spec' id='cm_timer_20a'>20A</label>";
    append_html += "<label><input type='radio' name='cm_timer_spec' id='cm_timer_30a'>30A</label>";
    append_html += "<label><input type='radio' name='cm_timer_spec' id='cm_timer_50a'>50A</label>";
    append_html += "</td></tr>";
    append_html += "<tr class='cm_timer_qty_row add_row'><th>타이머 수량</th><td class='cm-row'>";
    append_html += "<input type='number' class='cm-spec-qty' id='cm_timer_qty' placeholder='수량' min='0' value='0'> 개</td></tr>";

    // SMPS
    append_html += "<tr><th>SMPS</th><td class='cm-row'>";
    append_html += "<label><input type='radio' name='cm_smps_spec' id='cm_smps_none' checked='checked'>없음</label>";
    append_html += "<label><input type='radio' name='cm_smps_spec' id='cm_smps_60w'>60W</label>";
    append_html += "<label><input type='radio' name='cm_smps_spec' id='cm_smps_100w'>100W</label>";
    append_html += "<label><input type='radio' name='cm_smps_spec' id='cm_smps_150w'>150W</label>";
    append_html += "<label><input type='radio' name='cm_smps_spec' id='cm_smps_200w'>200W</label>";
    append_html += "<label><input type='radio' name='cm_smps_spec' id='cm_smps_300w'>300W</label>";
    append_html += "<label><input type='radio' name='cm_smps_spec' id='cm_smps_400w'>400W</label>";
    append_html += "<label><input type='radio' name='cm_smps_spec' id='cm_smps_500w'>500W</label>";
    append_html += "</td></tr>";
    append_html += "<tr class='cm_smps_qty_row add_row'><th>SMPS 수량</th><td class='cm-row'>";
    append_html += "<input type='number' class='cm-spec-qty' id='cm_smps_qty' placeholder='수량' min='0' value='0'> 개</td></tr>";

    // 형광등
    append_html += "<tr><th>형광등</th><td class='cm-row'>";
    append_html += "<input type='number' class='cm-qty' id='cm_qty_cm_fluorescent' placeholder='수량' min='0' value='0' data-key='cm_fluorescent'> 개";
    append_html += "</td></tr>";

    // LED 컨트롤러
    append_html += "<tr><th>LED 컨트롤러</th><td class='cm-row'>";
    append_html += "<label><input type='radio' name='cm_ctrl_spec' id='cm_ctrl_none' checked='checked'>없음</label>";
    append_html += "<label><input type='radio' name='cm_ctrl_spec' id='cm_ctrl_1ch'>1채널</label>";
    append_html += "<label><input type='radio' name='cm_ctrl_spec' id='cm_ctrl_2ch'>2채널</label>";
    append_html += "<label><input type='radio' name='cm_ctrl_spec' id='cm_ctrl_3ch'>3채널</label>";
    append_html += "</td></tr>";
    append_html += "<tr class='cm_ctrl_qty_row add_row'><th>컨트롤러 수량</th><td class='cm-row'>";
    append_html += "<input type='number' class='cm-spec-qty' id='cm_ctrl_qty' placeholder='수량' min='0' value='0'> 개</td></tr>";

    // LED
    append_html += "<tr><th>LED</th><td class='cm-row'>";
    append_html += "<label><input type='radio' name='cm_led_color' id='cm_led_none' checked='checked'>없음</label>";
    append_html += "<label><input type='radio' name='cm_led_color' id='cm_led_white'>백색</label>";
    append_html += "<label><input type='radio' name='cm_led_color' id='cm_led_warm'>웜(전구색)</label>";
    append_html += "<label><input type='radio' name='cm_led_color' id='cm_led_rgb'>RGB</label>";
    append_html += "<label><input type='radio' name='cm_led_color' id='cm_led_panorama'>파노라마</label>";
    append_html += "<label><input type='radio' name='cm_led_color' id='cm_led_single'>컬러(적/청/녹)</label>";
    append_html += "</td></tr>";
    append_html += "<tr class='cm_led_qty_row add_row'><th>LED 수량</th><td class='cm-row'>";
    append_html += "<input type='number' class='cm-spec-qty' id='cm_led_qty' placeholder='수량' min='0' value='0'> 개</td></tr>";
    append_html += "<tr>";
    append_html += "<th>추가 금액</th>";
    append_html += "<td><div id='extra_cost_list'></div><button type='button' class='btn-add-extra' onclick='addExtraCostRow()'>+ 항목 추가</button><input type='hidden' id='more_order_price' value='0'></td>";
    append_html += "</tr>";
    append_html += "<tr>";
    append_html += "<th>추가 입력 사항</th>";
    append_html += "<td><input type='text' id='add_more_text' placeholder='추가 입력 사항을 입력하세요'></td>";
    append_html += "</tr>";
    $("#option_table tbody").html(append_html);

    $(".cm-qty, .cm-spec-qty").on("input", function(){ _calc_cm_total(); });
    $(document).on("change", "#more_order_price", function(){ _calc_cm_total(); });

    $("input[name='cm_timer_spec']").on("click", function(){
        if($(this).attr("id") === "cm_timer_none") $(".cm_timer_qty_row").hide();
        else $(".cm_timer_qty_row").css("display","table-row");
        _calc_cm_total();
    });
    $("input[name='cm_smps_spec']").on("click", function(){
        if($(this).attr("id") === "cm_smps_none") $(".cm_smps_qty_row").hide();
        else $(".cm_smps_qty_row").css("display","table-row");
        _calc_cm_total();
    });
    $("input[name='cm_ctrl_spec']").on("click", function(){
        if($(this).attr("id") === "cm_ctrl_none") $(".cm_ctrl_qty_row").hide();
        else $(".cm_ctrl_qty_row").css("display","table-row");
        _calc_cm_total();
    });
    $("input[name='cm_led_color']").on("click", function(){
        if($(this).attr("id") === "cm_led_none") $(".cm_led_qty_row").hide();
        else $(".cm_led_qty_row").css("display","table-row");
        _calc_cm_total();
    });
}

function _getCmLedUnit(){
    if($("#cm_led_white").is(":checked"))    return PRICES.cm_led_white;
    if($("#cm_led_warm").is(":checked"))     return PRICES.cm_led_warm;
    if($("#cm_led_rgb").is(":checked"))      return PRICES.cm_led_rgb;
    if($("#cm_led_panorama").is(":checked")) return PRICES.cm_led_panorama;
    if($("#cm_led_single").is(":checked"))   return PRICES.cm_led_color;
    return 0;
}

function _getCmTimerUnit(){
    if($("#cm_timer_20a").is(":checked")) return PRICES.cm_timer_20a;
    if($("#cm_timer_30a").is(":checked")) return PRICES.cm_timer_30a;
    if($("#cm_timer_50a").is(":checked")) return PRICES.cm_timer_50a;
    return 0;
}
function _getCmSmpsUnit(){
    if($("#cm_smps_60w").is(":checked"))  return PRICES.cm_smps_60w;
    if($("#cm_smps_100w").is(":checked")) return PRICES.cm_smps_100w;
    if($("#cm_smps_150w").is(":checked")) return PRICES.cm_smps_150w;
    if($("#cm_smps_200w").is(":checked")) return PRICES.cm_smps_200w;
    if($("#cm_smps_300w").is(":checked")) return PRICES.cm_smps_300w;
    if($("#cm_smps_400w").is(":checked")) return PRICES.cm_smps_400w;
    if($("#cm_smps_500w").is(":checked")) return PRICES.cm_smps_500w;
    return 0;
}
function _getChSmpsUnit(){
    if($("#ch_smps_60w").is(":checked"))  return PRICES.cm_smps_60w;
    if($("#ch_smps_100w").is(":checked")) return PRICES.cm_smps_100w;
    if($("#ch_smps_150w").is(":checked")) return PRICES.cm_smps_150w;
    if($("#ch_smps_200w").is(":checked")) return PRICES.cm_smps_200w;
    if($("#ch_smps_300w").is(":checked")) return PRICES.cm_smps_300w;
    if($("#ch_smps_400w").is(":checked")) return PRICES.cm_smps_400w;
    if($("#ch_smps_500w").is(":checked")) return PRICES.cm_smps_500w;
    return 0;
}
function _getCmCtrlUnit(){
    if($("#cm_ctrl_1ch").is(":checked")) return PRICES.cm_led_ctrl_1ch;
    if($("#cm_ctrl_2ch").is(":checked")) return PRICES.cm_led_ctrl_2ch;
    if($("#cm_ctrl_3ch").is(":checked")) return PRICES.cm_led_ctrl_3ch;
    return 0;
}

function _calc_cm_total(){
    applyPrices();
    var total = 0;
    $(".cm-qty").each(function(){
        var key = $(this).data("key");
        var qty = parseInt($(this).val()) || 0;
        total += qty * (PRICES[key] || 0);
    });
    total += (parseInt($("#cm_timer_qty").val()) || 0) * _getCmTimerUnit();
    total += (parseInt($("#cm_smps_qty").val()) || 0) * _getCmSmpsUnit();
    total += (parseInt($("#cm_ctrl_qty").val()) || 0) * _getCmCtrlUnit();
    total += (parseInt($("#cm_led_qty").val()) || 0) * _getCmLedUnit();
    total += nv("#more_order_price") || 0;
    $("#order_price").text(String(_r10(total)).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}

function common_material_calc(){
    $(".cm-qty").on("input", function(){ _calc_cm_total(); });
}

//견적 저장

$(".save_btn").click(function(){
    // ── 유효성 검사 ──────────────────────────────────────────
    var _errs = [];
    var _tab = $(".woosung_wrap .tab_area ul li.active");

    if(_tab.length === 0) {
        _errs.push("상단에서 품목을 선택해주세요.");
    } else if(_tab.hasClass("child01")) { // 사인탑
        if(!$("#sigh_option01,#sigh_option02,#sigh_option03").is(":checked")) {
            _errs.push("사인탑 유형(비조명 / 조명 / 돌출)을 선택해주세요.");
        } else {
            if($("#sigh_option01").is(":checked") || $("#sigh_option02").is(":checked")) {
                if(!$.trim($("#sigh_row").val())) _errs.push("가로 크기를 입력해주세요.");
                if(!$.trim($("#sigh_vertical").val())) _errs.push("세로 크기를 입력해주세요.");
            } else {
                if(!$.trim($("#sigh_vertical").val())) _errs.push("세로 크기를 입력해주세요.");
            }
            if($("#sigh_angle_yes").is(":checked") && (!$.trim($("#sigh_angle_count").val()) || Number($("#sigh_angle_count").val()) <= 0))
                _errs.push("까치발 수량을 입력해주세요.");
            if($("#sigh_light_led").is(":checked") && (!$.trim($("#sigh_light_led_count").val()) || Number($("#sigh_light_led_count").val()) <= 0))
                _errs.push("등조립(LED) 수량을 입력해주세요.");
        }
    } else if(_tab.hasClass("child02")) { // 채널문자
        if(!$("input[name='channel_option']:checked").length) {
            _errs.push("채널문자 품목을 선택해주세요.");
        } else {
            if(_chItems.length === 0)
                _errs.push("항목을 1개 이상 담아주세요. (문자형태·크기·수량 선택 후 담기 버튼)");
            if(!$("#channel_trusbar_none").is(":checked") && (!$.trim($("#channel_trusbar_width").val()) || nv("#channel_trusbar_width") <= 0) && !$("#channel_trusbar05").is(":checked"))
                _errs.push("트러스바 길이를 입력해주세요.");
            if($("#channel_more_order_option01").is(":checked") && (!$.trim($("#channel_more_order_count").val()) || Number($("#channel_more_order_count").val()) <= 0))
                _errs.push("까치발 갯수를 입력해주세요.");
        }
    } else if(_tab.hasClass("child04")) { // 실사출력
        if(!$("#actual_option01,#actual_option02,#actual_option03,#actual_option04").is(":checked")) {
            _errs.push("실사출력 유형을 선택해주세요.");
        } else {
            if(!$.trim($("#frame_product_width").val()) || nv("#frame_product_width") <= 0)
                _errs.push("가로 크기를 입력해주세요.");
            if(!$.trim($("#frame_product_vertical").val()) || nv("#frame_product_vertical") <= 0)
                _errs.push("세로 크기를 입력해주세요.");
            if($("#actual_punch02").is(":checked") && (!$.trim($("#actual_punch_count").val()) || Number($("#actual_punch_count").val()) <= 0))
                _errs.push("타공 개수를 입력해주세요.");
        }
    } else if(_tab.hasClass("child05")) { // 스카시
        if(!$("#skasi_option01,#skasi_option02,#skasi_option03").is(":checked")) {
            _errs.push("스카시 유형을 선택해주세요.");
        } else {
            if($("#skasi_option01").is(":checked")) {
                if(!$.trim($("#skasicolor_count").val()) || Number($("#skasicolor_count").val()) <= 0)
                    _errs.push("수량(총 글자 수)을 입력해주세요.");
                if(!$.trim($("#skasi_width").val()))
                    _errs.push("크기를 입력해주세요.");
            } else if($("#skasi_option02").is(":checked")) {
                if(!$.trim($("#skasi_acrylic_count").val()) || Number($("#skasi_acrylic_count").val()) <= 0)
                    _errs.push("수량(총 글자 수)을 입력해주세요.");
                if(!$.trim($("#skasi_width").val()))
                    _errs.push("크기를 입력해주세요.");
            } else if($("#skasi_option03").is(":checked")) {
                if(!$.trim($("#skasi_product_width").val()) || Number($("#skasi_product_width").val()) <= 0)
                    _errs.push("가로 크기를 입력해주세요.");
                if(!$.trim($("#skasi_product_vertical").val()) || Number($("#skasi_product_vertical").val()) <= 0)
                    _errs.push("세로 크기를 입력해주세요.");
                if(!$.trim($("#pomex_count").val()) || Number($("#pomex_count").val()) <= 0)
                    _errs.push("수량을 입력해주세요.");
            }
        }
    } else if(_tab.hasClass("child06")) { // 공통자재
        var _hasCmQty = false;
        $(".cm-qty").each(function(){ if(parseInt($(this).val()) > 0) _hasCmQty = true; });
        if(!_hasCmQty && nv("#more_order_price") === 0)
            _errs.push("공통자재 수량 또는 추가 금액을 입력해주세요.");
    }

    if(_errs.length === 0 && Number($("#order_price").text().replace(/[^0-9]/g, "")) === 0)
        _errs.push("견적 비용이 0원입니다. 옵션을 다시 확인해주세요.");

    var $em = $("#save_error_msg");
    if(_errs.length > 0) {
        $em.html(_errs.map(function(e){ return "<span>" + e + "</span>"; }).join("")).stop(true).show().delay(3500).fadeOut(400);
        return;
    }
    $em.hide();
    // ─────────────────────────────────────────────────────────

    var total_html = "";


	if($(".woosung_wrap .tab_area ul li.active").hasClass("child01")){ //사인탑
        if($("#sigh_option01").is(":checked")){ //비조명
     			total_html += "<li><span class='number'></span>";
            	total_html += $(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_option']:checked").parent("label").text();
            	total_html +=" / 방향 선택 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_option_direction']:checked").parent("label").text();
            	total_html +=" / 가로 :"+$("#sigh_row").val();
            	total_html +=" / 세로 :"+$("#sigh_vertical").val();
            	total_html +=" / 화면 작업 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_display']:checked").parent("label").text();
            	total_html +=" / 프레임 색상 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_frame_color']:checked").parent("label").text();
           		if($("#sigh_frame_color_custom").is(":checked")){
                    total_html +=" / 지정색 도장 : "+$("#frame_custom_text").val();
                }
            	total_html +="/ 까치발 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_angle']:checked").parent("label").text();
           		 if($("#sigh_angle_yes").is(":checked")){
                   total_html +=" / 크기 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_angle_width']:checked").parent("label").text();
                   total_html +=" / 까치발 수량 : "+$("#sigh_angle_count").val();
                }
            	if($("#sigh_backdrop_yes").is(":checked")){
            		(function(){ var _bd=getSignDimensions(), _f=function(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,",");}; total_html+=" / 뒷판작업 : "+_f(Math.round(_bd.w*1000))+"×"+_f(Math.round(_bd.h*1000))+"mm"; })();
            	}
            	if($("#sigh_deungbak_yes").is(":checked")){
            		if($("#sigh_deungbak_galva").is(":checked")){
            			total_html +=" / 등박스 : 갈바등박스 / 위치 : "+$("input[name='sigh_deungbak_pos']:checked").parent("label").text()+" (LED포함 SMPS불포함)";
            		}else{
            			total_html +=" / 등박스 : 경관바("+$("input[name='sigh_kyungbak_size']:checked").parent("label").text()+") / 위치 : "+$("input[name='sigh_deungbak_pos']:checked").parent("label").text();
            		}
            	}
            	if(nv("#more_order_price") != 0){
            		total_html +=" / "+getExtraCostText();
                }
            	if($("#add_more_text").val().length !=0 ){
            		total_html +=" / 추가입력 사항 : "+$("#add_more_text").val();
                }

            	(function(){
                    function _fmt(n){ return String(_r10(n)).replace(/\B(?=(\d{3})+(?!\d))/g,","); }
                    var tw=nv("#sigh_row")/1000, tv=nv("#sigh_vertical")/1000;
                    if($("#sigh_option_row").is(":checked")){ if(tw>0&&tw<1.5)tw=1.5; if(tv>0&&tv<1)tv=1; }
                    else { if(tw>0&&tw<1)tw=1; if(tv>0&&tv<1.5)tv=1.5; }
                    var dUnit=$("#sigh_display_01").is(":checked")?PRICES.sign01_flex_print:$("#sigh_display_02").is(":checked")?PRICES.sign01_flex_sheet:PRICES.sign01_tension_none;
                    var displayP=Math.floor(tw*tv*dUnit);
                    var colorP=0;
                    if($("#sigh_frame_color_custom").is(":checked")) colorP=Math.floor(Math.round(tw*tv)*PRICES.sign_color_paint_nol);
                    else if($("#sigh_frame_color_stan").is(":checked")) colorP=Math.floor((tw*2+tv*2)*PRICES.sign_sten_molding);
                    var angleCnt=$("#sigh_angle_yes").is(":checked")?(Number($("#sigh_angle_count").val())||0):0;
                    var angleUnit=getAnglePrice(1), angleP=angleCnt*angleUnit;
                    var backdropP=getBackdropPrice(), deungbakP=getDeungbakPrice(), moreP=nv("#more_order_price");
                    var bd="<span class='price_breakdown'>";
                    if(displayP>0) bd+="<span class='bd_item'>화면작업 <em>"+_fmt(Math.round(tw*1000))+"×"+_fmt(Math.round(tv*1000))+"mm × "+_fmt(dUnit)+"원/m² = "+_fmt(displayP)+"원</em></span>";
                    (function(){ var backdropColorP=getBackdropColorPrice(),_bD=getSignDimensions(); if(colorP>0||backdropColorP>0){ if($("#sigh_frame_color_custom").is(":checked")){ var txt=backdropColorP>0?"(("+_fmt(Math.round(_bD.w*1000))+"+"+_fmt(Math.round(_bD.h*1000))+"mm)×2) × 6,000원/m = "+_fmt(backdropColorP)+"원":_fmt(Math.round(tw*1000))+"×"+_fmt(Math.round(tv*1000))+"mm("+Math.round(tw*tv)+"m²) × "+_fmt(PRICES.sign_color_paint_nol)+"원 = "+_fmt(colorP)+"원"; bd+="<span class='bd_item'>색상도장 <em>"+txt+"</em></span>"; } else if(colorP>0) bd+="<span class='bd_item'>스텐몰딩 <em>둘레 "+_fmt(Math.round((tw*2+tv*2)*1000))+"mm × "+_fmt(PRICES.sign_sten_molding)+"원/m = "+_fmt(colorP)+"원</em></span>"; } })();
                    if(angleCnt>0&&angleP>0) bd+="<span class='bd_item'>까치발 <em>"+angleCnt+"개 × "+_fmt(angleUnit)+"원 = "+_fmt(angleP)+"원</em></span>";
                    if(backdropP>0){ var _bD=getSignDimensions(); bd+="<span class='bd_item'>뒷판작업 <em>"+_fmt(Math.round(_bD.w*1000))+"×"+_fmt(Math.round(_bD.h*1000))+"mm × 3,000원/m² = "+_fmt(backdropP)+"원</em></span>"; }
                    if(deungbakP>0){ var _dD=getSignDimensions(),_pos=$("input[name='sigh_deungbak_pos']:checked").attr("id")||"sigh_deungbak_top",_posNm=$("input[name='sigh_deungbak_pos']:checked").parent("label").text(),_len=(_pos==="sigh_deungbak_top"||_pos==="sigh_deungbak_bottom")?_dD.w:(_pos==="sigh_deungbak_left"||_pos==="sigh_deungbak_right")?_dD.h:(_pos==="sigh_deungbak_center")?_dD.w:2*(_dD.w+_dD.h); if($("#sigh_deungbak_galva").is(":checked")) bd+="<span class='bd_item'>등박스(갈바/"+_posNm+") <em>"+_fmt(Math.round(_len*1000))+"mm"+(_len<=5?" → 5m 이하 기본":" → 300,000 + "+Math.ceil(_len-5)+"m×50,000")+" = "+_fmt(deungbakP)+"원</em></span>"; else{ var _kU=$("#sigh_kyungbak_50").is(":checked")?60000:80000,_kS=Math.ceil(_len/3); bd+="<span class='bd_item'>등박스(경관바/"+_posNm+") <em>"+_fmt(Math.round(_len*1000))+"mm → "+_kS+"구간 × "+_fmt(_kU)+"원 = "+_fmt(deungbakP)+"원</em></span>"; } }
                    bd += extraCostBdItems();
                    bd+="</span>"; total_html+=bd;
                })();
            	total_html +="/ 견적 비용 : <span class='list_price'>";
            	total_html += $(".order_info .right_area #order_price").text()+"</span> 원</lI>";
        }else if($("#sigh_option02").is(":checked")){ //조명
                total_html += "<li><span class='number'></span>";
            	total_html += $(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_option']:checked").parent("label").text();
            	total_html +=" / 방향 선택 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_option_direction']:checked").parent("label").text();
            	total_html +=" / 가로 :"+$("#sigh_row").val();
            	total_html +=" / 세로 :"+$("#sigh_vertical").val();
            	total_html +=" / 화면 작업 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_display']:checked").parent("label").text();
            	total_html +=" / 등조립 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_light']:checked").parent("label").text();
            	if($("#sigh_light_led").is(":checked")){
            		total_html +=" / LED 수량 : "+$("#sigh_light_led_count").val();
                }
            	total_html +=" / 프레임 색상 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_frame_color']:checked").parent("label").text();
           		if($("#sigh_frame_color_custom").is(":checked")){
                    total_html +=" / 지정색 도장 : "+$("#frame_custom_text").val();
                }
            	total_html +="/ 까치발 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_angle']:checked").parent("label").text();
           		 if($("#sigh_angle_yes").is(":checked")){
                   total_html +=" / 크기 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_angle_width']:checked").parent("label").text();
                   total_html +=" / 까치발 수량 : "+$("#sigh_angle_count").val();
                }
            	if($("#sigh_backdrop_yes").is(":checked")){
            		(function(){ var _bd=getSignDimensions(), _f=function(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,",");}; total_html+=" / 뒷판작업 : "+_f(Math.round(_bd.w*1000))+"×"+_f(Math.round(_bd.h*1000))+"mm"; })();
            	}
            	if($("#sigh_deungbak_yes").is(":checked")){
            		if($("#sigh_deungbak_galva").is(":checked")){
            			total_html +=" / 등박스 : 갈바등박스 / 위치 : "+$("input[name='sigh_deungbak_pos']:checked").parent("label").text()+" (LED포함 SMPS불포함)";
            		}else{
            			total_html +=" / 등박스 : 경관바("+$("input[name='sigh_kyungbak_size']:checked").parent("label").text()+") / 위치 : "+$("input[name='sigh_deungbak_pos']:checked").parent("label").text();
            		}
            	}
            	if(nv("#more_order_price") != 0){
            		total_html +=" / "+getExtraCostText();
                }
            	if($("#add_more_text").val().length !=0 ){
            		total_html +=" / 추가입력 사항 : "+$("#add_more_text").val();
                }

            	(function(){
                    function _fmt(n){ return String(_r10(n)).replace(/\B(?=(\d{3})+(?!\d))/g,","); }
                    var tw=nv("#sigh_row")/1000, tv=nv("#sigh_vertical")/1000;
                    if($("#sigh_option_row").is(":checked")){ if(tw>0&&tw<1.5)tw=1.5; if(tv>0&&tv<1)tv=1; }
                    else { if(tw>0&&tw<1)tw=1; if(tv>0&&tv<1.5)tv=1.5; }
                    var dUnit=$("#sigh_display_01").is(":checked")?PRICES.sign02_flex_print:$("#sigh_display_02").is(":checked")?PRICES.sign02_flex_sheet:PRICES.sign02_tension_none;
                    var displayP=Math.floor(tw*tv*dUnit);
                    var colorP=0;
                    if($("#sigh_frame_color_custom").is(":checked")){ var len=$("#sigh_option_row").is(":checked")?tw:tv; colorP=Math.round(len)<=5?50000:Math.floor(len*PRICES.sign_color_paint_light); }
                    else if($("#sigh_frame_color_stan").is(":checked")) colorP=Math.floor((tw*2+tv*2)*20000);
                    var ledCnt=$("#sigh_light_led").is(":checked")?(Number($("#sigh_light_led_count").val())||0):0;
                    var ledP=ledCnt*4500;
                    var angleCnt=$("#sigh_angle_yes").is(":checked")?(Number($("#sigh_angle_count").val())||0):0;
                    var angleUnit=getAnglePrice(1), angleP=angleCnt*angleUnit;
                    var backdropP=getBackdropPrice(), deungbakP=getDeungbakPrice(), moreP=nv("#more_order_price");
                    var bd="<span class='price_breakdown'>";
                    if(displayP>0) bd+="<span class='bd_item'>화면작업 <em>"+_fmt(displayP)+"원</em></span>";
                    (function(){ var backdropColorP=getBackdropColorPrice(),_bD=getSignDimensions(); if(colorP>0||backdropColorP>0){ if($("#sigh_frame_color_custom").is(":checked")){ var txt=backdropColorP>0?"(("+_fmt(Math.round(_bD.w*1000))+"+"+_fmt(Math.round(_bD.h*1000))+"mm)×2) × 6,000원/m = "+_fmt(backdropColorP)+"원":_fmt(colorP)+"원"; bd+="<span class='bd_item'>색상도장 <em>"+txt+"</em></span>"; } else if(colorP>0) bd+="<span class='bd_item'>스텐몰딩 <em>"+_fmt(colorP)+"원</em></span>"; } })();
                    if(ledCnt>0&&ledP>0) bd+="<span class='bd_item'>LED <em>"+ledCnt+"개 × 4,500원 = "+_fmt(ledP)+"원</em></span>";
                    if(angleCnt>0&&angleP>0) bd+="<span class='bd_item'>까치발 <em>"+angleCnt+"개 × "+_fmt(angleUnit)+"원 = "+_fmt(angleP)+"원</em></span>";
                    if(backdropP>0) bd+="<span class='bd_item'>뒷판작업 <em>"+_fmt(backdropP)+"원</em></span>";
                    if(deungbakP>0) bd+="<span class='bd_item'>등박스 <em>"+_fmt(deungbakP)+"원</em></span>";
                    bd += extraCostBdItems();
                    bd+="</span>"; total_html+=bd;
                })();
            	total_html +="/ 견적 비용 : <span class='list_price'>";
            	total_html += $(".order_info .right_area #order_price").text()+"</span> 원</lI>";
        }else if($("#sigh_option03").is(":checked")){ //돌출
             	total_html += "<li><span class='number'></span>";
            	total_html += $(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_option']:checked").parent("label").text();
            	total_html +=" / 가로 :"+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_angle_width']:checked").parent("label").text();
            	total_html +=" / 세로 :"+$("#sigh_vertical").val();
            	total_html +=" / 화면 작업 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_display']:checked").parent("label").text();
                if($("#sigh_display_01").is(":checked")){
            		total_html +=" / 후렉스 출력 타입 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_display']:checked").parent("label").text();
                }
            	total_html +=" / 등조립 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_light']:checked").parent("label").text();
            	if($("#sigh_light_led").is(":checked")){
            		total_html +=" / LED 수량 : "+$("#sigh_light_led_count").val();
                }
            	total_html +=" / 프레임 색상 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_frame_color']:checked").parent("label").text();
           		if($("#sigh_frame_color_custom").is(":checked")){
                    total_html +=" / 지정색 도장 : "+$("#frame_custom_text").val();
                }
            	total_html +="/ 시공발통 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='sigh_baltong']:checked").parent("label").text();
            	if($("#sigh_backdrop_yes").is(":checked")){
            		(function(){ var _bd=getSignDimensions(), _f=function(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,",");}; total_html+=" / 뒷판작업 : "+_f(Math.round(_bd.w*1000))+"×"+_f(Math.round(_bd.h*1000))+"mm"; })();
            	}
            	if($("#sigh_deungbak_yes").is(":checked")){
            		if($("#sigh_deungbak_galva").is(":checked")){
            			total_html +=" / 등박스 : 갈바등박스 / 위치 : "+$("input[name='sigh_deungbak_pos']:checked").parent("label").text()+" (LED포함 SMPS불포함)";
            		}else{
            			total_html +=" / 등박스 : 경관바("+$("input[name='sigh_kyungbak_size']:checked").parent("label").text()+") / 위치 : "+$("input[name='sigh_deungbak_pos']:checked").parent("label").text();
            		}
            	}
            	if(nv("#more_order_price") != 0){
            	total_html +=" / "+getExtraCostText();
                }
            	if($("#add_more_text").val().length !=0 ){
            	total_html +=" / 추가입력 사항 : "+$("#add_more_text").val();
                }

            	(function(){
                    function _fmt(n){ return String(_r10(n)).replace(/\B(?=(\d{3})+(?!\d))/g,","); }
                    var tv=nv("#sigh_vertical")/1000; if(tv>0&&tv<1.5)tv=1.5;
                    var tw=0, baseUnit=0;
                    if($("#sigh_angle_width_800").is(":checked")){tw=0.8;baseUnit=70000;}
                    else if($("#sigh_angle_width_900").is(":checked")){tw=0.9;baseUnit=75000;}
                    else if($("#sigh_angle_width_1000").is(":checked")){tw=1.0;baseUnit=80000;}
                    else if($("#sigh_angle_width_1100").is(":checked")){tw=1.1;baseUnit=85000;}
                    else if($("#sigh_angle_width_1200").is(":checked")){tw=1.2;baseUnit=90000;}
                    var baseP=Math.floor(tv*baseUnit);
                    var wUnit=0;
                    if($("#sigh_display_01").is(":checked")) wUnit=$("#sigh_display_type01").is(":checked")?8000:7000;
                    else if($("#sigh_display_02").is(":checked")) wUnit=10000;
                    var woorexP=Math.floor(Math.max(tw,1)*tv*wUnit*2);
                    var ledCnt=$("#sigh_light_led").is(":checked")?(Number($("#sigh_light_led_count").val())||0):0;
                    var ledP=ledCnt*4500;
                    var colorP=$("#sigh_frame_color_stan").is(":checked")?Math.floor(((tw*2+tv*2)*20000)*2):0;
                    var baltongP=$("#sigh_baltong_ubolt").is(":checked")?30000:$("#sigh_baltong_stan").is(":checked")?100000:0;
                    var backdropP=getBackdropPrice(), deungbakP=getDeungbakPrice(), moreP=nv("#more_order_price");
                    var bd="<span class='price_breakdown'>";
                    if(baseP>0) bd+="<span class='bd_item'>기본가 <em>"+_fmt(Math.round(tv*1000))+"mm × "+_fmt(baseUnit)+"원 = "+_fmt(baseP)+"원</em></span>";
                    if(woorexP>0) bd+="<span class='bd_item'>화면작업(앞뒤) <em>"+_fmt(woorexP)+"원</em></span>";
                    (function(){ var backdropColorP=getBackdropColorPrice(),_bD=getSignDimensions(); if(colorP>0||backdropColorP>0){ if($("#sigh_frame_color_custom").is(":checked")){ var txt=backdropColorP>0?"(("+_fmt(Math.round(_bD.w*1000))+"+"+_fmt(Math.round(_bD.h*1000))+"mm)×2) × 6,000원/m = "+_fmt(backdropColorP)+"원":_fmt(colorP)+"원"; bd+="<span class='bd_item'>색상도장 <em>"+txt+"</em></span>"; } else if(colorP>0) bd+="<span class='bd_item'>스텐몰딩 <em>"+_fmt(colorP)+"원</em></span>"; } })();
                    if(ledCnt>0&&ledP>0) bd+="<span class='bd_item'>LED <em>"+ledCnt+"개 × 4,500원 = "+_fmt(ledP)+"원</em></span>";
                    if(baltongP>0) bd+="<span class='bd_item'>시공발통 <em>"+_fmt(baltongP)+"원</em></span>";
                    if(backdropP>0) bd+="<span class='bd_item'>뒷판작업 <em>"+_fmt(backdropP)+"원</em></span>";
                    if(deungbakP>0) bd+="<span class='bd_item'>등박스 <em>"+_fmt(deungbakP)+"원</em></span>";
                    bd += extraCostBdItems();
                    bd+="</span>"; total_html+=bd;
                })();
            	total_html +="/ 견적 비용 : <span class='list_price'>";
            	total_html += $(".order_info .right_area #order_price").text()+"</span> 원</lI>";
        }

    }else if($(".woosung_wrap .tab_area ul li.active").hasClass("child02")){ //채널문자
    	if($("input[name='channel_option']:checked").length){ // 채널문자 품목 선택됨
            function _fmtCh(n){ return String(_r10(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

            total_html += "<li><span class='number'></span>";
            total_html += "<strong class='li-cat-name'>" + $("input[name='channel_option']:checked").parent("label").text() + "</strong>";

            // ── 고정 옵션 (/ 구분자 유지 → getEstimateItems 파싱용) ──
            total_html += "<span class='li-fixed-opts'>";
            total_html += " / 트러스바 : " + $("input[name='channel_trusbar']:checked").parent("label").text();
            if($("#channel_trusbar05").is(":checked")){
                total_html += " / 주문제작 사이즈 : "+$("#channel_trusbar_custom_w").val()+"×"+$("#channel_trusbar_custom_h").val()+"×"+$("#channel_trusbar_custom_t").val()+"mm";
                total_html += " / 주문제작 추가금 : "+$("#channel_trusbar_custom_price").val()+"원";
            }else if(!$("#channel_trusbar_none").is(":checked")){
                total_html += " / 트러스바 길이 : "+$("#channel_trusbar_width").val()+" mm";
            }
            total_html += " / 까치발 : " + $("input[name='channel_more_order']:checked").parent("label").text();
            if($("#channel_more_order_option01").is(":checked")){
                total_html += " (" + $("#channel_more_order_count").val() + "개)";
            }
            if($("#channel_complete_none").length && !$("#channel_complete_none").is(":checked")){
                total_html += " / 완조립 : " + $("input[name='channel_complete']:checked").parent("label").text();
            } else if($("#channel_complete_normal,#channel_complete_premium").is(":checked")){
                total_html += " / 완조립 : " + $("input[name='channel_complete']:checked").parent("label").text();
            }
            if(!$("#ch_smps_none").is(":checked")){
                var _smpsSpec = $("input[name='ch_smps_spec']:checked").parent("label").text();
                var _smpsQtyVal = parseInt($("#ch_smps_qty").val()) || 0;
                total_html += " / SMPS : " + _smpsSpec + " " + _smpsQtyVal + "개";
            }
            total_html += "</span>";

            // ── 담긴 항목 목록 (카드형 레이아웃) ──
            if(_chItems.length > 0){
                total_html += "<div class='li-ch-block'>";
                total_html += "<div class='li-ch-block-hd'>[담긴 항목 " + _chItems.length + "개]</div>";
                $.each(_chItems, function(i, item){
                    // label의 " / " → " · " 치환: getEstimateItems replace(/\s*\/\s*/g) 오파싱 방지
                    var safeLabel = item.label.replace(/\s*\/\s*/g, ' · ');
                    total_html += "<div class='li-ch-row'>";
                    total_html += "<span class='li-ch-row-sep'> / </span>"; // 파싱용 구분자 (CSS hidden)
                    total_html += "<span class='li-ch-row-num'>(" + (i+1) + ")</span>";
                    total_html += "<span class='li-ch-row-label'>" + safeLabel + "</span>";
                    total_html += "<em class='li-ch-price'>" + _fmtCh(item.price) + "원</em>";
                    total_html += "</div>";
                });
                total_html += "</div>";
            }

            if(nv("#more_order_price") !== 0){
                total_html += "<span class='li-fixed-opts'> / " + getExtraCostText() + "</span>";
            }
            if($.trim($("#add_more_text").val()).length !== 0){
                total_html += "<span class='li-fixed-opts'> / 추가입력 사항 : " + $("#add_more_text").val() + "</span>";
            }

            // ── 단가 내역 badges ──
            (function(){
                var bd = "<span class='price_breakdown'>";
                // 트러스바
                var _tb = _calcTrusbar(), _tbP = _tb.price;
                if(_tbP > 0){
                    if(_tb.isCustom){
                        bd += "<span class='bd_item'>트러스바 주문제작 × 1식 = <em>"+_fmtCh(_tbP)+"원</em></span>";
                    }else if(_tb.isFixed){
                        bd += "<span class='bd_item'>트러스바("+_tb.pok+"/"+_tb.mm+"mm/정액) × 1식 = <em>"+_fmtCh(_tbP)+"원</em></span>";
                    }else{
                        bd += "<span class='bd_item'>트러스바("+_tb.pok+"/"+_tb.mm+"mm/"+_fmtCh(_tb.ratePerM)+"원/m) × 1식 = <em>"+_fmtCh(_tbP)+"원</em></span>";
                    }
                }
                // 까치발
                var _ggCnt=Number($("#channel_more_order_count").val())||0, _ggUnit=0;
                _ggUnit = PRICES.ch_ggachi_200; // 트러스바 폭 기준 연동
                if($("#channel_trusbar02").is(":checked"))      _ggUnit=PRICES.ch_ggachi_250;
                else if($("#channel_trusbar03").is(":checked")) _ggUnit=PRICES.ch_ggachi_300;
                else if($("#channel_trusbar04").is(":checked")) _ggUnit=PRICES.ch_ggachi_400;
                var _ggP=($("#channel_more_order_option01").is(":checked"))?_ggCnt*_ggUnit:0;
                if(_ggP>0) bd += "<span class='bd_item'>까치발 <em>"+_ggCnt+"개 × "+_fmtCh(_ggUnit)+"원 = "+_fmtCh(_ggP)+"원</em></span>";
                // 완조립
                var _compP=$("#channel_complete_normal").is(":checked")?100000:($("#channel_complete_premium").is(":checked")?150000:0);
                if(_compP>0){ var _compType=$("#channel_complete_normal").is(":checked")?"일반":"프리미엄"; bd += "<span class='bd_item'>완조립("+_compType+") × 1개 = <em>"+_fmtCh(_compP)+"원</em></span>"; }
                // SMPS
                var _chSmpsUnit=_getChSmpsUnit(), _chSmpsQty=parseInt($("#ch_smps_qty").val())||0, _chSmpsP=_chSmpsUnit*_chSmpsQty;
                if(_chSmpsP>0) bd += "<span class='bd_item'>SMPS("+$("input[name='ch_smps_spec']:checked").parent("label").text()+") <em>"+_chSmpsQty+"개 × "+_fmtCh(_chSmpsUnit)+"원 = "+_fmtCh(_chSmpsP)+"원</em></span>";
                // 담긴 항목 개별 내역 (항목별 컴포넌트 분리)
                var _itemsTotal=0;
                $.each(_chItems,function(i,it){
                    _itemsTotal+=it.price;
                    var _qN = it.qty || 1;
                    var _detailSuffix = it.detail ? " ["+it.detail+"]" : "";
                    var _mainName = (it.channelTypeName||"채널문자") + " " + (it.sizeText||"");
                    // 채널메인: LED 비용 제외한 채널 단가만 표시
                    var _ledTot = ((it.jeonLedPrice||0)+(it.huLedPrice||0)+(it.ledPrice||0))*_qN;
                    var _chOnly = it.price - _ledTot;
                    bd += "<span class='bd_item'>#채널메인# ("+(i+1)+"). "+_mainName+_detailSuffix+" × "+_qN+"개 = <em>"+_fmtCh(_chOnly)+"원</em></span>";
                    if(it.galvaStenSubText) bd += "<span class='bd_item'>#채널서브# ("+(i+1)+"). 종류: "+it.galvaStenSubText+"</span>";
                    if(it.is13x && it.baseUnitOrig > 0) bd += "<span class='bd_item'>#채널서브# ("+(i+1)+"). 단가 ×1.3 적용: "+_fmtCh(it.baseUnitOrig)+"→"+_fmtCh(it.baseUnit)+"원/자</span>";
                    if(it.textFormText) bd += "<span class='bd_item'>#채널서브# ("+(i+1)+"). "+it.textFormText+(it.baseUnit>0?" @"+it.baseUnit:"")+"</span>";
                    if(it.trimColorText) bd += "<span class='bd_item'>#채널서브# ("+(i+1)+"). 뚜껑: "+it.trimColorText+"</span>";
                    if(it.solidColorText) bd += "<span class='bd_item'>#채널서브# ("+(i+1)+"). 입체(몸통): "+it.solidColorText+"</span>";
                    // LED: v2 형식 — 총비용(per-sign × qty), 채널메인과 독립 항목으로 분리
                    var _jeonT=(it.jeonLedPrice||0)*_qN, _huT=(it.huLedPrice||0)*_qN, _ledT=(it.ledPrice||0)*_qN;
                    if(_jeonT>0) bd += "<span class='bd_item'>#채널LEDv2# 전광 LED("+it.jeonColor+") × "+((it.jeonLedCnt||0)*_qN)+"개 = <em>"+_fmtCh(_jeonT)+"원</em></span>";
                    if(_huT>0)   bd += "<span class='bd_item'>#채널LEDv2# 후광 LED("+it.huColor+") × "+((it.huLedCnt||0)*_qN)+"개 = <em>"+_fmtCh(_huT)+"원</em></span>";
                    if(_ledT>0)  bd += "<span class='bd_item'>#채널LEDv2# LED("+it.ledColor+") × "+((it.ledCnt||0)*_qN)+"개 = <em>"+_fmtCh(_ledT)+"원</em></span>";
                    if(it.dispWorkName) bd += "<span class='bd_item'>#채널서브# ("+(i+1)+"). 화면작업: "+it.dispWorkName+"</span>";
                });
                if(_itemsTotal>0) bd += "<span class='bd_item'>담긴 항목 합계 <em>"+_fmtCh(_itemsTotal)+"원</em></span>";
                var _moreP=nv("#more_order_price")||0;
                bd += extraCostBdItems();
                bd += "</span>";
                total_html += bd;
            })();

            total_html += "<br> / 견적 비용 : <span class='list_price'>";
            total_html += $(".order_info .right_area #order_price").text() + "</span> 원</li>";
         }
    }else if($(".woosung_wrap .tab_area ul li.active").hasClass("child03")){ //간판프레임
    
    }else if($(".woosung_wrap .tab_area ul li.active").hasClass("child04")){ //실사출력
    	if($("#actual_option01").is(":checked")){ //후렉스
            if($("#actual_punch02").is(":checked")){
            	total_html = "<li><span class='number'></span>"+$("#actual_option01").parent("label").text()+" / "+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_type']:checked").parent("label").text()+" / 가로값 :"+$("#frame_product_width").val()+"mm / 세로값 :"+$("#frame_product_vertical").val()+" / 타공(유무 ):"+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_punch']:checked").parent("label").text()+" / 추가작업 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order']:checked").parent("label").text()+" / 추가금액 : "+$("#more_order_price").val()+"원 / 추가입력 사항 : "+$("#add_more_text").val()+"/ 견적 비용 : <span class='list_price'>"+$(".order_info .right_area #order_price").text()+"</span> 원</lI>";
        	}else{
                total_html = "<li><span class='number'></span>"+$("#actual_option01").parent("label").text()+" / "+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_type']:checked").parent("label").text()+" / 가로값 :"+$("#frame_product_width").val()+"mm / 세로값 :"+$("#frame_product_vertical").val()+" / 타공(유무 ):"+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_punch']:checked").parent("label").text()+"/ 타공 개수 : " +$("#actual_punch_count").val()+ "개 / 추가작업 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order']:checked").parent("label").text()+" / 추가금액 : "+$("#more_order_price").val()+"원 / 추가입력 사항 : "+$("#add_more_text").val()+"/ 견적 비용 : <span class='list_price'>"+$(".order_info .right_area #order_price").text()+"</span> 원</lI>";
            }
        }else if($("#actual_option02").is(":checked")){ //UV실사
            total_html += "<li><span class='number'></span>";
            total_html += $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_option']:checked").parent("label").text();
            total_html +=" / 소재 :"+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_material']:checked").parent("label").text();
            if($("#actual_material03").is(":checked")){
                total_html +=" / 레이어 수 :"+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_material03']:checked").parent("label").text();
            }
            total_html +=" / 가로 : "+$("#frame_product_width").val()+" mm";
            total_html +=" / 세로 : "+$("#frame_product_vertical").val()+" mm";
            total_html +="/ 후가공 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order']:checked").parent("label").text();
            if($("#actual_more_order02").is(":checked")){
                total_html +=" / 재단 비용 : "+$("#actual_more_order_price").val()+" 원";
            }
            if(Number($("#channel_trim_color_custom").val()) != 0){
                total_html +=" / "+getExtraCostText();
            }
            if($("#add_more_text").val().length !=0 ){
                total_html +=" / 추가입력 사항 : "+$("#add_more_text").val();
            }

            total_html +="/ 견적 비용 : <span class='list_price'>";
            total_html += $(".order_info .right_area #order_price").text()+"</span> 원</lI>";
        }else if($("#actual_option03").is(":checked")){ //솔벤실사
            total_html += "<li><span class='number'></span>";
            total_html += $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_option']:checked").parent("label").text();
            total_html +=" / 소재 :"+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_material']:checked").parent("label").text();
            total_html +=" / 가로 : "+$("#frame_product_width").val()+" mm";
            total_html +=" / 세로 : "+$("#frame_product_vertical").val()+" mm";
            total_html +="/ 후가공 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order']:checked").parent("label").text();
            if($("#actual_more_order02").is(":checked")){
                total_html +=" / 재단 비용 : "+$("#actual_more_order_price").val()+" 원";
            }else if($("#actual_more_order03").is(":checked")){
                total_html +=" / 코팅 비용 : "+$("#actual_more_order_price").val()+" 원";
            }
            if(Number($("#channel_trim_color_custom").val()) != 0){
                total_html +=" / "+getExtraCostText();
            }
            if($("#add_more_text").val().length !=0 ){
                total_html +=" / 추가입력 사항 : "+$("#add_more_text").val();
            }

            total_html +="/ 견적 비용 : <span class='list_price'>";
            total_html += $(".order_info .right_area #order_price").text()+"</span> 원</lI>";
        }else if($("#actual_option04").is(":checked")){ //수성실사
            
            total_html += "<li><span class='number'></span>";
            total_html += $(".woosung_wrap .contents_wrap #option_table td label input[name='actual_option']:checked").parent("label").text();
            total_html +=" / 소재 :"+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_material']:checked").parent("label").text();
            total_html +=" / 가로(기장) : "+$("#frame_product_width").val()+" mm";
            total_html +=" / 세로(폭) : "+$("#frame_product_vertical").val()+" mm";
            total_html +="/ 후가공 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order']:checked").parent("label").text();
            if($("#actual_more_order04,#actual_more_order05").is(":checked")){
                total_html +=" / 마감 작업 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_more_order_mising']:checked").parent("label").text();
            }
           if(nv("#actual_more_order_price") != 0){
                total_html +=" / 재단 비용 : "+$("#actual_more_order_price").val()+"원";
            }
            if(Number($("#channel_trim_color_custom").val()) != 0){
                total_html +=" / "+getExtraCostText();
            }
            if($("#add_more_text").val().length !=0 ){
                total_html +=" / 추가입력 사항 : "+$("#add_more_text").val();
            }

            total_html +="/ 견적 비용 : <span class='list_price'>";
            total_html += $(".order_info .right_area #order_price").text()+"</span> 원</lI>";
        }
    }else if($(".woosung_wrap .tab_area ul li.active").hasClass("child05")){ //스카시
    	if($("#skasi_option01").is(":checked")){ //고무
     		total_html = "<li><span class='number'></span>"+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_option']:checked").parent("label").text()+" / 문자형태 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_text_form']:checked").parent("label").text()+" / 두께 :"+$(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_thumb']:checked").parent("label").text()+" / 알루미늄 색상 :"+$(".woosung_wrap .contents_wrap #option_table td label input[name='skasicolor_type']:checked").parent("label").text()+" / 수량(총 글자 수) : "+$("#skasicolor_count").val()+" 개 / 고무 색상 : "+$("#skasi_color02").val()+" / 크기 : "+$("#skasi_width").val()+" / 화면색상 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_screen_color']:checked").parent("label").text()+" / "+getExtraCostText()+" / 추가입력 사항 : "+$("#add_more_text").val()+"/ 견적 비용 : <span class='list_price'>"+$(".order_info .right_area #order_price").text()+"</span> 원</lI>";
        }else if($("#skasi_option02").is(":checked")){ //아크릴
           total_html = "<li><span class='number'></span>"+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_option']:checked").parent("label").text()+" / 아크릴 타입 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_acrylic']:checked").parent("label").text()+" / 문자 형태 :"+$(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_text_form']:checked").parent("label").text()+" / 두께 :"+$(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_thumb']:checked").parent("label").text()+" / 수량(총 글자 수) : "+$("#skasi_acrylic_count").val()+" 개 / 색상 : "+$("#skasi_color01").val()+" / 크기 (mm): "+$("#skasi_width").val()+" mm / 화면색상 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_screen_color']:checked").parent("label").text()+" / ※ 도색시※ 도색 가지수 : "+$("#skasi_screen_color_count").val()+"개 / "+getExtraCostText()+" / 추가입력 사항 : "+$("#add_more_text").val()+"/ 견적 비용 : <span class='list_price'>"+$(".order_info .right_area #order_price").text()+"</span> 원</lI>"; 
        }else if($("#skasi_option03").is(":checked")){ //포멕스
            total_html = "<li><span class='number'></span>"+$(".woosung_wrap .contents_wrap #option_table td label input[name='actual_option']:checked").parent("label").text()+" / 문자 형태 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_text_form']:checked").parent("label").text()+" / 두께 :"+$(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_thumb']:checked").parent("label").text()+" / 색상 :"+$(".woosung_wrap .contents_wrap #option_table td label input[name='pomex_color']:checked").parent("label").text()+" / 가로 : "+$("#skasi_product_width").val()+" mm / 세로 : "+$("#skasi_product_vertical").val()+" mm / 화면색상 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='skasi_screen_color']:checked").parent("label").text()+" / 양면 테이프 : "+$(".woosung_wrap .contents_wrap #option_table td label input[name='both_size_tape']:checked").parent("label").text()+" / 수량 : "+$("#pomex_count").val()+"개 / "+getExtraCostText()+" / 추가입력 사항 : "+$("#add_more_text").val()+"/ 견적 비용 : <span class='list_price'>"+$(".order_info .right_area #order_price").text()+"</span> 원</lI>"; 
        }else if($("#skasi_option04").is(":checked")){ //실사 아크릴

        }
    }else if($(".woosung_wrap .tab_area ul li.active").hasClass("child06")){ //공통자재
        var _cmParts = [];
        var _cmBd = "<span class='price_breakdown'>";
        $(".cm-qty").each(function(){
            var key = $(this).data("key");
            var qty = parseInt($(this).val()) || 0;
            if(qty <= 0) return;
            var unit = PRICES[key] || 0;
            var sub = qty * unit;
            var name = $(this).closest("tr").find("th").text();
            _cmParts.push(name + " " + qty + "개");
            _cmBd += "<span class='bd_item'>" + name + " <em>" + qty + "개 × " + fmtNum(unit) + "원 = " + fmtNum(sub) + "원</em></span>";
        });
        var _timerUnit = _getCmTimerUnit(), _timerQty = parseInt($("#cm_timer_qty").val()) || 0;
        if(_timerQty > 0 && _timerUnit > 0) {
            var _timerSpec = $("input[name='cm_timer_spec']:checked").parent("label").text();
            _cmParts.push("전자타이머(" + _timerSpec + ") " + _timerQty + "개");
            _cmBd += "<span class='bd_item'>전자타이머(" + _timerSpec + ") <em>" + _timerQty + "개 × " + fmtNum(_timerUnit) + "원 = " + fmtNum(_timerQty * _timerUnit) + "원</em></span>";
        }
        var _smpsUnit = _getCmSmpsUnit(), _smpsQty = parseInt($("#cm_smps_qty").val()) || 0;
        if(_smpsQty > 0 && _smpsUnit > 0) {
            var _smpsSpec = $("input[name='cm_smps_spec']:checked").parent("label").text();
            _cmParts.push("SMPS(" + _smpsSpec + ") " + _smpsQty + "개");
            _cmBd += "<span class='bd_item'>SMPS(" + _smpsSpec + ") <em>" + _smpsQty + "개 × " + fmtNum(_smpsUnit) + "원 = " + fmtNum(_smpsQty * _smpsUnit) + "원</em></span>";
        }
        var _ctrlUnit = _getCmCtrlUnit(), _ctrlQty = parseInt($("#cm_ctrl_qty").val()) || 0;
        if(_ctrlQty > 0 && _ctrlUnit > 0) {
            var _ctrlSpec = $("input[name='cm_ctrl_spec']:checked").parent("label").text();
            _cmParts.push("LED컨트롤러(" + _ctrlSpec + ") " + _ctrlQty + "개");
            _cmBd += "<span class='bd_item'>LED컨트롤러(" + _ctrlSpec + ") <em>" + _ctrlQty + "개 × " + fmtNum(_ctrlUnit) + "원 = " + fmtNum(_ctrlQty * _ctrlUnit) + "원</em></span>";
        }
        var _ledUnit = _getCmLedUnit(), _ledQty = parseInt($("#cm_led_qty").val()) || 0;
        if(_ledQty > 0 && _ledUnit > 0) {
            var _ledColor = $("input[name='cm_led_color']:checked").parent("label").text();
            _cmParts.push("LED(" + _ledColor + ") " + _ledQty + "개");
            _cmBd += "<span class='bd_item'>LED(" + _ledColor + ") <em>" + _ledQty + "개 × " + fmtNum(_ledUnit) + "원 = " + fmtNum(_ledQty * _ledUnit) + "원</em></span>";
        }
        var _cmMoreP = nv("#more_order_price") || 0;
        _cmBd += extraCostBdItems();
        _cmBd += "</span>";
        total_html = "<li><span class='number'></span>공통자재 / " + _cmParts.join(" / ");
        if($.trim($("#add_more_text").val())) total_html += " / 추가입력 사항 : " + $("#add_more_text").val();
        total_html += _cmBd;
        total_html += " / 견적 비용 : <span class='list_price'>" + $(".order_info .right_area #order_price").text() + "</span> 원</li>";
    }

    $("#total_price_wrap .total_list ul").append(total_html);

    list_sum_price();
    list_delete_func();

    // 추가 후 폼 전체 초기화 (현재 탭 재실행)
    _chItems = [];
    $(".woosung_wrap .tab_area ul li.active").trigger("click");
    $(".order_info .right_area #order_price").text('0');
});
function list_delete_func(){
	$(".total_list ul li .remove_btn").click(function(){
    	$(this).parent().remove();
       list_sum_price();
    });
}

// ── 견적 항목 금액 인라인 편집 (단가 역산 표시, PRICES 불변) ──
$(document).on("click", ".list_price", function(e) {
    e.stopPropagation();
    var $span = $(this);
    if ($span.hasClass("lp-editing")) return;
    $span.addClass("lp-editing");

    var cur = _r10(parseInt($span.text().replace(/[^0-9]/g, ""), 10) || 0);

    // 수량 파싱 — "수량 : N개" 또는 "수량: N개"
    var liText = $span.closest("li").text();
    var qtyMatch = liText.match(/수량\s*:?\s*(\d+)\s*개/);
    var qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

    $span.html('<input type="number" class="list_price_input" value="' + cur + '" min="0" />');
    if (qty > 1) {
        $span.append('<em class="lp-unit-hint">(단가 ' +
            _r10(Math.round(cur / qty)).toLocaleString("ko-KR") + '원 / ' + qty + '개)</em>');
    }

    $span.find("input").focus().select().on("input.lp", function() {
        if (qty <= 1) return;
        var t = parseInt($(this).val(), 10) || 0;
        $span.find(".lp-unit-hint").text(
            "(단가 " + _r10(Math.round(t / qty)).toLocaleString("ko-KR") + "원 / " + qty + "개)");
    });
});

$(document).on("blur", ".list_price_input", function() {
    var $span = $(this).closest(".list_price");
    var val = _r10(parseInt($(this).val(), 10) || 0);
    $span.removeClass("lp-editing");
    $span.text(String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    list_sum_price();
});

$(document).on("keydown", ".list_price_input", function(e) {
    if (e.key === "Enter") $(this).blur();
    if (e.key === "Escape") $(this).blur();
});

// ── .bd-chip .bd-price 클릭 → 회색 배지 금액 편집 (단가 비례, PRICES 불변) ──
$(document).on("click", ".bd-chip .bd-price", function(e) {
    e.stopPropagation();
    var $strong = $(this);
    var $chip = $strong.closest(".bd-chip");
    if ($chip.hasClass("bd-price-editing")) return;

    var $li = $chip.closest("li");
    var bdIdx = parseInt($chip.data("bd-idx"), 10);
    var $bdEm = $li.find(".price_breakdown .bd_item").eq(bdIdx).find("em");

    var origEmText = $bdEm.text();
    var totalMatch = origEmText.match(/([\d,]+)원\s*$/);
    if (!totalMatch) return;
    var oldTotal = parseInt(totalMatch[1].replace(/,/g, ""), 10);
    if (!oldTotal) return;

    $chip.addClass("bd-price-editing").data("bd-em-orig", origEmText).data("bd-idx-saved", bdIdx);
    $strong.html('<input type="number" class="bd-price-input" value="' + oldTotal + '" min="0" />원');
    $strong.find("input").focus().select();
});

$(document).on("blur", ".bd-price-input", function() {
    var $input = $(this);
    if ($input.data("bd-cancelled")) return;

    var $strong = $input.closest("strong");
    var $chip = $strong.closest(".bd-chip");
    var $li = $chip.closest("li");
    var newTotal = _r10(parseInt($input.val(), 10) || 0);

    var bdIdx = parseInt($chip.data("bd-idx-saved"), 10);
    var $bdEm = $li.find(".price_breakdown .bd_item").eq(bdIdx).find("em");
    var origEmText = $chip.data("bd-em-orig") || $bdEm.text();

    var totalMatch = origEmText.match(/([\d,]+)원\s*$/);
    var oldTotal = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ""), 10) : newTotal;
    var ratio = oldTotal > 0 ? newTotal / oldTotal : 1;

    // em 내 단가 비례 재계산
    var newEmText = origEmText;
    newEmText = newEmText.replace(/(× )([\d,]+)(원\/m²)/g, function(_, pre, num, suf) {
        return pre + _r10(Math.round(parseInt(num.replace(/,/g,""),10) * ratio)).toLocaleString("ko-KR") + suf;
    });
    newEmText = newEmText.replace(/(× )([\d,]+)(원\/m)(?!²)/g, function(_, pre, num, suf) {
        return pre + _r10(Math.round(parseInt(num.replace(/,/g,""),10) * ratio)).toLocaleString("ko-KR") + suf;
    });
    newEmText = newEmText.replace(/(× )([\d,]+)(원)(?=\s*=)/g, function(_, pre, num, won) {
        return pre + _r10(Math.round(parseInt(num.replace(/,/g,""),10) * ratio)).toLocaleString("ko-KR") + won;
    });
    newEmText = newEmText.replace(/([\d,]+)(원\s*)$/, newTotal.toLocaleString("ko-KR") + "$2");

    $bdEm.text(newEmText);

    // 비주얼 재구성 (reformatBreakdown이 합계 및 list_price도 갱신)
    $chip.removeClass("bd-price-editing");
    $li.find(".bd-visual").remove();
    $li.removeClass("bd-fmted");
    reformatBreakdown($li);
    list_sum_price();
});

$(document).on("keydown", ".bd-price-input", function(e) {
    if (e.key === "Enter") { $(this).blur(); return; }
    if (e.key === "Escape") {
        e.preventDefault();
        $(this).data("bd-cancelled", true);
        var $chip = $(this).closest(".bd-chip");
        var $li = $chip.closest("li");
        $chip.removeClass("bd-price-editing");
        $li.find(".bd-visual").remove();
        $li.removeClass("bd-fmted");
        reformatBreakdown($li);
        $(this).off("blur").remove();
    }
});

// " / " 구분자를 시각적 줄바꿈으로 변환 (한 번만 실행)
function reformatLiDisplay($li) {
    if ($li.hasClass("fmted")) return;
    $li.addClass("fmted");

    $li.contents().each(function() {
        if (this.nodeType !== 3) return;          // 텍스트 노드만 처리
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

function reformatBreakdown($li) {
    if ($li.hasClass('bd-fmted')) return;
    $li.addClass('bd-fmted');

    var $pb = $li.find('.price_breakdown');
    if (!$pb.length) return;

    var bdTexts = [];
    $pb.find('.bd_item').each(function() { bdTexts.push($(this).text().trim()); });
    if (!bdTexts.length) return;

    // 합계 계산 (담긴항목합계·구형채널LED·채널서브 제외, 신형LEDv2 포함)
    var chipTotal = 0;
    bdTexts.forEach(function(txt) {
        if (/담긴 항목 합계/.test(txt)) return;
        if (/^#채널LED#/.test(txt)) return;   // 구형: 채널메인 가격에 이미 포함
        if (/^#채널서브#/.test(txt)) return;
        var m = txt.match(/([\d,]+)원\s*$/);
        if (m) chipTotal += parseInt(m[1].replace(/,/g, ''), 10);
    });

    // 신형(v2) LED 항목별 총액 맵 — bd-ch-hdr 총액 표시용
    var ledV2TotalByIdx = {};
    var _curChIdx = null;
    bdTexts.forEach(function(txt) {
        var _mM = txt.match(/^#채널메인#\s+\((\d+)\)/);
        if (_mM) { _curChIdx = _mM[1]; return; }
        if (/^#채널LEDv2#/.test(txt)) {
            var _m = txt.match(/([\d,]+)원\s*$/);
            if (_m && _curChIdx !== null) {
                ledV2TotalByIdx[_curChIdx] = (ledV2TotalByIdx[_curChIdx] || 0) + parseInt(_m[1].replace(/,/g,''), 10);
            }
        }
    });

    var chCount = bdTexts.filter(function(t){ return /^#채널메인#/.test(t); }).length;
    var nos = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];

    function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function fmtN(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,','); }
    function tipHtml(unitLabel){
        return '<span class="bd-unit-q">?<span class="bd-unit-tip">단가: ' + esc(unitLabel) + '</span></span>';
    }
    // 일반 텍스트에서 단가 추출 (우선순위 순)
    function extractUnit(txt) {
        if (/정액/.test(txt)) return null;
        // 1. "N개 × M원" (까치발/SMPS/LED/공통자재: 가장 명확)
        var m1 = txt.match(/(\d[\d,]*)개\s*×\s*([\d,]+)원/);
        if (m1) return m1[2] + '원/개';
        // 2. "N원/m²" (화면작업/뒷판작업/실사출력)
        var m2 = txt.match(/([\d,]+)원\/m²/);
        if (m2) return m2[1] + '원/m²';
        // 3. "N원/m" (스텐몰딩/트러스바 m당) — m² 포함 텍스트 제외
        var m3 = txt.match(/([\d,]+)원\/m(?![²])/);
        if (m3) return m3[1] + '원/m';
        // 4. "m²) × N원 =" (색상도장: 면적×단가=합계)
        var m4 = txt.match(/m²\)\s*×\s*([\d,]+)원\s*=/);
        if (m4) return m4[1] + '원/m²';
        // 5. "× N원 =" (기본가/등박스 등: 단가가 직접 표기)
        var m5 = txt.match(/×\s+([\d,]+)원\s*=/);
        if (m5) return m5[1] + '원';
        // 6. "× N개 = M원" (완조립/추가금액 등: 역산)
        var m6 = txt.match(/×\s+(\d+)개\s+=\s+([\d,]+)원/);
        if (m6) { var n=parseInt(m6[1]),t=Number(m6[2].replace(/,/g,'')); return fmtN(Math.round(t/n))+'원/개'; }
        // 7. "× N식 = M원" (N > 1인 경우만)
        var m7 = txt.match(/×\s+(\d+)식\s+=\s+([\d,]+)원/);
        if (m7) { var n=parseInt(m7[1]),t=Number(m7[2].replace(/,/g,'')); return n>1?fmtN(Math.round(t/n))+'원/식':null; }
        return null;
    }

    var html = '';
    bdTexts.forEach(function(txt, bdIdx) {
        var di = ' data-bd-idx="' + bdIdx + '"';
        // 채널 메인 항목
        var mainM = txt.match(/^#채널메인#\s+\((\d+)\)\.\s+(.+?)\s+×\s+(\d+)개\s+=\s+([\d,]+)원/);
        if (mainM) {
            if (chCount > 1) {
                var n = parseInt(mainM[1]);
                var _chOnlyP = Number(mainM[4].replace(/,/g,''));
                var _totalItemP = _chOnlyP + (ledV2TotalByIdx[String(n)] || 0);
                html += '<div class="bd-ch-hdr">세부 항목 ' + (nos[n-1]||n) + '<span class="bd-ch-hdr-price">' + fmtN(_totalItemP) + '원</span></div>';
            }
            var qty = parseInt(mainM[3]), total = Number(mainM[4].replace(/,/g,''));
            var unit = qty > 0 ? Math.round(total/qty) : total;
            html += '<span class="bd-chip bd-chip-main"' + di + '>'
                  + esc(mainM[2]) + ' × ' + mainM[3] + '개 = <strong class="bd-price">' + esc(mainM[4]) + '원</strong>'
                  + tipHtml(fmtN(unit) + '원/개')
                  + '</span>';
            return;
        }
        // 채널 서브 옵션
        var subM = txt.match(/^#채널서브#\s+\(\d+\)\.\s+(.+)/);
        if (subM) {
            var subTxt = subM[1];
            var atM = subTxt.match(/^(.+?)\s+@(\d+)$/);
            if (atM) {
                html += '<span class="bd-chip bd-chip-sub"' + di + '>└ ' + esc(atM[1]) + tipHtml(fmtN(parseInt(atM[2])) + '원/개') + '</span>';
            } else {
                html += '<span class="bd-chip bd-chip-sub"' + di + '>└ ' + esc(subTxt) + '</span>';
            }
            return;
        }
        // 신형 LED v2 (채널메인과 독립 항목, 총비용 = per-sign × qty)
        var ledV2M = txt.match(/^#채널LEDv2#\s+(.+?)\s+×\s+(\d+)개\s+=\s+([\d,]+)원/);
        if (ledV2M) {
            var qty = parseInt(ledV2M[2]), total = Number(ledV2M[3].replace(/,/g,''));
            var unit = qty > 0 ? Math.round(total/qty) : total;
            html += '<span class="bd-chip bd-chip-led"' + di + '>'
                  + esc(ledV2M[1]) + ' × ' + ledV2M[2] + '개 = <strong class="bd-price">' + esc(ledV2M[3]) + '원</strong>'
                  + tipHtml(fmtN(unit) + '원/개')
                  + '</span>';
            return;
        }
        // 구형 LED (채널메인 가격에 포함, 하위 표시)
        var ledM = txt.match(/^#채널LED#\s+(.+?)\s+×\s+(\d+)개\s+=\s+([\d,]+)원/);
        if (ledM) {
            var qty = parseInt(ledM[2]), total = Number(ledM[3].replace(/,/g,''));
            var unit = qty > 0 ? Math.round(total/qty) : total;
            html += '<span class="bd-chip bd-chip-main"' + di + '>'
                  + '└ ' + esc(ledM[1]) + ' × ' + ledM[2] + '개 = <strong class="bd-price">' + esc(ledM[3]) + '원</strong>'
                  + tipHtml(fmtN(unit) + '원/개')
                  + '</span>';
            return;
        }
        // 담긴 항목 합계 — 생략
        if (/담긴 항목 합계/.test(txt)) return;
        // 일반 항목
        var genM = txt.match(/^(.+?)\s+=\s+([\d,]+)원$/);
        if (genM) {
            var unitL = extractUnit(txt);
            html += '<span class="bd-chip"' + di + '>'
                  + esc(genM[1]) + ' = <strong class="bd-price">' + esc(genM[2]) + '원</strong>'
                  + (unitL ? tipHtml(unitL) : '')
                  + '</span>';
        } else if (txt) {
            html += '<span class="bd-chip"' + di + '>' + esc(txt) + '</span>';
        }
    });

    if (!html) return;
    if (chipTotal > 0) {
        html += '<div class="bd-sum-row">합계 <strong class="bd-sum-val">' + fmtN(chipTotal) + '원</strong></div>';
        $li.find(".list_price").text(fmtN(chipTotal));
    }
    $pb.hide();
    $('<div class="bd-visual">' + html + '</div>').insertAfter($pb);
}

function list_sum_price(){
    var total_price = 0;
	  $(".total_list ul li").each(function(i){
        $(this).find(".number").text((i+1)+". ");
        reformatLiDisplay($(this));
        reformatBreakdown($(this));
       if($(this).find(".remove_btn").length == 0){
       	$(this).append("<span class='remove_btn'></span>");
       }
    	total_price = total_price + Number($(this).find(".list_price").text().replace(/[^0-9]/g, ""));
    });
    $("#total_price_wrap .price_info .right_area .price").html(String(_r10(total_price)).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    saveToStorage();
}

// ── Firebase 저장 단가 로드
$(function(){
    _initPricesDoc();
    if (_pricesDoc) {
        _pricesDoc.get()
            .then(function(doc) {
                if (!doc.exists) return;
                var saved = doc.data();
                Object.keys(DEFAULT_PRICES).forEach(function(key) {
                    if (saved[key] !== undefined) PRICES[key] = saved[key];
                });
                recalcCurrent();
            })
            .catch(function(){});
    }

    // option_table 동적 입력 콤마 포맷
    $(document).on('input', '#option_table input.comma-fmt', function(){
        formatCommaInput(this);
    });


    // 견적서 출력 버튼
    $("#btn_print_estimate").click(openPrintModal);

    // 목록 초기화 버튼
    $("#btn_clear_list").click(function(){
        if($(".total_list ul li").length === 0) return;
        if(confirm("견적 목록을 모두 초기화하시겠습니까?")) {
            $("#total_price_wrap .total_list ul").empty();
            list_sum_price();
        }
    });

    // 출력 모달 이벤트
    $("#modal_close, #modal_cancel").click(closePrintModal);
    $("#print_modal").click(function(e){ if(e.target === this) closePrintModal(); });
    $("#modal_confirm_print").click(doPrintEstimate);

    // 저장된 견적 목록 복원
    loadFromStorage();

    // ── 견적 저장 버튼 ────────────────────────────────────────
    $("#btn_save_estimate").click(function(){
        if (!$("#total_price_wrap .total_list ul li").length) {
            alert("저장할 견적 항목이 없습니다.");
            return;
        }
        var today = new Date();
        var d = today.getFullYear() + '-' +
                ('0'+(today.getMonth()+1)).slice(-2) + '-' +
                ('0'+today.getDate()).slice(-2);
        $("#save_estimate_date").val(d);
        $("#save_estimate_name").val('');
        loadVendorNames(function(names) {
            var opts = '<option value="">-- 업체 선택 (선택 안 함) --</option>';
            opts += names.map(function(n){ return '<option value="' + escHtml(n) + '">' + escHtml(n) + '</option>'; }).join('');
            $("#save_estimate_company").html(opts).val('');
        });
        $("#save_name_modal").fadeIn(200, function(){ $(this).css("display","flex"); });
        setTimeout(function(){ $("#save_estimate_company").focus(); }, 220);
    });

    $("#save_name_close, #save_name_cancel").click(function(){
        $("#save_name_modal").fadeOut(200);
    });
    $("#save_name_modal").click(function(e){ if(e.target===this) $(this).fadeOut(200); });

    $("#save_name_confirm").click(function(){
        var company = $.trim($("#save_estimate_company").val());
        var name = $.trim($("#save_estimate_name").val());
        if (!name) { $("#save_estimate_name").focus(); return; }
        saveEstimate(name, $("#save_estimate_date").val(), company);
        $("#save_name_modal").fadeOut(200);
    });
    $("#save_estimate_name").keypress(function(e){
        if (e.which === 13) $("#save_name_confirm").click();
    });
    $("#save_estimate_company").on('change', function(){
        setTimeout(function(){ $("#save_estimate_name").focus(); }, 50);
    });

    // ── 견적 비용 스티키 (하단 고정) ──────────────────────────
    // 바의 하단이 뷰포트 아래로 내려가면 화면 맨 밑에 고정,
    // 스크롤로 원래 위치에 도달하면 그 자리에 안착.
    (function(){
        var $bar = $(".order_info");
        if (!$bar.length) return;
        var $sp  = $('<div class="order_info_spacer">').insertAfter($bar);
        var on   = false;

        function check() {
            var st  = $(window).scrollTop();
            var wh  = $(window).height();
            if (!on) {
                var barTop = $bar.offset().top;
                var barH   = $bar.outerHeight();
                // 바의 하단이 뷰포트 아래로 내려가면 sticky 활성화
                if (barTop + barH > st + wh) {
                    $sp.height(barH).show();
                    $bar.addClass("sticky-active");
                    on = true;
                }
            } else {
                var spTop = $sp.offset().top;
                var spH   = $sp.height();
                // 스크롤로 원래 위치가 뷰포트 안에 들어오면 안착
                if (spTop + spH <= st + wh) {
                    $bar.removeClass("sticky-active");
                    $sp.hide();
                    on = false;
                }
            }
        }

        $(window).on("scroll.orderSticky resize.orderSticky", check);

        // 옵션 선택 시 테이블 높이 변화도 감지
        if (window.MutationObserver) {
            var moTimer;
            var mo = new MutationObserver(function() {
                clearTimeout(moTimer);
                moTimer = setTimeout(check, 30);
            });
            var tbl = document.getElementById("option_table");
            if (tbl) mo.observe(tbl, { childList: true, subtree: true, attributes: true });
        }

        check();
    })();
});

function recalcCurrent(){
    var $tab = $(".woosung_wrap .tab_area ul li.active");
    if($tab.hasClass("child01")){
        if($("#sigh_option01").is(":checked") || $("#sigh_option02").is(":checked")){
            // 사인탑 비조명/조명 - 가로/세로 change 이벤트 트리거
            $("#sigh_row").trigger("change");
        } else if($("#sigh_option03").is(":checked")){
            $("input[name='sigh_angle_width']:checked").trigger("change");
        }
    } else if($tab.hasClass("child02")){
        if($("input[name='channel_option']:checked").length) chnnel_taka_cal();
    } else if($tab.hasClass("child04")){
        if($("#actual_option01").is(":checked")) whoorex_cal();
        else if($("#actual_option02").is(":checked")) uv_silsa_cal();
        else if($("#actual_option03").is(":checked")) solven_silsa_cal();
        else if($("#actual_option04").is(":checked")) soosung_silsa_cal();
    }
}
// ─────────────────────────────────────────────────────────

// ── localStorage 저장/불러오기 ──────────────────────────────
function saveToStorage() {
    try {
        var $ul = $("#total_price_wrap .total_list ul");
        if (!$ul.length) return;
        var $clone = $ul.clone();
        $clone.find(".remove_btn").remove();
        localStorage.setItem("estimate_list_v1", $clone.html());
    } catch(e) {}
}

function loadFromStorage() {
    try {
        var saved = localStorage.getItem("estimate_list_v1");
        if (saved && saved.trim()) {
            $("#total_price_wrap .total_list ul").html(saved);
            list_sum_price();
            list_delete_func();
        }
    } catch(e) {}
}

// ── 한글 금액 변환 ──────────────────────────────────────────
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

// ── HTML 이스케이프 ─────────────────────────────────────────
function escHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── 견적 항목 데이터 추출 ───────────────────────────────────
function getEstimateItems($src) {
    var items = [];
    var $lis = $src ? $src.find("li") : $(".total_list ul li");
    $lis.each(function(i) {
        var $li = $(this);
        var priceText = $li.find(".list_price").text().trim();
        var priceNum  = _r10(Number(priceText.replace(/[^0-9]/g, '')));

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

        items.push({
            no: i + 1,
            category: category,
            details:  details,
            breakdown: bdParts.join(' / '),
            priceText: priceText,
            priceNum:  priceNum
        });
    });
    return items;
}

// ── 출력 모달 열기/닫기 ─────────────────────────────────────
function openPrintModal() {
    if ($(".total_list ul li").length === 0) {
        alert("출력할 견적 항목이 없습니다.");
        return;
    }
    $("#print_modal").fadeIn(200, function(){ $(this).css('display','flex'); });
    setTimeout(function(){ $("#print_customer").focus(); }, 220);
}

function closePrintModal() {
    $("#print_modal").fadeOut(200);
}

// ── 견적서 HTML 생성 (공통) ──────────────────────────────────
function parseBdRow(t) {
    t = (t || '').trim();
    var eqIdx = t.lastIndexOf('='), mulIdx = t.lastIndexOf('×');
    if (mulIdx < 0) mulIdx = t.lastIndexOf('x');
    if (eqIdx > 0 && mulIdx > 0 && mulIdx < eqIdx) {
        var before = t.substring(0, mulIdx).trim();
        var after  = t.substring(mulIdx + 1, eqIdx).trim();
        var totalPart = t.substring(eqIdx + 1).trim();
        var tM = totalPart.match(/([\d,]+)/);
        var total = tM ? tM[1] : '', unit = '', qty = '';
        var qtyOnlyM = after.match(/^(\d+)[개자식]?$/);
        if (qtyOnlyM) {
            qty = qtyOnlyM[1];
            var _qNum = parseInt(qty) || 1;
            var _tNum = Number(total.replace(/,/g,'')) || 0;
            unit = String(Math.round(_tNum / _qNum)).replace(/\B(?=(\d{3})+(?!\d))/g,',');
        } else {
            var uM = after.match(/([\d,]+)/);
            unit = uM ? uM[1] : '';
            var qtyM = before.match(/\s+(\d+)[개자]$/);
            if (qtyM) { qty = qtyM[1]; before = before.substring(0, before.length - qtyM[0].length).trim(); }
        }
        return { name: before, qty: qty, unit: unit, total: total };
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
    items.forEach(function(item, itemIdx) {
        // 항목 구분 헤더 행
        tableRows.push({ separator: true, label: (itemIdx + 1) + '. ' + item.category, total: _f(item.priceNum) });
        var chItemLines = [];
        if (item.breakdown) {
            var parts = item.breakdown.split(' / '), added = false;
            parts.forEach(function(p) {
                // 신형: "#채널메인# (N). name × qty개 = price원"
                var chMainM = p.match(/^#채널메인#\s+\((\d+)\)\.\s+(.+?)\s+×\s+(\d+)개\s+=\s+([\d,]+)원/);
                if (chMainM) {
                    var _chNo = parseInt(chMainM[1]);
                    // 담기 항목 여러 개일 때만 번호 헤더 표시 (사전 카운트)
                    if (!item._chMainCount) {
                        item._chMainCount = parts.filter(function(pp){ return /^#채널메인#/.test(pp); }).length;
                    }
                    if (item._chMainCount > 1) {
                        var _nos = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];
                        chItemLines.push({ itemHeader: true, label: '세부 항목 ' + (_nos[_chNo-1] || _chNo), total: chMainM[4] });
                    }
                    var _qty = parseInt(chMainM[3]);
                    var _total = Number(chMainM[4].replace(/,/g, ''));
                    var _unit = _qty > 0 ? Math.round(_total / _qty) : _total;
                    chItemLines.push({ name: chMainM[2], qty: String(_qty), unit: _f(_unit), total: chMainM[4] });
                    added = true;
                    return;
                }
                // 신형: "#채널서브# (N). 옵션명" – 설명 행 (가격 없음)
                var chSubM = p.match(/^#채널서브#\s+\((\d+)\)\.\s+(.+)$/);
                if (chSubM) {
                    var _subName = chSubM[2].replace(/\s+@\d+$/, '');
                    chItemLines.push({ name: '└ ' + _subName, qty: '-', unit: '-', total: '-' });
                    added = true;
                    return;
                }
                // 구형 호환: "#채널# (N). label × qty자 = price원"
                var chM = p.match(/^#채널#\s+\((\d+)\)\.\s+(.+?)\s+×\s+(\d+)[자개]\s+=\s+([\d,]+)원/);
                if (chM) {
                    var _qty = parseInt(chM[3]);
                    var _total = Number(chM[4].replace(/,/g, ''));
                    var _unit = _qty > 0 ? Math.round(_total / _qty) : _total;
                    var _cleanLabel = chM[2].replace(/수량:\s*\d+[자개]\s*·?\s*/g, '').replace(/·\s*$/g, '').trim();
                    chItemLines.push({ name: item.category + ' - ' + _cleanLabel, qty: String(_qty), unit: _f(_unit), total: chM[4] });
                    added = true;
                    return;
                }
                // LED 상세: "#채널LED# LED(color) × cnt개 = price원"
                var ledM = p.match(/^#채널LED#\s+LED\((.+?)\)\s+×\s+(\d+)개\s+=\s+([\d,]+)원/);
                if (ledM) {
                    var _lc = parseInt(ledM[2]), _lt = Number(ledM[3].replace(/,/g,''));
                    var _lu = _lc > 0 ? Math.round(_lt / _lc) : 0;
                    chItemLines.push({ name: '└ LED(' + ledM[1] + ')', qty: String(_lc), unit: _f(_lu), total: ledM[3] });
                    added = true;
                    return;
                }
                if (chItemLines.length > 0 && p.indexOf('담긴 항목 합계') > -1) return;
                var r = parseBdRow(p);
                if (r) {
                    // 인쇄 전용: 색상도장 → "지정색 도장 (입력 값 : OO)", 단가 제거
                    if (r.name && r.name.indexOf('색상도장') >= 0) {
                        var _colorM = (item.details || '').match(/지정색 도장\s*:\s*([^\n]+)/);
                        var _colorN = _colorM ? _colorM[1].trim() : '';
                        r.name = "지정색 도장" + (_colorN ? " (입력 값 : " + _colorN + ")" : "");
                        r.qty = ''; r.unit = '';
                    }
                    // 인쇄 전용: 뒷판작업 → 사이즈·단가 제거
                    if (r.name && r.name.indexOf('뒷판작업') >= 0) {
                        r.name = "뒷판작업"; r.qty = ''; r.unit = '';
                    }
                    // 인쇄 전용: 까치발 → 사이즈 추가
                    if (r.name === "까치발") {
                        var _sizeM = (item.details || '').match(/크기\s*:\s*([^\n]+)/);
                        if (_sizeM) r.name = "까치발(" + _sizeM[1].trim() + ")";
                    }
                    tableRows.push(r); added = true;
                }
            });
            chItemLines.forEach(function(r) { tableRows.push(r); added = true; });
            if (!added) tableRows.push({ name: item.category, qty: '1', unit: _f(item.priceNum), total: _f(item.priceNum) });
        } else {
            tableRows.push({ name: item.category, qty: '1', unit: _f(item.priceNum), total: _f(item.priceNum) });
        }
    });

    var rowsHtml = '';
    var dataRowCount = 0;
    tableRows.forEach(function(r) {
        if (r.separator) {
            rowsHtml += '<tr class="item-sep"><td colspan="3">' + escHtml(r.label) + '</td><td class="tr item-sep-total">' + escHtml(r.total) + '원</td></tr>';
        } else if (r.itemHeader) {
            rowsHtml += '<tr class="item-ch-hd"><td colspan="2" class="item-ch-hd-lbl">' + escHtml(r.label) + '</td><td colspan="2" class="item-ch-hd-price">' + escHtml(r.total) + '원</td></tr>';
        } else {
            dataRowCount++;
            rowsHtml += '<tr><td>' + escHtml(r.name) + '</td><td class="tc">' + escHtml(r.qty) + '</td><td class="tr">' + escHtml(r.unit) + '</td><td class="tr">' + escHtml(r.total) + '</td></tr>';
        }
    });
    for (var ei = dataRowCount; ei < 12; ei++) rowsHtml += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';

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
    '.item-sep{background:#e8edf5}.item-sep td{border-top:2px solid #4a6fa5;border-bottom:1px solid #4a6fa5;padding:4px 8px;font-weight:bold;font-size:9pt;color:#1a3a6b}.item-sep-total{text-align:right;white-space:nowrap}' +
    '.item-ch-hd{background:#f5f0ff}.item-ch-hd td{border-top:2px dashed #7c5cbf;border-bottom:1px solid #c9b8f0;padding:3px 8px;font-size:8.5pt}.item-ch-hd-lbl{font-weight:bold;color:#4a2d8f;letter-spacing:1px}.item-ch-hd-price{text-align:right;color:#4a2d8f;font-weight:bold;white-space:nowrap}' +
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

// ── 견적서 출력 ─────────────────────────────────────────────
function doPrintEstimate() {
    var customer = $("#print_customer").val().trim() || '　';
    var manager  = $("#print_manager").val().trim();
    var notes    = $("#print_notes").val().trim();
    var items    = getEstimateItems();
    var totalNum = 0;
    items.forEach(function(it){ totalNum += it.priceNum; });
    totalNum = _r10(totalNum);
    var html = buildPrintDoc(items, totalNum, customer, manager, notes);
    openPrintWindow(html);
    closePrintModal();
    _savePrintHistory({
        customer: customer.trim() === '' || customer === '　' ? '' : customer,
        manager: manager,
        notes: notes,
        total: totalNum,
        totalFormatted: String(totalNum).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        htmlContent: html,
        printedAt: firebase.firestore.FieldValue.serverTimestamp(),
        date: (function(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })()
    });
}

function _savePrintHistory(data) {
    try {
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey) return;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        firebase.firestore().collection('printHistory').add(data)
            .catch(function(e){ console.warn('출력 내역 저장 실패:', e); });
    } catch(e){ console.warn('출력 내역 저장 오류:', e); }
}
// ─────────────────────────────────────────────────────────

// ── 견적 아카이브 (저장/불러오기/내역보기) ──────────────────
// Firebase Firestore를 우선 사용하고, 미설정 시 localStorage로 fallback
var ARCHIVE_KEY = 'estimate_archives_v1';
var _archivesDoc = null;

function _initFirestore() {
    if (_archivesDoc) return;
    try {
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') return;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        _archivesDoc = firebase.firestore().collection('estimates').doc('archive_list');
    } catch(e) {}
}

function loadVendorNames(cb) {
    try {
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') { cb([]); return; }
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        firebase.firestore().collection('vendors').orderBy('createdAt', 'asc').get()
            .then(function(snap) {
                var names = [];
                snap.forEach(function(doc) { if (doc.data().name) names.push(doc.data().name); });
                cb(names);
            })
            .catch(function() { cb([]); });
    } catch(e) { cb([]); }
}

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

// 현재 견적 목록을 이름+날짜와 함께 저장
function saveEstimate(name, date, company) {
    var $ul = $("#total_price_wrap .total_list ul");
    var $clone = $ul.clone();
    $clone.find(".remove_btn").remove();

    var totalNum = 0;
    $ul.find("li").each(function(){
        totalNum += Number($(this).find(".list_price").text().replace(/[^0-9]/g, ''));
    });
    totalNum = _r10(totalNum);

    var arc = {
        id:             'est_' + Date.now(),
        name:           name,
        company:        company || '',
        date:           date,
        status:         '대기',
        proceed:        '',
        paid:           0,
        total:          totalNum,
        totalFormatted: String(totalNum).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        itemCount:      $ul.find("li").length,
        itemsHtml:      $clone.html()
    };

    getArchives(function(list) {
        list.unshift(arc);
        setArchives(list, function() {
            $("#total_price_wrap .total_list ul").empty();
            list_sum_price();
        });
    });
}

// ─────────────────────────────────────────────────────────
