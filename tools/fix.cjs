const fs=require('fs');
let p='app/src/main/assets/app.js',s=fs.readFileSync(p,'utf8').replace('#secondary-page-content','#secondary-content').replace("getElementById('custom-duration-modal')","getElementById('custom-pomo-modal')");
s=s.replace("document.getElementById('curve-stage-badge').innerText='尚未排期';", "document.getElementById('curve-stage-badge').innerText='尚未排期';document.getElementById('hud-detail-node').textContent='尚无复习任务';document.getElementById('hud-detail-state').textContent='请先在日历录入学习内容';document.getElementById('curve-line-path').setAttribute('d','');document.getElementById('curve-area-path').setAttribute('d','');");
fs.writeFileSync(p,s);
p='app/build.gradle';s=fs.readFileSync(p,'utf8').replace('versionCode 1','versionCode 2').replace('versionName "1.0.0"','versionName "1.1.0"');fs.writeFileSync(p,s);
p='app/src/main/assets/index.html';s=fs.readFileSync(p,'utf8').replace('height: 100vh;','height: 100%;').replace('<style>','<style>\n input,textarea { user-select:text; -webkit-user-select:text; min-width:0; }\n #screen-scrollable-body, #secondary-content { min-height:0; overscroll-behavior-y:contain; }\n @supports not (backdrop-filter: blur(16px)) { .frosted-glass-bar { background:rgba(255,255,255,.94)!important; } .dark .frosted-glass-bar {background:rgba(15,23,42,.94)!important;} }\n');
s=s.replace('function renderFrame(now) {',`function renderFrame(now) {\n        if (document.hidden || (typeof currentTab !== 'undefined' && currentTab !== 0)) { geminiWaveAnimId = null; return; }`);
fs.writeFileSync(p,s);
