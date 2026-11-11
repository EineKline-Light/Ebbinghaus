/* Scheme A: align by time (X), interpolate Y only; preserve vertical review edges. */
(function(root){
 function parse(path,closed){const n=(path.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[]).map(Number),p=[];for(let i=0;i+1<n.length;i+=2)p.push([n[i],n[i+1]]);return closed?p.slice(0,-2):p;}
 function at(points,x,after){
  const exact=points.filter(p=>p[0]===x);if(exact.length)return exact[after?exact.length-1:0][1];
  if(x<points[0][0])return points[0][1];if(x>points[points.length-1][0])return points[points.length-1][1];
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];if(a[0]<x&&b[0]>x)return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}
  return points[points.length-1][1];
 }
 function align(oldPath,newPath,closed){
  const old=parse(oldPath,closed),next=parse(newPath,closed);if(!old.length||!next.length)return null;
  const xs=[...new Set([...old,...next].map(p=>p[0]))].sort((a,b)=>a-b),a=[],b=[];
  xs.forEach(x=>{for(const after of [false,true]){a.push([x,at(old,x,after)]);b.push([x,at(next,x,after)]);}});
  return {a,b};
 }
 function blend(a,b,t,closed){return a.map((p,i)=>(i?'L':'M')+p[0].toFixed(3)+' '+(p[1]+(b[i][1]-p[1])*t).toFixed(3)).join(' ')+(closed?' L305 98 L35 98 Z':'');}
 root.CurveMorph={align,blend};if(typeof module!=='undefined')module.exports=root.CurveMorph;
})(typeof globalThis!=='undefined'?globalThis:this);
