export const PLINKO_LIVE_FEED_POLISH_SCRIPT = `
(function(){
  var feed=null;
  var seen={};
  var ready=false;
  var loading=false;

  function active(){var view=document.querySelector('.view.active');return !!(view&&view.id==='plinko')}

  function ensureStyle(){
    if(document.getElementById('plinkoLiveFeedPolishStyle'))return;
    var style=document.createElement('style');
    style.id='plinkoLiveFeedPolishStyle';
    style.textContent='#plinko.view{overflow-y:auto!important;overflow-x:hidden!important}#plinko .plinko-page{height:auto!important;min-height:100%!important;padding-bottom:calc(42px + env(safe-area-inset-bottom))!important}#plinkoLiveFeed{position:absolute!important;left:-9999px!important;top:auto!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}#plinkoLiveHistoryFeed{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;width:min(96%,374px);max-height:394px;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;display:none;flex-direction:column;gap:6px;z-index:2;margin:8px auto 0;padding:0 2px 2px;box-sizing:border-box;pointer-events:auto;scrollbar-width:none;flex:0 0 auto}#plinkoLiveHistoryFeed::-webkit-scrollbar{display:none}body:has(#plinko.active) #plinkoLiveHistoryFeed{display:flex}.plinko-history-row{height:34px;min-height:34px;border:0;border-radius:17px;background:rgba(255,255,255,.052);backdrop-filter:blur(4px) saturate(1.14);-webkit-backdrop-filter:blur(4px) saturate(1.14);display:grid;grid-template-columns:24px minmax(0,1fr) auto auto;align-items:center;gap:7px;padding:0 9px;color:#fff;box-shadow:none;box-sizing:border-box}.plinko-history-row img{width:24px;height:24px;border-radius:50%;object-fit:cover}.plinko-history-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:850}.plinko-history-meta{font-size:10px;font-weight:850;color:rgba(255,255,255,.72);white-space:nowrap}.plinko-history-mult{font-size:11px;font-weight:950;color:#fff;white-space:nowrap}body.plinko-control-loading #plinko .plinko-stage{opacity:0!important;pointer-events:none!important}body.plinko-control-loading #plinko .plinko-controls{opacity:.72!important;pointer-events:none!important}body.plinko-control-loading #plinko:after{content:"Loading current Plinko...";position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);z-index:40;height:42px;padding:0 18px;border-radius:999px;background:rgba(255,255,255,.06);backdrop-filter:blur(4px) saturate(1.15);-webkit-backdrop-filter:blur(4px) saturate(1.15);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:900;letter-spacing:-.02em;white-space:nowrap}@media (max-height:740px){#plinkoLiveHistoryFeed{max-height:340px}}';
    document.head.appendChild(style);
  }

  function dropButton(){return document.querySelector('[data-action="drop-plinko-ball"]')}

  function setDropLoading(on){
    var btn=dropButton();
    if(!btn)return;
    if(!btn.__plinkoGateText)btn.__plinkoGateText=btn.textContent||'Drop Ball';
    if(on){btn.disabled=true;btn.textContent='Loading';return}
    if(btn.textContent==='Loading')btn.textContent=btn.__plinkoGateText;
    btn.disabled=false;
  }

  function gatePlinkoControl(){
    if(!active())return;
    ensureStyle();
    if(ready||loading)return;
    loading=true;
    document.body.classList.add('plinko-control-loading');
    setDropLoading(true);
    var reload=window.plinkoReloadControl&&typeof window.plinkoReloadControl==='function'?window.plinkoReloadControl():Promise.resolve();
    Promise.resolve(reload).then(function(){return fetch('/app/api/plinko-control',{cache:'no-store'})}).catch(function(){return null}).then(function(){
      setTimeout(function(){
        ready=true;
        loading=false;
        document.body.classList.remove('plinko-control-loading');
        setDropLoading(false);
      },220);
    });
  }

  function moveFeedIntoPage(){
    if(!feed)return;
    var page=document.querySelector('#plinko .plinko-page')||document.querySelector('.plinko-page');
    if(!page)return;
    var controls=page.querySelector('.plinko-controls');
    if(controls&&controls.parentNode===page&&feed.parentNode!==page){
      page.insertBefore(feed,controls.nextSibling);
      return;
    }
    if(controls&&controls.parentNode===page&&feed.previousElementSibling!==controls){
      page.insertBefore(feed,controls.nextSibling);
      return;
    }
    if(!controls&&feed.parentNode!==page)page.appendChild(feed);
  }

  function ensureFeed(){
    ensureStyle();
    feed=document.getElementById('plinkoLiveHistoryFeed')||feed;
    if(!feed){
      feed=document.createElement('div');
      feed.id='plinkoLiveHistoryFeed';
      feed.setAttribute('aria-label','Plinko live history');
    }
    moveFeedIntoPage();
    return feed;
  }

  function rowKey(row){
    if(!row)return '';
    return (row.textContent||'').replace(/\s+/g,' ').trim()+'|'+Date.now();
  }

  function normalizeText(text){
    return String(text||'').replace(/^Amount\s+/i,'TON ');
  }

  function addHistory(source){
    if(!source||!source.classList||!source.classList.contains('plinko-live-row'))return;
    var target=ensureFeed();
    var key=rowKey(source);
    if(seen[key])return;
    seen[key]=1;

    var row=document.createElement('div');
    row.className='plinko-history-row';

    var srcImg=source.querySelector('img');
    var img=document.createElement('img');
    img.src=srcImg&&srcImg.src?srcImg.src:'/app/api/uploaded-image/credit-icon.png';
    img.onerror=function(){this.src='/app/api/uploaded-image/credit-icon.png'};

    var srcName=source.querySelector('.plinko-live-name');
    var name=document.createElement('div');
    name.className='plinko-history-name';
    name.textContent=srcName&&srcName.textContent?srcName.textContent:'Player';

    var metas=source.querySelectorAll('.plinko-live-meta');
    var ton=document.createElement('div');
    ton.className='plinko-history-meta';
    ton.textContent=normalizeText(metas[0]&&metas[0].textContent?metas[0].textContent:'TON 1');

    var mult=document.createElement('div');
    mult.className='plinko-history-mult';
    var sourceMult=source.querySelector('.plinko-live-mult');
    mult.textContent=sourceMult&&sourceMult.textContent?sourceMult.textContent:'';

    row.appendChild(img);
    row.appendChild(name);
    row.appendChild(ton);
    row.appendChild(mult);
    target.insertBefore(row,target.firstChild);
    while(target.children.length>50)target.removeChild(target.lastChild);
  }

  function scan(){
    ensureFeed();
    moveFeedIntoPage();
    gatePlinkoControl();
    document.querySelectorAll('#plinkoLiveFeed .plinko-live-row').forEach(addHistory);
  }

  ensureFeed();
  scan();

  if(window.MutationObserver){
    new MutationObserver(function(records){
      moveFeedIntoPage();
      gatePlinkoControl();
      records.forEach(function(record){
        Array.prototype.forEach.call(record.addedNodes||[],function(node){
          if(node&&node.classList&&node.classList.contains('plinko-live-row'))addHistory(node);
          if(node&&node.querySelectorAll)node.querySelectorAll('.plinko-live-row').forEach(addHistory);
        });
      });
    }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }

  document.addEventListener('click',function(){setTimeout(scan,80)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(scan,80)});
})();
`;