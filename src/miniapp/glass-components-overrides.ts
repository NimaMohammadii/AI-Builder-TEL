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
.leaderboard-page .leaderboard-back,
.leaderboard-page .top-players-hero-back{
  display:none!important;
  visibility:hidden!important;
  opacity:0!important;
  pointer-events:none!important;
}
.leaderboard-page .top-players-hero-card{
  position:relative!important;
  margin:0 0 22px!important;
  min-height:176px!important;
  border-radius:32px!important;
  padding:22px 132px 18px 20px!important;
  overflow:visible!important;
  background:linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,.045))!important;
  border:1px solid rgba(255,255,255,.22)!important;
  box-shadow:0 28px 70px rgba(0,0,0,.38),0 0 46px rgba(126,20,48,.16),inset 0 1px 0 rgba(255,255,255,.24)!important;
  backdrop-filter:blur(6px) saturate(1.22)!important;
  -webkit-backdrop-filter:blur(6px) saturate(1.22)!important;
}
.leaderboard-page .top-players-hero-card:before{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  border-radius:32px!important;
  background:linear-gradient(135deg,rgba(255,255,255,.11),rgba(255,255,255,0) 44%)!important;
  z-index:-1!important;
  pointer-events:none!important;
}
.leaderboard-page .top-players-hero-art{
  position:absolute!important;
  right:12px!important;
  top:-26px!important;
  width:122px!important;
  height:168px!important;
  display:grid!important;
  place-items:center!important;
}
.leaderboard-page .top-players-hero-placeholder{
  width:94px!important;
  height:94px!important;
  border-radius:28px!important;
  display:grid!important;
  place-items:center!important;
  background:rgba(255,255,255,.08)!important;
  border:1px solid rgba(255,255,255,.14)!important;
  color:#fff!important;
  font-size:34px!important;
  font-weight:900!important;
}
`;