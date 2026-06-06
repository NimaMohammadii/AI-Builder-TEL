export const TON_WALLET_DEPOSIT_SCRIPT = `
(function(){
  var STARS_TO_NANO=5890080;
  var NANO_PER_TON=1000000000;
  var TONCONNECT_CDN='https://unpkg.com/@tonconnect/ui@latest/dist/tonconnect-ui.min.js';
  var tonConnectUi=null;
  var tonConnectReady=null;
  var tonFormOpen=false;
  var paying=false;
  var verifying=false;
  var tg=window.Telegram&&window.Telegram.WebApp;
  function q(id){return document.getElementById(id)}
  function toast(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2800)}
  function ownerId(){return localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'')}
  function setStatus(text,kind){var n=q('tonWalletDepositStatus');if(!n)return;n.textContent=text||'';n.classList.toggle('success',kind==='success');n.classList.toggle('error',kind==='error');n.classList.toggle('pending',kind==='pending')}
  function closeDepositSheet(){var sheet=q('depositSheet');if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');sheet.removeAttribute('style');var panel=sheet.querySelector('.deposit-panel');if(panel)panel.removeAttribute('style')}var home=q('home');if(home)home.style.removeProperty('overflow-y');document.body.classList.remove('deposit-open','deposit-keyboard-open')}
  function starsAmount(){var input=q('starsAmountSheet');return Math.max(0,Math.floor(Number(input&&input.value)||0))}
  function amountFromStars(){var stars=starsAmount();return stars>0?stars*STARS_TO_NANO/NANO_PER_TON:0}
  function cleanAmount(value){var n=Number(String(value||'').replace(',','.'));return Number.isFinite(n)&&n>0?Math.floor(n*NANO_PER_TON)/NANO_PER_TON:0}
  function preciseTon(value){var n=cleanAmount(value);return n?n.toFixed(9).replace(/0+$/,'').replace(/\.$/,''):'0'}
  function tonToNanoString(value){var s=preciseTon(value);var parts=s.split('.');var whole=parts[0]||'0';var frac=((parts[1]||'')+'000000000').slice(0,9);try{return (BigInt(whole)*1000000000n+BigInt(frac)).toString()}catch(e){return String(Math.floor(cleanAmount(value)*NANO_PER_TON))}}
  async function api(path,payload){var r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload||{})});var j=await r.json().catch(function(){return{error:'Invalid response'}});if(!r.ok)throw new Error(j.error||'Request failed');return j}
  function savePending(deposit){try{localStorage.setItem('vexa:pending-ton-wallet-deposit',JSON.stringify({id:deposit.id,userId:deposit.userId||ownerId(),amountTon:deposit.amountTon,amountNano:deposit.amountNano,wallet:deposit.wallet,status:deposit.status,createdAt:Date.now()}))}catch(e){}}
  function readPending(){try{return JSON.parse(localStorage.getItem('vexa:pending-ton-wallet-deposit')||'null')}catch(e){return null}}
  function clearPending(){try{localStorage.removeItem('vexa:pending-ton-wallet-deposit')}catch(e){}}
  function loadTonConnect(){
    if(tonConnectUi)return Promise.resolve(tonConnectUi);
    if(tonConnectReady)return tonConnectReady;
    tonConnectReady=new Promise(function(resolve,reject){
      function init(){try{tonConnectUi=new window.TON_CONNECT_UI.TonConnectUI({manifestUrl:window.location.origin+'/tonconnect-manifest.json'});resolve(tonConnectUi)}catch(e){reject(e)}}
      if(window.TON_CONNECT_UI&&window.TON_CONNECT_UI.TonConnectUI){init();return}
      var script=document.createElement('script');script.src=TONCONNECT_CDN;script.async=true;script.onload=init;script.onerror=function(){reject(new Error('Could not load TonConnect'))};document.head.appendChild(script);
    });
    return tonConnectReady;
  }
  function syncDefaultAmount(){var input=q('tonWalletAmountSheet');if(!input||input.value)return;var derived=amountFromStars();if(derived)input.value=preciseTon(derived)}
  function openTonForm(){
    tonFormOpen=true;
    var box=q('tonWalletDepositBox');
    if(box)box.classList.add('open');
    syncDefaultAmount();
    setStatus('', '');
    setTimeout(function(){var input=q('tonWalletAmountSheet');if(input){input.focus();input.select&&input.select()}},120);
  }
  function resetTonForm(){
    tonFormOpen=false;
    var box=q('tonWalletDepositBox');
    if(box)box.classList.remove('open');
    setStatus('', '');
  }
  async function createDeposit(amount){
    var user=ownerId();
    if(!user)throw new Error('Telegram user not found');
    return api('/app/api/ton/deposits',{userId:user,amountTon:preciseTon(amount)});
  }
  async function verifyDeposit(id){
    if(!id||verifying)return;
    verifying=true;
    try{
      var result=await api('/app/api/ton/deposits/'+encodeURIComponent(id)+'/verify',{});
      if(result&&result.status==='completed'){
        clearPending();
        setStatus('Payment received. Balance updated.','success');
        if(window.VexaTonBalance&&window.VexaTonBalance.load)setTimeout(function(){window.VexaTonBalance.load()},500);
        resetTonForm();
      }else{
        savePending(result||{id:id});
        setStatus('Payment sent. Waiting for confirmation.','pending');
        setTimeout(function(){verifyDeposit(id)},5000);
      }
    }catch(error){setStatus(error&&error.message?error.message:'Could not verify payment','error')}
    verifying=false;
  }
  async function confirmTonPayment(){
    if(paying)return;
    var input=q('tonWalletAmountSheet');
    var amount=cleanAmount(input&&input.value);
    if(!amount){toast('Enter a valid TON amount');return}
    paying=true;
    try{
      setStatus('Preparing payment…','pending');
      var ui=await loadTonConnect();
      var deposit=await createDeposit(amount);
      savePending(deposit);
      closeDepositSheet();
      await new Promise(function(resolve){setTimeout(resolve,180)});
      if(!ui.connected)await ui.openModal();
      if(!ui.connected)throw new Error('Wallet is not connected');
      await ui.sendTransaction({validUntil:Math.floor(Date.now()/1000)+300,messages:[{address:deposit.wallet,amount:String(deposit.amountNano||tonToNanoString(deposit.amountTon)),payload:''}]});
      setStatus('Payment sent. Checking confirmation…','pending');
      setTimeout(function(){verifyDeposit(deposit.id)},4500);
    }catch(error){setStatus(error&&error.message?error.message:'Payment cancelled or failed','error');toast(error&&error.message?error.message:'Payment cancelled or failed')}
    paying=false;
  }
  function installStyles(){
    if(q('vexa-ton-wallet-deposit-style'))return;
    var style=document.createElement('style');style.id='vexa-ton-wallet-deposit-style';
    style.textContent='.ton-wallet-deposit-box{width:min(100%,340px)!important;margin:-6px auto 18px!important;display:grid!important;gap:0!important;transition:all .32s cubic-bezier(.2,.8,.2,1)!important}.ton-wallet-action{position:relative!important;width:100%!important;min-height:54px!important;border-radius:999px!important;overflow:hidden!important;background:linear-gradient(135deg,rgba(0,150,255,.34),rgba(255,255,255,.075))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 18px 38px rgba(0,0,0,.22)!important}.ton-wallet-pay-button{position:absolute!important;inset:0!important;width:100%!important;height:54px!important;margin:0!important;border:0!important;border-radius:999px!important;background:transparent!important;color:#fff!important;font-size:15.5px!important;font-weight:950!important;display:flex!important;align-items:center!important;justify-content:center!important;opacity:1!important;transform:scale(1)!important;transition:all .26s ease!important}.ton-wallet-form{display:grid!important;grid-template-columns:minmax(0,1fr) 96px!important;gap:8px!important;align-items:center!important;padding:7px!important;opacity:0!important;transform:translateY(8px) scale(.98)!important;pointer-events:none!important;transition:all .26s ease!important}.ton-wallet-form input{height:40px!important;min-width:0!important;background:rgba(0,0,0,.20)!important;border:0!important;border-radius:999px!important;color:#fff!important;font-size:15px!important;font-weight:850!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important;padding:0 14px!important;outline:0!important}.ton-wallet-confirm{height:40px!important;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.18)!important;color:#fff!important;font-size:13px!important;font-weight:950!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16)!important}.ton-wallet-deposit-box.open .ton-wallet-pay-button{opacity:0!important;transform:translateY(-8px) scale(.96)!important;pointer-events:none!important}.ton-wallet-deposit-box.open .ton-wallet-form{opacity:1!important;transform:translateY(0) scale(1)!important;pointer-events:auto!important}.ton-wallet-status{min-height:17px!important;margin:8px 0 0!important;text-align:center!important;color:rgba(255,255,255,.62)!important;font-size:11px!important;font-weight:750!important;line-height:1.35!important}.ton-wallet-status.success{color:#42f594!important}.ton-wallet-status.error{color:#ff7b9a!important}.ton-wallet-status.pending{color:#ffcf6b!important}';
    document.head.appendChild(style);
  }
  function ensureUi(){
    installStyles();
    var payStars=document.querySelector('#depositSheet [data-action="deposit-custom-stars-sheet"]');
    if(!payStars||q('tonWalletDepositBox')){syncDefaultAmount();return}
    payStars.insertAdjacentHTML('afterend','<div id="tonWalletDepositBox" class="ton-wallet-deposit-box"><div class="ton-wallet-action"><button class="ton-wallet-pay-button" type="button" data-action="open-ton-payment">Pay With TON</button><div class="ton-wallet-form"><input id="tonWalletAmountSheet" inputmode="decimal" placeholder="TON amount"/><button class="ton-wallet-confirm" type="button" data-action="confirm-ton-payment">Confirm</button></div></div><p id="tonWalletDepositStatus" class="ton-wallet-status"></p></div>');
    syncDefaultAmount();
    var pending=readPending();
    if(pending&&pending.id)setStatus('Previous payment is waiting for confirmation.','pending');
    loadTonConnect().catch(function(){});
  }
  function bind(){ensureUi();document.addEventListener('input',function(ev){if(ev.target&&ev.target.id==='starsAmountSheet')syncDefaultAmount()});document.addEventListener('click',function(ev){var button=ev.target&&ev.target.closest?ev.target.closest('button'):null;if(!button)return;var action=button.getAttribute('data-action');if(action==='open-deposit')setTimeout(ensureUi,40);if(action==='open-ton-payment'){ev.preventDefault();ev.stopPropagation();openTonForm()}if(action==='confirm-ton-payment'){ev.preventDefault();ev.stopPropagation();confirmTonPayment()}},true);setTimeout(ensureUi,220);setTimeout(ensureUi,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
