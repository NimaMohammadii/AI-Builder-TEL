export const PLINKO_LIVE_FEED_POLISH_SCRIPT = `
(function(){
  var feed=null;
  var seen={};
  var ready=false;
  var loading=false;
  var fetchGuardInstalled=false;
  var fallbackMultipliers=[5,2.4,1.8,1.35,1.15,1,.85,.85,1,1.15,1.35,1.8,2.4,5];
  var virtualRows=[];
  var virtualTimer=null;
  var virtualRendered=false;
  var virtualNonce=0;
  var plinkoVirtualProfiles = [
    ['AriNova', 'AriPlay', 'AriSpin', 'AriBet', 'AriWin', 'AriMax', 'AriRush', 'AriTon', 'AriLux', 'AriPro'],
    ['MayaStar', 'MayaSpin', 'MayaBet', 'MayaWin', 'MayaLux', 'MayaTon', 'MayaRush', 'MayaPlay', 'MayaPro', 'MayaNova'],
    ['LiaMoon', 'LiaSpin', 'LiaBet', 'LiaWin', 'LiaLux', 'LiaTon', 'LiaRush', 'LiaPlay', 'LiaPro', 'LiaNova'],
    ['NoraWave', 'NoraSpin', 'NoraBet', 'NoraWin', 'NoraLux', 'NoraTon', 'NoraRush', 'NoraPlay', 'NoraPro', 'NoraNova'],
    ['ElinaFox', 'ElinaSpin', 'ElinaBet', 'ElinaWin', 'ElinaLux', 'ElinaTon', 'ElinaRush', 'ElinaPlay', 'ElinaPro', 'ElinaNova'],
    ['RahaQueen', 'RahaSpin', 'RahaBet', 'RahaWin', 'RahaLux', 'RahaTon', 'RahaRush', 'RahaPlay', 'RahaPro', 'RahaNova'],
    ['YaraGold', 'YaraSpin', 'YaraBet', 'YaraWin', 'YaraLux', 'YaraTon', 'YaraRush', 'YaraPlay', 'YaraPro', 'YaraNova'],
    ['KianFlash', 'KianSpin', 'KianBet', 'KianWin', 'KianLux', 'KianTon', 'KianRush', 'KianPlay', 'KianPro', 'KianNova'],
    ['ArmanX', 'ArmanSpin', 'ArmanBet', 'ArmanWin', 'ArmanLux', 'ArmanTon', 'ArmanRush', 'ArmanPlay', 'ArmanPro', 'ArmanNova'],
    ['SinaAce', 'SinaSpin', 'SinaBet', 'SinaWin', 'SinaLux', 'SinaTon', 'SinaRush', 'SinaPlay', 'SinaPro', 'SinaNova'],
    ['RayanJet', 'RayanSpin', 'RayanBet', 'RayanWin', 'RayanLux', 'RayanTon', 'RayanRush', 'RayanPlay', 'RayanPro', 'RayanNova'],
    ['ParsaKing', 'ParsaSpin', 'ParsaBet', 'ParsaWin', 'ParsaLux', 'ParsaTon', 'ParsaRush', 'ParsaPlay', 'ParsaPro', 'ParsaNova'],
    ['NikaRose', 'NikaSpin', 'NikaBet', 'NikaWin', 'NikaLux', 'NikaTon', 'NikaRush', 'NikaPlay', 'NikaPro', 'NikaNova'],
    ['AvaCloud', 'AvaSpin', 'AvaBet', 'AvaWin', 'AvaLux', 'AvaTon', 'AvaRush', 'AvaPlay', 'AvaPro', 'AvaNova'],
    ['DariaSun', 'DariaSpin', 'DariaBet', 'DariaWin', 'DariaLux', 'DariaTon', 'DariaRush', 'DariaPlay', 'DariaPro', 'DariaNova'],
    ['TaraBlue', 'TaraSpin', 'TaraBet', 'TaraWin', 'TaraLux', 'TaraTon', 'TaraRush', 'TaraPlay', 'TaraPro', 'TaraNova'],
    ['AmirWolf', 'AmirSpin', 'AmirBet', 'AmirWin', 'AmirLux', 'AmirTon', 'AmirRush', 'AmirPlay', 'AmirPro', 'AmirNova'],
    ['AliTiger', 'AliSpin', 'AliBet', 'AliWin', 'AliLux', 'AliTon', 'AliRush', 'AliPlay', 'AliPro', 'AliNova'],
    ['RezaStorm', 'RezaSpin', 'RezaBet', 'RezaWin', 'RezaLux', 'RezaTon', 'RezaRush', 'RezaPlay', 'RezaPro', 'RezaNova'],
    ['AryaFire', 'AryaSpin', 'AryaBet', 'AryaWin', 'AryaLux', 'AryaTon', 'AryaRush', 'AryaPlay', 'AryaPro', 'AryaNova'],
    ['ArvinNeo', 'ArvinSpin', 'ArvinBet', 'ArvinWin', 'ArvinLux', 'ArvinTon', 'ArvinRush', 'ArvinPlay', 'ArvinPro', 'ArvinNova'],
    ['SamanSky', 'SamanSpin', 'SamanBet', 'SamanWin', 'SamanLux', 'SamanTon', 'SamanRush', 'SamanPlay', 'SamanPro', 'SamanNova'],
    ['RadinHero', 'RadinSpin', 'RadinBet', 'RadinWin', 'RadinLux', 'RadinTon', 'RadinRush', 'RadinPlay', 'RadinPro', 'RadinNova'],
    ['ShayanIce', 'ShayanSpin', 'ShayanBet', 'ShayanWin', 'ShayanLux', 'ShayanTon', 'ShayanRush', 'ShayanPlay', 'ShayanPro', 'ShayanNova'],
    ['MahanBolt', 'MahanSpin', 'MahanBet', 'MahanWin', 'MahanLux', 'MahanTon', 'MahanRush', 'MahanPlay', 'MahanPro', 'MahanNova'],
    ['NavidAce', 'NavidSpin', 'NavidBet', 'NavidWin', 'NavidLux', 'NavidTon', 'NavidRush', 'NavidPlay', 'NavidPro', 'NavidNova'],
    ['NimaLuck', 'NimaSpin', 'NimaBet', 'NimaWin', 'NimaLux', 'NimaTon', 'NimaRush', 'NimaPlay', 'NimaPro', 'NimaNova'],
    ['NikanFox', 'NikanSpin', 'NikanBet', 'NikanWin', 'NikanLux', 'NikanTon', 'NikanRush', 'NikanPlay', 'NikanPro', 'NikanNova'],
    ['KavehLion', 'KavehSpin', 'KavehBet', 'KavehWin', 'KavehLux', 'KavehTon', 'KavehRush', 'KavehPlay', 'KavehPro', 'KavehNova'],
    ['SepehrX', 'SepehrSpin', 'SepehrBet', 'SepehrWin', 'SepehrLux', 'SepehrTon', 'SepehrRush', 'SepehrPlay', 'SepehrPro', 'SepehrNova'],
    ['TahaPeak', 'TahaSpin', 'TahaBet', 'TahaWin', 'TahaLux', 'TahaTon', 'TahaRush', 'TahaPlay', 'TahaPro', 'TahaNova'],
    ['ErfanMax', 'ErfanSpin', 'ErfanBet', 'ErfanWin', 'ErfanLux', 'ErfanTon', 'ErfanRush', 'ErfanPlay', 'ErfanPro', 'ErfanNova'],
    ['AminRock', 'AminSpin', 'AminBet', 'AminWin', 'AminLux', 'AminTon', 'AminRush', 'AminPlay', 'AminPro', 'AminNova'],
    ['IlyaRay', 'IlyaSpin', 'IlyaBet', 'IlyaWin', 'IlyaLux', 'IlyaTon', 'IlyaRush', 'IlyaPlay', 'IlyaPro', 'IlyaNova'],
    ['BardiaOne', 'BardiaSpin', 'BardiaBet', 'BardiaWin', 'BardiaLux', 'BardiaTon', 'BardiaRush', 'BardiaPlay', 'BardiaPro', 'BardiaNova'],
    ['HiradMoon', 'HiradSpin', 'HiradBet', 'HiradWin', 'HiradLux', 'HiradTon', 'HiradRush', 'HiradPlay', 'HiradPro', 'HiradNova'],
    ['OmidLite', 'OmidSpin', 'OmidBet', 'OmidWin', 'OmidLux', 'OmidTon', 'OmidRush', 'OmidPlay', 'OmidPro', 'OmidNova'],
    ['PouyaGem', 'PouyaSpin', 'PouyaBet', 'PouyaWin', 'PouyaLux', 'PouyaTon', 'PouyaRush', 'PouyaPlay', 'PouyaPro', 'PouyaNova'],
    ['KasraZen', 'KasraSpin', 'KasraBet', 'KasraWin', 'KasraLux', 'KasraTon', 'KasraRush', 'KasraPlay', 'KasraPro', 'KasraNova'],
    ['AradTime', 'AradSpin', 'AradBet', 'AradWin', 'AradLux', 'AradTon', 'AradRush', 'AradPlay', 'AradPro', 'AradNova'],
    ['MehradVip', 'MehradSpin', 'MehradBet', 'MehradWin', 'MehradLux', 'MehradTon', 'MehradRush', 'MehradPlay', 'MehradPro', 'MehradNova'],
    ['MiraPearl', 'MiraSpin', 'MiraBet', 'MiraWin', 'MiraLux', 'MiraTon', 'MiraRush', 'MiraPlay', 'MiraPro', 'MiraNova'],
    ['LunaNight', 'LunaSpin', 'LunaBet', 'LunaWin', 'LunaLux', 'LunaTon', 'LunaRush', 'LunaPlay', 'LunaPro', 'LunaNova'],
    ['VianDream', 'VianSpin', 'VianBet', 'VianWin', 'VianLux', 'VianTon', 'VianRush', 'VianPlay', 'VianPro', 'VianNova'],
    ['MinaBloom', 'MinaSpin', 'MinaBet', 'MinaWin', 'MinaLux', 'MinaTon', 'MinaRush', 'MinaPlay', 'MinaPro', 'MinaNova'],
    ['RoyaMagic', 'RoyaSpin', 'RoyaBet', 'RoyaWin', 'RoyaLux', 'RoyaTon', 'RoyaRush', 'RoyaPlay', 'RoyaPro', 'RoyaNova'],
    ['AylinStar', 'AylinSpin', 'AylinBet', 'AylinWin', 'AylinLux', 'AylinTon', 'AylinRush', 'AylinPlay', 'AylinPro', 'AylinNova'],
    ['ZaraGlow', 'ZaraSpin', 'ZaraBet', 'ZaraWin', 'ZaraLux', 'ZaraTon', 'ZaraRush', 'ZaraPlay', 'ZaraPro', 'ZaraNova'],
    ['NeginGem', 'NeginSpin', 'NeginBet', 'NeginWin', 'NeginLux', 'NeginTon', 'NeginRush', 'NeginPlay', 'NeginPro', 'NeginNova'],
    ['DorsaCharm', 'DorsaSpin', 'DorsaBet', 'DorsaWin', 'DorsaLux', 'DorsaTon', 'DorsaRush', 'DorsaPlay', 'DorsaPro', 'DorsaNova'],
  ];

  function active(){var view=document.querySelector('.view.active');return !!(view&&view.id==='plinko')}

  function ensureStyle(){
    if(document.getElementById('plinkoLiveFeedPolishStyle'))return;
    var style=document.createElement('style');
    style.id='plinkoLiveFeedPolishStyle';
    style.textContent='#plinko.view{overflow-y:auto!important;overflow-x:hidden!important}#plinko .plinko-page{height:auto!important;min-height:100%!important;padding-bottom:calc(42px + env(safe-area-inset-bottom))!important}#plinkoLiveFeed{position:absolute!important;left:-9999px!important;top:auto!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}#plinkoLiveHistoryFeed{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;width:min(96%,374px);max-height:none;overflow:visible;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;display:none;flex-direction:column;z-index:2;margin:8px auto 0;padding:10px 12px 24px;box-sizing:border-box;pointer-events:auto;scrollbar-width:none;flex:0 0 auto;border:0!important;outline:0!important;border-radius:28px;background:transparent!important;box-shadow:none!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important}#plinkoLiveHistoryFeed::-webkit-scrollbar{display:none}.plinko-history-list::-webkit-scrollbar{width:3px}.plinko-history-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:999px}body:has(#plinko.active) #plinkoLiveHistoryFeed{display:flex}.plinko-history-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;color:rgba(255,255,255,.62);font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.plinko-history-title{display:inline-flex;align-items:center;gap:7px;min-width:0}.plinko-history-title svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:.9}.plinko-history-head b{color:rgba(255,255,255,.92);font-size:11px;font-weight:930;letter-spacing:.02em;text-transform:none;white-space:nowrap}.plinko-history-list{display:grid;gap:6px;max-height:570px;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;padding-right:1px}.plinko-history-empty{font-size:11px;font-weight:820;color:rgba(255,255,255,.45);padding:8px 0;text-align:center}.plinko-history-row{min-height:32px;border:0!important;outline:0!important;border-radius:999px;background:transparent!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:8px;padding:0 2px;color:#fff;box-shadow:none!important;box-sizing:border-box}.plinko-history-row img{display:none}.plinko-history-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:900;color:rgba(255,255,255,.92)}.plinko-history-meta{font-size:11px;font-weight:900;color:rgba(255,255,255,.70);white-space:nowrap}.plinko-history-mult{display:none}.plinko-history-total{font-size:11px;font-weight:930;color:rgba(255,255,255,.84);white-space:nowrap;text-shadow:none}.plinko-history-row.win .plinko-history-meta{color:#78ffb3}.plinko-history-plus{display:inline-block;margin-right:3px;color:#78ffb3;font-weight:950}body.plinko-control-loading #plinko .plinko-stage{opacity:0!important;pointer-events:none!important}body.plinko-control-loading #plinko .plinko-controls{opacity:.72!important;pointer-events:none!important}body.plinko-control-loading #plinko:after{content:"Loading current Plinko...";position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);z-index:40;height:42px;padding:0 18px;border-radius:999px;background:rgba(255,255,255,.06);backdrop-filter:blur(4px) saturate(1.15);-webkit-backdrop-filter:blur(4px) saturate(1.15);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:900;letter-spacing:-.02em;white-space:nowrap}@media (max-height:740px){.plinko-history-list{max-height:570px}}';
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
      head.innerHTML='<span class="plinko-history-title"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M3.4 18.4c.6-3 2.3-4.6 4.8-4.6s4.2 1.6 4.8 4.6"/><path d="M16.3 10.2a2.6 2.6 0 1 0 0-5.2"/><path d="M15.4 13.6c2.4.2 3.9 1.7 4.4 4.3"/></svg><span>Live Bets</span></span><b id="plinkoHistoryTotal">0.00 TON · ۱ ساعته گذشته</b>';
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
    var sum=0;
    list.querySelectorAll('.plinko-history-row').forEach(function(row){
      var n=row&&row.dataset?Number(row.dataset.amount):0;
      if(Number.isFinite(n)&&n>0)sum+=n;
    });
    total.textContent=formatTonAmount(sum)+' TON · ۱ ساعته گذشته';
  }

  function randomIndex(seed,max){
    var numeric=Number(seed==null?Date.now():seed)||0;
    var x=Math.sin(numeric*9301.77+49297.13)*233280;
    return Math.abs(Math.floor(x))%Math.max(1,max);
  }

  function virtualName(profileIndex,seed){
    var names=plinkoVirtualProfiles[profileIndex]||['Player'+(profileIndex+1)];
    return names[randomIndex(seed+profileIndex*101,names.length)];
  }

  function virtualAmount(profileIndex,seed){
    var base=[0.05,0.08,0.1,0.12,0.15,0.2,0.25,0.3,0.35,0.4,0.5,0.75,1,1.25,1.5,2,2.5,3,4,5];
    var amount=base[randomIndex(seed+profileIndex*17,base.length)];
    var cents=(randomIndex(seed+profileIndex*29,9))*0.01;
    return Math.round((amount+cents+Number.EPSILON)*100)/100;
  }

  function virtualMultiplier(profileIndex,seed){
    var mult=fallbackMultipliers[randomIndex(seed+profileIndex*37,fallbackMultipliers.length)];
    return Math.round((mult+Number.EPSILON)*100)/100;
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
      key:'virtual-'+profileIndex+'-'+Math.floor(seed),
      name:virtualName(profileIndex,seed),
      amount:amount,
      multiplier:multiplier,
      total:Math.round((amount*multiplier+Number.EPSILON)*100)/100
    };
  }

  function buildVirtualRows(){
    var tick=Math.floor(Date.now()/9000);
    virtualRows=shuffleVirtualProfiles(tick).slice(0,50).map(function(profileIndex,position){
      return makeVirtualRow(profileIndex,(profileIndex+1)*31+tick*(position%7+3)+position*19);
    });
  }

  function pushVirtualRow(){
    if(!virtualRows.length)buildVirtualRows();
    var profileIndex=randomIndex(Date.now()+virtualNonce++,plinkoVirtualProfiles.length);
    var row=makeVirtualRow(profileIndex,Date.now()+profileIndex*43+Math.random()*5000+virtualNonce);
    virtualRows=virtualRows.filter(function(item){return item.key.indexOf('virtual-'+profileIndex+'-')!==0});
    virtualRows.unshift(row);
    virtualRows=virtualRows.slice(0,50);
    renderVirtualRows();
  }

  function ensureVirtualRows(){
    if(virtualRendered)return;
    buildVirtualRows();
    renderVirtualRows();
    virtualRendered=true;
    if(virtualTimer)clearInterval(virtualTimer);
    virtualTimer=setInterval(pushVirtualRow,1800);
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
    target.insertBefore(row,target.firstChild);
    while(target.querySelectorAll('.plinko-history-row').length>50)target.removeChild(target.lastChild);
    updateHistoryTotal();
  }

  function renderVirtualRows(){
    ensureFeed();
    if(!virtualRows.length)buildVirtualRows();
    virtualRows.slice().reverse().forEach(function(row){addHistoryData(row,row.key)});
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
      total:totalValue
    },key);
  }

  function scan(){
    installControlFetchGuard();
    ensureFeed();
    moveFeedIntoPage();
    gatePlinkoControl();
    ensureVirtualRows();
    document.querySelectorAll('#plinkoLiveFeed .plinko-live-row').forEach(addHistory);
  }

  installControlFetchGuard();
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