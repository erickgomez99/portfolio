'use strict';

// No dependencies: run with `node tests/motion.test.js` from the repository root.
// JavaScriptCore's command-line runner is also supported.
const readSource=path=>typeof readFile==='function'?readFile(path):require('node:fs').readFileSync(path,'utf8');
const report=typeof print==='function'?print:console.log;
const source=readSource('dist/app.js');
new Function(source);
new Function(readSource('dist/projects-data.js'));
const orbSource=source.slice(source.indexOf('// Decorative native canvas:'));
function assert(condition,message){if(!condition)throw new Error(message);}

function setup({observer=true,context=true,reduced=false}={}){
 const frames=new Map(),events={},controls={};
 const metrics={draws:0,strokes:0,segments:0,dots:0,resizes:0};
 const classes=()=>({values:new Set(),toggle(name,on){if(on)this.values.add(name);else this.values.delete(name);},contains(name){return this.values.has(name);}});
 const ctx={
  clearRect(){metrics.draws++;},stroke(){metrics.strokes++;},lineTo(){metrics.segments++;},
  arc(){metrics.dots++;},beginPath(){},fill(){},setTransform(){},ellipse(){},
  moveTo(x,y){assert(Number.isFinite(x)&&Number.isFinite(y),'Canvas coordinates must be finite');}
 };
 let width=0,height=0,rect={width:480,height:480};
 const canvas={getContext:()=>context?ctx:null,getBoundingClientRect:()=>rect,
  get width(){return width;},set width(value){width=value;metrics.resizes++;},
  get height(){return height;},set height(value){height=value;metrics.resizes++;}
 };
 const button={setAttribute(){},addEventListener(name,callback){controls[name]=callback;}};
 const decorations=Array.from({length:4},()=>({classList:classes()}));
 const document={hidden:false,body:{classList:classes()},addEventListener(name,callback){events[name]=callback;},querySelectorAll:()=>decorations};
 const reducedMotion={matches:reduced,addEventListener(name,callback){events.motion=callback;}};
 let frameId=0,intersection,resize;
 const IntersectionObserver=function(callback){intersection=callback;this.observe=()=>{};};
 const ResizeObserver=function(callback){resize=callback;this.observe=()=>{};};
 const window={devicePixelRatio:3};
 if(observer)window.IntersectionObserver=IntersectionObserver;
 const env={window,document,reducedMotion,IntersectionObserver,ResizeObserver,
  byId:id=>id==='data-orb'?canvas:button,
  requestAnimationFrame:callback=>{frames.set(++frameId,callback);return frameId;},
  cancelAnimationFrame:id=>frames.delete(id)
 };
 const api=new Function('env',`
  const {window,document,reducedMotion,IntersectionObserver,ResizeObserver,byId,requestAnimationFrame,cancelAnimationFrame}=env;
  let motionEnabled=!reducedMotion.matches,currentPanel='overview';
  function routeFromHash(){} function updateScrollEffects(){}
  ${orbSource}
  return {drawOrb,refreshOrb,resizeOrb,setPanel(name){currentPanel=name;refreshOrb();}};
 `)(env);
 return {api,metrics,frames,events,controls,canvas,decorations,document,
  intersect(visible){intersection([{target:canvas,isIntersecting:visible}]);},
  decorate(visible){intersection(decorations.map(target=>({target,isIntersecting:visible})));},
  resize(nextRect){rect=nextRect;resize();},
  tick(time){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback(time));}
 };
}

const app=setup();
assert(app.metrics.draws===0&&app.frames.size===0,'An unobserved canvas must stay idle');
app.intersect(true);
assert(app.frames.size===1,'A visible canvas should start one animation loop');
const before={...app.metrics};
app.api.drawOrb();
assert(app.metrics.segments-before.segments===1000,'Preserve all sphere grid segments');
assert(app.metrics.dots-before.dots>=650,'Preserve the sphere dots and highlights');
assert(app.metrics.strokes-before.strokes<=24,'Batch the grid into at most 24 canvas strokes, including highlights');
app.tick(16);
const draws=app.metrics.draws;
app.tick(40);
assert(app.metrics.draws===draws+1&&app.frames.size===1,'Throttle drawing while retaining one frame callback');
const resizes=app.metrics.resizes;
app.resize({width:480,height:480});
assert(app.metrics.resizes===resizes,'Unchanged size must not reset the canvas buffer');
assert(app.canvas.width===960,'Cap canvas pixel density at 2');
app.resize({width:360,height:300});
assert(app.canvas.width===720&&app.canvas.height===600,'Resize the canvas for changed dimensions');
app.intersect(false);
const offscreenDraws=app.metrics.draws;
app.tick(80);
assert(app.frames.size===0&&app.metrics.draws===offscreenDraws,'Offscreen canvas must stop drawing and scheduling frames');
app.intersect(true);
app.document.hidden=true;app.events.visibilitychange();
assert(app.frames.size===0&&app.document.body.classList.contains('page-inactive'),'Background tabs must pause canvas and CSS animations');
app.document.hidden=false;app.events.visibilitychange();
assert(app.frames.size===1&&!app.document.body.classList.contains('page-inactive'),'Returning to the tab should resume animation');
app.api.refreshOrb();app.api.refreshOrb();
assert(app.frames.size===1,'Refreshing repeatedly must not create duplicate loops');
app.api.setPanel('projects');
assert(app.frames.size===0,'Other portfolio panels must stop the sphere');
app.api.setPanel('overview');
assert(app.frames.size===1,'Returning to Overview should resume the visible sphere');
app.controls.click();
assert(app.frames.size===0&&app.document.body.classList.contains('motion-paused'),'Motion controls must stop the animation');
app.controls.click();
assert(app.frames.size===1,'Motion controls must resume the animation');
app.events.motion({matches:true});
assert(app.frames.size===0,'System reduced motion must stop the animation');
app.decorate(false);
assert(app.decorations.every(element=>element.classList.contains('effects-out-of-view')),'Offscreen CSS decorations should pause');
app.decorate(true);
assert(app.decorations.every(element=>!element.classList.contains('effects-out-of-view')),'Visible CSS decorations should resume');
const fallback=setup({observer:false});
assert(fallback.metrics.draws>0&&fallback.frames.size===1,'Keep animation functional without IntersectionObserver');
const unsupported=setup({observer:false,context:false});
assert(unsupported.frames.size===0,'An unavailable canvas context must not schedule animation');
const staticSphere=setup({reduced:true});staticSphere.intersect(true);
assert(staticSphere.metrics.draws===1&&staticSphere.frames.size===0,'Reduced motion should show a static sphere');

const processSource=source.slice(source.indexOf('const stageLabels='),source.indexOf('function openContact('));
const operations=[],processEvents={},processFrames=[],status={};
const cards=Array.from({length:4},(_,index)=>({
 dataset:{processCard:String(index)},classList:{toggle(){}},
 getBoundingClientRect(){operations.push('read');return{top:index*500-300,height:400};},
 style:{setProperty(name,value){operations.push('write');this.drift=value;}}
}));
const processWindow={innerHeight:1000,addEventListener(name,callback){processEvents[name]=callback;}};
const processApi=new Function('env',`
 const {window,document,byId,requestAnimationFrame}=env;
 let currentPanel='process',motionEnabled=true,activeStage=0;
 ${processSource}
 return {setPanel(name){currentPanel=name;},pauseMotion(){motionEnabled=false;updateScrollEffects();}};
`)({
 window:processWindow,document:{querySelectorAll:selector=>selector==='[data-process-card]'?cards:[]},
 byId:()=>status,requestAnimationFrame:callback=>processFrames.push(callback)
});
processEvents.scroll();processEvents.scroll();processEvents.resize();
assert(processFrames.length===1,'Coalesce scroll and resize events into one frame');
processFrames.shift()();
assert(operations.join(',')==='read,read,read,read,write,write,write,write','Read all card positions before writing styles');
assert(status.textContent.startsWith('02 /'),'Select the stage nearest the viewport center');
processWindow.innerHeight=2000;processEvents.resize();processFrames.shift()();
assert(status.textContent.startsWith('03 /'),'Re-evaluate the active stage when the viewport resizes');
processApi.pauseMotion();
assert(cards.every(card=>card.style.drift==='0px'),'Disable card drift when motion is paused');
processApi.setPanel('overview');processEvents.scroll();
assert(processFrames.length===0,'Other panels must not schedule process scrolling work');
report('PASS: script syntax, draw budget, animation lifecycle, resizing, motion controls, fallbacks, and process scrolling.');
