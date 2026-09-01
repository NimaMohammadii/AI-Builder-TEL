export const PREDICT_ZONE_SECTION = `<section id="predictzone" class="view predict-zone-view">
  <style>
    #predictzone .predict-zone-countdown{opacity:.48!important;color:rgba(255,255,255,.66)!important;text-shadow:none!important}
    #predictzone .predict-zone-price-axis span{font-size:12.6px!important;font-weight:720!important;color:rgba(255,255,255,.48)!important}
    #predictzone [data-predict-card]{position:relative;overflow:hidden}
    #predictzone .predict-zone-start-guide{position:absolute;left:0;right:78px;height:0;border-top:1px dashed rgba(255,255,255,.42);z-index:4;opacity:0;pointer-events:none;filter:drop-shadow(0 0 8px rgba(255,255,255,.18));transition:top .18s ease,opacity .18s ease}
    #predictzone .predict-zone-start-guide.show{opacity:1}
    #predictzone .predict-zone-start-guide span{position:absolute;right:6px;top:-18px;font-size:9px;font-weight:850;letter-spacing:.12em;color:rgba(255,255,255,.54)}
    #predictzone .predict-zone-start-target{position:absolute;right:82px;z-index:5;display:none;align-items:center;gap:4px;height:24px;padding:0 9px;border-radius:999px;background:rgba(255,255,255,.08);box-shadow:0 10px 24px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.11);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);color:rgba(255,255,255,.82);font-size:9.5px;font-weight:900;letter-spacing:.08em;pointer-events:none}
    #predictzone .predict-zone-start-target.show{display:inline-flex;animation:predictStartTargetPulse 1.05s ease-in-out infinite}
    #predictzone .predict-zone-start-target.above{top:14px;--predict-target-shift:-5px}
    #predictzone .predict-zone-start-target.below{bottom:14px;--predict-target-shift:5px}
    @keyframes predictStartTargetPulse{0%,100%{transform:translateY(0);opacity:.72}50%{transform:translateY(var(--predict-target-shift,4px));opacity:1}}
    #predictzone .predict-zone-chart-loader{position:absolute;inset:0;z-index:9;display:grid;place-items:center;pointer-events:none;background:radial-gradient(circle at 50% 42%,rgba(92,10,31,.18),rgba(0,0,0,0) 34%),linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.22));opacity:1;transition:opacity .28s ease}
    #predictzone .predict-zone-chart-preview.ready .predict-zone-chart-loader{opacity:0}
    #predictzone .predict-zone-loader-core{position:relative;width:82px;height:82px;display:grid;place-items:center;filter:drop-shadow(0 18px 30px rgba(0,0,0,.34))}
    #predictzone .predict-zone-loader-core:before,#predictzone .predict-zone-loader-core:after{content:"";position:absolute;inset:0;border-radius:999px;border:1px solid rgba(255,255,255,.10);box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
    #predictzone .predict-zone-loader-core:before{animation:predictLoaderSpin 1.35s linear infinite;border-top-color:rgba(255,255,255,.78);border-right-color:rgba(92,10,31,.60)}
    #predictzone .predict-zone-loader-core:after{inset:13px;animation:predictLoaderPulse 1.2s ease-in-out infinite;background:radial-gradient(circle,rgba(255,255,255,.18),rgba(92,10,31,.18) 42%,rgba(255,255,255,0) 68%)}
    #predictzone .predict-zone-loader-core span{position:relative;z-index:1;width:10px;height:10px;border-radius:999px;background:#fff;box-shadow:0 0 18px rgba(255,255,255,.62),0 0 34px rgba(92,10,31,.42);animation:predictLoaderDot 1.05s ease-in-out infinite}
    @keyframes predictLoaderSpin{to{transform:rotate(360deg)}}
    @keyframes predictLoaderPulse{0%,100%{transform:scale(.82);opacity:.55}50%{transform:scale(1.08);opacity:1}}
    @keyframes predictLoaderDot{0%,100%{transform:scale(.78);opacity:.68}50%{transform:scale(1.16);opacity:1}}
    #predictzone .predict-zone-live-bets{position:absolute;left:4px;bottom:74px;z-index:8;width:70px;height:72px;overflow:hidden;pointer-events:none;-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 26%,#000 72%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0%,#000 26%,#000 72%,transparent 100%)}
    #predictzone .predict-zone-live-bet{position:absolute;left:0;bottom:0;display:inline-flex;align-items:center;justify-content:center;min-width:0;height:20px;padding:0;background:transparent;border:0;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none;font-size:11px;font-weight:950;letter-spacing:-.035em;white-space:nowrap;opacity:0;text-shadow:0 8px 18px rgba(0,0,0,.35);animation:predictLiveBetFloat 2.35s ease-out forwards}
    #predictzone .predict-zone-live-bet.up{color:rgba(68,255,150,.96);background:transparent}
    #predictzone .predict-zone-live-bet.down{color:rgba(255,120,138,.95);background:transparent}
    #predictzone .predict-zone-choice.has-uploaded-image{background:transparent!important;box-shadow:none!important;border:0!important;padding:0!important;overflow:hidden}
    #predictzone .predict-zone-choice-image{display:none;width:100%;height:100%;background-position:center;background-size:contain;background-repeat:no-repeat;pointer-events:none}
    #predictzone .predict-zone-choice.has-uploaded-image .predict-zone-choice-image{display:block}
    #predictzone .predict-zone-choice.has-uploaded-image .predict-zone-choice-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
    @keyframes predictLiveBetFloat{0%{transform:translateY(34px) scale(.94);opacity:0}18%{opacity:.96}70%{opacity:.88}100%{transform:translateY(-58px) scale(.98);opacity:0}}
    #predictzone .predict-zone-bet-sheet{position:fixed;inset:0;z-index:80;display:grid;align-items:center;justify-items:center;padding:18px;background:rgba(0,0,0,.16);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:opacity .22s ease}
    #predictzone .predict-zone-bet-sheet.open{opacity:1;pointer-events:auto}
    #predictzone .predict-zone-bet-panel{width:100%;max-width:390px;margin:0 auto;border-radius:32px;background:rgba(18,18,18,.28);border:1px solid rgba(255,255,255,.11);box-shadow:0 28px 80px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.12);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);padding:18px;transform:scale(.94);opacity:.6;transition:transform .28s cubic-bezier(.2,.9,.2,1),opacity .22s ease;color:#fff}
    #predictzone .predict-zone-bet-sheet.open .predict-zone-bet-panel{transform:scale(1);opacity:1}
    #predictzone .predict-zone-bet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
    #predictzone .predict-zone-bet-head span{display:block;color:rgba(255,255,255,.46);font-size:10px;font-weight:760;text-transform:uppercase;letter-spacing:.12em;margin-bottom:4px}
    #predictzone .predict-zone-bet-head strong{display:block;font-size:24px;font-weight:820;letter-spacing:-.055em;line-height:1.05}
    #predictzone .predict-zone-bet-close{width:38px;height:38px;border:0;border-radius:999px;background:rgba(255,255,255,.06);color:#fff;font-size:22px;line-height:1;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}
    #predictzone .predict-zone-bet-question{font-size:13px;font-weight:720;color:rgba(255,255,255,.68);letter-spacing:-.02em;margin:0 0 16px}
    #predictzone .predict-zone-ton-rate{display:none!important}
    #predictzone .predict-zone-bet-input-wrap{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:8px;min-height:74px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.105),rgba(255,255,255,.045));border:1px solid rgba(255,255,255,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 18px 38px rgba(0,0,0,.22);padding:0 16px;margin:0 0 12px;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
    #predictzone .predict-zone-bet-input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#fff;font-size:29px;font-weight:850;letter-spacing:-.05em;appearance:textfield}.predict-zone-bet-input::-webkit-outer-spin-button,.predict-zone-bet-input::-webkit-inner-spin-button{appearance:none;margin:0}
    #predictzone .predict-zone-bet-side{display:grid;justify-items:end;gap:4px}
    #predictzone .predict-zone-bet-token{font-size:13px;font-weight:820;color:rgba(255,255,255,.72)}
    #predictzone .predict-zone-bet-usd{font-size:12px;font-weight:760;color:rgba(255,255,255,.50);white-space:nowrap;letter-spacing:-.02em}
    #predictzone .predict-zone-bet-estimate{display:inline-flex;align-items:center;justify-content:center;min-width:42px;max-width:104px;padding:0 4px;color:#35ff96;font-size:13px;font-weight:950;letter-spacing:-.025em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 0 12px rgba(53,255,150,.22);background:transparent;border:0;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none}
    #predictzone .predict-zone-bet-estimate:empty{display:none}
    #predictzone .predict-zone-result-strip{position:relative;margin:10px -2px 0;display:none;overflow:hidden;border-radius:20px}
    #predictzone .predict-zone-result-strip.show{display:block}
    #predictzone .predict-zone-result-strip::before,#predictzone .predict-zone-result-strip::after{content:"";position:absolute;top:0;bottom:0;width:28px;z-index:2;pointer-events:none}
    #predictzone .predict-zone-result-strip::before{left:0;background:linear-gradient(90deg,rgba(10,3,5,.86),rgba(10,3,5,0))}
    #predictzone .predict-zone-result-strip::after{right:0;background:linear-gradient(270deg,rgba(10,3,5,.86),rgba(10,3,5,0))}
    #predictzone .predict-zone-history-track{display:flex;gap:6px;overflow-x:auto;overflow-y:hidden;padding:0 24px 1px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
    #predictzone .predict-zone-history-track::-webkit-scrollbar{display:none}
    #predictzone .predict-zone-history-card{flex:0 0 auto;min-width:92px;height:34px;border:0;outline:0;border-radius:999px;background:rgba(255,255,255,.065);box-shadow:0 10px 24px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.10);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:0 10px;color:rgba(255,255,255,.74);font-size:11.2px;font-weight:850;letter-spacing:-.025em;white-space:nowrap}
    #predictzone .predict-zone-history-card.win{color:rgba(70,255,150,.96);background:rgba(255,255,255,.065)}
    #predictzone .predict-zone-history-card.loss{color:rgba(255,135,150,.94);background:rgba(255,255,255,.065)}
    #predictzone .predict-zone-history-card.refund{color:rgba(120,190,255,.96);background:rgba(255,255,255,.065)}
    #predictzone .predict-zone-history-card.active{color:rgba(255,255,255,.78);background:rgba(255,255,255,.065)}
    #predictzone .predict-zone-bet-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:11px 0 14px}
    #predictzone .predict-zone-bet-preset{height:36px;border:0;border-radius:999px;background:rgba(255,255,255,.055);color:#fff;font-size:12px;font-weight:760;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
    #predictzone .predict-zone-bet-submit{width:100%;height:48px;border:0;border-radius:999px;background:rgba(255,255,255,.10);color:#fff;font-size:15px;font-weight:820;box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 18px 34px rgba(0,0,0,.24)}
    #predictzone .predict-zone-bet-submit:disabled{opacity:.55}
    #predictzone .predict-zone-bet-note{margin:10px 0 0;text-align:center;color:rgba(255,255,255,.42);font-size:10.5px;font-weight:650;letter-spacing:-.01em}
    #predictzone .predict-zone-bet-status{min-height:15px;margin:9px 0 0;text-align:center;color:rgba(255,255,255,.58);font-size:11px;font-weight:720;letter-spacing:-.01em}
    #predictzone .predict-zone-bet-status.bad{color:rgba(255,160,160,.9)}
    #predictzone .predict-zone-bet-status.good{color:rgba(185,255,210,.9)}
    @media(max-width:380px){#predictzone .predict-zone-price-axis span{font-size:11.4px!important}#predictzone .predict-zone-bet-panel{max-width:340px;border-radius:28px;padding:16px}#predictzone .predict-zone-bet-head strong{font-size:22px}#predictzone .predict-zone-bet-input{font-size:25px}#predictzone .predict-zone-bet-estimate{min-width:38px;max-width:86px;font-size:12px;padding:0 2px}#predictzone .predict-zone-history-card{min-width:84px;height:31px;font-size:10.5px;padding:0 8px}#predictzone .predict-zone-live-bets{left:2px;bottom:70px;width:62px;height:64px}#predictzone .predict-zone-live-bet{font-size:10px;height:18px;min-width:0}}
  </style>
  <div class="predict-zone-simple-shell">
    <nav class="predict-zone-category-menu" aria-label="Predict Zone categories">
      <button type="button" class="predict-zone-category-card active" data-predict-market="bitcoin"><span>Bitcoin</span></button>
      <button type="button" class="predict-zone-category-card" data-predict-market="ton"><span>TON</span></button>
      <button type="button" class="predict-zone-category-card" data-predict-market="football"><span>Football</span></button>
      <button type="button" class="predict-zone-category-card" data-predict-market="politics"><span>Politics</span></button>
      <button type="button" class="predict-zone-category-card" data-predict-market="fun"><span>Fun</span></button>
    </nav>
    <article class="predict-zone-glass-card predict-zone-btc-preview-card" data-predict-card>
      <div class="predict-zone-card-top"><span></span><small class="predict-zone-countdown" data-predict-countdown>--:--</small></div>
      <h2 class="predict-zone-question-row"><span class="predict-zone-question-image" data-predict-question-image aria-label="Prediction image upload slot"></span><span data-predict-question>Bitcoin go up or down?</span></h2>
      <div class="predict-zone-live-meta" aria-label="Predict preview price"><div><span>Start</span><strong class="predict-zone-start-price">Loading</strong></div><div><span>Live</span><strong class="predict-zone-live-price">Loading</strong></div></div>
      <div class="predict-zone-chart-preview" data-predict-chart aria-label="Live chart preview">
        <div class="predict-zone-chart-grid"><span data-chart-grid-line="0"></span><span data-chart-grid-line="1"></span><span data-chart-grid-line="2"></span><span data-chart-grid-line="3"></span><span data-chart-grid-line="4"></span></div>
        <div class="predict-zone-price-axis" aria-hidden="true"><span data-price-axis="0"></span><span data-price-axis="1"></span><span data-price-axis="2"></span><span data-price-axis="3"></span><span data-price-axis="4"></span></div>
        <svg viewBox="0 0 360 220" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="predictBtcLine" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="rgba(255,255,255,.22)"/><stop offset="48%" stop-color="rgba(255,255,255,.95)"/><stop offset="100%" stop-color="rgba(255,255,255,.42)"/></linearGradient><linearGradient id="predictBtcFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.18)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient></defs><path class="predict-zone-chart-fill" d=""/><path class="predict-zone-chart-line" d=""/></svg>
        <div class="predict-zone-chart-loader" aria-hidden="true"><span class="predict-zone-loader-core"><span></span></span></div><span class="predict-zone-chart-dot"></span><span class="predict-zone-price-guide"></span><span class="predict-zone-start-guide" data-predict-start-guide><span>Entry</span></span><span class="predict-zone-start-target" data-predict-start-target></span>
      </div>
      <div class="predict-zone-live-bets" data-predict-live-bets aria-hidden="true"></div><div class="predict-zone-actions"><button type="button" class="predict-zone-choice predict-zone-choice-up" data-predict-choice="up"><span class="predict-zone-choice-image" data-predict-choice-image="up"></span><span class="predict-zone-choice-label">Up</span></button><button type="button" class="predict-zone-choice predict-zone-choice-down" data-predict-choice="down"><span class="predict-zone-choice-image" data-predict-choice-image="down"></span><span class="predict-zone-choice-label">Down</span></button></div><div class="predict-zone-result-strip" data-predict-result></div>
    </article>
  </div>
  <div class="predict-zone-bet-sheet" data-predict-bet-sheet aria-hidden="true"><div class="predict-zone-bet-panel" role="dialog" aria-modal="true" aria-label="Place prediction"><div class="predict-zone-bet-head"><div><span>Prediction</span><strong data-predict-bet-title>Up</strong></div><button type="button" class="predict-zone-bet-close" data-predict-bet-close aria-label="Close">×</button></div><p class="predict-zone-bet-question" data-predict-bet-question>Bitcoin go up or down?</p><label class="predict-zone-bet-input-wrap"><input class="predict-zone-bet-input" data-predict-bet-input type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" /><span class="predict-zone-bet-estimate" data-predict-bet-estimate></span><span class="predict-zone-bet-side"><span class="predict-zone-bet-token">TON</span><span class="predict-zone-bet-usd" data-predict-bet-usd>≈ $0.00</span></span></label><div class="predict-zone-bet-presets"><button type="button" class="predict-zone-bet-preset" data-predict-bet-preset="1">1</button><button type="button" class="predict-zone-bet-preset" data-predict-bet-preset="5">5</button><button type="button" class="predict-zone-bet-preset" data-predict-bet-preset="10">10</button><button type="button" class="predict-zone-bet-preset" data-predict-bet-preset="25">25</button></div><button type="button" class="predict-zone-bet-submit" data-predict-bet-submit>Place prediction</button><p class="predict-zone-bet-status" data-predict-bet-status></p><p class="predict-zone-bet-note">Pool-based prediction. Stake is locked from your TON balance.</p></div></div>
</section>`;