export const PREDICT_CRYPTO_SELECTOR_SCRIPT = `<script>
(function(){
  function money(value, decimals){
    var n=Number(value);
    if(!isFinite(n)||n<=0)return 'Loading';
    return '$'+n.toLocaleString('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
  }
  var cryptoMarkets={
    bitcoin:{label:'Bitcoin',short:'BTC',question:'Bitcoin go up or down?',symbol:'BTCUSDT',decimals:0},
    solana:{label:'Solana',short:'SOL',question:'Solana go up or down?',symbol:'SOLUSDT',decimals:2},
    ethereum:{label:'Ethereum',short:'ETH',question:'Ethereum go up or down?',symbol:'ETHUSDT',decimals:0}
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
    menu.innerHTML='<button type="button" class="predict-zone-category-card active" data-predict-crypto-menu><span>Crypto</span></button>';
    var grid=document.createElement('div');
    grid.className='predict-crypto-grid';
    grid.setAttribute('data-predict-crypto-grid','');
    grid.innerHTML=['bitcoin','solana','ethereum'].map(function(id){
      var m=cryptoMarkets[id];
      return '<button type="button" class="predict-crypto-card" data-predict-crypto-card="'+id+'"><span class="predict-crypto-image" data-predict-crypto-image="'+id+'"></span><span class="predict-crypto-copy"><b>'+m.label+'</b><small>'+m.question+'</small></span><span class="predict-crypto-price" data-predict-crypto-price="'+id+'">Loading</span></button>';
    }).join('');
    shell.insertBefore(grid,currentCard);
    currentCard.classList.add('predict-detail-hidden');
    menu.querySelector('[data-predict-crypto-menu]').onclick=function(){showGrid()};
    grid.querySelectorAll('[data-predict-crypto-card]').forEach(function(btn){
      btn.onclick=function(){openMarket(btn.getAttribute('data-predict-crypto-card')||'bitcoin')};
    });
    loadImages();
    loadPrices();
    setInterval(function(){if(r.classList.contains('active'))loadPrices()},8000);
  }
  function showGrid(){
    var r=root();if(!r)return;
    var grid=r.querySelector('[data-predict-crypto-grid]');
    var card=r.querySelector('[data-predict-card]');
    if(grid)grid.style.display='grid';
    if(card)card.classList.add('predict-detail-hidden');
    r.querySelectorAll('[data-predict-crypto-menu]').forEach(function(btn){btn.classList.add('active')});
  }
  function openMarket(id){
    var r=root();if(!r)return;
    var m=cryptoMarkets[id]||cryptoMarkets.bitcoin;
    var grid=r.querySelector('[data-predict-crypto-grid]');
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
    setTimeout(function(){
      if(question)question.textContent=m.question;
      if(betQuestion)betQuestion.textContent=m.question;
    },120);
  }
  function loadImages(){
    fetch('/app/api/predict-markets',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      var markets=data&&data.markets||{};
      Object.keys(cryptoMarkets).forEach(function(id){
        var img=root()&&root().querySelector('[data-predict-crypto-image="'+id+'"]');
        var url=markets[id]&&markets[id].imageUrl;
        if(img&&url){img.style.backgroundImage='url('+url+')';img.classList.add('has-image')}
      });
    }).catch(function(){});
  }
  function loadPrices(){
    Object.keys(cryptoMarkets).forEach(function(id){
      var m=cryptoMarkets[id];
      fetch('https://api.binance.com/api/v3/ticker/price?symbol='+encodeURIComponent(m.symbol),{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
        var el=root()&&root().querySelector('[data-predict-crypto-price="'+id+'"]');
        if(el)el.textContent=money(data&&data.price,m.decimals);
      }).catch(function(){});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest&&e.target.closest('[data-view="predictzone"]');
    if(t)setTimeout(mount,120);
  },true);
})();
</script>`;
