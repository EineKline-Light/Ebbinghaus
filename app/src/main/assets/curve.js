/* Illustrative forgetting model, not a measured personal retention score. */
(function(root){
 function dayNumber(key){const p=key.split('-').map(Number);return Date.UTC(p[0],p[1]-1,p[2])/86400000;}
 function build(record,intervals,checks,today){
  const age=Math.max(0,dayNumber(today)-dayNumber(record.date));
  const actual=intervals.map((_,i)=>checks[record.id+':'+i]).filter(Boolean).map(d=>dayNumber(d)-dayNumber(record.date)).filter(d=>d>=0&&d<=age).sort((a,b)=>a-b);
  const completedDays=[...new Set(actual)];
  const future=intervals.filter((d,i)=>!checks[record.id+':'+i]&&d>age);
  const events=[...new Set([...completedDays,...future])].sort((a,b)=>a-b);
  const end=Math.max(intervals[intervals.length-1],age,1);
  function retention(t,applied){const last=applied.length?applied[applied.length-1]:0;return 100*Math.exp(-Math.sqrt(Math.max(0,t-last))/(0.9*Math.pow(1.85,applied.length)));}
  function point(t,r){return {t,r,x:35+270*t/end,y:98-86*r/100};}
  const points=[point(0,100)],applied=[];
  const boundaries=[...new Set([...events,...intervals,age,end])].sort((a,b)=>a-b);let last=0;
  boundaries.forEach(t=>{
   if(t>last){for(let i=1;i<=32;i++){const time=last+(t-last)*i/32;points.push(point(time,retention(time,applied)));}}
   if(events.includes(t)){applied.push(t);points.push(point(t,100));}
   last=t;
  });
  const nodeDays=[0,...intervals];
  const nodes=nodeDays.map(t=>point(t,retention(t,events.filter(e=>e<=t))));
  function path(list){return list.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' ');}
  const past=points.filter(p=>p.t<=age),predicted=points.filter(p=>p.t>=age);
  const baseline=Array.from({length:161},(_,i)=>{const t=end*i/160;return point(t,100*Math.exp(-Math.sqrt(t)/0.9));});
  return {age,end,nodes,full:path(points),splitX:35+270*age/end,past:path(past),forecast:path(predicted),baseline:path(baseline),area:path(points)+' L305 98 L35 98 Z',completedDays};
 }
 root.ForgettingCurve={build,dayNumber};
 if(typeof module!=='undefined')module.exports=root.ForgettingCurve;
})(typeof globalThis!=='undefined'?globalThis:this);
