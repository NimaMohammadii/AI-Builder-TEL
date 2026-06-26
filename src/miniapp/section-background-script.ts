export const SECTION_BACKGROUND_SCRIPT = `
(function(){
  var aliases={predict:'predictzone','top-players':'topplayers','topplayers':'topplayers'};
  var targetSelectors={
    home:['#home'],
    'home-top-players-card':['#home .home-intro-card','#homeTopPlayersEntry','#home .home-top-players-entry'],
    'home-referral-card':['#home .home-referral-card'],
    'home-deposit-card':['#home [data-action="open-deposit"]','#home .home-deposit-card'],
    'home-withdraw-card':['#home [data-action="open-withdraw"]','#home .home-withdraw-card'],
    connect:['#connect'],
    'connect-bot-card':['#connect .card:first-of-type','#connect .connect-inner-glass'],
    'ai-miniapp':['[data-admin-image-slot="ai-miniapp"]','[data-section-background-target="ai-miniapp"]'],
    'ai-chat':['[data-admin-image-slot="ai-chat"]','[data-section-background-target="ai-chat"]'],
    'ai-tts':['[data-admin-image-slot="ai-tts"]','[data-section-background-target="ai-tts"]'],
    playzone:['#playzone','#playzone .play-zone-stage'],
    predict:['#predictzone','#predict'],
    market:['#market'],
    'predict-zone-card':['#playzone .play-zone-predict-card','#playzone [data-admin-image-slot="predict-zone-card"]','#predictzone .predict-zone-glass-card'],
    'playzone-row-ad-right':['#playzone .playzone-row-ad-right','#playzone [data-playzone-ad="right"]','#playzone [data-play-zone-ad="playzone-row-ad-right"]','#playzone [data-play-zone-ad="playzone-row-ad-2"]'],
    'playzone-row-ad-left':['#playzone .playzone-row-ad-left','#playzone [data-playzone-ad="left"]','#playzone [data-play-zone-ad="playzone-row-ad-left"]','#playzone [data-play-zone-ad="playzone-row-ad-1"]'],
    flow:['#flow'],
    mines:['#mines','#playzone [data-play-zone-card-id="mines"] .game-card'],
    plinko:['#plinko','#playzone [data-play-zone-card-id="plinko"] .game-card'],
    crash:['#crash','#playzone [data-play-zone-card-id="crash"] .game-card'],
    wheel:['#wheel','#playzone [data-play-zone-card-id="wheel"] .game-card'],
    dice:['#dice','#playzone [data-play-zone-card-id="dice"] .game-card'],
    rps:['#rps','#playzone [data-play-zone-card-id="rps"] .game-card'],
    slot:['#slot','#playzone [data-play-zone-card-id="slot"] .game-card'],
    tower:['#tower','#playzone [data-play-zone-card-id="tower"] .game-card'],
    coinflip:['#coinflip','#playzone [data-play-zone-card-id="coinflip"] .game-card'],
    hilo:['#hilo','#playzone [data-play-zone-card-id="hilo"] .game-card'],
    ghostrun:['#ghostrun .ghost-run-scene','#ghostrun .ghost-run-background-panel','#ghostrun','#playzone [data-play-zone-card-id="ghostrun"] .game-card'],
    'wheel-separator':['#wheel .wheel-separator','[data-section-background-target="wheel-separator"]'],
    'global-loading':['[data-section-background-target="global-loading"]']
  };
  function cssUrl(url){return 'url("'+String(url).replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'")'}
  function add(list,el){if(el&&list.indexOf(el)<0)list.push(el)}
  function targets(id){
    var list=[];
    (targetSelectors[id]||[]).forEach(function(selector){try{Array.prototype.forEach.call(document.querySelectorAll(selector),function(el){add(list,el)})}catch(e){}});
    add(list,document.getElementById(id));
    add(list,document.getElementById(aliases[id]||''));
    try{Array.prototype.forEach.call(document.querySelectorAll('[data-section-background-target="'+String(id).replace(/"/g,'\\"')+'"]'),function(el){add(list,el)})}catch(e){}
    return list;
  }
  function clearTarget(el){el.classList.remove('has-admin-background');el.style.removeProperty('--admin-section-background-image')}
  function applyTarget(el,url){el.classList.add('has-admin-background');el.style.setProperty('--admin-section-background-image',cssUrl(url))}
  function apply(sections){
    if(!Array.isArray(sections))return;
    sections.forEach(function(section){
      if(!section||!section.id)return;
      var found=targets(section.id);
      if(!found.length)return;
      found.forEach(function(el){if(section.backgroundUrl)applyTarget(el,section.backgroundUrl);else clearTarget(el)});
    });
  }
  function load(){
    fetch('/app/api/section-backgrounds',{credentials:'same-origin',cache:'no-store'})
      .then(function(r){return r.ok?r.json():null})
      .then(function(j){if(j)apply(j.sections)})
      .catch(function(){});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
})();
`;

export const SECTION_BACKGROUND_STYLES = `
.has-admin-background {
  background-image: var(--admin-section-background-image) !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
.view.has-admin-background {
  background-color: #000 !important;
}
.view.has-admin-background::before {
  content: "";
  position: sticky;
  top: 0;
  display: block;
  width: 100%;
  height: 0;
  pointer-events: none;
  z-index: 0;
}
.view.has-admin-background > * {
  position: relative;
  z-index: 1;
}
.game-card.has-admin-background,
.home-finance-card.has-admin-background,
.home-intro-card.has-admin-background,
.predict-zone-card.has-admin-background,
.play-zone-predict-card.has-admin-background,
.play-zone-predict-image-slot.has-admin-background,
.play-zone-stage.has-admin-background,
.ghost-run-scene.has-admin-background,
.ghost-run-background-panel.has-admin-background {
  background-image: var(--admin-section-background-image) !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
`;
