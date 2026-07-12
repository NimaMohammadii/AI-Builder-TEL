export const PLINKO_STYLES = `
body:has(#plinko.active){background:#050304!important}
body:has(#plinko.active) .tabs{display:none!important}
#plinko.view{overflow:hidden;background:radial-gradient(circle at 50% 18%,rgba(92,12,30,.16),transparent 34%),linear-gradient(180deg,#080506 0%,#030303 100%)}
.plinko-page{min-height:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;padding:calc(12px + env(safe-area-inset-top)) 13px calc(112px + env(safe-area-inset-bottom));position:relative;isolation:isolate}
.plinko-page:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 44%,rgba(111,10,34,.09),transparent 55%);z-index:-1}
.plinko-header{width:min(100%,390px);height:45px;display:flex;align-items:center;justify-content:space-between;padding:0 6px;margin-bottom:5px;box-sizing:border-box}
.plinko-kicker{display:block;color:#8e6770;font-size:8px;line-height:1;font-weight:900;letter-spacing:.22em}
.plinko-header h2{margin:4px 0 0;color:#f8f3f4;font-size:20px;line-height:1;font-weight:1000;letter-spacing:.075em}
.plinko-physics{height:27px;padding:0 10px;border:1px solid rgba(142,34,59,.28);border-radius:999px;background:rgba(65,8,21,.22);display:flex;align-items:center;gap:7px;color:#b98f98;font-size:8px;font-weight:900;letter-spacing:.12em}
.plinko-physics i{width:5px;height:5px;border-radius:50%;background:#8f1e39;box-shadow:0 0 10px rgba(143,30,57,.7);animation:plinkoPulse 1.8s ease-in-out infinite}
.plinko-stage{width:min(100%,390px);height:min(59vh,520px);min-height:400px;position:relative;flex:0 0 auto;display:grid;place-items:center;overflow:hidden;border-radius:28px;background:#070506;box-shadow:0 30px 80px rgba(0,0,0,.68)}
.plinko-house-image{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;opacity:.98;pointer-events:none;z-index:0}
.plinko-stage:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;box-shadow:inset 0 0 32px rgba(0,0,0,.3)}
.plinko-canvas{position:absolute;z-index:2;inset:4% 4% 3%;width:92%;height:93%;display:block;background:transparent}
.plinko-controls{width:min(100%,390px);height:70px;display:grid;grid-template-columns:1fr 1.07fr;grid-template-rows:12px 54px;column-gap:4px;row-gap:4px;margin-top:8px;position:relative;z-index:4;padding:0 10px;background:transparent!important;border:0!important;box-shadow:none!important}
.plinko-controls:before{content:"";position:absolute;left:0;right:0;top:10px;height:64px;background:url('/assets/plinko/plinko-controls-v2.webp') center/100% 100% no-repeat;pointer-events:none;z-index:-1}
.plinko-control-label{grid-column:1/-1;color:#78555d;font-size:8px;font-weight:900;letter-spacing:.18em;padding-left:9px}
.plinko-bet-asset{grid-column:1;display:grid!important;grid-template-columns:31% 38% 31%!important;height:54px!important;background:transparent!important;border:0!important;box-shadow:none!important}
.plinko-asset-hit{position:static!important;width:auto!important;height:100%!important;inset:auto!important;border:0!important;background:transparent!important;color:#a98189!important;font-size:13px!important;font-weight:900!important}
.plinko-asset-input{color:#fff7f9!important;font-size:15px!important}
.plinko-drop-asset{grid-column:2;height:54px!important;border:0!important;background:transparent!important;color:#fff!important;box-shadow:none!important;font-size:12px!important;font-weight:1000!important;letter-spacing:.11em!important;transition:transform .16s ease,filter .16s ease!important}
.plinko-drop-asset:active{transform:scale(.975)!important;filter:brightness(1.18)!important}
.plinko-hidden-status,.plinko-bet-value,.plinko-bet-input{position:absolute!important;opacity:0!important;pointer-events:none!important}
.toast{left:50%!important;right:auto!important;bottom:calc(100px + env(safe-area-inset-bottom))!important;transform:translate3d(-50%,14px,0) scale(.97)!important;max-width:min(86vw,360px)!important;width:max-content!important;min-height:44px!important;padding:0 18px!important;border-radius:18px!important;border:1px solid rgba(156,67,87,.18)!important;background:rgba(20,11,14,.9)!important;color:#f8f2f4!important;font-size:13px!important;font-weight:850!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;box-shadow:0 18px 42px rgba(0,0,0,.38)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;opacity:0!important;pointer-events:none!important;transition:opacity .24s ease,transform .28s ease!important;z-index:140!important}
.toast[style*="block"],.toast[style*="flex"]{opacity:1!important;transform:translate3d(-50%,0,0) scale(1)!important}
@keyframes plinkoPulse{50%{opacity:.45;transform:scale(.72)}}
@media(max-height:720px){.plinko-header{height:37px}.plinko-stage{height:430px;min-height:360px}.plinko-controls{margin-top:5px}}
`;
