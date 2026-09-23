/* bid-calc.js — 투찰금액 산정
 *
 * 적격심사 낙찰은 이렇게 정해진다.
 *   1. 발주기관이 기초금액 ±a% 범위로 복수예비가격 15개를 만들어 둔다
 *   2. 입찰자들이 투찰할 때 2개씩 추첨하고, 가장 많이 뽑힌 4개의 평균이
 *      예정가격이 된다
 *   3. 낙찰하한가 = 예정가격 × 낙찰하한율
 *   4. 낙찰하한가 이상 중 최저가가 1순위
 *
 * 개찰 전에는 예정가격을 알 수 없다. 그래서 확정값이 아니라 확률로 본다.
 *
 * 무엇을 계산할 수 있고 없는지
 *   계산 가능 — 내 투찰금액이 낙찰하한가 이상일 확률 (= 무효가 안 될 확률)
 *   계산 불가 — 낙찰 확률. 경쟁사가 몇 곳이고 얼마를 쓸지 모른다.
 * 그래서 '낙찰 확률'이라고 부르지 않는다. 있지도 않은 정확도를 꾸며내면
 * 그 숫자를 믿고 금액을 정하게 된다.
 */

/* 예정가격의 흩어짐(기초금액 대비 비율).
 *
 * 예비가격 15개가 [B(1-a), B(1+a)] 에 고르게 퍼져 있다고 보면
 * 하나의 표준편차는 a·B/√3 이고, 그중 4개를 뽑아 평균내므로 √4 로 줄어든다.
 *
 *   σ/B = a / (2√3) ≈ 0.2887 · a
 *
 * 비복원 추출이라고 유한모집단 보정을 넣으면 안 된다. 보정은 모집단이
 * 고정값일 때 쓰는 것인데, 여기서는 15개 자체를 우리가 모르는 확률변수로
 * 보기 때문이다. 값과 무관하게 4개를 고르므로 뽑힌 4개는 서로 독립이다.
 * (몬테카를로로 확인: ±2% 에서 실측 0.5775%, 이 식 0.5774%)
 */
function bidPrceSigma(spread, total, drawn) {
    drawn = drawn || 4;
    return (spread / Math.sqrt(3)) / Math.sqrt(drawn);
}

/* 표준정규 누적분포. 소수점 7자리까지 맞는 근사(Abramowitz & Stegun 26.2.17). */
function normalCdf(z) {
    var b = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429];
    var p = 0.2316419, c = 0.39894228;
    if (z >= 0) {
        var t = 1 / (1 + p * z);
        return 1 - c * Math.exp(-z * z / 2) *
            t * (b[0] + t * (b[1] + t * (b[2] + t * (b[3] + t * b[4]))));
    }
    return 1 - normalCdf(-z);
}

/* 투찰률 t 로 썼을 때 낙찰하한가 이상일 확률.
 *
 *   유효 조건: B·t >= P·r  →  P <= B·t/r
 *   P ~ N(B, σ) 이므로  Φ((t/r - 1) / (σ/B))
 */
function bidValidProbability(t, rate, sigmaRel) {
    if (!rate || !sigmaRel) return null;
    return normalCdf((t / rate - 1) / sigmaRel);
}

/* 목표 확률을 맞추는 투찰률을 거꾸로 구한다. 이분법이면 충분하다. */
function bidRateForProbability(target, rate, sigmaRel) {
    var lo = rate * 0.9, hi = rate * 1.15;
    for (var i = 0; i < 60; i++) {
        var mid = (lo + hi) / 2;
        if (bidValidProbability(mid, rate, sigmaRel) < target) lo = mid;
        else hi = mid;
    }
    return (lo + hi) / 2;
}

/* 투찰금액 산정
 *
 *   base    기초금액
 *   rate    낙찰하한율 (0.87995 처럼 비율)
 *   spread  예비가격 변동폭 (0.02 = ±2%)
 *   cost    우리 제작원가 (없으면 원가 판정 생략)
 *   total / drawn  예비가격 개수 / 추첨 개수 (공고값이 있으면 그걸로)
 */
function bidCalc(opts) {
    var base = Number(opts.base) || 0;
    var rate = Number(opts.rate) || 0;
    var spread = Number(opts.spread) || 0.02;
    var cost = opts.cost != null && opts.cost !== '' ? Number(opts.cost) : null;

    if (!base || !rate) return null;

    var sigmaRel = bidPrceSigma(spread, opts.total, opts.drawn);

    // 원가를 밑도는 투찰률 — 여기 아래로는 낙찰돼도 손해다
    var costRate = cost != null && cost > 0 ? cost / base : null;

    var rows = [];
    // 하한율 -0.3%p 부터 +2.0%p 까지 0.1%p 간격
    for (var d = -0.003; d <= 0.02001; d += 0.001) {
        var t = rate + d;
        var amount = Math.round(base * t);
        rows.push({
            t: t,
            amount: amount,
            valid: bidValidProbability(t, rate, sigmaRel),
            margin: cost != null && cost > 0 ? (amount - cost) / cost : null,
            belowCost: cost != null && cost > 0 && amount < cost,
        });
    }

    // 권장 지점. 목표 유효확률을 맞추되, 원가를 밑돌면 원가선까지 올린다.
    // 낙찰받고 적자를 보는 것이 무효보다 나쁘다.
    var target = opts.target != null ? Number(opts.target) : 0.90;
    var pick = bidRateForProbability(target, rate, sigmaRel);

    // 표와 같은 0.1%p 격자로 올려 맞춘다. 권장 금액과 표의 강조 행이
    // 어긋나 보이면 어느 쪽을 믿어야 할지 헷갈린다. 올림이라 목표 확률은
    // 항상 채운다.
    pick = rate + Math.ceil((pick - rate) / 0.001 - 1e-9) * 0.001;

    var reason = null;
    if (costRate != null && pick < costRate) {
        pick = costRate;
        reason = '원가선까지 올림 — 목표 확률 지점이 원가를 밑돕니다';
    }

    return {
        sigmaRel: sigmaRel,
        costRate: costRate,
        rows: rows,
        recommend: {
            t: pick,
            amount: Math.round(base * pick),
            valid: bidValidProbability(pick, rate, sigmaRel),
            margin: cost != null && cost > 0 ? (base * pick - cost) / cost : null,
            reason: reason,
        },
        // 참고용 구간
        floor: { t: rate, amount: Math.round(base * rate), valid: bidValidProbability(rate, rate, sigmaRel) },
        safe:  ratePoint(0.99, base, rate, sigmaRel, cost),
        even:  ratePoint(0.50, base, rate, sigmaRel, cost),
    };
}

function ratePoint(target, base, rate, sigmaRel, cost) {
    var t = bidRateForProbability(target, rate, sigmaRel);
    var amount = Math.round(base * t);
    return {
        t: t, amount: amount, valid: target,
        margin: cost != null && cost > 0 ? (amount - cost) / cost : null,
    };
}

/* 공고의 추정가격에서 기초금액을 어림한다.
 * 추정가격은 부가세 별도라 물품은 보통 1.1 을 곱한 값이 기초금액이 된다.
 * 어디까지나 어림이고, 공고에 기초금액이 공표되면 그 값을 써야 한다. */
function bidBaseFromEstimate(estPrice) {
    if (!estPrice) return null;
    return Math.round(estPrice * 1.1);
}
