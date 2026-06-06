export const TON_WALLET_DEPOSIT_SCRIPT = `
(function(){
  var STARS_TO_NANO=5890080;
  var NANO_PER_TON=1000000000;
  var TONCONNECT_CDN='https://unpkg.com/@tonconnect/ui@latest/dist/tonconnect-ui.min.js';
  var tonConnectUi=null;
  var tonConnectReady=null;
  var connecting=false;
  var paying=false;
  var verifying=false;
  var tg=window.Telegram&&window.Telegram.WebApp;
  function q(id){return document.getElementById(id)}
  function toast(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2800)}
  function esc(value){return String(value==null?'':value).replace(/[&<>'\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]||c})}
  function ownerId(){return localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'')}
  function setStatus(text,kind){var n=q('tonWalletDepositStatus');if(!n)return;n.textContent=text||'';n.classList.toggle('success',kind==='success');n.classList.toggle('error',kind==='error');n.classList.toggle('pending',kind==='pending')}
  function starsAmount(){var input=q('starsAmountSheet');return Math.max(0,Math.floor(Number(input&&input.value)||0))}
  function amountFromStars(){var stars=starsAmount();return stars>0?stars*STARS_TO_NANO/NANO_PER_TON:0}
  function cleanAmount(value){var n=Number(String(value||'').replace(',','.'));return Number.isFinite(n)&&n>0?Math.floor(n*NANO_PER_TON)/NANO_PER_TON:0}
  function preciseTon(value){var n=cleanAmount(value);return n?n.toFixed(9).replace(/0+$/,'').replace(/\.$/,''):'0'}
  function tonToNanoString(value){var s=preciseTon(value);var parts=s.split('.');var whole=parts[0]||'0';var frac=((parts[1]||'')+'000000000').slice(0,9);try{return (BigInt(whole)*1000000000n+BigInt(frac)).toString()}catch(e){return String(Math.floor(cleanAmount(value)*NANO_PER_TON))}}
  function activeAmount(){var input=q('tonWalletAmountSheet');var typed=cleanAmount(input&&input.value);return typed||amountFromStars()}
  function syncAmountHint(){var input=q('tonWalletAmountSheet');var hint=q('tonWalletAmountHint');var derived=amountFromStars();if(input&&!input.value&&derived)input.value=preciseTon(derived);if(hint)hint.textContent=derived?'Exact TON amount from Stars: '+preciseTon(derived)+' TON':'Enter exact TON amount'}
  async function api(path,payload){var r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload||{})});var j=await r.json().catch(function(){return{error:'Invalid response'}});if(!r.ok)throw new Error(j.error||'Request failed');return j}
  function savePending(deposit){try{localStorage.setItem('vexa:pending-ton-wallet-deposit',JSON.stringify({id:deposit.id,userId:deposit.userId||ownerId(),amountTon:deposit.amountTon,amountNano:deposit.amountNano,wallet:deposit.wallet,status:deposit.status,createdAt:Date.now()}))}catch(e){}}
  function readPending(){try{return JSON.parse(localStorage.getItem('vexa:pending-ton-wallet-deposit')||'null')}catch(e){return null}}
  function clearPending(){try{localStorage.removeItem('vexa:pending-ton-wallet-deposit')}catch(e){}}
  function connectButton(){return document.querySelector('[data-action="connect-ton-wallet"]')}
  function payButton(){return document.querySelector('[data-action="pay-tonconnect-deposit"]')}
  function setConnectedUi(){
    var connected=!!(tonConnectUi&&tonConnectUi.connected);
    var connect=connectButton();
    var pay=payButton();
    var address=tonConnectUi&&tonConnectUi.account&&tonConnectUi.account.address;
    if(connect)connect.textContent=connected?'Wallet Connected':'Connect TON Wallet';
    if(pay)pay.textContent=connected?'Pay With Connected Wallet':'Connect Wallet First';
    var badge=q('tonWalletConnectedAddress');
    if(badge)badge.textContent=connected&&address?shortAddress(address):'Wallet not connected';
  }
  function shortAddress(address){address=String(address||'');return address.length>14?address.slice(0,6)+'…'+address.slice(-6):address}
  function showPendingControls(show){var verify=q('tonWalletVerifyButton');if(verify){verify.hidden=!show;verify.style.display=show?'flex':'none'}}
  function renderPending(deposit){if(!deposit||!deposit.id){showPendingControls(false);return}showPendingControls(true);setStatus('Payment request created. Amount '+esc(deposit.amountTon||'')+' TON. Memo: '+deposit.id,'pending')}
  function loadTonConnect(){
    if(tonConnectUi)return Promise.resolve(tonConnectUi);
    if(tonConnectReady)return tonConnectReady;
    tonConnectReady=new Promise(function(resolve,reject){
      function init(){try{tonConnectUi=new window.TON_CONNECT_UI.TonConnectUI({manifestUrl:window.location.origin+'/tonconnect-manifest.json'});tonConnectUi.onStatusChange(function(){setConnectedUi()});setConnectedUi();resolve(tonConnectUi)}catch(e){reject(e)}}
      if(window.TON_CONNECT_UI&&window.TON_CONNECT_UI.TonConnectUI){init();return}
      var script=document.createElement('script');script.src=TONCONNECT_CDN;script.async=true;script.onload=init;script.onerror=function(){reject(new Error('Could not load TonConnect'))};document.head.appendChild(script);
    });
    return tonConnectReady;
  }
  async function connectWallet(){
    if(connecting)return;
    connecting=true;
    try{
      var ui=await loadTonConnect();
      if(!ui.connected){setStatus('Choose your TON wallet','pending');await ui.openModal()}
      setConnectedUi();
      if(ui.connected)setStatus('Wallet connected. You can pay now.','success')
    }catch(error){setStatus(error&&error.message?error.message:'Could not connect wallet','error');toast(error&&error.message?error.message:'Could not connect wallet')}
    connecting=false;
  }
  async function createDeposit(){
    var user=ownerId();
    if(!user)throw new Error('Telegram user not found');
    var amount=activeAmount();
    if(!amount)throw new Error('Enter a valid TON amount');
    return api('/app/api/ton/deposits',{userId:user,amountTon:preciseTon(amount)});
  }
  async function payWithTonConnect(){
    if(paying)return;
    paying=true;
    try{
      var ui=await loadTonConnect();
      if(!ui.connected){await connectWallet();ui=await loadTonConnect()}
      if(!ui.connected)throw new Error('Wallet is not connected');
      setStatus('Creating payment request','pending');
      var deposit=readPending();
      if(!deposit||!deposit.id){deposit=await createDeposit();savePending(deposit)}
      renderPending(deposit);
      var validUntil=Math.floor(Date.now()/1000)+300;
      await ui.sendTransaction({validUntil:validUntil,messages:[{address:deposit.wallet,amount:String(deposit.amountNano||tonToNanoString(deposit.amountTon)),payload:''}]});
      setStatus('Transaction sent. Checking payment confirmation…','pending');
      setTimeout(function(){verifyDeposit(deposit.id,true)},4500);
    }catch(error){setStatus(error&&error.message?error.message:'Payment cancelled or failed','error');toast(error&&error.message?error.message:'Payment cancelled or failed')}
    paying=false;
  }
  async function verifyDeposit(id,manual){
    var pending=readPending();
    var depositId=id||(pending&&pending.id);
    if(!depositId){showPendingControls(false);if(manual)toast('First create a wallet payment');return}
    if(verifying)return;
    verifying=true;
    if(manual)setStatus('Checking blockchain transaction','pending');
    try{
      var result=await api('/app/api/ton/deposits/'+encodeURIComponent(depositId)+'/verify',{});
      if(result&&result.status==='completed'){
        clearPending();
        showPendingControls(false);
        setStatus('TON received. Balance updated.','success');
        if(window.VexaTonBalance&&window.VexaTonBalance.load)setTimeout(function(){window.VexaTonBalance.load()},500);
      }else{
        savePending(result||pending||{id:depositId});
        renderPending(result||pending||{id:depositId});
        if(manual)setStatus('Payment not found yet. Wait for confirmation, then verify again.','pending');
      }
    }catch(error){setStatus(error&&error.message?error.message:'Could not verify TON payment','error');if(manual)toast(error&&error.message?error.message:'Could not verify TON payment')}
    verifying=false;
  }
  function installStyles(){
    if(q('vexa-ton-wallet-deposit-style'))return;
    var style=document.createElement('style');style.id='vexa-ton-wallet-deposit-style';
    style.textContent='.ton-wallet-deposit-box{width:min(100%,340px)!important;margin:-6px auto 18px!important;display:grid!important;gap:10px!important}.ton-wallet-split{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:10px!important;align-items:center!important;height:52px!important;border-radius:999px!important;background:rgba(255,255,255,.052)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 14px 34px rgba(0,0,0,.14)!important;padding:0 12px 0 18px!important}.ton-wallet-split input{height:100%!important;min-width:0!important;background:transparent!important;border:0!important;border-radius:0!important;color:#fff!important;font-size:16px!important;font-weight:750!important;box-shadow:none!important;padding:0!important;outline:0!important}.ton-wallet-split span{white-space:nowrap!important;color:rgba(255,255,255,.7)!important;font-size:11px!important;font-weight:850!important;background:rgba(255,255,255,.065)!important;border-radius:999px!important;padding:8px 10px!important;line-height:1!important}.ton-wallet-hint,.ton-wallet-connected{margin:-2px 0 0!important;text-align:center!important;color:rgba(255,255,255,.46)!important;font-size:10px!important;font-weight:750!important}.ton-wallet-connect-button,.ton-wallet-pay-button{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:52px!important;margin:0!important;border-radius:999px!important;font-size:15px!important;font-weight:950!important;color:#fff!important;border:0!important;outline:0!important}.ton-wallet-connect-button{background:rgba(255,255,255,.095)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)!important}.ton-wallet-pay-button{background:linear-gradient(135deg,rgba(0,150,255,.34),rgba(255,255,255,.075))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 18px 38px rgba(0,0,0,.22)!important}.ton-wallet-verify-button{display:none!important;align-items:center!important;justify-content:center!important;width:100%!important;height:46px!important;margin:0!important;border-radius:999px!important;font-size:13px!important;font-weight:900!important;background:rgba(255,255,255,.075)!important;color:#fff!important;border:0!important;outline:0!important}.ton-wallet-verify-button:not([hidden]){display:flex!important}.ton-wallet-status{min-height:17px!important;margin:0!important;text-align:center!important;color:rgba(255,255,255,.62)!important;font-size:11px!important;font-weight:750!important;line-height:1.35!important}.ton-wallet-status.success{color:#42f594!important}.ton-wallet-status.error{color:#ff7b9a!important}.ton-wallet-status.pending{color:#ffcf6b!important}';
    document.head.appendChild(style);
  }
  function ensureUi(){
    installStyles();
    var payStars=document.querySelector('#depositSheet [data-action="deposit-custom-stars-sheet"]');
    if(!payStars||q('tonWalletDepositBox')){var p=readPending();if(p&&p.id)renderPending(p);else showPendingControls(false);setConnectedUi();return}
    payStars.insertAdjacentHTML('afterend','<div id="tonWalletDepositBox" class="ton-wallet-deposit-box"><div class="ton-wallet-split"><input id="tonWalletAmountSheet" inputmode="decimal" placeholder="0.1"/><span>TON</span></div><p id="tonWalletAmountHint" class="ton-wallet-hint">Enter exact TON amount</p><button class="ton-wallet-connect-button" type="button" data-action="connect-ton-wallet">Connect TON Wallet</button><p id="tonWalletConnectedAddress" class="ton-wallet-connected">Wallet not connected</p><button class="ton-wallet-pay-button" type="button" data-action="pay-tonconnect-deposit">Connect Wallet First</button><button id="tonWalletVerifyButton" class="ton-wallet-verify-button" type="button" data-action="verify-ton-wallet-deposit" hidden style="display:none">I Paid, Verify Payment</button><p id="tonWalletDepositStatus" class="ton-wallet-status"></p></div>');
    syncAmountHint();
    var pending=readPending();
    if(pending&&pending.id)renderPending(pending);else showPendingControls(false);
    loadTonConnect().catch(function(){});
  }
  function bind(){ensureUi();document.addEventListener('input',function(ev){if(ev.target&&(ev.target.id==='starsAmountSheet'||ev.target.id==='tonWalletAmountSheet'))syncAmountHint()});document.addEventListener('click',function(ev){var button=ev.target&&ev.target.closest?ev.target.closest('button'):null;if(!button)return;var action=button.getAttribute('data-action');if(action==='open-deposit')setTimeout(ensureUi,40);if(action==='connect-ton-wallet'){ev.preventDefault();ev.stopPropagation();connectWallet()}if(action==='pay-tonconnect-deposit'){ev.preventDefault();ev.stopPropagation();payWithTonConnect()}if(action==='verify-ton-wallet-deposit'){ev.preventDefault();ev.stopPropagation();verifyDeposit('',true)}},true);setTimeout(ensureUi,220);setTimeout(ensureUi,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
