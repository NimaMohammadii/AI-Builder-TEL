export const DICE_FINAL_TWEAK = `<style>
#dice .dice-uploaded-stats-image{
  width:min(560px,calc(100% + 46px))!important;
  max-width:none!important;
  top:-68px!important;
}
#dice .dice-control-grid .dice-field small,
#dice .dice-control-grid .dice-field b{
  transform:translateY(-8px)!important;
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
  #dice .dice-control-grid .dice-field small,
  #dice .dice-control-grid .dice-field b{
    transform:translateY(-7px)!important;
  }
}
</style>`;
