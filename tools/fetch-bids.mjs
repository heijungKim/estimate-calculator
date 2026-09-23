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
 * 환경변수로 수집 범위를 조절한다.
 *   BID_KINDS     기본 thng,cnstwk
 *   BID_DAYS      기본 14
 *   BID_KEYWORDS  기본 아래 목록 (콤마 구분). 빈 문자열이면 키워드 필터 없음
 */

import fs from 'node:fs';
import path from 'node:path';
import { collectBids, OPS } from './g2b-core.mjs';

// 간판 업체가 실제로 노릴 만한 공고를 넓게 잡는다.
// 화면에서 더 좁히는 건 자유지만, 여기 없는 키워드는 애초에 수집되지 않는다.
const DEFAULT_KEYWORDS = [
    '간판', '사인', '싸인', '현수막', '실사출력', '출력물',
    'LED', '배너', '표지판', '안내판', '안내표지', '시트',
    '스카시', '채널문자', '옥외광고', '광고물', '홍보물',
    '조형물', '게시대', '아크릴', '판넬', '패널', '인쇄',
];

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
    const kinds = (process.env.BID_KINDS || 'thng,cnstwk')
        .split(',').map(s => s.trim()).filter(k => OPS[k]);
    const days = Number(process.env.BID_DAYS || 14);
    const keywords = process.env.BID_KEYWORDS === ''
        ? []
        : (process.env.BID_KEYWORDS || DEFAULT_KEYWORDS.join(',')).split(',').map(s => s.trim()).filter(Boolean);

    if (!kinds.length) throw new Error('BID_KINDS 가 비었습니다.');

    console.log(`업무구분 ${kinds.join(', ')} · 최근 ${days}일 · 키워드 ${keywords.length}개`);

    const diag = process.env.BID_DIAG === '1';

    const started = Date.now();
    const result = await collectBids({ key, kinds, days, keywords, fetchText, debug: diag });

    if (diag) reportFields(result.items);
    // _raw 는 점검용일 뿐이라 저장 파일에는 넣지 않는다 (용량이 몇 배로 뛴다).
    result.items.forEach(function (r) { delete r._raw; });

    const payload = {
        fetchedAt: new Date().toISOString(),
        range: result.range,
        kinds,
        keywords,
        days,
        count: result.count,
        meta: result.meta,
        items: result.items,
    };

    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(payload), 'utf8');

    const kb = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`\n기간 ${result.range.from}~${result.range.to}`);
    for (const [kind, s] of Object.entries(result.meta.byKind)) {
        console.log(`  ${kind}: 전체 ${s.total} → 수집 ${s.fetched}`);
    }
    console.log(`키워드 통과 ${result.count}건 · API 호출 ${result.meta.upstreamCalls}회`
        + ` · ${kb}KB · ${((Date.now() - started) / 1000).toFixed(1)}초`);

    if (result.meta.truncated) {
        console.log('! 결과가 잘렸습니다. BID_DAYS 를 줄이세요.');
    }
    // 0건이면 워크플로에서 눈에 띄게. 키가 죽었거나 필터가 과한 신호일 수 있다.
    if (result.count === 0) console.log('! 수집 결과가 0건입니다.');

    console.log(`저장: ${outPath}`);
}

/* 업스트림이 실제로 무엇을 주는지 표로 보여준다.
 * 조달청이 필드명을 바꾸거나, 애초에 목록 API 에 없는 항목을 기대하고 있었다면
 * 여기서 드러난다. */
function reportFields(items) {
    const raws = items.map(r => r._raw).filter(Boolean);
    if (!raws.length) { console.log('\n점검할 표본이 없습니다.'); return; }

    const EXPECTED = [
        'bidNtceNo', 'bidNtceOrd', 'bidNtceNm', 'ntceInsttNm', 'dminsttNm',
        'bidNtceDt', 'bidClseDt', 'opengDt', 'presmptPrce', 'asignBdgtAmt',
        'sucsfbidLwltRate', 'cntrctCnclsMthdNm', 'bidMethdNm', 'indstrytyNm',
        'prtcptPsblRgnNm', 'bidNtceDtlUrl',
    ];

    console.log(`\n=== 필드 점검 (표본 ${raws.length}건) ===`);
    for (const f of EXPECTED) {
        const filled = raws.filter(r => r[f] != null && String(r[f]).trim() !== '').length;
        const exists = raws.some(r => f in r);
        const mark = !exists ? 'X  응답에 없음' : (filled === 0 ? '~  있으나 모두 빈값' : `OK ${filled}/${raws.length}`);
        console.log(`  ${f.padEnd(20)} ${mark}`);
    }

    const seen = new Set();
    raws.forEach(r => Object.keys(r).forEach(k => seen.add(k)));
    const extra = [...seen].filter(k => !EXPECTED.includes(k)).sort();
    console.log(`\n=== 예상 목록에 없는 필드 ${extra.length}개 ===`);
    console.log(extra.join(', '));

    // 지역/업종 후보를 눈에 띄게 뽑아준다
    const hint = extra.filter(k => /rgn|locplc|area|indstry|licen|lmt/i.test(k));
    if (hint.length) {
        console.log(`\n=== 지역·업종 관련으로 보이는 필드 ===`);
        for (const k of hint) {
            const sample = raws.map(r => r[k]).find(v => v != null && String(v).trim() !== '');
            const filled = raws.filter(r => r[k] != null && String(r[k]).trim() !== '').length;
            console.log(`  ${k.padEnd(28)} ${filled}/${raws.length}  예: ${String(sample ?? '').slice(0, 40)}`);
        }
    }
}
/* 업스트림이 간헐적으로 5xx 를 뱉는다. 몇 번 다시 해본다.
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
