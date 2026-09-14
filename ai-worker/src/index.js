// ── 우성디지탈 AI 연관 이미지 생성 Worker ─────────────────────
// 이미지 변환 페이지(imageconvert.html)에서 업로드한 이미지를 참조로
// Workers AI(FLUX.2 [klein])에 스타일별 새 이미지를 만들어 돌려준다.
//
// POST /generate  (multipart/form-data)
//   Authorization: Bearer <Firebase ID 토큰>   ← 로그인한 직원만 사용 가능
//   image  : 참조 이미지 PNG (가로·세로 512px 미만)
//   style  : flat | logo | sign | color
//   aspect : 가로/세로 비율 (결과 이미지 크기 계산용)
// → { image: "data:image/...;base64,..." }

const MODEL = '@cf/black-forest-labs/flux-2-klein-4b';
const MAX_REF_BYTES = 2 * 1024 * 1024;
const OUTPUT_LONG_SIDE = 1024;

// 생성 이미지 속 글자는 모델 특성상 정확하지 않으므로, 글자보다 형태·색 위주로 지시한다.
const STYLES = {
    flat: 'Using image 0 as reference, redraw its main subject as a clean flat vector-style illustration: ' +
          'bold simple shapes, smooth outlines, a limited flat color palette, no gradients, no texture, ' +
          'plain white background. Keep the composition and main colors recognizable.',
    logo: 'Using image 0 as reference, create a minimal modern logo mark inspired by its main subject and colors: ' +
          'simple geometric shapes, two or three flat colors, centered with generous white space, ' +
          'plain white background, professional brand identity style.',
    sign: 'Show the design from image 0 as a real storefront sign: illuminated 3D channel letters and logo ' +
          'mounted on a clean modern shop facade, photorealistic photo, natural daylight, straight-on view. ' +
          'Keep the shapes and colors of image 0.',
    color: 'Recreate image 0 with the same layout and shapes but a fresh, harmonious alternative color scheme, ' +
           'flat graphic style, crisp edges, plain white background.'
};

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '';
        const cors = corsHeaders(origin, env);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
        }
        if (!cors) return json({ error: '허용되지 않은 사이트에서의 요청입니다.' }, 403);

        const url = new URL(request.url);
        if (request.method !== 'POST' || url.pathname !== '/generate') {
            return json({ error: '잘못된 요청입니다.' }, 404, cors);
        }

        try {
            await verifyFirebaseToken(request.headers.get('Authorization'), env.FIREBASE_PROJECT_ID);
        } catch (err) {
            return json({ error: '로그인이 필요합니다. 다시 로그인해 주세요.' }, 401, cors);
        }

        let form;
        try {
            form = await request.formData();
        } catch (err) {
            return json({ error: '요청 형식이 올바르지 않습니다.' }, 400, cors);
        }

        const style = String(form.get('style') || '');
        const image = form.get('image');
        if (!STYLES[style]) return json({ error: '알 수 없는 스타일입니다.' }, 400, cors);
        if (!image || typeof image === 'string') return json({ error: '참조 이미지가 없습니다.' }, 400, cors);
        if (image.size > MAX_REF_BYTES) return json({ error: '참조 이미지가 너무 큽니다.' }, 400, cors);

        const bytes = new Uint8Array(await image.arrayBuffer());
        const dims = pngSize(bytes);
        if (!dims) return json({ error: '참조 이미지는 PNG 여야 합니다.' }, 400, cors);
        if (dims.width >= 512 || dims.height >= 512) {
            return json({ error: '참조 이미지는 가로·세로 512px 미만이어야 합니다.' }, 400, cors);
        }

        const { width, height } = outputSize(parseFloat(form.get('aspect')));

        // 모델의 안전 필터가 평범한 로고도 종종 오탐("output has been flagged")하므로 시드를 바꿔 재시도
        let result;
        for (let attempt = 1; ; attempt++) {
            const aiForm = new FormData();
            aiForm.append('prompt', STYLES[style]);
            aiForm.append('input_image_0', new Blob([bytes], { type: 'image/png' }), 'reference.png');
            aiForm.append('width', String(width));
            aiForm.append('height', String(height));
            aiForm.append('seed', String(Math.floor(Math.random() * 2147483647)));
            const multipart = new Response(aiForm);
            try {
                result = await env.AI.run(MODEL, {
                    multipart: { body: multipart.body, contentType: multipart.headers.get('content-type') }
                });
                break;
            } catch (err) {
                const message = String(err && err.message || err);
                console.error(`AI 생성 실패 (${style}, ${attempt}회차):`, message);
                if (/4006|daily|allocation|neuron/i.test(message)) {
                    return json({ error: '오늘 사용할 수 있는 무료 AI 생성량을 모두 썼습니다. 내일 다시 시도해 주세요.' }, 429, cors);
                }
                if (/flagged/i.test(message)) {
                    if (attempt < 3) continue;
                    return json({ error: 'AI 안전 필터에 걸려 만들지 못했습니다. 다시 시도해 주세요.' }, 422, cors);
                }
                return json({ error: 'AI 이미지 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, 502, cors);
            }
        }

        const base64 = typeof result === 'string' ? result : result && result.image;
        if (!base64) return json({ error: 'AI 가 이미지를 돌려주지 않았습니다.' }, 502, cors);

        const mime = base64.startsWith('iVBOR') ? 'image/png' : base64.startsWith('UklGR') ? 'image/webp' : 'image/jpeg';
        return json({ image: `data:${mime};base64,${base64}`, width, height }, 200, cors);
    }
};

// ── 결과 크기: 긴 변 1024px, 16의 배수, 256~1920 ──
function outputSize(aspect) {
    const a = Number.isFinite(aspect) && aspect > 0 ? Math.min(3, Math.max(1 / 3, aspect)) : 1;
    const round16 = (v) => Math.min(1920, Math.max(256, Math.round(v / 16) * 16));
    return a >= 1
        ? { width: round16(OUTPUT_LONG_SIDE), height: round16(OUTPUT_LONG_SIDE / a) }
        : { width: round16(OUTPUT_LONG_SIDE * a), height: round16(OUTPUT_LONG_SIDE) };
}

// PNG 헤더(IHDR)에서 가로·세로 읽기
function pngSize(b) {
    const sig = [137, 80, 78, 71, 13, 10, 26, 10];
    if (b.length < 24 || sig.some((v, i) => b[i] !== v)) return null;
    const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
}

// ── CORS: 허용된 사이트에서 온 요청만 ──
function corsHeaders(origin, env) {
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (!allowed.includes(origin)) return null;
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
}

function json(body, status, headers) {
    return new Response(JSON.stringify(body), {
        status,
        headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, headers || {})
    });
}

// ── Firebase ID 토큰 검증 (RS256, Google 공개키) ──
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let jwksCache = { keys: null, expires: 0 };

async function getJwks() {
    if (jwksCache.keys && Date.now() < jwksCache.expires) return jwksCache.keys;
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new Error('공개키 조회 실패');
    const data = await res.json();
    const maxAge = /max-age=(\d+)/.exec(res.headers.get('Cache-Control') || '');
    jwksCache = { keys: data.keys, expires: Date.now() + (maxAge ? Number(maxAge[1]) : 3600) * 1000 };
    return data.keys;
}

function b64urlToBytes(s) {
    const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

async function verifyFirebaseToken(authHeader, projectId) {
    const m = /^Bearer\s+(.+)$/.exec(authHeader || '');
    if (!m || !projectId) throw new Error('토큰 없음');
    const [h, p, sig] = m[1].split('.');
    if (!h || !p || !sig) throw new Error('토큰 형식 오류');

    const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h)));
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));
    if (header.alg !== 'RS256' || !header.kid) throw new Error('알고리즘 오류');

    const now = Math.floor(Date.now() / 1000);
    if (payload.aud !== projectId) throw new Error('aud 불일치');
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('iss 불일치');
    if (!payload.sub || typeof payload.sub !== 'string') throw new Error('sub 없음');
    if (!(payload.exp > now) || payload.iat > now + 300) throw new Error('만료');

    const jwk = (await getJwks()).find((k) => k.kid === header.kid);
    if (!jwk) throw new Error('키 없음');
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`));
    if (!ok) throw new Error('서명 불일치');
    return payload;
}
