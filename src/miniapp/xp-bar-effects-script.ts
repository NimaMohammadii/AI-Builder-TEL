export const XP_BAR_EFFECTS_SCRIPT = `
(function(){
  var lastFill = -1;
  var burstLock = 0;
  var styleId = 'vexa-xp-bar-effects-style';
  function injectStyle(){
    if(document.getElementById(styleId))return;
    var s=document.createElement('style');
    s.id=styleId;
    s.textContent = '#userLine>span:nth-of-type(2){width:128px!important;overflow:visible!important;position:relative!important;isolation:isolate!important}#userLine>span:nth-of-type(2)>span{position:relative!important;overflow:visible!important;transition:width 1.35s cubic-bezier(.08,.78,.12,1)!important;will-change:width!important;transform:translateZ(0)!important}.vexa-xp-shard{position:absolute;right:-3px;top:50%;width:3px;height:4px;border-radius:1px;background:rgba(255,255,255,.86);clip-path:polygon(48% 0,100% 38%,70% 100%,0 74%,18% 18%);pointer-events:none;z-index:6;animation:vexaXpShardOut .68s cubic-bezier(.12,.88,.22,1) forwards;will-change:transform,opacity}.vexa-xp-flash{position:absolute;right:-6px;top:50%;width:11px;height:11px;border-radius:999px;background:rgba(255,255,255,.28);pointer-events:none;z-index:5;animation:vexaXpFlashOut .28s ease forwards;will-change:transform,opacity}.vexa-xp-spark{position:absolute;right:-3px;top:50%;width:1px;height:7px;border-radius:999px;background:rgba(255,255,255,.72);pointer-events:none;z-index:7;animation:vexaXpSparkOut .36s ease forwards}@keyframes vexaXpShardOut{0%{opacity:0;transform:translate(0,-50%) scale(.25) rotate(0)}18%{opacity:.78;transform:translate(0,-50%) scale(.72) rotate(6deg)}100%{opacity:0;transform:translate(var(--dx,2px),var(--dy,-18px)) scale(.55) rotate(var(--rot,38deg))}}@keyframes vexaXpFlashOut{0%{opacity:0;transform:translateY(-50%) scale(.22)}20%{opacity:.42;transform:translateY(-50%) scale(.65)}100%{opacity:0;transform:translateY(-50%) scale(.1)}}@keyframes vexaXpSparkOut{0%{opacity:0;transform:translate(0,-50%) scaleY(.25) rotate(var(--rot,0deg))}18%{opacity:.62}100%{opacity:0;transform:translate(var(--dx,1px),var(--dy,-14px)) scaleY(.08) rotate(var(--rot,0deg))}}';
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
    if(now-burstLock<160)return;
    burstLock=now;
    var flash=document.createElement('span');
    flash.className='vexa-xp-flash';
    fill.appendChild(flash);
    setTimeout(function(){flash.remove()},360);
    for(var i=0;i<6;i++){
      var p=document.createElement('span');
      p.className='vexa-xp-shard';
      p.style.setProperty('--dx',(-1+Math.random()*4)+'px');
      p.style.setProperty('--dy',((i%2===0?-1:1)*(8+Math.random()*18))+'px');
      p.style.setProperty('--rot',(-35+Math.random()*70)+'deg');
      p.style.animationDelay=(i*10)+'ms';
      p.style.opacity=String(.58+Math.random()*.20);
      fill.appendChild(p);
      setTimeout((function(el){return function(){el.remove()}})(p),760);
    }
    for(var j=0;j<2;j++){
      var sp=document.createElement('span');
      sp.className='vexa-xp-spark';
      sp.style.setProperty('--dx',(-1+Math.random()*3)+'px');
      sp.style.setProperty('--dy',((j%2===0?-1:1)*(8+Math.random()*14))+'px');
      sp.style.setProperty('--rot',(-18+Math.random()*36)+'deg');
      sp.style.animationDelay=(j*14)+'ms';
      fill.appendChild(sp);
      setTimeout((function(el){return function(){el.remove()}})(sp),520);
    }
  }
  function animateFill(info,target){
    var fill=info.fill;
    var from=Math.max(0,Math.min(100,lastFill));
    var to=Math.max(0,Math.min(100,target));
    if(from<0||Math.abs(to-from)<.15){lastFill=to;return false}
    fill.style.transition='none';
    fill.style.width=from+'%';
    fill.offsetHeight;
    requestAnimationFrame(function(){
      fill.style.transition='width 1.35s cubic-bezier(.08,.78,.12,1)';
      fill.style.width=to+'%';
    });
    lastFill=to;
    return to>from+.35;
  }
  function check(){
    injectStyle();
    var info=fillInfo();
    if(!info)return;
    var target=info.width;
    if(lastFill<0){lastFill=target;return}
    var moved=animateFill(info,target);
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