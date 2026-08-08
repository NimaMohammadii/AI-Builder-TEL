export const GLASS_COMPONENTS_OVERRIDES = `
button:not(.tab):not(.section-keyboard-dismiss),
.primary,.secondary,.ghost,.danger,
.home-action,.bot-row,.voice-btn,.voice-menu,.voice-menu button,
.deposit-panel,.deposit-close,.deposit-custom button,.deposit-presets button,
.game-open,.plinko-drop,.plinko-quick button,.risk-segment,.risk-segment button,.rows-select,.bet-quick button,.autoplay-toggle,
.crash-primary,.crash-secondary,.crash-quick button,
.mine-tile,#minesStart,#minesCashout,[data-mines-bet],
.top-balance-pill,.credit-pill,.pill{
  border:0!important;
  outline:0!important;
  background:rgba(255,255,255,.035)!important;
  color:#fff;
  box-shadow:0 18px 42px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.16)!important;
  backdrop-filter:blur(10px) saturate(1.18)!important;
  -webkit-backdrop-filter:blur(10px) saturate(1.18)!important;
}
.primary,.plinko-drop,.crash-primary,#minesStart,.tab.active,
.risk-segment button.active,.voice-menu button.active{
  background:rgba(255,255,255,.92)!important;
  color:#050505!important;
  box-shadow:0 10px 26px rgba(255,255,255,.10),inset 0 1px 0 rgba(255,255,255,.78)!important;
  text-shadow:none!important;
}
.secondary,.ghost,.danger,.home-action,.bot-row,.voice-btn,.deposit-presets button,.deposit-close,.game-open,.crash-secondary,.crash-quick button,.bet-quick button,.rows-select,[data-mines-bet],#minesCashout,.credit-pill,.pill{
  text-shadow:0 1px 10px rgba(0,0,0,.28);
}
.voice-menu,.deposit-panel{
  background:rgba(255,255,255,.04)!important;
  border:0!important;
  overflow:hidden!important;
}
#depositSheet.deposit-sheet.open,#withdrawSheet.deposit-sheet.open{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  padding:20px 16px calc(92px + env(safe-area-inset-bottom))!important;
  opacity:1!important;
  visibility:visible!important;
  pointer-events:auto!important;
}
#depositSheet.deposit-sheet.open .deposit-panel,#withdrawSheet.deposit-sheet.open .deposit-panel{
  display:block!important;
  width:min(100%,528px)!important;
  height:auto!important;
  max-height:min(78vh,620px)!important;
  margin:auto!important;
  padding:0!important;
  opacity:1!important;
  visibility:visible!important;
  transform:translateY(0) scale(1)!important;
  z-index:2!important;
  background:rgba(8,8,8,.72)!important;
  border-radius:32px!important;
  overflow:auto!important;
}
#depositSheet.deposit-sheet.open .deposit-panel .pad,#withdrawSheet.deposit-sheet.open .deposit-panel .pad{
  display:block!important;
  padding:24px 22px!important;
  opacity:1!important;
  visibility:visible!important;
}
#depositSheet .deposit-title,#withdrawSheet .deposit-title{
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:12px!important;
  margin:0 0 14px!important;
  opacity:1!important;
  visibility:visible!important;
  animation:none!important;
}
#depositSheet .deposit-title-main,#withdrawSheet .deposit-title-main{
  display:flex!important;
  align-items:center!important;
  gap:10px!important;
  min-width:0!important;
}
#depositSheet .deposit-credit-icon,#withdrawSheet .withdraw-title-icon{
  width:34px!important;
  height:34px!important;
  min-width:34px!important;
  max-width:34px!important;
  max-height:34px!important;
  border-radius:50%!important;
  object-fit:cover!important;
  display:grid!important;
  place-items:center!important;
  flex:0 0 auto!important;
  overflow:hidden!important;
  background:rgba(255,255,255,.055)!important;
  color:#fff!important;
}
#withdrawSheet .withdraw-title-icon svg{
  width:24px!important;
  height:24px!important;
  display:block!important;
}
#depositSheet .deposit-title h3,#withdrawSheet .deposit-title h3{
  margin:0!important;
  font-size:20px!important;
  line-height:1.05!important;
  font-weight:900!important;
  letter-spacing:-.055em!important;
  white-space:nowrap!important;
  color:#fff!important;
}
#depositSheet .deposit-copy,#withdrawSheet .deposit-copy{
  display:block!important;
  margin:8px auto 18px!important;
  max-width:330px!important;
  text-align:center!important;
  color:rgba(255,255,255,.76)!important;
  font-size:16px!important;
  line-height:1.36!important;
  font-weight:750!important;
  letter-spacing:-.035em!important;
  opacity:1!important;
  visibility:visible!important;
  animation:none!important;
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
  padding:0!important;
}
#depositSheet .deposit-custom-field,#withdrawSheet .deposit-custom-field{
  display:block!important;
  margin:0 auto 12px!important;
  max-width:340px!important;
  opacity:1!important;
  visibility:visible!important;
  animation:none!important;
}
#depositSheet .deposit-custom-field label,#withdrawSheet .deposit-custom-field label{
  display:block!important;
  text-align:center!important;
  color:rgba(255,255,255,.58)!important;
  font-size:11px!important;
  line-height:1!important;
  font-weight:800!important;
  letter-spacing:.14em!important;
  text-transform:uppercase!important;
  margin:0 0 10px!important;
}
#depositSheet .deposit-amount-row,#withdrawSheet .deposit-amount-row{
  height:58px!important;
  min-height:58px!important;
  border-radius:999px!important;
  background:rgba(255,255,255,.052)!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  align-items:center!important;
  gap:10px!important;
  padding:0 14px 0 18px!important;
  overflow:hidden!important;
}
#withdrawSheet .withdraw-wallet-row{
  grid-template-columns:1fr!important;
  padding-right:18px!important;
}
#depositSheet .deposit-amount-row input,#withdrawSheet .deposit-amount-row input{
  height:100%!important;
  min-width:0!important;
  background:transparent!important;
  border:0!important;
  border-radius:0!important;
  color:#fff!important;
  text-align:left!important;
  font-size:17px!important;
  font-weight:650!important;
  box-shadow:none!important;
  padding:0!important;
  letter-spacing:-.015em!important;
}
#depositSheet .deposit-ton-equivalent{
  white-space:nowrap!important;
  color:rgba(255,255,255,.72)!important;
  font-size:12px!important;
  font-weight:800!important;
  background:rgba(255,255,255,.065)!important;
  border-radius:999px!important;
  padding:8px 10px!important;
  line-height:1!important;
}
#depositSheet .deposit-pay-button,#withdrawSheet .deposit-pay-button{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:min(100%,340px)!important;
  height:54px!important;
  margin:0 auto 10px!important;
  border-radius:999px!important;
  font-size:16px!important;
  font-weight:900!important;
  color:#fff!important;
  opacity:1!important;
  visibility:visible!important;
  animation:none!important;
}
#depositSheet .deposit-stars-logo{
  display:grid!important;
  justify-items:center!important;
  gap:7px!important;
  margin:4px auto 0!important;
  color:rgba(255,255,255,.72)!important;
  font-size:11px!important;
  font-weight:800!important;
  letter-spacing:.08em!important;
  text-transform:uppercase!important;
  opacity:1!important;
  visibility:visible!important;
  animation:none!important;
}
#depositSheet .deposit-stars-logo svg{
  width:52px!important;
  height:52px!important;
  max-width:52px!important;
  max-height:52px!important;
  display:block!important;
}
#withdrawSheet .withdraw-status{
  min-height:18px!important;
  margin:0 auto 0!important;
  max-width:340px!important;
  text-align:center!important;
  color:rgba(255,255,255,.62)!important;
  font-size:12px!important;
  font-weight:700!important;
  opacity:1!important;
  visibility:visible!important;
  animation:none!important;
}
#withdrawSheet .withdraw-success{
  display:none!important;
  opacity:0!important;
  visibility:hidden!important;
  pointer-events:none!important;
}
#withdrawSheet .withdraw-success.show{
  display:flex!important;
  align-items:center!important;
  gap:12px!important;
  margin:18px auto 0!important;
  max-width:340px!important;
  opacity:1!important;
  visibility:visible!important;
  pointer-events:auto!important;
}
#withdrawSheet .withdraw-success:not(.show){
  display:none!important;
}
#depositSheet.deposit-sheet.open .deposit-backdrop,#withdrawSheet.deposit-sheet.open .deposit-backdrop{
  z-index:0!important;
}
.voice-menu button{box-shadow:none!important;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.voice-menu button.active{background:rgba(255,255,255,.92)!important}
.deposit-backdrop{background:rgba(0,0,0,.34)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important}
input,select,textarea,.section-code-input,.bet-amount,.crash-amount input{
  border:0!important;
  background:rgba(255,255,255,.035)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important;
  backdrop-filter:blur(10px) saturate(1.18)!important;
  -webkit-backdrop-filter:blur(10px) saturate(1.18)!important;
}
html body:has(#ghostrun.active) main.app #ghostrun.ghost-run-view .ghost-run-controls,
html body:has(#ghostrun.active) main.app #ghostrun.ghost-run-view .ghost-run-win-card,
html body:has(#ghostrun.active) main.app #ghostrun.ghost-run-view .ghost-run-bet-card,
html body:has(#ghostrun.active) main.app #ghostrun.ghost-run-view .ghost-run-move-button,
html body:has(#ghostrun.active) main.app #ghostrun.ghost-run-view #ghostLive,
html body:has(#ghostrun.active) main.app #ghostrun.ghost-run-view #ghostLive .crash-live-row,
html body:has(#ghostrun.active) main.app #ghostrun.ghost-run-view #ghostLive .crash-live-toggle{
  background:rgba(26,11,15,.54)!important;
  background-color:rgba(26,11,15,.54)!important;
  background-image:none!important;
}
`;