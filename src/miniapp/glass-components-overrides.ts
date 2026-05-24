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
  opacity:1!important;
  visibility:visible!important;
  pointer-events:auto!important;
}
#depositSheet.deposit-sheet.open .deposit-panel,#withdrawSheet.deposit-sheet.open .deposit-panel{
  display:block!important;
  opacity:1!important;
  visibility:visible!important;
  transform:translateY(0) scale(1)!important;
  z-index:2!important;
  background:rgba(8,8,8,.72)!important;
  overflow:auto!important;
}
#depositSheet.deposit-sheet.open .deposit-panel .deposit-title,
#depositSheet.deposit-sheet.open .deposit-panel .deposit-copy,
#depositSheet.deposit-sheet.open .deposit-panel .deposit-custom-field,
#depositSheet.deposit-sheet.open .deposit-panel .deposit-pay-button,
#depositSheet.deposit-sheet.open .deposit-panel .deposit-stars-logo,
#withdrawSheet.deposit-sheet.open .deposit-panel .deposit-title,
#withdrawSheet.deposit-sheet.open .deposit-panel .deposit-copy,
#withdrawSheet.deposit-sheet.open .deposit-panel .deposit-custom-field,
#withdrawSheet.deposit-sheet.open .deposit-panel .deposit-pay-button,
#withdrawSheet.deposit-sheet.open .deposit-panel .withdraw-status,
#withdrawSheet.deposit-sheet.open .deposit-panel .withdraw-success{
  opacity:1!important;
  visibility:visible!important;
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
`;