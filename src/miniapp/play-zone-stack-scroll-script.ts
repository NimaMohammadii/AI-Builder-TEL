export const PLAY_ZONE_STACK_SCROLL_SCRIPT = `
(function(){
  var ticking=false;
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function cards(){return Array.prototype.slice.call(document.querySelectorAll('#playzone .game-card-shell[data-game-view]'))}
  function view(){return document.querySelector('#playzone.play-zone-view')||document.getElementById('playzone')}
  function clear(el,index){
    el.style.removeProperty('transform');
    el.style.removeProperty('opacity');
    el.style.setProperty('z-index',String(30+index),'important');
    el.classList.remove('is-stacking');
  }
  function apply(){
    ticking=false;
    var root=view();
    if(!root||!root.classList.contains('active'))return;
    var top=root.getBoundingClientRect().top+4;
    var list=cards();
    for(var i=0;i<list.length;i++){
      var el=list[i];
      var rect=el.getBoundingClientRect();
      var overlap=clamp((top-rect.top)/72,0,1);
      var deep=clamp((top-rect.top)/148,0,1);
      if(overlap<=0){clear(el,i);continue;}
      var scale=1-(deep*.105);
      var y=deep*26;
      var x=deep*6;
      var opacity=1-(deep*.18);
      el.classList.add('is-stacking');
      el.style.setProperty('transform','translate3d('+x+'px,'+y+'px,0) scale('+scale+')','important');
      el.style.setProperty('opacity',String(opacity),'important');
      el.style.setProperty('z-index',String(100-i),'important');
    }
  }
  function request(){if(ticking)return;ticking=true;requestAnimationFrame(apply)}
  function bind(){
    var root=view();
    if(!root||root.__vexaStackScrollBound)return;
    root.__vexaStackScrollBound=true;
    root.addEventListener('scroll',request,{passive:true});
    window.addEventListener('resize',request,{passive:true});
    document.addEventListener('click',function(){setTimeout(request,80);setTimeout(request,240)},true);
    request();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  setTimeout(bind,120);
  setTimeout(bind,500);
})();
`;