export const CHICKEN_CROSS_STYLES = `
body.cc-game-open .tabs{opacity:0!important;transform:translateY(90px)!important;pointer-events:none!important}
[data-lazy-section-host="hilo"]{display:contents!important}
#hilo{--cc-accent:#f3b85b;position:relative!important;height:calc(100% - 88px)!important;min-height:0!important;margin:0 -16px -8px!important;width:calc(100% + 32px)!important;padding:0 0 calc(40px + env(safe-area-inset-bottom))!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;scrollbar-width:none!important;background:#0d0f10!important}
#hilo::-webkit-scrollbar{display:none}
#hilo.active{display:block!important}
#hilo .cc-world{position:relative;height:clamp(430px,68dvh,650px);min-height:430px;overflow:hidden;background:linear-gradient(180deg,#171b1d 0%,#0d1011 100%)}
#hilo canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y;outline:0}
#hilo .cc-vignette{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(8,10,11,.02),transparent 48%,rgba(6,8,9,.20) 100%);box-shadow:inset 0 0 58px rgba(0,0,0,.26)}
#hilo .cc-render-loading{position:absolute;z-index:8;inset:0;display:grid;place-items:center;color:rgba(255,255,255,.54);font-size:11px;font-weight:850;letter-spacing:.15em;text-transform:uppercase;background:#101315;transition:opacity .45s ease,visibility .45s ease}
#hilo .cc-render-loading:after{content:'';position:absolute;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.09);border-top-color:rgba(243,184,91,.82);animation:ccLoad .9s linear infinite}
#hilo .cc-render-loading.ready{opacity:0;visibility:hidden}
@keyframes ccLoad{to{transform:rotate(360deg)}}
#hilo .cc-hud{position:absolute;z-index:5;left:18px;right:18px;top:14px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;pointer-events:none}
#hilo .cc-multi{font-size:40px;font-weight:950;line-height:.9;letter-spacing:-.06em;color:#fff;text-shadow:0 10px 30px rgba(0,0,0,.55)}
#hilo .cc-multi small{display:block;margin-top:9px;color:rgba(255,255,255,.48);font-size:9px;font-weight:850;letter-spacing:.14em;text-transform:uppercase}
#hilo .cc-step-pill{height:34px;padding:0 13px;border-radius:999px;display:flex;align-items:center;background:rgba(8,2,5,.34);border:1px solid rgba(255,255,255,.10);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:rgba(255,255,255,.78);font-size:11px;font-weight:900;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
#hilo .cc-message{position:absolute;z-index:6;left:50%;top:82px;transform:translateX(-50%);max-width:82%;padding:8px 14px;border-radius:999px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;color:rgba(255,255,255,.70);font-size:10px;font-weight:850;background:rgba(6,1,4,.32);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:.2s ease}
#hilo .cc-message.win{color:#fff4d6;border-color:rgba(243,184,91,.28)}
#hilo .cc-progress{position:absolute;z-index:5;left:22px;right:22px;bottom:18px;display:flex;align-items:center;gap:4px;height:8px;pointer-events:none}
#hilo .cc-progress i{height:3px;flex:1;border-radius:99px;background:rgba(255,255,255,.09);box-shadow:0 1px 4px rgba(0,0,0,.4);transition:.22s ease}
#hilo .cc-progress i.done{height:4px;background:#f3b85b;box-shadow:none}
#hilo .cc-controls{position:relative;z-index:7;padding:18px 16px 8px;background:#0d0f10;pointer-events:none}
#hilo .cc-controls-inner{width:min(100%,470px);margin:0 auto;pointer-events:auto}
#hilo .cc-top-controls{display:grid;grid-template-columns:1fr 1.1fr;gap:9px;align-items:end}
#hilo .cc-label{display:flex;justify-content:space-between;align-items:center;margin:0 2px 7px;color:rgba(255,255,255,.42);font-size:8px;font-weight:850;letter-spacing:.10em;text-transform:uppercase}
#hilo .cc-difficulty{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
#hilo .cc-difficulty button{height:42px;padding:0 2px;border-radius:13px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.035);color:rgba(255,255,255,.42);font-size:9px;font-weight:900;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:.18s ease}
#hilo .cc-difficulty button.active{color:#16130d;background:#f3b85b;border-color:#f3b85b;box-shadow:inset 0 1px 0 rgba(255,255,255,.32)}
#hilo .cc-bet{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:5px}
#hilo .cc-bet button,#hilo .cc-bet input{height:42px;min-width:0;border-radius:13px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);color:#fff;text-align:center;font-size:14px;font-weight:950;outline:none;box-sizing:border-box;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
#hilo .cc-bet button{font-size:10px;color:rgba(255,255,255,.58)}
#hilo .cc-actions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:9px}
#hilo .cc-actions.has-round{grid-template-columns:1.35fr .65fr}
#hilo .cc-primary,#hilo .cc-cashout{height:55px;border:0;border-radius:17px;font-size:15px;font-weight:950;letter-spacing:-.025em;transition:transform .12s ease,opacity .18s ease}
#hilo .cc-primary{color:#15120d;background:#f3b85b;box-shadow:0 14px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.35)}
#hilo .cc-actions.has-round .cc-primary{color:#15120d;background:#f3b85b;box-shadow:0 14px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.35)}
#hilo .cc-cashout{display:none;color:#fff;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.11);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
#hilo .cc-actions.has-round .cc-cashout{display:block}
#hilo button:active{transform:scale(.97)}
#hilo button:disabled,#hilo input:disabled{opacity:.40;transform:none}
#hilo .cc-proof{height:14px;margin:7px 3px 0;color:rgba(255,255,255,.23);font-size:8px;line-height:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#hilo .cc-proof b{color:rgba(255,255,255,.38)}
#hilo.cc-hit .cc-world{animation:ccImpact .40s ease}
@keyframes ccImpact{0%,100%{transform:translateX(0);filter:none}25%{transform:translateX(-7px);filter:saturate(1.45)}55%{transform:translateX(6px)}78%{transform:translateX(-3px)}}
@media(max-width:390px){#hilo .cc-top-controls{grid-template-columns:1fr}#hilo .cc-controls{padding-left:13px;padding-right:13px}#hilo .cc-difficulty button{height:36px}#hilo .cc-bet button,#hilo .cc-bet input{height:38px}}
@media(max-height:690px){#hilo .cc-world{height:430px}#hilo .cc-primary,#hilo .cc-cashout{height:48px}#hilo .cc-proof{display:none}}
@media(prefers-reduced-motion:reduce){#hilo *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
