export const BALANCE_OVERRIDES = `
.top .top-balance-wrap .top-balance-pill{
  position:relative!important;
  height:35px!important;
  width:auto!important;
  min-width:0!important;
  max-width:min(44vw,180px)!important;
  padding:0 8px!important;
  gap:3px!important;
  border-radius:999px!important;
  background-color:rgba(14,14,18,.12)!important;
  background-image:linear-gradient(180deg,rgba(255,255,255,.075) 0%,rgba(255,255,255,.018) 48%,rgba(255,255,255,.038) 100%),radial-gradient(130% 190% at 16% -44%,rgba(255,255,255,.12) 0%,rgba(255,255,255,.032) 34%,rgba(255,255,255,0) 62%)!important;
  border:0!important;
  outline:0!important;
  box-shadow:0 2px 8px rgba(0,0,0,.07),0 10px 26px rgba(0,0,0,.10),inset 0 1px 0 rgba(255,255,255,.14),inset 0 -1px 0 rgba(255,255,255,.035),inset 0 0 0 .5px rgba(255,255,255,.04)!important;
  backdrop-filter:blur(16px) saturate(1.34) brightness(1.04)!important;
  -webkit-backdrop-filter:blur(16px) saturate(1.34) brightness(1.04)!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:flex-start!important;
  flex:0 0 auto!important;
  box-sizing:border-box!important;
  isolation:isolate!important;
  transform:translateZ(0)!important;
}
.top .top-balance-wrap .top-balance-pill:before{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  border-radius:inherit!important;
  display:block!important;
  pointer-events:none!important;
  background:linear-gradient(135deg,rgba(255,255,255,.085) 0%,rgba(255,255,255,.018) 28%,rgba(255,255,255,0) 52%),linear-gradient(315deg,rgba(255,255,255,.045) 0%,rgba(255,255,255,0) 36%)!important;
  box-shadow:inset 0 0 0 .5px rgba(255,255,255,.055)!important;
  opacity:.72!important;
  z-index:0!important;
}
.top .top-balance-wrap .top-balance-pill:after{
  content:none!important;
}
body.connect-only .top .top-balance-wrap .top-balance-pill:after{
  content:""!important;
  position:absolute!important;
  left:-4px!important;
  bottom:-5px!important;
  width:16px!important;
  height:16px!important;
  border-radius:999px!important;
  display:block!important;
  background:rgba(255,255,255,.12)!important;
  border:0!important;
  outline:0!important;
  box-shadow:0 5px 12px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.14)!important;
  backdrop-filter:blur(20px)!important;
  -webkit-backdrop-filter:blur(20px)!important;
  opacity:1!important;
  pointer-events:none!important;
  box-sizing:border-box!important;
  background-image:linear-gradient(rgba(255,255,255,.76),rgba(255,255,255,.76)),linear-gradient(rgba(255,255,255,.76),rgba(255,255,255,.76))!important;
  background-size:7px 1.5px,1.5px 7px!important;
  background-position:center center,center center!important;
  background-repeat:no-repeat!important;
}
.top .top-balance-wrap .top-balance-pill b{
  position:relative!important;
  left:-2px!important;
  z-index:1!important;
  font-size:13.8px!important;
  letter-spacing:-.025em!important;
  line-height:1!important;
  color:#fff!important;
  margin:0!important;
  padding:0!important;
  display:block!important;
  white-space:nowrap!important;
  min-width:0!important;
  max-width:calc(min(44vw,180px) - 42px)!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  text-shadow:0 1px 8px rgba(0,0,0,.22)!important;
}
.top .top-balance-wrap .top-balance-pill .ton-mini-icon{
  position:relative!important;
  left:-2px!important;
  z-index:1!important;
  width:32px!important;
  height:32px!important;
  border-radius:0!important;
  overflow:visible!important;
  display:grid!important;
  place-items:center!important;
  flex:0 0 32px!important;
  background:transparent!important;
  margin:0!important;
  padding:0!important;
}
.top .top-balance-wrap .top-balance-pill .ton-mini-icon svg,
.top .top-balance-wrap .top-balance-pill .ton-mini-icon img{
  width:34px!important;
  height:34px!important;
  display:block!important;
  object-fit:contain!important;
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
  margin:0!important;
  padding:0!important;
  transform:translateX(2px)!important;
}
.top .top-balance-wrap{
  display:flex!important;
  align-items:center!important;
  gap:7px!important;
  flex:0 0 auto!important;
}
.top .top-balance-wrap .top-balance-plus{
  position:relative!important;
  width:34px!important;
  height:34px!important;
  border:0!important;
  outline:0!important;
  border-radius:999px!important;
  background-color:rgba(14,14,18,.12)!important;
  background-image:linear-gradient(180deg,rgba(255,255,255,.075) 0%,rgba(255,255,255,.018) 48%,rgba(255,255,255,.038) 100%),radial-gradient(130% 190% at 16% -44%,rgba(255,255,255,.12) 0%,rgba(255,255,255,.032) 34%,rgba(255,255,255,0) 62%)!important;
  color:transparent!important;
  font-size:0!important;
  line-height:0!important;
  display:grid!important;
  place-items:center!important;
  overflow:hidden!important;
  box-shadow:0 2px 8px rgba(0,0,0,.07),0 10px 26px rgba(0,0,0,.10),inset 0 1px 0 rgba(255,255,255,.14),inset 0 -1px 0 rgba(255,255,255,.035),inset 0 0 0 .5px rgba(255,255,255,.04)!important;
  backdrop-filter:blur(16px) saturate(1.34) brightness(1.04)!important;
  -webkit-backdrop-filter:blur(16px) saturate(1.34) brightness(1.04)!important;
  isolation:isolate!important;
  transform:translateZ(0)!important;
  transition:transform .18s ease,filter .18s ease,background .18s ease!important;
}
.top .top-balance-wrap .top-balance-plus:before,
.top .top-balance-wrap .top-balance-plus:after{
  content:""!important;
  position:absolute!important;
  left:50%!important;
  top:50%!important;
  width:14px!important;
  height:3px!important;
  border-radius:999px!important;
  background:#fff!important;
  transform:translate(-50%,-50%)!important;
  box-shadow:0 1px 6px rgba(255,255,255,.10)!important;
  pointer-events:none!important;
}
.top .top-balance-wrap .top-balance-plus:after{
  transform:translate(-50%,-50%) rotate(90deg)!important;
}
.top .top-balance-wrap .top-balance-plus:active{
  transform:translateZ(0) scale(.92)!important;
  filter:brightness(.96)!important;
}
`;
