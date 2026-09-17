// Small real conversion previews, independent of the full-resolution conversion worker.
(function(root){
    'use strict';
    var CHOICES=[
        {mode:'raster',title:'비슷한 폰트로 교체',scope:'선택한 글자만',description:'글자 한 줄을 선택하면 29가지 폰트 중 모양이 비슷한 후보를 추천합니다.',kinds:['text'],action:'글자 선택 · 폰트 추천'},
        {mode:'hybrid',title:'사진과 글자를 함께 정리',scope:'전체 이미지',description:'사진 질감은 남기고 글자·도형의 경계를 정리합니다. 사진과 문구가 섞인 간판에 적합합니다.',kinds:['text','photo'],action:'혼합 방식으로 변환'},
        {mode:'vector',title:'정밀 벡터로 변환',scope:'전체 이미지',description:'로고·도형을 확대 가능한 윤곽으로 바꿉니다. 세부 색과 모양은 달라질 수 있습니다.',kinds:['logo','text'],action:'정밀 벡터로 변환'},
        {mode:'illust',title:'일러스트로 단순화',scope:'전체 이미지',description:'뭉개진 질감과 잡티를 단순한 색면으로 바꿉니다. 원본의 사진 느낌은 줄어듭니다.',kinds:['photo','logo'],action:'일러스트로 변환'},
        {mode:'mono',title:'흑백 윤곽으로 정리',scope:'전체 이미지',description:'색을 없애 형태를 또렷하게 정리합니다. 단색 로고·커팅용 도안에 적합합니다.',kinds:['logo'],action:'흑백으로 변환'}
    ];
    function Suggestions(container,onSelect){this.container=container;this.onSelect=onSelect;this.urls=[];this.generation=0;this.kind='all';}
    Suggestions.prototype.reset=function(){
        this.generation++;clearTimeout(this.pendingTimer);if(this.worker){this.worker.terminate();this.worker=null;}
        this.urls.forEach(function(url){URL.revokeObjectURL(url);});this.urls=[];this.container.replaceChildren();
    };
    Suggestions.prototype.filter=function(kind){
        this.kind=kind;
        var self=this;
        CHOICES.forEach(function(choice){var card=self.container.querySelector('[data-choice="'+choice.mode+'"]');if(card)card.hidden=kind!=='all'&&!choice.kinds.includes(kind);});
    };
    Suggestions.prototype.show=function(source,presets,analyzeMono){
        this.reset();var self=this,generation=this.generation;
        var sw=source.naturalWidth||source.width,sh=source.naturalHeight||source.height;
        var scale=Math.min(1,256/Math.max(sw,sh));
        var canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(sw*scale));canvas.height=Math.max(1,Math.round(sh*scale));
        var ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.imageSmoothingQuality='high';ctx.drawImage(source,0,0,canvas.width,canvas.height);
        var data=ctx.getImageData(0,0,canvas.width,canvas.height),original=canvas.toDataURL('image/png');
        CHOICES.forEach(function(choice){
            var card=document.createElement('article');card.className='ic-suggestion-card';card.dataset.choice=choice.mode;
            var img=document.createElement('img');img.alt=choice.title+' 비교용 미리보기';img.src=original;
            var status=document.createElement('span');status.className='ic-suggestion-status';status.textContent=choice.mode==='raster'?'글자를 선택하면 폰트별 미리보기 제공':'변환 미리보기 준비 중…';
            var scope=document.createElement('span');scope.className='ic-suggestion-scope';scope.textContent=choice.scope;
            var title=document.createElement('h4');title.textContent=choice.title;
            var desc=document.createElement('p');desc.textContent=choice.description;
            var button=document.createElement('button');button.type='button';button.className='ic-btn ghost block';button.textContent=choice.action;
            button.addEventListener('click',function(){self.onSelect(choice.mode);});
            card.append(img,status,scope,title,desc,button);self.container.append(card);
        });
        this.filter(this.kind);
        var mono=analyzeMono?analyzeMono(data):{threshold:128,invert:false};
        var queue=CHOICES.filter(function(c){return c.mode!=='raster';}),index=0;
        function next(){
            if(generation!==self.generation||index>=queue.length)return;
            var choice=queue[index++],card=self.container.querySelector('[data-choice="'+choice.mode+'"]'),status=card.querySelector('.ic-suggestion-status');
            var worker;
            try{worker=new Worker('imageconvert-worker.js');}catch(error){status.textContent='선택 후 전체 변환 결과를 확인하세요';next();return;}
            self.worker=worker;
            var settled=false,timeout=self.pendingTimer=setTimeout(function(){finish(null);},30000);
            function finish(result){
                if(settled)return;settled=true;
                clearTimeout(timeout);worker.terminate();if(self.worker===worker)self.worker=null;
                if(generation!==self.generation)return;
                if(result){
                    var overlay='';
                    if(result.mask){
                        var c=document.createElement('canvas');c.width=data.width;c.height=data.height;
                        var pixels=new Uint8ClampedArray(data.data);for(var i=0;i<result.mask.length;i++)pixels[i*4+3]=result.mask[i];
                        c.getContext('2d').putImageData(new ImageData(pixels,c.width,c.height),0,0);
                        overlay='<image width="'+c.width+'" height="'+c.height+'" href="'+c.toDataURL('image/png')+'"/>';
                    }
                    var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+data.width+'" height="'+data.height+'" viewBox="0 0 '+data.width+' '+data.height+'">'+result.body+overlay+'</svg>';
                    var url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));self.urls.push(url);card.querySelector('img').src=url;status.textContent='축소 이미지 변환 미리보기';
                }else status.textContent='미리보기 생성 실패 · 선택 후 다시 변환';
                next();
            }
            worker.onmessage=function(event){finish(event.data.ok?event.data.result:null);};
            worker.onerror=function(event){event.preventDefault();finish(null);};
            var preset=presets[choice.mode],pixels=data.data.slice();
            worker.postMessage({id:index,width:data.width,height:data.height,buffer:pixels.buffer,params:{mode:choice.mode,
                maxColors:preset.maxColors,mergeDistance:preset.mergeDistance,mergeDeltaE:preset.mergeDeltaE,
                hybrid:!!preset.hybrid,removeBg:choice.mode==='mono',threshold:mono.threshold,invert:choice.mode==='mono'&&mono.invert,srcScale:1,clean:true}},[pixels.buffer]);
        }
        next();
    };
    Suggestions.CHOICES=CHOICES;root.wsImageSuggestions=Suggestions;
})(window);
