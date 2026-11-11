/* Mobile application behavior layered on the supplied mockup. */
var reviewIntervals = [1, 2, 4, 7, 14];
var records = [];
var checks = {};
var calMonth = new Date().getMonth(), calYear = new Date().getFullYear();
var currentTab = 0, currentPage = null, timerEnd = null;
var storageKey = 'ebbinghaus-v2';
const templateTask = JSON.parse(JSON.stringify(taskData[0]));
const escapeText = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function dateKey(date) { return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-'); }
function snapshot() { return {version:2,records,checks,reviewIntervals,currentThemeMode,currentAccent,currentFont,userPhotos,activePhotoIdx,customPomoMinutes,pomoSecondsRemaining,currentSessionSeconds,totalSecondsStudy,timerEnd}; }
function persist() { try { localStorage.setItem(storageKey,JSON.stringify(snapshot())); } catch(e) { console.error('Storage',e); } }
function restore(s) {
  if (!s || s.version !== 2 || !Array.isArray(s.records) || !Array.isArray(s.reviewIntervals)) throw Error('无效的备份格式');
  if(s.reviewIntervals.length!==5 || s.reviewIntervals.some((n,i,a)=>!Number.isInteger(n)||n<1||n>365||(i>0&&n<=a[i-1]))) throw Error('复习间隔格式错误');
  if(s.records.some(r=>!r || typeof r.id!=='string'||typeof r.title!=='string'||r.title.length>500||!/^\d{4}-\d{2}-\d{2}$/.test(r.date))) throw Error('任务数据错误');
  records=s.records; checks=s.checks && typeof s.checks==='object'?s.checks:{}; reviewIntervals=s.reviewIntervals;
  currentThemeMode=s.currentThemeMode==='dark'?'dark':'light';
  currentAccent=['klein','cyan','indigo'].includes(s.currentAccent)?s.currentAccent:'klein';
  currentFont=['sans','humanist','serif'].includes(s.currentFont)?s.currentFont:'sans';
  if(Array.isArray(s.userPhotos)&&s.userPhotos.length) userPhotos=s.userPhotos.filter(p=>p.type==='preset'||(p.type==='uploaded'&&/^data:image\/(jpeg|png|webp);base64,/.test(p.url)));
  activePhotoIdx=Math.min(Math.max(0,Math.floor(Number(s.activePhotoIdx)||0)),Math.max(0,userPhotos.length-1));
  customPomoMinutes=Math.min(180,Math.max(1,Number(s.customPomoMinutes)||25));
  pomoSecondsRemaining=Math.max(0,Number(s.pomoSecondsRemaining)||0);
  currentSessionSeconds=Math.max(0,Number(s.currentSessionSeconds)||0); totalSecondsStudy=Math.max(0,Number(s.totalSecondsStudy)||0);
  timerEnd=Number(s.timerEnd)||null;
}
function renderTasks() {
  const today=dateKey(new Date());
  taskData.length=0;
  records.forEach(r=>reviewIntervals.forEach((offset,i)=>{
    let due=new Date(r.date+'T12:00:00'); due.setDate(due.getDate()+offset);
    const key=r.id+':'+i;
    if(dateKey(due)<=today && (!checks[key] || checks[key]===today)) {
      const t=JSON.parse(JSON.stringify(templateTask));
      Object.assign(t,{title:r.title,stageIndex:i+1,isCompleted:!!checks[key],key,due:dateKey(due)});
      t.nodeDescriptions.forEach((n,j)=>{if(j)n.name='+'+reviewIntervals[j-1]+'天';});
      taskData.push(t);
    }
  }));
  const container=document.getElementById('task-container');
  container.innerHTML=taskData.map((t,i)=>`<div id="task-card-${i}" onclick="handleSelectTask(${i})" class="task-card-box p-3 rounded-2xl border-2 card-border card-bg shadow-2xs cursor-pointer transition-all flex items-start gap-3"><button aria-label="复习打卡" onclick="handleToggleTask(event,${i})" class="task-check-box mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${t.isCompleted?'bg-accent border-accent':'border-slate-300 bg-white dark:bg-zinc-800'}"><svg class="check-icon-svg w-3 h-3 text-white ${t.isCompleted?'opacity-100':'opacity-0'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 4 4 10-10"/></svg></button><div class="flex-1 min-w-0"><div class="task-title-text text-xs font-bold text-primary-text ${t.isCompleted?'line-through opacity-50':''}">${escapeText(t.title)}</div><div class="text-xs text-muted-text mt-1">${t.due} · 第 ${t.stageIndex} 轮 · +${reviewIntervals[t.stageIndex-1]}天</div></div></div>`).join('')||'<div class="card-bg border card-border rounded-2xl p-4 text-sm text-muted-text">今日暂无待复习任务。在日历录入学习内容后，系统会自动安排五轮复习。</div>';
  document.getElementById('badge-status-count').innerText='待复习 '+taskData.filter(t=>!t.isCompleted).length+' 项';
  currentSelectedTask=Math.min(currentSelectedTask,taskData.length-1);
  if(taskData.length) { currentSelectedTask=Math.max(0,currentSelectedTask); handleSelectTask(currentSelectedTask); }
  else { document.getElementById('curve-task-title').innerText='科学复习 · 等待学习记录'; document.getElementById('curve-bold-bar').style.width='0%';document.getElementById('curve-bold-percent').innerText='0%';document.getElementById('curve-stage-badge').innerText='尚未排期';document.getElementById('hud-detail-node').textContent='尚无复习任务';document.getElementById('hud-detail-state').textContent='请先在日历录入学习内容';document.getElementById('curve-line-path').setAttribute('d','');document.getElementById('curve-forecast-path').setAttribute('d','');document.getElementById('curve-baseline-path').setAttribute('d','');activeCurve=null;document.getElementById('curve-area-path').setAttribute('d',''); }
}
const originalToggleTask=handleToggleTask;
handleToggleTask=function(e,i) { const t=taskData[i];if(!t.isCompleted)checks[t.key]=dateKey(new Date());else delete checks[t.key];originalToggleTask(e,i);persist(); };
const originalNodeClick=handleNodeClick;
handleNodeClick=function(i) { if(taskData.length)originalNodeClick(i); };
const originalRefresh=refreshActiveTaskView;
refreshActiveTaskView=function() { if(taskData.length)originalRefresh(); };
function renderRecords() {
 const key=dateKey(new Date(calYear,calMonth,selectedCalDay));
 const list=document.getElementById('cal-recorded-list'); list.innerHTML='';
 records.filter(r=>r.date===key).forEach(r=>{
   const row=document.createElement('div');row.className='bg-slate-50 dark:bg-zinc-800/80 p-2.5 rounded-xl border card-border text-xs flex items-center justify-between';
   const text=document.createElement('span');text.className='font-medium text-primary-text';text.textContent=r.title;
   const del=document.createElement('button');del.className='text-accent p-2';del.textContent='删除';del.onclick=()=>{if(!confirm('删除此学习内容及其复习记录？'))return;records=records.filter(x=>x.id!==r.id);Object.keys(checks).forEach(k=>{if(k.startsWith(r.id+':'))delete checks[k];});persist();renderRecords();renderTasks();};row.append(text,del);list.append(row);
 });
}
handleCalendarAdd=function() {
 const input=document.getElementById('cal-new-task-input');const title=input.value.trim();if(!title)return;
 if(title.length>500){alert('学习内容最多500字');return;}
 records.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),title,date:dateKey(new Date(calYear,calMonth,selectedCalDay))});input.value='';persist();renderRecords();renderTasks();
};
initCalendarDaysGrid=function() {
 const grid=document.getElementById('calendar-days-grid');grid.innerHTML='';
 const offset=(new Date(calYear,calMonth,1).getDay()+6)%7;
 for(let i=0;i<offset;i++)grid.appendChild(document.createElement('span'));
 const count=new Date(calYear,calMonth+1,0).getDate();selectedCalDay=Math.min(count,selectedCalDay);
 for(let d=1;d<=count;d++){
  const cell=document.createElement('div');cell.id='cal-cell-'+d;cell.className='cal-day-cell flex flex-col items-center py-1 cursor-pointer rounded-2xl relative z-10';cell.style.height='42px';cell.onclick=()=>selectCalendarDay(d);
  let lunar='';try{lunar=new Intl.DateTimeFormat('zh-CN-u-ca-chinese',{day:'numeric'}).format(new Date(calYear,calMonth,d));}catch(e){}
  cell.innerHTML=`<span class="day-num font-bold text-sm text-primary-text">${d}</span><span class="day-lunar text-xs text-muted-text">${escapeText(lunar)}</span>`;grid.append(cell);
 }
 document.querySelector('#view-calendar h2').textContent=calYear+'年'+(calMonth+1)+'月';renderCalendarSpringPill();
};
renderCalendarSpringPill=function() {
 const offset=(new Date(calYear,calMonth,1).getDay()+6)%7,index=selectedCalDay-1+offset;
 document.getElementById('cal-spring-indicator').style.transform=`translate(${index%7*100}%,${Math.floor(index/7)*48}px)`;
 document.querySelectorAll('.cal-day-cell').forEach(c=>{const active=c.id==='cal-cell-'+selectedCalDay;c.querySelector('.day-num').className='day-num font-bold text-sm '+(active?'text-white':'text-primary-text');c.querySelector('.day-lunar').className='day-lunar text-xs '+(active?'text-blue-100':'text-muted-text');});
 const label=(calMonth+1)+'月'+selectedCalDay+'日';document.getElementById('cal-entry-title').textContent=label+' 完成任务分条填入';document.getElementById('cal-future-title').textContent=label+' 任务对应的未来复习日：';
 document.getElementById('future-dates-pills').innerHTML=reviewIntervals.map(n=>{const d=new Date(calYear,calMonth,selectedCalDay);d.setDate(d.getDate()+n);return `<div class="p-1 rounded-lg bg-accent-light text-accent border border-accent-border font-bold text-xs">${d.getMonth()+1}-${String(d.getDate()).padStart(2,'0')}</div>`;}).join('');renderRecords();
};
function changeMonth(delta) { const d=new Date(calYear,calMonth+delta,1);calYear=d.getFullYear();calMonth=d.getMonth();initCalendarDaysGrid(); }
function editIntervals() {
 const value=prompt('输入5个递增的复习间隔天数，以逗号分隔（1—365）',reviewIntervals.join(','));if(value===null)return;
 const days=value.split(/[,，\s]+/).map(Number);
 if(days.length!==5||days.some((n,i)=>!Number.isInteger(n)||n<1||n>365||(i&&n<=days[i-1]))){alert('请输入5个1至365之间的递增整数');return;}
 reviewIntervals=days;persist();renderCalendarSpringPill();renderTasks();openSecondaryPage('intervals');
}
function exportBackup() {
 const text=JSON.stringify(snapshot(),null,2);
 if(window.NativeBackup){NativeBackup.exportBackup(text);return;}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download='ebbinghaus-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importBackup() {
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
 input.onchange=async()=>{try{if(!input.files[0])return;if(input.files[0].size>25000000)throw Error('备份超过25MB');const s=JSON.parse(await input.files[0].text());if(!confirm('恢复备份会替换当前数据，是否继续？'))return;restore(s);persist();location.reload();}catch(e){alert('无法恢复：'+e.message);}};input.click();
}
handleUserPhotoUpload=async function(e) {
 for(const file of Array.from(e.target.files||[])){
  if(file.type && !file.type.startsWith('image/')){alert('请选择图片文件');continue;}
  try {
   const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
   const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});
   const canvas=document.createElement('canvas');const scale=Math.min(1,1000/Math.max(img.width,img.height));canvas.width=img.width*scale;canvas.height=img.height*scale;canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
   const photo={id:Date.now(),type:'uploaded',url:canvas.toDataURL('image/jpeg',0.78)};
   const candidate=snapshot();candidate.userPhotos=[...userPhotos,photo];localStorage.setItem(storageKey,JSON.stringify(candidate));userPhotos.push(photo);
  }catch(error){alert('照片无法保存，可能空间不足或图片格式不支持');}
 }
 if(userPhotos.length) activePhotoIdx=userPhotos.length-1;renderPhotoFrame();persist();e.target.value='';
};
const originalDelete=deleteSpecificPhoto;
deleteSpecificPhoto=function(e,i){originalDelete(e,i);persist();};
deleteCurrentViewingPhoto=function(){if(!userPhotos.length)return;userPhotos.splice(Math.min(activePhotoIdx,userPhotos.length-1),1);activePhotoIdx=Math.max(0,userPhotos.length-1);renderPhotoFrame();persist();};
const originalOpen=openSecondaryPage;
openSecondaryPage=function(page){currentPage=page;originalOpen(page);if(page==='intervals'){const chips=document.querySelector('#secondary-content .flex.flex-wrap');if(chips)chips.innerHTML=reviewIntervals.map(n=>`<span class="px-3 py-1.5 rounded-xl bg-accent-light text-accent border border-accent-border">${n}天</span>`).join('');}};
const originalClose=closeSecondaryPage;
closeSecondaryPage=function(){currentPage=null;originalClose();};
const originalTab=handleTabSwitch;
handleTabSwitch=function(i){currentTab=i;originalTab(i);document.getElementById("screen-scrollable-body").scrollTop=0;if(i===1)initCalendarDaysGrid();if(i===2){renderPhotoFrame();initPhotoSwipeSupport();}};
['setThemeMode','setAccentColor','setFontChoice'].forEach(name=>{const fn=window[name];window[name]=function(v){fn(v);persist();};});
function syncTimer() {
 if(!timerEnd)return;
 const remaining=Math.max(0,Math.ceil((timerEnd-Date.now())/1000));
 currentSessionSeconds+=Math.max(0,pomoSecondsRemaining-remaining);pomoSecondsRemaining=remaining;
 renderPomodoroDisplay();updateAnalogClock(false);
 if(!remaining){clearInterval(pomoInterval);pomoIsRunning=false;timerEnd=null;totalSecondsStudy+=currentSessionSeconds;currentSessionSeconds=0;document.getElementById('timer-status-badge').textContent='已完成';document.getElementById('pomo-play-icon').innerHTML='<path d="M8 5v14l11-7z"/>';persist();alert('本轮专注已完成，学习时长已保存。');}else persist();
}
togglePomodoro=function(){
 if(pomoIsRunning){syncTimer();clearInterval(pomoInterval);timerEnd=null;pomoIsRunning=false;}
 else {if(!pomoSecondsRemaining)pomoSecondsRemaining=customPomoMinutes*60;pomoIsRunning=true;timerEnd=Date.now()+pomoSecondsRemaining*1000;pomoInterval=setInterval(syncTimer,1000);}
 document.getElementById('timer-status-badge').textContent=pomoIsRunning?'专注中':'已暂停';document.getElementById('pomo-play-icon').innerHTML=pomoIsRunning?'<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>':'<path d="M8 5v14l11-7z"/>';persist();
};
const originalStop=handleStopPomodoro;
handleStopPomodoro=function(){syncTimer();timerEnd=null;originalStop();persist();};
const originalReset=resetPomodoro;
resetPomodoro=function(v){timerEnd=null;originalReset(v);persist();};
const originalFast=setFastPomoDuration;
setFastPomoDuration=function(n){if(pomoIsRunning||currentSessionSeconds){alert('请先停止当前专注，再修改时长');return;}originalFast(n);persist();};
window.handleAndroidBack=function(){
 const stop=document.getElementById('stop-confirm-modal');if(!stop.classList.contains('hidden')){stop.classList.add('hidden');return true;}
 const custom=document.getElementById('custom-pomo-modal');if(custom&&!custom.classList.contains('hidden')){closeCustomDurationModal();return true;}
 if(currentPage){closeSecondaryPage();return true;}if(currentTab!==0){handleTabSwitch(0);return true;}return false;
};
try{const saved=localStorage.getItem(storageKey);if(saved)restore(JSON.parse(saved));}catch(e){console.error('Restore',e);}
selectedCalDay=new Date().getDate();
window.addEventListener('DOMContentLoaded',()=>{
 renderTasks();renderCalendarSpringPill();
 document.querySelector('#view-today h2').textContent=(new Date().getMonth()+1)+'月'+new Date().getDate()+'日 · 今日复习';
 const heading=document.querySelector('#view-calendar h2');const nav=document.createElement('div');nav.className='flex items-center gap-2';nav.innerHTML='<button class="p-2 text-accent" onclick="changeMonth(-1)" aria-label="上月">‹</button><button class="p-2 text-accent" onclick="changeMonth(1)" aria-label="下月">›</button>';heading.after(nav);
 document.getElementById('cal-new-task-input').addEventListener('keydown',e=>{if(e.key==='Enter')handleCalendarAdd();});
 if(timerEnd){pomoIsRunning=true;pomoInterval=setInterval(syncTimer,1000);syncTimer();document.getElementById('timer-status-badge').textContent=pomoIsRunning?'专注中':'已完成';}
 handleTabSwitch(0);
});
document.addEventListener('visibilitychange',()=>{syncTimer();persist();if(!document.hidden)renderTasks();});
window.addEventListener('pagehide',persist);

const originalApplyCustom=applyCustomDuration;
applyCustomDuration=function(){if(pomoIsRunning||currentSessionSeconds){alert('请先停止当前专注，再修改时长');return;}originalApplyCustom();persist();};
document.addEventListener('visibilitychange',()=>{if(!document.hidden && currentTab===0)startGeminiWave();});
var activeCurve = null;
refreshActiveTaskView=function(){
 const task=taskData[currentSelectedTask];if(!task)return;
 const record=records.find(r=>task.key.startsWith(r.id+':'));if(!record)return;
 activeCurve=ForgettingCurve.build(record,reviewIntervals,checks,dateKey(new Date()));
 document.getElementById('curve-task-title').textContent=task.title;
 document.getElementById('curve-stage-badge').textContent=task.isCompleted?'本轮已复习':'第'+task.stageIndex+'轮待复习';
 document.getElementById('curve-line-path').setAttribute('d',activeCurve.full);
 document.getElementById('curve-forecast-path').setAttribute('d',activeCurve.full);
 document.getElementById('curve-baseline-path').setAttribute('d',activeCurve.baseline);
 document.getElementById('curve-area-path').setAttribute('d',activeCurve.area);
 document.getElementById('curve-past-window').setAttribute('width',activeCurve.splitX);
 document.getElementById('curve-future-window').setAttribute('x',activeCurve.splitX);
 activeCurve.nodes.forEach((p,i)=>{
  const dot=document.getElementById('dot-'+i);dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);
  const group=dot.parentNode;group.querySelector('circle').setAttribute('cx',p.x);group.querySelector('circle').setAttribute('cy',p.y);
  const label=document.getElementById('curve-axis-'+i);label.setAttribute('x',p.x);label.textContent=i?'+'+reviewIntervals[i-1]+'天':'学习';
 });
 const ring=document.getElementById('breathe-ring'),p=activeCurve.nodes[task.stageIndex];ring.setAttribute('cx',p.x);ring.setAttribute('cy',p.y);
 handleNodeClick(currentSelectedNode);
};
handleNodeClick=function(i){
 if(!activeCurve||!taskData.length)return;currentSelectedNode=i;
 const task=taskData[currentSelectedTask],p=activeCurve.nodes[i],future=p.t>activeCurve.age;
 const completed=i>0&&!!checks[task.key.split(':')[0]+':'+(i-1)];
 document.getElementById('curve-bold-bar').style.width=p.r+'%';document.getElementById('curve-bold-percent').textContent=Math.round(p.r)+'%';
 document.getElementById('hud-detail-node').textContent=i?'学习后第'+reviewIntervals[i-1]+'天':'初次学习';
 document.getElementById('hud-detail-state').textContent=(future?'按计划复习预测':completed?'结合已打卡记录估算':'未复习衰减估算')+' · '+Math.round(p.r)+'%';
 activeCurve.nodes.forEach((_,j)=>document.getElementById('dot-'+j).setAttribute('r',i===j?'5.5':'3.5'));
};
const curveToggle=handleToggleTask;
handleToggleTask=function(e,i){curveToggle(e,i);};
var curveMorphFrame=null;
function captureCurveDrawing(){
 const paths=['curve-line-path','curve-forecast-path','curve-baseline-path','curve-area-path'].map(id=>{const el=document.getElementById(id);return {el,d:el.getAttribute('d')||''};});
 const attributes=[];
 for(let i=0;i<6;i++){
  const dot=document.getElementById('dot-'+i);
  [dot,dot.parentNode.querySelector('circle')].forEach(el=>['cx','cy'].forEach(key=>attributes.push({el,key,value:Number(el.getAttribute(key))})));
  const label=document.getElementById('curve-axis-'+i);attributes.push({el:label,key:'x',value:Number(label.getAttribute('x'))});
 }
 const ring=document.getElementById('breathe-ring');['cx','cy'].forEach(key=>attributes.push({el:ring,key,value:Number(ring.getAttribute(key))}));
 ['curve-past-window','curve-future-window'].forEach((id,i)=>{const el=document.getElementById(id),key=i?'x':'width';attributes.push({el,key,value:Number(el.getAttribute(key))});});
 return {paths,attributes};
}
const refreshBeforeMorph=refreshActiveTaskView;
refreshActiveTaskView=function(){
 if(curveMorphFrame!==null){cancelAnimationFrame(curveMorphFrame);curveMorphFrame=null;}
 const from=captureCurveDrawing();refreshBeforeMorph();const to=captureCurveDrawing();
 // All shapes and their hit targets share one frame clock, without CSS lag.
 to.paths.forEach(p=>p.el.style.setProperty('transition','none','important'));
 to.attributes.forEach(p=>p.el.style.setProperty('transition','none','important'));
 if(!activeCurve||!from.paths[0].d||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const paths=to.paths.map((p,i)=>{const closed=p.el.id==='curve-area-path';return {el:p.el,d:p.d,closed,pair:CurveMorph.align(from.paths[i].d,p.d,closed)};});
 const start=performance.now();
 function draw(now){
  if(!activeCurve){curveMorphFrame=null;return;}
  const progress=Math.min(1,Math.max(0,(now-start)/420)),t=progress*progress*(3-2*progress);
  paths.forEach(p=>{if(p.pair)p.el.setAttribute('d',progress===1?p.d:CurveMorph.blend(p.pair.a,p.pair.b,t,p.closed));});
  to.attributes.forEach((p,i)=>p.el.setAttribute(p.key,from.attributes[i].value+(p.value-from.attributes[i].value)*t));
  curveMorphFrame=progress<1?requestAnimationFrame(draw):null;
 }
 draw(start);
};
// One pointer gesture produces one navigation; suppress its synthetic click.
var photoSwipeUntil=0;
const photoClickBeforeSwipeFix=handlePhotoFrameClick;
handlePhotoFrameClick=function(e){if(performance.now()<photoSwipeUntil)return;photoClickBeforeSwipeFix(e);};
initPhotoSwipeSupport=function(){
 const box=document.getElementById('photo-frame-box');
 if(box.dataset.swipeBound==='v2')return;box.dataset.swipeBound='v2';
 box.style.touchAction='pan-y';
 let touch=null;
 box.addEventListener('touchstart',e=>{if(e.touches.length!==1||e.target.closest('button,input,#photo-dots-box')){touch=null;return;}const p=e.touches[0];touch={x:p.clientX,y:p.clientY};},{passive:true});
 box.addEventListener('touchmove',e=>{if(!touch)return;const p=e.touches[0],dx=p.clientX-touch.x,dy=p.clientY-touch.y;if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.2&&e.cancelable)e.preventDefault();},{passive:false});
 box.addEventListener('touchend',e=>{if(!touch)return;const p=e.changedTouches[0],dx=p.clientX-touch.x,dy=p.clientY-touch.y;touch=null;if(Math.abs(dx)>=35&&Math.abs(dx)>Math.abs(dy)*1.2){photoSwipeUntil=performance.now()+450;const count=userPhotos.length+1;activePhotoIdx=(activePhotoIdx+(dx<0?1:-1)+count)%count;renderPhotoFrame();persist();}},{passive:true});
 box.addEventListener('touchcancel',()=>{touch=null;});
 let gesture=null;
 box.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'||e.isPrimary===false||e.button>0||e.target.closest('button,input,#photo-dots-box'))return;
  gesture={id:e.pointerId,x:e.clientX,y:e.clientY};
  try{box.setPointerCapture(e.pointerId);}catch(error){}
 });
 box.addEventListener('pointerup',e=>{
  if(!gesture||gesture.id!==e.pointerId)return;
  const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;
  if(Math.abs(dx)>=35&&Math.abs(dx)>Math.abs(dy)*1.2){
   photoSwipeUntil=performance.now()+450;
   const count=userPhotos.length+1;
   activePhotoIdx=(activePhotoIdx+(dx<0?1:-1)+count)%count;
   renderPhotoFrame();persist();
  }
 });
 box.addEventListener('pointercancel',()=>{gesture=null;});
};

const renderPhotoBeforeRecovery=renderPhotoFrame;
renderPhotoFrame=function(){activePhotoIdx=Math.min(Math.max(0,Math.floor(Number(activePhotoIdx)||0)),userPhotos.length);renderPhotoBeforeRecovery();const image=document.querySelector("#photo-frame-display img");if(image){image.draggable=false;image.style.pointerEvents="none";} };
