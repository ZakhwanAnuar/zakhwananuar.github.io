const {chromium}=require('playwright');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const results=[];
  const visit=async file=>{await page.goto(pathToFileURL(path.join(root,file)).href);await page.evaluate(()=>document.fonts.ready);};
  for(const [width,height] of [[1920,910],[1536,730],[1440,900],[1024,768],[768,1024],[390,844],[320,640]]){
    await page.setViewportSize({width,height});await visit('index.html');
    const bounds=await page.evaluate(()=>({feature:document.querySelector('#home-featured').getBoundingClientRect().top,bridge:document.querySelector('.content-transition').getBoundingClientRect().top,scroll:document.documentElement.scrollWidth}));
    assert(bounds.feature>=height,'Featured cards visible before scrolling at '+width);
    assert(bounds.scroll<=width+1,'Horizontal overflow at '+width);
    if(width>960){
      assert(await page.locator('.quick-nav a').count()===8,'Desktop navigation incomplete');
      assert(await page.locator('.quick-nav [aria-current="page"]').innerText()==='Home','Home active state missing');
      assert(!await page.locator('.menu-toggle').isVisible(),'Desktop menu button should be hidden');
    }else{
      await page.locator('.menu-toggle').click();
      assert(await page.locator('#site-menu').evaluate(d=>d.open),'Mobile menu failed');
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false');
      assert(await page.locator('.menu-toggle').getAttribute('aria-expanded')==='false','Mobile menu state failed');
    }
    if(width===1440||width===390)await page.screenshot({path:path.join(root,'verification',width===1440?'navigation-desktop.png':'navigation-mobile.png')});
    await page.locator('.intro-scroll').click();
    await page.waitForTimeout(750);
    assert((await page.locator('#home-featured').boundingBox()).y<height/2,'Explore work link failed');
    results.push({width,height,...bounds});
  }
  await page.setViewportSize({width:1440,height:900});
  for(const [file,label] of [['about.html','About'],['projects.html','Projects'],['writeups.html','Writeups'],['blog.html','Blog'],['achievements.html','Achievements'],['resume.html','Resume'],['contact.html','Contact']]){
    await visit(file);assert(await page.locator('.quick-nav [aria-current="page"]').innerText()===label,'Wrong active navigation: '+file);
  }
  console.log(JSON.stringify({results,errors},null,2));await browser.close();
  if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
