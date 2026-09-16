// ── AI 해상도 복원 (Real-ESRGAN, 브라우저 안에서 실행) ─────────────────
// 저화질 JPG 를 4배로 키우면서 흐릿한 글자 경계·JPG 얼룩을 학습된 모델이 복원한다.
// Lanczos 확대 + 선명화 필터로는 흐린 경계를 "추측"할 수 없어 글자가 뭉개지지만,
// Real-ESRGAN 은 글자·그라데이션·사진을 원본 디자인에 가깝게 되살린다.
//
// - 모델: realesr-general-x4v3 (Tencent ARC, BSD-3, 약 5MB) → lib/realesrgan/
// - 실행: onnxruntime-web (CDN). GPU(WebGPU)가 되면 GPU 로, 아니면 CPU(WASM) 로 자동 전환
// - 이미지는 서버로 보내지 않는다. 큰 이미지는 타일로 잘라 순서대로 처리한다.
//
// wsAiUpscale.run(pixels, sw, sh, { onProgress(done, total, backend), isCancelled() })
//   → Promise<{ pixels: Uint8ClampedArray (sw*4 × sh*4 RGBA), backend: 'webgpu'|'wasm' }>

(function(root) {
    'use strict';

    var ORT_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/';
    var MODEL_URL = 'lib/realesrgan/realesr-general-x4v3.onnx';
    var SCALE = 4, PAD = 8;

    var ortLoaded = null, sessionPromise = null, backendUsed = null;

    function loadOrt() {
        if (root.ort) return Promise.resolve(root.ort);
        if (!ortLoaded) {
            ortLoaded = new Promise(function(resolve, reject) {
                var s = document.createElement('script');
                s.src = ORT_BASE + 'ort.webgpu.min.js';
                s.onload = function() { resolve(root.ort); };
                s.onerror = function() { ortLoaded = null; reject(new Error('AI 실행 모듈을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.')); };
                document.head.appendChild(s);
            });
        }
        return ortLoaded;
    }

    function fetchModel() {
        return fetch(MODEL_URL).then(function(res) {
            if (!res.ok) throw new Error('AI 모델 파일을 불러오지 못했습니다.');
            return res.arrayBuffer();
        });
    }

    // 세션은 한 번만 만든다. WebGPU → 실패하면 WASM(워커에서 실행해 화면이 멈추지 않게)
    function getSession() {
        if (sessionPromise) return sessionPromise;
        sessionPromise = Promise.all([loadOrt(), fetchModel()]).then(function(r) {
            var ort = r[0], model = new Uint8Array(r[1]);
            ort.env.wasm.wasmPaths = ORT_BASE;
            function createWith(backend) {
                return ort.InferenceSession.create(model, { executionProviders: [backend], graphOptimizationLevel: 'all' })
                    .then(function(sess) { backendUsed = backend; return sess; });
            }
            var gpuOk = !!(root.navigator && root.navigator.gpu);
            var first = gpuOk ? createWith('webgpu') : Promise.reject(new Error('no webgpu'));
            return first.catch(function() {
                ort.env.wasm.proxy = true;
                return createWith('wasm');
            });
        });
        sessionPromise.catch(function() { sessionPromise = null; });
        return sessionPromise;
    }

    function run(pixels, sw, sh, o) {
        o = o || {};
        return getSession().then(function(sess) {
            var ort = root.ort, tile = backendUsed === 'webgpu' ? 192 : 128;
            var cols = Math.ceil(sw / tile), rows = Math.ceil(sh / tile), total = cols * rows, done = 0;
            var out = new Uint8ClampedArray(sw * SCALE * sh * SCALE * 4);
            var inputName = sess.inputNames[0], outputName = sess.outputNames[0];

            function step(ty, tx) {
                if (o.isCancelled && o.isCancelled()) return Promise.reject(new Error('cancelled'));
                if (ty >= sh) return Promise.resolve();
                var x0 = Math.max(0, tx - PAD), y0 = Math.max(0, ty - PAD);
                var x1 = Math.min(sw, tx + tile + PAD), y1 = Math.min(sh, ty + tile + PAD);
                var tw = x1 - x0, th = y1 - y0, n = tw * th, inp = new Float32Array(3 * n);
                for (var y = 0; y < th; y++) {
                    for (var x = 0; x < tw; x++) {
                        var i = ((y0 + y) * sw + (x0 + x)) * 4, p = y * tw + x;
                        inp[p] = pixels[i] / 255; inp[n + p] = pixels[i + 1] / 255; inp[2 * n + p] = pixels[i + 2] / 255;
                    }
                }
                var feed = {};
                feed[inputName] = new ort.Tensor('float32', inp, [1, 3, th, tw]);
                return sess.run(feed).then(function(res) {
                    var t = res[outputName].data, ow = tw * SCALE, oh = th * SCALE, on = ow * oh;
                    var cx0 = (tx - x0) * SCALE, cy0 = (ty - y0) * SCALE;
                    var cw = Math.min(tile, sw - tx) * SCALE, ch = Math.min(tile, sh - ty) * SCALE, OW = sw * SCALE;
                    for (var yy = 0; yy < ch; yy++) {
                        var srcRow = (cy0 + yy) * ow + cx0, dstRow = ((ty * SCALE + yy) * OW + tx * SCALE) * 4;
                        for (var xx = 0; xx < cw; xx++) {
                            var q = srcRow + xx, d = dstRow + xx * 4;
                            out[d] = t[q] * 255 + 0.5; out[d + 1] = t[on + q] * 255 + 0.5; out[d + 2] = t[2 * on + q] * 255 + 0.5; out[d + 3] = 255;
                        }
                    }
                    done++;
                    if (o.onProgress) o.onProgress(done, total, backendUsed);
                    var nx = tx + tile, ny = ty;
                    if (nx >= sw) { nx = 0; ny = ty + tile; }
                    return step(ny, nx);
                });
            }
            if (o.onProgress) o.onProgress(0, total, backendUsed);
            return step(0, 0).then(function() { return { pixels: out, backend: backendUsed }; });
        });
    }

    root.wsAiUpscale = { run: run, SCALE: SCALE, supported: function() { return typeof fetch === 'function' && typeof WebAssembly === 'object'; } };
})(window);
