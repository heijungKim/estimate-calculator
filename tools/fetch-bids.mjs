#!/usr/bin/env node
/* fetch-bids.mjs — 나라장터 입찰공고를 받아 JSON 한 덩어리로 저장한다.
 *
 * GitHub Actions 가 1시간마다 돌린다(.github/workflows/fetch-bids.yml).
 * 결과 파일은 bid-data 브랜치에 올라가고, bid.html 이 raw.githubusercontent.com
 * 에서 바로 읽는다. raw 는 Access-Control-Allow-Origin: * 를 주므로
 * 브라우저가 중계 서버 없이 가져올 수 있다.
 *
 *   G2B_SERVICE_KEY=<Decoding 키> node tools/fetch-bids.mjs [출력경로]
 *
 * 무엇을 담을지는 tools/company.mjs 의 입찰참가자격 등록 내용이 정한다.
 * 등록분야에 없는 업무구분은 수집조차 하지 않고, 등록물품 세부품명번호와
 * 대조해 관련 없는 공고는 버린다.
 *
 * 환경변수로 덮어쓸 수 있다.
 *   BID_KINDS  기본: 등록분야에서 뽑음 (물품, 용역)
 *   BID_DAYS   기본 14
 *   BID_DIAG   1 이면 업스트림 원본 필드 점검표 출력
 */

import fs from 'node:fs';
import path from 'node:path';
import { collectBids, OPS } from './g2b-core.mjs';
import { COMPANY } from './company.mjs';

const RETRIES = 3;
const TIMEOUT_MS = 25000;

main().catch(err => {
    console.error('\n수집 실패:', err.message);
    process.exit(1);
});

async function main() {
    const key = process.env.G2B_SERVICE_KEY;
    if (!key) {
        console.error('G2B_SERVICE_KEY 환경변수가 없습니다.');
        process.exit(1);
    }

    const outPath = process.argv[2] || 'bids.json';
    const days = Number(process.env.BID_DAYS || 14);
    const diag = process.env.BID_DIAG === '1';

    // 등록분야에 없는 업무구분은 투찰 자체가 불가능하므로 부르지 않는다.
    // 공사는 등록증에 체크가 없고 업종(면허) 목록도 비어 있다.
    const kinds = (process.env.BID_KINDS
        ? process.env.BID_KINDS.split(',').map(s => s.trim())
        : Object.keys(COMPANY.fields).filter(k => COMPANY.fields[k])
    ).filter(k => OPS[k]);

    if (!kinds.length) throw new Error('수집할 업무구분이 없습니다.');

    console.log(`${COMPANY.name} · 등록분야 ${kinds.map(labelOf).join(', ')} · 최근 ${days}일`);
    console.log(`등록물품 ${COMPANY.products.length}개로 관련 공고를 가려냅니다.`);
    warnExpiring();

    const started = Date.now();
    const result = await collectBids({
        key, kinds, days, company: COMPANY, fetchText, debug: diag,
    });

    if (diag) reportFields(result.items);
    // _raw 는 점검용일 뿐이라 저장 파일에는 넣지 않는다 (용량이 몇 배로 뛴다).
    result.items.forEach(r => { delete r._raw; });

    const payload = {
        fetchedAt: new Date().toISOString(),
        range: result.range,
        kinds,
        days,
        count: result.count,
        meta: result.meta,
        // 화면이 등록 내용을 알아야 '참가 가능'을 표시하고 준비 목록을 짤 수 있다.
        // 같이 실어 보내면 설정이 두 곳으로 갈라지지 않는다.
        company: COMPANY,
        items: result.items,
    };

    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(payload), 'utf8');

    const kb = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`\n기간 ${result.range.from}~${result.range.to}`);
    for (const [kind, s] of Object.entries(result.meta.byKind)) {
        console.log(`  ${labelOf(kind)}: 전체 ${s.total} → 수집 ${s.fetched}`);
    }

    const rel = result.meta.relevance || {};
    console.log('\n관련도별 건수');
    console.log(`  등록물품 일치   ${rel.registered || 0}  (바로 투찰 가능)`);
    console.log(`  등록 만료       ${rel.expired || 0}  (갱신해야 참가 가능)`);
    console.log(`  같은 품명군     ${rel.group || 0}  (품명 추가 등록 필요)`);
    console.log(`  공고명만 일치   ${rel.keyword || 0}  (확인 필요)`);

    console.log(`\n합계 ${result.count}건 · API 호출 ${result.meta.upstreamCalls}회`
        + ` · ${kb}KB · ${((Date.now() - started) / 1000).toFixed(1)}초`);

    if (result.meta.truncated) console.log('! 결과가 잘렸습니다. BID_DAYS 를 줄이세요.');
    if (result.count === 0) console.log('! 수집 결과가 0건입니다.');

    console.log(`저장: ${outPath}`);
}

function labelOf(k) {
    return { thng: '물품', cnstwk: '공사', servc: '용역' }[k] || k;
}

/* 등록유효기간이 지났거나 곧 지나는 품명을 알린다.
 * 기간이 지나면 그 품명으로는 입찰에 못 들어간다 — 공고를 찾아놓고
 * 투찰 당일에 알게 되면 손쓸 방법이 없다. */
function warnExpiring() {
    const today = new Date();
    const soon = new Date(today.getTime() + 60 * 86400000);

    const dead = COMPANY.products.filter(p => new Date(p.regEnd + 'T23:59:59') < today);
    const near = COMPANY.products.filter(p => {
        const d = new Date(p.regEnd + 'T23:59:59');
        return d >= today && d <= soon;
    });

    if (dead.length) {
        console.log(`! 등록 만료됨: ${dead.map(p => `${p.name}(${p.regEnd})`).join(', ')}`);
    }
    if (near.length) {
        console.log(`! 60일 안에 만료: ${near.map(p => {
            const left = Math.ceil((new Date(p.regEnd + 'T23:59:59') - today) / 86400000);
            return `${p.name}(${p.regEnd}, ${left}일 남음)`;
        }).join(', ')}`);
    }
}

/* 업스트림이 실제로 무엇을 주는지 표로 보여준다.
 * 조달청이 필드명을 바꾸거나, 애초에 목록 API 에 없는 항목을 기대하고
 * 있었다면 여기서 드러난다. */
function reportFields(items) {
    const raws = items.map(r => r._raw).filter(Boolean);
    if (!raws.length) { console.log('\n점검할 표본이 없습니다.'); return; }

    const EXPECTED = [
        'bidNtceNo', 'bidNtceOrd', 'bidNtceNm', 'ntceInsttNm', 'dminsttNm',
        'bidNtceDt', 'bidClseDt', 'opengDt', 'presmptPrce', 'asignBdgtAmt',
        'sucsfbidLwltRate', 'cntrctCnclsMthdNm', 'sucsfbidMthdNm',
        'dtilPrdctClsfcNo', 'dtilPrdctClsfcNoNm', 'mainCnsttyNm',
        'prdctSpecNm', 'prdctQty', 'prdctUnit',
        'rgnLmtBidLocplcJdgmBssNm', 'indstrytyLmtYn', 'cnstrtsiteRgnNm',
        'ntceInsttOfclNm', 'ntceInsttOfclTelNo',
        'dcmtgOprtnDt', 'dcmtgOprtnPlce',
        'totPrdprcNum', 'drwtPrdprcNum', 'ntceSpecDocUrl1', 'bidNtceDtlUrl',
    ];

    console.log(`\n=== 필드 점검 (표본 ${raws.length}건) ===`);
    for (const f of EXPECTED) {
        const filled = raws.filter(r => r[f] != null && String(r[f]).trim() !== '').length;
        const exists = raws.some(r => f in r);
        const mark = !exists ? 'X  응답에 없음'
            : (filled === 0 ? '~  있으나 모두 빈값' : `OK ${filled}/${raws.length}`);
        console.log(`  ${f.padEnd(26)} ${mark}`);
    }

    const seen = new Set();
    raws.forEach(r => Object.keys(r).forEach(k => seen.add(k)));
    const extra = [...seen].filter(k => !EXPECTED.includes(k)).sort();
    console.log(`\n=== 예상 목록에 없는 필드 ${extra.length}개 ===`);
    console.log(extra.join(', '));
}

/* 업스트림이 간헐적으로 5xx 를 뱉고, 한국 밖에서는 느려 연결이 끊기기도 한다.
 * 인증 실패 같은 항구적 오류는 parseEnvelope 가 위에서 던지므로 여기 안 온다. */
async function fetchText(url) {
    let lastErr;
    for (let i = 1; i <= RETRIES; i++) {
        try {
            const res = await fetch(url, {
                headers: { Accept: 'application/json' },
                signal: AbortSignal.timeout(TIMEOUT_MS),
            });
            const text = await res.text();
            // 본문에 오류 사유가 들어 있으면 호출한 쪽(parseEnvelope)이 읽어서 던진다.
            if (!res.ok && !text.trim().startsWith('{') && !text.trim().startsWith('<')) {
                throw new Error(`HTTP ${res.status}`);
            }
            return text;
        } catch (e) {
            lastErr = e;
            if (i < RETRIES) {
                const wait = i * 2000;
                console.log(`  재시도 ${i}/${RETRIES - 1} (${wait / 1000}초 후): ${describe(e)}`);
                await new Promise(r => setTimeout(r, wait));
            }
        }
    }
    throw new Error(describe(lastErr));
}

/* Node 의 'fetch failed' 는 진짜 원인을 cause 에 숨긴다.
 * DNS 인지, TLS 인지, 타임아웃인지 구분되어야 손을 쓸 수 있다. */
function describe(e) {
    const parts = [e.name === 'TimeoutError' ? `${TIMEOUT_MS / 1000}초 안에 응답 없음` : e.message];
    let c = e.cause;
    for (let depth = 0; c && depth < 4; depth++) {
        const bits = [c.code, c.syscall, c.hostname, c.message].filter(Boolean);
        if (bits.length) parts.push(bits.join(' '));
        c = c.cause;
    }
    return parts.join(' ← ');
}
