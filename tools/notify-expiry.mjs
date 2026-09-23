#!/usr/bin/env node
/* notify-expiry.mjs — 등록·인증·쇼핑몰 계약 만료를 디스코드로 알린다.
 *
 * 등록유효기간이 지나면 그 품명으로는 입찰에 못 들어가고, 쇼핑몰 계약이
 * 끝나면 상품이 내려간다. 공고를 찾아놓고 투찰 당일에 알게 되면 손쓸
 * 방법이 없어서 미리 알린다.
 *
 *   DISCORD_WEBHOOK_URL=... node tools/notify-expiry.mjs [상태파일]
 *
 *   --test   만료 여부와 상관없이 시험 메시지를 보낸다
 *   --dry    디스코드로 보내지 않고 화면에만 출력한다
 *
 * 며칠 전부터 알릴지는 company.json 의 notify 가 정한다.
 * 매일 도배하지 않도록 milestones 에 적힌 날짜에만 보내고, 어디까지
 * 보냈는지는 상태파일에 남긴다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMPANY = JSON.parse(fs.readFileSync(path.join(ROOT, 'company.json'), 'utf8'));

const NOTIFY = COMPANY.notify || {};
const MILESTONES = (NOTIFY.milestones || [90, 60, 30, 14, 7, 3, 1, 0]).slice().sort((a, b) => b - a);

const args = process.argv.slice(2);
const isTest = args.includes('--test');
const isDry = args.includes('--dry');
const statePath = args.find(a => !a.startsWith('--')) || 'notify-state.json';

main().catch(err => { console.error('알림 실패:', err.message); process.exit(1); });

async function main() {
    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook && !isDry) {
        console.error('DISCORD_WEBHOOK_URL 이 없습니다.');
        process.exit(1);
    }

    const state = readState(statePath);
    const items = collectItems();
    const today = startOfToday();

    console.log(`대상 ${items.length}건 · 기준일 ${ymd(today)}`);

    const due = [];
    for (const it of items) {
        if (!it.end) {
            console.log(`  - ${it.label}: 날짜 없음, 건너뜀`);
            continue;
        }
        const left = daysBetween(today, parseDate(it.end));
        const within = left <= it.threshold;
        const milestone = milestoneFor(left);
        const key = `${it.type}:${it.id}`;
        const sent = state[key];

        console.log(`  - ${it.label}: D${left >= 0 ? '-' + left : '+' + -left}` +
            ` (기준 ${it.threshold}일, 마일스톤 ${milestone}, 보낸적 ${sent ?? '없음'})`);

        if (!within) continue;
        // 같은 마일스톤을 두 번 보내지 않는다. 더 급해지면(숫자가 작아지면) 다시 보낸다.
        if (sent !== undefined && sent <= milestone) continue;

        due.push({ ...it, left, milestone });
    }

    if (!due.length && !isTest) {
        console.log('\n알릴 것이 없습니다.');
        writeState(statePath, state);
        return;
    }

    const payload = isTest && !due.length ? testPayload() : buildPayload(due);

    if (isDry) {
        console.log('\n--- 보낼 내용 (dry) ---');
        console.log(JSON.stringify(payload, null, 2));
        return;
    }

    await post(webhook, payload);
    console.log(`\n디스코드로 보냈습니다 (${due.length}건).`);

    for (const d of due) state[`${d.type}:${d.id}`] = d.milestone;
    writeState(statePath, state);
}

/* ── 대상 모으기 ─────────────────────────────────────────────── */
function collectItems() {
    const out = [];

    for (const p of COMPANY.products || []) {
        out.push({
            type: 'product', id: p.code, name: p.name,
            label: `등록물품 ${p.name}`,
            what: '입찰참가 등록',
            end: p.regEnd,
            threshold: NOTIFY.productDays ?? 30,
            action: '나라장터에서 직접생산증명서 재발급 후 등록 갱신',
        });
    }

    for (const c of COMPANY.certifications || []) {
        // 유효기간이 없는 인증(기업부설연구소 등)은 만료를 따지지 않는다
        if (c.termMonths === null && !c.until) continue;
        out.push({
            type: 'cert', id: c.key, name: c.name,
            label: `인증 ${c.name}`,
            what: '적격심사 가산점',
            end: c.until,
            threshold: NOTIFY.certDays ?? 30,
            action: `${c.issuer || '발급기관'}에서 ${c.doc || '확인서'} 재발급`,
        });
    }

    for (const m of COMPANY.shoppingMall || []) {
        out.push({
            type: 'mall', id: m.id || m.contractNo || m.name, name: m.name,
            label: `쇼핑몰 ${m.name}`,
            what: '종합쇼핑몰 계약',
            end: m.until,
            threshold: NOTIFY.mallDays ?? 90,
            action: '재계약 신청 — 심사에 시간이 걸립니다',
        });
    }

    return out;
}

/* 남은 일수가 걸리는 가장 가까운 마일스톤. 90일 남았으면 90, 45일이면 30. */
function milestoneFor(left) {
    for (const m of MILESTONES) if (left >= m) return m;
    return MILESTONES[MILESTONES.length - 1];
}

/* ── 디스코드 ────────────────────────────────────────────────── */
function buildPayload(due) {
    const dead = due.filter(d => d.left < 0);
    const soon = due.filter(d => d.left >= 0);
    const embeds = [];

    if (dead.length) {
        embeds.push({
            title: `🚫 만료됨 · ${dead.length}건`,
            description: '해당 품명·인증으로는 지금 입찰에 참여할 수 없습니다.',
            color: 0xc62828,
            fields: dead.map(d => ({
                name: d.label,
                value: `${d.end} 만료 (${-d.left}일 지남)\n${d.action}`,
                inline: false,
            })),
        });
    }

    if (soon.length) {
        const worst = Math.min(...soon.map(d => d.left));
        embeds.push({
            title: `⏳ 만료 임박 · ${soon.length}건`,
            description: worst <= 7
                ? '이번 주 안에 처리해야 합니다.'
                : '재발급·재계약 절차에 시간이 걸립니다. 지금 시작하세요.',
            color: worst <= 7 ? 0xd94f2b : 0xf59e0b,
            fields: soon.map(d => ({
                name: `${d.label} — D-${d.left}`,
                value: `${d.end}까지 (${d.what})\n${d.action}`,
                inline: false,
            })),
        });
    }

    return {
        username: '우성디지탈 입찰 알림',
        embeds: embeds.map(e => ({
            ...e,
            footer: { text: '등록 품목·인증 화면에서 갱신일을 넣으면 반영됩니다' },
            timestamp: new Date().toISOString(),
        })),
    };
}

function testPayload() {
    const lines = collectItems().map(it => {
        if (!it.end) return `• ${it.label} — 날짜 미입력`;
        const left = daysBetween(startOfToday(), parseDate(it.end));
        return `• ${it.label} — ${it.end} (${left >= 0 ? `D-${left}` : `${-left}일 지남`}), ${it.threshold}일 전 알림`;
    });

    return {
        username: '우성디지탈 입찰 알림',
        embeds: [{
            title: '✅ 알림 연결 확인',
            description: '만료 알림이 이 채널로 옵니다.\n\n' + lines.join('\n'),
            color: 0x2e7d32,
            footer: { text: '등록물품·인증 30일 전 / 쇼핑몰 계약 90일 전부터 알립니다' },
            timestamp: new Date().toISOString(),
        }],
    };
}

async function post(webhook, payload) {
    const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`디스코드 HTTP ${res.status}: ${text.slice(0, 300)}`);
    }
}

/* ── 상태 ────────────────────────────────────────────────────── */
/* 어느 마일스톤까지 보냈는지 기억한다. 없으면 매일 같은 알림이 온다. */
function readState(p) {
    try {
        if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
        console.log('상태파일을 읽지 못해 새로 시작합니다:', e.message);
    }
    return {};
}

function writeState(p, state) {
    fs.mkdirSync(path.dirname(path.resolve(p)), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(state, null, 2), 'utf8');
    console.log(`상태 저장: ${p}`);
}

/* ── 날짜 ────────────────────────────────────────────────────── */
function parseDate(s) {
    const d = String(s || '').replace(/\D/g, '');
    if (d.length < 8) return null;
    return new Date(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8));
}
function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
function daysBetween(a, b) {
    return Math.round((b - a) / 86400000);
}
function ymd(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
