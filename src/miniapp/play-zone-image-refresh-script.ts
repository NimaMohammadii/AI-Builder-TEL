export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','limbo','tower','coinflip','hilo'];
  var ads=games.map(function(id){return 'playzone-card-ad-'+id});
  var legacyAds=['playzone-row-ad-1','playzone-row-ad-2','playzone-row-ad-3','playzone-row-ad-right','playzone-row-ad-left'];
  var all=games.concat(ads).concat(legacyAds);
  var KEY='vexaPlayZoneImageUrls:v7';
  var META_KEY='vexaPlayZoneImageUrlsUpdatedAt:v7';
  function byId(id){return document.getElementById(id)}
  function flash(message){var box=byId('toast');if(!box)return;box.textContent=message;box.style.display='block';setTimeout(function(){box.style.display='none'},3000)}
  function openGame(id){
    if(!id)return;
    var view=byId(id);
    if(!view){flash('Coming soon');return}
    document.querySelectorAll('.view').forEach(function(node){node.classList.remove('active')});
    view.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(node){node.classList.toggle('active',node.getAttribute('data-view')===id)});
    var title=byId('brandTitle');
    if(title)title.textContent={mines:'Mines',plinko:'Plinko',crash:'Crash',wheel:'Wheel',dice:'Dice',limbo:'Limbo',tower:'Tower',coinflip:'Coin Flip',hilo:'Hi-Lo'}[id]||title.textContent;
    document.body.classList.remove('header-glass-mode');
  }
  function playButton(target){return target&&target.closest?target.closest('#playzone button'):null}
  document.addEventListener('click',function(event){
    var button=playButton(event.target);if(!button)return;
    var id=button.getAttribute('data-game-view')||button.getAttribute('data-view')||'';
    if(!id)return;
    event.preventDefault();event.stopPropagation();
    openGame(id);
  },true);
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map));localStorage.setItem(META_KEY,String(Date.now()))}catch(e){}}
  function clean(url){return String(url||'').replace(/([?&])rt=\d+(&?)/,'$1').replace(/[?&]$/,'')}
  function allowed(url){return Boolean(url)&&String(url).indexOf('/app/api/section-lock-image/shared/')<0}
  function setImage(img,url){if(!img||!allowed(url))return;var next=clean(url);if(img.getAttribute('src')!==next)img.src=next;img.style.display='';img.loading='eager';img.decoding='async'}
  function apply(map){
    games.forEach(function(id){setImage(document.querySelector('#playzone .game-card[data-game-view="'+id+'"] .game-image img'),map[id]);setImage(document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img'),map[id])});
    ads.forEach(function(id){var slot=document.querySelector('#playzone .play-zone-card-ad[data-play-zone-ad="'+id+'"]');if(!slot||!map[id])return;slot.classList.remove('is-empty');setImage(slot.querySelector('img'),map[id])});
  }
  async function refresh(force){
    var cached=readCache();apply(cached);
    var last=Number(localStorage.getItem(META_KEY)||0);if(!force&&last&&Date.now()-last<300000)return;
    try{var response=await fetch('/app/api/section-locks',{cache:'no-store'});var data=await response.json();if(!data||!Array.isArray(data.sections))return;var next={};data.sections.forEach(function(section){var url=clean(section&&section.lockedImageUrl||section&&section.imageUrl||'');if(section&&all.indexOf(section.id)>=0&&allowed(url))next[section.id]=url});all.forEach(function(id){if(!next[id]&&allowed(cached[id]))next[id]=cached[id]});writeCache(next);apply(next)}catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){refresh(true)});else refresh(true);
  window.VexaRefreshPlayZoneImages=function(){refresh(true)};
})();
`;