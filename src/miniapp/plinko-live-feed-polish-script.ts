export const PLINKO_LIVE_FEED_POLISH_SCRIPT = `
(function(){
  var feed=null;
  var seen={};
  var submitted={};
  var ready=false;
  var loading=false;
  var historyWs=null;
  var historyReconnect=0;

  function active(){var view=document.querySelector('.view.active');return !!(view&&view.id==='plinko')}

  function ensureStyle(){
    if(document.getElementById('plinkoLiveFeedPolishStyle'))return;
    var style=document.createElement('style');
    style.id='plinkoLiveFeedPolishStyle';
    style.textContent='#plinko.view{overflow-y:auto!important;overflow-x:hidden!important}#plinko .plinko-page{height:auto!important;min-height:100%!important;padding-bottom:calc(42px + env(safe-area-inset-bottom))!important}#plinkoLiveFeed{position:absolute!important;left:-9999px!important;top:auto!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}#plinkoLiveHistoryFeed{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;width:min(96%,374px);max-height:394px;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;display:flex;flex-direction:column;gap:6px;z-index:2;margin:8px auto 0;padding:0 2px 2px;box-sizing:border-box;pointer-events:auto;scrollbar-width:none;flex:0 0 auto}#plinkoLiveHistoryFeed::-webkit-scrollbar{display:none}.plinko-history-row{height:34px;min-height:34px;border:0;border-radius:17px;background:rgba(255,255,255,.052);backdrop-filter:blur(4px) saturate(1.14);-webkit-backdrop-filter:blur(4px) saturate(1.14);display:grid;grid-template-columns:24px minmax(0,1fr) auto auto auto;align-items:center;gap:7px;padding:0 9px;color:#fff;box-shadow:none;box-sizing:border-box}.plinko-history-row img{width:24px;height:24px;border-radius:50%;object-fit:cover}.plinko-history-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:850}.plinko-history-meta{font-size:10px;font-weight:850;color:rgba(255,255,255,.72);white-space:nowrap}.plinko-history-mult{font-size:11px;font-weight:950;color:#fff;white-space:nowrap}.plinko-history-total{font-size:11px;font-weight:950;color:#0d7a3a;white-space:nowrap;text-shadow:0 0 10px rgba(13,122,58,.20)}body.plinko-control-loading #plinko .plinko-stage{opacity:0!important;pointer-events:none!important}body.plinko-control-loading #plinko .plinko-controls{opacity:.72!important;pointer-events:none!important}body.plinko-control-loading #plinko:after{content:"Loading current Plinko...";position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);z-index:40;height:42px;padding:0 18px;border-radius:999px;background:rgba(255,255,255,.06);backdrop-filter:blur(4px) saturate(1.15);-webkit-backdrop-filter:blur(4px) saturate(1.15);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:900;letter-spacing:-.02em;white-space:nowrap}@media (max-height:740px){#plinkoLiveHistoryFeed{max-height:340px}}';
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
    if(controls&&feed.parentNode!==page){page.insertBefore(feed,controls.nextSibling);return}
    if(controls&&feed.previousElementSibling!==controls){page.insertBefore(feed,controls.nextSibling);return}
    if(!controls&&feed.parentNode!==page)page.appendChild(feed);
  }

  function updateFeedVisibility(){
    ensureFeed();
    feed.style.display=active()?'flex':'none';
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

  function cleanText(value){return String(value||'').replace(/\s+/g,' ').trim()}
  function firstNumber(value){var match=String(value||'').replace(',', '.').match(/-?\d+(?:\.\d+)?/);return match?Number(match[0]):0}
  function formatNumber(value){var n=Math.max(0,Number(value)||0);return n.toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')}
  function wsUrl(){return (window.location.protocol==='https:'?'wss:':'ws:')+'//'+window.location.host+'/app/api/plinko/live/ws'}
  function fallbackIcon(){return '/app/api/uploaded-image/credit-icon.png'}

  function eventKey(event){
    if(!event)return '';
    if(event.id)return String(event.id);
    return [event.userId,event.name,event.photoUrl,event.amount,event.multiplier,event.total,event.createdAt].join('|');
  }

  function renderEvent(event,prepend){
    if(!event)return;
    var amount=Number(event.amount)||0;
    var multiplier=Number(event.multiplier)||0;
    if(!amount||!multiplier)return;
    var total=Number(event.total);
    if(!Number.isFinite(total)||total<=0)total=amount*multiplier;
    var key=eventKey(event);
    if(!key||seen[key])return;
    seen[key]=1;
    var target=ensureFeed();
    var row=document.createElement('div');
    row.className='plinko-history-row';
    row.dataset.plinkoEventKey=key;

    var img=document.createElement('img');
    img.src=event.photoUrl||fallbackIcon();
    img.onerror=function(){this.src=fallbackIcon()};

    var name=document.createElement('div');
    name.className='plinko-history-name';
    name.textContent=event.name||'Player';

    var ton=document.createElement('div');
    ton.className='plinko-history-meta';
    ton.textContent='TON '+formatNumber(amount);

    var mult=document.createElement('div');
    mult.className='plinko-history-mult';
    mult.textContent='×'+formatNumber(multiplier);

    var totalEl=document.createElement('div');
    totalEl.className='plinko-history-total';
    totalEl.textContent=formatNumber(total);

    row.appendChild(img);
    row.appendChild(name);
    row.appendChild(ton);
    row.appendChild(mult);
    row.appendChild(totalEl);
    if(prepend!==false)target.insertBefore(row,target.firstChild);else target.appendChild(row);
    while(target.children.length>50)target.removeChild(target.lastChild);
    updateFeedVisibility();
  }

  function connectHistory(){
    if(historyWs&&(historyWs.readyState===WebSocket.OPEN||historyWs.readyState===WebSocket.CONNECTING))return;
    try{
      var ws=new WebSocket(wsUrl());
      historyWs=ws;
      ws.onmessage=function(ev){
        try{
          var msg=JSON.parse(ev.data);
          if(!msg)return;
          if(msg.type==='plinko-history'&&Array.isArray(msg.events)){
            if(msg.events.length){
              ensureFeed().innerHTML='';
              seen={};
              msg.events.slice().reverse().forEach(function(item){renderEvent(item,false)});
            }
            updateFeedVisibility();
            return;
          }
          if(msg.type==='plinko-result'&&msg.event)renderEvent(msg.event,true);
        }catch(e){}
      };
      ws.onopen=function(){updateFeedVisibility()};
      ws.onclose=function(){historyWs=null;if(historyReconnect)clearTimeout(historyReconnect);historyReconnect=setTimeout(connectHistory,1600)};
      ws.onerror=function(){try{ws.close()}catch(e){}};
    }catch(e){if(historyReconnect)clearTimeout(historyReconnect);historyReconnect=setTimeout(connectHistory,1600)}
  }

  function sourceResultKey(source){
    if(!source)return '';
    if(source.dataset&&source.dataset.plinkoResultKey)return source.dataset.plinkoResultKey;
    var srcImg=source.querySelector('img');
    var name=source.querySelector('.plinko-live-name');
    var metas=source.querySelectorAll('.plinko-live-meta');
    var mult=source.querySelector('.plinko-live-mult');
    var key=[cleanText(name&&name.textContent),srcImg&&srcImg.src,cleanText(metas[0]&&metas[0].textContent),cleanText(mult&&mult.textContent)].join('|');
    if(source.dataset)source.dataset.plinkoResultKey=key;
    return key;
  }

  function submitSource(source){
    if(!source||!source.classList||!source.classList.contains('plinko-live-row'))return;
    if(source.dataset&&source.dataset.plinkoHistorySubmitted==='1')return;
    var key=sourceResultKey(source);
    if(!key||submitted[key]){if(source.dataset)source.dataset.plinkoHistorySubmitted='1';return}
    submitted[key]=1;
    if(source.dataset)source.dataset.plinkoHistorySubmitted='1';

    var srcImg=source.querySelector('img');
    var srcName=source.querySelector('.plinko-live-name');
    var metas=source.querySelectorAll('.plinko-live-meta');
    var sourceMult=source.querySelector('.plinko-live-mult');
    var amount=firstNumber(metas[0]&&metas[0].textContent?metas[0].textContent:'1')||1;
    var multiplier=firstNumber(sourceMult&&sourceMult.textContent?sourceMult.textContent:'0');
    if(!multiplier)return;
    var payload={
      id:'local-'+Date.now()+'-'+Math.random().toString(16).slice(2),
      name:srcName&&srcName.textContent?srcName.textContent:'Player',
      photoUrl:srcImg&&srcImg.src?srcImg.src:'',
      amount:amount,
      multiplier:multiplier,
      total:amount*multiplier,
      createdAt:Date.now()
    };
    renderEvent(payload,true);
    fetch('/app/api/plinko/live/result',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),cache:'no-store'}).catch(function(){});
  }

  function scan(){
    ensureFeed();
    moveFeedIntoPage();
    updateFeedVisibility();
    gatePlinkoControl();
    connectHistory();
    document.querySelectorAll('#plinkoLiveFeed .plinko-live-row').forEach(submitSource);
  }

  ensureFeed();
  scan();
  connectHistory();

  if(window.MutationObserver){
    new MutationObserver(function(records){
      moveFeedIntoPage();
      updateFeedVisibility();
      gatePlinkoControl();
      records.forEach(function(record){
        Array.prototype.forEach.call(record.addedNodes||[],function(node){
          if(node&&node.classList&&node.classList.contains('plinko-live-row'))submitSource(node);
          if(node&&node.querySelectorAll)node.querySelectorAll('.plinko-live-row').forEach(submitSource);
        });
      });
    }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }

  document.addEventListener('click',function(){setTimeout(scan,80)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(scan,80)});
})();
`;