const fs=require('fs');const p='app/src/main/assets/index.html';let s=fs.readFileSync(p,'utf8');s=s.replace('<script src="app.js"></script>','<script src="curve.js"></script>\n<script src="app.js"></script>');
s=s.replace('<path id="curve-line-path"','<path id="curve-baseline-path" fill="none" stroke="#94A3B8" stroke-width="1.3" stroke-dasharray="3 3" />\n<path id="curve-forecast-path" fill="none" stroke="url(#curveColorGrad)" stroke-width="2.5" stroke-dasharray="4 3" />\n<path id="curve-line-path"');
let i=0;s=s.replace(/<text x="(?:35|85|140|195|250|305)" y="112"/g,m=>m+' id="curve-axis-'+i+++'"');s=s.replace(' id="label-today-node"','');
s=s.replace('<!-- 加粗进度条 -->','<p style="font-size:10px;color:var(--text-muted-custom);margin-top:6px">灰线：未复习 · 蓝实线：记录估算 · 蓝虚线：按计划预测<br>记忆保持率为示意估算，非个人实测；横轴为学习后天数。</p>\n<!-- 加粗进度条 -->');
fs.writeFileSync(p,s);const b='app/build.gradle';s=fs.readFileSync(b,'utf8').replace('versionCode 3','versionCode 4').replace('1.1.1','1.1.2');fs.writeFileSync(b,s);
