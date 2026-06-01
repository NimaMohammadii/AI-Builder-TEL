export const PLINKO_LIVE_FEED_POLISH_SCRIPT = `
(function(){
  var feed=null;
  var seen={};

  function active(){var view=document.querySelector('.view.active');return !!(view&&view.id==='plinko')}

  function ensureStyle(){
    if(document.getElementById('plinkoLiveFeedPolishStyle'))return;
    var style=document.createElement('style');
    style.id='plinkoLiveFeedPolishStyle';
    style.textContent='#plinkoLiveFeed{position:absolute!important;left:-9999px!important;top:auto!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}#plinkoLiveHistoryFeed{position:fixed;left:50%;bottom:calc(118px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(94vw,374px);max-height:394px;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;display:none;flex-direction:column;gap:6px;z-index:96;padding:0 2px 2px;box-sizing:border-box;pointer-events:auto;scrollbar-width:none}#plinkoLiveHistoryFeed::-webkit-scrollbar{display:none}body:has(#plinko.active) #plinkoLiveHistoryFeed{display:flex}.plinko-history-row{height:34px;min-height:34px;border:0;border-radius:17px;background:rgba(255,255,255,.052);backdrop-filter:blur(4px) saturate(1.14);-webkit-backdrop-filter:blur(4px) saturate(1.14);display:grid;grid-template-columns:24px minmax(0,1fr) auto auto;align-items:center;gap:7px;padding:0 9px;color:#fff;box-shadow:none;box-sizing:border-box}.plinko-history-row img{width:24px;height:24px;border-radius:50%;object-fit:cover}.plinko-history-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:850}.plinko-history-meta{font-size:10px;font-weight:850;color:rgba(255,255,255,.72);white-space:nowrap}.plinko-history-mult{font-size:11px;font-weight:950;color:#fff;white-space:nowrap}@media (max-height:740px){#plinkoLiveHistoryFeed{bottom:calc(92px + env(safe-area-inset-bottom));max-height:min(394px,48vh)}}';
    document.head.appendChild(style);
  }

  function ensureFeed(){
    ensureStyle();
    if(feed)return feed;
    feed=document.getElementById('plinkoLiveHistoryFeed');
    if(feed)return feed;
    feed=document.createElement('div');
    feed.id='plinkoLiveHistoryFeed';
    feed.setAttribute('aria-label','Plinko live history');
    document.body.appendChild(feed);
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
    document.querySelectorAll('#plinkoLiveFeed .plinko-live-row').forEach(addHistory);
  }

  ensureFeed();
  scan();

  if(window.MutationObserver){
    new MutationObserver(function(records){
      records.forEach(function(record){
        Array.prototype.forEach.call(record.addedNodes||[],function(node){
          if(node&&node.classList&&node.classList.contains('plinko-live-row'))addHistory(node);
          if(node&&node.querySelectorAll)node.querySelectorAll('.plinko-live-row').forEach(addHistory);
        });
      });
    }).observe(document.body,{childList:true,subtree:true});
  }

  document.addEventListener('click',function(){setTimeout(scan,80)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(scan,80)});
})();
`;