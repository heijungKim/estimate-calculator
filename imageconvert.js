// ── 이미지 변환: 1) 업로드 → 2) 해상도 개선 → 3) 일러스트·벡터 변환 ──
// 모든 처리는 브라우저 안에서만 이뤄지며 이미지를 서버로 보내지 않는다.
// 사용자가 품질을 조절하지 않도록, 간판·로고·사진이 섞인 이미지로 비교해 정한 최적값으로 자동 처리한다.

$(function() {
    'use strict';

    var MAX_SOURCE_PIXELS = 24000000;   // 원본 허용 한도 (약 4900×4900)
    var MAX_OUTPUT_SIDE = 6000;         // 해상도 개선 결과 긴 변 한도
    var MAX_OUTPUT_PIXELS = 12000000;   // 해상도 개선 결과 픽셀 한도 (브라우저 메모리 보호)
    var ENHANCE_TARGET_SIDE = 4500;     // 긴 변이 이 크기 이상이 되도록 배율 자동 선택 (최대 4배). 1500px 배너면 3배 — 작은 글자 획이 원본에 가장 가깝다
    var TRACE_MAX_SIDE = 4800;          // 벡터 변환에 쓰는 이미지 긴 변 한도 (클수록 곡선이 매끈하다)

    // 해상도 개선 최적값
    var ENHANCE_OPTIONS = { denoise: 1, crisp: 0.6, sharpen: 0.4, contrast: 0 };
    // 원본 유지 모드에서 사진 부분에 넣을 이미지용: 글자 경계 선명화는 사진에 자글자글한 흰 점을 만들어 끈다
    var PHOTO_ENHANCE_OPTIONS = { denoise: 0, crisp: 0, sharpen: 0.3, contrast: 0 };

    // 변환 방식별 최적값 (imageconvert-trace.js 의 옵션)
    var MODES = {
        hybrid: { label: '원본유지', maxColors: 20, mergeDistance: 48, mergeDeltaE: 17, hybrid: true,
                  hint: '글자·도형은 확대해도 깨지지 않는 벡터로, 사진·그라데이션은 선명하게 키운 원본 이미지를 그대로 넣습니다. 실사출력·현수막용으로 가장 원본에 가깝습니다.' },
        illust: { label: '일러스트', maxColors: 16, mergeDistance: 56, mergeDeltaE: 20,
                  hint: '비슷한 색을 합쳐 단순하고 깔끔한 단색 면으로 만듭니다. 확대해도 경계가 깨지지 않아요.' },
        vector: { label: '벡터', maxColors: 20, mergeDistance: 48, mergeDeltaE: 17,
                  hint: '대표 색을 더 많이 남겨 원본에 가깝게 만듭니다. 확대해도 경계가 깨지지 않아요.' },
        mono:   { label: '흑백', maxColors: 2, mergeDistance: 0, mergeDeltaE: 0,
                  hint: '검정 한 가지 색으로 만들어 채널문자·스카시·시트 커팅용 파일에 적합합니다.' }
    };

    var state = {
        file: null,
        srcUrl: null,       // 원본 objectURL
        srcImg: null,
        hasAlpha: false,
        maxStep: 1,
        step: 1,
        enhCanvas: document.getElementById('ic_enh_canvas'),
        enhDirty: true,
        mode: 'hybrid',
        results: {},        // 변환 방식별 결과 캐시 { body, paths, width, height, ms, mode, overlay }
        resultUrl: null,
        resultSvg: null,
        previewUrl: null,
        worker: null,
        jobId: 0,
        timer: null
    };

    // ────────────────────────────────────────────────────────
    //  단계 이동
    // ────────────────────────────────────────────────────────
    function gotoStep(n) {
        if (n > state.maxStep) return;
        state.step = n;
        $('#ic_stepper .ic-step').each(function() {
            var s = +$(this).data('step');
            $(this).toggleClass('active', s === n).toggleClass('done', s !== n && s <= state.maxStep);
        });
        for (var i = 1; i <= 3; i++) $('#ic_panel_' + i).prop('hidden', i !== n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (n === 2) ensureEnhanced().then(function() { if (state.step === 2) layoutPreview(); });
        if (n === 3) enterStep3();
    }

    $('#ic_stepper').on('click', '.ic-step.done', function() { gotoStep(+$(this).data('step')); });
    $(document).on('click', '[data-goto]', function() { gotoStep(+$(this).data('goto')); });
    $('#ic_to_step2').on('click', function() { state.maxStep = Math.max(state.maxStep, 2); gotoStep(2); });
    $('#ic_to_step3').on('click', function() { state.maxStep = 3; gotoStep(3); });

    // ────────────────────────────────────────────────────────
    //  1단계: 업로드
    // ────────────────────────────────────────────────────────
    var $drop = $('#ic_drop');

    $('#ic_file').on('change', function() {
        if (this.files && this.files[0]) loadFile(this.files[0]);
        this.value = '';
    });
    $drop.on('dragover dragenter', function(e) { e.preventDefault(); $drop.addClass('over'); });
    $drop.on('dragleave drop', function(e) { e.preventDefault(); $drop.removeClass('over'); });
    $drop.on('drop', function(e) {
        var files = e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files;
        if (files && files[0]) loadFile(files[0]);
    });
    $(document).on('paste', function(e) {
        var items = (e.originalEvent.clipboardData || {}).items || [];
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image/') === 0) {
                var f = items[i].getAsFile();
                if (f) loadFile(f);
                return;
            }
        }
    });
    $('#ic_reset').on('click', function() { $('#ic_file').trigger('click'); });

    function loadFile(file) {
        $('#ic_upload_error').text('');
        if (!file.type || file.type.indexOf('image/') !== 0) {
            $('#ic_upload_error').text('이미지 파일만 올릴 수 있습니다.');
            return;
        }
        if (file.type === 'image/svg+xml') {
            $('#ic_upload_error').text('SVG 는 이미 벡터 파일이에요. PNG · JPG 같은 일반 이미지를 올려주세요.');
            return;
        }
        var url = URL.createObjectURL(file);
        var img = new Image();
        img.onload = function() {
            if (img.naturalWidth * img.naturalHeight > MAX_SOURCE_PIXELS) {
                URL.revokeObjectURL(url);
                $('#ic_upload_error').text('이미지가 너무 큽니다 (' + img.naturalWidth + '×' + img.naturalHeight +
                    '). 가로·세로를 줄여서 다시 올려주세요.');
                return;
            }
            if (state.srcUrl) URL.revokeObjectURL(state.srcUrl);
            state.file = file;
            state.srcUrl = url;
            state.srcImg = img;
            state.hasAlpha = detectAlpha(img);
            state.enhDirty = true;
            state.enhCanvas.width = 0; // 이전 이미지의 개선 결과가 잠깐 보이지 않도록
            clearResults();
            state.maxStep = 1;

            $('#ic_thumb').attr('src', url);
            $('#ic_meta_name').text(file.name || '붙여넣은 이미지');
            $('#ic_meta_size').text(img.naturalWidth + ' × ' + img.naturalHeight + ' px' + (state.hasAlpha ? ' (투명 배경)' : ''));
            $('#ic_meta_bytes').text(formatBytes(file.size));
            $('#ic_upload_info, #ic_reset').prop('hidden', false);
            $('#ic_to_step2').prop('disabled', false);
            gotoStep(1);
        };
        img.onerror = function() {
            URL.revokeObjectURL(url);
            $('#ic_upload_error').text('이미지를 읽을 수 없습니다. 브라우저가 지원하지 않는 형식(HEIC 등)이면 JPG · PNG 로 바꿔서 올려주세요.');
        };
        img.src = url;
    }

    // 가장자리·전체를 성기게 훑어 투명 픽셀이 있는지 확인
    function detectAlpha(img) {
        var w = Math.min(img.naturalWidth, 256), h = Math.max(1, Math.round(img.naturalHeight * w / img.naturalWidth));
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var d = ctx.getImageData(0, 0, w, h).data;
        for (var i = 3; i < d.length; i += 4) if (d[i] < 250) return true;
        return false;
    }

    // ────────────────────────────────────────────────────────
    //  2단계: 해상도 개선 (자동)
    // ────────────────────────────────────────────────────────
    // 큰 이미지에서 수 초가 걸리므로 웹 워커에서 돌린다. 이미지가 바뀌면 끝난 결과는 버리고 다시 돌린다.
    var enh = { running: false, waiters: [], worker: null, noWorker: false, jobId: 0 };

    // 현재 이미지의 개선 결과가 캔버스에 준비되면 resolve
    function ensureEnhanced() {
        if (!state.srcImg || (!state.enhDirty && !enh.running)) return Promise.resolve();
        return new Promise(function(resolve) {
            enh.waiters.push(resolve);
            kickEnhance();
        });
    }

    function kickEnhance() {
        if (enh.running) return;
        if (!state.srcImg || !state.enhDirty) {
            $('#ic_enh_busy').prop('hidden', true);
            var waiters = enh.waiters;
            enh.waiters = [];
            waiters.forEach(function(fn) { fn(); });
            return;
        }

        state.enhDirty = false;
        enh.running = true;
        $('#ic_enh_busy').prop('hidden', false);

        var job = buildEnhanceJob();
        runEnhanceJob(job).then(function(pixels) {
            if (state.enhDirty) return; // 처리 중에 이미지가 바뀜 → 결과 폐기
            var out = state.enhCanvas;
            out.width = job.tw; out.height = job.th;
            var octx = out.getContext('2d', { willReadFrequently: true });
            var od = octx.createImageData(job.tw, job.th);
            od.data.set(pixels);
            octx.putImageData(od, 0, 0);
            $('#ic_enh_size').text(job.sw + '×' + job.sh + ' → ' + job.tw + '×' + job.th + ' px');
            $('#ic_enh_note').text(job.note);
            updateHeightMm();
            if (state.step === 2) layoutPreview();
        }).catch(function(err) {
            $('#ic_enh_note').text('해상도 개선 중 오류가 발생했습니다: ' + (err && err.message || err));
        }).then(function() {
            enh.running = false;
            kickEnhance();
        });
    }

    function buildEnhanceJob() {
        var img = state.srcImg, sw = img.naturalWidth, sh = img.naturalHeight;

        // 긴 변이 목표 크기에 닿는 정수 배율(1~4배), 메모리 한도 안에서
        var want = Math.min(4, Math.max(1, Math.ceil(ENHANCE_TARGET_SIDE / Math.max(sw, sh))));
        var maxScale = Math.min(MAX_OUTPUT_SIDE / Math.max(sw, sh), Math.sqrt(MAX_OUTPUT_PIXELS / (sw * sh)));
        var eff = Math.min(want, Math.max(1, maxScale));

        var src = document.createElement('canvas');
        src.width = sw; src.height = sh;
        var sctx = src.getContext('2d', { willReadFrequently: true });
        sctx.drawImage(img, 0, 0);

        return {
            sw: sw, sh: sh,
            tw: Math.round(sw * eff), th: Math.round(sh * eff),
            note: eff > 1
                ? '약 ' + (Math.round(eff * 10) / 10) + '배로 자동 확대하고 선명하게 다듬었어요.'
                : '원본이 충분히 커서 크기는 그대로 두고 선명하게만 다듬었어요.',
            pixels: sctx.getImageData(0, 0, sw, sh).data,
            options: ENHANCE_OPTIONS
        };
    }

    function runEnhanceJob(job) {
        function onMainThread() {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    try { resolve(window.wsEnhanceImage(job.pixels, job.sw, job.sh, job.tw, job.th, job.options)); }
                    catch (err) { reject(err); }
                }, 30);
            });
        }
        if (enh.noWorker) return onMainThread();
        if (!enh.worker) {
            try { enh.worker = new Worker('imageconvert-worker.js'); }
            catch (err) { enh.noWorker = true; return onMainThread(); }
        }

        var id = ++enh.jobId, worker = enh.worker;
        return new Promise(function(resolve, reject) {
            worker.onmessage = function(e) {
                if (e.data.id !== id) return;
                if (e.data.ok) resolve(new Uint8ClampedArray(e.data.buffer));
                else reject(new Error(e.data.error));
            };
            worker.onerror = function(e) {
                // 워커 스크립트를 못 불러온 환경(파일 직접 열기 등) → 이후로는 메인 스레드에서 처리
                e.preventDefault();
                enh.noWorker = true;
                enh.worker = null;
                worker.terminate();
                onMainThread().then(resolve, reject);
            };
            var copy = job.pixels.slice();
            worker.postMessage({
                id: id, type: 'enhance', buffer: copy.buffer,
                sw: job.sw, sh: job.sh, tw: job.tw, th: job.th, options: job.options
            }, [copy.buffer]);
        });
    }

    // 해상도 개선 결과 미리보기 (화면 맞춤 / 실제 크기)
    var $preview = $('#ic_compare'), $stage = $('#ic_compare_stage');

    function layoutPreview() {
        var cv = state.enhCanvas, view = document.getElementById('ic_view_canvas');
        if (!cv.width) return;
        var zoom = $('#ic_zoom').is(':checked'), w, h;
        if (zoom) {
            w = cv.width; h = cv.height;
        } else {
            var bw = $preview.innerWidth() - 16, bh = $preview.innerHeight() - 16;
            var k = Math.min(1, bw / cv.width, bh / cv.height);
            w = Math.max(1, Math.floor(cv.width * k));
            h = Math.max(1, Math.floor(cv.height * k));
        }
        $stage.css({ width: w + 'px', height: h + 'px' });

        // 실제 크기면 개선 캔버스를 그대로, 화면 맞춤이면 고품질로 줄인 화면용 캔버스를 보여준다.
        // (큰 캔버스를 CSS 로 크게 줄이면 브라우저가 거칠게 축소해 글자가 흐리고 지글지글해 보인다)
        cv.hidden = !zoom;
        view.hidden = zoom;
        if (!zoom) drawScaled(cv, view, Math.round(w * (window.devicePixelRatio || 1)), Math.round(h * (window.devicePixelRatio || 1)));
    }

    // 절반씩 단계적으로 줄여 그리기 (한 번에 많이 줄이면 픽셀을 건너뛰어 가는 획이 끊겨 보인다)
    function drawScaled(src, dst, w, h) {
        var cur = src;
        while (cur.width / 2 > w) {
            var half = document.createElement('canvas');
            half.width = Math.ceil(cur.width / 2); half.height = Math.ceil(cur.height / 2);
            var hctx = half.getContext('2d');
            hctx.imageSmoothingQuality = 'high';
            hctx.drawImage(cur, 0, 0, half.width, half.height);
            cur = half;
        }
        dst.width = w; dst.height = h;
        var ctx = dst.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(cur, 0, 0, w, h);
    }

    $('#ic_zoom').on('change', function() {
        $preview.toggleClass('zoom', this.checked);
        layoutPreview();
    });
    $(window).on('resize', function() { if (state.step === 2) layoutPreview(); });

    $('#ic_dl_png_enh').on('click', function() {
        ensureEnhanced().then(function() {
            state.enhCanvas.toBlob(function(blob) {
                if (blob) downloadBlob(blob, baseName() + '_해상도개선.png');
            }, 'image/png');
        });
    });

    // ────────────────────────────────────────────────────────
    //  3단계: 일러스트 · 벡터 변환 (자동)
    // ────────────────────────────────────────────────────────
    $('#ic_mode').on('click', 'button', function() {
        var m = $(this).data('v');
        if (m === state.mode) return;
        $(this).addClass('on').siblings().removeClass('on');
        state.mode = m;
        $('#ic_mode_hint').text(MODES[m].hint);
        convertCurrent();
    });

    // 출력 크기는 SVG 겉 크기만 바뀌므로 다시 변환하지 않는다
    $('#ic_width_mm').on('input', function() {
        updateHeightMm();
        var r = state.results[state.mode];
        if (r) showResult(r);
    });
    $('#ic_dark_bg').on('change', function() { $('#ic_result_box').toggleClass('dark', this.checked); });
    $('#ic_result_zoom').on('change', layoutResult);

    // 변환 결과 보기: 기본은 칸에 맞춤, "실제 크기로 보기"면 변환 픽셀 크기 그대로 스크롤해서 확인
    function layoutResult() {
        var zoom = $('#ic_result_zoom').is(':checked'), r = state.results[state.mode];
        $('#ic_result_box').toggleClass('zoom', zoom);
        $('#ic_result_img').css(zoom && r && state.resultSvg ? { width: r.width + 'px', height: r.height + 'px' } : { width: '', height: '' });
    }
    $('#ic_retry').on('click', convertCurrent);
    $('#ic_cancel').on('click', function() {
        stopJob();
        $('#ic_trace_error').text('변환을 취소했습니다.');
        $('#ic_retry').prop('hidden', false);
    });

    function enterStep3() {
        $('#ic_mode_hint').text(MODES[state.mode].hint);
        updateHeightMm();
        convertCurrent();
    }

    function convertCurrent() {
        $('#ic_trace_error').text('');
        $('#ic_retry').prop('hidden', true);
        var cached = state.results[state.mode];
        if (cached) {
            stopJob();
            showResult(cached);
            return;
        }
        stopJob();
        showBusy();
        var id = state.jobId;
        ensureEnhanced().then(function() {
            if (id === state.jobId) beginConvert();
        });
    }

    function showBusy() {
        var started = Date.now();
        $('#ic_trace_busy').prop('hidden', false);
        $('#ic_trace_elapsed').text('0');
        clearInterval(state.timer);
        state.timer = setInterval(function() {
            $('#ic_trace_elapsed').text(Math.floor((Date.now() - started) / 1000));
        }, 500);
        $('#ic_stats').prop('hidden', true);
        $('#ic_dl_svg, #ic_dl_png').prop('disabled', true);
        $('#ic_result_title').text(MODES[state.mode].label + ' 변환 중… (해상도 개선 이미지)');
        showEnhancedPreview();
    }

    function showEnhancedPreview() {
        var cv = state.enhCanvas;
        if (!cv.width) { $('#ic_result_img').removeAttr('src'); return; }
        cv.toBlob(function(blob) {
            if (!blob || !$('#ic_trace_busy').is(':visible')) return;
            if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
            state.previewUrl = URL.createObjectURL(blob);
            $('#ic_result_img').css({ width: '', height: '' }).attr('src', state.previewUrl);
        }, 'image/png');
    }

    function updateHeightMm() {
        var cv = state.enhCanvas, mm = parseFloat($('#ic_width_mm').val());
        if (mm > 0 && cv.width) {
            $('#ic_height_mm').text('세로 약 ' + (Math.round(mm * cv.height / cv.width * 10) / 10) + ' mm');
        } else {
            $('#ic_height_mm').text('세로는 비율에 맞춰 자동');
        }
    }

    function beginConvert() {
        var cv = state.enhCanvas;
        if (!cv.width) { finishJob(); return; }

        var mode = state.mode, preset = MODES[mode];
        var k = Math.min(1, TRACE_MAX_SIDE / Math.max(cv.width, cv.height));
        var w = Math.max(1, Math.round(cv.width * k)), h = Math.max(1, Math.round(cv.height * k));

        // 흰 배경에 합성한 변환용 이미지
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        var ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(cv, 0, 0, w, h);
        var imgd = ctx.getImageData(0, 0, w, h);

        var params = {
            mode: mode,
            maxColors: preset.maxColors,
            mergeDistance: preset.mergeDistance,
            mergeDeltaE: preset.mergeDeltaE,
            // 흑백은 커팅용이라 배경 없이 검은 도형만, 컬러는 원본이 투명 배경일 때만 배경 제거
            removeBg: mode === 'mono' ? true : state.hasAlpha,
            threshold: 128,
            invert: false,
            srcScale: w / state.srcImg.naturalWidth, // 정리 필터 강도를 원본 대비 배율에 맞춘다
            hybrid: !!preset.hybrid
        };
        if (mode === 'mono') {
            var mono = autoMono(imgd);
            params.threshold = mono.threshold;
            params.invert = mono.invert;
        }

        var id = state.jobId, started = Date.now();

        function done(result) {
            if (id !== state.jobId) return;
            result.mode = mode;
            result.aspect = cv.height / cv.width; // mm 세로 크기는 반올림 전 원래 비율로 계산
            var ready = result.mask ? buildPhotoOverlay(result, w, h) : Promise.resolve();
            ready.then(function() {
                if (id !== state.jobId) return;
                finishJob();
                result.ms = Date.now() - started;
                result.mask = null;
                state.results[mode] = result;
                if (state.mode === mode) showResult(result);
            }, function(err) { fail(err && err.message || err); });
        }
        function fail(message) {
            if (id !== state.jobId) return;
            finishJob();
            $('#ic_trace_error').text('변환에 실패했습니다: ' + message);
            $('#ic_retry').prop('hidden', false);
        }
        function runOnMainThread() {
            // 워커를 못 쓰는 환경(파일을 직접 연 경우 등): 화면이 잠시 멈출 수 있음
            setTimeout(function() {
                if (id !== state.jobId) return;
                window.wsTraceImage(imgd, params).then(done, function(err) { fail(err && err.message || err); });
            }, 50);
        }

        var worker = getWorker();
        if (!worker) { runOnMainThread(); return; }

        worker.onmessage = function(e) {
            if (e.data.id !== id) return;
            if (e.data.ok) done(e.data.result); else fail(e.data.error);
        };
        worker.onerror = function(e) {
            e.preventDefault();
            // 워커 스크립트를 못 불러온 경우엔 메인 스레드로 대신 처리
            state.worker = null;
            worker.terminate();
            runOnMainThread();
        };
        // 원본 imgd 는 대체 처리용으로 남겨두고 복사본을 넘긴다
        var copy = imgd.data.slice();
        worker.postMessage({ id: id, width: w, height: h, buffer: copy.buffer, params: params }, [copy.buffer]);
    }

    // 흑백 모드 자동 설정
    // - 명암 기준: Otsu 방식으로 밝은 영역과 어두운 영역이 가장 잘 갈리는 값 (고정 128 이면 연한 글자가 사라진다)
    // - 반전: 테두리가 대부분 어두우면(어두운 바탕에 밝은 글자) 반전해 글자를 검정 도형으로 만든다
    function autoMono(imgd) {
        var d = imgd.data, w = imgd.width, h = imgd.height, n = w * h;
        var step = Math.max(1, Math.floor(n / 200000)), hist = new Array(256).fill(0), count = 0;
        function lum(p) { var i = p * 4; return Math.round(d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114); }
        for (var p = 0; p < n; p += step) { hist[lum(p)]++; count++; }

        var sumAll = 0, i;
        for (i = 0; i < 256; i++) sumAll += i * hist[i];
        var sumB = 0, wB = 0, best = 128, bestVar = -1;
        for (i = 0; i < 256; i++) {
            wB += hist[i];
            if (!wB) continue;
            var wF = count - wB;
            if (!wF) break;
            sumB += i * hist[i];
            var mB = sumB / wB, mF = (sumAll - sumB) / wF, between = wB * wF * (mB - mF) * (mB - mF);
            if (between > bestVar) { bestVar = between; best = i; }
        }
        var threshold = Math.max(10, Math.min(245, best + 1));

        var dark = 0, edge = 0, x, y;
        for (x = 0; x < w; x += 2) { dark += lum(x) < threshold; dark += lum((h - 1) * w + x) < threshold; edge += 2; }
        for (y = 0; y < h; y += 2) { dark += lum(y * w) < threshold; dark += lum(y * w + w - 1) < threshold; edge += 2; }

        return { threshold: threshold, invert: dark > edge * 0.6 };
    }

    function getWorker() {
        if (state.worker) return state.worker;
        try {
            state.worker = new Worker('imageconvert-worker.js');
        } catch (err) {
            state.worker = null;
        }
        return state.worker;
    }

    function finishJob() {
        clearInterval(state.timer);
        $('#ic_trace_busy').prop('hidden', true);
    }

    function stopJob() {
        state.jobId++;
        if (state.worker && !$('#ic_trace_busy').prop('hidden')) {
            state.worker.terminate();
            state.worker = null;
        }
        finishJob();
    }

    // 원본 유지 모드: 사진 영역에만 보이는(마스크를 알파로 쓴) 선명하게 키운 원본 이미지를 PNG 로 만든다
    function buildPhotoOverlay(result, w, h) {
        var img = state.srcImg, sw = img.naturalWidth, sh = img.naturalHeight;
        var src = document.createElement('canvas');
        src.width = sw; src.height = sh;
        var sctx = src.getContext('2d', { willReadFrequently: true });
        sctx.drawImage(img, 0, 0);
        var job = { sw: sw, sh: sh, tw: w, th: h, pixels: sctx.getImageData(0, 0, sw, sh).data, options: PHOTO_ENHANCE_OPTIONS };
        return runEnhanceJob(job).then(function(pixels) {
            var mask = result.mask;
            for (var p = 0, i = 0; p < mask.length; p++, i += 4) {
                var a = mask[p];
                if (a === 0) { pixels[i] = pixels[i + 1] = pixels[i + 2] = pixels[i + 3] = 0; continue; }
                pixels[i + 3] = Math.round(pixels[i + 3] * a / 255);
            }
            var c = document.createElement('canvas');
            c.width = w; c.height = h;
            var ctx = c.getContext('2d');
            var id = ctx.createImageData(w, h);
            id.data.set(pixels);
            ctx.putImageData(id, 0, 0);
            return new Promise(function(resolve, reject) {
                c.toBlob(function(blob) {
                    if (!blob) { reject(new Error('사진 영역 이미지를 만들지 못했습니다.')); return; }
                    var reader = new FileReader();
                    reader.onload = function() { result.overlay = reader.result; resolve(); };
                    reader.onerror = function() { reject(new Error('사진 영역 이미지를 읽지 못했습니다.')); };
                    reader.readAsDataURL(blob);
                }, 'image/png');
            });
        });
    }

    function buildSvg(r) {
        var mm = parseFloat($('#ic_width_mm').val()) || 0;
        var size = mm > 0
            ? 'width="' + fmtNum(mm) + 'mm" height="' + fmtNum(mm * r.aspect) + 'mm"'
            : 'width="' + r.width + '" height="' + r.height + '"';
        // 일러스트레이터 등 구버전 호환을 위해 href 와 xlink:href 를 함께 쓴다
        var overlay = r.overlay
            ? '<image x="0" y="0" width="' + r.width + '" height="' + r.height + '" preserveAspectRatio="none" href="' +
              r.overlay + '" xlink:href="' + r.overlay + '"/>'
            : '';
        return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" ' + size +
            ' viewBox="0 0 ' + r.width + ' ' + r.height + '">' + r.body + overlay + '</svg>';
    }

    function showResult(r) {
        var svg = buildSvg(r);
        state.resultSvg = svg;
        if (state.resultUrl) URL.revokeObjectURL(state.resultUrl);
        state.resultUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        $('#ic_result_img').attr('src', state.resultUrl);
        layoutResult();
        $('#ic_result_title').text('변환 결과 (' + MODES[r.mode].label + ')');

        var mm = parseFloat($('#ic_width_mm').val()) || 0;
        $('#ic_st_size').text(mm > 0
            ? fmtNum(mm) + ' × ' + fmtNum(mm * r.aspect) + ' mm'
            : r.width + ' × ' + r.height + ' px');
        $('#ic_st_paths').text(r.paths.toLocaleString() + '개');
        $('#ic_st_bytes').text(formatBytes(new Blob([svg]).size));
        $('#ic_st_time').text((r.ms / 1000).toFixed(1) + '초');
        $('#ic_stats').prop('hidden', false);
        $('#ic_dl_svg, #ic_dl_png').prop('disabled', false);
        if (r.paths === 0) $('#ic_trace_error').text('변환할 도형을 찾지 못했습니다. 다른 변환 방식을 선택해 보세요.');
    }

    function clearResults() {
        stopJob();
        state.results = {};
        state.resultSvg = null;
        if (state.resultUrl) { URL.revokeObjectURL(state.resultUrl); state.resultUrl = null; }
        $('#ic_result_img').removeAttr('src');
        $('#ic_stats, #ic_retry').prop('hidden', true);
        $('#ic_dl_svg, #ic_dl_png').prop('disabled', true);
        $('#ic_trace_error').text('');
    }

    function currentResult() {
        return state.resultSvg ? state.results[state.mode] : null;
    }

    $('#ic_dl_svg').on('click', function() {
        var r = currentResult();
        if (!r) return;
        var svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + state.resultSvg;
        downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), baseName() + '_' + MODES[r.mode].label + '.svg');
    });

    $('#ic_dl_png').on('click', function() {
        var r = currentResult();
        if (!r) return;
        var img = new Image();
        img.onload = function() {
            var c = document.createElement('canvas');
            c.width = r.width; c.height = r.height;
            c.getContext('2d').drawImage(img, 0, 0, r.width, r.height);
            c.toBlob(function(blob) {
                if (blob) downloadBlob(blob, baseName() + '_' + MODES[r.mode].label + '.png');
            }, 'image/png');
        };
        img.src = state.resultUrl;
    });

    // ────────────────────────────────────────────────────────
    //  공통 유틸
    // ────────────────────────────────────────────────────────
    function baseName() {
        var n = (state.file && state.file.name) || '이미지';
        return n.replace(/\.[^.]+$/, '');
    }

    function downloadBlob(blob, name) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function() { URL.revokeObjectURL(url); }, 5000);
    }

    function formatBytes(n) {
        if (n < 1024) return n + ' B';
        if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
        return (n / 1048576).toFixed(1) + ' MB';
    }

    function fmtNum(v) { return Math.round(v * 10) / 10; }
});
