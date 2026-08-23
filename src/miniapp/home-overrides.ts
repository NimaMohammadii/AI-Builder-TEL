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
#home .home-ticket-card{
  position:relative!important;
  overflow:hidden!important;
  background:linear-gradient(180deg,rgba(66,10,27,.20) 0%,rgba(17,3,8,.48) 48%,rgba(37,5,15,.30) 100%),radial-gradient(130% 125% at 14% -18%,rgba(108,18,43,.22) 0%,rgba(73,8,27,.09) 38%,rgba(21,2,8,0) 66%)!important;
  border:0!important;
  outline:0!important;
  box-shadow:0 12px 30px rgba(0,0,0,.26),0 0 34px rgba(76,8,28,.22),inset 0 1px 0 rgba(116,26,52,.22),inset 0 -1px 0 rgba(45,4,16,.38),inset 0 0 20px rgba(91,10,34,.13)!important;
  backdrop-filter:blur(18px) saturate(1.30) brightness(.98)!important;
  -webkit-backdrop-filter:blur(18px) saturate(1.30) brightness(.98)!important;
  isolation:isolate!important;
}
#home .home-ticket-card:before{
  content:''!important;
  position:absolute!important;
  inset:0!important;
  z-index:0!important;
  border-radius:inherit!important;
  pointer-events:none!important;
  background:linear-gradient(135deg,rgba(127,28,57,.12) 0%,rgba(94,13,38,.035) 30%,rgba(44,4,17,0) 54%),radial-gradient(110% 90% at 82% 108%,rgba(84,8,31,.16) 0%,rgba(34,3,13,0) 62%)!important;
  box-shadow:inset 0 0 0 .5px rgba(115,24,50,.22)!important;
}
#home .home-ticket-card>*{position:relative!important;z-index:1!important}
#home .home-ticket-card .home-ticket-step,
#home .home-ticket-card .home-ticket-button{
  position:relative!important;
  overflow:hidden!important;
  border:0!important;
  outline:0!important;
  background:linear-gradient(180deg,rgba(120,24,47,.11) 0%,rgba(52,8,20,.085) 20%,rgba(3,3,4,.34) 52%,rgba(68,10,27,.10) 76%,rgba(0,0,1,.42) 100%),linear-gradient(135deg,#090a0c 0%,#020203 42%,#260711 72%,#000001 100%)!important;
  background-size:160% 100%!important;
  color:rgba(255,238,243,.95)!important;
  text-shadow:0 1px 1px rgba(0,0,0,.71)!important;
  box-shadow:inset 0 1px 0 rgba(255,151,174,.20),inset 0 -1px 0 rgba(0,0,0,.89),0 8px 18px rgba(0,0,0,.32)!important;
  transition:transform .16s cubic-bezier(.2,.8,.2,1),box-shadow .16s ease,filter .16s ease!important;
  animation:homeDarkMetalShift 4.8s ease-in-out infinite!important;
}
#home .home-ticket-card .home-ticket-step{
  border-radius:15px!important;
  font-size:0!important;
  line-height:0!important;
  color:transparent!important;
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
  background:linear-gradient(90deg,#a85a6a 0%,#efd0d8 48%,#8e4657 100%)!important;
  box-shadow:0 1px 0 rgba(255,255,255,.10),0 1px 4px rgba(0,0,0,.55)!important;
  transform:translate(-50%,-50%)!important;
  pointer-events:none!important;
}
#home .home-ticket-card .home-ticket-step[data-ticket-minus]:after{display:none!important}
#home .home-ticket-card .home-ticket-step[data-ticket-plus]:after{
  display:block!important;
  width:2.6px!important;
  height:16px!important;
}
#home .home-ticket-card .home-ticket-button{
  border-radius:17px!important;
  font-weight:900!important;
}
#home .home-ticket-card .home-ticket-step:active,
#home .home-ticket-card .home-ticket-button:active{
  transform:translateY(1px) scale(.975)!important;
  filter:brightness(.90)!important;
  box-shadow:inset 0 2px 5px rgba(9,0,3,.66),inset 0 1px 0 rgba(210,82,108,.085),0 3px 8px rgba(0,0,0,.26)!important;
}
@keyframes homeDarkMetalShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@media(max-width:380px){#home .home-floating-glass-button{width:62px!important;height:62px!important;min-width:62px!important;min-height:62px!important;left:calc(100vw - 88px)}}
@media(prefers-reduced-motion:reduce){#home .home-ticket-card .home-ticket-step,#home .home-ticket-card .home-ticket-button{animation:none!important}}
`;
