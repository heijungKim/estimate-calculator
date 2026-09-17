const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('image conversion scripts parse and local assets exist',()=>{
    for(const name of fs.readdirSync(root).filter(n=>/^imageconvert.*\.js$/.test(n))) new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
    const html=fs.readFileSync(path.join(root,'imageconvert.html'),'utf8');
    for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) if(!/^https?:/.test(match[1])) assert.ok(fs.existsSync(path.join(root,match[1])),match[1]);
    assert.ok(fs.statSync(path.join(root,'lib/realesrgan/realesr-general-x4v3.onnx')).size>4000000);
});
test('print PNG stores physical resolution without changing image data',async()=>{
    const ctx={Blob,Uint8Array,DataView,Number,self:{}};
    vm.runInNewContext(fs.readFileSync(path.join(root,'imageconvert-print.js'),'utf8'),ctx);
    const original=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
    let blob=await ctx.self.wsPrintPng(new Blob([original]),300);
    blob=await ctx.self.wsPrintPng(blob,150);
    const data=Buffer.from(await blob.arrayBuffer());let physical=0,parts=[data.subarray(0,8)];
    for(let p=8;p<data.length;){let len=data.readUInt32BE(p),type=data.toString('ascii',p+4,p+8);
        if(type==='pHYs'){physical++;assert.equal(data.readUInt32BE(p+8),5906);assert.equal(data.readUInt32BE(p+12),5906);assert.equal(data[p+16],1);}
        else parts.push(data.subarray(p,p+len+12));p+=len+12;
    }
    assert.equal(physical,1);assert.deepEqual(Buffer.concat(parts),original);
    await assert.rejects(ctx.self.wsPrintPng(blob,0));
});
test('basic restoration preserves alpha and finite channel bounds',()=>{
    const ctx={self:{}}; vm.runInNewContext(fs.readFileSync(path.join(root,'imageconvert-enhance.js'),'utf8'),ctx);
    const px=new Uint8ClampedArray(16*16*4);
    for(let y=4;y<12;y++)for(let x=4;x<12;x++)px.set([80,140,210,255],(y*16+x)*4);
    const out=ctx.self.wsEnhanceImage(px,16,16,32,32,{denoise:0,crisp:0,sharpen:0.4,contrast:0});
    assert.equal(out.length,32*32*4);assert.equal(out[3],0);assert.equal(out[(16*32+16)*4+3],255);
});

test('AI refuses oversized output before loading a model',async()=>{
    const ctx={self:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'imageconvert-ai.js'),'utf8'),ctx);
    await assert.rejects(ctx.self.wsAiUpscale.run(new Uint8ClampedArray(4),1,1,{width:8001,height:1}));
    await assert.rejects(ctx.self.wsAiUpscale.run(new Uint8ClampedArray(4),1,1,{width:5000,height:5000}));
    await assert.rejects(ctx.self.wsAiUpscale.run(new Uint8ClampedArray(4),1,1,{width:1.5,height:1}));
});

test('manual text selection works without vector segmentation and rejects empty regions',()=>{
    const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'imageconvert-text.js'),'utf8'),ctx);
    const image={width:60,height:24,data:new Uint8ClampedArray(60*24*4)};
    for(let i=0;i<image.data.length;i+=4)image.data.set([250,250,250,255],i);
    for(let y=7;y<17;y++)for(let x=12;x<45;x++)if(x%8<3)image.data.set([20,40,90,255],(y*60+x)*4);
    const sel=ctx.window.wsTextReplace.selectRegion(image,{x:5,y:3,w:50,h:18});
    assert.equal(sel.error,undefined);assert.equal(sel.crop.x,5);assert.equal(sel.crop.w,50);
    assert.ok(sel.size.w>20);assert.equal(sel.size.h,10);assert.equal(sel.colors.fill,'#14285a');
    assert.ok(ctx.window.wsTextReplace.selectRegion(image,{x:0,y:0,w:3,h:3}).error);
    assert.ok(ctx.window.wsTextReplace.selectRegion(image,{x:200,y:0,w:10,h:10}).error);
});
