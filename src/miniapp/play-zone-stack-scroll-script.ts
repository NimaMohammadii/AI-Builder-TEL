export const PLAY_ZONE_STACK_SCROLL_SCRIPT = `
(function(){
  function view(){return document.querySelector('#playzone.play-zone-view')||document.getElementById('playzone')}
  function cards(){return Array.prototype.slice.call(document.querySelectorAll('#playzone .game-card-shell[data-game-view]'))}
  function clearInlineScrollEffects(){
    cards().forEach(function(el,index){
      el.style.removeProperty('transform');
      el.style.removeProperty('opacity');
      el.style.setProperty('z-index',String(30+index),'important');
      el.classList.remove('is-stacking');
    });
  }
  function bind(){
    var root=view();
    if(!root||root.__vexaStackScrollBound)return;
    root.__vexaStackScrollBound=true;
    clearInlineScrollEffects();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  setTimeout(bind,120);
  setTimeout(clearInlineScrollEffects,500);
})();
`;
