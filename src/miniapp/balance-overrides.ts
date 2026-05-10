export const BALANCE_OVERRIDES = `
.top-balance-pill{
  height:35px!important;
  width:auto!important;
  min-width:0!important;
  max-width:min(44vw,180px)!important;
  padding:0 8px!important;
  gap:3px!important;
  border-radius:999px!important;
  background:rgba(255,255,255,.052)!important;
  border:0!important;
  box-shadow:0 14px 34px rgba(0,0,0,.15),inset 0 1px 0 rgba(255,255,255,.14)!important;
  backdrop-filter:blur(10px) saturate(1.18)!important;
  -webkit-backdrop-filter:blur(10px) saturate(1.18)!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:flex-start!important;
  flex:0 0 auto!important;
  box-sizing:border-box!important;
}
.top-balance-pill b{
  font-size:13px!important;
  letter-spacing:-.02em!important;
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
.top-balance-pill .ton-mini-icon{
  width:23px!important;
  height:23px!important;
  border-radius:0!important;
  overflow:visible!important;
  display:grid!important;
  place-items:center!important;
  flex:0 0 23px!important;
  background:transparent!important;
  margin:0!important;
  padding:0!important;
}
.top-balance-pill .ton-mini-icon svg,
.top-balance-pill .ton-mini-icon img{
  width:23px!important;
  height:23px!important;
  display:block!important;
  object-fit:contain!important;
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
  margin:0!important;
  padding:0!important;
}
`;
