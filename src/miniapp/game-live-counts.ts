const liveGameLabels: Record<string, string> = {
  mines: 'Mines',
  plinko: 'Plinko',
  wheel: 'Wheel',
  dice: 'Dice',
  crash: 'Crash',
  hilo: 'Chicken Cross',
  coinflip: 'Pump',
  slot: 'Slot',
  ghostrun: 'Ghost Run',
};

const hiddenCardPlayerCounts = new Set(['hilo', 'coinflip']);

type LivePlayerRange = { start: number; end: number; min: number; max: number };
type LivePlayerProfile = { offset: number; width: number; phase: number };

const livePlayerProfiles: Record<string, LivePlayerProfile> = {
  mines: { offset: -36, width: 18, phase: 5 },
  plinko: { offset: 24, width: 32, phase: 17 },
  wheel: { offset: 58, width: 24, phase: 41 },
  dice: { offset: -28, width: 14, phase: 53 },
  crash: { offset: 72, width: 38, phase: 67 },
  hilo: { offset: -44, width: 20, phase: 79 },
  coinflip: { offset: 10, width: -12, phase: 89 },
  slot: { offset: 46, width: 28, phase: 101 },
  ghostrun: { offset: 34, width: 18, phase: 109 },
};

const livePlayerRanges: LivePlayerRange[] = [
  { start: 5, end: 11, min: 80, max: 220 },
  { start: 12, end: 16, min: 180, max: 360 },
  { start: 17, end: 23, min: 500, max: 700 },
  { start: 0, end: 4, min: 500, max: 700 },
];

function baseRangeForHour(hour: number): LivePlayerRange {
  return livePlayerRanges.find((range) => hour >= range.start && hour <= range.end) ?? livePlayerRanges[0];
}

function rangeForGameHour(id: string, hour: number): LivePlayerRange {
  const base = baseRangeForHour(hour);
  const profile = livePlayerProfiles[id] ?? { offset: 0, width: 0, phase: hashId(id) % 113 };
  const low = Math.max(40, base.min + profile.offset);
  const high = Math.max(low + 35, base.max + profile.offset + profile.width);
  return { ...base, min: low, max: high };
}

function hashId(id: string): number {
  return id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function rangedLivePlayers(id: string, date = new Date()): number {
  const range = rangeForGameHour(id, date.getHours());
  const width = range.max - range.min + 1;
  const bucket = Math.floor(date.getTime() / 90000);
  const hash = hashId(id);
  const phase = livePlayerProfiles[id]?.phase ?? hash;
  const wave = Math.floor((Math.sin((bucket + phase) * 1.618) + 1) * width * 0.22);
  const drift = (bucket * 37 + hash * 13 + phase * 7) % width;
  return range.min + ((drift + wave) % width);
}

export function shouldShowLivePlayersOnCard(id: string): boolean {
  return !hiddenCardPlayerCounts.has(id);
}

export function livePlayersSeed(id: string): number {
  return rangedLivePlayers(id);
}

export const GAME_LIVE_COUNT_STYLES = `
#brandTitle {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  min-width: 0 !important;
}

.game-online-badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 5px !important;
  min-width: 0 !important;
  color: rgba(255, 255, 255, .90) !important;
  font-size: 10.5px !important;
  font-weight: 900 !important;
  letter-spacing: -.02em !important;
  white-space: nowrap !important;
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin-left: 2px !important;
  transform: translateY(1px) !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

.game-online-badge i {
  width: 6px !important;
  height: 6px !important;
  border-radius: 50% !important;
  background: #18ff84 !important;
  box-shadow: 0 0 0 1px rgba(24, 255, 132, .25), 0 0 8px rgba(24, 255, 132, .42), 0 0 14px rgba(24, 255, 132, .14), inset 0 1px 0 rgba(255, 255, 255, .34) !important;
  flex: 0 0 auto !important;
  position: relative !important;
  animation: liveDotSoft 1.7s ease-in-out infinite !important;
}

.game-online-badge i::before {
  content: '' !important;
  position: absolute !important;
  inset: -2px !important;
  border-radius: inherit !important;
  border: 1px solid rgba(24, 255, 132, .40) !important;
  opacity: .36 !important;
  animation: liveDotRing 1.7s ease-in-out infinite !important;
}

.game-online-badge em {
  display: none !important;
  font-style: normal !important;
  font-size: 8px !important;
  font-weight: 900 !important;
  letter-spacing: .08em !important;
  color: rgba(24, 255, 132, .92) !important;
  text-transform: uppercase !important;
  line-height: 1 !important;
}

.game-online-badge b {
  display: inline-block !important;
  min-width: 23px !important;
  font-size: 10.5px !important;
  font-weight: 900 !important;
  color: rgba(255, 255, 255, .90) !important;
  text-shadow: 0 6px 14px rgba(0, 0, 0, .56), 0 0 10px rgba(255, 255, 255, .08) !important;
  font-variant-numeric: tabular-nums !important;
}

@keyframes liveDotSoft {
  0%, 100% { transform: scale(.96); filter: brightness(1); }
  50% { transform: scale(1.04); filter: brightness(1.14); }
}

@keyframes liveDotRing {
  0%, 100% { transform: scale(.84); opacity: .14; }
  50% { transform: scale(1.12); opacity: .30; }
}
`;

export const GAME_LIVE_COUNT_SCRIPT = `
(function(){
  var games=${JSON.stringify(liveGameLabels)};
  var cardCountsVisible=${JSON.stringify(Object.fromEntries(Object.keys(liveGameLabels).map((id) => [id, shouldShowLivePlayersOnCard(id)])))};
  var counts={};
  var countBuckets={};
  var adminSchedule=null;
  var adminScheduleFetchedAt=0;
  var adminScheduleInFlight=null;
  var adminScheduleCacheKey='vexa-live-count:admin-schedule:v1';
  var storagePrefix='vexa-live-count:';
  var ranges=[{start:5,end:11,min:80,max:220},{start:12,end:16,min:180,max:360},{start:17,end:23,min:500,max:700},{start:0,end:4,min:500,max:700}];
  var profiles=${JSON.stringify(livePlayerProfiles)};
  function hash(id){var sum=0;String(id||'').split('').forEach(function(ch){sum+=ch.charCodeAt(0)});return sum}
  function baseRangeForHour(hour){for(var i=0;i<ranges.length;i++){var r=ranges[i];if(hour>=r.start&&hour<=r.end)return r}return ranges[0]}
  function rangeForGameHour(id,hour){var base=baseRangeForHour(hour);var profile=profiles[id]||{offset:0,width:0,phase:hash(id)%113};var low=Math.max(40,base.min+profile.offset);var high=Math.max(low+35,base.max+profile.offset+profile.width);return {start:base.start,end:base.end,min:low,max:high}}
  function ranged(id,date){date=date||new Date();var r=rangeForGameHour(id,date.getHours());var width=r.max-r.min+1;var bucket=Math.floor(date.getTime()/90000);var h=hash(id);var phase=(profiles[id]&&profiles[id].phase)||h;var wave=Math.floor((Math.sin((bucket+phase)*1.618)+1)*width*.22);var drift=(bucket*37+h*13+phase*7)%width;return r.min+((drift+wave)%width)}
  function adminRange(id,date){if(!adminSchedule||!adminSchedule[id])return null;date=date||new Date();var value=adminSchedule[id][date.getHours()];if(value&&typeof value==='object'){var min=Math.max(0,Math.floor(Number(value.min)||0)),max=Math.max(0,Math.floor(Number(value.max)||0));if(min>max){var tmp=min;min=max;max=tmp}return {min:min,max:max}}var n=Math.floor(Number(value));return isFinite(n)?{min:Math.max(0,n),max:Math.max(0,n)}:null}
  function bucketFor(date){date=date||new Date();return Math.floor(date.getTime()/90000)}
  function rangeKey(range){return String(range.min)+'-'+String(range.max)}
  function storageKey(id,range,date){date=date||new Date();return storagePrefix+id+':'+date.getHours()+':'+bucketFor(date)+':'+rangeKey(range)}
  function readStored(id,range,date){try{var raw=sessionStorage.getItem(storageKey(id,range,date));var n=Math.floor(Number(raw));return isFinite(n)&&n>=range.min&&n<=range.max?n:null}catch(e){return null}}
  function writeStored(id,range,date,value){try{sessionStorage.setItem(storageKey(id,range,date),String(value))}catch(e){}}
  function randomInRange(id,range,date){date=date||new Date();var stored=readStored(id,range,date);if(stored!==null)return stored;var width=range.max-range.min+1;if(width<=1)return range.min;var bucket=bucketFor(date);var h=hash(id);var wave=Math.floor((Math.sin((bucket+(profiles[id]&&profiles[id].phase||h))*1.618)+1)*width*.22);var drift=(bucket*37+h*13)%width;var value=range.min+((drift+wave)%width);writeStored(id,range,date,value);return value}
  function adminCount(id,date){var range=adminRange(id,date);return range?randomInRange(id,range,date):null}
  function seed(id,date){date=date||new Date();var admin=adminRange(id,date);return admin===null?randomInRange(id,rangeForGameHour(id,date.getHours()),date):randomInRange(id,admin,date)}
  function isPlayZoneActive(){var root=document.getElementById('playzone');return !!(root&&root.classList.contains('active')&&!document.hidden)}
  function inCurrentRange(id,value){var n=Math.floor(Number(value));if(!isFinite(n))return false;var admin=adminRange(id);if(admin!==null)return n>=admin.min&&n<=admin.max;var r=rangeForGameHour(id,(new Date()).getHours());return n>=r.min&&n<=r.max}
  function cardValue(id){var el=document.querySelector('#playzone .game-card-shell[data-game-view="'+id+'"] .game-players b');var n=parseInt(el&&el.textContent,10);return isFinite(n)?n:null}
  function count(id){var now=new Date(),bucket=bucketFor(now),range=adminRange(id,now)||rangeForGameHour(id,now.getHours());if(countBuckets[id]===bucket&&inCurrentRange(id,counts[id]))return counts[id];var fromCard=cardValue(id);if(fromCard!==null&&inCurrentRange(id,fromCard)){counts[id]=fromCard;countBuckets[id]=bucket;writeStored(id,range,now,fromCard);return fromCard}counts[id]=seed(id,now);countBuckets[id]=bucket;return counts[id]}
  function cardNodes(id){if(!isPlayZoneActive()||cardCountsVisible[id]===false)return [];return Array.prototype.slice.call(document.querySelectorAll('#playzone .game-card-shell[data-game-view="'+id+'"] .game-players b'))}
  function setCount(id,value){var fallback=seed(id);var n=Math.floor(Number(value));if(!isFinite(n))n=fallback;var admin=adminRange(id);if(admin!==null)n=Math.max(admin.min,Math.min(admin.max,n));else{var r=rangeForGameHour(id,(new Date()).getHours());n=Math.max(r.min,Math.min(r.max,n));}counts[id]=n;cardNodes(id).forEach(function(el){if(el.textContent!==String(n)){el.classList.add('is-counting');el.textContent=String(n);setTimeout(function(){el.classList.remove('is-counting')},180)}});renderBadge();return n}
  function activeGame(){var root=document.querySelector('.view.active');if(!root)return '';var id=root.id||'';return games[id]?id:''}
  function badges(title){return Array.prototype.slice.call(title.querySelectorAll('[data-game-online-badge],[data-dice-online-badge]'))}
  function stripBadges(title,keep){badges(title).forEach(function(node){if(node!==keep)node.remove()})}
  function titleText(title){return String(title.childNodes[0]&&title.childNodes[0].textContent||title.textContent||'').trim()}
  function renderBadge(){var title=document.getElementById('brandTitle');if(!title)return;var id=activeGame();if(!id){stripBadges(title);return}var label=games[id]||'';if(titleText(title)!==label){stripBadges(title);return}var n=count(id);var badge=title.querySelector('[data-game-online-badge="'+id+'"]');stripBadges(title,badge);if(!badge){badge=document.createElement('span');badge.className='game-online-badge '+id+'-online-badge';badge.setAttribute('data-game-online-badge',id);var dot=document.createElement('i');var value=document.createElement('b');badge.appendChild(dot);badge.appendChild(value);title.appendChild(badge)}badge.setAttribute('aria-label',n+' live online');var b=badge.querySelector('b');if(b&&b.textContent!==String(n))b.textContent=String(n)}
  function refreshCounts(){if(document.hidden)return;Object.keys(games).forEach(function(id){var n=count(id);if(isPlayZoneActive())setCount(id,n);else counts[id]=n});renderBadge()}
  function needsLiveCountRefresh(){return !document.hidden&&(isPlayZoneActive()||!!activeGame())}
  function needsAdminSchedule(){return needsLiveCountRefresh()}
  function isAdminScheduleFresh(){return !!(adminSchedule&&adminScheduleFetchedAt)}
  function readCachedAdminSchedule(){try{var raw=sessionStorage.getItem(adminScheduleCacheKey)||localStorage.getItem(adminScheduleCacheKey);if(!raw)return false;var cached=JSON.parse(raw);if(!cached||!cached.schedule||!cached.fetchedAt)return false;adminSchedule=cached.schedule;adminScheduleFetchedAt=Number(cached.fetchedAt);return true}catch(e){return false}}
  function writeCachedAdminSchedule(schedule){var payload=JSON.stringify({schedule:schedule,fetchedAt:adminScheduleFetchedAt});try{sessionStorage.setItem(adminScheduleCacheKey,payload)}catch(e){}try{localStorage.setItem(adminScheduleCacheKey,payload)}catch(e){}}
  function applyAdminSchedule(schedule,fetchedAt){if(!schedule)return;adminSchedule=schedule;adminScheduleFetchedAt=fetchedAt||Date.now();counts={};countBuckets={};writeCachedAdminSchedule(schedule);refreshCounts()}
  function loadAdminSchedule(){if(!needsAdminSchedule())return Promise.resolve(false);if(isAdminScheduleFresh()||readCachedAdminSchedule()){refreshCounts();return Promise.resolve(true)}if(adminScheduleInFlight)return adminScheduleInFlight;adminScheduleInFlight=fetch('/app/api/online-user-counts',{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.schedule){applyAdminSchedule(j.schedule,Date.now());return true}return false}).catch(function(){return false}).then(function(result){adminScheduleInFlight=null;return result},function(err){adminScheduleInFlight=null;throw err});return adminScheduleInFlight}
  function syncCards(){if(document.hidden){clearSmartRefresh();return Promise.resolve(false)}if(!needsLiveCountRefresh()){renderBadge();clearSmartRefresh();return Promise.resolve(false)}var render=function(){Object.keys(games).forEach(function(id){var current=cardValue(id);if(current!==null&&inCurrentRange(id,current)){counts[id]=current;countBuckets[id]=bucketFor(new Date())}else setCount(id,count(id))});renderBadge();scheduleSmartRefresh();return true};if(isAdminScheduleFresh()||readCachedAdminSchedule()){render();return Promise.resolve(true)}return loadAdminSchedule().then(function(){return render()})}
  window.VexaLiveGameCounts={get:count,setCount:setCount,sync:syncCards,refresh:refreshCounts,renderBadge:renderBadge};
  document.addEventListener('click',function(){setTimeout(function(){if(needsLiveCountRefresh())syncCards();else{renderBadge();clearSmartRefresh()}},220)},true);
  if(window.MutationObserver){
    var observer=new MutationObserver(function(){if(document.hidden)return;renderBadge();if(needsLiveCountRefresh())scheduleSmartRefresh();else clearSmartRefresh()});
    var title=document.getElementById('brandTitle');
    var play=document.getElementById('playzone');
    if(title)observer.observe(title,{childList:true,characterData:true,subtree:true});
    if(play)observer.observe(play,{attributes:true,attributeFilter:['class']});
  }
  function msUntilNextLiveBucket(){return 90000-(Date.now()%90000)+120}
  function clearSmartRefresh(){if(scheduleSmartRefresh.timer)clearTimeout(scheduleSmartRefresh.timer);scheduleSmartRefresh.timer=0}
  function scheduleSmartRefresh(){
    clearSmartRefresh();
    if(!needsLiveCountRefresh())return;
    scheduleSmartRefresh.timer=setTimeout(function(){if(!needsLiveCountRefresh()){clearSmartRefresh();return}refreshCounts();scheduleSmartRefresh()},msUntilNextLiveBucket());
  }
  document.addEventListener('visibilitychange',function(){if(document.hidden){clearSmartRefresh()}else if(needsLiveCountRefresh())syncCards();else{renderBadge();clearSmartRefresh()}});
  window.addEventListener('focus',function(){if(needsLiveCountRefresh())syncCards();else{renderBadge();clearSmartRefresh()}});
  syncCards();
})();
`;
