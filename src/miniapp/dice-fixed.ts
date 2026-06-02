import { DICE_SECTION as RAW_DICE_SECTION } from './dice';

const DICE_RANGE_STYLES = `
.dice-view .dice-range-card {
  margin: 0 auto 2px !important;
  padding: 18px 10px 12px !important;
  border-radius: 28px !important;
  background: rgba(255, 255, 255, .026) !important;
  border: 1px solid rgba(255, 255, 255, .12) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10) !important;
  transform: translateY(-72px) !important;
  backdrop-filter: blur(14px) saturate(1.16) !important;
  -webkit-backdrop-filter: blur(14px) saturate(1.16) !important;
}

@media (max-width: 420px) {
  .dice-view .dice-range-card {
    margin: 0 auto 2px !important;
    padding: 16px 8px 10px !important;
    transform: translateY(-70px) !important;
  }
}
`;

export const DICE_SECTION = RAW_DICE_SECTION
  .replace('</style>', DICE_RANGE_STYLES + '</style>')
  .replace('data-dice-bet-input-open>1</button>', 'data-dice-bet-input-open>1.00</button>')
  .replace('<b data-dice-current>1</b>', '<b data-dice-current>1.00</b>')
  .replace('min="1" inputmode="decimal" value="1"', 'min="0.01" step="0.01" inputmode="decimal" value="1.00"')
  .replace("function money(n){var x=Number(n)||0;return x.toFixed(4).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1')}", "function money(n){var x=Number(n)||0;return x.toFixed(2)}")
  .replace("function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;return Math.max(.0001,Number(s)||1)}", "function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;var v=Math.max(.01,Number(s)||1);return Math.round(v*100)/100}")
  .replace('setBet(Math.max(.0001,bet/2))', 'setBet(Math.max(.01,bet/2))');
