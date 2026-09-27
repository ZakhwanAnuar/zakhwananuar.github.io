(() => {
  'use strict';
  const canvas = document.querySelector('#field-canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d', {alpha:false});
  if (!context) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('#field-toggle');
  let width = 0, height = 0, frame = 0, time = 0, previous = 0;
  let visible = true, paused = reduced.matches;
  let pointer = {x:0,y:0}, target = {x:0,y:0};
  const draw = () => {
    context.fillStyle = '#f2f3ef';context.fillRect(0,0,width,height);
    const mobile = width < 760;
    const centerX = width * (mobile ? .76 : .74) + pointer.x * 26;
    const centerY = height * (mobile ? .39 : .46) + pointer.y * 18;
    const radius = Math.min(width * (mobile ? .65 : .36), height * .6);
    const strands = mobile ? 65 : 115;
    const steps = mobile ? 110 : 160;
    const phase = time * .12 + Math.min(scrollY / height,1) * .9;
    // Nested warped curves form one woven field; pointer and scroll alter its tension.
    for (let line = 0; line < strands; line++) {
      const v = line / strands;
      context.beginPath();
      for (let step = 0; step <= steps; step++) {
        const t = step / steps * Math.PI * 2;
        const weave = Math.sin(t * 3 + phase + v * 3) * .13;
        const r = radius * (.4 + v * .55 + weave);
        const x = centerX + Math.cos(t + v * .68) * r + Math.sin(t * 2 + phase) * radius * .22;
        const y = centerY + Math.sin(t) * r * .83 + Math.cos(t * 3 + v * 2 + phase) * radius * .18;
        if (step === 0) context.moveTo(x,y);else context.lineTo(x,y);
      }
      context.closePath();
      context.strokeStyle = document.body.classList.contains('holla') ? `rgba(100,75,137,${.1 + v*.16})` : `rgba(${line % 5 === 0 ? '68,103,99' : '83,96,55'},${.08 + v*.2})`;
      context.lineWidth = .65;
      context.stroke();
    }
    context.fillStyle = '#8b937f';
    for (let i=0;i<4;i++) {
      const x=width*(.57+i*.12),y=height*(.2+(i%2)*.52);
      context.fillRect(x-4,y,8,.65);context.fillRect(x,y-4,.65,8);
    }
  };
  const animate = timestamp => {
    frame = 0;
    if (!visible || paused || document.hidden) return;
    if (timestamp-previous >= 32) {
      time += Math.min((timestamp-previous)/1000,.05);
      pointer.x += (target.x-pointer.x)*.065;pointer.y += (target.y-pointer.y)*.065;
      previous = timestamp;draw();
    }
    frame = requestAnimationFrame(animate);
  };
  const sync = () => {
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.setAttribute('aria-label',paused ? 'Play field animation' : 'Pause field animation');
    toggle.innerHTML = Site.icon(paused ? 'play' : 'pause');
    if (frame) {cancelAnimationFrame(frame);frame=0;}
    if (visible && !paused && !document.hidden) frame=requestAnimationFrame(animate);
    else draw();
  };
  const resize = () => {
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    const ratio=Math.min(devicePixelRatio || 1,1.7);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    context.setTransform(ratio,0,0,ratio,0,0);draw();
  };
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => {visible=entries[0].isIntersecting;sync();}).observe(canvas);
  canvas.parentElement.addEventListener('pointermove',event => {
    const rect=canvas.getBoundingClientRect();target={x:(event.clientX-rect.left)/width-.5,y:(event.clientY-rect.top)/height-.5};
  },{passive:true});
  canvas.parentElement.addEventListener('pointerleave',()=>target={x:0,y:0});
  toggle.addEventListener('click',()=>{paused=!paused;sync();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('field-change',draw);
  resize();sync();
})();
