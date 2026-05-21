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
      style.textContent='#predictzone .predict-toolbar-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:5px 0 12px;padding:0 16px}#predictzone .predict-mode-wrap{position:relative;width:132px;flex:0 0 132px;min-width:0}#predictzone .predict-mode-card,#predictzone .predict-credit-card{width:132px;height:42px;min-width:0;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.045));color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 11px;backdrop-filter:blur(24px) saturate(1.6);-webkit-backdrop-filter:blur(24px) saturate(1.6);box-shadow:0 18px 55px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.22)}#predictzone .predict-mode-card{position:relative;flex-direction:column;gap:1px;align-items:flex-start;text-align:left}#predictzone .predict-mode-card span{font-size:8px;font-weight:850;letter-spacing:.13em;text-transform:uppercase;color:rgba(255,255,255,.42);line-height:1}#predictzone .predict-mode-card strong{max-width:calc(100% - 20px);font-size:12px;font-weight:800;letter-spacing:-.025em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.15}#predictzone .predict-mode-card:after{content:"⌄";position:absolute;right:12px;top:11px;color:rgba(255,255,255,.72);font-size:18px;line-height:1}#predictzone .predict-credit-card{flex:0 0 132px;justify-content:flex-end}#predictzone .predict-credit-card .ton-mini-icon{width:24px;height:24px}#predictzone .predict-credit-card .ton-mini-icon img{width:24px;height:24px;display:block;object-fit:contain;border:0;background:transparent;box-shadow:none}#predictzone .predict-credit-card b{font-size:12px;font-weight:760;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.025em;font-variant-numeric:tabular-nums lining-nums}#predictzone .predict-mode-menu{position:absolute;left:0;right:0;top:48px;z-index:18;padding:6px;border-radius:20px;border:1px solid rgba(255,255,255,.14);background:rgba(8,8,8,.94);box-shadow:0 22px 62px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.10);backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4);opacity:0;transform:translateY(-6px) scale(.97);pointer-events:none;transition:opacity .16s ease,transform .16s ease}#predictzone .predict-mode-wrap.open .predict-mode-menu{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}#predictzone .predict-mode-option{width:100%;height:34px;border-radius:15px;background:transparent;color:rgba(255,255,255,.68);font-size:12px;font-weight:760;text-align:left;padding:0 10px}#predictzone .predict-mode-option.active{background:rgba(255,255,255,.12);color:#fff}@media(max-width:380px){#predictzone .predict-toolbar-row{padding:0 12px;margin:4px 0 10px}#predictzone .predict-mode-wrap,#predictzone .predict-mode-card,#predictzone .predict-credit-card{width:124px;flex-basis:124px}#predictzone .predict-mode-card,#predictzone .predict-credit-card{height:40px;padding:0 10px}#predictzone .predict-mode-card strong,#predictzone .predict-credit-card b{font-size:11.5px}}';
      document.head.appendChild(style);
    }
    if(root.querySelector('.predict-toolbar-row'))return;
    var row=document.createElement('div');
    row.className='predict-toolbar-row';
    row.innerHTML='<div class="predict-mode-wrap"><button type="button" class="predict-mode-card" data-predict-mode-toggle><span>Type</span><strong data-predict-mode-label>Up or Down</strong></button><div class="predict-mode-menu" data-predict-mode-menu><button type="button" class="predict-mode-option active" data-predict-mode="updown">Up or Down</button><button type="button" class="predict-mode-option" data-predict-mode="candle">Candle Guess</button></div></div><button type="button" class="top-balance-pill predict-credit-card" data-action="open-transactions" aria-label="Open credit balance"><span class="ton-mini-icon"><img src="/app/api/uploaded-image/ton-icon" data-ton-icon alt="" decoding="async"/></span><b data-ton-balance-display>0</b></button>';
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