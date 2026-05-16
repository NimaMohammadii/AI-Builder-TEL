export const TOP_PLAYERS_HERO_SCRIPT = `
(function(){
  function q(s){return document.querySelector(s)}
  function ensureStyle(){
    if(document.getElementById('topPlayersHeroStyle'))return;
    var style=document.createElement('style');
    style.id='topPlayersHeroStyle';
    style.textContent='.leaderboard-page .leaderboard-top,.leaderboard-page .leaderboard-summary{display:none!important}.top-players-hero-card{position:relative;margin:0 0 22px;min-height:154px;border-radius:32px;padding:22px 132px 22px 20px;overflow:visible;background:linear-gradient(135deg,rgba(255,255,255,.09),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.115);box-shadow:0 28px 70px rgba(0,0,0,.34),0 0 56px rgba(126,20,48,.16),inset 0 1px 0 rgba(255,255,255,.16);backdrop-filter:blur(3px) saturate(1.18);-webkit-backdrop-filter:blur(3px) saturate(1.18);isolation:isolate}.top-players-hero-card:before{content:"";position:absolute;inset:0;border-radius:32px;background:radial-gradient(circle at 76% 18%,rgba(126,20,48,.26),rgba(126,20,48,0) 42%),radial-gradient(circle at 12% 92%,rgba(126,20,48,.16),rgba(126,20,48,0) 36%);z-index:-2}.top-players-hero-card:after{content:"";position:absolute;inset:0;border-radius:32px;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 320 170\'%3E%3Cg fill=\'none\' stroke=\'%23ffffff\' stroke-opacity=\'.12\' stroke-width=\'1.3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M224 34l24 12 24-12-24-12-24 12z\'/%3E%3Cpath d=\'M248 22v24M236 34h24\'/%3E%3Ccircle cx=\'42\' cy=\'122\' r=\'20\'/%3E%3Cpath d=\'M28 122h28M42 108v28\'/%3E%3Cpath d=\'M92 42l18 18 18-18\'/%3E%3Cpath d=\'M282 122c14-18 14-36 0-54-14 18-14 36 0 54z\'/%3E%3C/g%3E%3Cg fill=\'none\' stroke=\'%238a1737\' stroke-opacity=\'.32\' stroke-width=\'1.1\'%3E%3Ccircle cx=\'254\' cy=\'86\' r=\'58\'/%3E%3Cpath d=\'M18 34h118M186 146h100\'/%3E%3C/g%3E%3C/svg%3E");background-size:100% 100%;background-repeat:no-repeat;z-index:-1;opacity:.92}.top-players-hero-kicker{margin:0 0 8px;color:rgba(255,255,255,.48);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.18em}.top-players-hero-title{margin:0;color:#fff;font-size:34px;line-height:.9;font-weight:900;letter-spacing:-.065em;text-shadow:0 0 28px rgba(126,20,48,.26)}.top-players-hero-sub{margin:11px 0 0;max-width:190px;color:rgba(255,255,255,.58);font-size:11px;line-height:1.35;font-weight:600;letter-spacing:-.01em}.top-players-hero-art{position:absolute;right:12px;top:-26px;width:122px;height:154px;display:grid;place-items:center;animation:topPlayersFloat 3.8s ease-in-out infinite;filter:drop-shadow(0 26px 34px rgba(0,0,0,.38))}.top-players-hero-art img{max-width:132px;max-height:168px;object-fit:contain;display:block}.top-players-hero-placeholder{width:94px;height:94px;border-radius:28px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(126,20,48,.26),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.12);color:#fff;font-size:34px;font-weight:900;box-shadow:inset 0 1px 0 rgba(255,255,255,.13)}@keyframes topPlayersFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}@media(max-width:380px){.top-players-hero-card{padding-right:112px;min-height:144px}.top-players-hero-title{font-size:30px}.top-players-hero-sub{max-width:172px;font-size:10.5px}.top-players-hero-art{right:4px;width:112px}.top-players-hero-art img{max-width:120px;max-height:156px}}';
    document.head.appendChild(style);
  }
  function heroHtml(){
    var src='/app/api/top-players-hero-image?v='+String(window.__vexaAppVersion||Date.now());
    return '<section class="top-players-hero-card"><p class="top-players-hero-kicker">Top Players</p><h2 class="top-players-hero-title">Top 50 Players</h2><p class="top-players-hero-sub">Climb the weekly race, earn Vex, and claim your place.</p><div class="top-players-hero-art"><img src="'+src+'" alt="" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'<div class=&quot;top-players-hero-placeholder&quot;>#</div>\'"/></div></section>';
  }
  function apply(){
    ensureStyle();
    var page=document.getElementById('leaderboardPage');
    if(!page)return;
    if(!page.querySelector('.top-players-hero-card')){
      var top=page.querySelector('.leaderboard-top');
      if(top)top.insertAdjacentHTML('beforebegin',heroHtml());
      else page.insertAdjacentHTML('afterbegin',heroHtml());
    }
  }
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-leaderboard"]');if(b)setTimeout(apply,30)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,500)});else setTimeout(apply,500);
  window.VexaTopPlayersHero={refresh:apply};
})();
`;