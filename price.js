// ── 단가 기본값 ──────────────────────────────────────────────
var DEFAULT_PRICES = {
    sign01_flex_print: 30000, sign01_flex_sheet: 32000, sign01_tension_none: 22000,
    sign02_flex_print: 38000, sign02_flex_sheet: 40000, sign02_tension_none: 30000,
    sign03_w800: 70000, sign03_w900: 75000, sign03_w1000: 80000, sign03_w1100: 85000, sign03_w1200: 90000,
    sign03_flex_uv: 8000, sign03_flex_sol: 7000, sign03_flex_sheet: 10000,
    sign_led: 4500, sign_sten_molding: 20000, sign_color_paint_nol: 10000, sign_color_paint_light: 10000,
    angle_w200: 2000, angle_w250: 2500, angle_w300: 3000, angle_w400: 3500, angle_w500: 4000, angle_w600: 4200, angle_w700: 4500,
    angle_w800: 4800, angle_w900: 5000, angle_w1000: 5800, angle_w1100: 5800,
    angle_w1200: 6000, angle_w1300: 6800, angle_w1400: 6800, angle_w1500: 6800,
    angle_w1600: 7000, angle_w1700: 7200, angle_w1800: 7400, angle_w1900: 7600, angle_w2000: 8200,
    ch_taka_eng_30: 25000, ch_taka_eng_40: 28000, ch_taka_eng_50: 34000, ch_taka_eng_60: 40000,
    ch_taka_eng_70: 43000, ch_taka_eng_80: 48000, ch_taka_eng_90: 50000, ch_taka_eng_100: 54000,
    ch_taka_eng_110: 66000, ch_taka_eng_120: 78000, ch_taka_eng_130: 94000, ch_taka_eng_140: 115000, ch_taka_eng_150: 130000,
    ch_taka_kor_30: 25000, ch_taka_kor_40: 28000, ch_taka_kor_50: 34000, ch_taka_kor_60: 40000,
    ch_taka_kor_70: 43000, ch_taka_kor_80: 48000, ch_taka_kor_90: 50000, ch_taka_kor_100: 54000,
    ch_taka_kor_110: 66000, ch_taka_kor_120: 78000, ch_taka_kor_130: 94000, ch_taka_kor_140: 115000, ch_taka_kor_150: 130000,
    ch_taka_got_30: 25000, ch_taka_got_40: 28000, ch_taka_got_50: 34000, ch_taka_got_60: 40000,
    ch_taka_got_70: 43000, ch_taka_got_80: 48000, ch_taka_got_90: 50000, ch_taka_got_100: 54000,
    ch_taka_got_110: 66000, ch_taka_got_120: 78000, ch_taka_got_130: 94000, ch_taka_got_140: 115000, ch_taka_got_150: 130000,
    ch_titan_eng_20: 0, ch_titan_eng_25: 0, ch_titan_eng_30: 0, ch_titan_eng_35: 0, ch_titan_eng_40: 0, ch_titan_eng_45: 0, ch_titan_eng_50: 0, ch_titan_eng_60: 0, ch_titan_eng_70: 0, ch_titan_eng_80: 0, ch_titan_eng_90: 0, ch_titan_eng_100: 0,
    ch_titan_got_20: 0, ch_titan_got_25: 0, ch_titan_got_30: 0, ch_titan_got_35: 0, ch_titan_got_40: 0, ch_titan_got_45: 0, ch_titan_got_50: 0, ch_titan_got_60: 0, ch_titan_got_70: 0, ch_titan_got_80: 0, ch_titan_got_90: 0, ch_titan_got_100: 0,
    ch_sten_eng_20: 0, ch_sten_eng_25: 0, ch_sten_eng_30: 0, ch_sten_eng_35: 0, ch_sten_eng_40: 0, ch_sten_eng_45: 0, ch_sten_eng_50: 0, ch_sten_eng_60: 0, ch_sten_eng_70: 0, ch_sten_eng_80: 0, ch_sten_eng_90: 0, ch_sten_eng_100: 0,
    ch_sten_got_20: 0, ch_sten_got_25: 0, ch_sten_got_30: 0, ch_sten_got_35: 0, ch_sten_got_40: 0, ch_sten_got_45: 0, ch_sten_got_50: 0, ch_sten_got_60: 0, ch_sten_got_70: 0, ch_sten_got_80: 0, ch_sten_got_90: 0, ch_sten_got_100: 0,
    ch_galva_eng_30: 0, ch_galva_eng_35: 0, ch_galva_eng_40: 0, ch_galva_eng_45: 0, ch_galva_eng_50: 0, ch_galva_eng_60: 0, ch_galva_eng_70: 0, ch_galva_eng_80: 0, ch_galva_eng_90: 0, ch_galva_eng_100: 0,
    ch_galva_got_30: 0, ch_galva_got_35: 0, ch_galva_got_40: 0, ch_galva_got_45: 0, ch_galva_got_50: 0, ch_galva_got_60: 0, ch_galva_got_70: 0, ch_galva_got_80: 0, ch_galva_got_90: 0, ch_galva_got_100: 0,
    ch_gosa_eng_30: 0, ch_gosa_eng_35: 0, ch_gosa_eng_40: 0, ch_gosa_eng_45: 0, ch_gosa_eng_50: 0, ch_gosa_eng_60: 0, ch_gosa_eng_70: 0, ch_gosa_eng_80: 0, ch_gosa_eng_90: 0, ch_gosa_eng_100: 0,
    ch_gosa_got_30: 0, ch_gosa_got_35: 0, ch_gosa_got_40: 0, ch_gosa_got_45: 0, ch_gosa_got_50: 0, ch_gosa_got_60: 0, ch_gosa_got_70: 0, ch_gosa_got_80: 0, ch_gosa_got_90: 0, ch_gosa_got_100: 0,
    ch_ilche_eng_20: 0, ch_ilche_eng_25: 0, ch_ilche_eng_30: 0, ch_ilche_eng_35: 0, ch_ilche_eng_40: 0, ch_ilche_eng_45: 0, ch_ilche_eng_50: 0, ch_ilche_eng_55: 0, ch_ilche_eng_60: 0, ch_ilche_eng_65: 0, ch_ilche_eng_70: 0,
    ch_ilche_kor_20: 0, ch_ilche_kor_25: 0, ch_ilche_kor_30: 0, ch_ilche_kor_35: 0, ch_ilche_kor_40: 0, ch_ilche_kor_45: 0, ch_ilche_kor_50: 0, ch_ilche_kor_55: 0, ch_ilche_kor_60: 0, ch_ilche_kor_65: 0, ch_ilche_kor_70: 0,
    ch_ilche_got_20: 0, ch_ilche_got_25: 0, ch_ilche_got_30: 0, ch_ilche_got_35: 0, ch_ilche_got_40: 0, ch_ilche_got_45: 0, ch_ilche_got_50: 0, ch_ilche_got_55: 0, ch_ilche_got_60: 0, ch_ilche_got_65: 0, ch_ilche_got_70: 0,
    ch_epox_eng_20: 0, ch_epox_eng_25: 0, ch_epox_eng_30: 0, ch_epox_eng_35: 0, ch_epox_eng_40: 0, ch_epox_eng_45: 0, ch_epox_eng_50: 0, ch_epox_eng_55: 0, ch_epox_eng_60: 0, ch_epox_eng_65: 0, ch_epox_eng_70: 0,
    ch_epox_kor_20: 0, ch_epox_kor_25: 0, ch_epox_kor_30: 0, ch_epox_kor_35: 0, ch_epox_kor_40: 0, ch_epox_kor_45: 0, ch_epox_kor_50: 0, ch_epox_kor_55: 0, ch_epox_kor_60: 0, ch_epox_kor_65: 0, ch_epox_kor_70: 0,
    ch_epox_got_20: 0, ch_epox_got_25: 0, ch_epox_got_30: 0, ch_epox_got_35: 0, ch_epox_got_40: 0, ch_epox_got_45: 0, ch_epox_got_50: 0, ch_epox_got_55: 0, ch_epox_got_60: 0, ch_epox_got_65: 0, ch_epox_got_70: 0,
    ch_led_white: 450, ch_led_warm: 500, ch_led_rgb: 800, ch_led_panorama: 3500, ch_led_color: 500,
    ch_ggachi_200: 2000, ch_ggachi_250: 2500, ch_ggachi_300: 3000, ch_ggachi_400: 3500,
    ch_complete: 100000,
    ch_trusbar_200: 30000, ch_trusbar_250: 40000, ch_trusbar_300: 40000, ch_trusbar_400: 60000,
    flex_uv_double: 8000, flex_sol: 7000, flex_high_bright: 11000, flex_punch: 5000, flex_freq: 8000,
    uv_white: 10000, uv_white_grey: 10000, uv_clear: 10000,
    uv_clear_mirror: 15000, uv_clear_black: 25000,
    uv_punch_pet: 7000, uv_light_white: 13000, uv_embo: 10000, uv_cut: 2000,
    sol_white: 10000, sol_white_grey: 10000, sol_oneway: 13000, sol_light_white: 13000,
    sol_embo: 10000, sol_high_reflect: 40000, sol_banner: 6000, sol_cut: 2000, sol_coat: 3000,
    // 공통자재
    cm_floodlight: 0, cm_timer: 0, cm_smps: 0, cm_fluorescent: 0
};

var PRICES = JSON.parse(JSON.stringify(DEFAULT_PRICES));

// ── 헬퍼 ────────────────────────────────────────────────────
function fmtNum(n) {
    return n >= 1000 ? Number(n).toLocaleString('ko-KR') : String(n);
}

function formatCommaInput(el) {
    var oldVal = el.value;
    var selStart = el.selectionStart;
    var digitsBefore = oldVal.slice(0, selStart).replace(/[^0-9]/g, '').length;
    var raw = oldVal.replace(/[^0-9]/g, '');
    if (!raw) { el.value = ''; return; }
    var newVal = Number(raw).toLocaleString('ko-KR');
    el.value = newVal;
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

// ── Firebase 연동 ─────────────────────────────────────────────
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

function applyPrices() {
    Object.keys(DEFAULT_PRICES).forEach(function(key) {
        var $el = $("#p_" + key);
        if (!$el.length) return;
        var val = parseFloat(String($el.val()).replace(/,/g, ''));
        if (!isNaN(val) && val >= 0) PRICES[key] = val;
    });
}

function resetPrices() {
    PRICES = JSON.parse(JSON.stringify(DEFAULT_PRICES));
    Object.keys(DEFAULT_PRICES).forEach(function(key) {
        var $el = $("#p_" + key);
        if ($el.length) $el.val(fmtNum(DEFAULT_PRICES[key]));
    });
}

$(function() {
    // 기본값으로 입력 필드 초기화
    Object.keys(DEFAULT_PRICES).forEach(function(key) {
        var $el = $("#p_" + key);
        if ($el.length) $el.val(fmtNum(DEFAULT_PRICES[key]));
    });

    // Firebase에 저장된 단가 로드
    _initPricesDoc();
    if (_pricesDoc) {
        _pricesDoc.get()
            .then(function(doc) {
                if (!doc.exists) return;
                var saved = doc.data();
                Object.keys(DEFAULT_PRICES).forEach(function(key) {
                    if (saved[key] !== undefined) {
                        PRICES[key] = saved[key];
                        var $el = $("#p_" + key);
                        if ($el.length) $el.val(fmtNum(saved[key]));
                    }
                });
            })
            .catch(function(){});
    }

    // 입력 콤마 포맷
    $(document).on('input', '.price_panel_body input[type="text"]', function() {
        formatCommaInput(this);
    });

    // 자동 1.3배: 영문 → 한글 (알루미늄/일체형/에폭시)
    $(document).on('input', '[id^="p_ch_taka_eng_"],[id^="p_ch_ilche_eng_"],[id^="p_ch_epox_eng_"]', function() {
        var raw = this.value.replace(/[^0-9]/g, '');
        var val = parseInt(raw) || 0;
        var korEl = document.getElementById(this.id.replace('_eng_', '_kor_'));
        if (korEl) korEl.value = val > 0 ? Math.round(val * 1.3).toLocaleString('ko-KR') : '';
    });

    // 자동 1.3배: 한글 → 흘림체 (알루미늄/일체형/에폭시)
    $(document).on('input', '[id^="p_ch_taka_kor_"],[id^="p_ch_ilche_kor_"],[id^="p_ch_epox_kor_"]', function() {
        var raw = this.value.replace(/[^0-9]/g, '');
        var val = parseInt(raw) || 0;
        var gotEl = document.getElementById(this.id.replace('_kor_', '_got_'));
        if (gotEl) gotEl.value = val > 0 ? Math.round(val * 1.3).toLocaleString('ko-KR') : '';
    });

    // 자동 1.3배: 영문/한글 → 흘림체 (티타늄/스텐/갈바/갈바오사이)
    $(document).on('input', '[id^="p_ch_titan_eng_"],[id^="p_ch_sten_eng_"],[id^="p_ch_galva_eng_"],[id^="p_ch_gosa_eng_"]', function() {
        var raw = this.value.replace(/[^0-9]/g, '');
        var val = parseInt(raw) || 0;
        var gotEl = document.getElementById(this.id.replace('_eng_', '_got_'));
        if (gotEl) gotEl.value = val > 0 ? Math.round(val * 1.3).toLocaleString('ko-KR') : '';
    });

    // 적용하기
    $("#btn_apply_prices").click(function() {
        applyPrices();
        savePricesToFirebase(PRICES);
        $(this).text("✓ 적용됨").addClass("applied");
        var _btn = this;
        setTimeout(function() { $(_btn).text("적용하기").removeClass("applied"); }, 1500);
    });

    // 초기화
    $("#btn_reset_prices").click(function() {
        resetPrices();
        savePricesToFirebase(DEFAULT_PRICES);
    });
});
