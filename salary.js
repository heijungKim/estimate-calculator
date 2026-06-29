var _salDb = null;
var _salEmployees = [];

var MIN_HOURLY = 10320;

function _salInitDB() {
    if (_salDb) return _salDb;
    try {
        var cfg = (typeof FIREBASE_CONFIG !== 'undefined') ? FIREBASE_CONFIG : null;
        if (!cfg || !cfg.apiKey || cfg.apiKey === 'YOUR_API_KEY') return null;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        _salDb = firebase.firestore();
    } catch(e) { _salDb = null; }
    return _salDb;
}

function _salFmt(n) {
    var v = Math.round(n) || 0;
    return v.toLocaleString('ko-KR') + '원';
}

function loadEmployeesForSalary() {
    var db = _salInitDB();
    if (!db) return;
    db.collection('employees').orderBy('name').get()
        .then(function(snap) {
            _salEmployees = [];
            snap.forEach(function(doc) {
                _salEmployees.push(Object.assign({ id: doc.id }, doc.data()));
            });
            var $sel = $('#sal_emp');
            $sel.html('<option value="">-- 직접 입력 --</option>');
            _salEmployees.forEach(function(e) {
                $sel.append('<option value="' + e.id + '" data-hourly="' + (e.hourly || 0) + '" data-name="' + (e.name || '') + '">' + e.name + (e.hourly ? ' (' + (e.hourly).toLocaleString('ko-KR') + '원/h)' : '') + '</option>');
            });
        })
        .catch(function() {});
}

// 간이세액 근사치 계산 (비부양가족 1인 기준)
function estimateIncomeTax(monthly) {
    if (monthly <= 1060000) return 0;
    if (monthly <= 1500000) return Math.round(monthly * 0.006);
    if (monthly <= 3000000) return Math.round(monthly * 0.015);
    if (monthly <= 4500000) return Math.round(monthly * 0.024);
    if (monthly <= 7800000) return Math.round(monthly * 0.035);
    if (monthly <= 12000000) return Math.round(monthly * 0.038);
    return Math.round(monthly * 0.04);
}

function calcSalary() {
    var workDays = parseFloat($('#sal_work_days').val()) || 22;
    var workHours = parseFloat($('#sal_work_hours').val()) || 8;
    var overtime = parseFloat($('#sal_overtime').val()) || 0;
    var bonus = parseInt($('#sal_bonus').val(), 10) || 0;
    var name = $.trim($('#sal_name').val()) || '계산 결과';

    var hourly = parseInt($('#sal_hourly').val(), 10) || MIN_HOURLY;
    var baseMonthly = hourly * workDays * workHours;

    if (baseMonthly <= 0) {
        alert('시급을 입력하세요.');
        return;
    }

    // 초과 근무 수당 (기본 시급 × 1.5)
    var hourlyBase = Math.round(baseMonthly / (workDays * workHours));
    var overtimePay = Math.round(hourlyBase * overtime * 1.5);

    var gross = baseMonthly + overtimePay + bonus;

    // 4대 보험 (2026년 기준)
    var pension    = Math.round(gross * 0.045);   // 국민연금
    var health     = Math.round(gross * 0.03545); // 건강보험
    var care       = Math.round(gross * 0.004591);// 장기요양보험
    var employ     = Math.round(gross * 0.009);   // 고용보험

    // 소득세
    var incomeTax  = estimateIncomeTax(gross);
    var localTax   = Math.round(incomeTax * 0.1);

    var deductTotal = pension + health + care + employ + incomeTax + localTax;
    var net = gross - deductTotal;

    $('#sal_result_name').text('— ' + name);
    $('#res_base').text(_salFmt(baseMonthly));
    $('#res_overtime').text(overtimePay > 0 ? _salFmt(overtimePay) : '없음');
    $('#res_bonus').text(bonus > 0 ? _salFmt(bonus) : '없음');
    $('#res_gross').text(_salFmt(gross));
    $('#res_pension').text('- ' + _salFmt(pension));
    $('#res_health').text('- ' + _salFmt(health));
    $('#res_care').text('- ' + _salFmt(care));
    $('#res_employ').text('- ' + _salFmt(employ));
    $('#res_tax').text('- ' + _salFmt(incomeTax));
    $('#res_local_tax').text('- ' + _salFmt(localTax));
    $('#res_deduct_total').text('- ' + _salFmt(deductTotal));
    $('#res_net').text(_salFmt(net));

    $('#sal_result_card').fadeIn(220);
    $('html, body').animate({ scrollTop: $('#sal_result_card').offset().top - 30 }, 400);
}

function resetSalary() {
    $('#sal_emp').val('');
    $('#sal_name').val('');
    $('#sal_hourly').val('');
    $('#sal_work_days').val('22');
    $('#sal_work_hours').val('8');
    $('#sal_overtime').val('0');
    $('#sal_bonus').val('0');
    $('#sal_result_card').hide();
}

$(function() {
    loadEmployeesForSalary();

    // 직원 선택 시 자동 입력
    $('#sal_emp').change(function() {
        var opt = $(this).find('option:selected');
        $('#sal_name').val(opt.data('name') || '');
        var hourly = parseInt(opt.data('hourly'), 10) || 0;
        if (hourly > 0) $('#sal_hourly').val(hourly);
    });

    $('#btn_sal_calc').click(calcSalary);
    $('#btn_sal_reset').click(resetSalary);
});
