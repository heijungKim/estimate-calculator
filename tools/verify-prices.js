// 단가 데이터 정합성 검사
//   실행: node tools/verify-prices.js   (통과 0, 실패 1로 종료)
//
// 확인 항목
//   1) index.js / price.js 의 DEFAULT_PRICES 가 완전히 동일한가
//      → 두 곳에 따로 정의돼 있어 한쪽만 고치면 계산기와 단가표가 어긋난다
//   2) price.html 의 모든 입력 필드가 DEFAULT_PRICES 에 있는가
//      → 없으면 저장·불러오기·자동계산에서 통째로 누락된다
//   3) 한글/흘림체 파생 칸마다 원본 칸이 존재하는가
//   4) 캐시 무효화용 ?v= 번호가 최신인가
const fs=require('fs');
const path=require('path');
const DIR=path.join(__dirname,'..')+path.sep;
let fail=0;
const ok=(c,m)=>{ console.log((c?'  PASS  ':'  FAIL  ')+m); if(!c)fail++; };

function defaults(file){
  const t=fs.readFileSync(DIR+file,'utf8');
  const s=t.indexOf('var DEFAULT_PRICES'), o=t.indexOf('{',s);
  let d=0,i=o; for(;i<t.length;i++){ if(t[i]==='{')d++; else if(t[i]==='}'){d--; if(!d)break;} }
  return eval('('+t.slice(o,i+1)+')');
}
const A=defaults('index.js'), B=defaults('price.js');
const html=fs.readFileSync(DIR+'price.html','utf8');
const fields=[...new Set([...html.matchAll(/id="p_([A-Za-z0-9_]+)"/g)].map(m=>m[1]))];

console.log('[1] DEFAULT_PRICES 동기화');
ok(Object.keys(A).length===Object.keys(B).length, `키 개수 일치 (index=${Object.keys(A).length}, price=${Object.keys(B).length})`);
ok(Object.keys(B).every(k=>k in A), 'price.js 키가 모두 index.js에 존재');
ok(Object.keys(A).every(k=>k in B), 'index.js 키가 모두 price.js에 존재');
ok(Object.keys(A).filter(k=>k in B && A[k]!==B[k]).length===0, '공통 키의 값 일치');

console.log('\n[2] 화면 필드 ↔ 기본단가');
const orphan=fields.filter(f=>!(f in A));
ok(orphan.length===0, `기본단가에 없는 입력 필드 없음 ${orphan.length?'→ '+orphan.slice(0,5):''}`);

console.log('\n[3] 채널 파생 관계 커버리지');
const parts=k=>{const m=k.match(/^ch_(.+)_(eng|kor|got)_([a-z0-9]+)$/);return m?{mat:m[1],type:m[2],size:m[3]}:null;};
const chKeys=Object.keys(A).filter(k=>parts(k));
const derived=chKeys.filter(k=>parts(k).type!=='eng');
const uncovered=derived.filter(k=>{
  const p=parts(k);
  const from=p.type==='kor'?'eng':(('ch_'+p.mat+'_kor_'+p.size) in A ? 'kor':'eng');
  return !(('ch_'+p.mat+'_'+from+'_'+p.size) in A);
});
ok(uncovered.length===0, `파생 칸 ${derived.length}개 모두 원본 존재 ${uncovered.length?'→ '+uncovered.slice(0,5):''}`);
const mats=[...new Set(chKeys.map(k=>parts(k).mat))].sort();
console.log('     재질:', mats.join(', '));

console.log('\n[4] 캐시버전 표기');
['price.html','index.html'].forEach(f=>{
  const t=fs.readFileSync(DIR+f,'utf8');
  const m=[...t.matchAll(/src="(price|index)\.js\?v=(\d+)"/g)];
  ok(m.length>0 && m.every(x=>+x[2]>=9), `${f} : ${m.map(x=>x[1]+'.js?v='+x[2]).join(', ')}`);
});
console.log(fail?`\n실패 ${fail}건`:'\n전체 통과');
process.exit(fail?1:0);
