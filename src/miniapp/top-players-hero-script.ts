export const TOP_PLAYERS_HERO_SCRIPT = `
(function(){
  function ensureStyle(){
    if(document.getElementById('topPlayersHeroStyle'))return;
    var style=document.createElement('style');
    style.id='topPlayersHeroStyle';
    style.textContent=[
      '.leaderboard-page .leaderboard-top,.leaderboard-page .leaderboard-summary{display:none!important}',
      '.top-players-hero-card{position:relative;margin:0 0 22px;min-height:176px;border-radius:32px;padding:22px 132px 18px 20px;overflow:visible;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.16);box-shadow:0 28px 70px rgba(0,0,0,.34),0 0 56px rgba(126,20,48,.14),inset 0 1px 0 rgba(255,255,255,.18);backdrop-filter:blur(3px) saturate(1.18);-webkit-backdrop-filter:blur(3px) saturate(1.18);isolation:isolate}',
      '.top-players-hero-card:before{content:"";position:absolute;inset:0;border-radius:32px;background:radial-gradient(circle at 76% 18%,rgba(126,20,48,.20),rgba(126,20,48,0) 42%),radial-gradient(circle at 12% 92%,rgba(255,255,255,.055),rgba(255,255,255,0) 34%);z-index:-2}',
      '.top-players-hero-card:after{content:"";position:absolute;inset:0;border-radius:32px;background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,0) 34%),radial-gradient(circle at 78% 40%,rgba(126,20,48,.18),rgba(126,20,48,0) 48%);z-index:-1;opacity:.9}',
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
      '.top-players-hero-back{position:absolute!important;right:12px!important;bottom:12px!important;width:34px!important;height:34px!important;background:rgba(255,255,255,.88)!important;color:#21050d!important;box-shadow:0 12px 24px rgba(0,0,0,.18)!important}',
      '@keyframes topPlayersFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}',
      '@media(max-width:380px){.top-players-hero-card{padding-right:112px;min-height:166px}.top-players-hero-title{font-size:30px}.top-players-hero-sub{max-width:172px;font-size:10.5px}.top-players-hero-stats{max-width:184px;gap:5px}.top-players-hero-stats span{height:40px;padding:0 6px}.top-players-hero-stats b{font-size:10px}.top-players-hero-stats small{font-size:6.6px}.top-players-hero-art{right:4px;width:112px}.top-players-hero-art img{max-width:120px;max-height:164px}}'
    ].join('');
    document.head.appendChild(style);
  }
  ensureStyle();
  window.VexaTopPlayersHero={refresh:ensureStyle};
})();
`;