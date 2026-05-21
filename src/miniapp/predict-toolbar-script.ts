export const PREDICT_TOOLBAR_SCRIPT = `
(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}
  ready(function(){
    var root=document.getElementById('predictzone');
    if(!root||root.dataset.predictToolbarReady==='1')return;
    root.dataset.predictToolbarReady='1';
    var menu=root.querySelector('.predict-zone-category-menu');
    if(!menu)return;
    if(!document.getElementById('predictZoneToolbarStyles')){
      var style=document.createElement('style');
      style.id='predictZoneToolbarStyles';
      style.textContent='#predictzone .predict-toolbar-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:-7px 0 7px;padding:0 4px}#predictzone .predict-mode-wrap{position:relative;width:134px!important;flex:0 0 134px!important;min-width:134px!important;max-width:134px!important;box-sizing:border-box}#predictzone .predict-mode-card,#predictzone .predict-credit-card{width:134px!important;min-width:134px!important;max-width:134px!important;height:42px!important;min-height:42px!important;box-sizing:border-box;border:0!important;border-radius:999px;background:transparent;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 16px!important;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);box-shadow:0 12px 26px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.10),inset 0 -1px 0 rgba(255,255,255,.10)!important}#predictzone .predict-mode-card{position:relative;justify-content:flex-start;text-align:left;padding-right:35px!important;background:rgba(255,255,255,.055)!important}#predictzone .predict-mode-card span{display:none}#predictzone .predict-mode-card strong{max-width:86px;color:#fff;font-size:13px;font-weight:820;letter-spacing:-.025em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1}#predictzone .predict-mode-card:after{content:"⌄";position:absolute;right:13px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.98);font-size:27px;font-weight:760;line-height:1;text-align:center;text-shadow:0 1px 8px rgba(0,0,0,.38)}#predictzone .predict-credit-card{flex:0 0 134px!important;justify-content:flex-end;background:rgba(255,255,255,.055)!important}#predictzone .predict-credit-card .ton-mini-icon{width:24px;height:24px;flex:0 0 24px}#predictzone .predict-credit-card .ton-mini-icon img{width:24px;height:24px;display:block;object-fit:contain;border:0;background:transparent;box-shadow:none}#predictzone .predict-credit-card b{color:#fff;font-size:13px;font-weight:820;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.025em;font-variant-numeric:tabular-nums lining-nums;line-height:1}#predictzone .predict-mode-menu{position:absolute;left:0;right:0;top:48px;z-index:18;padding:6px;border-radius:20px;border:0;background:rgba(8,8,8,.94);box-shadow:0 12px 26px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.10),inset 0 -1px 0 rgba(255,255,255,.10);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);opacity:0;transform:translateY(-6px) scale(.97);pointer-events:none;transition:opacity .16s ease,transform .16s ease}#predictzone .predict-mode-wrap.open .predict-mode-menu{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}#predictzone .predict-mode-option{width:100%;height:34px;border-radius:15px;background:transparent;color:rgba(255,255,255,.68);font-size:12px;font-weight:760;text-align:left;padding:0 10px}#predictzone .predict-mode-option.active{background:rgba(255,255,255,.12);color:#fff}@media(max-width:380px){#predictzone .predict-toolbar-row{padding:0 2px;margin:-8px 0 6px}#predictzone .predict-mode-wrap,#predictzone .predict-mode-card,#predictzone .predict-credit-card{width:126px!important;min-width:126px!important;max-width:126px!important;flex-basis:126px!important}#predictzone .predict-mode-card,#predictzone .predict-credit-card{height:40px!important;min-height:40px!important;padding:0 14px!important}#predictzone .predict-mode-card{padding-right:32px!important}#predictzone .predict-mode-card strong,#predictzone .predict-credit-card b{font-size:12.5px}#predictzone .predict-mode-card:after{right:11px;top:50%;font-size:26px}}';
      document.head.appendChild(style);
    }
    if(root.querySelector('.predict-toolbar-row'))return;
    var row=document.createElement('div');
    row.className='predict-toolbar-row';
    row.innerHTML='<div class="predict-mode-wrap"><button type="button" class="predict-mode-card" data-predict-mode-toggle><strong data-predict-mode-label>Up or Down</strong><span></span></button><div class="predict-mode-menu" data-predict-mode-menu><button type="button" class="predict-mode-option active" data-predict-mode="updown">Up or Down</button><button type="button" class="predict-mode-option" data-predict-mode="candle">Candle Guess</button></div></div><button type="button" class="top-balance-pill predict-credit-card" data-action="open-transactions" aria-label="Open credit balance"><span class="ton-mini-icon"><img src="/app/api/uploaded-image/ton-icon" data-ton-icon alt="" decoding="async"/></span><b data-ton-balance-display>0</b></button>';
    menu.insertAdjacentElement('afterend',row);
    var wrap=row.querySelector('.predict-mode-wrap');
    var label=row.querySelector('[data-predict-mode-label]');
    row.addEventListener('click',function(ev){
      var toggle=ev.target&&ev.target.closest?ev.target.closest('[data-predict-mode-toggle]'):null;
      var option=ev.target&&ev.target.closest?ev.target.closest('[data-predict-mode]'):null;
      if(toggle){ev.preventDefault();ev.stopPropagation();wrap.classList.toggle('open');return}
      if(option){ev.preventDefault();ev.stopPropagation();row.querySelectorAll('[data-predict-mode]').forEach(function(n){n.classList.toggle('active',n===option)});if(label)label.textContent=option.getAttribute('data-predict-mode')==='candle'?'Candle Guess':'Up or Down';wrap.classList.remove('open')}
    });
    document.addEventListener('click',function(ev){if(!row.contains(ev.target))wrap.classList.remove('open')},true);
    if(window.VexaUploadedImages&&window.VexaUploadedImages.load){try{window.VexaUploadedImages.load()}catch(e){}}
    if(window.VexaTonBalance&&window.VexaTonBalance.render){try{window.VexaTonBalance.render()}catch(e){}}
  });
})();
`;