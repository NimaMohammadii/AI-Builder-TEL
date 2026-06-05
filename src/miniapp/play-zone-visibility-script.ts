export const PLAY_ZONE_VISIBILITY_SCRIPT = `
(function(){
  var KEY='vexaPlayZoneCards:v1';
  var refreshInFlight=null;
  var eventSource=null;
  function readCache(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
  function writeCache(data){try{localStorage.setItem(KEY,JSON.stringify(data||{}))}catch(e){}}
  function hiddenSet(data){var out={};if(data&&Array.isArray(data.hidden))data.hidden.forEach(function(id){out[id]=true});else if(data&&Array.isArray(data.cards))data.cards.forEach(function(card){if(card&&card.hidden)out[card.id]=true});return out}
  function apply(data){var hidden=hiddenSet(data);document.querySelectorAll('#playzone .game-card-shell[data-game-view]').forEach(function(shell){var id=shell.getAttribute('data-game-view')||'',hide=!!hidden[id];shell.hidden=hide;shell.style.display=hide?'none':'';shell.setAttribute('aria-hidden',hide?'true':'false')});try{if(window.VexaLiveGameCounts&&window.VexaLiveGameCounts.refresh)window.VexaLiveGameCounts.refresh()}catch(e){}}
  function refresh(force){if(refreshInFlight)return refreshInFlight;if(!force){var cached=readCache();if(cached)apply(cached)}refreshInFlight=fetch('/app/api/play-zone-cards',{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(data){if(data){writeCache(data);apply(data)}return data}).catch(function(){var cached=readCache();if(cached)apply(cached)}).finally(function(){refreshInFlight=null});return refreshInFlight}
  window.VexaRefreshPlayZoneCards=function(){return refresh(true)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){refresh(false)});else refresh(false);
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-view="playzone"]');if(b)setTimeout(function(){refresh(false)},80)},true);
  window.addEventListener('vexa-section-locks-updated',function(){refresh(true)});
  function connectEvents(){if(eventSource||typeof EventSource==='undefined')return;try{eventSource=new EventSource('/app/api/section-lock-events');eventSource.addEventListener('locks',function(){refresh(true)});eventSource.onerror=function(){try{eventSource.close()}catch(e){}eventSource=null;setTimeout(connectEvents,5000)}}catch(e){}}
  connectEvents();
})();
`;
