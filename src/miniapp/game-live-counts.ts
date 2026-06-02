const liveGameLabels: Record<string, string> = {
  mines: 'Mines',
  plinko: 'Plinko',
  rps: 'Rock Paper Scissors',
  wheel: 'Wheel',
  dice: 'Dice',
  crash: 'Crash',
  hilo: 'Chicken Cross',
  coinflip: 'Pump',
  tower: 'Dragon Tower',
};

export function livePlayersSeed(id: string): number {
  const seed = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 100 + (seed % 301);
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
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: #18ff84 !important;
  box-shadow: 0 0 0 1px rgba(24, 255, 132, .25), 0 0 10px rgba(24, 255, 132, .46), 0 0 20px rgba(24, 255, 132, .18), inset 0 1px 0 rgba(255, 255, 255, .34) !important;
  flex: 0 0 auto !important;
  position: relative !important;
  animation: liveDotSoft 1.35s ease-in-out infinite !important;
}

.game-online-badge i::before {
  content: '' !important;
  position: absolute !important;
  inset: -5px !important;
  border-radius: inherit !important;
  border: 1px solid rgba(24, 255, 132, .46) !important;
  opacity: .45 !important;
  animation: liveDotRing 1.35s ease-in-out infinite !important;
}

.game-online-badge em {
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
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(.82); filter: brightness(1.18); }
}

@keyframes liveDotRing {
  0% { transform: scale(.72); opacity: .42; }
  70%, 100% { transform: scale(1.7); opacity: 0; }
}
`;

export const GAME_LIVE_COUNT_SCRIPT = `
(function(){
  var games=${JSON.stringify(liveGameLabels)};
  var counts={};
  function seed(id){var sum=0;String(id||'').split('').forEach(function(ch){sum+=ch.charCodeAt(0)});return 100+(sum%301)}
  function cardValue(id){var el=document.querySelector('#playzone .game-card-shell[data-game-view="'+id+'"] .game-players b');var n=parseInt(el&&el.textContent,10);return isFinite(n)?n:null}
  function count(id){var fromCard=cardValue(id);if(fromCard!==null){counts[id]=fromCard;return fromCard}if(!counts[id])counts[id]=seed(id);return counts[id]}
  function cardNodes(id){return Array.prototype.slice.call(document.querySelectorAll('#playzone .game-card-shell[data-game-view="'+id+'"] .game-players b'))}
  function setCount(id,value){var n=Math.max(1,Math.floor(Number(value)||seed(id)));counts[id]=n;cardNodes(id).forEach(function(el){if(el.textContent!==String(n))el.textContent=String(n)});renderBadge();return n}
  function activeGame(){var root=document.querySelector('.view.active');if(!root)return '';var id=root.id||'';return games[id]?id:''}
  function badges(title){return Array.prototype.slice.call(title.querySelectorAll('[data-game-online-badge],[data-dice-online-badge]'))}
  function stripBadges(title,keep){badges(title).forEach(function(node){if(node!==keep)node.remove()})}
  function titleText(title){return String(title.childNodes[0]&&title.childNodes[0].textContent||title.textContent||'').trim()}
  function renderBadge(){var title=document.getElementById('brandTitle');if(!title)return;var id=activeGame();if(!id){stripBadges(title);return}var label=games[id]||'';if(titleText(title)!==label){stripBadges(title);return}var n=count(id);var badge=title.querySelector('[data-game-online-badge="'+id+'"]');stripBadges(title,badge);if(!badge){badge=document.createElement('span');badge.className='game-online-badge '+id+'-online-badge';badge.setAttribute('data-game-online-badge',id);var dot=document.createElement('i');var live=document.createElement('em');var value=document.createElement('b');live.textContent='LIVE';badge.appendChild(dot);badge.appendChild(live);badge.appendChild(value);title.appendChild(badge)}badge.setAttribute('aria-label',n+' live online');var b=badge.querySelector('b');if(b&&b.textContent!==String(n))b.textContent=String(n)}
  function syncCards(){Object.keys(games).forEach(function(id){var current=cardValue(id);if(current!==null)counts[id]=current;else setCount(id,count(id))});renderBadge()}
  window.VexaLiveGameCounts={get:count,setCount:setCount,sync:syncCards,renderBadge:renderBadge};
  document.addEventListener('click',function(){setTimeout(syncCards,220)},true);
  if(window.MutationObserver){new MutationObserver(renderBadge).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']})}
  syncCards();
})();
`;
