export const PREDICT_CRYPTO_SELECTOR_SCRIPT = `<script>
(function(){
  function money(value, decimals){
    var n=Number(value);
    if(!isFinite(n)||n<=0)return 'Loading';
    return '$'+n.toLocaleString('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
  }
  var groups={
    crypto:['bitcoin','solana','ethereum'],
    finance:['gold','oil']
  };
  var markets={
    bitcoin:{label:'Bitcoin',question:'Bitcoin go up or down?',symbol:'BTCUSDT',decimals:0,trade:true},
    solana:{label:'Solana',question:'Solana go up or down?',symbol:'SOLUSDT',decimals:2,trade:true},
    ethereum:{label:'Ethereum',question:'Ethereum go up or down?',symbol:'ETHUSDT',decimals:0,trade:true},
    gold:{label:'Gold',question:'Gold go up or down?',symbol:'PAXGUSDT',decimals:0,trade:false},
    oil:{label:'Oil',question:'Oil go up or down?',symbol:'',decimals:2,trade:false},
    football:{label:'Football',question:'Football prediction',symbol:'',decimals:0,trade:false},
    politics:{label:'Politics',question:'Politics prediction',symbol:'',decimals:0,trade:false},
    fun:{label:'Fun',question:'Fun prediction',symbol:'',decimals:0,trade:false}
  };
  function root(){return document.getElementById('predictzone')}
  function mount(){
    var r=root();
    if(!r||r.dataset.cryptoSelectorReady)return;
    r.dataset.cryptoSelectorReady='1';
    var shell=r.querySelector('.predict-zone-simple-shell');
    var menu=r.querySelector('.predict-zone-category-menu');
    var currentCard=r.querySelector('[data-predict-card]');
    if(!shell||!menu||!currentCard)return;
    menu.innerHTML='<button type="button" class="predict-zone-category-card active" data-predict-group="crypto"><span>Crypto</span></button><button type="button" class="predict-zone-category-card" data-predict-group="finance"><span>Finance</span></button><button type="button" class="predict-zone-category-card" data-predict-direct="football"><span>Football</span></button><button type="button" class="predict-zone-category-card" data-predict-direct="politics"><span>Politics</span></button><button type="button" class="predict-zone-category-card" data-predict-direct="fun"><span>Fun</span></button>';
    var grid=document.createElement('div');
    grid.className='predict-crypto-grid';
    grid.setAttribute('data-predict-market-grid','');
    shell.insertBefore(grid,currentCard);
    currentCard.classList.add('predict-detail-hidden');
    menu.querySelectorAll('[data-predict-group]').forEach(function(btn){btn.onclick=function(){showGroup(btn.getAttribute('data-predict-group')||'crypto')}});
    menu.querySelectorAll('[data-predict-direct]').forEach(function(btn){btn.onclick=function(){openMarket(btn.getAttribute('data-predict-direct')||'football')}});
    showGroup('crypto');
    loadImages();
    loadPrices();
    setInterval(function(){if(r.classList.contains('active'))loadPrices()},8000);
  }
  function setActive(type,value){
    var r=root();if(!r)return;
    r.querySelectorAll('.predict-zone-category-card').forEach(function(btn){
      btn.classList.toggle('active',(type==='group'&&btn.getAttribute('data-predict-group')===value)||(type==='direct'&&btn.getAttribute('data-predict-direct')===value));
    });
  }
  function cardHtml(id){
    var m=markets[id]||markets.bitcoin;
    return '<button type="button" class="predict-crypto-card" data-predict-card-open="'+id+'"><span class="predict-crypto-image" data-predict-crypto-image="'+id+'"></span><span class="predict-crypto-copy"><b>'+m.label+'</b><small>'+m.question+'</small></span><span class="predict-crypto-price" data-predict-crypto-price="'+id+'">Loading</span></button>';
  }
  function showGroup(group){
    var r=root();if(!r)return;
    var grid=r.querySelector('[data-predict-market-grid]');
    var card=r.querySelector('[data-predict-card]');
    var ids=groups[group]||groups.crypto;
    if(grid){
      grid.innerHTML=ids.map(cardHtml).join('');
      grid.style.display='grid';
      grid.querySelectorAll('[data-predict-card-open]').forEach(function(btn){btn.onclick=function(){openMarket(btn.getAttribute('data-predict-card-open')||'bitcoin')}});
    }
    if(card)card.classList.add('predict-detail-hidden');
    setActive('group',group);
    loadImages();
    loadPrices();
  }
  function openMarket(id){
    var r=root();if(!r)return;
    var m=markets[id]||markets.bitcoin;
    var grid=r.querySelector('[data-predict-market-grid]');
    var card=r.querySelector('[data-predict-card]');
    var question=r.querySelector('[data-predict-question]');
    var betQuestion=r.querySelector('[data-predict-bet-question]');
    if(grid)grid.style.display='none';
    if(card)card.classList.remove('predict-detail-hidden');
    if(question)question.textContent=m.question;
    if(betQuestion)betQuestion.textContent=m.question;
    var existing=r.querySelector('[data-predict-market="'+id+'"]');
    if(existing)existing.click();
    else {
      var hidden=document.createElement('button');
      hidden.type='button';
      hidden.style.display='none';
      hidden.setAttribute('data-predict-market',id);
      var menu=r.querySelector('.predict-zone-category-menu');
      if(menu)menu.appendChild(hidden);
      hidden.click();
    }
    setActive('direct',id);
    setTimeout(function(){
      if(question)question.textContent=m.question;
      if(betQuestion)betQuestion.textContent=m.question;
    },120);
  }
  function loadImages(){
    fetch('/app/api/predict-markets',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      var list=data&&data.markets||{};
      Object.keys(markets).forEach(function(id){
        var img=root()&&root().querySelector('[data-predict-crypto-image="'+id+'"]');
        var url=list[id]&&list[id].imageUrl;
        if(img&&url){img.style.backgroundImage='url('+url+')';img.classList.add('has-image')}
      });
    }).catch(function(){});
  }
  function loadPrices(){
    Object.keys(markets).forEach(function(id){
      var m=markets[id];
      var el=root()&&root().querySelector('[data-predict-crypto-price="'+id+'"]');
      if(!el)return;
      if(!m.symbol){el.textContent='Soon';return;}
      fetch('https://api.binance.com/api/v3/ticker/price?symbol='+encodeURIComponent(m.symbol),{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){el.textContent=money(data&&data.price,m.decimals)}).catch(function(){el.textContent='Loading'});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  document.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('[data-view="predictzone"]');if(t)setTimeout(mount,120)},true);
})();
</script>`;
