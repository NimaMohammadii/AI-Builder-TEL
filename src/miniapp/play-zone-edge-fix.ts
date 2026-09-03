export const PLAY_ZONE_EDGE_FIX = `
#playzone.play-zone-view{contain:layout paint!important;transform:translateZ(0)!important;will-change:scroll-position!important}
#playzone .play-zone-stage{--play-card-gap:3px!important;contain:layout paint style!important}
#playzone .game-card-shell{contain:layout paint!important;will-change:auto!important}
#playzone .game-card-live,#playzone .play-zone-featured-card,#playzone .game-players{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
#playzone .game-card-live{background:rgba(255,255,255,.055)!important;box-shadow:0 10px 22px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.14)!important}
#playzone .game-card-live:before,#playzone .game-card-live:after{content:none!important;display:none!important}
#playzone .game-card-live .game-image img{transform:none!important;backface-visibility:visible!important;will-change:auto!important}
#playzone .game-card-shell.is-stacking{transform:none!important;opacity:1!important}
#playzone .game-players i,#playzone .game-players i:before{animation:none!important}
@media (prefers-reduced-motion:reduce){#playzone .game-card,#playzone .game-card-shell,#playzone .game-players b{transition:none!important;animation:none!important}}

html body:has(#playzone.active)::before{
  background-image:url('/assets/Playhub.PNG?v=1')!important;
  background-size:cover!important;
  background-position:center top!important;
  background-repeat:no-repeat!important;
  transform:none!important;
  animation:none!important;
  filter:none!important;
  opacity:1!important;
}

html body:has(#rewards.active){
  isolation:isolate!important;
  background:#000!important;
}
html body:has(#rewards.active)::before{
  content:""!important;
  display:block!important;
  position:fixed!important;
  inset:0!important;
  width:100vw!important;
  height:100dvh!important;
  z-index:-1!important;
  pointer-events:none!important;
  background-color:#000!important;
  background-image:url('/assets/Rewards.PNG?v=1')!important;
  background-size:cover!important;
  background-position:center top!important;
  background-repeat:no-repeat!important;
  transform:none!important;
  animation:none!important;
  filter:none!important;
  opacity:1!important;
}
html body:has(#rewards.active)::after,
html body:has(#rewards.active) .app::before,
html body:has(#rewards.active) .app::after{
  display:none!important;
  content:none!important;
  background:none!important;
  background-image:none!important;
}
html body:has(#rewards.active) .app,
html body:has(#rewards.active) main.app,
html body:has(#rewards.active) .content,
html body:has(#rewards.active) #rewards.rewards-view,
html body:has(#rewards.active) .top,
html body:has(#rewards.active) header.top{
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
}
html body:has(#rewards.active) #rewards .rewards-home-intro-card{
  display:none!important;
}

html body:has(#dice.active){
  isolation:isolate!important;
  background:#000!important;
}
html body:has(#dice.active)::before{
  content:""!important;
  display:block!important;
  position:fixed!important;
  inset:0!important;
  width:100vw!important;
  height:100dvh!important;
  z-index:-1!important;
  pointer-events:none!important;
  background-color:#000!important;
  background-image:url('/assets/Dice.PNG?v=1')!important;
  background-size:cover!important;
  background-position:center top!important;
  background-repeat:no-repeat!important;
  transform:none!important;
  animation:none!important;
  filter:none!important;
  opacity:1!important;
}
html body:has(#dice.active)::after,
html body:has(#dice.active) .app::before,
html body:has(#dice.active) .app::after{
  display:none!important;
  content:none!important;
  background:none!important;
  background-image:none!important;
}
html body:has(#dice.active) .app,
html body:has(#dice.active) main.app,
html body:has(#dice.active) .content,
html body:has(#dice.active) #dice.dice-view,
html body:has(#dice.active) .top,
html body:has(#dice.active) header.top{
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
}
`;
