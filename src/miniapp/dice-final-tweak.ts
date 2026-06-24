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
  height:58px!important;
  margin:4px auto 0!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  padding:0!important;
  line-height:1!important;
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
    height:56px!important;
    margin:4px auto 0!important;
  }
}
</style>`;
