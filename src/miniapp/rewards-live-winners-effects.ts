export const REWARDS_LIVE_WINNERS_EFFECTS = `
<style id="vexa-rewards-live-winners-effects">
#rewards .rewards-live-winners{
  margin-top:clamp(175px,31dvh,340px)!important;
  padding:0 10px 30px!important;
  position:relative!important;
}
#rewards .home-live-winner-card{
  --rewards-card-progress:0;
  grid-template-columns:42px minmax(0,1fr) auto 34px!important;
  opacity:calc(1 - var(--rewards-card-progress))!important;
  transform:scale(calc(1 - var(--rewards-card-progress) * .018))!important;
  filter:blur(calc(var(--rewards-card-progress) * 3px))!important;
  transform-origin:50% 50%!important;
  will-change:transform,opacity,filter!important;
  transition:opacity .1s linear,transform .1s linear,filter .1s linear!important;
  pointer-events:auto;
}
#rewards .home-live-winner-card:after{
  content:attr(data-rank)!important;
  grid-column:4!important;
  justify-self:end!important;
  align-self:center!important;
  width:30px!important;
  height:30px!important;
  display:grid!important;
  place-items:center!important;
  border-radius:11px!important;
  color:rgba(255,255,255,.88)!important;
  font-size:10px!important;
  line-height:1!important;
  font-weight:850!important;
  font-variant-numeric:tabular-nums!important;
  letter-spacing:.04em!important;
  background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.035))!important;
  border:1px solid rgba(255,255,255,.13)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 -1px 0 rgba(255,255,255,.035),0 8px 18px rgba(0,0,0,.18)!important;
  backdrop-filter:blur(8px) saturate(1.12)!important;
  -webkit-backdrop-filter:blur(8px) saturate(1.12)!important;
  text-shadow:0 1px 8px rgba(0,0,0,.48)!important;
  box-sizing:border-box!important;
}
#rewards .home-live-winner-card:nth-child(-n+3):after{
  color:#fff!important;
  background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(92,10,35,.18))!important;
  border-color:rgba(255,255,255,.19)!important;
}
#rewards .home-live-winner-card[data-rewards-hidden="1"]{pointer-events:none!important}
@media(max-width:380px){
  #rewards .rewards-live-winners{margin-top:clamp(160px,29dvh,300px)!important}
  #rewards .home-live-winner-card{grid-template-columns:42px minmax(0,1fr) auto 31px!important;gap:8px!important}
  #rewards .home-live-winner-card:after{width:28px!important;height:28px!important;border-radius:10px!important;font-size:9px!important}
}
@media(prefers-reduced-motion:reduce){#rewards .home-live-winner-card{filter:none!important;transform:none!important;transition:none!important}}
</style>
<script id="vexa-rewards-live-winners-scroll-script">
(function(){
  var ticking=false;
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function prepare(cards){
    for(var i=0;i<cards.length;i++){
      cards[i].setAttribute('data-rank',String(i+1).padStart(2,'0'));
    }
  }
  function reset(cards){
    prepare(cards);
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
    prepare(cards);
    if(!rewards.classList.contains('active')){reset(cards);return}
    var y=Math.max(0,rewards.scrollTop||0);
    var cardPitch=74;
    var fadeDistance=44;
    for(var i=0;i<cards.length;i++){
      var start=i*cardPitch;
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