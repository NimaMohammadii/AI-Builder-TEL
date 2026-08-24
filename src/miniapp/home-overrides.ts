export const HOME_OVERRIDES = `
#home{padding-top:4px}
#rankPill{display:none!important}
#home .home-intro-card,
#connect .card{
  margin:0 0 12px;
  padding:18px 18px 20px;
  border-radius:30px;
  background:rgba(255,255,255,.035)!important;
  border:0!important;
  outline:0!important;
  color:#fff;
  box-shadow:0 18px 42px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.14)!important;
  backdrop-filter:blur(4px) saturate(1.12)!important;
  -webkit-backdrop-filter:blur(4px) saturate(1.12)!important;
}
#connect .card .pad{padding:0!important}
#connect .card .title{margin:0 0 12px!important}
#connect .card h3{margin:0;font-size:24px!important;line-height:1.04!important;font-weight:850!important;letter-spacing:-.055em!important}
#connect .card .title span,#connect .card .tiny,#connect .card .notice{color:rgba(255,255,255,.62)!important;font-size:13px!important;line-height:1.48!important;font-weight:470!important;letter-spacing:-.015em!important}
#connect .card .field label{color:rgba(255,255,255,.52)!important}
#connect .card input,#connect .card .primary,#connect .card .ghost{border-radius:999px!important}
#home .home-intro-card h2{margin:0 0 8px;font-size:24px;line-height:1.04;font-weight:850;letter-spacing:-.055em}
#home .home-intro-card p{margin:0;color:rgba(255,255,255,.62);font-size:13px;line-height:1.48;font-weight:470;letter-spacing:-.015em}
#home .home-floating-glass-button{position:fixed;left:calc(100vw - 98px);top:calc(120px + env(safe-area-inset-top));z-index:90;width:68px!important;height:68px!important;min-width:68px!important;min-height:68px!important;border-radius:50%!important;padding:0!important;display:grid!important;place-items:center!important;color:#fff!important;background:linear-gradient(145deg,rgba(255,255,255,.24),rgba(255,255,255,.055))!important;box-shadow:0 24px 64px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.42),inset 0 -14px 28px rgba(255,255,255,.035)!important;backdrop-filter:blur(18px) saturate(1.35)!important;-webkit-backdrop-filter:blur(18px) saturate(1.35)!important;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;will-change:left,top,transform;transition:transform .18s ease,box-shadow .18s ease,opacity .18s ease}
#home .home-floating-glass-button:active,#home .home-floating-glass-button.is-dragging{cursor:grabbing;transform:scale(1.05);box-shadow:0 28px 76px rgba(0,0,0,.44),inset 0 1px 0 rgba(255,255,255,.50),inset 0 -14px 28px rgba(255,255,255,.045)!important}
#home .home-floating-glass-button span{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.09);box-shadow:inset 0 1px 0 rgba(255,255,255,.22);pointer-events:none}
#home .home-floating-glass-button svg{width:23px;height:23px;display:block;filter:drop-shadow(0 2px 10px rgba(0,0,0,.28))}
#home #homeDrawInfoCard.home-draw-info-card,
#home .home-ticket-card{
  position:relative!important;
  overflow:hidden!important;
  border-radius:28px!important;
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
  border:0!important;
  outline:0!important;
  box-shadow:
    0 12px 30px rgba(31,1,10,.32),
    0 0 18px rgba(69,5,26,.15),
    inset 3px 3px .5px -3.5px rgba(255,255,255,.10),
    inset -3px -3px .5px -3.5px rgba(156,38,70,.48),
    inset 1px 1px 1px -.5px rgba(140,29,61,.30),
    inset -1px -1px 1px -.5px rgba(124,22,53,.24),
    inset 0 0 6px 6px rgba(255,255,255,.055),
    inset 0 0 2px 2px rgba(255,255,255,.035)!important;
  backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;
  -webkit-backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;
  isolation:isolate!important;
  transform:translateZ(0)!important;
}
#home #homeDrawInfoCard.home-draw-info-card:before,
#home .home-ticket-card:before{
  content:''!important;
  position:absolute!important;
  inset:0!important;
  z-index:0!important;
  border-radius:inherit!important;
  display:block!important;
  pointer-events:none!important;
  background:
    radial-gradient(34px 34px at 0 0,rgba(186,53,87,.16) 0%,rgba(146,35,66,.07) 42%,rgba(104,18,44,0) 76%),
    radial-gradient(36px 36px at 100% 100%,rgba(172,46,79,.15) 0%,rgba(133,30,60,.065) 43%,rgba(94,16,39,0) 78%),
    radial-gradient(118% 76% at 10% -16%,rgba(255,255,255,.12) 0%,rgba(255,255,255,.032) 30%,rgba(255,255,255,0) 58%),
    radial-gradient(96% 72% at 102% 108%,rgba(255,255,255,.052) 0%,rgba(255,255,255,.010) 34%,rgba(255,255,255,0) 62%),
    radial-gradient(92% 78% at 88% 112%,rgba(72,5,27,.11) 0%,rgba(42,3,16,0) 60%)!important;
  box-shadow:inset 0 1px 0 rgba(112,18,49,.065),inset 0 -1px 0 rgba(88,12,37,.15)!important;
  opacity:1!important;
}
#home #homeDrawInfoCard.home-draw-info-card>*,
#home .home-ticket-card>*{position:relative!important;z-index:1!important}
#home .home-ticket-card .home-ticket-count{
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(255,255,255,.08)!important;
}
#home #homeDrawInfoCard .home-draw-actions .home-ticket-image-button,
#home .home-ticket-card .home-ticket-step,
#home .home-ticket-card .home-ticket-button{
  position:relative!important;
  overflow:hidden!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  box-sizing:border-box!important;
  height:38px!important;
  min-height:38px!important;
  max-height:38px!important;
  margin:0!important;
  padding:0 12px!important;
  border:0!important;
  border-radius:18px!important;
  outline:0!important;
  background:rgba(0,0,0,.22)!important;
  background-color:rgba(0,0,0,.22)!important;
  background-image:none!important;
  color:#fff!important;
  font-family:inherit!important;
  font-size:12px!important;
  font-weight:950!important;
  line-height:1!important;
  letter-spacing:normal!important;
  text-shadow:none!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  filter:none!important;
  opacity:1!important;
  transform:none!important;
  transition:none!important;
  animation:none!important;
  -webkit-appearance:none!important;
  appearance:none!important;
  -webkit-tap-highlight-color:transparent!important;
}
#home #homeDrawInfoCard .home-draw-actions .home-ticket-image-button{min-width:88px!important}
#home .home-ticket-card .home-ticket-step{min-width:0!important;font-size:0!important;line-height:0!important;color:transparent!important;-webkit-text-fill-color:transparent!important}
#home .home-ticket-card .home-ticket-button{width:100%!important;min-width:0!important;-webkit-text-fill-color:#fff!important}
#home .home-ticket-card .home-ticket-step:disabled,
#home .home-ticket-card .home-ticket-button:disabled{
  opacity:1!important;
  background:rgba(0,0,0,.22)!important;
  background-color:rgba(0,0,0,.22)!important;
  color:#fff!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;
  filter:none!important;
  -webkit-appearance:none!important;
  appearance:none!important;
}
#home .home-ticket-card .home-ticket-step:before,
#home .home-ticket-card .home-ticket-step:after{
  content:''!important;
  position:absolute!important;
  left:50%!important;
  top:50%!important;
  width:16px!important;
  height:2.6px!important;
  border-radius:999px!important;
  background:#fff!important;
  box-shadow:none!important;
  opacity:1!important;
  transform:translate(-50%,-50%)!important;
  pointer-events:none!important;
}
#home .home-ticket-card .home-ticket-step[data-ticket-minus]:after{display:none!important}
#home .home-ticket-card .home-ticket-step[data-ticket-plus]:after{display:block!important;width:2.6px!important;height:16px!important}
@media(max-width:380px){#home .home-floating-glass-button{width:62px!important;height:62px!important;min-width:62px!important;min-height:62px!important;left:calc(100vw - 88px)}}
`;
