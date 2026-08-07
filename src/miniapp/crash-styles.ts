export const CRASH_STYLES = `
#crash.crash-view{height:100%;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:22px}
#crash.crash-view::-webkit-scrollbar{display:none}
body:has(#crash.active) .tabs{display:none!important}
body:has(#crash.active) .content{padding-bottom:0!important}
#crash .crash-page{min-height:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:6px;padding:4px 0 max(34px,env(safe-area-inset-bottom))}
#crash .crash-stage{position:relative;height:min(43vh,356px);min-height:322px;border-radius:34px;overflow:hidden;background-color:#000!important;background-image:url('/assets/CrashChart.PNG?v=1')!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;border:0!important;outline:0!important;box-shadow:0 22px 56px rgba(0,0,0,.24)!important;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);isolation:isolate}
#crash .crash-stage:before,#crash .crash-stage:after{content:"";position:absolute;inset:0;background:none!important;pointer-events:none;z-index:1}
#crash .crash-chart-square{display:none!important}
#crash .crash-canvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;display:block!important;background:transparent!important;mix-blend-mode:normal!important;border-radius:inherit!important;overflow:hidden!important;z-index:2!important}
#crash .crash-multiplier-wrap{position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);text-align:center;z-index:4;pointer-events:none;background:none!important;border:0!important;outline:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;filter:none!important}
#crash .crash-multiplier{position:relative!important;display:inline-block!important;transform:none!important;text-align:center;font-size:clamp(38px,12vw,52px);font-weight:930;letter-spacing:-.075em;color:rgba(255,255,255,.82)!important;-webkit-text-fill-color:rgba(255,255,255,.82)!important;background:none!important;border:0!important;outline:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;filter:none!important;text-shadow:0 1px 0 rgba(255,255,255,.22),0 16px 34px rgba(0,0,0,.55);pointer-events:none;will-change:transform,opacity,color}
#crash .crash-multiplier.crash-broken{color:#5f0618!important;-webkit-text-fill-color:#5f0618!important;text-shadow:0 0 14px rgba(95,6,24,.72),0 16px 32px rgba(0,0,0,.72)!important;animation:crashBreakMain .86s cubic-bezier(.17,.84,.24,1) both}
#crash .crash-multiplier.crash-broken:before,#crash .crash-multiplier.crash-broken:after{content:attr(data-crash-text);position:absolute;inset:0;color:#8d1830;-webkit-text-fill-color:#8d1830;text-shadow:0 0 18px rgba(120,0,28,.55);pointer-events:none;opacity:.82;mix-blend-mode:screen;clip-path:polygon(0 0,100% 0,82% 46%,0 62%)}
#crash .crash-multiplier.crash-broken:before{animation:crashShardTop .82s cubic-bezier(.14,.86,.22,1) both}
#crash .crash-multiplier.crash-broken:after{clip-path:polygon(0 60%,82% 46%,100% 100%,0 100%);animation:crashShardBottom .82s cubic-bezier(.14,.86,.22,1) both;color:#3e0310;-webkit-text-fill-color:#3e0310}
@keyframes crashBreakMain{0%{transform:translate3d(0,0,0) scale(1);filter:none;opacity:1}10%{transform:translate3d(-2px,1px,0) rotate(-1deg) scale(1.045);filter:brightness(1.35)}20%{transform:translate3d(3px,-2px,0) rotate(1.2deg) scale(.99)}34%{transform:translate3d(-5px,2px,0) rotate(-2.4deg) scale(1.025);letter-spacing:-.095em}48%{transform:translate3d(4px,1px,0) rotate(1.7deg) scale(.985);filter:contrast(1.25)}66%{transform:translate3d(-1px,4px,0) rotate(-.8deg) scale(.96);opacity:.96}100%{transform:translate3d(0,2px,0) rotate(0deg) scale(.94);filter:contrast(1.12);opacity:.92}}
@keyframes crashShardTop{0%{transform:translate3d(0,0,0) rotate(0);opacity:0}12%{opacity:.95}100%{transform:translate3d(-13px,-16px,0) rotate(-7deg);opacity:0}}
@keyframes crashShardBottom{0%{transform:translate3d(0,0,0) rotate(0);opacity:0}12%{opacity:.82}100%{transform:translate3d(14px,18px,0) rotate(8deg);opacity:0}}
#crash .crash-next-round{margin-top:7px;color:rgba(255,255,255,.60);font-size:12px;font-weight:850;letter-spacing:.02em;text-shadow:0 8px 18px rgba(0,0,0,.42)}
#crash .crash-hidden-state,#crash .crash-starting,#crash .crash-network{display:none!important}
#crash .crash-controls{position:relative;border:0!important;outline:0!important;border-radius:32px;background:transparent!important;padding:12px;box-shadow:none!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;overflow:visible}
#crash .crash-controls:before,#crash .crash-controls:after{display:none!important;background:none!important;box-shadow:none!important}
#crash .crash-controls>*{position:relative;z-index:1}
#crash .crash-field{display:grid;gap:6px}
#crash .crash-label{font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.65);font-weight:850;text-shadow:0 6px 16px rgba(0,0,0,.30)}
#crash .crash-amount{display:grid;grid-template-columns:minmax(0,1fr) 94px;gap:7px}
#crash .crash-auto-field{margin-top:8px}
#crash .crash-auto{display:grid;grid-template-columns:minmax(0,1fr) 30px;align-items:center}
#crash .crash-quick{display:grid;grid-template-columns:1fr 1fr;gap:5px}
#crash .crash-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}
#crash .crash-amount input,#crash .crash-auto,#crash .crash-quick button,#crash .crash-primary,#crash .crash-secondary,#crash .crash-history span{border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important}
#crash .crash-amount input,#crash .crash-auto{height:42px!important;border-radius:999px!important}
#crash .crash-amount input,#crash .crash-auto input{color:#fff!important;text-align:center!important;font-weight:910!important;font-size:17px!important;-webkit-text-fill-color:#fff!important;background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important}
#crash .crash-auto input{height:42px!important}
#crash .crash-auto span{display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.70);font-size:12px;font-weight:900;padding-right:6px}
#crash .crash-quick button{height:42px;border-radius:999px;color:#fff!important;-webkit-text-fill-color:#fff!important;font-size:12px;font-weight:900}
#crash .crash-primary,#crash .crash-secondary{height:45px;border-radius:999px;font-weight:930;font-size:12px;color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:none!important}
#crash .crash-primary:disabled,#crash .crash-secondary:disabled{opacity:.42}
#crash .crash-primary:not(:disabled):active,#crash .crash-secondary:not(:disabled):active,#crash .crash-quick button:active{transform:scale(.985);filter:none!important}
#crash .crash-amount input:focus,#crash .crash-auto:focus-within,#crash .crash-quick button:focus-visible,#crash .crash-primary:focus-visible,#crash .crash-secondary:focus-visible{background:transparent!important;outline:0!important;box-shadow:none!important}
#crash .crash-history{display:flex!important;gap:6px;overflow-x:auto;overflow-y:hidden;margin-top:10px;min-height:30px;padding:2px 1px 1px;scrollbar-width:none;visibility:visible!important;opacity:1!important}
#crash .crash-history::-webkit-scrollbar{display:none}
#crash .crash-history span{flex:0 0 auto;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:890;color:rgba(255,255,255,.94)!important}
#crash .crash-live{border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;border-radius:28px;padding:10px 12px 24px;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important}
#crash .crash-live-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;color:rgba(255,255,255,.62);font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
#crash .crash-live-head b{color:rgba(255,255,255,.92);font-size:11px;font-weight:930;letter-spacing:.02em;text-transform:none}
#crash .crash-live-list{display:grid;gap:6px;max-height:none;overflow:visible;scrollbar-width:none}
#crash .crash-live-list::-webkit-scrollbar{display:none}
#crash .crash-live-empty{font-size:11px;font-weight:820;color:rgba(255,255,255,.45);padding:8px 0;text-align:center}
#crash .crash-live-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:8px;min-height:32px;border-radius:999px;background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;color:#fff;padding:0 2px}
#crash .crash-live-user{min-width:0;font-size:12px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:rgba(255,255,255,.92)}
#crash .crash-live-amount{font-size:11px;font-weight:900;color:rgba(255,255,255,.70)}
#crash .crash-live-status{font-size:11px;font-weight:930;color:rgba(255,255,255,.84)}
#crash .crash-live-row.cashout .crash-live-amount{color:#78ffb3}
#crash .crash-live-plus{display:inline-block;margin-right:3px;color:#78ffb3;font-weight:950}
#crash .crash-live-row.crashed .crash-live-amount,#crash .crash-live-row.crashed .crash-live-status{color:rgba(255,255,255,.70)}
body #crash .crash-bet-main{display:flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;padding:0 10px!important}
body #crash .crash-bet-main::before{content:""!important;display:block!important;width:24px!important;height:24px!important;flex:0 0 24px!important;background:url('/app/api/uploaded-image/ton-icon.png') center/contain no-repeat!important;filter:drop-shadow(0 2px 8px rgba(0,0,0,.34))!important;opacity:.98!important;pointer-events:none!important}
body #crash .crash-bet-main input{width:auto!important;max-width:88px!important;flex:0 1 auto!important;text-align:left!important}
`;