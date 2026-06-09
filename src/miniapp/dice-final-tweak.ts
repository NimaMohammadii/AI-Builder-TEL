export const DICE_FINAL_TWEAK = `<style>
#dice .dice-panel{
  transform:translateY(-30px)!important;
  gap:4px!important;
}
#dice .dice-status{
  transform:translateY(-12px)!important;
}
#dice .dice-control-grid{
  margin:0 auto -8px!important;
}
#dice .dice-control-grid .dice-field small,
#dice .dice-control-grid .dice-field b{
  transform:translateY(-8px)!important;
}
#dice .dice-control-grid .dice-field small{
  font-size:12px!important;
  line-height:1.05!important;
}
#dice .dice-control-grid .dice-field b{
  font-size:20px!important;
  line-height:1.05!important;
}
#dice button.dice-field.dice-mode-field,
#dice button.dice-field.dice-mode-field.active,
#dice button.dice-field.dice-mode-field:hover,
#dice button.dice-field.dice-mode-field:focus,
#dice button.dice-field.dice-mode-field:active{
  display:block!important;
  min-height:74px!important;
  height:74px!important;
  padding:12px 13px!important;
  border-radius:18px!important;
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
  color:rgba(255,255,255,.56)!important;
  font-size:12px!important;
  line-height:1.05!important;
  font-weight:900!important;
  transform:translateY(-8px)!important;
}
#dice button.dice-field.dice-mode-field b{
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  width:100%!important;
  margin-top:13px!important;
  transform:translateY(-8px)!important;
}
#dice .dice-bet{
  margin:4px auto 0!important;
}
#dice .dice-bet .dice-bet-main,
#dice .dice-bet .dice-bet-main.active{
  color:#fff!important;
  text-shadow:0 5px 14px rgba(0,0,0,.85)!important;
  font-size:17px!important;
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
  margin:4px auto -4px!important;
}
@media(max-width:420px){
  #dice .dice-panel{
    transform:translateY(-30px)!important;
    gap:4px!important;
  }
  #dice .dice-status{
    transform:translateY(-11px)!important;
  }
  #dice .dice-control-grid{
    margin:0 auto -8px!important;
  }
  #dice .dice-control-grid .dice-field small,
  #dice .dice-control-grid .dice-field b{
    transform:translateY(-7px)!important;
  }
  #dice .dice-control-grid .dice-field small{
    font-size:11.5px!important;
  }
  #dice .dice-control-grid .dice-field b{
    font-size:19px!important;
  }
  #dice button.dice-field.dice-mode-field,
  #dice button.dice-field.dice-mode-field.active,
  #dice button.dice-field.dice-mode-field:hover,
  #dice button.dice-field.dice-mode-field:focus,
  #dice button.dice-field.dice-mode-field:active{
    min-height:70px!important;
    height:70px!important;
    padding:11px 11px!important;
    border-radius:18px!important;
    background:#030303!important;
    background-color:#030303!important;
    border:1px solid rgba(255,255,255,.10)!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;
    color:#fff!important;
    text-align:left!important;
  }
  #dice button.dice-field.dice-mode-field small[data-dice-mode-label]{
    font-size:11.5px!important;
    transform:translateY(-7px)!important;
  }
  #dice button.dice-field.dice-mode-field b{
    margin-top:12px!important;
    transform:translateY(-7px)!important;
  }
  #dice .dice-bet{
    margin:4px auto 0!important;
  }
  #dice .dice-bet .dice-bet-main,
  #dice .dice-bet .dice-bet-main.active{
    padding-top:0!important;
    transform:none!important;
    align-items:center!important;
  }
  #dice .dice-roll-button{
    margin:4px auto -4px!important;
  }
}
</style>`;
