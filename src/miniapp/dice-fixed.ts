import { DICE_SECTION as RAW_DICE_SECTION } from './dice';

const DICE_UI_POLISH_STYLES = `
.dice-view .dice-wrap{min-height:auto!important;justify-content:flex-start!important;gap:8px!important;padding-top:178px!important;padding-bottom:28px!important}
.dice-view .dice-range-card{width:94%!important;margin:0 auto 4px!important;transform:none!important;padding:9px 10px 7px!important;border-radius:22px!important;background:rgba(255,255,255,.018)!important;border:0!important;box-shadow:none!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important;overflow:visible!important}
.dice-view .dice-track-labels{height:16px!important;font-size:15px!important;padding:0 12px!important;transform:translateY(4px)!important;color:rgba(255,255,255,.38)!important}
.dice-view .dice-track-labels span:nth-child(1){left:12px!important}.dice-view .dice-track-labels span:nth-child(2){left:calc(25% + 6px)!important}.dice-view .dice-track-labels span:nth-child(3){left:50%!important}.dice-view .dice-track-labels span:nth-child(4){left:calc(75% - 6px)!important}.dice-view .dice-track-labels span:nth-child(5){left:calc(100% - 12px)!important}
.dice-view .dice-slider-shell{height:54px!important;padding:16px 3px 12px!important}
.dice-view .dice-slider-shell:before{left:13px!important;right:13px!important;top:2px!important;height:7px!important;opacity:.38!important}
.dice-view .dice-slider-visual{left:2px!important;right:2px!important;height:22px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(0,0,0,.50)!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important}
.dice-view .dice-slider-visual:before{left:9px!important;right:9px!important;height:9px!important}
.dice-view .dice-slider-thumb{width:32px!important;height:32px!important;border-radius:11px!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important}
.dice-view .dice-slider-thumb:before{width:14px!important;height:15px!important;background:linear-gradient(90deg,rgba(255,255,255,.58) 0 3px,transparent 3px 6px,rgba(255,255,255,.58) 6px 8px,transparent 8px 11px,rgba(255,255,255,.58) 11px 14px)!important}
.dice-view .dice-status{min-height:20px!important;font-size:12px!important;margin-top:0!important;margin-bottom:0!important}
.dice-view .dice-panel{margin-top:0!important;border-radius:28px!important;padding:12px!important;gap:10px!important;transform:translateY(-2px)!important}
@media(max-width:420px){.dice-view .dice-wrap{min-height:auto!important;justify-content:flex-start!important;gap:8px!important;padding-top:176px!important}.dice-view .dice-range-card{width:94%!important;margin:0 auto 4px!important;transform:none!important;padding:8px 10px 6px!important}.dice-view .dice-slider-shell{height:52px!important;padding:15px 3px 11px!important}.dice-view .dice-panel{margin-top:0!important}}
`;

export const DICE_SECTION = RAW_DICE_SECTION
  .replace('</style>', DICE_UI_POLISH_STYLES + '</style>')
  .replace('data-dice-bet-input-open>1</button>', 'data-dice-bet-input-open>1.00</button>')
  .replace('<b data-dice-current>1</b>', '<b data-dice-current>1.00</b>')
  .replace('min="1" inputmode="decimal" value="1"', 'min="0.01" step="0.01" inputmode="decimal" value="1.00"')
  .replace("function money(n){var x=Number(n)||0;return x.toFixed(4).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1')}", "function money(n){var x=Number(n)||0;return x.toFixed(2)}")
  .replace("function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;return Math.max(.0001,Number(s)||1)}", "function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;var v=Math.max(.01,Number(s)||1);return Math.round(v*100)/100}")
  .replace('setBet(Math.max(.0001,bet/2))', 'setBet(Math.max(.01,bet/2))');