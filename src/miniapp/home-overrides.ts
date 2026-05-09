export const HOME_OVERRIDES = `
#home .glass-card,
#home .home-action,
#home .deposit-panel,
#home .deposit-presets button,
#home .deposit-custom input{
  background:linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.045))!important;
  border-color:rgba(255,255,255,.18)!important;
  backdrop-filter:blur(28px) saturate(1.55)!important;
  -webkit-backdrop-filter:blur(28px) saturate(1.55)!important;
  box-shadow:0 24px 70px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.18)!important;
}
#home .home-hero{
  min-height:200px;
  border-radius:34px;
}
#home .home-actions-grid.home-actions-single{
  display:grid!important;
  grid-template-columns:1fr!important;
  margin:14px 0 0!important;
}
#home .home-deposit-large{
  min-height:118px!important;
  border-radius:34px!important;
  padding:18px!important;
  gap:16px!important;
  background:linear-gradient(145deg,rgba(255,255,255,.24),rgba(255,255,255,.07))!important;
}
#home .home-deposit-large .home-action-icon{
  width:58px!important;
  height:58px!important;
  border-radius:24px!important;
  font-size:30px!important;
  background:rgba(255,255,255,.16)!important;
}
#home .home-deposit-large b{
  font-size:24px!important;
  letter-spacing:-.055em!important;
}
#home .home-deposit-large small{
  font-size:12.5px!important;
  margin-top:6px!important;
}
#home .deposit-panel{
  border-radius:34px!important;
}
`;
