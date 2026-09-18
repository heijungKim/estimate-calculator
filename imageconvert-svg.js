// Export only independent vector objects. Keep overlapping contours together so holes survive.
(function(root){
    'use strict';
    var NS='http://www.w3.org/2000/svg';
    var PAINT=['fill','fill-rule','fill-opacity','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset','stroke-opacity','vector-effect','paint-order'];
    function separateContours(path,stage,paint){
        var d=path.getAttribute('d')||'';
        // A relative moveto may depend on the previous contour. Leave it intact.
        if(!d.trim())return [];
        if(/m/.test(d))return [d];
        var parts=d.match(/M[^M]*/g)||[d];if(parts.length<2)return [d];
        var padding=Math.max(1,(parseFloat(path.getAttribute('stroke-width')||paint['stroke-width'])||0)*2);
        var boxes=parts.map(function(part){var node=document.createElementNS(NS,'path');node.setAttribute('d',part);stage.appendChild(node);var b=node.getBBox();node.remove();return {x:b.x-padding,y:b.y-padding,right:b.x+b.width+padding,bottom:b.y+b.height+padding};});
        var parents=parts.map(function(_,i){return i;});
        function find(i){while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i];}return i;}
        // Conservative intersection: nested counters, touching and overlapping contours stay compound.
        for(var i=0;i<boxes.length;i++)for(var j=0;j<i;j++){
            var a=boxes[i],b=boxes[j];
            if(a.x<=b.right&&b.x<=a.right&&a.y<=b.bottom&&b.y<=a.bottom)parents[find(i)]=find(j);
        }
        var groups=new Map();parts.forEach(function(part,i){var key=find(i);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(part);});
        return Array.from(groups.values(),function(group){return group.join(' ');});
    }
    async function exportObjects(source,onProgress,options){
        options=options||{};
        var parsed=new DOMParser().parseFromString(source,'image/svg+xml');
        if(parsed.querySelector('parsererror'))throw new Error('SVG 내용을 읽을 수 없습니다.');
        var original=parsed.documentElement;
        if(original.localName!=='svg')throw new Error('SVG 파일이 아닙니다.');
        if(original.querySelector('foreignObject')||(!options.allowImages&&original.querySelector('image')))throw new Error('사진이 포함된 SVG는 통합 저장으로 내보내세요.');
        var out=document.createElementNS(NS,'svg');out.setAttribute('version','1.1');
        ['width','height','viewBox'].forEach(function(key){if(original.hasAttribute(key))out.setAttribute(key,original.getAttribute(key));});
        var stage=document.createElementNS(NS,'svg');
        stage.setAttribute('width','1');stage.setAttribute('height','1');stage.style.cssText='position:absolute;left:-10000px;top:0;opacity:0;pointer-events:none';document.body.appendChild(stage);
        var count=0,visited=0,imageCount=0;
        async function visit(node,paint,transforms){
            var tag=node.localName;if(['title','desc','metadata'].includes(tag))return;
            if(!['svg','g','path','rect','circle','ellipse','polygon','polyline','line','image'].includes(tag))throw new Error('지원하지 않는 SVG 요소: '+tag);
            // Generated SVG uses presentation attributes and transforms; do not flatten effects incorrectly.
            if(['style','filter','mask','clip-path'].some(function(a){return node.hasAttribute(a);})||
                ((tag==='g'||tag==='svg')&&node.hasAttribute('opacity')&&node.getAttribute('opacity')!=='1'))throw new Error('복합 효과가 있는 SVG는 먼저 도형으로 다시 변환하세요.');
            var nextPaint=Object.assign({},paint);PAINT.forEach(function(key){if(node.hasAttribute(key))nextPaint[key]=node.getAttribute(key);});
            var nextTransforms=transforms.slice();if(node.hasAttribute('transform'))nextTransforms.push(node.getAttribute('transform'));
            if(tag==='g'||tag==='svg'){
                for(var child of node.children)await visit(child,nextPaint,nextTransforms);return;
            }
            if(tag==='image'){var href=node.getAttribute('href')||node.getAttributeNS('http://www.w3.org/1999/xlink','href')||'';if(!options.allowImages||!/^data:image\/png;base64,/.test(href))throw new Error('내장 PNG 사진만 저장할 수 있습니다.');}
            var parts=tag==='path'?separateContours(node,stage,nextPaint):[null];
            // Partial opacity can change when one object is split into multiple objects.
            if(['opacity','fill-opacity','stroke-opacity'].some(function(key){var value=node.getAttribute(key)||nextPaint[key];return value!=null&&Number(value)<1;}))parts=tag==='path'?[node.getAttribute('d')]:[null];
            for(var d of parts){
                var copy=document.createElementNS(NS,tag);
                for(var attr of node.attributes){if(!['id','transform','xmlns'].includes(attr.name)){if(attr.namespaceURI)copy.setAttributeNS(attr.namespaceURI,attr.name,attr.value);else copy.setAttribute(attr.name,attr.value);}}
                Object.keys(nextPaint).forEach(function(key){copy.setAttribute(key,nextPaint[key]);});
                if(nextTransforms.length)copy.setAttribute('transform',nextTransforms.join(' '));
                if(d!==null)copy.setAttribute('d',d);
                copy.setAttribute('id',(tag==='image'?'photo-':'object-')+String(++count).padStart(5,'0'));
                copy.setAttribute('data-object-type',tag==='image'?'photo':'vector');if(tag==='image')imageCount++;out.appendChild(copy);
            }
            if(++visited%100===0){if(onProgress)onProgress(count);await new Promise(function(resolve){setTimeout(resolve,0);});}
        }
        try{await visit(original,{},[]);}finally{stage.remove();}
        if(!count)throw new Error('저장할 벡터 도형이 없습니다.');
        return {svg:'<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(out),objects:count,imageObjects:imageCount,vectorObjects:count-imageCount};
    }
    root.wsSvgObjects={export:exportObjects};
})(window);
