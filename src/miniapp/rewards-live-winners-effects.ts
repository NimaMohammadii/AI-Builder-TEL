export const REWARDS_LIVE_WINNERS_EFFECTS = `
<style id="vexa-rewards-live-winners-effects">
#rewards .rewards-live-winners{
  margin-top:clamp(175px,31dvh,340px)!important;
  padding:0 10px 30px!important;
  position:relative!important;
}
#rewards .home-live-winner-card{
  --rewards-card-progress:0;
  min-height:0!important;
  height:calc(64px * (1 - var(--rewards-card-progress)))!important;
  padding-top:calc(11px * (1 - var(--rewards-card-progress)))!important;
  padding-bottom:calc(11px * (1 - var(--rewards-card-progress)))!important;
  margin-bottom:calc(-10px * var(--rewards-card-progress))!important;
  opacity:calc(1 - var(--rewards-card-progress))!important;
  transform:scale(calc(1 - var(--rewards-card-progress) * .018))!important;
  filter:blur(calc(var(--rewards-card-progress) * 3px))!important;
  transform-origin:50% 0!important;
  overflow:hidden!important;
  will-change:height,padding,margin,transform,opacity,filter!important;
  transition:opacity .08s linear,transform .08s linear,filter .08s linear,height .08s linear,padding .08s linear,margin .08s linear!important;
  pointer-events:auto;
}
#rewards .home-live-winner-card[data-rewards-hidden="1"]{pointer-events:none!important}
@media(max-width:380px){#rewards .rewards-live-winners{margin-top:clamp(160px,29dvh,300px)!important}}
@media(prefers-reduced-motion:reduce){#rewards .home-live-winner-card{filter:none!important;transform:none!important;transition:none!important}}
</style>
<script id="vexa-rewards-live-winners-scroll-script">
(function(){
  var ticking=false;
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function reset(cards){
    for(var i=0;i<cards.length;i++){
      cards[i].style.setProperty('--rewards-card-progress','0');
      cards[i].setAttribute('data-rewards-hidden','0');
    }
  }
  function apply(){
    ticking=false;
    var rewards=document.getElementById('rewards');
    if(!rewards)return;
    var cards=rewards.querySelectorAll('.home-live-winner-card');
    if(!rewards.classList.contains('active')){reset(cards);return}
    var y=Math.max(0,rewards.scrollTop||0);
    var step=44;
    var fadeDistance=48;
    for(var i=0;i<cards.length;i++){
      var start=i*step;
      var p=clamp((y-start)/fadeDistance,0,1);
      cards[i].style.setProperty('--rewards-card-progress',String(p));
      cards[i].setAttribute('data-rewards-hidden',p>.98?'1':'0');
    }
  }
  function queue(){if(ticking)return;ticking=true;requestAnimationFrame(apply)}
  function bind(){
    var rewards=document.getElementById('rewards');
    if(!rewards)return;
    var cards=rewards.querySelectorAll('.home-live-winner-card');
    reset(cards);
    if(rewards.dataset.winnersScrollBound==='1'){queue();return}
    rewards.dataset.winnersScrollBound='1';
    rewards.addEventListener('scroll',queue,{passive:true});
    window.addEventListener('resize',queue,{passive:true});
    queue();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  document.addEventListener('click',function(ev){
    var target=ev.target&&ev.target.closest&&ev.target.closest('[data-view="rewards"]');
    if(target)setTimeout(bind,60);
  },true);
  window.addEventListener('vexa:section-mounted',bind);
})();
</script>`;