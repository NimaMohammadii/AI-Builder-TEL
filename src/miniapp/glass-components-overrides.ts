export const GLASS_COMPONENTS_OVERRIDES = `
button:not(.tab):not(.section-keyboard-dismiss):not(:where(.home-ticket-step,.home-ticket-button,.home-ticket-drawer-close,.home-bonus-close)),.primary,.secondary,.ghost,.danger,.home-action,.bot-row,.voice-btn,.voice-menu,.voice-menu button,.game-open,.plinko-drop,.plinko-quick button,.risk-segment,.risk-segment button,.rows-select,.bet-quick button,.autoplay-toggle,.crash-primary,.crash-secondary,.crash-quick button,.mine-tile,#minesStart,#minesCashout,[data-mines-bet],.top-balance-pill,.credit-pill,.pill{
  border:0!important;
  outline:0!important;
  background:rgba(255,255,255,.035)!important;
  color:#fff;
  box-shadow:0 18px 42px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.16)!important;
  backdrop-filter:blur(10px) saturate(1.18)!important;
  -webkit-backdrop-filter:blur(10px) saturate(1.18)!important;
}
.primary,.plinko-drop,.crash-primary,#minesStart,.tab.active,.risk-segment button.active,.voice-menu button.active{
  background:rgba(255,255,255,.92)!important;
  color:#050505!important;
  box-shadow:0 10px 26px rgba(255,255,255,.10),inset 0 1px 0 rgba(255,255,255,.78)!important;
  text-shadow:none!important;
}
.secondary,.ghost,.danger,.home-action,.bot-row,.voice-btn,.game-open,.crash-secondary,.crash-quick button,.bet-quick button,.rows-select,[data-mines-bet],#minesCashout,.credit-pill,.pill{
  text-shadow:0 1px 10px rgba(0,0,0,.28);
}
.voice-menu{
  background:rgba(255,255,255,.04)!important;
  border:0!important;
  overflow:hidden!important;
}
.voice-menu button{box-shadow:none!important;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.voice-menu button.active{background:rgba(255,255,255,.92)!important}
input,select,textarea,.section-code-input,.bet-amount,.crash-amount input{
  border:0!important;
  background:rgba(255,255,255,.035)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important;
  backdrop-filter:blur(10px) saturate(1.18)!important;
  -webkit-backdrop-filter:blur(10px) saturate(1.18)!important;
}
#home .home-ticket-layout>.home-ticket-card{
  border:1px solid rgba(124,22,53,.24)!important;
  background:#000!important;
  background-color:#000!important;
  background-image:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
#home .home-ticket-layout>.home-ticket-card:before{
  content:''!important;
  display:block!important;
  background:
    radial-gradient(34px 34px at 0 0,rgba(186,53,87,.20) 0%,rgba(146,35,66,.09) 42%,rgba(104,18,44,0) 76%),
    radial-gradient(38px 38px at 100% 100%,rgba(156,38,70,.26) 0%,rgba(92,10,35,.12) 46%,rgba(69,5,26,0) 78%)!important;
  box-shadow:
    inset 3px 3px .5px -3.5px rgba(255,255,255,.10),
    inset -3px -3px .5px -3.5px rgba(156,38,70,.52),
    inset 1px 1px 1px -.5px rgba(140,29,61,.22),
    inset -1px -1px 1px -.5px rgba(92,10,35,.30),
    inset 0 0 10px rgba(69,5,26,.12)!important;
}
`;
