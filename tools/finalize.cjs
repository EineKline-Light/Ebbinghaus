const fs=require('fs');let p='app/src/main/java/com/ebbinghaus/review/MainActivity.java',s=fs.readFileSync(p,'utf8');s=s.replace('            @Override public boolean onJsPrompt',`            @Override public boolean onJsConfirm(WebView v,String url,String message,JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("确定",(d,w)->result.confirm()).setNegativeButton("取消",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show(); return true;
            }
            @Override public boolean onJsPrompt`);fs.writeFileSync(p,s);
p='app/src/main/assets/app.js';s=fs.readFileSync(p,'utf8');s+=`\nconst originalApplyCustom=applyCustomDuration;\napplyCustomDuration=function(){if(pomoIsRunning||currentSessionSeconds){alert('请先停止当前专注，再修改时长');return;}originalApplyCustom();persist();};\ndocument.addEventListener('visibilitychange',()=>{if(!document.hidden && currentTab===0)startGeminiWave();});\n`;fs.writeFileSync(p,s);
