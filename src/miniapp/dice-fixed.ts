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
  height: 20px !important;
  padding: 0 19px !important;
  transform: translateY(18px) !important;
  color: rgba(255, 255, 255, .58) !important;
  font-size: 14px !important;
  font-weight: 820 !important;
  z-index: 5 !important;
}

.dice-view .dice-slider-shell {
  flex: 0 0 auto !important;
  width: 100% !important;
  margin-top: 0 !important;
}

.dice-view .dice-slider-shell::before {
  top: 7px !important;
  left: 20px !important;
  right: 20px !important;
  height: 16px !important;
  opacity: .38 !important;
  background: rgba(255, 255, 255, .10) !important;
  clip-path: polygon(
    0 100%,
    0 58%,
    10px 58%,
    13px 34%,
    16px 58%,
    25% 58%,
    calc(25% + 10px) 58%,
    calc(25% + 13px) 34%,
    calc(25% + 16px) 58%,
    50% 58%,
    calc(50% + 10px) 58%,
    calc(50% + 13px) 34%,
    calc(50% + 16px) 58%,
    75% 58%,
    calc(75% + 10px) 58%,
    calc(75% + 13px) 34%,
    calc(75% + 16px) 58%,
    calc(100% - 16px) 58%,
    calc(100% - 13px) 34%,
    calc(100% - 10px) 58%,
    100% 58%,
    100% 100%
  ) !important;
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
    font-size: 13px !important;
    transform: translateY(17px) !important;
  }

  .dice-view .dice-slider-shell::before {
    top: 7px !important;
    height: 15px !important;
  }

  .dice-view .dice-slider-thumb {
    width: 32px !important;
    height: 32px !important;
  }
}
`;

export const DICE_SECTION = RAW_DICE_SECTION
  .replace('</style>', DICE_RANGE_CARD_STYLES + '</style>')
  .replace('data-dice-bet-input-open>1</button>', 'data-dice-bet-input-open>1.00</button>')
  .replace('<b data-dice-current>1</b>', '<b data-dice-current>1.00</b>')
  .replace('min="1" inputmode="decimal" value="1"', 'min="0.01" step="0.01" inputmode="decimal" value="1.00"')
  .replace("function money(n){var x=Number(n)||0;return x.toFixed(4).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1')}", "function money(n){var x=Number(n)||0;return x.toFixed(2)}")
  .replace("function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;return Math.max(.0001,Number(s)||1)}", "function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;var v=Math.max(.01,Number(s)||1);return Math.round(v*100)/100}")
  .replace('setBet(Math.max(.0001,bet/2))', 'setBet(Math.max(.01,bet/2))');
