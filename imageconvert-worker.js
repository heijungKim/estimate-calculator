// ── 이미지 변환 웹 워커 ────────────────────────────────────────
// 해상도 개선·벡터 변환은 큰 이미지에서 수 초가 걸리므로 화면이 멈추지 않게 워커에서 돌린다.
importScripts('lib/imagetracer_v1.2.6.js', 'imageconvert-trace.js', 'imageconvert-enhance.js');

self.onmessage = function(e) {
    var msg = e.data;
    try {
        if (msg.type === 'enhance') {
            var pixels = self.wsEnhanceImage(new Uint8ClampedArray(msg.buffer), msg.sw, msg.sh, msg.tw, msg.th, msg.options);
            self.postMessage({ id: msg.id, ok: true, buffer: pixels.buffer }, [pixels.buffer]);
            return;
        }
        var imgd = { width: msg.width, height: msg.height, data: new Uint8ClampedArray(msg.buffer) };
        var result = self.wsTraceImage(imgd, msg.params);
        self.postMessage({ id: msg.id, ok: true, result: result });
    } catch (err) {
        self.postMessage({ id: msg.id, ok: false, error: String(err && err.message || err) });
    }
};
