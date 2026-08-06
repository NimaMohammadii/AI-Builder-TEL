export const PLAY_ZONE_SHOWCASE_OVERRIDES = `
#playzone .play-zone-stage{
  display:block!important;
  width:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0 0 96px!important;
  overflow:visible!important;
}
#playzone .game-grid{
  display:grid!important;
  grid-template-columns:1fr!important;
  gap:12px!important;
  width:100%!important;
  margin:0!important;
  padding:0!important;
}
#playzone .game-card{
  width:100%!important;
  max-width:none!important;
  min-width:0!important;
  height:auto!important;
  min-height:92px!important;
  max-height:none!important;
  aspect-ratio:auto!important;
  margin:0!important;
  border:0!important;
  border-radius:26px!important;
  background:rgba(255,255,255,.92)!important;
  box-shadow:0 18px 38px rgba(0,0,0,.10)!important;
  padding:10px!important;
  display:grid!important;
  grid-template-columns:92px minmax(0,1fr) auto!important;
  gap:12px!important;
  align-items:center!important;
  color:#151515!important;
  text-align:left!important;
  overflow:hidden!important;
  transition:transform .2s ease!important;
  -webkit-backdrop-filter:none!important;
  backdrop-filter:none!important;
}
#playzone .game-card:before,#playzone .game-card:after{
  content:none!important;
  display:none!important;
}
#playzone .game-card:active{transform:scale(.985)!important}
#playzone .game-image{
  position:relative!important;
  inset:auto!important;
  display:grid!important;
  place-items:center!important;
  width:92px!important;
  height:72px!important;
  margin:0!important;
  aspect-ratio:auto!important;
  border:0!important;
  border-radius:20px!important;
  overflow:hidden!important;
  background:linear-gradient(135deg,rgba(91,15,36,.18),rgba(0,0,0,.06))!important;
  box-shadow:none!important;
  padding:0!important;
}
#playzone .game-image:before,#playzone .game-image:after{
  content:none!important;
  display:none!important;
}
#playzone .game-image img{
  display:block!important;
  position:static!important;
  width:100%!important;
  height:100%!important;
  min-width:0!important;
  min-height:0!important;
  aspect-ratio:auto!important;
  object-fit:cover!important;
  object-position:center!important;
  border:0!important;
  border-radius:20px!important;
  background:transparent!important;
  box-shadow:none!important;
  transform:none!important;
}
#playzone .game-info{
  display:flex!important;
  min-width:0!important;
  flex-direction:column!important;
  gap:6px!important;
}
#playzone .game-info strong{
  display:block!important;
  font-size:19px!important;
  font-weight:950!important;
  line-height:1.05!important;
  letter-spacing:-.02em!important;
  color:#151515!important;
}
#playzone .game-info small{
  display:block!important;
  font-size:12px!important;
  font-weight:650!important;
  line-height:1.35!important;
  color:rgba(21,21,21,.60)!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#playzone .game-open{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  border:0!important;
  border-radius:999px!important;
  background:#111!important;
  color:#fff!important;
  font-size:13px!important;
  font-weight:900!important;
  line-height:1!important;
  padding:10px 13px!important;
  white-space:nowrap!important;
}
#playzone .game-footer,#playzone .game-players{display:none!important}
#playzone .play-zone-plinko-showcase,#playzone .play-zone-nft-strip{display:none!important}
@media(max-width:380px){
  #playzone .game-grid{gap:10px!important}
  #playzone .game-card{
    min-height:84px!important;
    grid-template-columns:78px minmax(0,1fr) auto!important;
    gap:9px!important;
    border-radius:22px!important;
    padding:9px!important;
  }
  #playzone .game-image{width:78px!important;height:64px!important;border-radius:18px!important}
  #playzone .game-image img{border-radius:18px!important}
  #playzone .game-info strong{font-size:17px!important}
  #playzone .game-info small{font-size:11px!important}
  #playzone .game-open{font-size:12px!important;padding:9px 11px!important}
}
`;
