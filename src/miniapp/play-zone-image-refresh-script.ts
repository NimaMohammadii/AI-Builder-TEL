export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','limbo','tower','coinflip','hilo'];
  var ads=games.map(function(id){return 'playzone-card-ad-'+id});
  var legacyAds=['playzone-row-ad-1','playzone-row-ad-2','playzone-row-ad-3','playzone-row-ad-right','playzone-row-ad-left'];
  var all=games.concat(ads).concat(legacyAds);
  var KEY='vexaPlayZoneImageUrls:v9';
  var SECTION_LOCKS_KEY='vexaSectionLocks:v1';
  var countersStarted=false;
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map))}catch(e){}}
  function readSectionLocks(){try{return JSON.parse(localStorage.getItem(SECTION_LOCKS_KEY)||'null')}catch(e){return null}}
  function clean(url){var value=String(url||'');var marker=value.indexOf('?rt=');if(marker>=0)value=value.slice(0,marker);return value}
  function allowed(url){return Boolean(url)&&String(url).indexOf('/app/api/section-lock-image/shared/')<0}
  function setImage(img,url){
    if(!img||!allowed(url))return;
    var next=clean(url);
    var fallback=img.getAttribute('data-fallback-src')||img.getAttribute('src')||'';
    img.onerror=function(){this.onerror=null;if(fallback&&this.getAttribute('src')!==fallback)this.src=fallback;this.style.display=''};
    if(next&&img.getAttribute('src')!==next)img.src=next;
    img.classList.remove('is-empty');
    img.style.display='';
    img.loading='eager';
    img.decoding='async';
  }
  function apply(map){
    games.forEach(function(id){setImage(document.querySelector('#playzone .game-card[data-game-view="'+id+'"] .game-image img'),map[id]);setImage(document.querySelector('#playzone .game-card[data-view="'+id+'"] .game-image img'),map[id])});
    setImage(document.querySelector('#playzone .play-zone-center-image[data-play-zone-ad="playzone-card-ad-plinko"]'),map['playzone-card-ad-plinko']);
  }
  function mapFromSectionLocks(cached){
    var data=readSectionLocks();
    if(!data||!Array.isArray(data.sections))return cached;
    var next={};
    data.sections.forEach(function(section){var url=clean(section&&section.lockedImageUrl||section&&section.imageUrl||'');if(section&&all.indexOf(section.id)>=0&&allowed(url))next[section.id]=url});
    all.forEach(function(id){if(!next[id]&&allowed(cached[id]))next[id]=cached[id]});
    return next;
  }
  function refresh(){
    var cached=readCache();
    var next=mapFromSectionLocks(cached);
    if(next!==cached)writeCache(next);
    apply(next);
    startCounters();
    return Promise.resolve(next);
  }
  function nextCount(current){
    var base=parseInt(current,10);
    if(!isFinite(base))base=100+Math.floor(Math.random()*301);
    var delta=Math.floor(Math.random()*11)-5;
    if(delta===0)delta=1;
    var value=base+delta;
    if(value<100)value=100+Math.floor(Math.random()*12);
    if(value>400)value=400-Math.floor(Math.random()*12);
    return value;
  }
  function flipDigit(el,text){
    el.classList.add('is-counting');
    setTimeout(function(){el.textContent=text;el.classList.remove('is-counting')},135);
  }
  function animateNumber(el,value){
    if(!el)return;
    var from=String(parseInt(el.textContent,10)||0).padStart(3,'0');
    var to=String(value).padStart(3,'0');
    var order=[2,1,0];
    order.forEach(function(index,step){
      if(from.charAt(index)===to.charAt(index))return;
      setTimeout(function(){
        var current=String(parseInt(el.textContent,10)||0).padStart(3,'0').split('');
        current[index]=to.charAt(index);
        flipDigit(el,String(parseInt(current.join(''),10)));
      },step*170);
    });
  }
  function tickCounters(){
    document.querySelectorAll('#playzone .game-card[data-game-view] .game-players b').forEach(function(el){animateNumber(el,nextCount(el.textContent))});
  }
  function startCounters(){
    if(countersStarted)return;
    countersStarted=true;
    setInterval(tickCounters,3000);
  }
  apply(readCache());
  startCounters();
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-view="playzone"],[data-game-view]');if(b)setTimeout(refresh,160)},true);
  window.VexaRefreshPlayZoneImages=function(){return refresh()};
})();
`;