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

/* Keep machine and controls locked together, only slightly larger than before. */
html body:has(#slot.active) #slot.slot-view{
  width:100%!important;
  height:100%!important;
  min-height:0!important;
  max-height:100%!important;
  box-sizing:border-box!important;
  overflow-y:hidden!important;
  overflow-x:hidden!important;
  touch-action:none!important;
  padding-bottom:36px!important;
  -webkit-overflow-scrolling:touch!important;
}
html body:has(#slot.active) #slot.slot-view:has(.slot-live.open){
  overflow-y:auto!important;
  touch-action:pan-y!important;
  overscroll-behavior-y:contain!important;
}
html body:has(#slot.active) #slot .slot-cabinet{
  transform:scale(.88)!important;
  transform-origin:top center!important;
  margin-bottom:-100px!important;
  transition:none!important;
  animation:none!important;
}
html body:has(#slot.active) #slot .slot-machine{
  width:min(84vw,360px)!important;
  height:460px!important;
  min-height:460px!important;
  margin-top:-14px!important;
  left:32px!important;
  top:-18px!important;
  z-index:10!important;
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
  margin:-38px auto 0!important;
  left:-8px!important;
  top:-18px!important;
  z-index:9!important;
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
html body:has(#slot.active) #slot .slot-spin-label{
  position:relative!important;
  top:-5px!important;
}
html body:has(#slot.active) #slot .slot-spin-cost{
  display:none!important;
}
html body:has(#slot.active) #slot #slotBetHalf{
  font-size:0!important;
}
html body:has(#slot.active) #slot #slotBetHalf .slot-control-fallback{
  font-size:0!important;
}
html body:has(#slot.active) #slot #slotBetHalf::after{
  content:'1/2'!important;
  display:inline-block!important;
  position:relative!important;
  top:-2px!important;
  left:-2px!important;
  font-size:15px!important;
  font-weight:950!important;
  line-height:1!important;
  color:inherit!important;
  z-index:2!important;
}
html body:has(#slot.active) #slot #slotBetMax{
  font-size:0!important;
}
html body:has(#slot.active) #slot #slotBetMax .slot-control-fallback{
  font-size:0!important;
}
html body:has(#slot.active) #slot #slotBetMax::after{
  content:'2x'!important;
  display:inline-block!important;
  position:relative!important;
  top:-2px!important;
  left:2px!important;
  font-size:15px!important;
  font-weight:950!important;
  line-height:1!important;
  color:inherit!important;
  z-index:2!important;
}

/* Live players stay directly below the cabinet and remain visible. */
html body:has(#slot.active) #slot .slot-live{
  display:block!important;
  visibility:visible!important;
  opacity:1!important;
  width:min(92%,408px)!important;
  margin:44px auto 28px!important;
  padding:0 10px calc(20px + env(safe-area-inset-bottom))!important;
  border:0!important;
  border-radius:0!important;
  outline:0!important;
  background:transparent!important;
  background-color:transparent!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  overflow:visible!important;
  max-height:none!important;
}
html body:has(#slot.active) #slot .slot-live:not(.open){
  display:block!important;
  visibility:visible!important;
  opacity:1!important;
  max-height:none!important;
  padding-bottom:calc(20px + env(safe-area-inset-bottom))!important;
}
html body:has(#slot.active) #slot .slot-live-head{
  display:flex!important;
  visibility:visible!important;
  opacity:1!important;
  margin:0 4px 10px!important;
  padding:0 2px!important;
}
html body:has(#slot.active) #slot .slot-live-list{
  display:grid!important;
  visibility:visible!important;
  opacity:1!important;
  pointer-events:auto!important;
  gap:6px!important;
  height:auto!important;
  max-height:none!important;
  overflow:visible!important;
  padding:2px 2px 10px!important;
  scrollbar-width:none!important;
}
html body:has(#slot.active) #slot .slot-live-list::-webkit-scrollbar{display:none!important}
html body:has(#slot.active) #slot .slot-live:not(.open) .slot-live-list{
  display:grid!important;
  visibility:hidden!important;
  opacity:0!important;
  height:0!important;
  max-height:0!important;
  padding-top:0!important;
  padding-bottom:0!important;
  pointer-events:none!important;
  overflow:hidden!important;
}
html body:has(#slot.active) #slot .slot-live-row{
  display:grid!important;
  visibility:visible!important;
  opacity:1!important;
  min-height:48px!important;
  height:48px!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  align-items:center!important;
  gap:10px!important;
  padding:6px 12px!important;
  border:0!important;
  outline:0!important;
  border-radius:20px!important;
  background:rgba(13,13,13,.54)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;
  backdrop-filter:blur(4px) saturate(1.08)!important;
  -webkit-backdrop-filter:blur(4px) saturate(1.08)!important;
  box-sizing:border-box!important;
}
html body:has(#slot.active) #slot .slot-live-user{
  font-size:12px!important;
  font-weight:900!important;
}
html body:has(#slot.active) #slot .slot-live-result{
  gap:8px!important;
}
html body:has(#slot.active) #slot .slot-live-symbol{
  width:20px!important;
  height:20px!important;
}
@media(max-width:380px){
  html body:has(#slot.active) #slot .slot-cabinet{transform:scale(.88)!important;transform-origin:top center!important;margin-bottom:-92px!important;transition:none!important;animation:none!important}
  html body:has(#slot.active) #slot .slot-machine{width:min(86vw,336px)!important;height:430px!important;min-height:430px!important;margin-top:-12px!important;left:29px!important;top:-18px!important;z-index:10!important}
  html body:has(#slot.active) #slot .slot-window{top:85px!important;height:225px!important;padding:4px!important}
  html body:has(#slot.active) #slot .slot-symbol{height:75px!important}
  html body:has(#slot.active) #slot .slot-symbol-image{width:49px!important;height:49px!important}
  html body:has(#slot.active) #slot .slot-control-panel{width:min(86vw,336px)!important;margin:-36px auto 0!important;left:-7px!important;top:-18px!important;z-index:9!important}
  html body:has(#slot.active) #slot .slot-image-control.slot-spin-button{max-width:252px!important;height:84px!important;margin-left:auto!important;margin-right:auto!important}
  html body:has(#slot.active) #slot .slot-live{margin-top:38px!important;width:min(94%,370px)!important}
  html body:has(#slot.active) #slot .slot-live-list{height:auto!important;max-height:none!important}
  html body:has(#slot.active) #slot .slot-live:not(.open) .slot-live-list{height:0!important;max-height:0!important}
  html body:has(#slot.active) #slot .slot-live-row{min-height:46px!important;height:46px!important;border-radius:19px!important;padding:5px 11px!important}
}

/* Slot v2: curved three-reel cabinet and four independent image controls. */
html body:has(#slot.active) #slot .slot-cabinet{
  width:min(92vw,390px)!important;
  margin:12px auto 0!important;
  transform:none!important;
  animation:none!important;
}
html body:has(#slot.active) #slot .slot-machine{
  position:relative!important;
  inset:auto!important;
  left:auto!important;
  top:-14px!important;
  width:100%!important;
  height:auto!important;
  min-height:0!important;
  aspect-ratio:845/900!important;
  margin:0!important;
  overflow:visible!important;
}
html body:has(#slot.active) #slot .slot-frame-image{
  position:absolute!important;
  inset:0!important;
  width:100%!important;
  height:100%!important;
  object-fit:contain!important;
  filter:drop-shadow(0 22px 28px rgba(0,0,0,.68))!important;
  animation:none!important;
}
html body:has(#slot.active) #slot .slot-jackpot-title{
  position:absolute!important;
  z-index:12!important;
  left:50%!important;
  top:14.2%!important;
  transform:translate(-50%,-50%)!important;
  color:#d9b178!important;
  font-family:Georgia,serif!important;
  font-size:clamp(18px,6vw,27px)!important;
  font-weight:800!important;
  letter-spacing:.18em!important;
  line-height:1!important;
  text-shadow:0 2px 6px rgba(0,0,0,.9)!important;
  pointer-events:none!important;
}
html body:has(#slot.active) #slot .slot-machine-shadow{display:none!important}
html body:has(#slot.active) #slot .slot-window{
  position:absolute!important;
  z-index:9!important;
  top:28.4%!important;
  left:9.8%!important;
  width:80.4%!important;
  height:55.8%!important;
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:2.4%!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  border:0!important;
  border-radius:10px!important;
  background:transparent!important;
  box-shadow:none!important;
  perspective:380px!important;
  -webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 8%,#000 92%,transparent 100%)!important;
  mask-image:linear-gradient(to bottom,transparent 0,#000 8%,#000 92%,transparent 100%)!important;
}
html body:has(#slot.active) #slot .slot-window::before,
html body:has(#slot.active) #slot .slot-window::after{display:none!important}
html body:has(#slot.active) #slot .slot-reel{
  position:relative!important;
  min-width:0!important;
  overflow:visible!important;
  border:0!important;
  border-radius:0!important;
  outline:0!important;
  background:none!important;
  box-shadow:none!important;
  transform-style:preserve-3d!important;
}
html body:has(#slot.active) #slot .slot-reel::before,
html body:has(#slot.active) #slot .slot-reel::after{
  display:none!important;
  content:none!important;
}
html body:has(#slot.active) #slot .slot-reel-strip{transform-style:preserve-3d!important}
html body:has(#slot.active) #slot .slot-symbol{
  width:100%!important;
  height:calc((min(92vw,390px) * .558 * 900 / 845) / 3)!important;
  margin-left:0!important;
  display:grid!important;
  place-items:center!important;
  padding:0!important;
  transform-style:preserve-3d!important;
  backface-visibility:hidden!important;
  transition:transform .28s ease,opacity .28s ease,filter .28s ease!important;
  overflow:visible!important;
  border:0!important;
  border-radius:0!important;
  outline:0!important;
  background:none!important;
  box-shadow:none!important;
  filter:none!important;
}
html body:has(#slot.active) #slot .slot-symbol-image{
  width:80%!important;
  height:80%!important;
  object-fit:contain!important;
  filter:drop-shadow(0 10px 9px rgba(0,0,0,.96)) drop-shadow(0 0 15px rgba(0,0,0,.78))!important;
}
html body:has(#slot.active) #slot .slot-reel:first-child .slot-symbol-image{
  transform:translateX(-11%)!important;
}
html body:has(#slot.active) #slot .slot-reel:last-child .slot-symbol-image{
  transform:translateX(11%)!important;
}
html body:has(#slot.active) #slot .slot-symbol.is-reel-top{
  transform:perspective(180px) rotateX(-23deg) translateY(-17px) scale(.80)!important;
  transform-origin:50% 100%!important;
  opacity:.72!important;
  filter:brightness(.72) drop-shadow(0 6px 9px rgba(0,0,0,.48))!important;
}
html body:has(#slot.active) #slot .slot-symbol.is-reel-center{
  transform:translateZ(8px) scale(1.04)!important;
  transform-origin:50% 50%!important;
  opacity:1!important;
}
html body:has(#slot.active) #slot .slot-symbol.is-reel-bottom{
  transform:perspective(180px) rotateX(23deg) translateY(17px) scale(.80)!important;
  transform-origin:50% 0!important;
  opacity:.72!important;
  filter:brightness(.72) drop-shadow(0 6px 9px rgba(0,0,0,.48))!important;
}
html body:has(#slot.active) #slot .slot-simple-controls{
  position:relative!important;
  z-index:14!important;
  width:min(90vw,370px)!important;
  margin:-8px auto 0!important;
  display:grid!important;
  justify-items:center!important;
  gap:7px!important;
}
html body:has(#slot.active) #slot .slot-simple-bet-row{
  width:100%!important;
  display:grid!important;
  grid-template-columns:64px minmax(0,1fr) 64px!important;
  align-items:center!important;
  gap:8px!important;
}
html body:has(#slot.active) #slot .slot-asset-button,
html body:has(#slot.active) #slot .slot-asset-input{
  position:relative!important;
  display:grid!important;
  place-items:center!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  outline:0!important;
  background:transparent!important;
  box-shadow:none!important;
  overflow:visible!important;
  -webkit-tap-highlight-color:transparent!important;
}
html body:has(#slot.active) #slot .slot-asset-button img,
html body:has(#slot.active) #slot .slot-asset-input img{
  display:block!important;
  width:100%!important;
  height:100%!important;
  object-fit:contain!important;
  pointer-events:none!important;
  filter:drop-shadow(0 10px 14px rgba(0,0,0,.52))!important;
}
html body:has(#slot.active) #slot .slot-asset-step{
  width:64px!important;
  height:64px!important;
  cursor:pointer!important;
}
html body:has(#slot.active) #slot .slot-asset-step span{
  position:absolute!important;
  inset:0!important;
  display:grid!important;
  place-items:center!important;
  color:#f1d2a5!important;
  font-size:28px!important;
  font-weight:900!important;
  line-height:1!important;
  text-shadow:0 2px 7px rgba(0,0,0,.9)!important;
  pointer-events:none!important;
}
html body:has(#slot.active) #slot .slot-asset-input{
  width:100%!important;
  height:64px!important;
}
html body:has(#slot.active) #slot .slot-asset-input input{
  position:absolute!important;
  z-index:2!important;
  left:10%!important;
  top:13%!important;
  width:80%!important;
  height:74%!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  outline:0!important;
  background:transparent!important;
  color:#fff1df!important;
  text-align:center!important;
  font-size:22px!important;
  font-weight:950!important;
  appearance:none!important;
  -webkit-appearance:none!important;
  -moz-appearance:textfield!important;
  border-radius:0!important;
  box-shadow:none!important;
  background:none!important;
  text-shadow:0 2px 8px rgba(0,0,0,.9)!important;
}
html body:has(#slot.active) #slot .slot-asset-input input::-webkit-inner-spin-button,
html body:has(#slot.active) #slot .slot-asset-input input::-webkit-outer-spin-button{-webkit-appearance:none!important;margin:0!important}
html body:has(#slot.active) #slot .slot-asset-input small{
  display:none!important;
  position:absolute!important;
  z-index:2!important;
  right:10%!important;
  top:50%!important;
  transform:translateY(-50%)!important;
  color:rgba(241,210,165,.72)!important;
  font-size:9px!important;
  font-weight:900!important;
  letter-spacing:.10em!important;
  pointer-events:none!important;
}
html body:has(#slot.active) #slot .slot-asset-spin{
  width:min(76vw,300px)!important;
  height:82px!important;
  cursor:pointer!important;
  transition:transform .15s ease,filter .15s ease!important;
}
html body:has(#slot.active) #slot .slot-asset-spin:active,
html body:has(#slot.active) #slot .slot-asset-step:active{transform:scale(.96)!important;filter:brightness(.84)!important}
html body:has(#slot.active) #slot .slot-asset-spin strong{
  position:absolute!important;
  z-index:2!important;
  left:50%!important;
  top:45%!important;
  transform:translate(-50%,-50%)!important;
  color:#f8dfbc!important;
  font-family:Georgia,serif!important;
  font-size:23px!important;
  font-weight:900!important;
  letter-spacing:.12em!important;
  line-height:1!important;
  text-shadow:0 2px 8px rgba(0,0,0,.92)!important;
  pointer-events:none!important;
}
html body:has(#slot.active) #slot .slot-asset-spin .slot-spin-cost{
  position:absolute!important;
  z-index:2!important;
  left:50%!important;
  top:69%!important;
  transform:translate(-50%,-50%)!important;
  display:block!important;
  margin:0!important;
  color:rgba(248,223,188,.72)!important;
  font-size:9px!important;
  font-weight:850!important;
  letter-spacing:.10em!important;
  line-height:1!important;
  pointer-events:none!important;
}
html body:has(#slot.active) #slot .slot-asset-button:disabled{opacity:.48!important;cursor:default!important}
html body:has(#slot.active) #slot .slot-live{margin-top:30px!important}
@media(max-width:380px){
  html body:has(#slot.active) #slot .slot-cabinet{width:min(94vw,356px)!important;margin-top:10px!important}
  html body:has(#slot.active) #slot .slot-symbol{height:calc((min(94vw,356px) * .558 * 900 / 845) / 3)!important}
  html body:has(#slot.active) #slot .slot-simple-controls{width:min(92vw,348px)!important;margin-top:-5px!important}
  html body:has(#slot.active) #slot .slot-simple-bet-row{grid-template-columns:58px minmax(0,1fr) 58px!important;gap:6px!important}
  html body:has(#slot.active) #slot .slot-asset-step{width:58px!important;height:58px!important}
  html body:has(#slot.active) #slot .slot-asset-input{height:58px!important}
  html body:has(#slot.active) #slot .slot-asset-spin{width:min(78vw,286px)!important;height:77px!important}
}



html body:has(#slot.active) #slot .slot-symbol-fallback{
  display:none!important;
}
`;
