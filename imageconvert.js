// ── 이미지 변환: 1) 업로드 → 2) 해상도 개선 → 3) 일러스트·벡터 변환 ──
// 모든 처리는 브라우저 안에서만 이뤄지며 이미지를 서버로 보내지 않는다.

$(function() {
    'use strict';

    var MAX_SOURCE_PIXELS = 24000000;   // 원본 허용 한도 (약 4900×4900)
    var MAX_OUTPUT_SIDE = 6000;         // 해상도 개선 결과 긴 변 한도
    var MAX_OUTPUT_PIXELS = 16000000;   // 해상도 개선 결과 픽셀 한도 (브라우저 메모리 보호)

    var MODE_PRESETS = {
        illust: { colors: 8,  detail: 3, pathomit: 32, blur: 2, stroke: 1,
                  hint: '색을 단순화하고 곡선을 매끈하게 다듬어 일러스트 느낌으로 만듭니다.' },
        vector: { colors: 24, detail: 8, pathomit: 8,  blur: 0, stroke: 1,
                  hint: '원본 형태와 색을 최대한 살려 정밀한 벡터로 만듭니다.' },
        mono:   { colors: 2,  detail: 6, pathomit: 16, blur: 1, stroke: 0,
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
        enhNote: '',
        traceResTouched: false,
        result: null,       // { svg, colors, paths, width, height, ms, params }
        resultUrl: null,
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
        if (n >= 2) ensureEnhanced();
        state.step = n;
        $('#ic_stepper .ic-step').each(function() {
            var s = +$(this).data('step');
            $(this).toggleClass('active', s === n).toggleClass('done', s !== n && s <= state.maxStep);
        });
        for (var i = 1; i <= 3; i++) $('#ic_panel_' + i).prop('hidden', i !== n);
        if (n === 2) layoutCompare();
        if (n === 3) enterStep3();
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            state.traceResTouched = false;
            clearResult();
            state.maxStep = 1;

            $('#ic_thumb').attr('src', url);
            $('#ic_before_img').attr('src', url);
            $('#ic_meta_name').text(file.name || '붙여넣은 이미지');
            $('#ic_meta_size').text(img.naturalWidth + ' × ' + img.naturalHeight + ' px' + (state.hasAlpha ? ' (투명 배경)' : ''));
            $('#ic_meta_bytes').text(formatBytes(file.size));
            $('#ic_upload_info, #ic_reset').prop('hidden', false);
            $('#ic_to_step2').prop('disabled', false);
            $('#ic_remove_bg').prop('checked', state.hasAlpha);
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
    //  2단계: 해상도 개선
    // ────────────────────────────────────────────────────────
    var enhParams = { scale: 2 };

    $('#ic_scale').on('click', 'button', function() {
        $(this).addClass('on').siblings().removeClass('on');
        enhParams.scale = +$(this).data('v');
        scheduleEnhance();
    });
    bindRange('#ic_sharpen', scheduleEnhance);
    bindRange('#ic_denoise', scheduleEnhance);
    bindRange('#ic_contrast', scheduleEnhance);

    var enhTimer = null;
    function scheduleEnhance() {
        state.enhDirty = true;
        markStale();
        clearTimeout(enhTimer);
        $('#ic_enh_busy').prop('hidden', false);
        // 오버레이가 먼저 그려지도록 잠깐 기다렸다가 처리
        enhTimer = setTimeout(function() { ensureEnhanced(); }, 250);
    }

    function ensureEnhanced() {
        clearTimeout(enhTimer);
        if (!state.srcImg) return;
        if (state.enhDirty) {
            try {
                runEnhance();
            } catch (err) {
                $('#ic_enh_note').text('해상도 개선 중 오류가 발생했습니다: ' + (err && err.message || err));
            }
            state.enhDirty = false;
        }
        $('#ic_enh_busy').prop('hidden', true);
        if (state.step === 2) layoutCompare();
    }

    function runEnhance() {
        var img = state.srcImg, sw = img.naturalWidth, sh = img.naturalHeight;
        var scale = enhParams.scale;
        var sharpen = +$('#ic_sharpen').val() / 100;
        var denoise = +$('#ic_denoise').val();
        var contrast = +$('#ic_contrast').val() / 100;

        // 결과 크기 한도 적용
        var maxScale = Math.min(MAX_OUTPUT_SIDE / Math.max(sw, sh), Math.sqrt(MAX_OUTPUT_PIXELS / (sw * sh)));
        var eff = Math.min(scale, Math.max(1, maxScale));
        var tw = Math.round(sw * eff), th = Math.round(sh * eff);
        state.enhNote = eff < scale
            ? '원본이 커서 ' + scale + '배 대신 약 ' + (Math.floor(eff * 10) / 10) + '배로 처리했어요.'
            : '';

        // 1) 원본 → 노이즈 제거
        var src = document.createElement('canvas');
        src.width = sw; src.height = sh;
        var sctx = src.getContext('2d', { willReadFrequently: true });
        sctx.drawImage(img, 0, 0);
        if (denoise > 0) {
            var sd = sctx.getImageData(0, 0, sw, sh);
            var blurred = boxBlur(sd.data, sw, sh, 1, denoise >= 3 ? 2 : 1);
            var mix = denoise === 1 ? 0.5 : 1;
            for (var i = 0; i < sd.data.length; i++) {
                if ((i & 3) === 3) continue;
                sd.data[i] = sd.data[i] + (blurred[i] - sd.data[i]) * mix;
            }
            sctx.putImageData(sd, 0, 0);
        }

        // 2) 단계적 2배 확대 (한 번에 크게 늘리는 것보다 계단·뭉개짐이 적다)
        var cur = src;
        while (cur.width * 2 <= tw && cur.height * 2 <= th) {
            cur = resizeCanvas(cur, cur.width * 2, cur.height * 2);
        }
        if (cur.width !== tw || cur.height !== th) cur = resizeCanvas(cur, tw, th);

        // 3) 언샤프 마스크 + 대비
        var out = state.enhCanvas;
        out.width = tw; out.height = th;
        var octx = out.getContext('2d', { willReadFrequently: true });
        octx.clearRect(0, 0, tw, th);
        octx.drawImage(cur, 0, 0);

        if (sharpen > 0 || contrast !== 0) {
            var od = octx.getImageData(0, 0, tw, th), d = od.data;
            var soft = sharpen > 0 ? boxBlur(d, tw, th, Math.max(1, Math.round(eff * 0.6)), 2) : null;
            var cf = 1 + contrast;
            for (var j = 0; j < d.length; j++) {
                if ((j & 3) === 3) continue;
                var v = d[j];
                if (soft) {
                    var diff = v - soft[j];
                    if (diff > 2 || diff < -2) v += diff * sharpen;
                }
                if (contrast !== 0) v = (v - 128) * cf + 128;
                d[j] = v; // Uint8ClampedArray 가 0~255 로 잘라준다
            }
            octx.putImageData(od, 0, 0);
        }

        $('#ic_enh_size').text(sw + '×' + sh + ' → ' + tw + '×' + th + ' px');
        $('#ic_enh_note').text(state.enhNote);
        updateHeightMm();
    }

    function resizeCanvas(source, w, h) {
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        var ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(source, 0, 0, w, h);
        return c;
    }

    // RGB 채널 박스 블러 (passes 회 반복하면 가우시안에 가까워짐). 알파는 그대로 복사.
    function boxBlur(data, w, h, r, passes) {
        var a = new Uint8ClampedArray(data), b = new Uint8ClampedArray(data.length);
        var win = r * 2 + 1, x, y, c, sum, row, col, idx;
        for (var p = 0; p < passes; p++) {
            // 가로
            for (y = 0; y < h; y++) {
                row = y * w;
                for (c = 0; c < 3; c++) {
                    sum = a[row * 4 + c] * (r + 1);
                    for (x = 1; x <= r; x++) sum += a[(row + Math.min(x, w - 1)) * 4 + c];
                    for (x = 0; x < w; x++) {
                        b[(row + x) * 4 + c] = sum / win;
                        sum += a[(row + Math.min(x + r + 1, w - 1)) * 4 + c] - a[(row + Math.max(x - r, 0)) * 4 + c];
                    }
                }
            }
            // 세로
            for (x = 0; x < w; x++) {
                for (c = 0; c < 3; c++) {
                    sum = b[x * 4 + c] * (r + 1);
                    for (y = 1; y <= r; y++) sum += b[(Math.min(y, h - 1) * w + x) * 4 + c];
                    for (y = 0; y < h; y++) {
                        idx = (y * w + x) * 4 + c;
                        a[idx] = sum / win;
                        sum += b[(Math.min(y + r + 1, h - 1) * w + x) * 4 + c] - b[(Math.max(y - r, 0) * w + x) * 4 + c];
                    }
                }
            }
        }
        return a;
    }

    // 원본/개선 비교 뷰
    var $compare = $('#ic_compare'), $stage = $('#ic_compare_stage');

    function layoutCompare() {
        var cv = state.enhCanvas;
        if (!cv.width) return;
        var w, h;
        if ($('#ic_zoom').is(':checked')) {
            w = cv.width; h = cv.height;
        } else {
            var bw = $compare.innerWidth() - 16, bh = $compare.innerHeight() - 16;
            var k = Math.min(bw / cv.width, bh / cv.height);
            w = Math.max(1, Math.floor(cv.width * k));
            h = Math.max(1, Math.floor(cv.height * k));
        }
        $stage.css({ width: w + 'px', height: h + 'px' });
        setComparePos(+$('#ic_compare_range').val());
    }

    function setComparePos(pct) {
        $('#ic_compare_before').css('clip-path', 'inset(0 ' + (100 - pct) + '% 0 0)');
        $('#ic_compare_line').css('left', pct + '%');
    }

    $('#ic_zoom').on('change', function() {
        $compare.toggleClass('zoom', this.checked);
        layoutCompare();
    });
    $('#ic_compare_range').on('input', function() { setComparePos(+this.value); });

    // 미리보기 위를 드래그해서 비교선 이동
    var dragging = false;
    $stage.on('pointerdown', function(e) { dragging = true; moveCompare(e); this.setPointerCapture && this.setPointerCapture(e.originalEvent.pointerId); });
    $stage.on('pointermove', function(e) { if (dragging) moveCompare(e); });
    $stage.on('pointerup pointercancel', function() { dragging = false; });
    function moveCompare(e) {
        var rect = $stage[0].getBoundingClientRect();
        var pct = Math.max(0, Math.min(100, (e.originalEvent.clientX - rect.left) / rect.width * 100));
        $('#ic_compare_range').val(pct);
        setComparePos(pct);
    }
    $(window).on('resize', function() { if (state.step === 2) layoutCompare(); });

    $('#ic_dl_png_enh').on('click', function() {
        ensureEnhanced();
        state.enhCanvas.toBlob(function(blob) {
            if (blob) downloadBlob(blob, baseName() + '_해상도개선.png');
        }, 'image/png');
    });

    // ────────────────────────────────────────────────────────
    //  3단계: 일러스트 · 벡터 변환
    // ────────────────────────────────────────────────────────
    var mode = 'illust';

    $('#ic_mode').on('click', 'button', function() {
        $(this).addClass('on').siblings().removeClass('on');
        applyMode($(this).data('v'));
        markStale();
    });

    function applyMode(m) {
        mode = m;
        var p = MODE_PRESETS[m];
        setRange('#ic_colors', p.colors);
        setRange('#ic_detail', p.detail);
        setRange('#ic_pathomit', p.pathomit);
        setRange('#ic_blur', p.blur);
        setRange('#ic_stroke', p.stroke);
        $('#ic_mode_hint').text(p.hint);
        $('#ic_field_colors').prop('hidden', m === 'mono');
        $('#ic_field_threshold').prop('hidden', m !== 'mono');
        if (m === 'mono') $('#ic_remove_bg').prop('checked', true);
        else $('#ic_remove_bg').prop('checked', state.hasAlpha);
    }

    ['#ic_colors', '#ic_detail', '#ic_pathomit', '#ic_blur', '#ic_stroke', '#ic_threshold'].forEach(function(sel) {
        bindRange(sel, markStale);
    });
    bindRange('#ic_trace_res', function() { state.traceResTouched = true; markStale(); });
    $('#ic_invert, #ic_remove_bg').on('change', markStale);
    $('#ic_width_mm').on('input', function() { updateHeightMm(); markStale(); });
    $('#ic_dark_bg').on('change', function() { $('#ic_result_box').toggleClass('dark', this.checked); });

    function enterStep3() {
        var cv = state.enhCanvas;
        if (!state.traceResTouched && cv.width) {
            var longSide = Math.max(cv.width, cv.height);
            setRange('#ic_trace_res', Math.round(Math.max(800, Math.min(2000, longSide)) / 100) * 100);
        }
        if (!$('#ic_mode_hint').text()) applyMode(mode);
        updateHeightMm();
        if (!state.result) showEnhancedPreview();
    }

    function showEnhancedPreview() {
        var cv = state.enhCanvas;
        $('#ic_result_title').text('변환 전 미리보기 (해상도 개선 이미지)');
        $('#ic_stats').prop('hidden', true);
        cv.toBlob(function(blob) {
            if (!blob || state.result) return;
            if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
            state.previewUrl = URL.createObjectURL(blob);
            $('#ic_result_img').attr('src', state.previewUrl);
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

    function collectParams() {
        return {
            mode: mode,
            colors: +$('#ic_colors').val(),
            detail: +$('#ic_detail').val(),
            pathomit: +$('#ic_pathomit').val(),
            blur: +$('#ic_blur').val(),
            stroke: +$('#ic_stroke').val(),
            threshold: +$('#ic_threshold').val(),
            invert: $('#ic_invert').is(':checked'),
            removeBg: $('#ic_remove_bg').is(':checked'),
            widthMm: parseFloat($('#ic_width_mm').val()) || 0,
            traceRes: +$('#ic_trace_res').val()
        };
    }

    $('#ic_convert').on('click', startConvert);
    $('#ic_cancel').on('click', function() { stopJob(); $('#ic_trace_error').text('변환을 취소했습니다.'); });

    function startConvert() {
        ensureEnhanced();
        var cv = state.enhCanvas;
        if (!cv.width) return;
        stopJob();
        $('#ic_trace_error').text('');

        var params = collectParams();
        var k = params.traceRes / Math.max(cv.width, cv.height);
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

        var id = ++state.jobId, started = Date.now();
        $('#ic_trace_busy').prop('hidden', false);
        $('#ic_convert').prop('disabled', true);
        $('#ic_trace_elapsed').text('0');
        state.timer = setInterval(function() {
            $('#ic_trace_elapsed').text(Math.floor((Date.now() - started) / 1000));
        }, 500);

        function done(result) {
            if (id !== state.jobId) return;
            finishJob();
            result.ms = Date.now() - started;
            result.params = params;
            showResult(result);
        }
        function fail(message) {
            if (id !== state.jobId) return;
            finishJob();
            $('#ic_trace_error').text('변환에 실패했습니다: ' + message);
        }
        function runOnMainThread() {
            // 워커를 못 쓰는 환경(파일을 직접 연 경우 등): 화면이 잠시 멈출 수 있음
            setTimeout(function() {
                if (id !== state.jobId) return;
                try { done(window.wsTraceImage(imgd, params)); }
                catch (err) { fail(err && err.message || err); }
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
        $('#ic_convert').prop('disabled', false);
    }

    function stopJob() {
        state.jobId++;
        if (state.worker && !$('#ic_trace_busy').prop('hidden')) {
            state.worker.terminate();
            state.worker = null;
        }
        finishJob();
    }

    function showResult(r) {
        state.result = r;
        if (state.resultUrl) URL.revokeObjectURL(state.resultUrl);
        state.resultUrl = URL.createObjectURL(new Blob([r.svg], { type: 'image/svg+xml' }));
        $('#ic_result_img').attr('src', state.resultUrl);
        $('#ic_result_title').text('변환 결과 (' + { illust: '일러스트', vector: '벡터', mono: '흑백' }[r.params.mode] + ')');

        var size = r.params.widthMm > 0
            ? fmtNum(r.params.widthMm) + ' × ' + fmtNum(r.params.widthMm * r.height / r.width) + ' mm'
            : r.width + ' × ' + r.height + ' px';
        $('#ic_st_size').text(size);
        $('#ic_st_colors').text(r.colors + '색');
        $('#ic_st_paths').text(r.paths.toLocaleString() + '개');
        $('#ic_st_bytes').text(formatBytes(new Blob([r.svg]).size));
        $('#ic_st_time').text((r.ms / 1000).toFixed(1) + '초');
        $('#ic_stats').prop('hidden', false);
        $('#ic_stale').prop('hidden', true);
        $('#ic_dl_svg, #ic_dl_png').prop('disabled', false);
        if (r.paths === 0) {
            $('#ic_trace_error').text('남은 도형이 없습니다. 작은 조각 제거 값을 낮추거나 배경 제거를 끄고 다시 변환해 보세요.');
        }
    }

    function markStale() {
        if (state.result) $('#ic_stale').prop('hidden', false);
    }

    function clearResult() {
        stopJob();
        state.result = null;
        if (state.resultUrl) { URL.revokeObjectURL(state.resultUrl); state.resultUrl = null; }
        $('#ic_result_img').removeAttr('src');
        $('#ic_stats, #ic_stale').prop('hidden', true);
        $('#ic_dl_svg, #ic_dl_png').prop('disabled', true);
        $('#ic_trace_error').text('');
    }

    $('#ic_dl_svg').on('click', function() {
        if (!state.result) return;
        var svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + state.result.svg;
        downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), baseName() + '_' + modeName() + '.svg');
    });

    $('#ic_dl_png').on('click', function() {
        var r = state.result;
        if (!r) return;
        var img = new Image();
        img.onload = function() {
            var c = document.createElement('canvas');
            c.width = r.width; c.height = r.height;
            c.getContext('2d').drawImage(img, 0, 0, r.width, r.height);
            c.toBlob(function(blob) {
                if (blob) downloadBlob(blob, baseName() + '_' + modeName() + '.png');
            }, 'image/png');
        };
        img.src = state.resultUrl;
    });

    // ────────────────────────────────────────────────────────
    //  공통 유틸
    // ────────────────────────────────────────────────────────
    function bindRange(sel, onChange) {
        $(sel).on('input', function() {
            $(sel + '_v').text(this.value);
            onChange();
        });
    }

    function setRange(sel, v) {
        $(sel).val(v);
        $(sel + '_v').text($(sel).val());
    }

    function modeName() {
        return { illust: '일러스트', vector: '벡터', mono: '흑백' }[state.result ? state.result.params.mode : mode];
    }

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
