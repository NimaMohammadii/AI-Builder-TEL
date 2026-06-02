import { DICE_SECTION as RAW_DICE_SECTION } from './dice';

const DICE_LAYOUT_TUNING_STYLES = `
.dice-view .dice-wrap{transform:translateY(-78px)!important;gap:10px!important}
.dice-view .dice-range-card{width:88%!important;max-width:430px!important;margin:0 auto 0!important;padding:12px 12px 10px!important;border-radius:26px!important;background:rgba(255,255,255,.018)!important;border:1px solid rgba(255,255,255,.12)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important;transform:none!important;overflow:visible!important}
.dice-view .dice-track-labels{font-size:16px!important;height:18px!important;transform:translateY(6px)!important;color:rgba(255,255,255,.40)!important}
.dice-view .dice-slider-shell{height:62px!important;padding:20px 3px 14px!important}
.dice-view .dice-slider-visual{height:24px!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important}
.dice-view .dice-slider-thumb{width:34px!important;height:34px!important;border-radius:12px!important}
.dice-view .dice-status{min-height:20px!important;margin:0!important;font-size:12px!important}
.dice-view .dice-panel{margin-top:0!important}
@media(max-width:420px){.dice-view .dice-wrap{transform:translateY(-78px)!important;gap:10px!important}.dice-view .dice-range-card{width:88%!important;margin:0 auto 0!important;padding:12px 12px 10px!important;transform:none!important}.dice-view .dice-slider-shell{height:60px!important;padding:19px 3px 13px!important}.dice-view .dice-panel{margin-top:0!important}}
`;

export const DICE_SECTION = RAW_DICE_SECTION
  .replace('</style>', DICE_LAYOUT_TUNING_STYLES + '</style>')
  .replace('data-dice-bet-input-open>1</button>', 'data-dice-bet-input-open>1.00</button>')
  .replace('<b data-dice-current>1</b>', '<b data-dice-current>1.00</b>')
  .replace('min="1" inputmode="decimal" value="1"', 'min="0.01" step="0.01" inputmode="decimal" value="1.00"')
  .replace("function money(n){var x=Number(n)||0;return x.toFixed(4).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1')}", "function money(n){var x=Number(n)||0;return x.toFixed(2)}")
  .replace("function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;return Math.max(.0001,Number(s)||1)}", "function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;var v=Math.max(.01,Number(s)||1);return Math.round(v*100)/100}")
  .replace('setBet(Math.max(.0001,bet/2))', 'setBet(Math.max(.01,bet/2))');