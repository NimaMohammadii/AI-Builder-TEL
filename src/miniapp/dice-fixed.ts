import { DICE_SECTION as RAW_DICE_SECTION } from './dice';

const DICE_INPUT_ROW_ASSET = 'https://raw.githubusercontent.com/NimaMohammadii/AI-Builder-TEL/main/src/miniapp/image-dice/IMG_6730.png?v=5eaf891b081a86beb6ecfc1500bdfca99b692452';
const DICE_ROLL_BUTTON_ASSET = 'https://raw.githubusercontent.com/NimaMohammadii/AI-Builder-TEL/main/src/miniapp/image-dice/dice-roll-button.png.PNG?v=bfb1fef99c84ad442bceb6e59c257a975ba70abf';

const DICE_FIXED_STYLES = `
.dice-view .dice-range-card {
  position: fixed !important;
  top: calc(env(safe-area-inset-top) + 130px) !important;
  left: 14px !important;
  right: 14px !important;
  z-index: 8 !important;
  width: auto !important;
  max-width: 520px !important;
  height: 150px !important;
  margin: 0 auto !important;
  padding: 16px 10px !important;
  box-sizing: border-box !important;
  border-radius: 28px !important;
  background: rgba(0, 0, 0, .62) !important;
  border: 1px solid rgba(255, 255, 255, .12) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10) !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  backdrop-filter: blur(14px) saturate(1.16) !important;
  -webkit-backdrop-filter: blur(14px) saturate(1.16) !important;
}

.dice-view .dice-track-labels {
  height: 17px !important;
  padding: 0 19px !important;
  transform: translateY(13px) !important;
  color: rgba(255, 255, 255, .50) !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  z-index: 5 !important;
}

.dice-view .dice-slider-shell {
  width: 100% !important;
  margin-top: 0 !important;
}

.dice-view .dice-slider-visual {
  background: rgba(0, 0, 0, .78) !important;
}

.dice-view .dice-slider-thumb {
  width: 32px !important;
  height: 32px !important;
  border-radius: 12px !important;
  backdrop-filter: blur(7px) saturate(1.22) !important;
  -webkit-backdrop-filter: blur(7px) saturate(1.22) !important;
}

body:has(#dice.active) #brandTitle {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.dice-online-badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
  color: rgba(255, 255, 255, .90) !important;
  font-size: 9.4px !important;
  font-weight: 900 !important;
  background: transparent !important;
  border: 0 !important;
  padding: 0 !important;
  margin-left: 2px !important;
}

.dice-online-badge i {
  width: 7px !important;
  height: 7px !important;
  border-radius: 50% !important;
  background: #18ff84 !important;
  box-shadow: 0 0 0 1px rgba(24, 255, 132, .25), 0 0 10px rgba(24, 255, 132, .46), 0 0 20px rgba(24, 255, 132, .18) !important;
}

.dice-online-badge em {
  display: none !important;
}

.dice-view .dice-result-card {
  position: fixed !important;
  top: calc(env(safe-area-inset-top) + 288px) !important;
  left: 14px !important;
  right: 14px !important;
  z-index: 7 !important;
  width: auto !important;
  max-width: 520px !important;
  margin: 0 auto !important;
  padding: 14px !important;
  box-sizing: border-box !important;
  border-radius: 32px !important;
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, .12) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08) !important;
  overflow: hidden !important;
  max-height: 430px !important;
  transition: max-height .34s cubic-bezier(.2, .8, .2, 1), padding .28s ease, opacity .2s ease !important;
  backdrop-filter: blur(3px) !important;
  -webkit-backdrop-filter: blur(3px) !important;
}

.dice-view .dice-result-card:not(.open) {
  max-height: 54px !important;
  padding-bottom: 12px !important;
}

.dice-view .dice-result-head,
.dice-view .dice-result-title,
.dice-view .dice-result-head-actions {
  display: flex !important;
  align-items: center !important;
}

.dice-view .dice-result-head {
  justify-content: space-between !important;
  margin-bottom: 10px !important;
  color: rgba(255, 255, 255, .58) !important;
  font-size: 13px !important;
  font-weight: 850 !important;
}

.dice-view .dice-result-title {
  gap: 7px !important;
}

.dice-view .dice-result-title svg {
  width: 17px !important;
  height: 17px !important;
}

.dice-view .dice-result-title svg path,
.dice-view .dice-result-toggle path {
  fill: none !important;
  stroke: currentColor !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}

.dice-view .dice-result-toggle {
  width: 28px !important;
  height: 28px !important;
  border: 0 !important;
  border-radius: 10px !important;
  background: rgba(255, 255, 255, .055) !important;
  color: rgba(255, 255, 255, .85) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.dice-view .dice-result-card.open .dice-result-toggle svg {
  transform: rotate(180deg) !important;
}

.dice-view .dice-result-list {
  display: grid !important;
  gap: 6px !important;
  max-height: 394px !important;
  overflow-y: auto !important;
  padding-right: 2px !important;
}

.dice-view .dice-result-card:not(.open) .dice-result-list {
  max-height: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.dice-view .dice-result-empty {
  font-size: 12px !important;
  font-weight: 820 !important;
  color: rgba(255, 255, 255, .45) !important;
  padding: 14px 0 !important;
  text-align: center !important;
}

.dice-view .dice-result-row {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto auto !important;
  align-items: center !important;
  gap: 8px !important;
  min-height: 34px !important;
  border-radius: 17px !important;
  background: rgba(0, 0, 0, .16) !important;
  border: 1px solid rgba(255, 255, 255, .08) !important;
  color: #fff !important;
  padding: 2px 10px !important;
}

.dice-view .dice-result-name {
  min-width: 0 !important;
  font-size: 12px !important;
  font-weight: 900 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.dice-view .dice-result-value,
.dice-view .dice-result-roll {
  font-size: 11px !important;
  font-weight: 930 !important;
  color: rgba(255, 255, 255, .62) !important;
  white-space: nowrap !important;
}

.dice-view .dice-result-row.is-positive .dice-result-value {
  color: #78ffb3 !important;
}

.dice-view .dice-bet {
  position: relative !important;
  min-height: 128px !important;
  height: 128px !important;
  grid-template-columns: .74fr 1.52fr .74fr !important;
  gap: 0 !important;
  padding: 22px 18px !important;
  box-sizing: border-box !important;
  border-radius: 32px !important;
  background-image: url('${DICE_INPUT_ROW_ASSET}') !important;
  background-size: 176% auto !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  image-rendering: auto !important;
  transform: translateZ(0) !important;
  backface-visibility: hidden !important;
}

.dice-view .dice-bet button {
  position: relative !important;
  z-index: 2 !important;
  height: 100% !important;
  min-height: 0 !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

.dice-view .dice-bet > button:not(.dice-bet-main) {
  color: transparent !important;
  font-size: 0 !important;
  text-shadow: none !important;
}

.dice-view .dice-bet-main {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  font-size: 24px !important;
  color: #fff !important;
}

.dice-view .dice-roll-button {
  min-height: 90px !important;
  height: 90px !important;
  border: 0 !important;
  border-radius: 999px !important;
  background-color: transparent !important;
  background-image: url('${DICE_ROLL_BUTTON_ASSET}') !important;
  background-size: 120% auto !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  color: transparent !important;
  font-size: 0 !important;
  text-shadow: none !important;
  box-shadow: none !important;
  image-rendering: auto !important;
  transform: translateZ(0) !important;
  backface-visibility: hidden !important;
}

.dice-view .dice-roll-button:active {
  transform: translateZ(0) scale(.985) !important;
}

.dice-view .dice-roll-button:disabled {
  opacity: .66 !important;
  transform: translateZ(0) scale(.992) !important;
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
  var amount = root.querySelector('[data-dice-current]');
  var rows = [];

  function value(el) {
    return el ? String(el.textContent || '').trim() : '';
  }

  function render() {
    if (!list) return;
    list.innerHTML = '';

    if (!rows.length) {
      var empty = document.createElement('div');
      empty.className = 'dice-result-empty';
      empty.textContent = 'No results yet';
      list.appendChild(empty);
      if (total) total.textContent = '0';
      return;
    }

    if (total) total.textContent = String(rows.length);

    rows.forEach(function(item) {
      var row = document.createElement('div');
      row.className = 'dice-result-row' + (item.positive ? ' is-positive' : '');

      var name = document.createElement('span');
      name.className = 'dice-result-name';
      name.textContent = item.label;

      var valueNode = document.createElement('b');
      valueNode.className = 'dice-result-value';
      valueNode.textContent = item.result;

      var rollNode = document.createElement('span');
      rollNode.className = 'dice-result-roll';
      rollNode.textContent = item.roll;

      row.appendChild(name);
      row.appendChild(valueNode);
      row.appendChild(rollNode);
      list.appendChild(row);
    });
  }

  function capture() {
    var resultValue = value(win);
    var rollValue = value(roll);
    var amountValue = value(amount);
    var numericResult = Number(resultValue.replace(/[^0-9.-]/g, '')) || 0;

    rows.unshift({
      label: 'You',
      result: numericResult > 0 ? '+' + resultValue : resultValue,
      roll: rollValue ? 'Roll ' + rollValue : '',
      positive: numericResult > 0,
      amount: amountValue,
    });

    rows = rows.slice(0, 50);
    render();
  }

  if (toggle && box) {
    toggle.onclick = function() {
      var open = !box.classList.contains('open');
      box.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
  }

  if (button) {
    button.addEventListener('click', function() {
      setTimeout(capture, 520);
    });
  }
})();
`;

export const DICE_SECTION = RAW_DICE_SECTION
  .replace('</style>', DICE_FIXED_STYLES + '</style>')
  .replace('<div class="dice-status" data-dice-status>', DICE_RESULT_CARD + '<div class="dice-status" data-dice-status>')
  .replace('</script></section>', DICE_RESULT_SCRIPT + '</script></section>')
  .replace('data-dice-bet-input-open>1</button>', 'data-dice-bet-input-open>1.00</button>')
  .replace('<b data-dice-current>1</b>', '<b data-dice-current>1.00</b>')
  .replace('min="1" inputmode="decimal" value="1"', 'min="0.01" step="0.01" inputmode="decimal" value="1.00"')
  .replace("function money(n){var x=Number(n)||0;return x.toFixed(4).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1')}", "function money(n){var x=Number(n)||0;return x.toFixed(2)}")
  .replace("function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;return Math.max(.0001,Number(s)||1)}", "function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;var v=Math.max(.01,Number(s)||1);return Math.round(v*100)/100}")
  .replace('setBet(Math.max(.0001,bet/2))', 'setBet(Math.max(.01,bet/2))');
