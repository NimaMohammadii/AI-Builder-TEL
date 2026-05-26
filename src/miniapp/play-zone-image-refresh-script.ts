export const PLAY_ZONE_IMAGE_REFRESH_SCRIPT = `
(function(){
  var games=['mines','plinko','crash','wheel','dice','rps','tower','coinflip','hilo'];
  var ads=games.map(function(id){return 'playzone-card-ad-'+id});
  var legacyAds=['playzone-row-ad-1','playzone-row-ad-2','playzone-row-ad-3','playzone-row-ad-right','playzone-row-ad-left'];
  var all=games.concat(ads).concat(legacyAds);
  var KEY='vexaPlayZoneImageUrls:v9';
  var NFT_KEY='vexaPlayZoneMixedNfts:v1';
  var SECTION_LOCKS_KEY='vexaSectionLocks:v1';
  var countersStarted=false,nftBusy=false;
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(map){try{localStorage.setItem(KEY,JSON.stringify(map))}catch(e){}}
  function readSectionLocks(){try{return JSON.parse(localStorage.getItem(SECTION_LOCKS_KEY)||'null')}catch(e){return null}}
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
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
  function nftCard(item){var title=esc(item&&item.title||'Gift NFT'),img=esc(item&&item.imageUrl||'');return '<button type="button" class="play-zone-nft-card" data-play-zone-nft-card="1"><span class="play-zone-nft-img">'+(img?'<img src="'+img+'" alt="" decoding="async" loading="eager"/>':'')+'</span><span class="play-zone-nft-info"><strong>'+title+'</strong></span></button>'}
  function unique(items){var seen={},out=[];(Array.isArray(items)?items:[]).forEach(function(item){var id=String(item&&item.id||item&&item.title||'');if(!id||seen[id])return;seen[id]=1;out.push(item)});return out}
  function renderNfts(items){var strip=document.querySelector('#playzone [data-play-zone-nft-strip]'),track=document.querySelector('#playzone [data-play-zone-nft-track]');if(!strip||!track)return;var list=unique(items).slice(0,13);if(!list.length){strip.hidden=true;track.innerHTML='';return}strip.hidden=false;var html=list.map(nftCard).join('');track.innerHTML=html+html}
  function fetchGifts(url){return fetch(url,{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){return Array.isArray(j&&j.gifts)?j.gifts:[]})}
  function loadLowNfts(force){if(nftBusy)return;var cached=null;try{cached=JSON.parse(localStorage.getItem(NFT_KEY)||'null')}catch(e){}if(cached&&cached.items&&!force&&Date.now()-Number(cached.ts||0)<180000){renderNfts(cached.items);return}if(cached&&cached.items)renderNfts(cached.items);nftBusy=true;var ts=Date.now();Promise.all([
      fetchGifts('/app/api/ton-gift-market-fresh?sort=price_asc&offset=0&limit=6&ts='+ts),
      fetchGifts('/app/api/ton-gift-market-fresh?sort=price_desc&offset=12&limit=9&ts='+ts)
    ]).then(function(parts){
      var low=parts[0].slice(0,6);
      var highWindow=parts[1]||[];
      var high=highWindow.slice(0,1).concat(highWindow.slice(3,9));
      var items=unique(low.concat(high)).slice(0,13);
      try{localStorage.setItem(NFT_KEY,JSON.stringify({items:items,ts:Date.now()}))}catch(e){}
      renderNfts(items);
    }).catch(function(){if(cached&&cached.items)renderNfts(cached.items)}).finally(function(){nftBusy=false})}
  function playNft(card){
    if(!card)return;
    var track=card.closest('[data-play-zone-nft-track]');
    if(track)track.classList.add('is-paused');
    clearTimeout(card.__vexaNftTimer);
    card.__vexaNftTimer=setTimeout(function(){if(track)track.classList.remove('is-paused')},1200);
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
  function refresh(){var cached=readCache();var next=mapFromSectionLocks(cached);if(next!==cached)writeCache(next);apply(next);loadLowNfts(false);startCounters();return Promise.resolve(next)}
  function nextCount(current){var base=parseInt(current,10);if(!isFinite(base))base=100+Math.floor(Math.random()*301);var delta=Math.floor(Math.random()*11)-5;if(delta===0)delta=1;var value=base+delta;if(value<100)value=100+Math.floor(Math.random()*12);if(value>400)value=400-Math.floor(Math.random()*12);return value}
  function flipDigit(el,text){el.classList.add('is-counting');setTimeout(function(){el.textContent=text;el.classList.remove('is-counting')},135)}
  function animateNumber(el,value){if(!el)return;var from=String(parseInt(el.textContent,10)||0).padStart(3,'0');var to=String(value).padStart(3,'0');var order=[2,1,0];order.forEach(function(index,step){if(from.charAt(index)===to.charAt(index))return;setTimeout(function(){var current=String(parseInt(el.textContent,10)||0).padStart(3,'0').split('');current[index]=to.charAt(index);flipDigit(el,String(parseInt(current.join(''),10)))},step*170)})}
  function tickCounters(){document.querySelectorAll('#playzone .game-card-shell[data-game-view] .game-players b').forEach(function(el){animateNumber(el,nextCount(el.textContent))})}
  function startCounters(){if(countersStarted)return;countersStarted=true;setInterval(tickCounters,3000)}
  apply(readCache());loadLowNfts(false);startCounters();
  document.addEventListener('click',function(e){var nft=e.target&&e.target.closest&&e.target.closest('#playzone [data-play-zone-nft-card]');if(nft){e.preventDefault();e.stopPropagation();playNft(nft);return}var b=e.target&&e.target.closest&&e.target.closest('[data-view="playzone"],[data-game-view]');if(b)setTimeout(refresh,160)},true);
  window.VexaRefreshPlayZoneImages=function(){return refresh()};
})();
`;