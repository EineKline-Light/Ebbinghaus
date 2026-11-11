const fs=require('fs');for(const folder of ['values','values-night']){
 const p='app/src/main/res/'+folder+'/styles.xml';const s=fs.readFileSync(p,'utf8');
 fs.mkdirSync('app/src/main/res/'+folder+'-v27',{recursive:true});fs.writeFileSync('app/src/main/res/'+folder+'-v27/styles.xml',s);fs.writeFileSync(p,s.replace(/\s*<item name="android:windowLightNavigationBar">.*?<\/item>/,''));
}
