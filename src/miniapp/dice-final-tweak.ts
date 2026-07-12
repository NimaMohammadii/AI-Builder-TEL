export const DICE_FINAL_TWEAK = `<style>
#dice.dice-view{
  filter:brightness(1.08) contrast(1.02)!important;
}
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
  border:0!important;
  outline:0!important;
  box-shadow:none!important;
  backdrop-filter:blur(4px) saturate(1.08)!important;
  -webkit-backdrop-filter:blur(4px) saturate(1.08)!important;
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
#dice .dice-status.win{
  color:#35ff9a!important;
  text-shadow:0 0 14px rgba(53,255,154,.18)!important;
}
#dice .dice-status.lose{
  color:#ff4f7b!important;
  text-shadow:0 0 14px rgba(255,79,123,.16)!important;
}
#dice .dice-range-card,
#dice .dice-result-card{
  background:rgba(255,255,255,.045)!important;
  border:0!important;
  outline:0!important;
  box-shadow:none!important;
  backdrop-filter:blur(3px) saturate(1.08)!important;
  -webkit-backdrop-filter:blur(3px) saturate(1.08)!important;
}
#dice .dice-range-card:before,
#dice .dice-result-card:before{
  display:none!important;
  content:none!important;
}
#dice .dice-range-card:after,
#dice .dice-result-card:after{
  display:none!important;
  content:none!important;
}
#dice .dice-result-row{
  background:rgba(255,255,255,.045)!important;
  border:1px solid rgba(255,255,255,.08)!important;
  box-shadow:none!important;
  backdrop-filter:blur(3px) saturate(1.06)!important;
  -webkit-backdrop-filter:blur(3px) saturate(1.06)!important;
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
  gap:1px!important;
  padding-top:0!important;
  line-height:1!important;
  transform:none!important;
}
#dice .dice-bet .dice-bet-main:before{
  content:''!important;
  width:25px!important;
  height:25px!important;
  flex:0 0 25px!important;
  display:block!important;
  background:url('/app/api/nft-price-icon.png') center/contain no-repeat!important;
}
#dice .dice-bet-box{
  position:relative!important;
}
#dice .dice-bet-box:before{
  content:''!important;
  position:absolute!important;
  left:calc(50% - 46px)!important;
  top:72px!important;
  width:32px!important;
  height:32px!important;
  z-index:2!important;
  pointer-events:none!important;
  background:url('/app/api/nft-price-icon.png') center/contain no-repeat!important;
}
#dice .dice-bet-input{
  padding-left:38px!important;
  padding-right:38px!important;
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
  background:linear-gradient(180deg,rgba(92,10,34,.86),rgba(38,2,14,.92))!important;
  border-color:rgba(148,24,62,.32)!important;
  box-shadow:0 14px 32px rgba(0,0,0,.34),0 0 24px rgba(104,8,36,.22)!important;
  color:#fff!important;
  text-transform:uppercase!important;
  letter-spacing:.08em!important;
  font-weight:950!important;
  position:relative!important;
  overflow:hidden!important;
  backdrop-filter:blur(3px) saturate(1.12)!important;
  -webkit-backdrop-filter:blur(3px) saturate(1.12)!important;
}
#dice .dice-roll-button:before{
  display:none!important;
  content:none!important;
}
#dice .dice-roll-button:active{
  transform:translateY(2px) scale(.98)!important;
  background:linear-gradient(180deg,rgba(64,5,23,.92),rgba(22,1,9,.96))!important;
}
#dice .dice-roll-button.is-rolling{
  background:linear-gradient(180deg,rgba(64,5,23,.92),rgba(22,1,9,.96))!important;
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
    gap:1px!important;
  }
  #dice .dice-bet .dice-bet-main:before{
    width:23px!important;
    height:23px!important;
    flex-basis:23px!important;
  }
  #dice .dice-bet-box:before{
    left:calc(50% - 44px)!important;
    top:72px!important;
    width:30px!important;
    height:30px!important;
  }
  #dice .dice-roll-button{
    height:58px!important;
    margin:4px auto 0!important;
    border-radius:22px!important;
  }
}
</style>`;