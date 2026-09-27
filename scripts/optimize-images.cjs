const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname,'..');
const directory = path.join(root,'assets/images/media');
fs.mkdirSync(directory,{recursive:true});
const files = ['assets/images/profile.jpg'];
function collect(dir) {
  for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})) {
    const file = `${dir}/${entry.name}`;
    if(entry.isDirectory())collect(file);
    else if(/\.(jpe?g|png)$/i.test(file))files.push(file);
  }
}
collect('assets/images/Blog');
collect('assets/images/Achievements');
(async()=>{
  const mapping={};let before=0,after=0;
  for(const [i,file] of files.entries()) {
const output=`assets/images/media/photo-${String(i+1).padStart(3,'0')}.webp`;
    await sharp(path.join(root,file)).rotate().resize({width:1400,height:1100,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toFile(path.join(root,output));
    mapping[file]=output;before+=fs.statSync(path.join(root,file)).size;after+=fs.statSync(path.join(root,output)).size;
  }
fs.writeFileSync(path.join(root,'assets/js/media.js'),`window.SITE_MEDIA = ${JSON.stringify(mapping,null,2)};\n`);
  console.log(JSON.stringify({images:files.length,originalBytes:before,previewBytes:after}));
})().catch(error=>{console.error(error);process.exit(1);});
