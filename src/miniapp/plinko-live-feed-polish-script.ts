export const PLINKO_LIVE_FEED_POLISH_SCRIPT = `
(function(){
  var feed=null;
  var seen={};
  var ready=false;
  var loading=false;
  var fetchGuardInstalled=false;
  var fallbackMultipliers=[30,5,3.4,2,1.5,1,0.2,0.2,1,1.5,2,3.4,5,30];
  var currentPlinkoMultipliers=fallbackMultipliers.slice();
  var virtualRows=[];
  var virtualTimer=null;
  var virtualRendered=false;
  var virtualNonce=0;
  var liveHourStartedAt=0;
  var liveHourlyTurnover=null;
  var plinkoVirtualProfiles=['Amir @tonwhale','Nika Rahimi · TON Society','Parsa Jafari (NFT trader)','Melika Amini | TapSwap','Arian Zarei ⚡ wallet OK','Mina Tavakoli / fragment','Saba Pourali 💎','Reza Mahdavi - Whale #42','Kian Ahmadi @kianx','Navid Ghaemi TON keeper','Arman Karimi | Jetton','Darya Mehrabi @darya24','Shayan Bagheri · alpha','Ava Farhadi wallet 0:9f','Pouya Samadi - scalp','Nora Eskandari 🛡️','Sara Nikpour | miniapps','Amir Hosseini tonkeeper','مهسا / Ton Keeper','پارسا @crypto_parsa','سارا NFT Hunter','رضا TON Max','نگار Fragment Deal','حامد Whale Alert','Alex Carter @alex.ton','Maya Collins · Binance P2P','Liam Brooks wallet verified','Sofia Rivera | crypto mom','Noah Bennett ⚡','Emma Stonefield @emmaplays','Oliver Grant - EU desk','Ava Thompson NFT scout','Ethan Walker / tonkeeper','Mia Anderson 💎 TON','Lucas Miller @lucaswins','Charlotte King | Web3','James Wilson whale watch','Amelia Clark · Telegram OG','Benjamin Scott #stake','Harper Lewis miniapp pro','Henry Adams @henry_ton','Ella Young - jackpot run','Daniel Harris wallet 0:a3','Grace Martin | DeFi','Jack Turner daily player','Lily Moore (London)','Leo Cooper @leocoins','Chloe Parker · NFT flip','Max Wright | alpha calls','Ruby Hill fragment buyer','Oscar Green TON Arena','Ivy Baker @ivybets','Samuel Reed - night shift','Zoe Mitchell 💫','David Morgan wallet synced','Eva Foster | crypto desk','Ryan Bell @ryanx','Nora Price - VIP table','Adam Russell TON Club','Mila Hughes · high roller','Tyler Ward @wardbets'];


  function active(){var view=document.querySelector('.view.active');return !!(view&&view.id==='plinko')}

  function ensureStyle(){
    if(document.getElementById('plinkoLiveFeedPolishStyle'))return;
    var style=document.createElement('style');
    style.id='plinkoLiveFeedPolishStyle';
    style.textContent='#plinko.view{overflow-y:auto!important;overflow-x:hidden!important}#plinko .plinko-page{height:auto!important;min-height:100%!important;padding-bottom:calc(42px + env(safe-area-inset-bottom))!important}#plinkoLiveFeed{position:absolute!important;left:-9999px!important;top:auto!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}#plinkoLiveHistoryFeed{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;width:min(96%,374px);max-height:none;overflow:visible;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;display:none;flex-direction:column;z-index:2;margin:8px auto 0;padding:10px 12px 24px;box-sizing:border-box;pointer-events:auto;scrollbar-width:none;flex:0 0 auto;border:0!important;outline:0!important;border-radius:28px;background:transparent!important;box-shadow:none!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important}#plinkoLiveHistoryFeed::-webkit-scrollbar{display:none}.plinko-history-list::-webkit-scrollbar{width:3px}.plinko-history-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:999px}body:has(#plinko.active) #plinkoLiveHistoryFeed{display:flex}.plinko-history-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;color:rgba(255,255,255,.62);font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.plinko-history-title{display:inline-flex;align-items:center;gap:7px;min-width:0}.plinko-history-title svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:.9}.plinko-history-head b{color:rgba(255,255,255,.92);font-size:11px;font-weight:930;letter-spacing:.02em;text-transform:none;white-space:nowrap}.plinko-history-list{display:grid;gap:6px;max-height:570px;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;padding-right:1px}.plinko-history-empty{font-size:11px;font-weight:820;color:rgba(255,255,255,.45);padding:8px 0;text-align:center}.plinko-history-row{min-height:32px;border:0!important;outline:0!important;border-radius:999px;background:transparent!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:8px;padding:0 2px;color:#fff;box-shadow:none!important;box-sizing:border-box}.plinko-history-row img{display:none}.plinko-history-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:900;color:rgba(255,255,255,.92)}.plinko-history-meta{font-size:11px;font-weight:900;color:rgba(255,255,255,.70);white-space:nowrap}.plinko-history-mult{display:none}.plinko-history-total{font-size:11px;font-weight:930;color:rgba(255,255,255,.84);white-space:nowrap;text-shadow:none}.plinko-history-row.virtual{opacity:.72}.plinko-history-row.virtual .plinko-history-name:before{content:'BOT';display:inline-flex;margin-right:6px;padding:1px 5px;border-radius:999px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.48);font-size:8px;font-weight:950;vertical-align:1px}.plinko-history-row.win .plinko-history-meta{color:#78ffb3}.plinko-history-plus{display:inline-block;margin-right:3px;color:#78ffb3;font-weight:950}body.plinko-control-loading #plinko .plinko-stage{opacity:0!important;pointer-events:none!important}body.plinko-control-loading #plinko .plinko-controls{opacity:.72!important;pointer-events:none!important}body.plinko-control-loading #plinko:after{content:"Loading current Plinko...";position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);z-index:40;height:42px;padding:0 18px;border-radius:999px;background:rgba(255,255,255,.06);backdrop-filter:blur(4px) saturate(1.15);-webkit-backdrop-filter:blur(4px) saturate(1.15);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:900;letter-spacing:-.02em;white-space:nowrap}@media (max-height:740px){.plinko-history-list{max-height:570px}}';
    document.head.appendChild(style);
  }

  function isControlUrl(input){
    try{
      var url=typeof input==='string'?input:(input&&input.url)||'';
      return String(url).indexOf('/app/api/plinko-control')!==-1;
    }catch(e){return false}
  }

  function sanitizeControl(data){
    if(!data||!data.rows)return data;
    var item=data.rows['13']&&data.rows['13'].low;
    if(!item||!Array.isArray(item.multipliers)||item.multipliers.length!==14)return data;
    item.multipliers=item.multipliers.map(function(value,index){
      var n=Number(value);
      return Number.isFinite(n)&&n>0?n:fallbackMultipliers[index];
    });
    currentPlinkoMultipliers=item.multipliers.slice(0,14);
    return data;
  }

  function installControlFetchGuard(){
    if(fetchGuardInstalled||typeof window.fetch!=='function')return;
    fetchGuardInstalled=true;
    var originalFetch=window.fetch.bind(window);
    window.fetch=function(input,init){
      var requestIsControl=isControlUrl(input);
      return originalFetch(input,init).then(function(response){
        if(!requestIsControl||!response||!response.ok)return response;
        return response.clone().json().then(function(data){
          var clean=sanitizeControl(data);
          return new Response(JSON.stringify(clean),{
            status:response.status,
            statusText:response.statusText,
            headers:response.headers
          });
        }).catch(function(){return response});
      });
    };
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

  function reloadControl(){
    var reload=window.plinkoReloadControl&&typeof window.plinkoReloadControl==='function'?window.plinkoReloadControl():null;
    return Promise.resolve(reload);
  }

  function gatePlinkoControl(){
    if(!active())return;
    ensureStyle();
    installControlFetchGuard();
    if(ready||loading)return;
    loading=true;
    document.body.classList.add('plinko-control-loading');
    setDropLoading(true);
    reloadControl().then(function(){return fetch('/app/api/plinko-control',{cache:'no-store'})}).catch(function(){return null}).then(function(){
      reloadControl();
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
      feed.setAttribute('aria-label','Plinko live bets');
    }
    if(!feed.querySelector('.plinko-history-head')){
      var head=document.createElement('div');
      head.className='plinko-history-head';
      head.innerHTML='<span class="plinko-history-title"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M3.4 18.4c.6-3 2.3-4.6 4.8-4.6s4.2 1.6 4.8 4.6"/><path d="M16.3 10.2a2.6 2.6 0 1 0 0-5.2"/><path d="M15.4 13.6c2.4.2 3.9 1.7 4.4 4.3"/></svg><span>Live Bets</span></span><b id="plinkoHistoryTotal">0.00 TON · Past 1 hour</b>';
      feed.insertBefore(head,feed.firstChild);
    }
    if(!feed.querySelector('.plinko-history-list')){
      var list=document.createElement('div');
      list.className='plinko-history-list';
      list.id='plinkoHistoryList';
      list.innerHTML='<div class="plinko-history-empty">No bets yet</div>';
      feed.appendChild(list);
    }
    moveFeedIntoPage();
    return feed;
  }

  function historyList(){
    var root=ensureFeed();
    return root&&root.querySelector('.plinko-history-list');
  }

  function updateHistoryTotal(){
    var total=document.getElementById('plinkoHistoryTotal');
    var list=document.getElementById('plinkoHistoryList');
    if(!total||!list)return;
    var realSum=0;
    var virtualSum=0;
    list.querySelectorAll('.plinko-history-row').forEach(function(row){
      var n=row&&row.dataset?Number(row.dataset.amount):0;
      if(!Number.isFinite(n)||n<=0)return;
      if(row.dataset&&row.dataset.virtual==='1')virtualSum+=n;
      else realSum+=n;
    });
    var base=liveHourlyTurnover!==null?liveHourlyTurnover:realSum;
    total.textContent=formatTonAmount(base+virtualSum)+' TON · Past 1 hour';
  }

  function randomIndex(seed,max){
    var numeric=Number(seed==null?Date.now():seed)||0;
    var x=Math.sin(numeric*9301.77+49297.13)*233280;
    return Math.abs(Math.floor(x))%Math.max(1,max);
  }

  function virtualName(profileIndex,seed){
    if(!plinkoVirtualProfiles.length)return 'Player';
    return plinkoVirtualProfiles[Math.abs(profileIndex+randomIndex(seed+profileIndex*101,plinkoVirtualProfiles.length))%plinkoVirtualProfiles.length];
  }

  function virtualAmount(profileIndex,seed){
    var base=[0.05,0.08,0.1,0.12,0.15,0.2,0.25,0.3,0.35,0.4,0.5,0.75,1,1.25,1.5,2,2.5,3,4,5];
    var amount=base[randomIndex(seed+profileIndex*17,base.length)];
    var cents=(randomIndex(seed+profileIndex*29,9))*0.01;
    return Math.round((amount+cents+Number.EPSILON)*100)/100;
  }

  function virtualMultiplier(profileIndex,seed){
    var list=Array.isArray(currentPlinkoMultipliers)&&currentPlinkoMultipliers.length===14?currentPlinkoMultipliers:fallbackMultipliers;
    var mult=list[randomIndex(seed+profileIndex*37,list.length)];
    return Math.round((Number(mult)+Number.EPSILON)*100)/100;
  }

  function shuffleVirtualProfiles(seed){
    var indexes=plinkoVirtualProfiles.map(function(_,index){return index});
    for(var i=indexes.length-1;i>0;i--){
      var j=randomIndex(seed+i*13,i+1);
      var temp=indexes[i];indexes[i]=indexes[j];indexes[j]=temp;
    }
    return indexes;
  }

  function makeVirtualRow(profileIndex,seed){
    var amount=virtualAmount(profileIndex,seed);
    var multiplier=virtualMultiplier(profileIndex,seed);
    return {
      key:'virtual-'+currentHourStart()+'-'+profileIndex+'-'+Math.floor(seed),
      name:virtualName(profileIndex,seed),
      amount:amount,
      multiplier:multiplier,
      total:Math.round((amount*multiplier+Number.EPSILON)*100)/100,
      createdAt:currentHourStart()+Math.max(0,Math.min(Date.now()-currentHourStart(),randomIndex(seed+profileIndex*53,3600000))),
      isVirtual:true
    };
  }

  function buildVirtualRows(){
    var hour=currentHourStart();
    var seed=hour/1000;
    var elapsed=Math.max(0,Date.now()-hour);
    var count=Math.min(80,12+Math.floor(elapsed/2000));
    var indexes=shuffleVirtualProfiles(seed);
    virtualRows=[];
    for(var i=0;i<count;i++)virtualRows.push(makeVirtualRow(indexes[i%indexes.length]||i,seed+i*911));
    virtualRows.sort(function(a,b){return Number(a.createdAt||0)-Number(b.createdAt||0)});
  }

  function pushVirtualRow(){
    if(!active())return;
    syncHourlyReset();
    virtualNonce+=1;
    var indexes=shuffleVirtualProfiles(Date.now()+virtualNonce*977);
    var row=makeVirtualRow(indexes[virtualNonce%Math.max(1,indexes.length)]||virtualNonce,Date.now()+virtualNonce*1307);
    row.createdAt=Date.now();
    row.key='virtual-live-'+liveHourStartedAt+'-'+virtualNonce+'-'+row.createdAt;
    virtualRows.unshift(row);
    if(virtualRows.length>80)virtualRows.length=80;
    addHistoryData(row,row.key);
  }

  function renderVirtualRows(){
    if(!virtualRows.length)buildVirtualRows();
    virtualRows.forEach(function(row){addHistoryData(row,row.key)});
  }

  function scheduleVirtualRows(){
    if(virtualTimer)return;
    virtualTimer=setInterval(pushVirtualRow,2000);
  }

  function expectedVirtualCount(){return Math.min(80,12+Math.floor(Math.max(0,Date.now()-currentHourStart())/2000))}

  function ensureVirtualRows(){
    if(!virtualRendered||virtualRows.length<expectedVirtualCount()){buildVirtualRows();renderVirtualRows();virtualRendered=true}
    scheduleVirtualRows();
  }

  function currentHourStart(){return Math.floor(Date.now()/3600000)*3600000}
  function resetHistoryForHour(hourStartedAt){
    liveHourStartedAt=hourStartedAt||currentHourStart();
    liveHourlyTurnover=null;
    virtualRows=[];
    virtualRendered=false;
    seen={};
    var list=document.getElementById('plinkoHistoryList');
    if(list)list.innerHTML='<div class="plinko-history-empty">No bets yet</div>';
    updateHistoryTotal();
  }
  function applyLiveHourDetail(detail){
    var hour=Number(detail&&detail.hourStartedAt)||currentHourStart();
    if(liveHourStartedAt&&hour!==liveHourStartedAt)resetHistoryForHour(hour);
    else liveHourStartedAt=hour;
    if(detail&&detail.hourlyTurnover!=null){
      var amount=Number(detail.hourlyTurnover);
      liveHourlyTurnover=Number.isFinite(amount)&&amount>=0?amount:0;
    }
    updateHistoryTotal();
  }
  function syncHourlyReset(){
    var hour=currentHourStart();
    if(!liveHourStartedAt)liveHourStartedAt=hour;
    if(hour!==liveHourStartedAt)resetHistoryForHour(hour);
  }

  function cleanText(value){return String(value||'').replace(/\s+/g,' ').trim()}
  function firstNumber(value){var match=String(value||'').replace(',', '.').match(/-?\d+(?:\.\d+)?/);return match?Number(match[0]):0}
  function dataNumber(node,key){var value=node&&node.dataset?Number(node.dataset[key]):NaN;return Number.isFinite(value)&&value>=0?value:NaN}
  function formatNumber(value){var n=Math.max(0,Number(value)||0);return n.toFixed(2)}
  function formatTonAmount(value){var n=Math.max(0,Number(value)||0);return n.toFixed(2)}
  function titleAmount(value){var match=String(value||'').match(/Amount\s+-?\d+(?:\.\d+)?/i);return firstNumber(match&&match[0]||'')}
  function titleMultiplier(value){var match=String(value||'').match(/House\s+-?\d+(?:\.\d+)?x/i);return firstNumber(match&&match[0]||'')}

  function rowKey(row){
    if(!row)return '';
    if(row.dataset&&row.dataset.plinkoHistoryKey)return row.dataset.plinkoHistoryKey;
    var key=cleanText(row.textContent)+'|'+cleanText(row.getAttribute('title'))+'|'+(row.querySelector('img')&&row.querySelector('img').src||'');
    if(row.dataset)row.dataset.plinkoHistoryKey=key;
    return key;
  }

  function addHistoryData(data,key){
    var target=historyList();
    if(!target||!data)return;
    key=key||[data.name,data.amount,data.multiplier,data.total].join('|');
    syncHourlyReset();
    if(data.createdAt!=null&&Number(data.createdAt)<liveHourStartedAt)return;
    if(seen[key])return;
    seen[key]=1;

    var row=document.createElement('div');
    row.className='plinko-history-row';

    var img=document.createElement('img');
    img.src=data.photoUrl||'/app/api/uploaded-image/credit-icon.png';
    img.onerror=function(){this.src='/app/api/uploaded-image/credit-icon.png'};

    var name=document.createElement('div');
    name.className='plinko-history-name';
    name.textContent=data.name||'Player';

    var amountValue=Math.max(0,Number(data.amount)||0)||1;
    amountValue=Math.round((amountValue+Number.EPSILON)*100)/100;
    var ton=document.createElement('div');
    ton.className='plinko-history-meta';
    ton.textContent=formatTonAmount(amountValue)+' TON';

    var multValue=Math.max(0,Number(data.multiplier)||0);
    var mult=document.createElement('div');
    mult.className='plinko-history-mult';
    mult.textContent='×'+formatNumber(multValue);

    var total=document.createElement('div');
    total.className='plinko-history-total';
    var totalValue=Math.max(0,Number(data.total)||0)||amountValue*multValue;
    totalValue=Math.round((totalValue+Number.EPSILON)*100)/100;
    if(row.dataset){
      row.dataset.amount=String(amountValue);
      row.dataset.total=String(totalValue);
      row.dataset.multiplier=String(multValue);
      if(data.createdAt!=null)row.dataset.createdAt=String(data.createdAt);
      if(data.isVirtual){row.dataset.virtual='1';row.className+=' virtual'}
    }
    if(totalValue>amountValue){
      row.className+=' win';
      ton.innerHTML='<span class="plinko-history-plus">+</span>'+formatTonAmount(totalValue)+' TON';
    }
    total.textContent='×'+formatNumber(multValue);

    var empty=target&&target.querySelector('.plinko-history-empty');
    if(empty)empty.remove();
    row.appendChild(img);
    row.appendChild(name);
    row.appendChild(ton);
    row.appendChild(mult);
    row.appendChild(total);
    if(data.isVirtual){
      target.appendChild(row);
    }else{
      target.insertBefore(row,target.firstChild);
    }
    while(target.querySelectorAll('.plinko-history-row:not(.virtual)').length>80){
      var realRows=target.querySelectorAll('.plinko-history-row:not(.virtual)');
      if(realRows.length)realRows[realRows.length-1].remove();else break;
    }
    while(target.querySelectorAll('.plinko-history-row.virtual').length>80){
      var virtualList=target.querySelectorAll('.plinko-history-row.virtual');
      if(virtualList.length)virtualList[0].remove();else break;
    }
    updateHistoryTotal();
  }

  function addHistory(source){
    if(!source||!source.classList||!source.classList.contains('plinko-live-row'))return;
    if(source.dataset&&source.dataset.plinkoHistoryCopied==='1')return;
    var key=rowKey(source);
    if(seen[key]){if(source.dataset)source.dataset.plinkoHistoryCopied='1';return}
    if(source.dataset)source.dataset.plinkoHistoryCopied='1';

    var sourceTitle=source.getAttribute('title')||'';
    var metas=source.querySelectorAll('.plinko-live-meta');
    var amountValue=dataNumber(source,'amount');
    if(!Number.isFinite(amountValue)||amountValue<=0)amountValue=firstNumber(metas[0]&&metas[0].textContent?metas[0].textContent:'')||titleAmount(sourceTitle)||1;
    var sourceMult=source.querySelector('.plinko-live-mult');
    var multValue=dataNumber(source,'multiplier');
    if(!Number.isFinite(multValue))multValue=firstNumber(sourceMult&&sourceMult.textContent?sourceMult.textContent:'')||titleMultiplier(sourceTitle);
    var totalValue=dataNumber(source,'total');
    if(!Number.isFinite(totalValue))totalValue=amountValue*multValue;
    var srcImg=source.querySelector('img');
    var srcName=source.querySelector('.plinko-live-name');
    addHistoryData({
      name:srcName&&srcName.textContent?srcName.textContent:'Player',
      photoUrl:srcImg&&srcImg.src?srcImg.src:'/app/api/uploaded-image/credit-icon.png',
      amount:amountValue,
      multiplier:multValue,
      total:totalValue,
      createdAt:dataNumber(source,'createdAt')
    },key);
  }

  function scan(){
    installControlFetchGuard();
    ensureFeed();
    moveFeedIntoPage();
    gatePlinkoControl();
    syncHourlyReset();
    ensureVirtualRows();
    document.querySelectorAll('#plinkoLiveFeed .plinko-live-row').forEach(addHistory);
  }

  installControlFetchGuard();
  ensureFeed();
  if(window.__plinkoLiveHour)applyLiveHourDetail(window.__plinkoLiveHour);
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

  window.addEventListener('vexa-plinko-live-hour',function(ev){applyLiveHourDetail(ev&&ev.detail)});
  setInterval(function(){syncHourlyReset();ensureVirtualRows()},30000);
  document.addEventListener('click',function(){setTimeout(scan,80)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(scan,80)});
})();
`;