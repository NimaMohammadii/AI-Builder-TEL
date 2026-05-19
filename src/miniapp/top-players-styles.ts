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
  min-height:138px!important;
  border-radius:28px!important;
  padding:18px 116px 16px 18px!important;
  overflow:visible!important;
  background:rgba(255,255,255,.038)!important;
  border:1px solid rgba(255,255,255,.14)!important;
  box-shadow:0 20px 54px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.18)!important;
  backdrop-filter:blur(3px) saturate(1.12)!important;
  -webkit-backdrop-filter:blur(3px) saturate(1.12)!important;
}
.leaderboard-page .top-players-hero-card:before{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  border-radius:28px!important;
  background:linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,0) 48%)!important;
  z-index:-1!important;
  pointer-events:none!important;
}
.leaderboard-page .top-players-hero-kicker{
  margin:0 0 7px!important;
  color:rgba(255,255,255,.54)!important;
  font-size:8.5px!important;
  font-weight:900!important;
  letter-spacing:.16em!important;
  text-transform:uppercase!important;
}
.leaderboard-page .top-players-hero-title{
  margin:0!important;
  color:#fff!important;
  font-size:27px!important;
  line-height:.92!important;
  font-weight:900!important;
  letter-spacing:-.06em!important;
}
.leaderboard-page .top-players-hero-sub{
  margin:9px 0 0!important;
  max-width:176px!important;
  color:rgba(255,255,255,.58)!important;
  font-size:10px!important;
  line-height:1.35!important;
  font-weight:650!important;
}
.leaderboard-page .top-players-hero-stats{
  margin-top:11px!important;
  max-width:184px!important;
  gap:5px!important;
}
.leaderboard-page .top-players-hero-stats span{
  height:36px!important;
  border-radius:13px!important;
  padding:0 7px!important;
  background:rgba(255,255,255,.055)!important;
  border:1px solid rgba(255,255,255,.08)!important;
}
.leaderboard-page .top-players-hero-stats b{font-size:10px!important}
.leaderboard-page .top-players-hero-stats small{font-size:6.4px!important;margin-top:4px!important}
.leaderboard-page .top-players-hero-art{
  position:absolute!important;
  right:8px!important;
  top:-12px!important;
  width:104px!important;
  height:138px!important;
  display:grid!important;
  place-items:center!important;
  filter:drop-shadow(0 18px 28px rgba(0,0,0,.34))!important;
}
.leaderboard-page .top-players-hero-art img{
  max-width:108px!important;
  max-height:142px!important;
  object-fit:contain!important;
  display:block!important;
}
.leaderboard-page .top-players-hero-placeholder{
  width:82px!important;
  height:82px!important;
  border-radius:24px!important;
  display:grid!important;
  place-items:center!important;
  background:rgba(255,255,255,.07)!important;
  border:1px solid rgba(255,255,255,.12)!important;
  color:#fff!important;
  font-size:28px!important;
  font-weight:900!important;
}
@media(max-width:380px){
  .leaderboard-page .top-players-hero-card{min-height:132px!important;padding:16px 100px 15px 16px!important}
  .leaderboard-page .top-players-hero-title{font-size:24px!important}
  .leaderboard-page .top-players-hero-sub{max-width:154px!important;font-size:9.5px!important}
  .leaderboard-page .top-players-hero-art{right:3px;width:96px!important;height:132px!important}
  .leaderboard-page .top-players-hero-art img{max-width:100px!important;max-height:134px!important}
}
`;
