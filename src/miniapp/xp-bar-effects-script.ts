export const XP_BAR_EFFECTS_SCRIPT = `
(function(){
  var lastFill = -1;
  var burstLock = 0;
  var styleId = 'vexa-xp-bar-effects-style';
  function injectStyle(){
    if(document.getElementById(styleId))return;
    var s=document.createElement('style');
    s.id=styleId;
    s.textContent = '#userLine>span:nth-of-type(2){width:128px!important;overflow:visible!important;position:relative!important;isolation:isolate!important}#userLine>span:nth-of-type(2)>span{position:relative!important;overflow:visible!important;transition:width 1.18s cubic-bezier(.12,.78,.14,1)!important;will-change:width,filter!important}#userLine>span:nth-of-type(2)>span.vexa-xp-moving{filter:brightness(1.14) saturate(1.16)!important}.vexa-xp-shard{position:absolute;right:-3px;top:50%;width:3.5px;height:4.5px;border-radius:1px;background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(255,196,220,.66));box-shadow:0 0 7px rgba(255,210,230,.55),inset 0 1px 0 rgba(255,255,255,.72);clip-path:polygon(48% 0,100% 38%,70% 100%,0 74%,18% 18%);pointer-events:none;z-index:6;animation:vexaXpShardOut .78s cubic-bezier(.12,.88,.22,1) forwards;will-change:transform,opacity}.vexa-xp-flash{position:absolute;right:-7px;top:50%;width:15px;height:15px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.9),rgba(255,190,214,.38) 38%,rgba(255,255,255,0) 74%);filter:blur(.25px);pointer-events:none;z-index:5;animation:vexaXpFlashOut .42s ease forwards;will-change:transform,opacity}.vexa-xp-spark{position:absolute;right:-3px;top:50%;width:1.4px;height:9px;border-radius:999px;background:rgba(255,255,255,.84);box-shadow:0 0 6px rgba(255,210,230,.55);pointer-events:none;z-index:7;animation:vexaXpSparkOut .46s ease forwards}@keyframes vexaXpShardOut{0%{opacity:0;transform:translate(0,-50%) scale(.28) rotate(0)}16%{opacity:.95;transform:translate(0,-50%) scale(.82) rotate(6deg)}100%{opacity:0;transform:translate(var(--dx,3px),var(--dy,-22px)) scale(.62) rotate(var(--rot,42deg))}}@keyframes vexaXpFlashOut{0%{opacity:0;transform:translateY(-50%) scale(.25)}20%{opacity:.82;transform:translateY(-50%) scale(.9)}100%{opacity:0;transform:translateY(-50%) scale(.12)}}@keyframes vexaXpSparkOut{0%{opacity:0;transform:translate(0,-50%) scaleY(.28) rotate(var(--rot,0deg))}18%{opacity:.82}100%{opacity:0;transform:translate(var(--dx,2px),var(--dy,-18px)) scaleY(.1) rotate(var(--rot,0deg))}}';
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
    var now=Date.now();
    if(now-burstLock<180)return;
    burstLock=now;
    fill.classList.add('vexa-xp-moving');
    setTimeout(function(){fill.classList.remove('vexa-xp-moving')},1180);
    var flash=document.createElement('span');
    flash.className='vexa-xp-flash';
    fill.appendChild(flash);
    setTimeout(function(){flash.remove()},500);
    for(var i=0;i<7;i++){
      var p=document.createElement('span');
      p.className='vexa-xp-shard';
      p.style.setProperty('--dx',(-2+Math.random()*6)+'px');
      p.style.setProperty('--dy',((i%2===0?-1:1)*(10+Math.random()*22))+'px');
      p.style.setProperty('--rot',(-45+Math.random()*90)+'deg');
      p.style.animationDelay=(i*12)+'ms';
      p.style.opacity=String(.66+Math.random()*.24);
      fill.appendChild(p);
      setTimeout((function(el){return function(){el.remove()}})(p),880);
    }
    for(var j=0;j<3;j++){
      var sp=document.createElement('span');
      sp.className='vexa-xp-spark';
      sp.style.setProperty('--dx',(-1+Math.random()*4)+'px');
      sp.style.setProperty('--dy',((j%2===0?-1:1)*(10+Math.random()*18))+'px');
      sp.style.setProperty('--rot',(-25+Math.random()*50)+'deg');
      sp.style.animationDelay=(j*16)+'ms';
      fill.appendChild(sp);
      setTimeout((function(el){return function(){el.remove()}})(sp),620);
    }
  }
  function check(){
    injectStyle();
    var info=fillInfo();
    if(!info)return;
    var moved=lastFill>=0 && info.width>lastFill+.35;
    lastFill=info.width;
    if(moved)requestAnimationFrame(function(){var latest=fillInfo();if(latest)burst(latest.fill)});
  }
  function init(){
    injectStyle();
    check();
    var line=document.getElementById('userLine');
    if(!line)return;
    try{new MutationObserver(function(){requestAnimationFrame(check)}).observe(line,{childList:true,subtree:true,attributes:true,attributeFilter:['style']})}catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
`;