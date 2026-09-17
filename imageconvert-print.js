// Write a PNG pHYs chunk so print software can read the selected resolution.
(function(root) {
    'use strict';
    function crc32(bytes) {
        var crc = 0xffffffff;
        for (var b of bytes) { crc ^= b; for (var k=0;k<8;k++) crc=(crc>>>1)^((crc&1)?0xedb88320:0); }
        return (crc^0xffffffff)>>>0;
    }
    root.wsPrintPng = async function(blob,dpi) {
        if (!Number.isFinite(dpi) || dpi <= 0 || dpi > 1000000) throw new Error('Invalid resolution');
        var src=new Uint8Array(await blob.arrayBuffer()), parts=[src.slice(0,8)];
        var chunk=new Uint8Array(21), view=new DataView(chunk.buffer);
        view.setUint32(0,9); chunk.set([112,72,89,115],4);
        view.setUint32(8,Math.round(dpi/0.0254)); view.setUint32(12,Math.round(dpi/0.0254)); chunk[16]=1;
        view.setUint32(17,crc32(chunk.slice(4,17)));
        for (var offset=8;offset<src.length;) {
            var size=new DataView(src.buffer,src.byteOffset+offset,4).getUint32(0)+12;
            var type=String.fromCharCode.apply(null,src.slice(offset+4,offset+8));
            if (type!=='pHYs') parts.push(src.slice(offset,offset+size));
            if (type==='IHDR') parts.push(chunk);
            offset+=size;
        }
        return new Blob(parts,{type:'image/png'});
    };
})(typeof self !== 'undefined' ? self : window);
