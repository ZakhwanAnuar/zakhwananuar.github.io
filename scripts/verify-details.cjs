const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const go=async(file,query='')=>{await page.goto(pathToFileURL(path.join(root,file+'.html')).href+query);await page.waitForTimeout(100);};
  const imageChecks=[];
  for(const [file,name,route] of [['blog','BLOG_DATA','blog-post'],['writeups','WRITEUPS_DATA','writeup']]) {
    const data=vm.runInNewContext(fs.readFileSync(path.join(root,'data',file+'.js'),'utf8')+';'+name);
    for(const item of data) {
      await go(route,'?id='+encodeURIComponent(item.id));
      await page.locator('#reader-body img').evaluateAll(images=>images.forEach(img=>img.loading='eager'));
      await page.evaluate(()=>Promise.all([...document.querySelectorAll('#reader-body img')].map(img=>img.decode().catch(()=>{}))));
      const broken=await page.locator('#reader-body img').evaluateAll(images=>images.filter(img=>!img.naturalWidth).map(img=>img.src));
      assert(broken.length===0,`Broken article images ${item.id}: ${broken}`);
      assert(await page.locator('#reader-title').innerText()===item.title,'Wrong article title');
      imageChecks.push({id:item.id,images:await page.locator('#reader-body img').count()});
    }
  }
  const localLinks=[];
  for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))) {
    await go(file.slice(0,-5));
    const urls=await page.locator('[href],[src]').evaluateAll(nodes=>nodes.flatMap(node=>['href','src'].map(a=>node.getAttribute(a)).filter(Boolean)));
    for(const url of urls) {
      if(/^(?:https?:|mailto:|data:|#|javascript:)/i.test(url))continue;
      const clean=decodeURIComponent(url.split(/[?#]/)[0]);
      if(clean&&!fs.existsSync(path.resolve(root,clean)))localLinks.push({file,url});
    }
  }
  await go('game-malware-sweeper');
  await page.locator('#msStart').click();
  assert(await page.locator('#msGrid button').count()===81,'Minesweeper grid failed');
  await page.locator('#msGrid button').first().click();
  assert(await page.locator('#msGrid').innerText()!=='','Minesweeper interaction failed');
  await go('game-code-breaker');
  await page.locator('#cbStart').click();
  assert(await page.locator('#cbGuess').isVisible(),'Code breaker did not start');
  await go('404');
  await page.locator('#nfCmd').fill('flag');await page.locator('#nfCmd').press('Enter');
  assert((await page.locator('#nfOut').innerText()).includes('flag{'),'404 easter egg failed');
  await go('index');
  assert(await page.locator('#field-canvas').count()===0,'Decorative canvas still present');
  assert(await page.locator('.chapter-dock').count()===0,'Floating chapter UI still present');
  assert(await page.locator('body').evaluate(b=>getComputedStyle(b).backgroundColor)==='rgb(20, 22, 23)','Dark theme not applied');
  await page.keyboard.type('holla');
  assert((await page.locator('.toast').innerText()).includes('Holla!'),'Holla easter egg failed');
  const titleFits=[];
  for(const width of [320,390,768,1920]) {
    await page.setViewportSize({width,height:900});await go('index');
    const fits=await page.locator('.personal-intro h1').evaluateAll(spans=>spans.every(span=>{const range=document.createRange();range.selectNodeContents(span);return range.getBoundingClientRect().right<=innerWidth-8;}));
    assert(fits,'Hero clipping at '+width);titleFits.push(width);
  }
  await page.setViewportSize({width:1440,height:1000});
  await go('projects','?project=ChameleonWifi');
  await page.screenshot({path:path.join(root,'verification/desktop-project.png')});
  await go('achievements');
  await page.locator('.archive-item').first().click();
  await page.locator('#image-viewer img').evaluate(img=>img.decode());
  await page.screenshot({path:path.join(root,'verification/desktop-archive-viewer.png')});
  const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const phone=await touch.newPage();
  await phone.goto(pathToFileURL(path.join(root,'index.html')).href);
  assert(await phone.locator('.cursor').evaluate(c=>getComputedStyle(c).display)==='none','Cursor active on touch');
  await phone.goto(pathToFileURL(path.join(root,'game-fps.html')).href);
  assert(await phone.locator('#fpsMobile').isVisible(),'FPS mobile guard missing');
  await browser.close();
  console.log(JSON.stringify({readers:imageChecks.length,articleImages:imageChecks.reduce((n,i)=>n+i.images,0),localLinks,errors,titleFits,games:'Minesweeper and Code Breaker starts checked',touch:'cursor and FPS guard checked'},null,2));
  if(errors.length||localLinks.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
