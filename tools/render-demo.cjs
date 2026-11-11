const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('C:/Users/EineK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const root=path.resolve('app/src/main/assets');
const server=http.createServer((req,res)=>{const name=decodeURIComponent(req.url.split('?')[0]);const p=path.join(root,name==='/'?'index.html':name);if(!p.startsWith(root)){res.end();return;}fs.readFile(p,(e,b)=>{res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html');res.end(e?'':b);});}).listen(8766,'127.0.0.1');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-gpu-sandbox']});
try{
const page=await browser.newPage({viewport:{width:390,height:780},deviceScaleFactor:1});
await page.clock.install({time:new Date('2026-11-11T09:00:00+08:00')});
await page.goto('http://127.0.0.1:8766');
await page.evaluate(()=>{
 records=[{id:'demo-a',date:'2026-11-07',title:'线代习题第一章'},{id:'demo-b',date:'2026-11-09',title:'数学07真题'}];checks={'demo-a:0':'2026-11-08','demo-a:1':'2026-11-09','demo-b:0':'2026-11-10'};renderTasks();
 const style=document.createElement('style');style.textContent='#app-root{top:52px;height:calc(100% - 52px)} #demo-label{position:fixed;inset:0 0 auto;height:52px;background:#f4f7fc;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font:600 13px system-ui;color:#334155;border-bottom:1px solid #e2e8f0;z-index:1000} #demo-label b{color:#2563eb;font-size:11px;letter-spacing:1px}';document.head.append(style);
 const label=document.createElement('div');label.id='demo-label';label.innerHTML='<span>背景粒子 · 呼吸波动</span><b>01 / 04</b>';document.body.append(label);
 window.demoCaption=(text,n)=>label.innerHTML='<span>'+text+'</span><b>0'+n+' / 04</b>';
 window.demoAnimationTimes=new Map();
});
await page.clock.runFor(500);
for(let i=0;i<150;i++){
 if(i===20)await page.evaluate(()=>{demoCaption('曲线 · 打卡平滑抬升',2);handleToggleTask({stopPropagation(){}},0);});
 if(i===38)await page.evaluate(()=>{demoCaption('曲线 · 任务自然切换',2);handleSelectTask(taskData.findIndex(t=>t.key.startsWith('demo-b:')));});
 if(i===58)await page.evaluate(()=>{demoCaption('日历 · 弹性滑动',3);handleTabSwitch(1);selectCalendarDay(11);});
 if(i===69)await page.evaluate(()=>selectCalendarDay(14));
 if(i===81)await page.evaluate(()=>selectCalendarDay(20));
 if(i===94)await page.evaluate(()=>{demoCaption('底栏 · 齿轮与指示器',4);handleTabSwitch(2);});
 if(i===116)await page.evaluate(()=>{demoCaption('底栏 · 画勾与回弹',4);handleTabSwitch(0);});
 await page.clock.runFor(40);
 await page.evaluate(i=>{document.getAnimations().forEach(a=>{if(!demoAnimationTimes.has(a))demoAnimationTimes.set(a,i);a.pause();a.currentTime=(i-demoAnimationTimes.get(a))*40;});},i);
 await page.screenshot({path:`exports/frames/${String(i).padStart(4,'0')}.png`});
 if(i%30===0)console.log('Rendered',i,'/150');
}
console.log('Rendered 150 frames / 6 seconds.');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
