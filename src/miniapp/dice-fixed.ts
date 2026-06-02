import { DICE_SECTION as RAW_DICE_SECTION } from './dice';

const DICE_RANGE_CARD_STYLES = `
.dice-view .dice-range-card {
  position: fixed !important;
  top: calc(env(safe-area-inset-top) + 138px) !important;
  left: 14px !important;
  right: 14px !important;
  z-index: 8 !important;
  width: auto !important;
  max-width: 520px !important;
  height: 170px !important;
  margin: 0 auto !important;
  padding: 18px 12px !important;
  box-sizing: border-box !important;
  border-radius: 28px !important;
  background: rgba(0, 0, 0, .62) !important;
  border: 1px solid rgba(255, 255, 255, .12) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10) !important;
  transform: none !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  gap: 0 !important;
  backdrop-filter: blur(14px) saturate(1.16) !important;
  -webkit-backdrop-filter: blur(14px) saturate(1.16) !important;
}

.dice-view .dice-track-labels {
  flex: 0 0 auto !important;
  height: 18px !important;
  padding: 0 19px !important;
  transform: translateY(14px) !important;
  color: rgba(255, 255, 255, .50) !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  z-index: 5 !important;
}

.dice-view .dice-slider-shell {
  flex: 0 0 auto !important;
  width: 100% !important;
  margin-top: 0 !important;
}

.dice-view .dice-slider-visual {
  background: rgba(0, 0, 0, .78) !important;
}

.dice-view .dice-slider-thumb {
  width: 34px !important;
  height: 34px !important;
  border-radius: 12px !important;
  backdrop-filter: blur(7px) saturate(1.22) !important;
  -webkit-backdrop-filter: blur(7px) saturate(1.22) !important;
}

.dice-view .dice-result-card {
  position: fixed !important;
  top: calc(env(safe-area-inset-top) + 318px) !important;
  left: 14px !important;
  right: 14px !important;
  z-index: 7 !important;
  width: auto !important;
  max-width: 520px !important;
  margin: 0 auto !important;
  padding: 10px 12px 12px !important;
  box-sizing: border-box !important;
  border-radius: 28px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  backdrop-filter: blur(3px) !important;
  -webkit-backdrop-filter: blur(3px) !important;
}

.dice-view .dice-result-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  margin-bottom: 8px !important;
  color: rgba(255, 255, 255, .62) !important;
  font-size: 10px !important;
  font-weight: 900 !important;
  letter-spacing: .12em !important;
  text-transform: uppercase !important;
}

.dice-view .dice-result-total {
  color: rgba(255, 255, 255, .92) !important;
  font-size: 11px !important;
  font-weight: 930 !important;
  letter-spacing: .02em !important;
  text-transform: none !important;
}

.dice-view .dice-result-list {
  display: grid !important;
  gap: 6px !important;
}

.dice-view .dice-result-empty {
  font-size: 11px !important;
  font-weight: 820 !important;
  color: rgba(255, 255, 255, .45) !important;
  padding: 8px 0 !important;
  text-align: center !important;
}

.dice-view .dice-result-row {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto auto !important;
  align-items: center !important;
  gap: 8px !important;
  min-height: 32px !important;
  border-radius: 999px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  backdrop-filter: blur(3px) !important;
  -webkit-backdrop-filter: blur(3px) !important;
  color: #fff !important;
  padding: 0 2px !important;
}

.dice-view .dice-result-name {
  min-width: 0 !important;
  font-size: 12px !important;
  font-weight: 900 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  color: rgba(255, 255, 255, .92) !important;
}

.dice-view .dice-result-value,
.dice-view .dice-result-roll {
  font-size: 11px !important;
  font-weight: 930 !important;
  color: rgba(255, 255, 255, .70) !important;
}

.dice-view .dice-result-row.is-positive .dice-result-value {
  color: #78ffb3 !important;
}

@media (max-width: 420px) {
  .dice-view .dice-range-card {
    top: calc(env(safe-area-inset-top) + 130px) !important;
    left: 14px !important;
    right: 14px !important;
    width: auto !important;
    height: 150px !important;
    padding: 16px 10px !important;
  }

  .dice-view .dice-track-labels {
    height: 17px !important;
    font-size: 12px !important;
    transform: translateY(13px) !important;
  }

  .dice-view .dice-slider-thumb {
    width: 32px !important;
    height: 32px !important;
  }

  .dice-view .dice-result-card {
    top: calc(env(safe-area-inset-top) + 288px) !important;
    left: 14px !important;
    right: 14px !important;
  }
}
`;

const DICE_RESULT_CARD = `<div class="dice-result-card" data-dice-result-card><div class="dice-result-head"><span>Results</span><b class="dice-result-total" data-dice-result-total>0</b></div><div class="dice-result-list" data-dice-result-list><div class="dice-result-empty">No results yet</div></div></div>`;

const DICE_RESULT_SCRIPT = `
(function(){
  var root = document.getElementById('dice');
  if (!root || root.dataset.resultHistoryReady) return;
  root.dataset.resultHistoryReady = '1';

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

    rows = rows.slice(0, 5);
    render();
  }

  if (button) {
    button.addEventListener('click', function() {
      setTimeout(capture, 520);
    });
  }
})();
`;

export const DICE_SECTION = RAW_DICE_SECTION
  .replace('</style>', DICE_RANGE_CARD_STYLES + '</style>')
  .replace('<div class="dice-status" data-dice-status>', DICE_RESULT_CARD + '<div class="dice-status" data-dice-status>')
  .replace('</script></section>', DICE_RESULT_SCRIPT + '</script></section>')
  .replace('data-dice-bet-input-open>1</button>', 'data-dice-bet-input-open>1.00</button>')
  .replace('<b data-dice-current>1</b>', '<b data-dice-current>1.00</b>')
  .replace('min="1" inputmode="decimal" value="1"', 'min="0.01" step="0.01" inputmode="decimal" value="1.00"')
  .replace("function money(n){var x=Number(n)||0;return x.toFixed(4).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1')}", "function money(n){var x=Number(n)||0;return x.toFixed(2)}")
  .replace("function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;return Math.max(.0001,Number(s)||1)}", "function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;var v=Math.max(.01,Number(s)||1);return Math.round(v*100)/100}")
  .replace('setBet(Math.max(.0001,bet/2))', 'setBet(Math.max(.01,bet/2))');
