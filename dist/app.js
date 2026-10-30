'use strict';
const meta = {
 inventory:{number:'01',categories:['data','ecommerce'],label:'DATA / E-COMMERCE',summary:'Recurring sales and stock reports, reconciled into a clearer operational view.',tags:['Excel','Power BI','Inventory'],evidence:'Experience summary',input:'Typical inputs include sales exports, SKU-level inventory records, and the reporting cadence for shows, drops, and campaigns. Authorized sample files and the precise source mapping are still to be added.',inputLabel:'THE INPUTS TO DOCUMENT',outputTitle:'A clearer operational view.'},
 sku:{number:'02',categories:['automation','ecommerce'],label:'AUTOMATION / E-COMMERCE',summary:'A Python notebook designed to extract Excel product images and name them by SKU.',tags:['Python','Excel','Colab'],evidence:'Notebook inspected',input:'The existing notebook accepts an XLSX workbook. It uses SKUs in column A and images in column B of the active or configured worksheet. The source includes code paths for both modern in-cell images and traditional floating images.',inputLabel:'FROM THE INSPECTED NOTEBOOK',outputTitle:'SKU-named image files, in a ZIP.'},
 reporting:{number:'03',categories:['data','automation'],label:'DATA / AUTOMATION',summary:'Bringing Excel reporting into Power BI through repeatable transformations and refreshes.',tags:['Power Query','Power BI','Dataflows'],evidence:'Experience summary',input:'Excel source data, transformation rules, and a Power BI reporting requirement form the basis of this experience summary. A sanitized source model, refresh configuration, and actual process diagram are still needed.',inputLabel:'THE INPUTS TO DOCUMENT',outputTitle:'A repeatable reporting routine.'},
 compression:{number:'04',categories:['automation','ecommerce'],label:'AUTOMATION / E-COMMERCE',summary:'A Python workflow for resizing and optimizing images embedded in Excel workbooks.',tags:['Python','Pillow','Excel'],evidence:'Notebook inspected',input:'An XLSX workbook containing PNG or JPEG images under xl/media. In the inspected source, the default maximum image dimension is 1,280 pixels and JPEG quality is 40. The workflow writes a separate output workbook.',inputLabel:'FROM THE INSPECTED NOTEBOOK',outputTitle:'A separate workbook, prepared for sharing.'}
};
const projectIds = Object.keys(projects);
const byId = id => document.getElementById(id);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled = !reducedMotion.matches;
let currentPanel = 'overview';
let currentFilter = 'all';
let selectedProjectId = null;
let currentWalk = 0;
let activeStage = 0;
const projectDialog = byId('project-dialog');
const contactDialog = byId('contact-dialog');
const creditsDialog = byId('credits-dialog');
const panelNames = ['overview','projects','process','about'];

function setMainPanel(name, {updateRoute=false, scroll=true, focus=false}={}) {
 if(!panelNames.includes(name)) name='overview';
 currentPanel=name;
 panelNames.forEach(item=>{
  const active=item===name;
  byId('panel-'+item).hidden=!active;
  byId('tab-'+item).setAttribute('aria-selected',String(active));
  byId('tab-'+item).tabIndex=active?0:-1;
 });
 if(updateRoute && location.hash!=='#'+name) history.pushState(null,'','#'+name);
 if(scroll) window.scrollTo({top:0,behavior:'instant'});
 if(focus) byId('tab-'+name).focus({preventScroll:true});
 if(name==='process') updateScrollEffects();
 refreshOrb();
}
function routeFromHash() {
 const [name,projectId]=location.hash.slice(1).split('/');
 setMainPanel(panelNames.includes(name)?name:'overview',{scroll:false});
 if(name==='projects' && projects[projectId]) openProject(projectId,false);
 else if(projectDialog.open) projectDialog.close();
}
function keyboardTabs(container,selector,activate) {
 container.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  const tabs=[...container.querySelectorAll(selector)];
  const index=tabs.indexOf(event.target);
  if(index<0)return;
  event.preventDefault();
  let next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  activate(tabs[next]);tabs[next].focus({preventScroll:true});
 });
}
document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>setMainPanel(button.dataset.tab,{updateRoute:true})));
keyboardTabs(document.querySelector('.main-tabs'),'[role=tab]',button=>setMainPanel(button.dataset.tab,{updateRoute:true}));
document.querySelectorAll('[data-navigate]').forEach(button=>button.addEventListener('click',()=>{
 if(button.dataset.navigate==='projects'){currentFilter='all';byId('project-search').value='';filterProjects();}
 setMainPanel(button.dataset.navigate,{updateRoute:true,focus:true});
}));
window.addEventListener('hashchange',routeFromHash);
window.addEventListener('popstate',routeFromHash);
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
 const target=link.getAttribute('href').slice(1);
 if(panelNames.includes(target)){event.preventDefault();setMainPanel(target,{updateRoute:true,focus:true});}
}));

const dashboardMarkup = document.querySelector('.featured-visual.visual-inventory').innerHTML;
const codeMarkup = document.querySelector('.featured-visual.visual-code').innerHTML;
const pipelineMarkup = '<span class="visual-tag">ILLUSTRATIVE PROCESS</span><div class="pipeline-visual"><div class="pipeline-node"><i><svg class="icon icon-table" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M4 14h16M10 9v11"/></svg></i><span>Source files</span></div><span class="pipeline-link"><svg class="icon icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12h15m-6-6 6 6-6 6"/></svg></span><div class="pipeline-node"><i><svg class="icon icon-exchange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4"/></svg></i><span>Transform</span></div><span class="pipeline-link"><svg class="icon icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12h15m-6-6 6 6-6 6"/></svg></span><div class="pipeline-node"><i><svg class="icon icon-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 20h16M7 16v-5m5 5V4m5 12V8"/></svg></i><span>Report</span></div></div>';
const compressionMarkup = '<span class="visual-tag">ILLUSTRATIVE WORKFLOW</span><div class="compression-visual"><div class="file-art"><span>XLSX</span><div><i></i><i></i><i></i><i></i></div><strong>Image-heavy<br>workbook</strong></div><div class="compress-arrow"><span><svg class="icon icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12h15m-6-6 6 6-6 6"/></svg></span></div><div class="file-art after"><span>XLSX</span><div><i></i><i></i><i></i><i></i></div><strong>Prepared<br>for sharing</strong></div></div>';
const projectVisuals={inventory:dashboardMarkup,sku:codeMarkup,reporting:pipelineMarkup,compression:compressionMarkup};
byId('project-grid').innerHTML=projectIds.map(id=>{
 const p=projects[id],m=meta[id];
 return `<article class="project-card" data-project-card="${id}" data-categories="${m.categories.join(' ')}"><button class="project-card-top" data-open-project="${id}" aria-label="Open walkthrough: ${p.title}"><div aria-hidden="true">${projectVisuals[id]}</div></button><div class="project-card-body"><div class="project-card-meta"><span>${m.label}</span></div><h2>${p.title}</h2><p>${m.summary}</p><div class="tags">${m.tags.map(tag=>`<span>${tag}</span>`).join('')}</div><div class="project-card-footer"><span class="evidence-status"><i></i>${m.evidence}</span><button class="text-button" data-open-project="${id}" aria-label="View walkthrough: ${p.title}">View walkthrough <span><svg class="icon icon-up-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span></button></div></div></article>`;
}).join('');
function filterProjects() {
 const term=byId('project-search').value.toLowerCase().trim();
 let count=0;
 document.querySelectorAll('[data-project-card]').forEach(card=>{
  const id=card.dataset.projectCard,m=meta[id],p=projects[id];
  const matchesCategory=currentFilter==='all'||m.categories.includes(currentFilter);
  const matchesTerm=[p.title,m.summary,...p.tools,...m.categories].join(' ').toLowerCase().includes(term);
  const visible=matchesCategory&&matchesTerm;
  card.hidden=!visible;if(visible)count++;
 });
 document.querySelectorAll('[data-filter]').forEach(button=>{
  const active=button.dataset.filter===currentFilter;
  button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
 });
 byId('project-count').textContent=`Showing ${count} project${count===1?'':'s'}`;
 byId('project-empty').hidden=count>0;
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{currentFilter=button.dataset.filter;filterProjects();}));
byId('project-search').addEventListener('input',filterProjects);
byId('reset-projects').addEventListener('click',()=>{currentFilter='all';byId('project-search').value='';filterProjects();byId('project-search').focus();});
document.querySelectorAll('[data-category-link]').forEach(button=>button.addEventListener('click',()=>{
 currentFilter=button.dataset.categoryLink;byId('project-search').value='';filterProjects();setMainPanel('projects',{updateRoute:true,focus:true});
}));

function showDialog(dialog) {
 if(!dialog.open)dialog.showModal();
 document.body.classList.add('dialog-open');
}
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{
  document.body.classList.toggle('dialog-open',!!document.querySelector('dialog[open]'));
  if(dialog===projectDialog){
   if(location.hash.startsWith('#projects/'))history.replaceState(null,'','#projects');
   if(!document.querySelector('dialog[open]') && currentPanel==='projects'){document.querySelector('[data-project-card="'+selectedProjectId+'"] .text-button')?.focus({preventScroll:true});}
  }
 });
 dialog.addEventListener('click',event=>{
  const r=dialog.getBoundingClientRect();
  if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();
 });
});
function openProject(id,updateRoute=true) {
 if(!projects[id])return;
 selectedProjectId=id;
 if(document.querySelector('[data-project-card="'+id+'"]').hidden){currentFilter='all';byId('project-search').value='';filterProjects();}
 const p=projects[id],m=meta[id];
 setMainPanel('projects',{scroll:false});
 if(updateRoute)history.pushState(null,'','#projects/'+id);
 byId('project-dialog-heading').innerHTML=`<span class="dialog-project-meta">${m.label} / PROJECT ${m.number}</span><h2 id="project-dialog-title">${p.title}</h2><span class="dialog-project-status">${p.status}</span><p class="dialog-project-intro">${p.intro}</p>`;
 setWalk(0);showDialog(projectDialog);projectDialog.scrollTop=0;
}
document.querySelectorAll('[data-open-project]').forEach(button=>button.addEventListener('click',()=>openProject(button.dataset.openProject)));
function setWalk(index) {
 currentWalk=Math.max(0,Math.min(4,index));
 const p=projects[selectedProjectId],m=meta[selectedProjectId];
 const sections=[
  `<span class="walk-section-label">01 / THE OPERATIONAL CHALLENGE</span><h3>Start with the friction.</h3><p>${p.challenge}</p><p class="walk-note">This walkthrough describes ${m.evidence==='Experience summary'?'an experience-based approach, with supporting artifacts still to add.':'the saved notebook source. Runtime validation and measured impact are separate evidence requirements.'}</p>`,
  `<span class="walk-section-label">02 / ${m.inputLabel}</span><h3>Know what enters the workflow.</h3><p>${m.input}</p><div class="tags">${p.tools.map(tool=>`<span>${tool}</span>`).join('')}</div>`,
  `<span class="walk-section-label">03 / THE WORKFLOW LOGIC</span><h3>Follow the work, step by step.</h3><div class="walk-flow">${p.approach.map((step,i)=>`<div><span>0${i+1}</span><p>${step}</p></div>`).join('')}</div>`,
  `<span class="walk-section-label">04 / WHAT EXISTS TODAY</span><h3>${m.outputTitle}</h3><p>${p.deliverable}</p><p class="walk-note">${p.limit}</p>`,
  `<span class="walk-section-label">05 / SUPPORTING EVIDENCE</span><h3>Proof belongs in the process.</h3><p>The following items are placeholders for evidence that still needs to be added. They are not completed deliverables or measured results.</p><div class="evidence-checklist"><ul>${p.evidence.map(item=>`<li>${item}</li>`).join('')}</ul></div>`
 ];
 byId('walkthrough-content').innerHTML=sections[currentWalk];
 byId('walkthrough-content').setAttribute('aria-labelledby','walk-tab-'+currentWalk);
 document.querySelectorAll('[data-walk]').forEach(button=>{
  const active=Number(button.dataset.walk)===currentWalk;
  button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
 });
 byId('walk-progress').textContent=`0${currentWalk+1} / 05`;
 byId('walk-previous').disabled=currentWalk===0;byId('walk-next').disabled=currentWalk===4;
}
document.querySelectorAll('[data-walk]').forEach(button=>button.addEventListener('click',()=>setWalk(Number(button.dataset.walk))));
keyboardTabs(byId('walkthrough-tabs'),'[role=tab]',button=>setWalk(Number(button.dataset.walk)));
byId('walk-previous').addEventListener('click',()=>setWalk(currentWalk-1));
byId('walk-next').addEventListener('click',()=>setWalk(currentWalk+1));

const stageLabels=['Understand the operation','Build for the actual job','Validate the output','Hand over the workflow'];
const stageButtons=[...document.querySelectorAll('[data-stage]')];
const processCards=[...document.querySelectorAll('[data-process-card]')];
function setStage(index) {
 activeStage=index;
 stageButtons.forEach(button=>{
  const active=Number(button.dataset.stage)===index;
  button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
 });
 processCards.forEach(card=>card.classList.toggle('active',Number(card.dataset.processCard)===index));
 byId('process-status').textContent=`0${index+1} / ${stageLabels[index]}`;
}
document.querySelectorAll('[data-stage]').forEach(button=>button.addEventListener('click',()=>{
 const index=Number(button.dataset.stage);setStage(index);byId('stage-'+index).scrollIntoView({behavior:motionEnabled?'smooth':'instant',block:'center'});
}));
let scrollScheduled=false;
function updateScrollEffects() {
 scrollScheduled=false;
 if(currentPanel!=='process')return;
 let nearest=0,distance=Infinity;
 // Read every card before changing styles, so scrolling does not interleave layout reads and writes.
 const offsets=processCards.map(card=>{
  const r=card.getBoundingClientRect();
  return r.top+r.height/2-window.innerHeight*.55;
 });
 processCards.forEach((card,index)=>{
  const offset=offsets[index];
  if(Math.abs(offset)<distance){distance=Math.abs(offset);nearest=Number(card.dataset.processCard);}
  card.style.setProperty('--drift',motionEnabled?Math.max(-10,Math.min(10,offset*.035))+'px':'0px');
 });
 if(nearest!==activeStage)setStage(nearest);
}
function scheduleScrollEffects(){if(currentPanel==='process'&&!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateScrollEffects);}}
window.addEventListener('scroll',scheduleScrollEffects,{passive:true});
window.addEventListener('resize',scheduleScrollEffects);

function openContact(type) {
 if(projectDialog.open)projectDialog.close();
 if(type)byId('project-type').value=type;
 byId('brief-form').hidden=false;byId('brief-result').hidden=true;byId('copy-status').textContent='';showDialog(contactDialog);
}
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>openContact()));
byId('scope-project').addEventListener('click',()=>openContact(projects[selectedProjectId].type));
byId('credits-button').addEventListener('click',()=>showDialog(creditsDialog));
byId('project-goal').addEventListener('input',()=>byId('project-goal').setCustomValidity(''));
byId('brief-form').addEventListener('submit',event=>{
 event.preventDefault();const goal=byId('project-goal').value.trim();
 if(!goal){byId('project-goal').setCustomValidity('Please describe the workflow you want to improve.');byId('project-goal').reportValidity();return;}
 const type=byId('project-type').value,tools=byId('current-tools').value.trim()||'To discuss';
 byId('brief-output').value=`PROJECT BRIEF\nFor Erick Gómez — Data & Operations\n\nArea: ${type}\nCurrent tools: ${tools}\n\nWhat I would like to improve:\n${goal}\n\nTo define together:\n• Data sources and access\n• Deliverables and validation checks\n• Timeline and success measures\n\nPrepared locally. This brief has not been sent.`;
 byId('brief-form').hidden=true;byId('brief-result').hidden=false;byId('copy-status').textContent='';byId('copy-brief').innerHTML='Copy brief <span><svg class="icon icon-up-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></span>';byId('brief-output').focus();
});
byId('edit-brief').addEventListener('click',()=>{byId('brief-form').hidden=false;byId('brief-result').hidden=true;byId('project-goal').focus();});
byId('copy-brief').addEventListener('click',async()=>{
 const output=byId('brief-output');
 try{if(!navigator.clipboard||!window.isSecureContext)throw new Error('Unavailable');await navigator.clipboard.writeText(output.value);byId('copy-status').textContent='Copied. Ready to share.';byId('copy-brief').innerHTML='Copied <svg class="icon icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 4 4L19 6"/></svg>';}
 catch{output.focus();output.select();byId('copy-status').textContent='Text selected. Use your device’s Copy command.';}
});

// Decorative native canvas: a rotating point sphere, not operational data.
const canvas=byId('data-orb');
const ctx=canvas.getContext('2d');
let orbFrame=0,orbAngle=0,lastDraw=0,orbWidth=0,orbHeight=0;
let orbVisible=!('IntersectionObserver' in window);
const spherePoints=Array.from({length:650},(_,i)=>{const y=1-(i/649)*2;const r=Math.sqrt(1-y*y);const theta=Math.PI*(3-Math.sqrt(5))*i;return{x:Math.cos(theta)*r,y,z:Math.sin(theta)*r};});
// Cache the fixed grid geometry and group strokes by depth instead of stroking every segment.
const orbGrid=[
 {paths:Array.from({length:5},(_,lat)=>{const y=(lat-2)*.28,rr=Math.sqrt(1-y*y);return Array.from({length:101},(_,i)=>{const a=i/100*Math.PI*2;return{x:Math.cos(a)*rr,y,z:Math.sin(a)*rr};});}),base:.045,range:.045},
 {paths:Array.from({length:5},(_,mer)=>{const a=mer/5*Math.PI;return Array.from({length:101},(_,i)=>{const t=i/100*Math.PI*2;return{x:Math.cos(t)*Math.cos(a),y:Math.sin(t),z:Math.cos(t)*Math.sin(a)};});}),base:.035,range:.035}
].map(group=>({...group,buckets:Array.from({length:8},()=>[]),styles:Array.from({length:8},(_,i)=>`rgba(139,193,151,${group.base+(i+.5)/4*group.range})`)}));
function drawOrb() {
 if(!ctx||!orbWidth||!orbHeight)return;
 const w=orbWidth,h=orbHeight,r=Math.min(w,h)*.335,cx=w*.5,cy=h*.5;
 ctx.clearRect(0,0,w,h);
 const cos=Math.cos(orbAngle),sin=Math.sin(orbAngle);
 function project(x,y,z){const rx=x*cos+z*sin,rz=-x*sin+z*cos;const ry=y*.95-rz*.22;const depth=y*.22+rz*.95;const scale=1+depth*.12;return{x:cx+rx*r*scale,y:cy+ry*r*scale,z:depth};}
 ctx.lineWidth=.65;
 orbGrid.forEach(group=>{
  group.buckets.forEach(bucket=>{bucket.length=0;});
  group.paths.forEach(path=>{
   let last=null;
   path.forEach(point=>{
    const p=project(point.x,point.y,point.z);
    if(last)group.buckets[Math.max(0,Math.min(7,Math.floor((p.z+1)*4)))].push(last.x,last.y,p.x,p.y);
    last=p;
   });
  });
  group.buckets.forEach((segments,index)=>{
   if(!segments.length)return;
   ctx.strokeStyle=group.styles[index];ctx.beginPath();
   for(let i=0;i<segments.length;i+=4){ctx.moveTo(segments[i],segments[i+1]);ctx.lineTo(segments[i+2],segments[i+3]);}
   ctx.stroke();
  });
 });
 spherePoints.map(p=>project(p.x,p.y,p.z)).sort((a,b)=>a.z-b.z).forEach((p,i)=>{
  const bright=(p.z+1)*.5;ctx.fillStyle=`rgba(${130+Math.round(bright*60)},${172+Math.round(bright*55)},${142+Math.round(bright*52)},${.1+bright*.65})`;ctx.beginPath();ctx.arc(p.x,p.y,.35+bright*.85,0,Math.PI*2);ctx.fill();
  if(i%97===0&&p.z>.1){ctx.strokeStyle='rgba(169,225,180,.2)';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(p.x,p.y,3.5,0,Math.PI*2);ctx.stroke();}
 });
 ctx.strokeStyle='rgba(133,195,149,.08)';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(cx,cy,r*1.26,r*.32,-.35,0,Math.PI*2);ctx.stroke();
}
function orbIsActive(){return ctx&&orbVisible&&currentPanel==='overview'&&!document.hidden;}
function animateOrb(time){orbFrame=0;if(!orbIsActive()||!motionEnabled)return;if(time-lastDraw>33){orbAngle+=.0017;drawOrb();lastDraw=time;}orbFrame=requestAnimationFrame(animateOrb);}
function refreshOrb(){if(orbFrame)cancelAnimationFrame(orbFrame);orbFrame=0;if(orbIsActive()){drawOrb();if(motionEnabled)orbFrame=requestAnimationFrame(animateOrb);}}
function resizeOrb(){const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const ratio=Math.min(window.devicePixelRatio||1,2);const width=Math.round(rect.width*ratio),height=Math.round(rect.height*ratio);if(orbWidth===rect.width&&orbHeight===rect.height&&canvas.width===width&&canvas.height===height)return;orbWidth=rect.width;orbHeight=rect.height;canvas.width=width;canvas.height=height;if(ctx)ctx.setTransform(ratio,0,0,ratio,0,0);if(orbIsActive())drawOrb();}
new ResizeObserver(resizeOrb).observe(canvas);
if('IntersectionObserver' in window){
 const effectsObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.target===canvas){orbVisible=entry.isIntersecting;refreshOrb();}
  else entry.target.classList.toggle('effects-out-of-view',!entry.isIntersecting);
 }));
 effectsObserver.observe(canvas);
 document.querySelectorAll('.hero-art,.tools-band,.teaser-orb,.footer-contact').forEach(element=>effectsObserver.observe(element));
}
function updatePageVisibility(){document.body.classList.toggle('page-inactive',document.hidden);refreshOrb();}
document.addEventListener('visibilitychange',updatePageVisibility);
function applyMotion(){document.body.classList.toggle('motion-paused',!motionEnabled);const button=byId('motion-toggle');button.setAttribute('aria-pressed',String(motionEnabled));button.setAttribute('aria-label',motionEnabled?'Pause visual effects':'Enable visual effects');button.innerHTML=`<span aria-hidden="true">${motionEnabled?'<svg class="icon icon-pause" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 5v14M15 5v14"/></svg>':'<svg class="icon icon-play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 5 11 7-11 7Z"/></svg>'}</span><span class="motion-label">Motion ${motionEnabled?'on':'off'}</span>`;refreshOrb();updateScrollEffects();}
byId('motion-toggle').addEventListener('click',()=>{motionEnabled=!motionEnabled;applyMotion();});
reducedMotion.addEventListener('change',event=>{motionEnabled=!event.matches;applyMotion();});
routeFromHash();resizeOrb();applyMotion();updatePageVisibility();
