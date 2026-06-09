export const DICE_CONTROL_POLISH_STYLES = `
.dice-view .dice-panel{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;padding:12px 14px 10px!important}
.dice-view .dice-control-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;width:min(486px,100%)!important;height:auto!important;min-height:0!important;margin:18px auto 0!important;align-items:stretch!important}
.dice-view .dice-control-grid .dice-field{min-width:0!important;min-height:70px!important;height:70px!important;border-radius:20px!important;padding:11px 12px!important;background:rgba(255,255,255,.035)!important;border:1px solid rgba(255,255,255,.10)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;display:grid!important;align-content:center!important;gap:8px!important;text-align:left!important;overflow:hidden!important}
.dice-view .dice-control-grid .dice-field small{font-size:11px!important;line-height:1!important;font-weight:760!important;color:rgba(255,255,255,.48)!important;letter-spacing:-.01em!important;white-space:nowrap!important;text-transform:none!important}
.dice-view .dice-control-grid .dice-field b{margin:0!important;font-size:18px!important;line-height:1!important;font-weight:850!important;letter-spacing:-.035em!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:4px!important;min-width:0!important;white-space:nowrap!important}
.dice-view .dice-control-grid .dice-field b span{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important}
.dice-view .dice-target-card b{justify-content:center!important;text-align:center!important;font-size:20px!important}
.dice-view .dice-mode-card{width:min(486px,100%)!important;min-height:54px!important;height:54px!important;margin:0 auto!important;border-radius:20px!important;border:1px solid rgba(255,255,255,.11)!important;background:rgba(255,255,255,.045)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.065)!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:0 14px!important;text-align:left!important}
.dice-view .dice-mode-card small{font-size:11px!important;line-height:1!important;font-weight:760!important;color:rgba(255,255,255,.48)!important;letter-spacing:-.01em!important;text-transform:none!important}
.dice-view .dice-mode-card b{display:flex!important;align-items:center!important;gap:8px!important;margin:0!important;font-size:18px!important;font-weight:850!important;letter-spacing:-.03em!important;color:rgba(255,255,255,.94)!important;white-space:nowrap!important}
.dice-view .dice-mode-card i{font-style:normal!important;font-size:16px!important;color:rgba(255,255,255,.64)!important}
.dice-view .dice-bet{width:min(486px,100%)!important;height:48px!important;min-height:48px!important;margin:0 auto!important;display:grid!important;grid-template-columns:.72fr 1.56fr .72fr!important;gap:8px!important}
.dice-view .dice-bet button{height:48px!important;border-radius:18px!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;text-align:center!important;font-size:14px!important}
.dice-view .dice-roll-button{width:min(486px,100%)!important;height:56px!important;min-height:56px!important;margin:2px auto 0!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important}
@media(max-width:420px){.dice-view .dice-panel{padding:10px 12px 8px!important;gap:8px!important}.dice-view .dice-control-grid{width:min(432px,100%)!important;gap:7px!important;margin:16px auto 0!important}.dice-view .dice-control-grid .dice-field{height:66px!important;min-height:66px!important;padding:10px 9px!important;border-radius:18px!important}.dice-view .dice-control-grid .dice-field small{font-size:10.5px!important}.dice-view .dice-control-grid .dice-field b{font-size:16px!important}.dice-view .dice-target-card b{font-size:18px!important}.dice-view .dice-mode-card{width:min(432px,100%)!important;height:50px!important;min-height:50px!important;border-radius:18px!important;padding:0 12px!important}.dice-view .dice-mode-card b{font-size:16px!important}.dice-view .dice-bet{width:min(432px,100%)!important;height:46px!important;min-height:46px!important}.dice-view .dice-bet button{height:46px!important}.dice-view .dice-roll-button{width:min(432px,100%)!important;height:54px!important;min-height:54px!important}}
`;

export const DICE_CONTROL_POLISH_SCRIPT = `
(function(){
  function polishDiceControls(){
    var root=document.getElementById('dice');
    if(!root||root.dataset.controlPolished)return;
    var grid=root.querySelector('.dice-control-grid');
    var mode=root.querySelector('[data-dice-mode-toggle]');
    var bet=root.querySelector('.dice-bet');
    var target=root.querySelector('[data-dice-target]');
    var label=root.querySelector('[data-dice-mode-label]');
    if(!grid||!mode||!bet||!target||!label)return;
    root.dataset.controlPolished='1';
    var targetCard=document.createElement('div');
    targetCard.className='dice-field dice-target-card';
    var targetSmall=document.createElement('small');
    targetSmall.textContent='Target';
    var targetValue=document.createElement('b');
    targetValue.appendChild(target);
    targetCard.appendChild(targetSmall);
    targetCard.appendChild(targetValue);
    var children=grid.children;
    if(children.length>1)grid.insertBefore(targetCard,children[1]);else grid.appendChild(targetCard);
    mode.className='dice-mode-card';
    mode.innerHTML='';
    var modeSmall=document.createElement('small');
    modeSmall.textContent='Under / Over';
    var modeValue=document.createElement('b');
    var icon=document.createElement('i');
    icon.textContent='↻';
    modeValue.appendChild(label);
    modeValue.appendChild(icon);
    mode.appendChild(modeSmall);
    mode.appendChild(modeValue);
    bet.parentNode.insertBefore(mode,bet);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polishDiceControls);else polishDiceControls();
  document.addEventListener('click',function(){setTimeout(polishDiceControls,50)},true);
})();
`;
