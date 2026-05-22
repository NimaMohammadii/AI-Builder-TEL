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
      style.textContent='#predictzone .predict-toolbar-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:-12px 0 16px;padding:0 4px}#predictzone .predict-mode-wrap{position:relative;display:inline-flex;flex:0 0 auto;width:auto;min-width:0;box-sizing:border-box}#predictzone .predict-mode-card{height:35px;width:auto;min-width:0;max-width:min(44vw,180px);border:0;border-radius:999px;background:rgba(255,255,255,.052);color:#fff;display:inline-flex;align-items:center;justify-content:flex-start;gap:3px;padding:0 8px;-webkit-backdrop-filter:blur(10px) saturate(1.18);backdrop-filter:blur(10px) saturate(1.18);box-shadow:0 14px 34px rgba(0,0,0,.15),inset 0 1px 0 rgba(255,255,255,.14);box-sizing:border-box;position:relative;text-align:left;padding-right:27px}#predictzone .predict-mode-card span{display:none}#predictzone .predict-mode-card strong{color:#fff;font-size:13.8px;font-weight:820;letter-spacing:-.025em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1;max-width:calc(min(44vw,180px) - 42px)}#predictzone .predict-mode-card:after{content:"⌄";position:absolute;right:8px;top:44%;transform:translateY(-50%);color:rgba(255,255,255,.98);font-size:22px;font-weight:760;line-height:1;text-align:center;text-shadow:0 1px 8px rgba(0,0,0,.38)}#predictzone .predict-credit-card{background:rgba(255,255,255,.055)}#predictzone .predict-credit-card .ton-mini-icon{width:24px;height:24px}#predictzone .predict-credit-card .ton-mini-icon img{width:24px;height:24px;display:block;object-fit:contain;border:0;background:transparent;box-shadow:none}#predictzone .predict-credit-card b{color:#fff;font-size:13px;font-weight:820;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.025em;font-variant-numeric:tabular-nums lining-nums;line-height:1}#predictzone .predict-mode-menu{position:absolute;left:2px;top:40px;z-index:18;width:auto;min-width:116px;padding:0;border-radius:0;border:0;background:transparent;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none;opacity:0;transform:translateY(-4px);pointer-events:none;transition:opacity .16s ease,transform .16s ease}#predictzone .predict-mode-wrap.open .predict-mode-menu{opacity:1;transform:translateY(0);pointer-events:auto}#predictzone .predict-mode-option{width:auto;min-width:112px;height:31px;margin:3px 0;border-radius:999px;background:rgba(255,255,255,.055);color:rgba(255,255,255,.78);font-size:12px;font-weight:760;text-align:left;padding:0 12px;box-shadow:0 10px 22px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.10);-webkit-backdrop-filter:blur(8px) saturate(1.1);backdrop-filter:blur(8px) saturate(1.1)}#predictzone .predict-mode-option.active{background:rgba(255,255,255,.11);color:#fff}@media(max-width:380px){#predictzone .predict-toolbar-row{padding:0 2px;margin:-13px 0 15px}#predictzone .predict-mode-card{height:35px;padding:0 8px;padding-right:27px}#predictzone .predict-mode-card strong{font-size:13.8px}#predictzone .predict-mode-card:after{right:8px;top:44%;font-size:22px}}';
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
      if(option){ev.preventDefault();ev.stopPropagation();var mode=option.getAttribute('data-predict-mode')==='candle'?'candle':'updown';row.querySelectorAll('[data-predict-mode]').forEach(function(n){n.classList.toggle('active',n===option)});if(label)label.textContent=mode==='candle'?'Candle Guess':'Up or Down';wrap.classList.remove('open');try{window.dispatchEvent(new CustomEvent('vexa-predict-mode-change',{detail:{mode:mode}}))}catch(e){}}
    });
    document.addEventListener('click',function(ev){if(!row.contains(ev.target))wrap.classList.remove('open')},true);
    if(window.VexaUploadedImages&&window.VexaUploadedImages.load){try{window.VexaUploadedImages.load()}catch(e){}}
    if(window.VexaTonBalance&&window.VexaTonBalance.render){try{window.VexaTonBalance.render()}catch(e){}}
  });
})();
`;