// ── 이미지 변환: 1) 업로드 → 2) 해상도 개선 → 3) 일러스트·벡터 변환 ──
// 모든 처리는 브라우저 안에서만 이뤄지며 이미지를 서버로 보내지 않는다.
// 이미지 종류와 출력 크기에 맞춰 복원하고 원본과 비교한다.

$(function() {
    'use strict';

    var MAX_SOURCE_PIXELS = 24000000;   // 원본 허용 한도 (약 4900×4900)
    var MAX_OUTPUT_SIDE = 8000;         // 해상도 개선 결과 긴 변 한도
    var MAX_OUTPUT_PIXELS = 20000000;   // 해상도 개선 결과 픽셀 한도 (브라우저 메모리 보호)
    var TRACE_MAX_SIDE = 4800;          // 벡터 변환에 쓰는 이미지 긴 변 한도 (클수록 곡선이 매끈하다)

    // 해상도 개선 최적값 (AI 복원을 쓸 수 없을 때의 기본 방식)
    var ENHANCE_OPTIONS = { denoise: 1, crisp: 0.6, sharpen: 0.4, contrast: 0 };
    // 원본 유지 모드에서 사진 부분에 넣을 이미지용: 글자 경계 선명화는 사진에 자글자글한 흰 점을 만들어 끈다
    var PHOTO_ENHANCE_OPTIONS = { denoise: 0, crisp: 0, sharpen: 0.3, contrast: 0 };

    // 변환 방식별 최적값 (imageconvert-trace.js 의 옵션)
    var MODES = {
        raster: { label: '사진 유지 · 글자 교체', hint: '사진은 그대로 유지합니다. 글자 한 줄을 직접 선택하고 비슷한 폰트로 교체하세요. 사진을 그대로 저장하려면 PNG를 사용하세요. SVG는 전체를 개별 벡터 도형으로 변환한 뒤 저장합니다.' },
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
        enhAi: false,       // 개선 결과가 AI 복원인지 (원본 유지 모드의 사진 영역에 그대로 쓴다)
        mode: 'vector',
        results: {},        // 변환 방식별 결과 캐시 { body, paths, width, height, ms, mode, overlay, index, palette }
        replacements: [],   // 글자 폰트 교체 목록 { id, text, font, colors, vec }
        resultUrl: null,
        resultSvg: null,
        previewUrl: null,
        worker: null,
        jobId: 0,
        timer: null
    };

    var suggestionKey=null;
    var suggestions=new window.wsImageSuggestions(document.getElementById('ic_suggestion_grid'),function(mode){
        closeTextEditor();enterFontMode(!state.enhCanvas.width,mode);
    });
    $('#ic_suggestion_filters').on('click','button',function(){
        $(this).attr('aria-pressed','true').siblings().attr('aria-pressed','false');
        suggestions.filter($(this).data('kind'));
    });
    function showSuggestions() {
        if(!state.srcImg)return;
        var key=state.srcUrl+':'+state.enhCanvas.width+':'+state.enhAi;
        $('#ic_suggestions').prop('hidden',false);
        if(key===suggestionKey)return;suggestionKey=key;
        suggestions.show(state.enhCanvas.width?state.enhCanvas:state.srcImg,MODES,autoMono);
    }

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
        if (n === 2) ensureEnhanced().then(function() { if (state.step === 2) { layoutPreview(); showSuggestions(); } });
        if (n === 3) enterStep3();
    }

    $('#ic_stepper').on('click', '.ic-step.done', function() { var step=+$(this).data('step');if(step===3)goToConversion();else gotoStep(step); });
    $(document).on('click', '[data-goto]', function() { gotoStep(+$(this).data('goto')); });
    $('#ic_to_step2').on('click', function() { state.maxStep = Math.max(state.maxStep, 2); gotoStep(2); });
    $('.ic-next-convert').on('click',goToConversion);
    $('#ic_show_suggestions').on('click',function(){showSuggestions();document.getElementById('ic_suggestions').scrollIntoView({behavior:'smooth',block:'start'});});
    function goToConversion(){
        if(!state.srcImg || enh.running)return;
        enterFontMode(!state.enhCanvas.width,state.mode);
    }
    function updateConversionNavigation(){
        var ready=!!state.srcImg && !enh.running && state.maxStep>=2;
        $('.ic-next-convert').prop('disabled',!ready).text(enh.running?'복원 중… 완료 후 변환':state.enhCanvas.width?'다음: 변환 탭 →':'원본으로 변환 탭 →');
        $('#ic_show_suggestions').prop('disabled',!ready);
        if(ready)state.maxStep=Math.max(state.maxStep,3);
        $('#ic_stepper [data-step="3"]').toggleClass('done',ready&&state.step!==3);
    }

    $('#ic_direct_fonts').on('click', function() { enterFontMode(true); });
    $('#ic_enh_fonts').on('click', function() { enterFontMode(false); });
    function enterFontMode(original,mode) {
        mode=mode||'raster';
        if (!state.srcImg) return;
        if (original) {
            cancelAi();
            state.enhDirty = false;
            var img=state.srcImg, scale=Math.min(1,MAX_OUTPUT_SIDE/Math.max(img.naturalWidth,img.naturalHeight),Math.sqrt(MAX_OUTPUT_PIXELS/(img.naturalWidth*img.naturalHeight)));
            drawScaled(img,state.enhCanvas,Math.max(1,Math.floor(img.naturalWidth*scale)),Math.max(1,Math.floor(img.naturalHeight*scale)));
            state.enhAi=false;clearResults();
            $('#ic_enh_size').text(state.enhCanvas.width+' × '+state.enhCanvas.height+' px');
            $('#ic_enh_note').text('원본 이미지 · AI 복원 없이 대체 변환');
            $('#ic_dl_png_enh, .ic-next-convert, #ic_enh_fonts').prop('disabled',false);printReport();
        }
        state.mode=mode; $('#ic_mode button').removeClass('on').filter('[data-v="'+mode+'"]').addClass('on');
        state.maxStep=3;gotoStep(3);
    }

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

    var uploadVersion = 0;
    function loadFile(file) {
        var version = ++uploadVersion;
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
            if (version !== uploadVersion) { URL.revokeObjectURL(url); return; }
            if (img.naturalWidth * img.naturalHeight > MAX_SOURCE_PIXELS) {
                URL.revokeObjectURL(url);
                $('#ic_upload_error').text('이미지가 너무 큽니다 (' + img.naturalWidth + '×' + img.naturalHeight +
                    '). 가로·세로를 줄여서 다시 올려주세요.');
                return;
            }
            if (state.srcUrl) URL.revokeObjectURL(state.srcUrl);
            cancelAi();suggestions.reset();suggestionKey=null;$('#ic_suggestions').prop('hidden',true);
            state.file = file;
            state.srcUrl = url;
            state.srcImg = img;
            state.hasAlpha = detectAlpha(img);
            state.enhDirty = true;
            $('#ic_dl_png_enh, .ic-next-convert, #ic_enh_fonts').prop('disabled', true);
            $('#ic_enh_error, #ic_enh_note').text('');
            state.enhCanvas.width = 0; // 이전 이미지의 개선 결과가 잠깐 보이지 않도록
            clearResults();
            state.maxStep = 1;

            $('#ic_thumb').attr('src', url);
            $('#ic_meta_name').text(file.name || '붙여넣은 이미지');
            $('#ic_meta_size').text(img.naturalWidth + ' × ' + img.naturalHeight + ' px' + (state.hasAlpha ? ' (투명 배경)' : ''));
            $('#ic_meta_bytes').text(formatBytes(file.size));
            $('#ic_upload_info, #ic_reset').prop('hidden', false);
            $('#ic_to_step2, #ic_direct_fonts').prop('disabled', false);
            gotoStep(1);
        };
        img.onerror = function() {
            URL.revokeObjectURL(url);
            if (version !== uploadVersion) return;
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
    var enh = { running: false, waiters: [], worker: null, noWorker: false, jobId: 0, aiWorker: null, rejectAi: null };
    function cancelAi() {
        if (enh.aiWorker) { enh.aiWorker.terminate(); enh.aiWorker = null; }
        if (enh.rejectAi) { enh.rejectAi(new Error('cancelled')); enh.rejectAi = null; }
    }
    $('#ic_enh_cancel').on('click', function() {
        if (!enh.aiWorker) return;
        state.enhDirty = false;
        cancelAi();
        $('#ic_enh_error').text('복원을 취소했습니다. 다시 복원 버튼으로 재시도할 수 있습니다.');
    });
    $('#ic_enh_apply').on('click', function() {
        cancelAi();
        state.enhDirty = true;
        state.enhCanvas.width = 0;
        clearResults();
        state.maxStep = 2;
        gotoStep(2);
    });
    function printReport() {
        var cv = state.enhCanvas, mm = +$('#ic_print_width').val(), dpi = 300;
        if (!cv.width) { $('#ic_print_report').text('복원 후 출력 가능 크기를 확인할 수 있습니다.'); return; }
        if (!(mm > 0 && Number.isFinite(mm))) { $('#ic_print_report').text('출력 가로 크기를 입력하세요.'); return; }
        var actual = cv.width * 25.4 / mm;
        $('#ic_print_report').text('출력 ' + fmtNum(mm) + ' × ' + fmtNum(mm*cv.height/cv.width) + ' mm · ' + Math.round(actual) + ' PPI\n' +
            '목표 ' + dpi + ' PPI 기준 최대 ' + fmtNum(cv.width*25.4/dpi) + ' × ' + fmtNum(cv.height*25.4/dpi) + ' mm\n' +
            (actual >= dpi ? '목표 픽셀 수 충족 · 실제 선명도는 1:1로 확인하세요.' : '목표보다 픽셀이 부족합니다. 출력 크기를 줄이거나 더 큰 원본을 사용하세요.'));
    }
    $('#ic_print_width').on('input change', printReport);

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
            updateConversionNavigation();
            $('#ic_enh_busy').prop('hidden', true);
            var waiters = enh.waiters;
            enh.waiters = [];
            waiters.forEach(function(fn) { fn(); });
            return;
        }

        state.enhDirty = false;
        enh.running = true;
        updateConversionNavigation();
        suggestions.reset();suggestionKey=null;$('#ic_suggestions').prop('hidden',true);
        $('#ic_enh_error, #ic_enh_note').text('');
        $('#ic_enh_size').text('처리 중');
        document.getElementById('ic_view_canvas').width=0;
        printReport();
        $('#ic_dl_png_enh, .ic-next-convert, #ic_enh_fonts, #ic_enh_apply').prop('disabled', true);
        $('#ic_enh_busy').prop('hidden', false);
        $('#ic_enh_busy_text').text('AI 해상도 복원 준비 중…');

        var job;
        try { job = buildEnhanceJob(); } catch (error) {
            enh.running = false; $('#ic_enh_apply').prop('disabled', false);
            $('#ic_enh_error').text(error.message); kickEnhance(); return;
        }
        $('#ic_enh_cancel').prop('hidden', !job.ai);
        var work = runAiJob(job);

        work.then(function(res) {
            if (state.enhDirty) return; // 처리 중에 이미지가 바뀜 → 결과 폐기
            putEnhanced(res.pixels, res.w, res.h);
            state.enhAi = !!job.ai;
            var out = state.enhCanvas;
            $('#ic_enh_size').text(job.sw + '×' + job.sh + ' → ' + out.width + '×' + out.height + ' px');
            $('#ic_enh_note').text(job.note);
            updateHeightMm();
            printReport();
            $('#ic_dl_png_enh, .ic-next-convert, #ic_enh_fonts').prop('disabled', false);
            if (state.step === 2) layoutPreview();
        }).catch(function(err) {
            if(!state.enhDirty)$('#ic_enh_size').text('복원 결과 없음');
            if (!state.enhDirty && err.message !== 'cancelled') $('#ic_enh_error').text('복원 실패: ' + (err && err.message || err) + '. 다시 복원하거나 아래 대체 추천을 선택하세요.');
        }).then(function() {
            enh.running = false;
            $('#ic_enh_apply').prop('disabled', false);
            kickEnhance();
        });
    }

    // 결과 픽셀을 개선 캔버스에 넣는다. 한도를 넘는 크기면 절반씩 고품질로 줄여 넣는다.
    function putEnhanced(pixels, w, h) {
        var src = document.createElement('canvas');
        src.width = w; src.height = h;
        var sctx = src.getContext('2d', { willReadFrequently: true });
        var id = sctx.createImageData(w, h);
        id.data.set(pixels);
        sctx.putImageData(id, 0, 0);

        var k = Math.min(1, MAX_OUTPUT_SIDE / Math.max(w, h), Math.sqrt(MAX_OUTPUT_PIXELS / (w * h)));
        var out = state.enhCanvas;
        if (k >= 1) {
            out.width = w; out.height = h;
            out.getContext('2d', { willReadFrequently: true }).drawImage(src, 0, 0);
        } else {
            drawScaled(src, out, Math.round(w * k), Math.round(h * k));
        }
    }

    // AI 복원 (imageconvert-ai.js): 4배 확대. 진행률을 표시하고, 이미지가 바뀌면 중단한다.
    function runAiJob(job) {
        return new Promise(function(resolve,reject) {
            if (!window.Worker || !window.OffscreenCanvas) { reject(new Error('이 브라우저의 AI 작업 기능이 지원되지 않습니다')); return; }
            var worker;
            try { worker = new Worker('imageconvert-ai-worker.js'); } catch (error) { reject(error); return; }
            enh.aiWorker = worker; enh.rejectAi = reject;
            function cleanup() { worker.terminate(); if (enh.aiWorker === worker) { enh.aiWorker=null; enh.rejectAi=null; } }
            worker.onmessage = function(event) {
                var r = event.data;
                if (r.progress) {
                    $('#ic_enh_busy_text').text('AI 복원 ' + Math.round(r.done/r.total*100) + '% · ' + r.done + '/' + r.total + ' 영역 (' + (r.backend==='webgpu'?'GPU':'CPU') + ')'); return;
                }
                cleanup();
                if (!r.ok) { reject(new Error(r.error)); return; }
                job.note = 'AI 복원 완료 · ' + (r.backend==='webgpu'?'GPU':'CPU') + ' · 원본 대비 ' + (r.width/job.sw).toFixed(2) + '배' + (job.hasAlpha?' · 투명 배경 유지':'');
                resolve({pixels:new Uint8ClampedArray(r.buffer),w:r.width,h:r.height});
            };
            worker.onerror = function(event) { event.preventDefault(); cleanup(); reject(new Error(event.message || 'AI 작업 실행 실패')); };
            var copy=job.pixels.slice();
            worker.postMessage({buffer:copy.buffer,sw:job.sw,sh:job.sh,tw:job.tw,th:job.th,hasAlpha:job.hasAlpha,options:job.options},[copy.buffer]);
        });
    }

    function buildEnhanceJob() {
        var img = state.srcImg, sw = img.naturalWidth, sh = img.naturalHeight;
        var want = 4;
        var scale = Math.min(want,MAX_OUTPUT_SIDE/Math.max(sw,sh),Math.sqrt(MAX_OUTPUT_PIXELS/(sw*sh)));
        var src=document.createElement('canvas'); src.width=sw; src.height=sh;
        var ctx=src.getContext('2d',{willReadFrequently:true}); ctx.drawImage(img,0,0);
        return {sw:sw,sh:sh,tw:Math.max(1,Math.floor(sw*scale)),th:Math.max(1,Math.floor(sh*scale)),
            ai:!!window.wsAiUpscale, hasAlpha:state.hasAlpha,
            note:'기본 선명화 처리 · AI 복원 아님',pixels:ctx.getImageData(0,0,sw,sh).data,
            options:{denoise:1,crisp:0.2,sharpen:0.8,contrast:0}};
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

        cv.hidden = true;
        view.hidden = false;
        var ratio = zoom ? 1 : (window.devicePixelRatio || 1);
        drawScaled(cv, view, Math.round(w*ratio), Math.round(h*ratio));
        if ($('#ic_show_original').is(':checked')) {
            var ctx = view.getContext('2d'), split = view.width * (+$('#ic_compare_split').val()/100);
            ctx.save(); ctx.beginPath(); ctx.rect(0,0,split,view.height); ctx.clip();
            ctx.clearRect(0,0,split,view.height); ctx.imageSmoothingQuality='high';
            ctx.drawImage(state.srcImg,0,0,view.width,view.height); ctx.restore();
            ctx.fillStyle='#2979ff'; ctx.fillRect(split,0,2*ratio,view.height);
            ctx.font=(12*ratio)+'px sans-serif'; ctx.fillStyle='#16345b';
            ctx.fillText('원본',8*ratio,20*ratio); ctx.fillText('복원',Math.min(split+8*ratio,view.width-35*ratio),20*ratio);
        }
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
    $('#ic_show_original, #ic_compare_split').on('input change', layoutPreview);
    $(window).on('resize', function() { if (state.step === 2) layoutPreview(); });

    $('#ic_dl_png_enh').on('click', function() {
        ensureEnhanced().then(function() {
            if (!state.enhCanvas.width) return;
            var mm = +$('#ic_print_width').val();
            var dpi = mm > 0 && Number.isFinite(mm) ? state.enhCanvas.width*25.4/mm : 300;
            var filename = baseName() + '_복원_' + state.enhCanvas.width + 'x' + state.enhCanvas.height + '_' + Math.round(dpi) + 'ppi.png';
            state.enhCanvas.toBlob(async function(blob) {
                try { if (blob) downloadBlob(await window.wsPrintPng(blob,dpi), filename);
                    else throw new Error('이미지 저장 실패');
                } catch (error) { $('#ic_enh_error').text(error.message); }
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
        closeTextEditor();
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

    // ────────────────────────────────────────────────────────
    //  글자 폰트 교체 (imageconvert-text.js)
    // ────────────────────────────────────────────────────────
    var TX = window.wsTextReplace;
    var editor = null;   // { sel, ranked, showAll, replacementId, ocrDone, userTyped }
    var rankTimer = null, selectingText = false, drag = null;
    function setTextSelection(on) {
        selectingText=on;drag=null;
        $('#ic_select_text').attr('aria-pressed',String(on)).text(on?'영역 선택 중 · 취소':'직접 영역 선택');
        $('#ic_result_img').toggleClass('select-region',on);
        if(!on) positionTextMark();
    }
    $('#ic_select_text').on('click',function(){setTextSelection(!selectingText);if(selectingText)textStatus('글자 한 줄을 테두리 안에 넣어 드래그하세요. Esc로 취소할 수 있습니다.');});
    $(document).on('keydown',function(event){if(event.key==='Escape'){setTextSelection(false);positionTextMark();}});
    function pointInImage(event,img,r) {
        var rect=img.getBoundingClientRect();
        return {x:Math.max(0,Math.min(r.width,(event.clientX-rect.left)/rect.width*r.width)),y:Math.max(0,Math.min(r.height,(event.clientY-rect.top)/rect.height*r.height))};
    }
    $('#ic_result_img').on('dragstart',function(event){event.preventDefault();});
    $('#ic_result_img').on('pointerdown',function(event){
        var r=currentResult();if(!selectingText||!r||!$('#ic_trace_busy').prop('hidden'))return;
        var e=event.originalEvent;if(e.button!==0)return;event.preventDefault();
        drag={start:pointInImage(e,this,r),result:r,pointer:e.pointerId};this.setPointerCapture(e.pointerId);
    }).on('pointermove',function(event){
        if(!drag)return;var p=pointInImage(event.originalEvent,this,drag.result),a=drag.start;
        drag.box={x:Math.min(a.x,p.x),y:Math.min(a.y,p.y),w:Math.abs(a.x-p.x),h:Math.abs(a.y-p.y)};
        var k=this.clientWidth/drag.result.width,b=drag.box;
        $('#ic_text_mark').css({left:this.offsetLeft+b.x*k,top:this.offsetTop+b.y*k,width:b.w*k,height:b.h*k}).prop('hidden',false);
    }).on('pointerup',function(event){
        if(!drag)return;var selected=drag;drag=null;
        if(this.hasPointerCapture(selected.pointer))this.releasePointerCapture(selected.pointer);
        if(!selected.box||selected.box.w<3||selected.box.h<3){textStatus('글자 한 줄을 드래그해서 선택하세요.',true);return;}
        var r=selected.result,c=document.createElement('canvas');c.width=r.width;c.height=r.height;
        c.getContext('2d').drawImage(this,0,0,r.width,r.height);
        var sel=TX.selectRegion(c.getContext('2d').getImageData(0,0,r.width,r.height),selected.box);
        if(sel.error){textStatus(sel.error,true);return;}
        setTextSelection(false);openTextEditor(r,0,0,sel);
    }).on('pointercancel',function(){drag=null;positionTextMark();});

    $('#ic_result_img').on('click', function(e) {
        var r = currentResult();
        if (selectingText || !r || !r.index || !$('#ic_trace_busy').prop('hidden')) return;
        var rect = this.getBoundingClientRect();
        var x = Math.floor((e.clientX - rect.left) / rect.width * r.width);
        var y = Math.floor((e.clientY - rect.top) / rect.height * r.height);
        if (x < 0 || y < 0 || x >= r.width || y >= r.height) return;
        textStatus('글자를 찾는 중…');
        if (editor) return;
        setTimeout(function() { if(currentResult()===r)openTextEditor(r, x, y); }, 20);
    });

    function textStatus(msg, isError) {
        $('#ic_text_status').text(msg || '').toggleClass('err', !!isError);
    }

    function openTextEditor(r, x, y, manual) {
        var sel = manual || TX.findLine(r, x, y);
        if (sel.error) { textStatus(sel.error, true); closeTextEditor(true); return; }
        editor = { sel: sel, ranked: null, showAll: false, replacementId: null, userTyped: false };
        textStatus('');

        $('#ic_text_fill').val(sel.colors.fill);
        $('#ic_text_outline').val(sel.colors.outline || '#000000');
        $('#ic_text_outline_on').prop('checked', !!sel.colors.outline);
        $('#ic_text_bg').val(sel.colors.bg);
        $('#ic_text_input').val('');
        $('#ic_text_cover').prop('checked',false);
        $('#ic_fonts_retry').prop('hidden',true);
        $('#ic_text_ocr').text('글자 내용을 자동으로 읽는 중… (처음 한 번은 조금 걸려요)');
        $('#ic_font_grid').empty();
        $('#ic_font_more').prop('hidden', true);
        $('#ic_text_editor').prop('hidden', false);
        drawOriginalCrop(sel);
        positionTextMark();

        var current = editor;
        TX.recognize(sel).then(function(out) {
            if (editor !== current) return;
            if (!current.userTyped && out.text) {
                $('#ic_text_input').val(out.text);
                scheduleRank(0);
            }
            $('#ic_text_ocr').text(out.text
                ? '자동으로 읽은 글자예요. 틀린 부분은 고쳐 주세요.'
                : '글자를 읽지 못했어요. 선택한 글자를 직접 입력해 주세요.');
        }).catch(function() {
            if (editor !== current) return;
            $('#ic_text_ocr').text('자동 인식을 못 했어요. 선택한 글자를 직접 입력해 주세요.');
        });
        $('#ic_text_input').trigger('focus');
    }

    function closeTextEditor(keepStatus) {
        editor = null;clearTimeout(rankTimer);
        $('#ic_text_editor, #ic_text_mark').prop('hidden', true);
        if (!keepStatus) textStatus('');
    }

    function drawOriginalCrop(sel) {
        var img = document.getElementById('ic_result_img'), r = currentResult();
        var canvas = document.getElementById('ic_text_orig'), ctx = canvas.getContext('2d');
        var k = img.naturalWidth / r.width;
        var s = Math.min(canvas.width / sel.crop.w, canvas.height / sel.crop.h);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var dw = sel.crop.w * s, dh = sel.crop.h * s;
        ctx.drawImage(img, sel.crop.x * k, sel.crop.y * k, sel.crop.w * k, sel.crop.h * k,
            (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
    }

    function positionTextMark() {
        var $mark = $('#ic_text_mark'), r = currentResult();
        if (!editor || !r) { $mark.prop('hidden', true); return; }
        var img = document.getElementById('ic_result_img');
        var k = img.clientWidth / r.width, c = editor.sel.crop;
        $mark.css({
            left: img.offsetLeft + c.x * k, top: img.offsetTop + c.y * k,
            width: c.w * k, height: c.h * k
        }).prop('hidden', false);
    }
    $(window).on('resize', positionTextMark);
    $('#ic_result_zoom').on('change', function() { setTimeout(positionTextMark, 50); });

    function editorColors() {
        return {
            fill: $('#ic_text_fill').val(),
            outline: $('#ic_text_outline_on').is(':checked') ? $('#ic_text_outline').val() : null,
            bg: $('#ic_text_bg').val(),
            coverAll: $('#ic_text_cover').is(':checked')
        };
    }

    $('#ic_text_input').on('input', function() {
        if (!editor) return;
        editor.userTyped = true;
        scheduleRank(400);
    });
    $('#ic_text_fill, #ic_text_outline, #ic_text_bg, #ic_text_outline_on, #ic_text_cover').on('input change', function() {
        if (editor) editor.applyVersion=(editor.applyVersion||0)+1;
        if (editor && editor.ranked) renderFontGrid();
    });
    $('#ic_font_more').on('click', function() {
        if (!editor) return;
        editor.showAll = !editor.showAll;
        renderFontGrid();
    });
    $('#ic_text_close').on('click', closeTextEditor);

    $('#ic_fonts_retry').on('click',function(){scheduleRank(0);});
    function scheduleRank(delay) {
        if(editor){editor.rankVersion=(editor.rankVersion||0)+1;editor.applyVersion=(editor.applyVersion||0)+1;editor.ranked=null;}
        $('#ic_font_grid').empty();$('#ic_font_more').prop('hidden',true);
        clearTimeout(rankTimer);
        rankTimer = setTimeout(rankCandidates, delay);
    }

    function rankCandidates() {
        if (!editor) return;
        var text = $.trim($('#ic_text_input').val()), current = editor;
        if (!text) { $('#ic_font_grid').empty(); $('#ic_font_more').prop('hidden', true); return; }
        $('#ic_font_grid').html('<p class="ic-hint">비슷한 폰트를 찾는 중…</p>');
        var version=current.rankVersion;
        $('#ic_fonts_retry').prop('hidden',true);
        TX.loadFonts(text).then(function(available) {
            if (editor !== current || current.rankVersion!==version) return;
            current.text = text;
            current.ranked = TX.rankFonts(current.sel, text, available);
            renderFontGrid();
        }).catch(function(error){
            if(editor!==current||current.rankVersion!==version)return;
            $('#ic_font_grid').empty();$('#ic_fonts_retry').prop('hidden',false);textStatus(error.message,true);
        });
    }

    function renderFontGrid() {
        if(!editor || !editor.ranked)return;
        var $grid = $('#ic_font_grid').empty(), colors = editorColors();
        var list = editor.showAll ? editor.ranked : editor.ranked.slice(0, TX.TOP_COUNT);
        var applied = editor.replacementId && state.replacements.filter(function(rp) { return rp.id === editor.replacementId; })[0];
        list.forEach(function(item, i) {
            var aspect = editor.sel.crop.h / editor.sel.crop.w;
            var canvas = document.createElement('canvas');
            canvas.width = 260;
            canvas.height = Math.max(40, Math.min(200, Math.round(260 * aspect)));
            TX.renderPreview(canvas, editor.sel, item.font, editor.text, colors);
            var $card = $('<button type="button" class="ic-font-card">')
                .toggleClass('on', !!applied && applied.font === item.font)
                .append(canvas, $('<span>').append($('<b>').text(item.font.name), $('<em>').text(i < 3 && !editor.showAll ? '추천' : Math.round(item.score * 100) + '%')))
                .on('click', function() { applyFont(item.font, $card); });
            $grid.append($card);
        });
        $('#ic_font_more').prop('hidden', false).text(editor.showAll ? '추천 폰트만 보기' : '폰트 더 보기 (' + editor.ranked.length + '개)');
    }

    function applyFont(font, $card) {
        var current = editor;
        if(!current || $.trim($('#ic_text_input').val())!==current.text)return;
        var colors = editorColors(), text = current.text, version=current.applyVersion=(current.applyVersion||0)+1;
        $('.ic-font-card').prop('disabled', true);
        textStatus('선택한 폰트로 바꾸는 중…');
        TX.buildVector(current.sel, font, text, colors).then(function(vec) {
            if (editor !== current || current.applyVersion!==version) return;
            $('.ic-font-card').prop('disabled', false);
            var rp = current.replacementId && state.replacements.filter(function(x) { return x.id === current.replacementId; })[0];
            if (!rp) {
                rp = { id: 'rp' + Date.now() };
                state.replacements.push(rp);
                current.replacementId = rp.id;
            }
            rp.width=currentResult().width;rp.height=currentResult().height;
            rp.text = text; rp.font = font; rp.colors = colors; rp.vec = vec;
            $('.ic-font-card').removeClass('on');
            $card.addClass('on');
            textStatus('"' + text + '" 글자를 ' + font.name + ' 폰트로 바꿨어요.');
            renderTextList();
            var r = currentResult();
            if (r) showResult(r);
        }).catch(function(err) {
            if(editor!==current || current.applyVersion!==version)return;
            $('.ic-font-card').prop('disabled', false);
            textStatus('폰트로 바꾸지 못했어요: ' + (err && err.message || err), true);
        });
    }

    function renderTextList() {
        var $list = $('#ic_text_list').empty();
        state.replacements.forEach(function(rp) {
            $list.append($('<li>').append(
                $('<span>').text(rp.text + ' · ' + rp.font.name),
                $('<button type="button">').text('되돌리기').on('click', function() {
                    state.replacements = state.replacements.filter(function(x) { return x.id !== rp.id; });
                    if (editor && editor.replacementId === rp.id) editor.replacementId = null;
                    renderTextList();
                    $('.ic-font-card').removeClass('on');
                    var r = currentResult();
                    if (r) showResult(r);
                })
            ));
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
        $('#ic_result_img').removeClass('pickable');
        $('#ic_text_mark').prop('hidden', true);
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
            hybrid: !!preset.hybrid,
            clean: state.enhAi // AI 복원 이미지는 잡티가 없으므로 정리 필터를 약하게
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

        if(mode==='raster') {
            // Keep the image intact; only replacement letters become vector paths.
            ctx.clearRect(0,0,w,h);ctx.drawImage(cv,0,0,w,h);
            done({width:w,height:h,body:'',paths:0,overlay:c.toDataURL('image/png')});return;
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

    // 원본 유지 모드: 사진 영역에만 보이는(마스크를 알파로 쓴) 선명하게 키운 원본 이미지를 PNG 로 만든다.
    // AI 복원 결과가 있으면 그대로 쓰고, 기본 방식이면 사진용 설정으로 다시 키운다
    // (글자 경계 선명화는 사진에 자글자글한 흰 점을 만든다).
    function buildPhotoOverlay(result, w, h) {
        var img = state.srcImg, sw = img.naturalWidth, sh = img.naturalHeight, ready;
        if (state.enhAi) {
            var scaled = document.createElement('canvas');
            drawScaled(state.enhCanvas, scaled, w, h);
            ready = Promise.resolve(scaled.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data);
        } else {
            var src = document.createElement('canvas');
            src.width = sw; src.height = sh;
            var sctx = src.getContext('2d', { willReadFrequently: true });
            sctx.drawImage(img, 0, 0);
            ready = runEnhanceJob({ sw: sw, sh: sh, tw: w, th: h, pixels: sctx.getImageData(0, 0, sw, sh).data, options: PHOTO_ENHANCE_OPTIONS });
        }
        return ready.then(function(pixels) {
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
        var texts = state.replacements.map(function(rp) {
            var sx=rp.width?r.width/rp.width:1,sy=rp.height?r.height/rp.height:1;
            return '<g transform="scale('+sx+' '+sy+')">'+window.wsTextReplace.toSvg(rp.vec, rp.colors, r.mode === 'mono')+'</g>';
        }).join('');
        return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" ' + size +
            ' viewBox="0 0 ' + r.width + ' ' + r.height + '">' + r.body + overlay + texts + '</svg>';
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
        $('#ic_st_paths').text((svg.match(/<path\b/g) || []).length.toLocaleString() + '개');
        $('#ic_st_bytes').text(formatBytes(new Blob([svg]).size));
        $('#ic_st_time').text((r.ms / 1000).toFixed(1) + '초');
        $('#ic_stats').prop('hidden', false);
        $('#ic_dl_svg, #ic_dl_png').prop('disabled', false);
        $('#ic_dl_svg').text(r.overlay ? 'SVG용 개별 도형으로 변환' : 'SVG 개별 오브젝트 저장');
        $('#ic_svg_notice').text(r.overlay
            ? '현재 결과에는 사진이 포함되어 있습니다. SVG용 도형으로 변환하면 사진도 벡터로 바뀝니다. 변환 결과를 확인한 뒤 저장하세요.'
            : '각 도형을 개별 오브젝트로 저장합니다. 글자 안쪽의 빈 공간은 함께 유지합니다.');
        $('#ic_result_img').addClass('pickable');
        positionTextMark();
        if(r.mode==='raster'&&!editor)setTextSelection(true);
        if (r.paths === 0 && r.mode !== 'raster') $('#ic_trace_error').text('변환할 도형을 찾지 못했습니다. 다른 변환 방식을 선택해 보세요.');
    }

    function clearResults() {
        stopJob();
        state.results = {};
        state.resultSvg = null;
        state.replacements = [];
        closeTextEditor();
        renderTextList();
        if (state.resultUrl) { URL.revokeObjectURL(state.resultUrl); state.resultUrl = null; }
        $('#ic_result_img').removeAttr('src');
        $('#ic_stats, #ic_retry').prop('hidden', true);
        $('#ic_dl_svg, #ic_dl_png').prop('disabled', true);
        $('#ic_trace_error, #ic_svg_notice').text('');
    }

    function currentResult() {
        return state.resultSvg ? state.results[state.mode] : null;
    }

    $('#ic_dl_svg').on('click', async function() {
        var r=currentResult();if(!r)return;
        if(r.overlay){
            closeTextEditor();setTextSelection(false);
            state.mode='vector';$('#ic_mode button').removeClass('on').filter('[data-v="vector"]').addClass('on');
            $('#ic_mode_hint').text(MODES.vector.hint);convertCurrent();return;
        }
        var snapshot=state.resultSvg, filename=baseName()+'_개별오브젝트.svg';
        $('#ic_dl_svg').prop('disabled',true);$('#ic_svg_notice').text('개별 오브젝트를 준비하는 중…');
        try{
            var result=await window.wsSvgObjects.export(snapshot,function(count){
                if(state.resultSvg===snapshot)$('#ic_svg_notice').text(count.toLocaleString()+'개 오브젝트 준비 중…');
            });
            if(state.resultSvg!==snapshot)return;
            downloadBlob(new Blob([result.svg],{type:'image/svg+xml'}),filename);
            $('#ic_svg_notice').text(result.objects.toLocaleString()+'개 개별 오브젝트 저장 완료 · 편집 프로그램에서 파일을 직접 열어 편집하세요.');
            $('#ic_st_paths').text(result.objects.toLocaleString()+'개');
        }catch(error){if(state.resultSvg===snapshot)$('#ic_svg_notice').text('SVG 저장 실패: '+error.message);}
        finally{if(state.resultSvg===snapshot)$('#ic_dl_svg').prop('disabled',false);}
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
