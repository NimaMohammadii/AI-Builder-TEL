export const DICE_FINAL_TWEAK = `<style>
#dice .dice-uploaded-stats-image{
  width:min(560px,calc(100% + 46px))!important;
  max-width:none!important;
  top:-68px!important;
}
#dice .dice-panel{
  transform:translateY(-18px)!important;
}
#dice .dice-status{
  transform:translateY(-10px)!important;
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
#dice .dice-bet .dice-bet-row-image{
  transform:translateY(-48%) scale(1.28)!important;
}
#dice .dice-bet.has-dice-image .dice-bet-main,
#dice .dice-bet.has-dice-image .dice-bet-main.active,
#dice .dice-bet .dice-bet-main,
#dice .dice-bet .dice-bet-main.active{
  color:#fff!important;
  text-shadow:0 5px 14px rgba(0,0,0,.85)!important;
  font-size:17px!important;
  font-weight:900!important;
  letter-spacing:-.03em!important;
  font-variant-numeric:tabular-nums lining-nums!important;
  display:flex!important;
  align-items:flex-start!important;
  justify-content:center!important;
  padding-top:0!important;
  line-height:1!important;
  transform:translateY(-7px)!important;
}
#dice .dice-roll-button,
#dice .dice-roll-button .dice-roll-button-image{
  transition:transform .14s cubic-bezier(.2,.9,.2,1),filter .14s ease,opacity .14s ease!important;
  will-change:transform,filter!important;
}
#dice .dice-roll-button.is-pressing .dice-roll-button-image,
#dice .dice-roll-button:active .dice-roll-button-image{
  transform:translateY(-22%) scale(1.13)!important;
  filter:brightness(1.18) saturate(1.12)!important;
}
#dice .dice-roll-button.roll-pop .dice-roll-button-image{
  animation:diceRollButtonPop .34s cubic-bezier(.18,.9,.25,1) both!important;
}
@keyframes diceRollButtonPop{
  0%{transform:translateY(-22%) scale(1)}
  36%{transform:translateY(-22%) scale(1.15)}
  100%{transform:translateY(-22%) scale(1.03)}
}
#dice button.dice-field.dice-mode-field,
#dice button.dice-field.dice-mode-field.active,
#dice button.dice-field.dice-mode-field:hover,
#dice button.dice-field.dice-mode-field:focus,
#dice button.dice-field.dice-mode-field:active{
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
  border:0!important;
  border-color:transparent!important;
  border-radius:0!important;
  box-shadow:none!important;
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
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
}
@media(max-width:420px){
  #dice .dice-uploaded-stats-image{
    width:min(500px,calc(100% + 44px))!important;
    max-width:none!important;
    top:-68px!important;
  }
  #dice .dice-panel{
    transform:translateY(-18px)!important;
  }
  #dice .dice-status{
    transform:translateY(-9px)!important;
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
  #dice .dice-bet .dice-bet-row-image{
    transform:translateY(-48%) scale(1.36)!important;
  }
  #dice .dice-bet.has-dice-image .dice-bet-main,
  #dice .dice-bet.has-dice-image .dice-bet-main.active,
  #dice .dice-bet .dice-bet-main,
  #dice .dice-bet .dice-bet-main.active{
    padding-top:0!important;
    transform:translateY(-7px)!important;
  }
}
</style><script>
(function(){
  var root=document.getElementById('dice');
  if(!root||root.dataset.diceRollButtonPolish)return;
  root.dataset.diceRollButtonPolish='1';
  function bind(){
    var btn=root.querySelector('[data-dice-play]');
    if(!btn||btn.dataset.rollPolishBound)return;
    btn.dataset.rollPolishBound='1';
    function press(){btn.classList.add('is-pressing')}
    function release(){btn.classList.remove('is-pressing')}
    btn.addEventListener('pointerdown',press,{passive:true});
    btn.addEventListener('pointerup',release,{passive:true});
    btn.addEventListener('pointercancel',release,{passive:true});
    btn.addEventListener('pointerleave',release,{passive:true});
    btn.addEventListener('click',function(){
      btn.classList.remove('roll-pop');
      void btn.offsetWidth;
      btn.classList.add('roll-pop');
      setTimeout(function(){btn.classList.remove('roll-pop')},360);
    },true);
  }
  bind();
  setTimeout(bind,250);
})();
</script>`;
