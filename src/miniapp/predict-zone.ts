export const PREDICT_ZONE_SECTION = `<section id="predictzone" class="view predict-zone-view">
  <div class="predict-zone-simple-shell">
    <nav class="predict-zone-category-menu" aria-label="Predict markets">
      <button type="button" class="predict-zone-category-card active" data-vexa-predict-market="bitcoin"><span>Bitcoin</span></button>
      <button type="button" class="predict-zone-category-card" data-vexa-predict-market="oil"><span>Oil</span></button>
      <button type="button" class="predict-zone-category-card" data-vexa-predict-market="gold"><span>Gold</span></button>
      <button type="button" class="predict-zone-category-card" data-vexa-predict-market="politics" data-vexa-predict-locked="1" aria-disabled="true"><span>Politics</span></button>
      <button type="button" class="predict-zone-category-card" data-vexa-predict-market="fun" data-vexa-predict-locked="1" aria-disabled="true"><span>Fun</span></button>
    </nav>

    <article class="predict-zone-glass-card predict-zone-btc-preview-card trend-flat" data-predict-card>
      <div class="predict-zone-card-top">
        <small class="predict-zone-countdown" data-predict-countdown>--:--</small>
      </div>

      <div class="predict-zone-hero">
        <span class="predict-zone-question-image" data-predict-question-image aria-hidden="true">
          <span class="predict-zone-symbol-fallback" data-predict-symbol-fallback>₿</span>
        </span>
        <div class="predict-zone-question-copy">
          <h2 class="predict-zone-question-row"><span data-predict-question>Bitcoin up or down?</span></h2>
        </div>
      </div>

      <div class="predict-zone-live-meta" aria-label="Predict market price">
        <div><span>Start</span><strong class="predict-zone-start-price">Loading</strong></div>
        <div class="predict-zone-live-cell"><span>Live</span><strong class="predict-zone-live-price">Loading</strong></div>
      </div>

      <div class="predict-zone-chart-preview" data-predict-chart aria-label="Live chart preview">
        <div class="predict-zone-chart-grid" data-predict-grid></div>
        <div class="predict-zone-price-axis" data-predict-price-axis aria-hidden="true"></div>
        <svg viewBox="0 0 360 220" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="predictMainLine" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="rgba(255,255,255,.22)"/><stop offset="48%" stop-color="rgba(255,255,255,.95)"/><stop offset="100%" stop-color="rgba(255,255,255,.42)"/></linearGradient>
            <linearGradient id="predictMainFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.18)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
          </defs>
          <path class="predict-zone-chart-fill" d=""/><path class="predict-zone-chart-line" d=""/>
        </svg>
        <div class="predict-zone-chart-loader" aria-hidden="true"><span></span></div>
        <span class="predict-zone-chart-dot"></span><span class="predict-zone-price-guide"></span>
        <span class="predict-zone-start-guide" data-predict-start-guide><span>Start</span></span>
        <span class="predict-zone-start-target" data-predict-start-target></span>
      </div>

      <div class="predict-zone-decision-head">
        <span>Make your prediction</span>
        <strong data-predict-trend-label>Waiting for price</strong>
      </div>
      <div class="predict-zone-actions">
        <button type="button" class="predict-zone-choice predict-zone-choice-up" data-predict-choice="up"><span class="predict-zone-choice-symbol" aria-hidden="true">↑</span><span>Up</span></button>
        <button type="button" class="predict-zone-choice predict-zone-choice-down" data-predict-choice="down"><span class="predict-zone-choice-symbol" aria-hidden="true">↓</span><span>Down</span></button>
      </div>
      <div class="predict-zone-bet-stage" data-predict-bet-stage aria-hidden="true">
        <label class="predict-zone-bet-input-wrap"><input class="predict-zone-bet-input" data-predict-bet-input type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" /><span class="predict-zone-bet-estimate" data-predict-bet-estimate></span><span class="predict-zone-bet-side"><span class="predict-zone-bet-token">GRAM</span><span class="predict-zone-bet-usd" data-predict-bet-usd>≈ $0.00</span></span></label>
        <div class="predict-zone-bet-presets"><button type="button" data-predict-bet-preset="1">1</button><button type="button" data-predict-bet-preset="5">5</button><button type="button" data-predict-bet-preset="10">10</button><button type="button" data-predict-bet-preset="25">25</button></div>
        <button type="button" class="predict-zone-bet-submit" data-predict-bet-submit>Place prediction</button>
        <p class="predict-zone-bet-status" data-predict-bet-status></p>
      </div>
    </article>
    <div class="predict-zone-result-strip" data-predict-result></div>
  </div>
</section>`;

export const PREDICT_ZONE_STYLES = `
html body:has(#predictzone.active){isolation:isolate!important;background:#000!important}
html body:has(#predictzone.active)::before{content:""!important;display:block!important;position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;z-index:0!important;pointer-events:none!important;background-color:#000!important;background-image:url('/app/api/section-background/predict.png'),radial-gradient(circle at 50% 10%,rgba(92,10,31,.18),transparent 38%),linear-gradient(180deg,#090306 0%,#000 72%)!important;background-size:cover,cover,cover!important;background-position:center top,center,center!important;background-repeat:no-repeat!important;transform:none!important;animation:none!important;filter:none!important;opacity:1!important}
html body:has(#predictzone.active)::after,html body:has(#predictzone.active) .app::before,html body:has(#predictzone.active) .app::after{display:none!important;content:none!important;background:none!important;background-image:none!important}
html body:has(#predictzone.active) .app,html body:has(#predictzone.active) main.app,html body:has(#predictzone.active) .content,html body:has(#predictzone.active) #predictzone.predict-zone-view,html body:has(#predictzone.active) .top,html body:has(#predictzone.active) header.top{position:relative!important;z-index:1!important;background:transparent!important;background-color:transparent!important;background-image:none!important}

.predict-zone-view{padding:0 0 calc(188px + env(safe-area-inset-bottom))!important;box-sizing:border-box;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important}.predict-zone-view::-webkit-scrollbar{display:none}
.predict-zone-simple-shell{position:relative;min-height:calc(100vh - 188px);display:grid;align-content:start;padding:0 0 120px;overflow:visible}

#predictzone .predict-zone-category-menu{position:relative!important;left:0!important;z-index:4!important;display:flex!important;gap:8px!important;overflow-x:auto!important;overflow-y:visible!important;width:100%!important;max-width:none!important;margin:0 0 10px!important;padding:0 0 9px!important;box-sizing:border-box!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain!important;scroll-padding:0!important;transform:translate3d(0,0,0);opacity:1;transition:opacity .28s ease,transform .42s cubic-bezier(.18,.88,.24,1)!important}#predictzone .predict-zone-category-menu::-webkit-scrollbar{display:none}#predictzone .predict-zone-category-menu:before{display:none!important;content:none!important}#predictzone .predict-zone-category-menu:after{content:""!important;flex:0 0 max(20px,env(safe-area-inset-right))!important;height:1px!important}
#predictzone .predict-zone-category-card{flex:0 0 auto!important;min-width:max-content!important;position:relative!important;overflow:hidden!important;height:38px!important;padding:0 12px!important;border:0!important;border-radius:28px!important;background:radial-gradient(34px 34px at 0 0,rgba(186,53,87,.16) 0%,rgba(146,35,66,.07) 42%,rgba(104,18,44,0) 76%),radial-gradient(36px 36px at 100% 100%,rgba(172,46,79,.15) 0%,rgba(133,30,60,.065) 43%,rgba(94,16,39,0) 78%),radial-gradient(118% 76% at 10% -16%,rgba(255,255,255,.12) 0%,rgba(255,255,255,.032) 30%,rgba(255,255,255,0) 58%),radial-gradient(96% 72% at 102% 108%,rgba(255,255,255,.052) 0%,rgba(255,255,255,.010) 34%,rgba(255,255,255,0) 62%),radial-gradient(92% 78% at 88% 112%,rgba(72,5,27,.11) 0%,rgba(42,3,16,0) 60%)!important;color:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:0 12px 30px rgba(31,1,10,.32),0 0 18px rgba(69,5,26,.15),inset 3px 3px .5px -3.5px rgba(255,255,255,.10),inset -3px -3px .5px -3.5px rgba(156,38,70,.48),inset 1px 1px 1px -.5px rgba(140,29,61,.30),inset -1px -1px 1px -.5px rgba(124,22,53,.24),inset 0 0 6px 6px rgba(255,255,255,.055),inset 0 0 2px 2px rgba(255,255,255,.035),inset 0 1px 0 rgba(112,18,49,.065),inset 0 -1px 0 rgba(88,12,37,.15)!important;backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;-webkit-backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;isolation:isolate!important;transform:translate3d(0,0,0)!important;transform-origin:center!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;transition:transform .38s cubic-bezier(.18,.88,.24,1),filter .32s ease,opacity .32s ease!important;opacity:.72!important}#predictzone .predict-zone-category-card span{color:rgba(255,255,255,.66)!important;font-size:12px!important;font-weight:950!important;line-height:1!important;letter-spacing:-.02em!important}#predictzone .predict-zone-category-card.active{opacity:1!important;filter:brightness(1.10) saturate(1.08)!important}#predictzone .predict-zone-category-card.active span{color:#f3d9e1!important}#predictzone .predict-zone-category-card:active{transform:translate3d(0,1px,0) scale(.94)!important;filter:brightness(1.14) saturate(1.08)!important;transition-duration:.11s!important}
#predictzone .predict-zone-category-card[data-vexa-predict-locked="1"]{cursor:not-allowed;opacity:.46!important;filter:none!important}#predictzone .predict-zone-category-card[data-vexa-predict-locked="1"] span:after{content:"";width:13px;height:13px;display:inline-block;margin-left:6px;opacity:.62;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z'/%3E%3C/svg%3E") center/contain no-repeat}

.predict-zone-glass-card{position:relative!important;width:100%!important;min-height:0!important;overflow:hidden!important;border-radius:28px!important;border:1px solid rgba(124,22,53,.24)!important;background:#070707!important;background-color:#070707!important;background-image:none!important;outline:0!important;padding:10px 12px!important;color:#fff!important;box-sizing:border-box!important;isolation:isolate!important;transform:translateZ(0)!important;box-shadow:0 12px 30px rgba(31,1,10,.32),0 0 18px rgba(69,5,26,.15),inset 3px 3px .5px -3.5px rgba(255,255,255,.10),inset 1px 1px 1px -.5px rgba(140,29,61,.30),inset 0 0 6px 6px rgba(255,255,255,.055),inset 0 0 2px 2px rgba(255,255,255,.035)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.predict-zone-glass-card:before{content:""!important;position:absolute!important;inset:0!important;z-index:0!important;border-radius:inherit!important;display:block!important;pointer-events:none!important;background:radial-gradient(34px 34px at 0 0,rgba(186,53,87,.20) 0%,rgba(146,35,66,.09) 42%,rgba(104,18,44,0) 76%),radial-gradient(38px 38px at 100% 100%,rgba(156,38,70,.26) 0%,rgba(92,10,35,.12) 46%,rgba(69,5,26,0) 78%)!important;box-shadow:inset 3px 3px .5px -3.5px rgba(255,255,255,.10),inset -3px -3px .5px -3.5px rgba(156,38,70,.52),inset 1px 1px 1px -.5px rgba(140,29,61,.22),inset -1px -1px 1px -.5px rgba(92,10,35,.30),inset 6px 5px 13px -8px rgba(255,255,255,.13),inset -5px -4px 11px -8px rgba(255,255,255,.055),inset 0 0 10px rgba(69,5,26,.12)!important;opacity:1!important}.predict-zone-glass-card>*{position:relative!important;z-index:1!important}

.predict-zone-card-top{position:absolute!important;top:19px!important;right:13px!important;z-index:4!important}.predict-zone-countdown{display:block;color:rgba(255,255,255,.82)!important;font-size:18px!important;font-weight:950!important;letter-spacing:-.05em!important;line-height:1!important;font-variant-numeric:tabular-nums!important}
.predict-zone-hero{display:flex;align-items:center;gap:9px;min-height:42px;padding-right:78px;transition:min-height .42s cubic-bezier(.18,.88,.24,1),padding .42s cubic-bezier(.18,.88,.24,1),transform .42s cubic-bezier(.18,.88,.24,1)}.predict-zone-question-copy{min-width:0}.predict-zone-question-row{display:block;min-height:0;margin:0!important;padding:0!important;color:#fff;font-size:18px!important;font-weight:950!important;line-height:1.05!important;letter-spacing:-.04em!important;text-shadow:none!important;white-space:normal;transition:font-size .42s cubic-bezier(.18,.88,.24,1)}
.predict-zone-question-image{position:relative;flex:0 0 40px;width:40px;height:40px;display:grid;place-items:center;background-position:center!important;background-size:contain!important;background-repeat:no-repeat!important;background-color:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;filter:drop-shadow(0 8px 16px rgba(0,0,0,.28));transform:translate3d(0,0,0);transition:width .42s cubic-bezier(.18,.88,.24,1),height .42s cubic-bezier(.18,.88,.24,1),flex-basis .42s cubic-bezier(.18,.88,.24,1),transform .5s cubic-bezier(.18,.88,.24,1),filter .36s ease}.predict-zone-symbol-fallback{position:relative;z-index:1;color:#fff;font-size:18px;font-weight:950;letter-spacing:-.06em;opacity:.9}.predict-zone-question-image.has-image .predict-zone-symbol-fallback{opacity:0}
.predict-zone-glass-card.trend-up .predict-zone-question-image{animation:predictMarketRise 2.8s ease-in-out infinite}.predict-zone-glass-card.trend-down .predict-zone-question-image{animation:predictMarketFall 2.8s ease-in-out infinite}
@keyframes predictMarketRise{0%,100%{transform:translate3d(0,0,0) rotate(0deg) scale(1)}48%{transform:translate3d(0,-3px,0) rotate(1.4deg) scale(1.045)}70%{transform:translate3d(0,-1px,0) rotate(.4deg) scale(1.018)}}@keyframes predictMarketFall{0%,100%{transform:translate3d(0,0,0) rotate(0deg) scale(1)}48%{transform:translate3d(0,3px,0) rotate(-1.4deg) scale(.985)}70%{transform:translate3d(0,1px,0) rotate(-.4deg) scale(.995)}}

.predict-zone-live-meta{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:7px!important;max-height:44px;overflow:hidden;opacity:1;margin:11px 0 10px!important;transform:translate3d(0,0,0);transition:max-height .42s cubic-bezier(.18,.88,.24,1),margin .42s cubic-bezier(.18,.88,.24,1),opacity .2s ease,transform .42s cubic-bezier(.18,.88,.24,1)}.predict-zone-live-meta>div{height:44px!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.055),inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;padding:7px 10px!important;display:grid!important;align-content:center!important;gap:2px!important;box-sizing:border-box!important}.predict-zone-live-meta span{color:rgba(255,255,255,.35)!important;font-size:8px!important;font-weight:800!important;text-transform:uppercase!important;letter-spacing:.10em!important}.predict-zone-live-meta strong{color:#fff!important;font-size:13px!important;font-weight:900!important;letter-spacing:-.035em!important;white-space:nowrap!important;font-variant-numeric:tabular-nums!important}
.predict-zone-live-price.tick-up{animation:predictPriceUp .42s cubic-bezier(.18,.88,.24,1)}.predict-zone-live-price.tick-down{animation:predictPriceDown .42s cubic-bezier(.18,.88,.24,1)}@keyframes predictPriceUp{0%{transform:translateY(0);opacity:.72}42%{transform:translateY(-2px);opacity:1}100%{transform:translateY(0);opacity:1}}@keyframes predictPriceDown{0%{transform:translateY(0);opacity:.72}42%{transform:translateY(2px);opacity:1}100%{transform:translateY(0);opacity:1}}

.predict-zone-chart-preview{position:relative!important;width:100%!important;height:170px!important;border-radius:21px!important;background:rgba(0,0,0,.15)!important;overflow:hidden!important;margin:0 0 10px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055)!important;transform:translate3d(0,0,0) scale(1);transform-origin:center top;transition:height .48s cubic-bezier(.18,.88,.24,1),margin .42s cubic-bezier(.18,.88,.24,1),transform .48s cubic-bezier(.18,.88,.24,1),border-radius .42s cubic-bezier(.18,.88,.24,1)!important}.predict-zone-chart-grid{position:absolute;inset:0 66px 0 0;background:linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:48px 100%;opacity:.44}.predict-zone-chart-grid span{position:absolute;left:0;right:0;height:1px;background:rgba(255,255,255,.035);transform:translateY(-50%);transition:top .26s cubic-bezier(.18,.88,.24,1),opacity .18s ease;will-change:top,opacity}.predict-zone-price-axis{position:absolute;right:7px;top:0;bottom:0;width:58px;z-index:4;pointer-events:none}.predict-zone-price-axis span{position:absolute;right:0;transform:translateY(-50%);color:rgba(255,255,255,.36);font-size:10px;font-weight:760;letter-spacing:-.03em;text-align:right;white-space:nowrap;transition:top .26s cubic-bezier(.18,.88,.24,1),opacity .18s ease;will-change:top,opacity}.predict-zone-chart-preview svg{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 7px 12px rgba(255,255,255,.055))}.predict-zone-chart-fill{fill:url(#predictMainFill)}.predict-zone-chart-line{fill:none;stroke:url(#predictMainLine);stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round}.predict-zone-chart-dot{position:absolute;left:0;top:0;width:8px;height:8px;border-radius:999px;background:#fff;box-shadow:0 0 0 5px rgba(255,255,255,.07),0 0 14px rgba(255,255,255,.22);transform:translate(-50%,-50%)}.predict-zone-price-guide{position:absolute;left:0;right:66px;top:0;height:0;border-top:1px dashed rgba(255,255,255,.28);transform:translateY(-50%);pointer-events:none;opacity:.56}.predict-zone-start-guide{position:absolute;left:0;right:70px;height:0;border-top:1px dashed rgba(255,255,255,.30);z-index:4;opacity:0;pointer-events:none}.predict-zone-start-guide.show{opacity:1}.predict-zone-start-guide span{position:absolute;left:9px;top:-16px;font-size:8px;font-weight:850;letter-spacing:.10em;color:rgba(255,255,255,.38);text-transform:uppercase}.predict-zone-start-target{display:none!important}
.predict-zone-chart-loader{position:absolute;inset:0;z-index:8;display:grid;place-items:center;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.12));opacity:1;transition:opacity .24s ease}.predict-zone-chart-loader span{width:42px;height:42px;border-radius:50%;border:2px solid rgba(255,255,255,.08);border-top-color:rgba(255,255,255,.75);border-right-color:rgba(255,255,255,.28);animation:predictLoaderOrbit .82s linear infinite}.predict-zone-chart-preview.ready .predict-zone-chart-loader{opacity:0;visibility:hidden}@keyframes predictLoaderOrbit{to{transform:rotate(360deg)}}

.predict-zone-decision-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 3px 7px;color:rgba(255,255,255,.40);font-size:10px;font-weight:800;max-height:24px;opacity:1;transform:translate3d(0,0,0);overflow:hidden;transition:max-height .38s cubic-bezier(.18,.88,.24,1),margin .38s cubic-bezier(.18,.88,.24,1),opacity .22s ease,transform .38s cubic-bezier(.18,.88,.24,1)}.predict-zone-decision-head strong{color:rgba(255,255,255,.68);font-size:10px;font-weight:900;white-space:nowrap}.predict-zone-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;max-height:38px;opacity:1;transform:translate3d(0,0,0);overflow:hidden;transition:max-height .4s cubic-bezier(.18,.88,.24,1),opacity .22s ease,transform .4s cubic-bezier(.18,.88,.24,1)}.predict-zone-choice{position:relative!important;overflow:hidden!important;height:38px!important;padding:0 12px!important;border:0!important;border-radius:28px!important;color:#fff!important;font-size:12px!important;font-weight:950!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;background:radial-gradient(34px 34px at 0 0,rgba(186,53,87,.16) 0%,rgba(146,35,66,.07) 42%,rgba(104,18,44,0) 76%),radial-gradient(36px 36px at 100% 100%,rgba(172,46,79,.15) 0%,rgba(133,30,60,.065) 43%,rgba(94,16,39,0) 78%),radial-gradient(118% 76% at 10% -16%,rgba(255,255,255,.12) 0%,rgba(255,255,255,.032) 30%,rgba(255,255,255,0) 58%),radial-gradient(96% 72% at 102% 108%,rgba(255,255,255,.052) 0%,rgba(255,255,255,.010) 34%,rgba(255,255,255,0) 62%),radial-gradient(92% 78% at 88% 112%,rgba(72,5,27,.11) 0%,rgba(42,3,16,0) 60%)!important;box-shadow:0 12px 30px rgba(31,1,10,.32),0 0 18px rgba(69,5,26,.15),inset 3px 3px .5px -3.5px rgba(255,255,255,.10),inset -3px -3px .5px -3.5px rgba(156,38,70,.48),inset 1px 1px 1px -.5px rgba(140,29,61,.30),inset -1px -1px 1px -.5px rgba(124,22,53,.24),inset 0 0 6px 6px rgba(255,255,255,.055),inset 0 0 2px 2px rgba(255,255,255,.035),inset 0 1px 0 rgba(112,18,49,.065),inset 0 -1px 0 rgba(88,12,37,.15)!important;backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;-webkit-backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;isolation:isolate!important;transform:translate3d(0,0,0)!important;transform-origin:center!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;transition:transform .38s cubic-bezier(.18,.88,.24,1),filter .32s ease,opacity .32s ease!important}.predict-zone-choice-symbol{display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;font-size:16px;font-weight:950;line-height:1;transform:translate3d(0,0,0)}.predict-zone-choice-up .predict-zone-choice-symbol{color:#d7e9dd}.predict-zone-choice-down .predict-zone-choice-symbol{color:#e7c9d2}.predict-zone-choice:active{transform:translate3d(0,1px,0) scale(.97)!important;filter:brightness(1.10) saturate(1.05)!important;transition-duration:.07s!important}

.predict-zone-result-strip{position:relative;margin:10px 0 0;display:none;overflow:hidden;border-radius:20px}.predict-zone-result-strip.show{display:block}.predict-zone-history-track{display:flex;gap:6px;overflow-x:auto;overflow-y:hidden;padding:0 2px 1px;scrollbar-width:none}.predict-zone-history-track::-webkit-scrollbar{display:none}.predict-zone-history-card{flex:0 0 auto;min-width:92px;white-space:nowrap;background:#000!important}.predict-zone-history-card.history-up{color:#d7e9dd!important}.predict-zone-history-card.history-down{color:#e4a1b2!important}

.predict-zone-bet-stage{max-height:0;overflow:hidden;opacity:0;pointer-events:none;transform:translate3d(0,12px,0);transform-origin:center top;margin:0;transition:max-height .42s cubic-bezier(.18,.88,.24,1),opacity .18s ease,transform .38s cubic-bezier(.18,.88,.24,1)}
.predict-zone-bet-input-wrap{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:8px;min-height:44px;border-radius:18px;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.055),inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;padding:0 13px;margin:0 0 3px}
.predict-zone-bet-input{width:100%;min-width:0;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;color:#fff;font-size:24px;font-weight:950;letter-spacing:-.05em;appearance:textfield}.predict-zone-bet-input::-webkit-outer-spin-button,.predict-zone-bet-input::-webkit-inner-spin-button{appearance:none;margin:0}.predict-zone-bet-estimate{color:rgba(255,255,255,.82);font-size:12px;font-weight:950;white-space:nowrap}.predict-zone-bet-side{display:grid;justify-items:end;gap:3px}.predict-zone-bet-token{font-size:12px;font-weight:900;color:rgba(255,255,255,.66)}.predict-zone-bet-usd{font-size:10px;font-weight:760;color:rgba(255,255,255,.38);white-space:nowrap}
.predict-zone-bet-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:3px 0}.predict-zone-bet-presets button,.predict-zone-bet-submit{position:relative!important;overflow:hidden!important;height:34px!important;padding:0 12px!important;border:0!important;border-radius:28px!important;background:radial-gradient(34px 34px at 0 0,rgba(186,53,87,.16) 0%,rgba(146,35,66,.07) 42%,rgba(104,18,44,0) 76%),radial-gradient(36px 36px at 100% 100%,rgba(172,46,79,.15) 0%,rgba(133,30,60,.065) 43%,rgba(94,16,39,0) 78%),radial-gradient(118% 76% at 10% -16%,rgba(255,255,255,.12) 0%,rgba(255,255,255,.032) 30%,rgba(255,255,255,0) 58%),radial-gradient(96% 72% at 102% 108%,rgba(255,255,255,.052) 0%,rgba(255,255,255,.010) 34%,rgba(255,255,255,0) 62%),radial-gradient(92% 78% at 88% 112%,rgba(72,5,27,.11) 0%,rgba(42,3,16,0) 60%)!important;color:#fff!important;font-size:12px!important;font-weight:950!important;box-shadow:0 12px 30px rgba(31,1,10,.32),0 0 18px rgba(69,5,26,.15),inset 3px 3px .5px -3.5px rgba(255,255,255,.10),inset -3px -3px .5px -3.5px rgba(156,38,70,.48),inset 1px 1px 1px -.5px rgba(140,29,61,.30),inset -1px -1px 1px -.5px rgba(124,22,53,.24),inset 0 0 6px 6px rgba(255,255,255,.055),inset 0 0 2px 2px rgba(255,255,255,.035),inset 0 1px 0 rgba(112,18,49,.065),inset 0 -1px 0 rgba(88,12,37,.15)!important;backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;-webkit-backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;isolation:isolate!important;transform:translate3d(0,0,0)!important;transform-origin:center!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;transition:transform .28s cubic-bezier(.18,.88,.24,1),filter .24s ease,opacity .24s ease!important}.predict-zone-bet-submit{width:100%!important}.predict-zone-bet-presets button:active,.predict-zone-bet-submit:active{transform:translate3d(0,1px,0) scale(.96)!important;filter:brightness(1.12) saturate(1.06)!important;transition-duration:.07s!important}.predict-zone-bet-submit:disabled{opacity:.55}.predict-zone-bet-status{display:block;min-height:0;margin:5px 0 0;text-align:center;color:rgba(255,255,255,.42);font-size:10px;font-weight:760}.predict-zone-bet-status:empty{display:none}.predict-zone-bet-status.bad{color:rgba(255,160,160,.9)}.predict-zone-bet-status.good{color:rgba(185,255,210,.9)}

.predict-zone-glass-card.bet-mode .predict-zone-live-meta{max-height:0;margin:0!important;opacity:0;transform:translate3d(0,-8px,0)}.predict-zone-glass-card.bet-mode .predict-zone-decision-head{max-height:0;margin:0!important;opacity:0;transform:translate3d(0,-10px,0)}.predict-zone-glass-card.bet-mode .predict-zone-actions{max-height:0;opacity:0;transform:translate3d(0,-12px,0)}.predict-zone-glass-card.bet-mode .predict-zone-chart-preview{height:136px!important}.predict-zone-glass-card.bet-mode .predict-zone-bet-stage{max-height:154px;overflow:visible;opacity:1;pointer-events:auto;transform:translate3d(0,0,0)}
html body:has(#predictzone.active .predict-zone-bet-input:focus) .tabs{opacity:0!important;transform:translate3d(-50%,82px,0)!important;pointer-events:none!important}

@media(max-width:380px){.predict-zone-view{padding-left:0!important;padding-right:0!important}#predictzone .predict-zone-category-menu{left:0!important;width:100%!important;padding-left:0!important;padding-right:0!important}.predict-zone-glass-card{min-height:0!important;padding:10px 12px!important}.predict-zone-card-top{top:18px!important;right:12px!important}.predict-zone-countdown{font-size:17px!important}.predict-zone-hero{padding-right:72px}.predict-zone-question-row{font-size:17px!important}.predict-zone-question-image{flex-basis:38px;width:38px;height:38px}.predict-zone-live-meta>div{height:44px!important;padding:6px 8px!important}.predict-zone-live-meta strong{font-size:12px!important}.predict-zone-chart-preview{height:158px!important;border-radius:20px!important}.predict-zone-glass-card.bet-mode .predict-zone-chart-preview{height:124px!important}}
@media(prefers-reduced-motion:reduce){.predict-zone-question-image,.predict-zone-live-price,.predict-zone-choice-symbol{animation:none!important}.predict-zone-category-card,.predict-zone-choice,.predict-zone-glass-card,.predict-zone-live-meta,.predict-zone-chart-preview,.predict-zone-bet-stage,.predict-zone-bet-presets button,.predict-zone-bet-submit{transition:none!important}}
`;

export const PREDICT_IMAGE_PRELOAD_SCRIPT = `
(function(){
  var manifests=['/app/api/predict-markets','/app/api/predict-crypto-card-images','/app/api/predict-button-images'];
  var urls={'/app/api/section-background/predict.png':true};
  function collect(value){
    if(!value||typeof value!=='object')return;
    if(typeof value.imageUrl==='string'&&value.imageUrl)urls[value.imageUrl]=true;
    Object.keys(value).forEach(function(key){collect(value[key])});
  }
  function cacheImage(url){
    return fetch(url,{cache:'force-cache'}).then(function(response){
      if(!response.ok)throw new Error('HTTP '+response.status);
      return response.blob();
    }).catch(function(){});
  }
  Promise.all(manifests.map(function(url){
    return fetch(url,{cache:'force-cache'}).then(function(response){return response.ok?response.json():null}).then(collect).catch(function(){});
  })).then(function(){return Promise.all(Object.keys(urls).map(cacheImage))}).catch(function(){});
})();
`;

export const PREDICT_ZONE_SCRIPT = `
(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}
  ready(function(){
    var root=document.getElementById('predictzone');
    if(!root||root.dataset.predictRuntimeReady==='1')return;
    root.dataset.predictRuntimeReady='1';

    var MARKETS={
      bitcoin:{label:'Bitcoin',question:'Bitcoin up or down?',stream:'btcusdt@miniTicker',rest:'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',history:'https://api.binance.com/api/v3/aggTrades?symbol=BTCUSDT&limit=23',decimals:0,step:5,duration:300000,symbol:'₿'},
      oil:{label:'Oil',question:'Oil in 72h up or down?',stream:'clusdt@miniTicker',rest:'https://fapi.binance.com/fapi/v1/ticker/price?symbol=CLUSDT',history:'https://fapi.binance.com/fapi/v1/aggTrades?symbol=CLUSDT&limit=23',wsBase:'wss://fstream.binance.com/public/ws/',decimals:2,step:.05,duration:259200000,symbol:'Oil'},
      gold:{label:'Gold',question:'Gold up or down?',stream:'paxgusdt@miniTicker',rest:'https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT',history:'https://api.binance.com/api/v3/aggTrades?symbol=PAXGUSDT&limit=23',decimals:2,step:.5,duration:300000,symbol:'Au'}
    };
    var market='bitcoin',ws=null,raf=0,seq=0,values=[],historyValues=[],current=0,last=0,raw=0,scaleMin=0,scaleMax=0,readyPrice=false,entry=0,slot=0,lastPointAt=0,lastDrawAt=0,currentRound=null,side='up',busy=false,images={},trend='flat',lastVisualPrice=0,priceTickTimer=0;
    var W=360,H=220,L=14,R=78,P=24,HISTORY=23;
    var menu=root.querySelector('.predict-zone-category-menu'),card=root.querySelector('[data-predict-card]'),chart=root.querySelector('[data-predict-chart]'),line=chart&&chart.querySelector('.predict-zone-chart-line'),fill=chart&&chart.querySelector('.predict-zone-chart-fill'),dot=chart&&chart.querySelector('.predict-zone-chart-dot'),guide=chart&&chart.querySelector('.predict-zone-price-guide'),axisLayer=chart&&chart.querySelector('[data-predict-price-axis]'),gridLayer=chart&&chart.querySelector('[data-predict-grid]'),startGuide=chart&&chart.querySelector('[data-predict-start-guide]');
    var question=root.querySelector('[data-predict-question]'),questionImage=root.querySelector('[data-predict-question-image]'),symbolFallback=root.querySelector('[data-predict-symbol-fallback]'),countdown=root.querySelector('[data-predict-countdown]'),live=root.querySelector('.predict-zone-live-price'),start=root.querySelector('.predict-zone-start-price'),trendLabel=root.querySelector('[data-predict-trend-label]'),result=root.querySelector('[data-predict-result]');
    var betStage=root.querySelector('[data-predict-bet-stage]'),betInput=root.querySelector('[data-predict-bet-input]'),betUsd=root.querySelector('[data-predict-bet-usd]'),betEstimate=root.querySelector('[data-predict-bet-estimate]'),betStatus=root.querySelector('[data-predict-bet-status]'),betSubmit=root.querySelector('[data-predict-bet-submit]');
    var betOpen=false,betCloseTimer=0;

    function cfg(){return MARKETS[market]||MARKETS.bitcoin}
    function isActive(){return root.classList.contains('active')&&!document.hidden}
    function uid(){var tg=window.Telegram&&window.Telegram.WebApp,u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;return String((u&&u.id)||localStorage.getItem('ownerId')||'').trim()}
    function telegramInitData(){var tg=window.Telegram&&window.Telegram.WebApp;return tg?String(tg.initData||''):''}
    function formatPrice(v){var n=Number(v),c=cfg();return !isFinite(n)||n<=0?'Loading':'$'+n.toLocaleString('en-US',{minimumFractionDigits:c.decimals,maximumFractionDigits:c.decimals})}
    function formatTon(v){return Number(v||0).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:4})}
    function timeLeft(ms){var s=Math.max(0,Math.ceil(ms/1000));if(s>=3600){var h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return h+'h '+String(m).padStart(2,'0')+'m'}return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
    function slotFor(now){var d=cfg().duration;return Math.floor(now/d)*d}
    function y(v,scale){return Math.max(P,Math.min(H-P,P+((scale.max-v)/(scale.max-scale.min||1))*(H-P*2)))}
    function path(points){if(!points.length)return'';var d='M'+points[0].x.toFixed(1)+' '+points[0].y.toFixed(1);for(var i=0;i<points.length-1;i++){var a=points[i],b=points[i+1],mx=(a.x+b.x)/2;d+=' C '+mx.toFixed(1)+' '+a.y.toFixed(1)+' '+mx.toFixed(1)+' '+b.y.toFixed(1)+' '+b.x.toFixed(1)+' '+b.y.toFixed(1)}return d}
    function niceTickStep(span,count){if(!isFinite(span)||span<=0)return 1;var rough=span/Math.max(1,count),power=Math.pow(10,Math.floor(Math.log(rough)/Math.LN10)),error=rough/power,factor=error>=Math.sqrt(50)?10:error>=Math.sqrt(10)?5:error>=Math.sqrt(2)?2:1;return factor*power}
    function axisCapacity(){return window.innerWidth<=380?3:4}
    function priceTicks(scale){
      var c=cfg(),maxCount=axisCapacity(),span=scale.max-scale.min,quantum=Math.max(c.step,Math.pow(10,-Math.max(0,c.decimals))),precision=Math.max(0,c.decimals+4),count,step,first,v,ticks,mid,best,bestScore,i,windowTicks,score;
      for(count=maxCount;count>=2;count--){
        step=Math.max(quantum,niceTickStep(span,Math.max(1,count-1)));
        step=Math.ceil((step-1e-12)/quantum)*quantum;
        first=Math.ceil(scale.min/step)*step;ticks=[];
        for(v=first;v<=scale.max+step*1e-9&&ticks.length<32;v+=step)ticks.push(Number(v.toFixed(precision)));
        if(ticks.length<2)continue;
        if(ticks.length>count){mid=(scale.min+scale.max)/2;best=ticks.slice(0,count);bestScore=Infinity;for(i=0;i<=ticks.length-count;i++){windowTicks=ticks.slice(i,i+count);score=Math.abs((windowTicks[0]+windowTicks[windowTicks.length-1])/2-mid);if(score<bestScore){bestScore=score;best=windowTicks}}ticks=best}
        return ticks;
      }
      return[];
    }
    function autoScale(prices){
      var c=cfg(),valid=prices.filter(function(v){return isFinite(v)&&v>0}),precision=Math.pow(10,-Math.max(0,c.decimals)),minSpan=Math.max(c.step*8,precision*8),min,max,span,mid,pad,targetMin,targetMax,currentSpan,innerMin,innerMax,targetSpan,targetMid,desiredMin,desiredMax,needsMove;
      if(entry>0)valid.push(entry);
      if(!valid.length)valid.push(Number(current||last||1));
      min=Math.min.apply(Math,valid);max=Math.max.apply(Math,valid);span=max-min;
      if(!isFinite(span)||span<minSpan){mid=(min+max)/2;min=mid-minSpan/2;max=mid+minSpan/2;span=minSpan}
      pad=Math.max(span*.18,c.step*.75);targetMin=min-pad;targetMax=max+pad;
      if(!scaleMin||!scaleMax){scaleMin=targetMin;scaleMax=targetMax;return{min:scaleMin,max:scaleMax}}
      currentSpan=scaleMax-scaleMin;innerMin=scaleMin+currentSpan*.20;innerMax=scaleMax-currentSpan*.20;
      needsMove=min<innerMin||max>innerMax||(targetMax-targetMin)>currentSpan*.92;
      if(needsMove){
        targetSpan=Math.max(currentSpan,targetMax-targetMin,minSpan);targetMid=(min+max)/2;
        if(max>innerMax)targetMid+=Math.min(targetSpan*.08,max-innerMax);
        else if(min<innerMin)targetMid-=Math.min(targetSpan*.08,innerMin-min);
        desiredMin=targetMid-targetSpan/2;desiredMax=targetMid+targetSpan/2;
        scaleMin+=(desiredMin-scaleMin)*.075;scaleMax+=(desiredMax-scaleMax)*.075;
      }
      return{min:scaleMin,max:scaleMax}
    }
    function renderPriceTicks(scale,ticks){
      if(!axisLayer||!gridLayer)return;
      var max=4,label,lineEl,i,top,text;
      while(axisLayer.children.length<max){label=document.createElement('span');label.style.opacity='0';axisLayer.appendChild(label)}
      while(gridLayer.children.length<max){lineEl=document.createElement('span');lineEl.style.opacity='0';gridLayer.appendChild(lineEl)}
      for(i=0;i<max;i++){
        label=axisLayer.children[i];lineEl=gridLayer.children[i];
        if(i<ticks.length){top=y(ticks[i],scale)/H*100+'%';text=formatPrice(ticks[i]);if(label.textContent!==text)label.textContent=text;label.style.top=top;lineEl.style.top=top;label.style.opacity='1';lineEl.style.opacity='1'}
        else{label.style.opacity='0';lineEl.style.opacity='0'}
      }
    }
    function clipVisible(points,right){
      var out=[],first=0,a,b,t,i;
      while(first<points.length&&points[first].x<L)first++;
      if(first>0&&first<points.length){a=points[first-1];b=points[first];t=(L-a.x)/((b.x-a.x)||1);out.push({x:L,v:a.v+(b.v-a.v)*t})}
      else if(first===0&&points.length){out.push({x:L,v:points[0].v})}
      for(i=first;i<points.length;i++){if(points[i].x<=right&&(!out.length||points[i].x>out[out.length-1].x+.001))out.push(points[i])}
      return out.length>=2?out:points.slice(-2);
    }
    function setTrend(next){
      var n=next==='up'?'up':next==='down'?'down':'flat';
      if(trend===n&&card&&card.classList.contains('trend-'+n))return;
      trend=n;
      if(card){card.classList.remove('trend-up','trend-down','trend-flat');card.classList.add('trend-'+n)}
      if(trendLabel)trendLabel.textContent=n==='up'?'Above start':n==='down'?'Below start':'At start';
    }
    function syncTrend(){
      var p=Number(raw||current||last||0),base=Number(entry||0);
      if(!p||!base){setTrend('flat');if(trendLabel)trendLabel.textContent='Waiting for price';return}
      var delta=p-base,epsilon=Math.max(base*.0000005,Math.pow(10,-Math.max(0,cfg().decimals))*0.25);
      setTrend(delta>epsilon?'up':delta<-epsilon?'down':'flat');
    }
    function animateLivePrice(next,prev){
      if(!live||!prev||!next||next===prev)return;
      live.classList.remove('tick-up','tick-down');
      void live.offsetWidth;
      live.classList.add(next>prev?'tick-up':'tick-down');
      if(priceTickTimer)clearTimeout(priceTickTimer);
      priceTickTimer=setTimeout(function(){if(live)live.classList.remove('tick-up','tick-down')},460);
    }
    function showLoading(){readyPrice=false;lastVisualPrice=0;scaleMin=0;scaleMax=0;setTrend('flat');if(chart)chart.classList.remove('ready');if(live)live.textContent='Loading';if(start)start.textContent='Loading';if(trendLabel)trendLabel.textContent='Waiting for price';if(axisLayer)axisLayer.textContent='';if(gridLayer)gridLayer.textContent=''}
    function seed(price){values=(historyValues||[]).map(Number).filter(function(v){return isFinite(v)&&v>0}).slice(-HISTORY);if(!values.length)values=[price];current=price;last=price;raw=price;scaleMin=0;scaleMax=0;lastPointAt=0}
    function draw(progress){
      if(!readyPrice||!values.length||!line||!fill)return;
      var right=W-R,step=(W-L-R)/HISTORY,rawPts=values.map(function(v,i){return{x:right-((values.length-i)+progress)*step,v:v}});
      rawPts.push({x:right,v:current});
      var visibleRaw=clipVisible(rawPts,right),scale=autoScale(visibleRaw.map(function(p){return p.v})),ticks=priceTicks(scale),visible=visibleRaw.map(function(p){return{x:p.x,y:y(p.v,scale),v:p.v}}),d=path(visible),first=visible[0],lastPoint=visible[visible.length-1],xp=lastPoint.x/W*100,yp=lastPoint.y/H*100;
      line.setAttribute('d',d);fill.setAttribute('d',d+' L '+lastPoint.x.toFixed(1)+' '+H+' L '+first.x.toFixed(1)+' '+H+' Z');
      if(dot){dot.style.left=xp+'%';dot.style.top=yp+'%'}
      if(guide)guide.style.top=yp+'%';
      renderPriceTicks(scale,ticks);
      if(startGuide){startGuide.classList.remove('show');if(entry&&entry<=scale.max&&entry>=scale.min){startGuide.style.top=y(entry,scale)/H*100+'%';startGuide.classList.add('show')}}
      if(start&&entry)start.textContent=formatPrice(entry);
      if(live)live.textContent=formatPrice(current);
      syncTrend()
    }
    function applyPrice(value,my,id){if(my!==seq||id!==market)return;var p=Number(value);if(!isFinite(p)||p<=0)return;var prev=Number(raw||lastVisualPrice||0);raw=p;last=p;if(!readyPrice){readyPrice=true;seed(p);if(chart)chart.classList.add('ready');draw(0)}animateLivePrice(p,prev);lastVisualPrice=p;syncTrend()}
    function loadPriceHistory(my,id){var c=cfg();historyValues=[];if(!c.history)return Promise.resolve();return fetch(c.history,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(function(rows){if(my!==seq||id!==market)return;historyValues=(Array.isArray(rows)?rows:[]).map(function(row){return Number(row&&row.p)}).filter(function(v){return isFinite(v)&&v>0}).slice(-HISTORY)}).catch(function(){if(my===seq&&id===market)historyValues=[]})}
    function closeFeed(){seq++;if(ws){try{ws.onmessage=null;ws.onclose=null;ws.onerror=null;ws.close()}catch(e){}ws=null}}
    function connectFeed(){closeFeed();var my=seq,id=market,c=cfg();if(!isActive())return;if(!c.stream||!c.rest){if(currentRound&&Number(currentRound.startPrice)>0){applyPrice(Number(currentRound.startPrice),my,id)}return}fetch(c.rest,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(function(j){applyPrice(j&&j.price,my,id)}).catch(function(){});try{ws=new WebSocket((c.wsBase||'wss://stream.binance.com:9443/ws/')+c.stream);ws.onmessage=function(e){if(my!==seq||id!==market)return;try{var j=JSON.parse(e.data);applyPrice(j.c||j.p,my,id)}catch(_){}};ws.onclose=function(){if(my!==seq)return;ws=null;if(isActive())setTimeout(connectFeed,6000)};ws.onerror=function(){try{ws&&ws.close()}catch(e){}}}catch(e){}}
    function renderImage(){if(!questionImage)return;var url=images[market]||'';questionImage.style.backgroundImage=url?'url("'+url.replace(/"/g,'')+'")':'';questionImage.classList.toggle('has-image',!!url);if(symbolFallback)symbolFallback.textContent=cfg().symbol||''}
    function loadImages(){fetch('/app/api/predict-markets',{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){var map=d&&d.markets||{};['bitcoin','oil','gold'].forEach(function(id){var u=map[id]&&map[id].imageUrl||'';if(u)images[id]=u});renderImage()}).catch(function(){})}
    function renderHistory(round){if(!result||!round)return;var all=[];(round.userBets||[]).forEach(function(b){all.push(b)});(round.recentUserBets||[]).forEach(function(b){if(!all.some(function(x){return x.id===b.id}))all.push(b)});var list=all.filter(function(b){return b&&b.status}).slice(0,20);result.className='predict-zone-result-strip';if(!list.length){result.innerHTML='';return}var html='<div class="predict-zone-history-track">';list.forEach(function(b){var st=String(b.status||''),stake=Number(b.stakeTon||0),pay=Number(b.payoutTon||0),kind=st==='won'?'win':st==='lost'?'loss':st==='refunded'?'refund':'active',amount=st==='won'?('+'+formatTon(pay)):st==='lost'?('-'+formatTon(stake)):formatTon(pay||stake),isDown=String(b.side||'').toLowerCase()==='down',label=isDown?'Down':'Up',direction=isDown?'history-down':'history-up';html+='<span class="predict-zone-history-card predict-zone-choice '+kind+' '+direction+'">'+label+' '+amount+'</span>'});result.innerHTML=html+'</div>';result.classList.add('show')}
    function updateBalance(payload){var controls=payload&&payload.userControls;if(!controls||controls.tonBalanceNano===undefined)return;try{if(window.VexaTonBalance&&window.VexaTonBalance.write)window.VexaTonBalance.write(Number(controls.tonBalanceNano),0,false);else window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{tonBalanceNano:Number(controls.tonBalanceNano)}}))}catch(e){}}
    function syncRound(){var id=uid(),initData=telegramInitData(),headers={};if(id&&initData)headers['x-telegram-init-data']=initData;return fetch('/app/api/predict-round?market='+encodeURIComponent(market)+'&userId='+encodeURIComponent(id),{cache:'no-store',headers:headers}).then(function(r){return r.json()}).then(function(d){var round=d&&d.round;if(!round)return;currentRound=round;updateBalance(d);renderHistory(round);var starts=Date.parse(round.startsAt||'');if(starts)slot=starts;if(Number(round.startPrice)>0){entry=Number(round.startPrice);if(start)start.textContent=formatPrice(entry);if(!cfg().stream&&!readyPrice)applyPrice(entry,seq,market)}if(countdown&&Number(round.remainingMs)>=0)countdown.textContent=timeLeft(Number(round.remainingMs));syncTrend();updateEstimate()}).catch(function(){})}
    function estimate(amount){var pools=currentRound&&currentRound.pools;if(!amount||!pools)return 0;var chosen=side==='down'?'down':'up',other=chosen==='up'?'down':'up',own=Number(pools[chosen]&&pools[chosen].stakeTon||0),opp=Number(pools[other]&&pools[other].stakeTon||0);if(opp<=0)return amount;return amount+(amount/(own+amount))*(opp*.95)}
    function updateEstimate(){var amount=Number(betInput&&betInput.value||0);if(betUsd)betUsd.textContent='≈ $0.00';if(betEstimate)betEstimate.textContent=amount>0?'+'+formatTon(estimate(amount)):''}
    function setStatus(text,type){if(!betStatus)return;betStatus.textContent=text||'';betStatus.classList.toggle('bad',type==='bad');betStatus.classList.toggle('good',type==='good')}
    function finishBetClose(){if(betCloseTimer){clearTimeout(betCloseTimer);betCloseTimer=0}if(betOpen)return;if(card){card.classList.remove('bet-mode');card.style.removeProperty('height')}if(betStage)betStage.setAttribute('aria-hidden','true')}
    function focusBetInput(){if(!betInput)return;betInput.disabled=false;betInput.readOnly=false;try{betInput.focus({preventScroll:true})}catch(_){try{betInput.focus()}catch(__){}}}
    function openBet(nextSide){side=nextSide==='down'?'down':'up';if(betInput)betInput.value='';updateEstimate();setStatus('','');if(betCloseTimer){clearTimeout(betCloseTimer);betCloseTimer=0}betOpen=true;if(card){var cardRect=card.getBoundingClientRect();if(cardRect.height>0)card.style.height=cardRect.height+'px';card.classList.add('bet-mode')}if(betStage)betStage.setAttribute('aria-hidden','false')}
    function closeBet(){if(!betOpen)return;betOpen=false;if(betInput&&document.activeElement===betInput)betInput.blur();var tg=window.Telegram&&window.Telegram.WebApp;if(tg&&typeof tg.hideKeyboard==='function'){try{tg.hideKeyboard()}catch(_){}}if(card)card.classList.remove('bet-mode');betCloseTimer=setTimeout(finishBetClose,440)}
    function submitBet(){if(busy)return;var amount=Number(betInput&&betInput.value||0),id=uid(),initData=telegramInitData();if(!id||!initData){setStatus('Open the Mini App inside Telegram.','bad');return}if(!amount||amount<=0){setStatus('Enter a valid GRAM amount.','bad');focusBetInput();return}busy=true;if(betSubmit){betSubmit.disabled=true;betSubmit.textContent='Placing...'}setStatus('Checking balance...','');fetch('/app/api/predict-bet',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,initData:initData,market:market,side:side,stakeTon:amount,tonUsdSnapshot:0})}).then(function(r){return r.json().then(function(j){return{ok:r.ok,json:j}})}).then(function(x){if(!x.ok||!x.json||x.json.ok===false)throw new Error((x.json&&x.json.error)||'Could not place prediction');updateBalance(x.json);setStatus('Prediction placed.','good');if(x.json.round&&x.json.round.round){currentRound=x.json.round.round;renderHistory(currentRound)}setTimeout(closeBet,450)}).catch(function(e){setStatus(e&&e.message?e.message:'Could not place prediction.','bad')}).finally(function(){busy=false;if(betSubmit){betSubmit.disabled=false;betSubmit.textContent='Place prediction'}})}
    function updateMenu(){menu.querySelectorAll('[data-vexa-predict-market]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-vexa-predict-market')===market)})}
    function selectMarket(id){if(!MARKETS[id]||id===market&&raf)return;closeFeed();if(raf){cancelAnimationFrame(raf);raf=0}market=id;values=[];historyValues=[];current=0;last=0;raw=0;scaleMin=0;scaleMax=0;entry=0;readyPrice=false;currentRound=null;slot=slotFor(Date.now());lastPointAt=0;lastDrawAt=0;lastVisualPrice=0;showLoading();updateMenu();if(question)question.textContent=cfg().question;renderImage();if(result){result.className='predict-zone-result-strip';result.innerHTML=''}var my=seq,selectedMarket=market;Promise.all([syncRound(),loadPriceHistory(my,selectedMarket)]).finally(function(){if(my!==seq||selectedMarket!==market)return;if(historyValues.length&&!readyPrice)applyPrice(historyValues[historyValues.length-1],seq,market);connectFeed();if(!raf)raf=requestAnimationFrame(loop)})}
    function loop(now){if(!isActive()){if(raf){cancelAnimationFrame(raf);raf=0}closeFeed();return}var newSlot=slotFor(Date.now());if(newSlot!==slot){slot=newSlot;entry=Number(raw||current||last||0);syncRound()}if(countdown)countdown.textContent=timeLeft(cfg().duration-((Date.now()-slot)%cfg().duration));if(readyPrice){current+=(last-current)*.16;if(!lastPointAt)lastPointAt=now;var elapsed=now-lastPointAt;if(elapsed>=3000){values.push(current);if(values.length>HISTORY)values.shift();lastPointAt=now;elapsed=0}if(now-lastDrawAt>32){lastDrawAt=now;draw(Math.min(1,Math.max(0,elapsed/3000)))}}raf=requestAnimationFrame(loop)}
    function resume(){if(!isActive())return;if(!raf){connectFeed();raf=requestAnimationFrame(loop)}}
    menu.addEventListener('click',function(e){var btn=e.target&&e.target.closest&&e.target.closest('[data-vexa-predict-market]');if(!btn)return;var id=btn.getAttribute('data-vexa-predict-market');if(!MARKETS[id])return;e.preventDefault();e.stopPropagation();selectMarket(id)},true);
    root.addEventListener('input',function(e){if(e.target===betInput)updateEstimate()},true);
    root.addEventListener('click',function(e){var target=e.target;if(!target)return;var preset=target.closest&&target.closest('[data-predict-bet-preset]');if(preset&&betInput){e.preventDefault();betInput.value=preset.getAttribute('data-predict-bet-preset')||'';updateEstimate();focusBetInput();return}var choice=target.closest&&target.closest('[data-predict-choice]');if(choice){e.preventDefault();openBet(choice.getAttribute('data-predict-choice'));return}var submit=target.closest&&target.closest('[data-predict-bet-submit]');if(submit&&betOpen){e.preventDefault();submitBet()}},true);
    document.addEventListener('visibilitychange',function(){if(document.hidden){if(betOpen)closeBet();if(raf){cancelAnimationFrame(raf);raf=0}closeFeed()}else resume()});
    window.addEventListener('focus',resume);window.addEventListener('pageshow',resume);
    document.addEventListener('click',function(e){var target=e.target;if(betOpen&&card&&target&&!card.contains(target))closeBet();var tab=target&&target.closest&&target.closest('[data-view="predictzone"]');if(tab)setTimeout(resume,80)},true);
    if(window.MutationObserver)new MutationObserver(resume).observe(root,{attributes:true,attributeFilter:['class']});
    window.VexaPredictBack=function(){if(betOpen){closeBet();return true}return false};
    if(window.VexaUploadedImages&&window.VexaUploadedImages.load){try{window.VexaUploadedImages.load()}catch(e){}}
    if(window.VexaTonBalance&&window.VexaTonBalance.render){try{window.VexaTonBalance.render()}catch(e){}}
    loadImages();selectMarket('bitcoin');
  });
})();
`;
