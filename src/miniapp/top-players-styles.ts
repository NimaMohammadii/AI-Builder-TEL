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
