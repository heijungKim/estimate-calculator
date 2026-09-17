importScripts('imageconvert-enhance.js', 'imageconvert-ai.js');
self.onmessage = async function(event) {
    var job = event.data;
    try {
        var result = await self.wsAiUpscale.run(new Uint8ClampedArray(job.buffer), job.sw, job.sh, {
            width:job.tw, height:job.th, hasAlpha:job.hasAlpha, options:job.options,
            onProgress:function(done,total,backend) { self.postMessage({progress:true,done:done,total:total,backend:backend}); }
        });
        self.postMessage({ok:true,buffer:result.pixels.buffer,width:result.width,height:result.height,backend:result.backend},[result.pixels.buffer]);
    } catch (error) { self.postMessage({ok:false,error:error.message}); }
};
