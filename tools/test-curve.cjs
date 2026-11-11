const assert=require('assert');const {build}=require('../app/src/main/assets/curve.js');
const record={id:'a',date:'2026-11-01'},days=[1,2,4,7,14];
const a=build(record,days,{},'2026-11-08');assert(a.nodes[2].r<a.nodes[1].r);assert(a.nodes[3].r<a.nodes[2].r);
const b=build(record,days,{'a:0':'2026-11-02','a:1':'2026-11-03'},'2026-11-08');assert.equal(b.nodes[1].r,100);assert.equal(b.nodes[2].r,100);assert(b.nodes[3].r>a.nodes[3].r);assert.equal(b.nodes[5].x,305);assert(b.nodes[1].x-b.nodes[0].x<b.nodes[5].x-b.nodes[4].x);
const c=build(record,[2,5,10,20,30],{},'2026-11-02');assert.equal(c.nodes[5].t,30);assert(!/NaN|Infinity/.test(c.past+c.forecast+c.area));
const d=build(record,days,{'a:0':'2026-11-05'},'2026-11-08');assert.equal(d.completedDays[0],4);assert(d.nodes[1].r<100);
console.log('PASS: monotonic forgetting, review recovery, stronger retention, actual late review dates, proportional time axis and custom intervals.');
