export const TOP_PLAYERS_HERO_SCRIPT = `
(function(){
  function applyHeroClass(){
    var page=document.getElementById('leaderboardPage');
    if(!page)return;
    var hero=page.querySelector('.top-players-hero-card')||page.querySelector('.leaderboard-top');
    if(!hero)return;
    hero.classList.add('top-players-hero-card');
    hero.style.setProperty('position','relative','important');
    hero.style.setProperty('margin','0 0 22px','important');
    hero.style.setProperty('min-height','176px','important');
    hero.style.setProperty('border-radius','32px','important');
    hero.style.setProperty('padding','22px 132px 18px 20px','important');
    hero.style.setProperty('overflow','visible','important');
    hero.style.setProperty('background','linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,.045))','important');
    hero.style.setProperty('border','1px solid rgba(255,255,255,.22)','important');
    hero.style.setProperty('box-shadow','0 28px 70px rgba(0,0,0,.38),0 0 46px rgba(126,20,48,.16),inset 0 1px 0 rgba(255,255,255,.24)','important');
    hero.style.setProperty('backdrop-filter','blur(6px) saturate(1.22)','important');
    hero.style.setProperty('-webkit-backdrop-filter','blur(6px) saturate(1.22)','important');
    page.querySelectorAll('.top-players-hero-back,.leaderboard-back').forEach(function(n){try{n.remove()}catch(e){}});
  }
  function ensureStyle(){
    var old=document.getElementById('topPlayersHeroStyle');
    if(old){try{old.remove()}catch(e){}}
    var style=document.createElement('style');
    style.id='topPlayersHeroStyle';
    style.textContent=[
      '.leaderboard-page .leaderboard-top,.leaderboard-page .leaderboard-summary{display:none!important}',
      '.leaderboard-page .top-players-hero-back,.leaderboard-page .leaderboard-back{display:none!important}',
      '.leaderboard-page .top-players-hero-card{position:relative!important;margin:0 0 22px!important;min-height:176px!important;border-radius:32px!important;padding:22px 132px 18px 20px!important;overflow:visible!important;background:linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,.045))!important;border:1px solid rgba(255,255,255,.22)!important;box-shadow:0 28px 70px rgba(0,0,0,.38),0 0 46px rgba(126,20,48,.16),inset 0 1px 0 rgba(255,255,255,.24)!important;backdrop-filter:blur(6px) saturate(1.22)!important;-webkit-backdrop-filter:blur(6px) saturate(1.22)!important;isolation:isolate!important}',
      '.leaderboard-page .top-players-hero-card:before{content:"";position:absolute;inset:0;border-radius:32px;background:linear-gradient(135deg,rgba(255,255,255,.11),rgba(255,255,255,0) 44%);z-index:-1;pointer-events:none}',
      '.top-players-hero-kicker{margin:0 0 8px;color:rgba(255,255,255,.50);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.18em}',
      '.top-players-hero-title{margin:0;color:#fff;font-size:34px;line-height:.9;font-weight:900;letter-spacing:-.065em;text-shadow:0 0 28px rgba(126,20,48,.26)}',
      '.top-players-hero-sub{margin:11px 0 0;max-width:190px;color:rgba(255,255,255,.60);font-size:11px;line-height:1.35;font-weight:600;letter-spacing:-.01em}',
      '.top-players-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;max-width:206px;margin-top:14px}',
      '.top-players-hero-stats span{min-width:0;height:44px;border-radius:15px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.085);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:0 8px}',
      '.top-players-hero-stats b{display:block;color:#fff;font-size:11.5px;font-weight:900;line-height:1;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}',
      '.top-players-hero-stats small{display:block;margin-top:5px;color:rgba(255,255,255,.46);font-size:7.3px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;white-space:nowrap}',
      '.top-players-hero-art{position:absolute;right:12px;top:-26px;width:122px;height:168px;display:grid;place-items:center;animation:topPlayersFloat 3.8s ease-in-out infinite;filter:drop-shadow(0 26px 34px rgba(0,0,0,.38))}',
      '.top-players-hero-art img{max-width:132px;max-height:176px;object-fit:contain;display:block}',
      '.top-players-hero-placeholder{width:94px;height:94px;border-radius:28px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(126,20,48,.26),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.12);color:#fff;font-size:34px;font-weight:900;box-shadow:inset 0 1px 0 rgba(255,255,255,.13)}',
      '@keyframes topPlayersFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}',
      '@media(max-width:380px){.top-players-hero-card{padding-right:112px!important;min-height:166px!important}.top-players-hero-title{font-size:30px}.top-players-hero-sub{max-width:172px;font-size:10.5px}.top-players-hero-stats{max-width:184px;gap:5px}.top-players-hero-stats span{height:40px;padding:0 6px}.top-players-hero-stats b{font-size:10px}.top-players-hero-stats small{font-size:6.6px}.top-players-hero-art{right:4px;width:112px}.top-players-hero-art img{max-width:120px;max-height:164px}}'
    ].join('');
    document.head.appendChild(style);
    applyHeroClass();
  }
  ensureStyle();
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-leaderboard"]');if(b){setTimeout(ensureStyle,0);setTimeout(ensureStyle,120);setTimeout(ensureStyle,700)}},true);
  if(window.MutationObserver){try{new MutationObserver(function(){setTimeout(applyHeroClass,20)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}catch(e){}}
  window.VexaTopPlayersHero={refresh:ensureStyle};
})();
`;