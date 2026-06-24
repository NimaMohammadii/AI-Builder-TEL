export const DICE_FINAL_TWEAK = `<style>
#dice .dice-wrap{
  gap:12px!important;
  padding-bottom:max(14px,env(safe-area-inset-bottom))!important;
}
#dice .dice-panel{
  transform:none!important;
  gap:10px!important;
  padding:14px 16px 16px!important;
  border-radius:30px!important;
  overflow:hidden!important;
}
#dice .dice-status{
  transform:none!important;
  min-height:22px!important;
  margin:0!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  line-height:1.15!important;
}
#dice .dice-range-card{
  background:linear-gradient(180deg,rgba(24,20,35,.76),rgba(5,5,10,.72))!important;
  border:1px solid rgba(255,255,255,.16)!important;
  box-shadow:0 24px 70px rgba(0,0,0,.62),inset 0 1px 0 rgba(255,255,255,.15)!important;
  backdrop-filter:blur(20px) saturate(1.35)!important;
  -webkit-backdrop-filter:blur(20px) saturate(1.35)!important;
}
#dice .dice-range-card:before{
  content:'LUCK METER'!important;
  position:absolute!important;
  left:22px!important;
  top:14px!important;
  font-size:10px!important;
  font-weight:950!important;
  letter-spacing:.16em!important;
  color:rgba(255,255,255,.48)!important;
}
#dice .dice-range-card:after{
  content:''!important;
  position:absolute!important;
  inset:1px!important;
  border-radius:27px!important;
  pointer-events:none!important;
  background:linear-gradient(135deg,rgba(255,255,255,.18),transparent 32%,rgba(255,43,119,.08) 58%,rgba(77,255,189,.10))!important;
}
#dice .dice-slider-visual{
  height:34px!important;
  background:rgba(2,2,7,.82)!important;
  border-color:rgba(255,255,255,.18)!important;
  box-shadow:0 18px 40px rgba(0,0,0,.56),inset 0 1px 0 rgba(255,255,255,.18)!important;
}
#dice .dice-slider-visual:before{
  height:16px!important;
  background:linear-gradient(90deg,#ff2b6f 0%,#ff2b6f var(--dice-fill-pos),#1dff9b var(--dice-fill-pos),#1dff9b 100%)!important;
  box-shadow:0 0 22px rgba(255,43,111,.25),0 0 22px rgba(29,255,155,.18)!important;
}
#dice .dice-slider-thumb{
  width:42px!important;
  height:42px!important;
  border-radius:15px!important;
  background:linear-gradient(180deg,rgba(255,255,255,.26),rgba(255,255,255,.09))!important;
  border-color:rgba(255,255,255,.42)!important;
  box-shadow:0 18px 46px rgba(0,0,0,.7),0 0 24px rgba(255,255,255,.12),inset 0 1px 0 rgba(255,255,255,.54)!important;
}
#dice .dice-control-grid{
  width:100%!important;
  margin:0 auto!important;
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:9px!important;
  align-items:stretch!important;
}
#dice .dice-control-grid .dice-field{
  min-width:0!important;
  min-height:82px!important;
  height:82px!important;
  padding:12px 12px!important;
  border-radius:20px!important;
  display:flex!important;
  flex-direction:column!important;
  justify-content:center!important;
  overflow:hidden!important;
}
#dice .dice-control-grid .dice-field small,
#dice .dice-control-grid .dice-field b{
  transform:none!important;
}
#dice .dice-control-grid .dice-field small{
  font-size:12px!important;
  line-height:1.1!important;
  font-weight:900!important;
  color:rgba(255,255,255,.52)!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#dice .dice-control-grid .dice-field b{
  margin-top:10px!important;
  min-width:0!important;
  width:100%!important;
  font-size:21px!important;
  line-height:1.05!important;
  font-weight:900!important;
  align-items:center!important;
  gap:6px!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#dice .dice-control-grid .dice-field b span{
  min-width:0!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#dice button.dice-field.dice-mode-field,
#dice button.dice-field.dice-mode-field.active,
#dice button.dice-field.dice-mode-field:hover,
#dice button.dice-field.dice-mode-field:focus,
#dice button.dice-field.dice-mode-field:active{
  min-height:82px!important;
  height:82px!important;
  padding:12px 12px!important;
  border-radius:20px!important;
  background:#030303!important;
  background-color:#030303!important;
  background-image:none!important;
  border:1px solid rgba(255,255,255,.10)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;
  color:#fff!important;
  text-align:left!important;
  outline:0!important;
  filter:none!important;
  appearance:none!important;
  -webkit-appearance:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
#dice button.dice-field.dice-mode-field:before,
#dice button.dice-field.dice-mode-field:after{
  display:none!important;
  content:none!important;
}
#dice button.dice-field.dice-mode-field small[data-dice-mode-label]{
  display:block!important;
  color:rgba(255,255,255,.52)!important;
  font-size:12px!important;
  line-height:1.1!important;
  font-weight:900!important;
  transform:none!important;
}
#dice button.dice-field.dice-mode-field b{
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  width:100%!important;
  margin-top:10px!important;
  transform:none!important;
}
#dice .dice-bet{
  width:100%!important;
  margin:2px auto 0!important;
  gap:9px!important;
}
#dice .dice-bet button{
  height:50px!important;
  border-radius:19px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  padding:0!important;
  line-height:1!important;
}
#dice .dice-bet .dice-bet-main,
#dice .dice-bet .dice-bet-main.active{
  color:#fff!important;
  text-shadow:0 5px 14px rgba(0,0,0,.85)!important;
  font-size:18px!important;
  font-weight:900!important;
  letter-spacing:-.03em!important;
  font-variant-numeric:tabular-nums lining-nums!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  padding-top:0!important;
  line-height:1!important;
  transform:none!important;
}
#dice .dice-roll-button{
  width:100%!important;
  height:62px!important;
  margin:4px auto 0!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  padding:0!important;
  line-height:1!important;
  border-radius:24px!important;
  background:linear-gradient(180deg,rgba(255,255,255,.27),rgba(255,255,255,.07)),linear-gradient(135deg,#ff2c72 0%,#7a0dff 52%,#13f6a5 120%)!important;
  border-color:rgba(255,255,255,.26)!important;
  box-shadow:0 20px 44px rgba(255,43,111,.22),0 18px 42px rgba(0,0,0,.62),inset 0 1px 0 rgba(255,255,255,.42),inset 0 -1px 0 rgba(0,0,0,.42)!important;
  text-transform:uppercase!important;
  letter-spacing:.08em!important;
  font-weight:950!important;
  position:relative!important;
  overflow:hidden!important;
}
#dice .dice-roll-button:before{
  content:''!important;
  position:absolute!important;
  inset:-80% -30%!important;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.42),transparent)!important;
  transform:translateX(-65%) rotate(18deg)!important;
  animation:diceButtonSheen 2.8s ease-in-out infinite!important;
}
#dice .dice-roll-button:active{
  transform:translateY(2px) scale(.98)!important;
}
@keyframes diceButtonSheen{
  0%,38%{transform:translateX(-70%) rotate(18deg)}
  72%,100%{transform:translateX(70%) rotate(18deg)}
}
@media(max-width:420px){
  #dice .dice-wrap{
    gap:10px!important;
    padding-bottom:max(12px,env(safe-area-inset-bottom))!important;
  }
  #dice .dice-panel{
    transform:none!important;
    gap:9px!important;
    padding:12px 14px 14px!important;
    border-radius:28px!important;
  }
  #dice .dice-status{
    transform:none!important;
    min-height:21px!important;
  }
  #dice .dice-range-card{
    top:calc(env(safe-area-inset-top) + 126px)!important;
  }
  #dice .dice-control-grid{
    margin:0 auto!important;
    gap:8px!important;
  }
  #dice .dice-control-grid .dice-field,
  #dice button.dice-field.dice-mode-field,
  #dice button.dice-field.dice-mode-field.active,
  #dice button.dice-field.dice-mode-field:hover,
  #dice button.dice-field.dice-mode-field:focus,
  #dice button.dice-field.dice-mode-field:active{
    min-height:78px!important;
    height:78px!important;
    padding:11px 10px!important;
    border-radius:19px!important;
  }
  #dice .dice-control-grid .dice-field small,
  #dice button.dice-field.dice-mode-field small[data-dice-mode-label]{
    font-size:11px!important;
    transform:none!important;
  }
  #dice .dice-control-grid .dice-field b,
  #dice button.dice-field.dice-mode-field b{
    margin-top:9px!important;
    font-size:19px!important;
    transform:none!important;
  }
  #dice .dice-bet{
    margin:2px auto 0!important;
    gap:8px!important;
  }
  #dice .dice-bet button{
    height:48px!important;
    border-radius:18px!important;
  }
  #dice .dice-bet .dice-bet-main,
  #dice .dice-bet .dice-bet-main.active{
    padding-top:0!important;
    transform:none!important;
    align-items:center!important;
  }
  #dice .dice-roll-button{
    height:58px!important;
    margin:4px auto 0!important;
    border-radius:22px!important;
  }
}
@media(prefers-reduced-motion:reduce){
  #dice .dice-roll-button:before{
    animation:none!important;
  }
}
</style>`;