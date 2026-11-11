const fs=require('fs'),vm=require('vm'),assert=require('assert');
const js=fs.readFileSync('app/src/main/assets/app.js','utf8');
const upload=js.slice(js.indexOf('handleUserPhotoUpload=async'),js.indexOf('const originalDelete'));
let saved,rendered,alerts=[];
const sandbox={userPhotos:[{type:'preset'}],activePhotoIdx:0,storageKey:'test',snapshot(){return {userPhotos:this.userPhotos};},localStorage:{setItem(k,v){saved=JSON.parse(v);}},persist(){},renderPhotoFrame(){rendered=sandbox.userPhotos[sandbox.activePhotoIdx];},alert:x=>alerts.push(x),FileReader:class{readAsDataURL(){this.result='data:image/png;base64,AA==';this.onload();}},Image:class{width=2000;height=1000;set src(v){this.onload();}},document:{createElement:()=>({getContext:()=>({drawImage(){}}),toDataURL:()=> 'data:image/jpeg;base64,AA=='})},Date,Array,Promise};
vm.createContext(sandbox);vm.runInContext(upload,sandbox);
(async()=>{await sandbox.handleUserPhotoUpload({target:{files:[{type:''},{type:'image/png'}],value:'x'}});assert.equal(sandbox.userPhotos.length,3);assert.equal(rendered.type,'uploaded');assert.equal(sandbox.activePhotoIdx,2);assert.equal(saved.userPhotos.length,3);assert.equal(alerts.length,0);console.log('PASS: missing MIME and multiple photos imported, latest photo rendered and persisted.');})().catch(e=>{console.error(e);process.exitCode=1;});
