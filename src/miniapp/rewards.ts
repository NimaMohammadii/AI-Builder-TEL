export const REWARDS_SECTION = `<section id="rewards" class="view rewards-view">
  <style>
    #rewards{overflow-y:auto!important;overflow-x:hidden!important;padding:0 3px 120px!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;box-sizing:border-box!important}
    #rewards::-webkit-scrollbar{display:none}
    #rewards .rewards-home-intro-card{min-height:156px!important;display:grid!important;place-items:stretch!important;padding:6px!important;overflow:hidden!important;box-sizing:border-box!important;background-color:rgba(255,255,255,.035)!important;background-image:url('/app/api/home-intro-image.png')!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;border-radius:30px!important;margin:calc(-54px + env(safe-area-inset-top)) 0 10px!important;box-shadow:0 18px 42px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.14)!important;backdrop-filter:blur(4px) saturate(1.12)!important;-webkit-backdrop-filter:blur(4px) saturate(1.12)!important}
    #rewards .rewards-home-intro-image-frame{width:100%!important;height:100%!important;min-height:144px!important;display:block!important;overflow:hidden!important;border:0!important;border-radius:24px!important;background:none!important;box-shadow:none!important;box-sizing:border-box!important}
    #rewards .rewards-live-winners{margin:14px 0 0!important;display:block!important;min-height:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}
    #rewards .rewards-live-winners-head{display:flex!important;align-items:center!important;justify-content:space-between!important;margin:0 2px 10px!important;color:#fff!important}
    #rewards .rewards-live-winners-head strong{font-size:17px!important;font-weight:950!important;letter-spacing:-.035em!important}
    #rewards .rewards-live-winners-head span{color:rgba(255,255,255,.48)!important;font-size:11px!important;font-weight:850!important}
    #rewards .rewards-live-winners-list{height:auto!important;max-height:none!important;min-height:0!important;display:grid!important;align-content:start!important;gap:10px!important;overflow:visible!important;overscroll-behavior:auto!important;scrollbar-width:none!important;padding:0 2px 0!important;background:transparent!important;box-shadow:none!important}
    #rewards .rewards-live-winners-list::-webkit-scrollbar{display:none!important}
    #rewards .home-live-winner-card{min-height:64px!important;border:0!important;outline:0!important;border-radius:28px!important;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;display:grid!important;grid-template-columns:42px minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;padding:11px 14px!important;backdrop-filter:blur(3px) saturate(1.04)!important;-webkit-backdrop-filter:blur(3px) saturate(1.04)!important}
    #rewards .home-live-winner-avatar{width:42px!important;height:42px!important;border-radius:50%!important;object-fit:cover!important;display:block!important;background:transparent!important;box-shadow:none!important}
    #rewards .home-live-winner-user{min-width:0!important;display:grid!important;gap:3px!important}
    #rewards .home-live-winner-user strong{display:block!important;color:#fff!important;font-size:13px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    #rewards .home-live-winner-user span{display:block!important;color:rgba(255,255,255,.48)!important;font-size:10px!important;font-weight:750!important}
    #rewards .home-live-winner-amount{color:#fff!important;font-size:13px!important;font-weight:950!important;white-space:nowrap!important}
    @media(max-width:380px){#rewards{padding-left:3px!important;padding-right:3px!important}#rewards .rewards-home-intro-card{margin-top:calc(-54px + env(safe-area-inset-top))!important;min-height:150px!important}#rewards .rewards-home-intro-image-frame{min-height:138px!important}}
  </style>
  <div class="rewards-home-intro-card" aria-hidden="true"><div class="rewards-home-intro-image-frame"></div></div>
  <section class="rewards-live-winners" aria-label="Live Winners">
    <div class="rewards-live-winners-head"><strong>Live Winners</strong><span>Recent user cards</span></div>
    <div class="rewards-live-winners-list" id="rewardsLiveWinnersList"></div>
  </section>
  <script>
    (function(){
      var WINNERS=[    ['@NikaWin','Level 8','+1.25 TON','telegram'],['@ParsaFlow','Level 9','+0.84 TON','durov'],['@MinaLucky','Level 10','+0.47 TON','TelegramTips'],['@ArianTon','Level 11','+2.10 TON','telegram'],['@SabaPlay','Level 12','+0.66 TON','durov'],['@RezaMax','Level 13','+1.72 TON','TelegramTips'],['@DaryaWin','Level 14','+0.93 TON','telegram'],['@KianX','Level 15','+3.40 TON','durov'],['@AvaTon','Level 16','+0.58 TON','TelegramTips'],['@PouyaWin','Level 17','+1.05 TON','telegram'],['@NoraLucky','Level 18','+0.77 TON','durov'],['@ShayanPro','Level 19','+2.45 TON','TelegramTips'],['@MelikaGold','Level 20','+1.18 TON','telegram'],['@ArmanKing','Level 21','+0.52 TON','durov'],['@RahaMoon','Level 22','+4.20 TON','TelegramTips'],['@NavidTon','Level 23','+0.69 TON','telegram'],['@SetiWin','Level 24','+1.33 TON','durov'],['@MahanPlay','Level 25','+2.80 TON','TelegramTips'],['@SinaFlow','Level 8','+0.91 TON','telegram'],['@NegarWin','Level 9','+1.60 TON','durov'],['@RadinX','Level 10','+0.44 TON','TelegramTips'],['@MatinTon','Level 11','+3.15 TON','telegram'],['@Sara88','Level 12','+0.73 TON','durov'],['@AmirMax','Level 13','+1.95 TON','TelegramTips'],['@TinaWin','Level 14','+0.88 TON','telegram'],['@HanaPlay','Level 15','+2.25 TON','durov'],['@BardiaPro','Level 16','+0.56 TON','TelegramTips'],['@SorenWin','Level 17','+1.48 TON','telegram'],['@YasminTon','Level 18','+0.62 TON','durov'],['@ErfanCode','Level 19','+2.65 TON','TelegramTips']];
      function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c})}
      function winnersHtml(){return WINNERS.map(function(w){return '<article class="home-live-winner-card"><img class="home-live-winner-avatar" src="https://t.me/i/userpic/320/'+esc(w[3])+'.jpg" alt="" decoding="async"/><div class="home-live-winner-user"><strong>'+esc(w[0])+'</strong><span>'+esc(w[1])+'</span></div><div class="home-live-winner-amount">'+esc(w[2])+'</div></article>'}).join('')}
      function render(){var list=document.getElementById('rewardsLiveWinnersList');if(list&&!list.innerHTML)list.innerHTML=winnersHtml()}
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
      window.addEventListener('vexa-view-change',render);
    })();
  </script>
</section>`;
