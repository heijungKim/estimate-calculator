// Bounded tile inference: only one 4x tile exists at a time. Runs in a dedicated worker.
(function(root) {
    'use strict';
    var BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/';
    var session, backend, PAD = 24, SCALE = 4;
    function canvas(w, h) {
        var c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : document.createElement('canvas');
        c.width = w; c.height = h; return c;
    }
    async function getSession(cpu) {
        if (session && (!cpu || backend === 'wasm')) return session;
        if (session) { await session.release(); session = null; }
        if (!root.ort) {
            if (typeof importScripts === 'function') importScripts(BASE + 'ort.webgpu.min.js');
            else await new Promise(function(resolve, reject) {
                var s = document.createElement('script'); s.src = BASE + 'ort.webgpu.min.js';
                s.onload = resolve; s.onerror = function() { reject(new Error('AI 실행 모듈 다운로드 실패')); };
                document.head.appendChild(s);
            });
        }
        var ort = root.ort;
        ort.env.wasm.wasmPaths = BASE;
        ort.env.wasm.numThreads = 1;
        // This code already runs in a worker. ORT proxy does not support WebGPU.
        ort.env.wasm.proxy = false;
        var response = await fetch('lib/realesrgan/realesr-general-x4v3.onnx');
        if (!response.ok) throw new Error('AI 모델 다운로드 실패 (' + response.status + ')');
        var model = await response.arrayBuffer();
        backend = !cpu && root.navigator && root.navigator.gpu ? 'webgpu' : 'wasm';
        try { session = await ort.InferenceSession.create(model, {executionProviders: [backend]}); }
        catch (error) {
            if (backend === 'wasm') throw error;
            backend = 'wasm';
            session = await ort.InferenceSession.create(model, {executionProviders: ['wasm']});
        }
        return session;
    }
    async function run(pixels, sw, sh, o) {
        o = o || {};
        var w = o.width || sw * SCALE, h = o.height || sh * SCALE;
        if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w * h > 20000000 || Math.max(w, h) > 8000) throw new Error('결과 크기가 처리 한도를 초과합니다.');
        var sess = await getSession(o.cpu), tile = backend === 'webgpu' ? 128 : 64;
        var out = canvas(w, h), ctx = out.getContext('2d', {willReadFrequently:true});
        ctx.imageSmoothingQuality = 'high';
        var total = Math.ceil(sw / tile) * Math.ceil(sh / tile), done = 0;
        if (o.onProgress) o.onProgress(0, total, backend);
        try {
            for (var ty = 0; ty < sh; ty += tile) for (var tx = 0; tx < sw; tx += tile) {
                if (o.isCancelled && o.isCancelled()) throw new Error('cancelled');
                var x0 = Math.max(0, tx - PAD), y0 = Math.max(0, ty - PAD);
                var tw = Math.min(sw, tx + tile + PAD) - x0, th = Math.min(sh, ty + tile + PAD) - y0;
                var n = tw * th, inp = new Float32Array(n * 3);
                for (var y = 0; y < th; y++) for (var x = 0; x < tw; x++) {
                    var i = ((y0+y)*sw+x0+x)*4, p = y*tw+x, a = pixels[i+3]/255;
                    for (var c = 0; c < 3; c++) inp[c*n+p] = (pixels[i+c]*a + 255*(1-a))/255;
                }
                var feed = {}, result;
                feed[sess.inputNames[0]] = new root.ort.Tensor('float32', inp, [1,3,th,tw]);
                try {
                    result = await sess.run(feed);
                    var tensor = result[sess.outputNames[0]], data = tensor.data, ow = tw*SCALE, oh = th*SCALE, count = ow*oh;
                    if (data.length !== count*3) throw new Error('AI 모델 출력 크기가 올바르지 않습니다.');
                    var rgba = new Uint8ClampedArray(count*4);
                    for (var p = 0; p < count; p++) {
                        for (var c = 0; c < 3; c++) rgba[p*4+c] = data[c*count+p]*255;
                        rgba[p*4+3] = 255;
                    }
                    if (root.wsEnhanceImage && o.options) rgba = root.wsEnhanceImage(rgba,ow,oh,ow,oh,o.options);
                    var piece = canvas(ow,oh);
                    piece.getContext('2d').putImageData(new ImageData(rgba,ow,oh),0,0);
                    var cw = Math.min(tile,sw-tx), ch = Math.min(tile,sh-ty);
                    var dx = Math.round(tx*w/sw), dy = Math.round(ty*h/sh);
                    ctx.drawImage(piece,(tx-x0)*SCALE,(ty-y0)*SCALE,cw*SCALE,ch*SCALE,
                        dx,dy,Math.round((tx+cw)*w/sw)-dx,Math.round((ty+ch)*h/sh)-dy);
                    piece.width = piece.height = 1;
                } finally {
                    feed[sess.inputNames[0]].dispose();
                    if (result) Object.keys(result).forEach(function(key) { result[key].dispose(); });
                }
                if (o.onProgress) o.onProgress(++done,total,backend);
                await new Promise(function(resolve) { setTimeout(resolve,0); });
            }
        } catch (error) {
            out.width = out.height = 1;
            if (backend === 'webgpu' && error.message !== 'cancelled') return run(pixels,sw,sh,Object.assign({},o,{cpu:true}));
            throw error;
        }
        var output = ctx.getImageData(0,0,w,h).data;
        // Resample the original alpha separately, then undo the white inference matte.
        if (o.hasAlpha) {
            var original = canvas(sw,sh); original.getContext('2d').putImageData(new ImageData(pixels,sw,sh),0,0);
            var mask = canvas(w,h), mc = mask.getContext('2d'); mc.imageSmoothingQuality = 'high';
            mc.drawImage(original,0,0,w,h);
            var alpha = mc.getImageData(0,0,w,h).data;
            for (var i = 0; i < output.length; i+=4) {
                var a = alpha[i+3]/255;
                for (var c = 0; c < 3; c++) output[i+c] = a > 0 ? (output[i+c]-255*(1-a))/a : 0;
                output[i+3] = alpha[i+3];
            }
        }
        return {pixels:output, width:w, height:h, backend:backend};
    }
    root.wsAiUpscale = {run:run,SCALE:SCALE,supported:function() { return typeof WebAssembly === 'object'; }};
})(typeof self !== 'undefined' ? self : window);
