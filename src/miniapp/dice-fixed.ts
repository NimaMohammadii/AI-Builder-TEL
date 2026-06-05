import { DICE_SECTION as RAW_DICE_SECTION } from './dice';

const DICE_POLISH_STYLES = `
body:has(#dice.active),
body:has(#dice.active) .app,
body:has(#dice.active) main.app,
body:has(#dice.active) .content,
body:has(#dice.active) .top,
body:has(#dice.active) header.top {
  background: #000 !important;
  background-image: radial-gradient(circle at 50% 0%, rgba(96, 6, 36, .34), transparent 34%), linear-gradient(180deg, #080004 0%, #000 55%) !important;
}

.dice-view {
  background: radial-gradient(circle at 50% -8%, rgba(122, 15, 46, .34), transparent 36%), #000 !important;
  padding-left: 18px !important;
  padding-right: 18px !important;
}

.dice-wrap {
  max-width: 520px !important;
  gap: 14px !important;
}

.dice-view .dice-range-card {
  position: fixed !important;
  top: calc(env(safe-area-inset-top) + 142px) !important;
  left: 18px !important;
  right: 18px !important;
  z-index: 8 !important;
  width: auto !important;
  max-width: 520px !important;
  height: 174px !important;
  margin: 0 auto !important;
  padding: 22px 16px 18px !important;
  border-radius: 32px !important;
  background: linear-gradient(180deg, rgba(30,12,19,.82), rgba(4,4,5,.78)) !important;
  border: 1px solid rgba(255,77,122,.22) !important;
  box-shadow: 0 28px 72px rgba(0,0,0,.72), 0 0 38px rgba(176,23,70,.10), inset 0 1px 0 rgba(255,255,255,.12), inset 0 -18px 40px rgba(120,8,41,.10) !important;
  transform: none !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  backdrop-filter: blur(22px) saturate(1.28) !important;
  -webkit-backdrop-filter: blur(22px) saturate(1.28) !important;
}

.dice-view .dice-range-card::before {
  content: 'Move the slider to set your target' !important;
  display: block !important;
  color: rgba(255,255,255,.70) !important;
  font-size: 13px !important;
  font-weight: 760 !important;
  text-align: center !important;
  margin-bottom: 18px !important;
}

.dice-view .dice-track-labels {
  height: 24px !important;
  padding: 0 22px !important;
  transform: none !important;
  color: rgba(255,255,255,.58) !important;
  font-size: 15px !important;
  font-weight: 850 !important;
}

.dice-view .dice-track-labels span:nth-child(1){left:22px!important}
.dice-view .dice-track-labels span:nth-child(2){left:calc(25% + 11px)!important}
.dice-view .dice-track-labels span:nth-child(3){left:50%!important}
.dice-view .dice-track-labels span:nth-child(4){left:calc(75% - 11px)!important}
.dice-view .dice-track-labels span:nth-child(5){left:calc(100% - 22px)!important}

.dice-view .dice-slider-shell {
  height: 68px !important;
  padding: 22px 4px 16px !important;
}

.dice-view .dice-slider-shell::before {
  left: 24px !important;
  right: 24px !important;
  top: 4px !important;
  height: 12px !important;
  opacity: .45 !important;
  background: repeating-linear-gradient(90deg, rgba(255,255,255,.20) 0 1px, transparent 1px 17px) !important;
  clip-path: none !important;
}

.dice-view .dice-slider-visual {
  left: 0 !important;
  right: 0 !important;
  height: 34px !important;
  background: rgba(0,0,0,.72) !important;
  border: 1px solid rgba(255,255,255,.13) !important;
  box-shadow: 0 18px 40px rgba(0,0,0,.50), inset 0 1px 0 rgba(255,255,255,.18), inset 0 -1px 0 rgba(0,0,0,.72) !important;
}

.dice-view .dice-slider-visual::before {
  height: 15px !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.16), 0 0 18px rgba(255,55,110,.13) !important;
}

.dice-view .dice-slider-thumb {
  width: 46px !important;
  height: 46px !important;
  border-radius: 16px !important;
  background: linear-gradient(180deg, rgba(91,30,47,.90), rgba(28,12,20,.86)) !important;
  border: 1px solid rgba(255,116,154,.56) !important;
  box-shadow: 0 18px 42px rgba(0,0,0,.70), 0 0 28px rgba(255,61,116,.22), inset 0 1px 0 rgba(255,255,255,.28), inset 0 -8px 18px rgba(255,57,108,.08) !important;
}

.dice-panel {
  border-radius: 34px !important;
  background: linear-gradient(180deg, rgba(18,12,15,.78), rgba(5,5,5,.82)) !important;
  border: 1px solid rgba(255,77,122,.22) !important;
  box-shadow: 0 30px 84px rgba(0,0,0,.76), 0 0 44px rgba(138,13,50,.12), inset 0 1px 0 rgba(255,255,255,.11) !important;
  padding: 16px !important;
  backdrop-filter: blur(20px) saturate(1.20) !important;
  -webkit-backdrop-filter: blur(20px) saturate(1.20) !important;
}

.dice-field {
  min-height: 92px !important;
  border-radius: 22px !important;
  background: linear-gradient(180deg, rgba(30,18,24,.72), rgba(6,6,7,.70)) !important;
  border: 1px solid rgba(255,255,255,.10) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 12px 30px rgba(0,0,0,.32) !important;
}

.dice-field small {
  color: rgba(255,255,255,.52) !important;
  font-size: 11px !important;
  font-weight: 900 !important;
  letter-spacing: .045em !important;
  text-transform: uppercase !important;
}

.dice-field b {
  font-size: 25px !important;
  font-weight: 950 !important;
  color: #fff !important;
}

.dice-bet button {
  height: 52px !important;
  border-radius: 20px !important;
  background: linear-gradient(180deg, rgba(26,26,27,.82), rgba(10,10,10,.82)) !important;
  border: 1px solid rgba(255,255,255,.12) !important;
}

.dice-bet button.active,
.dice-bet-main {
  background: linear-gradient(180deg, rgba(72,18,38,.78), rgba(22,12,18,.82)) !important;
  border-color: rgba(255,77,122,.48) !important;
  box-shadow: 0 0 28px rgba(255,61,116,.16), inset 0 1px 0 rgba(255,255,255,.13) !important;
}

.dice-roll-button {
  height: 78px !important;
  border-radius: 999px !important;
  background: linear-gradient(180deg, rgba(127,18,54,.98), rgba(52,5,23,.98)) !important;
  border: 1px solid rgba(255,93,139,.58) !important;
  color: #fff !important;
  font-size: 30px !important;
  font-weight: 950 !important;
  box-shadow: 0 22px 54px rgba(0,0,0,.62), 0 0 38px rgba(255,61,116,.22), inset 0 1px 0 rgba(255,255,255,.24) !important;
}

.dice-roll-button::before {
  content: '⚂' !important;
  margin-right: 12px !important;
}

.dice-stats {
  gap: 0 !important;
  border-radius: 24px !important;
  border: 1px solid rgba(255,255,255,.085) !important;
  background: rgba(0,0,0,.38) !important;
  overflow: hidden !important;
}

.dice-stat {
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
}

.dice-stat + .dice-stat::before {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  top: 14px !important;
  bottom: 14px !important;
  width: 1px !important;
  background: rgba(255,255,255,.10) !important;
}

.dice-view .dice-result-card {
  position: fixed !important;
  top: calc(env(safe-area-inset-top) + 330px) !important;
  left: 18px !important;
  right: 18px !important;
  max-width: 520px !important;
  margin: 0 auto !important;
  border-radius: 28px !important;
  background: linear-gradient(180deg, rgba(18,12,15,.70), rgba(4,4,5,.76)) !important;
  border: 1px solid rgba(255,77,122,.16) !important;
  box-shadow: 0 20px 58px rgba(0,0,0,.52), inset 0 1px 0 rgba(255,255,255,.08) !important;
  backdrop-filter: blur(18px) saturate(1.18) !important;
  -webkit-backdrop-filter: blur(18px) saturate(1.18) !important;
}

.dice-view .dice-result-card:not(.open) {
  max-height: 60px !important;
}

.dice-view .dice-result-row {
  border-radius: 18px !important;
  background: rgba(0,0,0,.24) !important;
  border: 1px solid rgba(255,255,255,.08) !important;
}

@media (max-width: 420px) {
  .dice-view { padding-left: 14px !important; padding-right: 14px !important; }
  .dice-view .dice-range-card { top: calc(env(safe-area-inset-top) + 130px) !important; left: 14px !important; right: 14px !important; height: 156px !important; }
  .dice-view .dice-result-card { top: calc(env(safe-area-inset-top) + 296px) !important; left: 14px !important; right: 14px !important; }
  .dice-panel { border-radius: 32px !important; padding: 14px !important; }
  .dice-field { min-height: 84px !important; }
  .dice-field b { font-size: 22px !important; }
  .dice-roll-button { height: 72px !important; font-size: 27px !important; }
}
`;

const DICE_RESULT_CARD = `<div class="dice-result-card" data-dice-result-card><div class="dice-result-head"><span class="dice-result-title"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M7 12h10"/><path d="M9 17h6"/></svg><span>Results</span></span><div class="dice-result-head-actions"><b class="dice-result-total" data-dice-result-total>0</b><button class="dice-result-toggle" type="button" data-dice-result-toggle aria-label="Toggle results" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg></button></div></div><div class="dice-result-list" data-dice-result-list><div class="dice-result-empty">No results yet</div></div></div>`;

const DICE_RESULT_SCRIPT = `
(function(){
  var root = document.getElementById('dice');
  if (!root || root.dataset.resultHistoryReady) return;
  root.dataset.resultHistoryReady = '1';
  var box = root.querySelector('[data-dice-result-card]');
  var toggle = root.querySelector('[data-dice-result-toggle]');
  var list = root.querySelector('[data-dice-result-list]');
  var total = root.querySelector('[data-dice-result-total]');
  var button = root.querySelector('[data-dice-play]');
  var roll = root.querySelector('[data-dice-roll]');
  var win = root.querySelector('[data-dice-win]');
  var rows = [];
  function value(el){return el ? String(el.textContent || '').trim() : ''}
  function render(){if(!list)return;list.innerHTML='';if(!rows.length){var empty=document.createElement('div');empty.className='dice-result-empty';empty.textContent='No results yet';list.appendChild(empty);if(total)total.textContent='0';return}if(total)total.textContent=String(rows.length);rows.forEach(function(item){var row=document.createElement('div');row.className='dice-result-row'+(item.positive?' is-positive':'');var name=document.createElement('span');name.className='dice-result-name';name.textContent=item.label;var valueNode=document.createElement('b');valueNode.className='dice-result-value';valueNode.textContent=item.result;var rollNode=document.createElement('span');rollNode.className='dice-result-roll';rollNode.textContent=item.roll;row.appendChild(name);row.appendChild(valueNode);row.appendChild(rollNode);list.appendChild(row)})}
  function capture(){var resultValue=value(win);var rollValue=value(roll);var numericResult=Number(resultValue.replace(/[^0-9.-]/g,''))||0;rows.unshift({label:'You',result:numericResult>0?'+'+resultValue:resultValue,roll:rollValue?'Roll '+rollValue:'',positive:numericResult>0});rows=rows.slice(0,50);render()}
  if(toggle&&box){toggle.onclick=function(){var open=!box.classList.contains('open');box.classList.toggle('open',open);toggle.setAttribute('aria-expanded',open?'true':'false')}}
  if(button){button.addEventListener('click',function(){setTimeout(capture,520)})}
})();
`;

export const DICE_SECTION = RAW_DICE_SECTION
  .replace('</style>', DICE_POLISH_STYLES + '</style>')
  .replace('<div class="dice-status" data-dice-status>', DICE_RESULT_CARD + '<div class="dice-status" data-dice-status>')
  .replace('</script></section>', DICE_RESULT_SCRIPT + '</script></section>')
  .replace('data-dice-bet-input-open>1</button>', 'data-dice-bet-input-open>1.00</button>')
  .replace('<b data-dice-current>1</b>', '<b data-dice-current>1.00</b>')
  .replace('min="1" inputmode="decimal" value="1"', 'min="0.01" step="0.01" inputmode="decimal" value="1.00"')
  .replace("function money(n){var x=Number(n)||0;return x.toFixed(4).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1')}", "function money(n){var x=Number(n)||0;return x.toFixed(2)}")
  .replace("function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;return Math.max(.0001,Number(s)||1)}", "function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;var v=Math.max(.01,Number(s)||1);return Math.round(v*100)/100}")
  .replace('setBet(Math.max(.0001,bet/2))', 'setBet(Math.max(.01,bet/2))');
