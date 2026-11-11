const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
let id=0,frames=new Map(),paints=0;
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}}),clearRect(){paints++;}},{get:(o,k)=>k in o?o[k]:()=>{}});
const layer={clientWidth:390,clientHeight:340,getBoundingClientRect:()=>({width:390,height:340,left:0,top:0})};
const root={dataset:{},addEventListener(){}};
const document={hidden:false,getElementById:k=>k==='gemini-ambient-canvas'?{getContext:()=>ctx}:k==='gemini-wave-bg-layer'?layer:k==='app-root'?root:null};
const sandbox={document,window:{devicePixelRatio:1,addEventListener(){}},performance:{now:()=>1000},requestAnimationFrame:fn=>{assert.equal(typeof fn,'function');frames.set(++id,fn);return id;},cancelAnimationFrame:n=>frames.delete(n),setTimeout(){},setInterval(){},console};
vm.createContext(sandbox);vm.runInContext(inline,sandbox);vm.runInContext('var currentTab=0;initGeminiAmbientCanvas()',sandbox);
function tick(){assert.equal(frames.size,1);const [n,fn]=frames.entries().next().value;frames.delete(n);fn(id*16);}
tick();assert(paints>0);
for(let i=0;i<20;i++){
 vm.runInContext('currentTab=2',sandbox);tick();assert.equal(frames.size,0);
 vm.runInContext('currentTab=0;startGeminiWave();startGeminiWave()',sandbox);assert.equal(frames.size,1);
 const before=paints;tick();assert(paints>before);
}
document.hidden=true;tick();assert.equal(frames.size,0);vm.runInContext('startGeminiWave()',sandbox);assert.equal(frames.size,0);
document.hidden=false;vm.runInContext('startGeminiWave()',sandbox);const before=paints;tick();assert(paints>before);
console.log('PASS: 20 tab round trips, no duplicate frame loops, background pause and resume; actual canvas render callback executed.');
