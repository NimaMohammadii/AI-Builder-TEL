export const XP_BAR_EFFECTS_SCRIPT = `
(function(){
  var lastFill = -1;
  var styleId = 'vexa-xp-bar-effects-style';
  function injectStyle(){
    if(document.getElementById(styleId))return;
    var s=document.createElement('style');
    s.id=styleId;
    s.textContent = '#userLine>span:nth-of-type(2){width:128px!important;overflow:visible!important;position:relative!important;isolation:isolate!important}#userLine>span:nth-of-type(2)>span{position:relative!important;overflow:visible!important}.vexa-xp-shard{position:absolute;right:-4px;top:50%;width:5px;height:5px;border-radius:1px;background:rgba(255,255,255,.9);box-shadow:0 0 9px rgba(255,210,226,.65);clip-path:polygon(50% 0,100% 36%,72% 100%,0 76%,18% 18%);pointer-events:none;z-index:5;animation:vexaXpShardOut .72s cubic-bezier(.15,.92,.2,1) forwards}.vexa-xp-flash{position:absolute;right:-10px;top:50%;width:22px;height:22px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.95),rgba(255,190,214,.46) 34%,rgba(255,255,255,0) 72%);filter:blur(.35px);pointer-events:none;z-index:4;animation:vexaXpFlashOut .48s ease forwards}@keyframes vexaXpShardOut{0%{opacity:0;transform:translate(0,-50%) scale(.45) rotate(0)}16%{opacity:1}100%{opacity:0;transform:translate(var(--dx,22px),var(--dy,-16px)) scale(.9) rotate(var(--rot,45deg))}}@keyframes vexaXpFlashOut{0%{opacity:0;transform:translateY(-50%) scale(.3)}22%{opacity:1;transform:translateY(-50%) scale(1.05)}100%{opacity:0;transform:translate(14px,-50%) scale(.22)}}';
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
    var flash=document.createElement('span');
    flash.className='vexa-xp-flash';
    fill.appendChild(flash);
    setTimeout(function(){flash.remove()},520);
    for(var i=0;i<7;i++){
      var p=document.createElement('span');
      p.className='vexa-xp-shard';
      p.style.setProperty('--dx',(14+Math.random()*24)+'px');
      p.style.setProperty('--dy',(-24+Math.random()*38)+'px');
      p.style.setProperty('--rot',(-45+Math.random()*110)+'deg');
      p.style.animationDelay=(i*22)+'ms';
      p.style.opacity=String(.72+Math.random()*.28);
      fill.appendChild(p);
      setTimeout((function(el){return function(){el.remove()}})(p),880);
    }
  }
  function check(){
    injectStyle();
    var info=fillInfo();
    if(!info)return;
    if(lastFill>=0 && info.width>lastFill+.5)burst(info.fill);
    lastFill=info.width;
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