const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const missing = [];
const normalized = [];
for(const [file,name] of [['blog','BLOG_DATA'],['writeups','WRITEUPS_DATA'],['achievements','ACHIEVEMENTS_DATA']]) {
  const data = vm.runInNewContext(fs.readFileSync(path.join(root,'data',file+'.js'),'utf8')+';'+name);
  for(const item of data) {
    const images = item.images || [...(item.content || '').matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m=>m[1]);
    for(const raw of images) {
      if(/^https?:|^data:/.test(raw)) continue;
      const url = raw.replace(/\\/g,'/').replace(/^(Forensics|Blog|CTF|Achievements)\//,'assets/images/$1/');
      if(url!==raw)normalized.push({id:item.id,from:raw,to:url});
      if(!fs.existsSync(path.join(root,decodeURIComponent(url))))missing.push({id:item.id,url});
    }
  }
}
console.log(JSON.stringify({missing,normalized},null,2));
if(missing.length)process.exitCode=1;
