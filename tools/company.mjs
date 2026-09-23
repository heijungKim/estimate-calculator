/* company.mjs — 입찰참가자격 등록 내용을 읽어 온다.
 *
 * 값은 저장소 루트의 company.json 한 곳에만 둔다. 브라우저(products.html,
 * bid.html)도 같은 파일을 읽으므로, 설정이 두 벌로 갈라지지 않는다.
 *
 * 갱신 날짜는 여기서 고치지 않는다 — products.html 에서 바꾸면 Firestore 에
 * 저장되고, 화면이 이 값 위에 덮어쓴다. 이 파일은 최초 등록 내용이다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const COMPANY = JSON.parse(fs.readFileSync(path.join(ROOT, 'company.json'), 'utf8'));

/* 등록물품 번호 집합 */
export const PRODUCT_CODES = new Set(COMPANY.products.map(p => p.code));

/* 같은 품명군(세부품명번호 앞 8자리). 등록물품과 한 묶음이라
 * 품명 추가 등록으로 참여할 수 있는 건들이다. */
export const PRODUCT_GROUPS = new Set(COMPANY.products.map(p => p.code.slice(0, 8)));

/* 등록이 아직 살아 있는 품명인지 */
export function isProductValid(code, onDate) {
    const p = COMPANY.products.find(x => x.code === code);
    if (!p || !p.regEnd) return false;
    return new Date(p.regEnd + 'T23:59:59') >= (onDate || new Date());
}
