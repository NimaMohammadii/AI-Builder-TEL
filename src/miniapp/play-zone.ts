const cardImageVersion = Date.now();
const playZoneGames = [
  ['mines', 'Mines', 'Reveal safe tiles and cash out', 'Play'],
  ['plinko', 'Plinko', 'Drop the ball and catch a multiplier', 'Play'],
  ['crash', 'Crash', 'Cash out before the line crashes', 'Play'],
  ['wheel', 'Wheel', 'Spin the wheel and hit a prize', 'Soon'],
  ['dice', 'Dice', 'Roll the dice and beat the target', 'Soon'],
  ['limbo', 'Limbo', 'Escape the dark forest', 'Play'],
  ['tower', 'Tower', 'Climb higher and raise the payout', 'Soon'],
  ['coinflip', 'Coin Flip', 'Pick a side and flip for the win', 'Soon'],
  ['hilo', 'Hi-Lo', 'Call higher or lower to build streaks', 'Soon'],
] as const;

const limboForestStyles = `<style>
#playzone .limbo-forest-card{gap:6px!important;border-color:rgba(92,255,177,.18)!important;background:linear-gradient(180deg,rgba(20,48,34,.42),rgba(3,8,7,.72))!important;box-shadow:0 18px 42px rgba(0,0,0,.34),0 0 24px rgba(92,255,177,.08),inset 0 1px 0 rgba(255,255,255,.10)!important}
#playzone .limbo-forest-screen{position:relative;width:100%;aspect-ratio:1122/1402;border-radius:16px;overflow:hidden;background:#06100b;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 16px 32px rgba(0,0,0,.26)}
#playzone .limbo-forest-screen canvas{width:100%;height:100%;display:block}
#playzone .limbo-forest-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 46%,transparent 0 35%,rgba(0,0,0,.36) 72%,rgba(0,0,0,.78) 100%)}
#playzone .limbo-forest-hud{height:22px;border-radius:999px;padding:0 8px;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.10);display:flex;align-items:center;color:rgba(255,255,255,.78);font-size:8.8px;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#playzone .limbo-forest-status{min-height:24px;color:rgba(255,255,255,.62);font-size:8.4px;font-weight:750;line-height:1.18;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#playzone .limbo-forest-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
#playzone .limbo-forest-controls span{height:25px;border-radius:9px;background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.13);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:950;box-shadow:inset 0 1px 0 rgba(255,255,255,.22)}
#playzone .limbo-forest-controls span:active{transform:scale(.95)}
#playzone .limbo-forest-controls [data-limbo-move=forward]{grid-column:2}
#playzone .limbo-forest-controls [data-limbo-move=left]{grid-column:1;grid-row:2}
#playzone .limbo-forest-controls [data-limbo-move=back]{grid-column:2;grid-row:2}
#playzone .limbo-forest-controls [data-limbo-move=right]{grid-column:3;grid-row:2}
#playzone .limbo-forest-controls [data-limbo-reset]{grid-column:1/4;font-size:9px;color:rgba(255,255,255,.72)}
@media(max-width:380px){#playzone .limbo-forest-controls span{height:22px;font-size:10px}#playzone .limbo-forest-status{font-size:7.8px}.limbo-forest-hud{font-size:8px}}
</style>`;

const limboForestScript = `<script>
(function(){
  var map=['1111111','1000001','1011101','1000101','1110101','1L000E1','1111111'];
  var state={x:1.5,y:1.5,a:0,lantern:false,won:false,msg:'Find the lantern, then escape.'};
  var running=false,frame=0;
  function root(){return document.querySelector('#playzone [data-limbo-forest-card]')}
  function canvas(){var r=root();return r&&r.querySelector('[data-limbo-forest-canvas]')}
  function status(){var r=root();return r&&r.querySelector('[data-limbo-forest-status]')}
  function hud(){var r=root();return r&&r.querySelector('[data-limbo-forest-hud]')}
  function tile(x,y){var row=map[Math.floor(y)];return row?row[Math.floor(x)]||'1':'1'}
  function wall(x,y){return tile(x,y)==='1'}
  function msg(t){state.msg=t;var n=status();if(n)n.textContent=t}
  function sync(){var n=hud();if(n)n.textContent=(state.lantern?'Lantern on':'No lantern')+' · '+(state.won?'Escaped':'Forest maze')}
  function check(){var t=tile(state.x,state.y);if(t==='L'&&!state.lantern){state.lantern=true;msg('Lantern found. The fog opens.');sync();return}if(t==='E'){if(state.lantern){state.won=true;msg('You escaped the forest.');sync()}else msg('Exit found, but the fog needs a lantern.');return}msg('You move between the trees.')}
  function move(step){if(state.won)return;var nx=state.x+Math.cos(state.a)*step,ny=state.y+Math.sin(state.a)*step;if(wall(nx,ny)){msg('Trees block the path.');return}state.x=nx;state.y=ny;check()}
  function turn(v){if(state.won)return;state.a+=v;msg(v>0?'You turn right.':'You turn left.')}
  function draw(){var c=canvas();if(!c)return;var r=c.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1),w=Math.max(160,Math.floor(r.width*d)),h=Math.max(180,Math.floor(r.height*d));if(c.width!==w||c.height!==h){c.width=w;c.height=h}var ctx=c.getContext('2d');if(!ctx)return;frame+=.018;var sky=ctx.createLinearGradient(0,0,0,h*.52);sky.addColorStop(0,'#06110d');sky.addColorStop(1,'#12301f');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h*.52);var ground=ctx.createLinearGradient(0,h*.48,0,h);ground.addColorStop(0,'#0b1c12');ground.addColorStop(1,'#020504');ctx.fillStyle=ground;ctx.fillRect(0,h*.48,w,h);ctx.fillStyle='rgba(190,255,210,.07)';for(var s=0;s<16;s++){ctx.fillRect((Math.sin(frame+s*9)*.5+.5)*w,(Math.cos(frame*.7+s)*.5+.5)*h*.42,1*d,1*d)}var rays=Math.max(42,Math.floor(w/4));for(var i=0;i<rays;i++){var cam=(i/rays-.5)*1.05,ang=state.a+cam,dist=.04,hit=false,kind='1';while(dist<6&&!hit){kind=tile(state.x+Math.cos(ang)*dist,state.y+Math.sin(ang)*dist);if(kind==='1'||kind==='E')hit=true;else dist+=.04}var shade=Math.max(0,1-dist/6),col=Math.ceil(w/rays)+1,wh=Math.min(h,h/(dist*Math.cos(cam)+.08)),x=i*(w/rays),y=(h-wh)/2,a=Math.max(.12,shade*(state.lantern?1.28:.86));ctx.fillStyle=kind==='E'?'rgba(111,255,184,'+a+')':'rgba(28,88,52,'+a+')';ctx.fillRect(x,y,col,wh);ctx.fillStyle='rgba(0,0,0,'+((state.lantern?.42:.72)*(1-shade*.55))+')';ctx.fillRect(x,0,col,h)}var glow=ctx.createRadialGradient(w/2,h*.58,10,w/2,h*.58,w*.55);glow.addColorStop(0,state.lantern?'rgba(255,222,128,.24)':'rgba(255,255,255,.05)');glow.addColorStop(1,'rgba(0,0,0,.42)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);if(state.won){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff';ctx.font=Math.floor(16*d)+'px sans-serif';ctx.textAlign='center';ctx.fillText('ESCAPED',w/2,h/2)}if(running)requestAnimationFrame(draw)}
  function bind(){var r=root();if(!r||r.dataset.limboBound==='1')return;r.dataset.limboBound='1';r.querySelectorAll('[data-limbo-move]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var m=b.getAttribute('data-limbo-move');if(m==='forward')move(.55);if(m==='back')move(-.45);if(m==='left')turn(-Math.PI/2);if(m==='right')turn(Math.PI/2);sync()})});var reset=r.querySelector('[data-limbo-reset]');if(reset)reset.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();state={x:1.5,y:1.5,a:0,lantern:false,won:false,msg:'Find the lantern, then escape.'};msg(state.msg);sync()});msg(state.msg);sync();running=true;requestAnimationFrame(draw)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('[data-view=playzone]'))setTimeout(bind,80)},true);
})();
</script>`;

function limboForestCard(extraClass = ''): string {
  return `<button class="game-card limbo-forest-card ${extraClass}" type="button" data-limbo-forest-card><span class="limbo-forest-screen"><canvas data-limbo-forest-canvas aria-label="First person forest game"></canvas><span class="limbo-forest-vignette"></span></span><span class="game-info"><strong>Limbo</strong><small>Escape the dark forest</small></span><span class="limbo-forest-hud" data-limbo-forest-hud>No lantern · Forest maze</span><span class="limbo-forest-status" data-limbo-forest-status>Find the lantern, then escape.</span><span class="limbo-forest-controls"><span data-limbo-move="left">←</span><span data-limbo-move="forward">↑</span><span data-limbo-move="right">→</span><span data-limbo-move="back">↓</span><span data-limbo-reset>Reset</span></span></button>`;
}

function gameCard([id, label, description, action]: typeof playZoneGames[number], extraClass = ''): string {
  if (id === 'limbo') return limboForestCard(extraClass);
  return `<button class="game-card ${extraClass}" type="button" data-game-view="${id}"><span class="game-image"><img src="/app/api/section-lock-image/${id}/locked.png?v=${cardImageVersion}" alt="${label}" decoding="async" onerror="this.style.display='none'"/></span><span class="game-info"><strong>${label}</strong><small>${description}</small></span><span class="game-open">${action}</span></button>`;
}

const featuredGames = playZoneGames.slice(0, 3);
const triangleGames = playZoneGames.slice(3);

export const PLAY_ZONE_SECTION = `<section id="playzone" class="view play-zone-view">${limboForestStyles}<div class="play-zone-stage"><div class="play-zone-featured-row">${featuredGames.map((game, index) => gameCard(game, `play-zone-featured-card play-zone-featured-card-${index + 1}`)).join('')}</div><div class="play-zone-triangle"><div class="play-zone-triangle-row play-zone-triangle-row-3">${triangleGames.slice(0, 3).map((game) => gameCard(game, 'play-zone-triangle-card')).join('')}</div><div class="play-zone-triangle-row play-zone-triangle-row-2">${triangleGames.slice(3, 5).map((game) => gameCard(game, 'play-zone-triangle-card')).join('')}</div><div class="play-zone-triangle-row play-zone-triangle-row-1">${triangleGames.slice(5, 6).map((game) => gameCard(game, 'play-zone-triangle-card')).join('')}</div></div></div>${limboForestScript}</section>`;
