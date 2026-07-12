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

html body:has(#home.active){
  isolation:isolate!important;
  background:#000!important;
}
html body:has(#home.active)::before{
  content:""!important;
  display:block!important;
  position:fixed!important;
  inset:0!important;
  width:100vw!important;
  height:100dvh!important;
  z-index:-1!important;
  pointer-events:none!important;
  background-color:#000!important;
  background-image:url('/assets/Home.PNG?v=1')!important;
  background-size:cover!important;
  background-position:center top!important;
  background-repeat:no-repeat!important;
  transform:none!important;
  animation:none!important;
  filter:none!important;
  opacity:1!important;
}
html body:has(#home.active)::after,
html body:has(#home.active) .app::before,
html body:has(#home.active) .app::after{
  display:none!important;
  content:none!important;
  background:none!important;
  background-image:none!important;
}
html body:has(#home.active) .app,
html body:has(#home.active) main.app,
html body:has(#home.active) .content,
html body:has(#home.active) #home.view,
html body:has(#home.active) .top,
html body:has(#home.active) header.top{
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
}

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

html body:has(#slot.active){
  isolation:isolate!important;
  background:#000!important;
}
html body:has(#slot.active)::before{
  content:""!important;
  display:block!important;
  position:fixed!important;
  inset:0!important;
  width:100vw!important;
  height:100dvh!important;
  z-index:-1!important;
  pointer-events:none!important;
  background-color:#000!important;
  background-image:url('/assets/Slotbackground.PNG?v=1')!important;
  background-size:cover!important;
  background-position:center top!important;
  background-repeat:no-repeat!important;
  transform:none!important;
  animation:none!important;
  filter:none!important;
  opacity:1!important;
}
html body:has(#slot.active)::after,
html body:has(#slot.active) .app::before,
html body:has(#slot.active) .app::after{
  display:none!important;
  content:none!important;
  background:none!important;
  background-image:none!important;
}
html body:has(#slot.active) .app,
html body:has(#slot.active) main.app,
html body:has(#slot.active) .content,
html body:has(#slot.active) #slot.slot-view,
html body:has(#slot.active) .top,
html body:has(#slot.active) header.top{
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
}

/* Slot-only sizing adjustment: keep the existing layout and assets intact. */
html body:has(#slot.active) #slot .slot-machine{
  width:min(84vw,360px)!important;
  height:460px!important;
  min-height:460px!important;
  margin-top:-14px!important;
  left:14px!important;
}
html body:has(#slot.active) #slot .slot-frame-image{
  width:100%!important;
  height:auto!important;
}
html body:has(#slot.active) #slot .slot-window{
  top:91px!important;
  left:11.2%!important;
  width:69.6%!important;
  height:242px!important;
  padding:5px!important;
  border-radius:20px!important;
  gap:4px!important;
}
html body:has(#slot.active) #slot .slot-window::before,
html body:has(#slot.active) #slot .slot-window::after{height:57px!important}
html body:has(#slot.active) #slot .slot-symbol{height:80px!important}
html body:has(#slot.active) #slot .slot-symbol-image{width:53px!important;height:53px!important}
html body:has(#slot.active) #slot .slot-control-panel{
  width:min(84vw,360px)!important;
  margin:-24px auto 0!important;
  left:-8px!important;
}
html body:has(#slot.active) #slot .slot-controls.slot-image-controls{
  width:76%!important;
  margin-left:auto!important;
  margin-right:auto!important;
}
html body:has(#slot.active) #slot .slot-image-control.slot-spin-button{
  max-width:270px!important;
  height:90px!important;
  margin-left:auto!important;
  margin-right:auto!important;
}
@media(max-width:380px){
  html body:has(#slot.active) #slot .slot-machine{width:min(86vw,336px)!important;height:430px!important;min-height:430px!important;margin-top:-12px!important;left:12px!important}
  html body:has(#slot.active) #slot .slot-window{top:85px!important;height:225px!important;padding:4px!important}
  html body:has(#slot.active) #slot .slot-symbol{height:75px!important}
  html body:has(#slot.active) #slot .slot-symbol-image{width:49px!important;height:49px!important}
  html body:has(#slot.active) #slot .slot-control-panel{width:min(86vw,336px)!important;margin:-22px auto 0!important;left:-7px!important}
  html body:has(#slot.active) #slot .slot-image-control.slot-spin-button{max-width:252px!important;height:84px!important;margin-left:auto!important;margin-right:auto!important}
}
`;