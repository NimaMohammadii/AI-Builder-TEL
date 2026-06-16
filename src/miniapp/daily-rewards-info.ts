export const DAILY_REWARDS_INFO_SECTION = `<section id="dailyrewardsinfo" class="view daily-rewards-info-view">
  <style>
    body:has(#dailyrewardsinfo.active) .top,body:has(#dailyrewardsinfo.active) .tabs{display:none!important}
    body:has(#dailyrewardsinfo.active) .content{height:100vh!important;padding:0!important;overflow:hidden!important}
    body:has(#dailyrewardsinfo.active) .app{padding:0!important;height:100vh!important;max-height:100vh!important}
    .daily-rewards-info-view{position:fixed!important;inset:0!important;z-index:10040;height:100vh!important;width:100vw!important;overflow:hidden!important;padding:calc(50px + env(safe-area-inset-top)) 18px calc(16px + env(safe-area-inset-bottom))!important;background:radial-gradient(circle at 18% -10%,rgba(126,20,48,.34),rgba(126,20,48,0) 36%),radial-gradient(circle at 92% 14%,rgba(126,20,48,.22),rgba(126,20,48,0) 30%),#050507;box-sizing:border-box}
    .daily-rewards-info-view:not(.active){display:none!important}
    .daily-info-page{position:relative;height:100%;min-height:0;padding:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:10px;align-content:start}
    .daily-info-head{position:relative;border-radius:28px;padding:16px 16px 14px;background:linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.026));box-shadow:0 18px 48px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.13);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center}
    .daily-info-head:before{content:"";position:absolute;right:-64px;top:-78px;width:174px;height:174px;border-radius:999px;background:radial-gradient(circle,rgba(126,20,48,.38),rgba(126,20,48,.10) 52%,rgba(126,20,48,0) 72%);pointer-events:none}
    .daily-info-copy{position:relative;z-index:2;min-width:0}.daily-info-copy span{display:block;margin-bottom:8px;color:rgba(255,255,255,.52);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.17em}.daily-info-copy h2{margin:0;color:#fff;font-size:30px;line-height:.94;font-weight:930;letter-spacing:-.065em;text-shadow:0 18px 34px rgba(0,0,0,.28)}.daily-info-copy p{margin:7px 0 0;max-width:210px;color:rgba(255,255,255,.58);font-size:10.5px;line-height:1.3;font-weight:620}
    .daily-info-translate{position:relative;z-index:2;height:36px;border:0;border-radius:999px;background:#fff;color:#23050d;padding:0 14px;font-size:12px;font-weight:900;box-shadow:0 14px 34px rgba(0,0,0,.20)}
    .daily-info-list{position:relative;min-height:0;display:grid;gap:8px;align-content:start;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;scrollbar-width:none;padding:0 0 54px!important;mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 58px),rgba(0,0,0,0));-webkit-mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 58px),rgba(0,0,0,0))}.daily-info-list::-webkit-scrollbar{display:none}
    .daily-info-row{display:grid;grid-template-columns:98px minmax(0,1fr);align-items:center;gap:12px;min-height:92px;padding:10px;border-radius:24px;background:rgba(255,255,255,.04);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 14px 28px rgba(0,0,0,.12);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
    .daily-info-row.today{background:linear-gradient(135deg,rgba(126,20,48,.24),rgba(255,255,255,.065));box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 16px 34px rgba(126,20,48,.10)}
    .daily-info-img{width:98px;height:72px;border-radius:18px;background:rgba(0,0,0,.22);overflow:hidden;display:grid;place-items:center}.daily-info-img img{width:100%;height:100%;object-fit:cover;display:block}.daily-info-img span{color:rgba(255,255,255,.3);font-size:9px;font-weight:800}
    .daily-info-main{min-width:0}.daily-info-main b{display:block;color:#fff;font-size:14px;font-weight:900;line-height:1;letter-spacing:-.025em}.daily-info-main small{display:block;margin-top:7px;color:rgba(255,255,255,.58);font-size:10.5px;font-weight:620;line-height:1.28}.daily-info-day{height:24px;display:inline-grid;place-items:center;padding:0 9px;border-radius:999px;background:rgba(126,20,48,.16);color:rgba(255,255,255,.84);font-size:9px;font-weight:900;margin-bottom:7px}
  </style>
  <div class="daily-info-page">
    <div class="daily-info-head">
      <div class="daily-info-copy"><span>Daily Rewards</span><h2>Reward Guide</h2><p>See what each day gives you before you claim it.</p></div>
      <button id="dailyInfoTranslate" class="daily-info-translate" type="button">Translate</button>
    </div>
    <div id="dailyInfoList" class="daily-info-list"></div>
  </div>
</section>`;
