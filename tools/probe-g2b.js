#!/usr/bin/env node
/* probe-g2b.js — 나라장터 입찰공고 API 연결 점검
 *
 * 두 가지 방식으로 쓴다.
 *
 *   1) Worker 를 통해 (배포 후 확인용)
 *        node tools/probe-g2b.js https://g2b-proxy.내계정.workers.dev
 *
 *   2) 서비스키로 직접 (Worker 배포 전, 오퍼레이션 이름·응답 필드 확인용)
 *        node tools/probe-g2b.js --key <Decoding 키>
 *
 *   키를 인자로 남기고 싶지 않으면 환경변수로도 된다.
 *        G2B_SERVICE_KEY=... node tools/probe-g2b.js --key
 *
 * bid.js 가 읽는 필드가 실제 응답에 있는지 표로 보여준다.
 * 조달청이 필드명을 바꾸면 여기서 먼저 드러난다.
 */

const BASES = [
    'https://apis.data.go.kr/1230000/ad/BidPublicInfoService',
    'https://apis.data.go.kr/1230000/BidPublicInfoService',
];

const OPS = {
    thng:   'getBidPblancListInfoThng',
    cnstwk: 'getBidPblancListInfoCnstwk',
    servc:  'getBidPblancListInfoServc',
};

// bid.js 가 실제로 읽는 필드들
const EXPECTED = [
    'bidNtceNo', 'bidNtceOrd', 'bidNtceNm',
    'ntceInsttNm', 'dminsttNm',
    'bidNtceDt', 'bidClseDt', 'opengDt',
    'presmptPrce', 'asignBdgtAmt', 'sucsfbidLwltRate',
    'cntrctCnclsMthdNm', 'bidMethdNm', 'indstrytyNm',
    'prtcptPsblRgnNm', 'bidNtceDtlUrl',
];

main().catch(err => { console.error('\n실패:', err.message); process.exit(1); });

async function main() {
    const args = process.argv.slice(2);
    if (!args.length) return usage();

    if (args[0] === '--key') {
        const key = args[1] || process.env.G2B_SERVICE_KEY || readDevVars();
        if (!key) {
            console.error('서비스키를 찾지 못했습니다. 아래 중 하나로 주세요.');
            console.error('  1) node tools/probe-g2b.js --key <값>');
            console.error('  2) G2B_SERVICE_KEY 환경변수');
            console.error('  3) worker/.dev.vars 에 G2B_SERVICE_KEY=<값> 한 줄 (gitignore 됨)');
            process.exit(1);
        }
        return probeDirect(key);
    }
    if (args[0].startsWith('http')) return probeWorker(args[0].replace(/\/+$/, ''));
    return usage();
}

function usage() {
    console.log(`사용법:
  node tools/probe-g2b.js <Worker 주소>      Worker 경유 점검
  node tools/probe-g2b.js --key <Decoding 키>  업스트림 직접 점검`);
    process.exit(1);
}

/* ── 1) Worker 경유 ──────────────────────────────────────────── */
async function probeWorker(base) {
    console.log(`\n[1/2] ${base}/health`);
    const h = await fetchJson(`${base}/health`);
    console.log('  ', JSON.stringify(h));
    if (!h.hasKey) {
        console.log('\n  ! G2B_SERVICE_KEY 시크릿이 없습니다.');
        console.log('    cd worker && npx wrangler secret put G2B_SERVICE_KEY');
        process.exit(1);
    }

    const { from, to } = recentRange(3);
    const url = `${base}/bids?kind=thng,cnstwk&from=${from}&to=${to}&debug=1`;
    console.log(`\n[2/2] ${url}`);
    const r = await fetchJson(url);
    if (r.error) throw new Error(r.error);

    console.log(`   기간 ${r.range.from}~${r.range.to} · ${r.count}건 · API 호출 ${r.meta.upstreamCalls}회`
        + (r.meta.truncated ? ' · 잘림' : ''));
    for (const [kind, s] of Object.entries(r.meta.byKind || {})) {
        console.log(`   ${kind}: 전체 ${s.total} / 수집 ${s.fetched}`);
    }

    if (!r.items.length) {
        console.log('\n   결과 0건 — 기간을 늘려 다시 해보세요. 연결 자체는 정상입니다.');
        return;
    }
    reportFields(r.items.map(i => i._raw).filter(Boolean));
    showSample(r.items[0]);
}

/* ── 2) 업스트림 직접 ────────────────────────────────────────── */
async function probeDirect(key) {
    const { from, to } = recentRange(3);
    let workingBase = null;

    console.log('\n엔드포인트 경로 확인');
    for (const base of BASES) {
        const res = await tryUpstream(base, OPS.thng, key, from, to);
        console.log(`  ${res.ok ? 'OK  ' : 'X   '} ${base}${res.ok ? ` (총 ${res.totalCount}건)` : ` — ${res.error}`}`);
        if (res.ok && !workingBase) workingBase = base;
    }
    if (!workingBase) {
        throw new Error('어느 경로도 응답하지 않았습니다. 서비스키와 활용신청 승인 상태를 확인하세요.');
    }

    console.log(`\n오퍼레이션 확인 (${workingBase})`);
    const samples = [];
    for (const [kind, op] of Object.entries(OPS)) {
        const res = await tryUpstream(workingBase, op, key, from, to);
        console.log(`  ${res.ok ? 'OK  ' : 'X   '} ${op.padEnd(30)} ${kind.padEnd(7)}`
            + (res.ok ? `총 ${res.totalCount}건` : `— ${res.error}`));
        if (res.ok) samples.push(...res.items);
    }

    if (!samples.length) {
        console.log('\n  결과 0건 — 기간을 늘려 다시 해보세요.');
        return;
    }
    reportFields(samples);

    if (workingBase !== BASES[0]) {
        console.log(`\n  ! worker/src/index.js 의 UPSTREAM 을 다음으로 바꾸세요:\n    ${workingBase}`);
    }
}

async function tryUpstream(base, op, key, from, to) {
    const p = new URLSearchParams({
        ServiceKey: key, type: 'json', inqryDiv: '1',
        inqryBgnDt: from + '0000', inqryEndDt: to + '2359',
        pageNo: '1', numOfRows: '30',
    });
    try {
        const res = await fetch(`${base}/${op}?${p}`, { headers: { Accept: 'application/json' } });
        const text = await res.text();
        if (text.trim().startsWith('<')) {
            const m = text.match(/<(?:returnAuthMsg|errMsg|resultMsg)>([\s\S]*?)</);
            return { ok: false, error: (m ? m[1] : `XML 응답 HTTP ${res.status}`).trim() };
        }
        const data = JSON.parse(text);

        // 인증 실패·한도 초과는 성공 응답과 전혀 다른 JSON 봉투로 온다.
        // 이걸 안 보면 잘못된 키인데도 '0건'으로 통과해버린다.
        const cmm = data?.OpenAPI_ServiceResponse?.cmmMsgHeader;
        if (cmm) {
            return { ok: false, error: `${cmm.returnReasonCode || '?'} ${cmm.returnAuthMsg || cmm.errMsg || ''}`.trim() };
        }

        const code = data?.response?.header?.resultCode;
        if (code && code !== '00') {
            return { ok: false, error: `${code} ${data.response.header.resultMsg || ''}` };
        }
        const body = data?.response?.body || {};
        let items = body.items;
        if (!items) items = [];
        else if (!Array.isArray(items)) items = Array.isArray(items.item) ? items.item : (items.item ? [items.item] : []);
        return { ok: true, totalCount: Number(body.totalCount) || items.length, items };
    } catch (e) {
        return { ok: false, error: String(e.message || e).slice(0, 90) };
    }
}

/* ── 필드 점검표 ─────────────────────────────────────────────── */
function reportFields(raws) {
    if (!raws.length) return;
    console.log(`\n필드 점검 (표본 ${raws.length}건) — bid.js 가 읽는 값들`);

    for (const f of EXPECTED) {
        const present = raws.filter(r => r && r[f] !== undefined).length;
        const filled  = raws.filter(r => r && r[f] !== undefined && r[f] !== null && String(r[f]).trim() !== '').length;
        let mark;
        if (present === 0)      mark = 'X  없음';
        else if (filled === 0)  mark = '~  있으나 모두 빈값';
        else                    mark = `OK ${filled}/${raws.length} 채워짐`;
        console.log(`  ${f.padEnd(20)} ${mark}`);
    }

    // 예상 목록에 없는 필드 = 새로 생겼거나 이름이 바뀐 것
    const seen = new Set();
    raws.forEach(r => Object.keys(r || {}).forEach(k => seen.add(k)));
    const extra = [...seen].filter(k => !EXPECTED.includes(k)).sort();
    if (extra.length) {
        console.log(`\n  예상 목록에 없는 필드 ${extra.length}개:`);
        console.log('  ' + extra.join(', '));
        console.log('\n  위에 X 로 나온 필드가 있으면 이 목록에서 대체 이름을 찾아');
        console.log('  worker/src/index.js 의 normalize() 를 고치세요.');
    }
}

function showSample(rec) {
    console.log('\n정규화 결과 예시');
    const { _raw, ...clean } = rec;
    for (const [k, v] of Object.entries(clean)) {
        console.log(`  ${k.padEnd(12)} ${v === '' || v === null ? '—' : v}`);
    }
}

/* ── 잡다한 것들 ─────────────────────────────────────────────── */
async function fetchJson(url) {
    const res = await fetch(url);
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { throw new Error(`JSON 아님 (HTTP ${res.status}): ${text.slice(0, 200)}`); }
}

/* worker/.dev.vars 에서 키를 읽는다. 키를 명령줄이나 채팅에 남기지 않아도 되도록.
 * wrangler dev 가 읽는 파일과 같은 것이라 한 번만 적어두면 둘 다 쓴다. */
function readDevVars() {
    try {
        const fs = require('node:fs');
        const path = require('node:path');
        const p = path.join(__dirname, '..', 'worker', '.dev.vars');
        if (!fs.existsSync(p)) return null;
        const m = fs.readFileSync(p, 'utf8').match(/^s*G2B_SERVICE_KEYs*=s*(.+?)s*$/m);
        if (!m) return null;
        console.log('(worker/.dev.vars 에서 키를 읽었습니다)');
        return m[1].replace(/^["']|["']$/g, '');
    } catch (e) { return null; }
}

function recentRange(days) {
    const pad = n => String(n).padStart(2, '0');
    const ymd = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    return { from: ymd(from), to: ymd(to) };
}
