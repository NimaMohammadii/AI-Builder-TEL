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
  background:rgba(255,255,255,.045)!important;
  border:0!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.085),inset 0 -1px 0 rgba(255,255,255,.055),0 16px 34px rgba(0,0,0,.28)!important;
  backdrop-filter:blur(10px) saturate(1.12)!important;
  -webkit-backdrop-filter:blur(10px) saturate(1.12)!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:flex-start!important;
  flex:0 0 auto!important;
  box-sizing:border-box!important;
}
.top .top-balance-wrap .top-balance-pill:after,
.top .top-balance-wrap .top-balance-pill:before{
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
}
.top .top-balance-wrap .top-balance-pill .ton-mini-icon{
  width:26px!important;
  height:26px!important;
  border-radius:0!important;
  overflow:visible!important;
  display:grid!important;
  place-items:center!important;
  flex:0 0 26px!important;
  background:transparent!important;
  margin:0!important;
  padding:0!important;
}
.top .top-balance-wrap .top-balance-pill .ton-mini-icon svg,
.top .top-balance-wrap .top-balance-pill .ton-mini-icon img{
  width:26px!important;
  height:26px!important;
  display:block!important;
  object-fit:contain!important;
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
  margin:0!important;
  padding:0!important;
}
.top .top-balance-wrap{display:flex;align-items:center;gap:7px;flex:0 0 auto}.top .top-balance-wrap .top-balance-plus{width:34px!important;height:34px!important;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.045)!important;color:#fff!important;font-size:23px!important;font-weight:300!important;line-height:1!important;display:grid!important;place-items:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.085),inset 0 -1px 0 rgba(255,255,255,.055),0 16px 34px rgba(0,0,0,.28)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important;text-shadow:0 1px 12px rgba(0,0,0,.32)!important;transition:transform .18s ease,background .18s ease!important}.top .top-balance-wrap .top-balance-plus:active{transform:scale(.92)!important}
`;