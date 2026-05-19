export const TOP_PLAYERS_STYLES = `
.leaderboard-page .leaderboard-back,
.leaderboard-page .top-players-hero-back{
  display:none!important;
  visibility:hidden!important;
  opacity:0!important;
  pointer-events:none!important;
}
.leaderboard-page .top-players-hero-card{
  position:relative!important;
  margin:0 0 16px!important;
  min-height:132px!important;
  border-radius:28px!important;
  padding:17px 112px 15px 17px!important;
  overflow:visible!important;
  background:rgba(255,255,255,.026)!important;
  border:0!important;
  outline:0!important;
  box-shadow:0 18px 46px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.10)!important;
  backdrop-filter:blur(3px) saturate(1.08)!important;
  -webkit-backdrop-filter:blur(3px) saturate(1.08)!important;
}
.leaderboard-page .top-players-hero-card:before{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  border-radius:28px!important;
  background:linear-gradient(135deg,rgba(255,255,255,.045),rgba(255,255,255,0) 50%)!important;
  z-index:-1!important;
  pointer-events:none!important;
}
.leaderboard-page .top-players-hero-kicker{
  margin:0 0 7px!important;
  color:rgba(255,255,255,.52)!important;
  font-size:8.5px!important;
  font-weight:900!important;
  letter-spacing:.16em!important;
  text-transform:uppercase!important;
}
.leaderboard-page .top-players-hero-title{
  margin:0!important;
  color:#fff!important;
  font-size:26px!important;
  line-height:.92!important;
  font-weight:900!important;
  letter-spacing:-.06em!important;
}
.leaderboard-page .top-players-hero-sub{
  margin:8px 0 0!important;
  max-width:174px!important;
  color:rgba(255,255,255,.57)!important;
  font-size:10px!important;
  line-height:1.32!important;
  font-weight:650!important;
}
.leaderboard-page .top-players-hero-stats{
  margin-top:10px!important;
  max-width:182px!important;
  gap:5px!important;
}
.leaderboard-page .top-players-hero-stats span{
  height:34px!important;
  border-radius:13px!important;
  padding:0 7px!important;
  background:rgba(255,255,255,.045)!important;
  border:0!important;
  outline:0!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
}
.leaderboard-page .top-players-hero-stats b{font-size:10px!important}
.leaderboard-page .top-players-hero-stats small{font-size:6.4px!important;margin-top:4px!important}
.leaderboard-page .top-players-hero-art{
  position:absolute!important;
  right:6px!important;
  top:-10px!important;
  width:104px!important;
  height:134px!important;
  display:grid!important;
  place-items:center!important;
  background:transparent!important;
  border:0!important;
  outline:0!important;
  box-shadow:none!important;
  filter:drop-shadow(0 16px 24px rgba(0,0,0,.32))!important;
}
.leaderboard-page .top-players-hero-art img{
  max-width:108px!important;
  max-height:136px!important;
  object-fit:contain!important;
  display:block!important;
  background:transparent!important;
  border:0!important;
  outline:0!important;
  box-shadow:none!important;
  padding:0!important;
}
.leaderboard-page .top-players-hero-placeholder{
  width:0!important;
  height:0!important;
  display:none!important;
  background:transparent!important;
  border:0!important;
  outline:0!important;
  box-shadow:none!important;
  color:transparent!important;
  font-size:0!important;
}
@media(max-width:380px){
  .leaderboard-page .top-players-hero-card{min-height:128px!important;padding:16px 98px 14px 16px!important}
  .leaderboard-page .top-players-hero-title{font-size:24px!important}
  .leaderboard-page .top-players-hero-sub{max-width:152px!important;font-size:9.5px!important}
  .leaderboard-page .top-players-hero-art{right:2px;width:94px!important;height:128px!important}
  .leaderboard-page .top-players-hero-art img{max-width:98px!important;max-height:130px!important}
}
`;
