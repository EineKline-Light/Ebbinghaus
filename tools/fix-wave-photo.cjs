const fs=require('fs');let p='app/src/main/assets/index.html',s=fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
if(!s.includes('let geminiWaveRenderFrame'))s=s.replace('let geminiWaveAnimId = null;','let geminiWaveAnimId = null;\n    let geminiWaveRenderFrame = null;');
s=s.replace('      if (geminiWaveAnimId) cancelAnimationFrame(geminiWaveAnimId);\n      geminiWaveAnimId = requestAnimationFrame(renderFrame);','      geminiWaveRenderFrame = renderFrame;\n      if (geminiWaveAnimId) cancelAnimationFrame(geminiWaveAnimId);\n      geminiWaveAnimId = requestAnimationFrame(geminiWaveRenderFrame);');
s=s.replace('      if (!geminiWaveAnimId) {\n        lastTimestamp = performance.now();\n        geminiWaveAnimId = requestAnimationFrame(renderFrame);','      if (!geminiWaveAnimId && geminiWaveRenderFrame && !document.hidden) {\n        lastTimestamp = performance.now();\n        geminiWaveAnimId = requestAnimationFrame(geminiWaveRenderFrame);');
s=s.replace('    function handlePhotoFrameClick(e) {','    function handlePhotoFrameClick(e) {\n      if (e.target.closest("button, input, #photo-dots-box")) return;');
fs.writeFileSync(p,s);
p='app/src/main/assets/app.js';s=fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');s=s.replace('currentFont,userPhotos,customPomoMinutes','currentFont,userPhotos,activePhotoIdx,customPomoMinutes');s=s.replace('  customPomoMinutes=Math.min','  activePhotoIdx=Math.min(Math.max(0,Number(s.activePhotoIdx)||0),userPhotos.length);\n  customPomoMinutes=Math.min');s=s.replace("  if(!file.type.startsWith('image/'))continue;","  if(file.type && !file.type.startsWith('image/')){alert('请选择图片文件');continue;}");s=s.replace('activePhotoIdx=userPhotos.length-1;renderPhotoFrame();persist();e.target.value=\'\';','if(userPhotos.length) activePhotoIdx=userPhotos.length-1;renderPhotoFrame();persist();e.target.value=\'\';');fs.writeFileSync(p,s);
p='app/src/main/java/com/ebbinghaus/review/MainActivity.java';s=fs.readFileSync(p,'utf8');s=s.replace('fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data)); fileCallback=null;',`Uri[] uris = null;
            if(result==RESULT_OK && data!=null && data.getClipData()!=null) {
                int count=data.getClipData().getItemCount(); uris=new Uri[count];
                for(int i=0;i<count;i++) uris[i]=data.getClipData().getItemAt(i).getUri();
            } else { uris=WebChromeClient.FileChooserParams.parseResult(result,data); }
            fileCallback.onReceiveValue(uris); fileCallback=null;`);fs.writeFileSync(p,s);
