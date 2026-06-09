export const XP_BAR_EFFECTS_SCRIPT = `
(function(){
  var lastFill = -1;
  var styleId = 'vexa-xp-bar-effects-style';
  function injectStyle(){
    if(document.getElementById(styleId))return;
    var s=document.createElement('style');
    s.id=styleId;
    s.textContent = '#userLine>span:nth-of-type(2){width:128px!important;overflow:visible!important;position:relative!important;isolation:isolate!important}#userLine>span:nth-of-type(2)>span{position:relative!important;overflow:visible!important;transition:width .95s cubic-bezier(.16,.86,.22,1)!important;will-change:width,filter!important}#userLine>span:nth-of-type(2)>span.vexa-xp-moving{filter:brightness(1.22) saturate(1.2)!important}.vexa-xp-shard{position:absolute;right:-5px;top:50%;width:5px;height:5px;border-radius:1.4px;background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(255,190,218,.72));box-shadow:0 0 10px rgba(255,210,230,.72),inset 0 1px 0 rgba(255,255,255,.75);clip-path:polygon(50% 0,100% 34%,72% 100%,0 76%,18% 18%);pointer-events:none;z-index:6;animation:vexaXpShardOut .88s cubic-bezier(.12,.94,.18,1) forwards;will-change:transform,opacity}.vexa-xp-flash{position:absolute;right:-12px;top:50%;width:26px;height:26px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.98),rgba(255,190,214,.54) 34%,rgba(255,255,255,0) 74%);filter:blur(.3px);pointer-events:none;z-index:5;animation:vexaXpFlashOut .62s ease forwards;will-change:transform,opacity}.vexa-xp-spark{position:absolute;right:-6px;top:50%;width:2px;height:13px;border-radius:999px;background:rgba(255,255,255,.92);box-shadow:0 0 8px rgba(255,210,230,.72);pointer-events:none;z-index:7;animation:vexaXpSparkOut .52s ease forwards}@keyframes vexaXpShardOut{0%{opacity:0;transform:translate(0,-50%) scale(.3) rotate(0)}14%{opacity:1;transform:translate(3px,-50%) scale(1) rotate(8deg)}100%{opacity:0;transform:translate(var(--dx,24px),var(--dy,-18px)) scale(.86) rotate(var(--rot,55deg))}}@keyframes vexaXpFlashOut{0%{opacity:0;transform:translateY(-50%) scale(.25)}20%{opacity:1;transform:translateY(-50%) scale(1.12)}100%{opacity:0;transform:translate(18px,-50%) scale(.18)}}@keyframes vexaXpSparkOut{0%{opacity:0;transform:translate(0,-50%) scaleY(.35) rotate(var(--rot,0deg))}18%{opacity:1}100%{opacity:0;transform:translate(var(--dx,18px),var(--dy,-12px)) scaleY(.1) rotate(var(--rot,0deg))}}';
    document.head.appendChild(s);
  }
  function fillInfo(){
    var bar=document.querySelector('#userLine>span:nth-of-type(2)');
    var fill=bar&&bar.querySelector('span');
    if(!bar||!fill)return null;
    var w=parseFloat(String(fill.style.width||'').replace('%',''));
    if(!Number.isFinite(w))w=fill.getBoundingClientRect().width/Math.max(1,bar.getBoundingClientRect().width)*100;
    return {bar:bar,fill:fill,width:Math.max(0,Math.min(100,w))};
  }
  function burst(fill){
    fill.classList.add('vexa-xp-moving');
    setTimeout(function(){fill.classList.remove('vexa-xp-moving')},960);
    var flash=document.createElement('span');
    flash.className='vexa-xp-flash';
    fill.appendChild(flash);
    setTimeout(function(){flash.remove()},680);
    for(var i=0;i<9;i++){
      var p=document.createElement('span');
      p.className='vexa-xp-shard';
      p.style.setProperty('--dx',(16+Math.random()*32)+'px');
      p.style.setProperty('--dy',(-30+Math.random()*48)+'px');
      p.style.setProperty('--rot',(-70+Math.random()*145)+'deg');
      p.style.animationDelay=(i*18)+'ms';
      p.style.opacity=String(.78+Math.random()*.22);
      fill.appendChild(p);
      setTimeout((function(el){return function(){el.remove()}})(p),1120);
    }
    for(var j=0;j<4;j++){
      var sp=document.createElement('span');
      sp.className='vexa-xp-spark';
      sp.style.setProperty('--dx',(10+Math.random()*20)+'px');
      sp.style.setProperty('--dy',(-20+Math.random()*35)+'px');
      sp.style.setProperty('--rot',(-55+Math.random()*110)+'deg');
      sp.style.animationDelay=(j*28)+'ms';
      fill.appendChild(sp);
      setTimeout((function(el){return function(){el.remove()}})(sp),760);
    }
  }
  function check(){
    injectStyle();
    var info=fillInfo();
    if(!info)return;
    var moved=lastFill>=0 && info.width>lastFill+.5;
    lastFill=info.width;
    if(moved)setTimeout(function(){var latest=fillInfo();if(latest)burst(latest.fill)},520);
  }
  function init(){
    injectStyle();
    check();
    var line=document.getElementById('userLine');
    if(!line)return;
    try{new MutationObserver(function(){setTimeout(check,20)}).observe(line,{childList:true,subtree:true,attributes:true,attributeFilter:['style']})}catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
`;