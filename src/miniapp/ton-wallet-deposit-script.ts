export const TON_WALLET_DEPOSIT_SCRIPT = `
(function(){
  var STARS_TO_NANO=5890080;
  var NANO_PER_TON=1000000000;
  var TONCONNECT_CDN='https://unpkg.com/@tonconnect/ui@latest/dist/tonconnect-ui.min.js';
  var tonConnectUi=null;
  var tonConnectReady=null;
  var paying=false;
  var verifying=false;
  var depositMode='stars';
  var tonUsd=0;
  var tg=window.Telegram&&window.Telegram.WebApp;
  function q(id){return document.getElementById(id)}
  function toast(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2800)}
  function ownerId(){return localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'')}
  function setStatus(text,kind){var n=q('tonWalletDepositStatus');if(!n)return;n.textContent=text||'';n.classList.toggle('success',kind==='success');n.classList.toggle('error',kind==='error');n.classList.toggle('pending',kind==='pending')}
  function forceDepositCenter(){var sheet=q('depositSheet');if(!sheet)return;sheet.removeAttribute('style');var panel=sheet.querySelector('.deposit-panel');if(panel)panel.removeAttribute('style')}
  function closeDepositSheet(){var sheet=q('depositSheet');if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');sheet.removeAttribute('style');var panel=sheet.querySelector('.deposit-panel');if(panel)panel.removeAttribute('style')}var home=q('home');if(home)home.style.removeProperty('overflow-y');document.body.classList.remove('deposit-open','deposit-keyboard-open')}
  function cleanAmount(value){var n=Number(String(value||'').replace(',','.'));return Number.isFinite(n)&&n>0?Math.floor(n*NANO_PER_TON)/NANO_PER_TON:0}
  function preciseTon(value){var n=cleanAmount(value);return n?n.toFixed(9).replace(/0+$/,'').replace(/\.$/,''):'0'}
  function shortTon(value){var n=cleanAmount(value);return n?n.toFixed(4).replace(/0+$/,'').replace(/\.$/,''):'0'}
  function tonToNanoString(value){var s=preciseTon(value);var parts=s.split('.');var whole=parts[0]||'0';var frac=((parts[1]||'')+'000000000').slice(0,9);try{return (BigInt(whole)*1000000000n+BigInt(frac)).toString()}catch(e){return String(Math.floor(cleanAmount(value)*NANO_PER_TON))}}
  async function api(path,payload){var r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload||{})});var j=await r.json().catch(function(){return{error:'Invalid response'}});if(!r.ok)throw new Error(j.error||'Request failed');return j}
  function savePending(deposit){try{localStorage.setItem('vexa:pending-ton-wallet-deposit',JSON.stringify({id:deposit.id,userId:deposit.userId||ownerId(),amountTon:deposit.amountTon,amountNano:deposit.amountNano,wallet:deposit.wallet,status:deposit.status,createdAt:Date.now()}))}catch(e){}}
  function clearPending(){try{localStorage.removeItem('vexa:pending-ton-wallet-deposit')}catch(e){}}
  function applyTonConnectDarkTheme(){if(!tonConnectUi)return;try{tonConnectUi.uiOptions={uiPreferences:{theme:'DARK'}}}catch(e){}}
  function loadTonConnect(){
    if(tonConnectUi){applyTonConnectDarkTheme();return Promise.resolve(tonConnectUi)};
    if(tonConnectReady)return tonConnectReady;
    tonConnectReady=new Promise(function(resolve,reject){
      function init(){try{tonConnectUi=new window.TON_CONNECT_UI.TonConnectUI({manifestUrl:window.location.origin+'/tonconnect-manifest.json',uiPreferences:{theme:'DARK'}});applyTonConnectDarkTheme();resolve(tonConnectUi)}catch(e){reject(e)}}
      if(window.TON_CONNECT_UI&&window.TON_CONNECT_UI.TonConnectUI){init();return}
      var script=document.createElement('script');script.src=TONCONNECT_CDN;script.async=true;script.onload=init;script.onerror=function(){reject(new Error('Could not load TonConnect'))};document.head.appendChild(script);
    });
    return tonConnectReady;
  }
  async function loadTonUsd(){
    try{
      var user=ownerId();
      var path='/app/api/predict-round?market=ton'+(user?'&userId='+encodeURIComponent(user):'');
      var r=await fetch(path,{cache:'no-store'});
      var j=await r.json();
      var value=Number(j&&j.round&&j.round.startPrice);
      if(Number.isFinite(value)&&value>0){tonUsd=value;syncModeUi()}
    }catch(e){}
  }
  function setMode(mode){
    depositMode=mode==='ton'?'ton':'stars';
    var input=q('starsAmountSheet');
    var label=document.querySelector('#depositSheet .deposit-custom-field label');
    var pay=q('depositMainPayButton')||document.querySelector('#depositSheet [data-action="deposit-custom-stars-sheet"],#depositSheet [data-action="confirm-ton-payment"]');
    if(label)label.textContent=depositMode==='ton'?'TON Amount':'Custom Stars Amount';
    if(input){input.inputMode=depositMode==='ton'?'decimal':'numeric';input.placeholder=depositMode==='ton'?'TON amount':'Stars amount';if(depositMode==='ton'&&String(input.value||'').match(/^\d+$/)&&Number(input.value)>20){input.value=''}}
    if(pay){pay.textContent=depositMode==='ton'?'Pay With TON':'Pay With Stars';pay.setAttribute('data-action',depositMode==='ton'?'confirm-ton-payment':'deposit-custom-stars-sheet');pay.classList.toggle('ton-mode',depositMode==='ton')}
    var box=q('depositPaymentModeSwitch');if(box){box.classList.toggle('ton',depositMode==='ton');box.setAttribute('aria-label',depositMode==='ton'?'Payment method TON':'Payment method Stars')}
    var sheet=q('depositSheet');if(sheet)sheet.classList.toggle('deposit-ton-mode',depositMode==='ton');
    syncModeUi();
    if(depositMode==='ton'&&!tonUsd)loadTonUsd();
  }
  function syncModeUi(){
    var input=q('starsAmountSheet');var out=q('starsTonEquivalent');if(!input||!out)return;
    if(depositMode==='ton'){
      var ton=cleanAmount(input.value);var usd=tonUsd&&ton?ton*tonUsd:0;out.textContent=usd?'≈ $'+usd.toFixed(2):'USD';out.classList.add('usd-mode');
    }else{
      var stars=Math.max(0,Math.floor(Number(input.value)||0));var ton=stars>0?stars*STARS_TO_NANO/NANO_PER_TON:0;out.textContent=stars>0?'≈ '+shortTon(ton)+' TON':'≈ 0 TON';out.classList.remove('usd-mode');
    }
  }
  async function createDeposit(amount){var user=ownerId();if(!user)throw new Error('Telegram user not found');return api('/app/api/ton/deposits',{userId:user,amountTon:preciseTon(amount)})}
  async function verifyDeposit(id){
    if(!id||verifying)return;verifying=true;
    try{var result=await api('/app/api/ton/deposits/'+encodeURIComponent(id)+'/verify',{});if(result&&result.status==='completed'){clearPending();setStatus('Payment received. Balance updated.','success');if(window.VexaTonBalance&&window.VexaTonBalance.load)setTimeout(function(){window.VexaTonBalance.load()},500)}else{savePending(result||{id:id});setStatus('Payment sent. Waiting for confirmation.','pending');setTimeout(function(){verifyDeposit(id)},5000)}}catch(error){setStatus(error&&error.message?error.message:'Could not verify payment','error')}
    verifying=false;
  }
  async function confirmTonPayment(){
    if(paying)return;
    var input=q('starsAmountSheet');var amount=cleanAmount(input&&input.value);
    if(!amount){toast('Enter a valid TON amount');return}
    paying=true;
    try{
      setStatus('Preparing payment…','pending');
      var ui=await loadTonConnect();applyTonConnectDarkTheme();
      var deposit=await createDeposit(amount);savePending(deposit);closeDepositSheet();
      await new Promise(function(resolve){setTimeout(resolve,180)});
      if(!ui.connected)await ui.openModal();
      if(!ui.connected)throw new Error('Wallet is not connected');
      await ui.sendTransaction({validUntil:Math.floor(Date.now()/1000)+300,messages:[{address:deposit.wallet,amount:String(deposit.amountNano||tonToNanoString(deposit.amountTon)),payload:''}]});
      setStatus('Payment sent. Checking confirmation…','pending');setTimeout(function(){verifyDeposit(deposit.id)},4500);
    }catch(error){setStatus(error&&error.message?error.message:'Payment cancelled or failed','error');toast(error&&error.message?error.message:'Payment cancelled or failed')}
    paying=false;
  }
  function installStyles(){
    if(q('vexa-ton-wallet-deposit-style'))return;
    var style=document.createElement('style');style.id='vexa-ton-wallet-deposit-style';
    style.textContent='#depositSheet .deposit-action-row{width:min(100%,340px)!important;margin:0 auto 18px!important;display:grid!important;grid-template-columns:1fr 132px!important;gap:10px!important;align-items:center!important}#depositSheet .deposit-action-row .deposit-pay-button{width:100%!important;margin:0!important;height:54px!important;transition:background .28s ease,transform .28s ease,opacity .28s ease!important}#depositSheet .deposit-action-row .deposit-pay-button.ton-mode{background:linear-gradient(135deg,rgba(0,40,62,.22),rgba(255,255,255,.04))!important}.deposit-mode-switch{height:42px!important;align-self:center!important;border-radius:999px!important;background:rgba(255,255,255,.035)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055)!important;padding:3px!important;display:grid!important;grid-template-columns:1fr 1fr!important;position:relative!important;overflow:hidden!important;border:0!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important}.deposit-mode-switch:before{content:"";position:absolute!important;top:3px!important;bottom:3px!important;left:3px!important;width:calc(50% - 3px)!important;border-radius:999px!important;background:rgba(255,255,255,.105)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 8px 18px rgba(0,0,0,.16)!important;transition:transform .34s cubic-bezier(.16,1,.3,1),background .26s ease!important}.deposit-mode-switch.ton:before{transform:translateX(100%)!important;background:rgba(0,46,70,.30)!important}.deposit-mode-switch button{appearance:none!important;-webkit-appearance:none!important;position:relative!important;z-index:1!important;border:0!important;background:transparent!important;box-shadow:none!important;color:rgba(255,255,255,.42)!important;font-size:10.5px!important;font-weight:850!important;letter-spacing:.01em!important;border-radius:999px!important;padding:0!important;margin:0!important;line-height:1!important;min-width:0!important;outline:0!important}.deposit-mode-switch:not(.ton) button[data-mode="stars"],.deposit-mode-switch.ton button[data-mode="ton"]{color:rgba(255,255,255,.94)!important}.deposit-mode-switch button:active{transform:scale(.98)!important}#depositSheet .deposit-ton-equivalent{transition:opacity .22s ease,transform .22s ease,background .22s ease!important}#depositSheet.deposit-ton-mode .deposit-ton-equivalent{background:rgba(255,255,255,.075)!important;color:rgba(255,255,255,.82)!important;transform:scale(1.02)!important}.ton-wallet-status{min-height:17px!important;margin:8px 0 0!important;text-align:center!important;color:rgba(255,255,255,.62)!important;font-size:11px!important;font-weight:750!important;line-height:1.35!important}.ton-wallet-status.success{color:#42f594!important}.ton-wallet-status.error{color:#ff7b9a!important}.ton-wallet-status.pending{color:#ffcf6b!important}';
    document.head.appendChild(style);
  }
  function ensureUi(){
    installStyles();
    var pay=document.querySelector('#depositSheet [data-action="deposit-custom-stars-sheet"],#depositSheet [data-action="confirm-ton-payment"]');
    if(!pay)return;
    pay.id='depositMainPayButton';
    var old=q('tonWalletDepositBox');if(old)old.remove();
    if(!q('depositPaymentModeSwitch')){
      var row=document.createElement('div');row.className='deposit-action-row';
      pay.parentNode.insertBefore(row,pay);row.appendChild(pay);
      row.insertAdjacentHTML('beforeend','<div id="depositPaymentModeSwitch" class="deposit-mode-switch" role="switch" aria-label="Payment method Stars"><button type="button" data-action="set-deposit-mode" data-mode="stars">Stars</button><button type="button" data-action="set-deposit-mode" data-mode="ton">TON</button></div>');
      row.insertAdjacentHTML('afterend','<p id="tonWalletDepositStatus" class="ton-wallet-status"></p>');
    }
    setMode(depositMode);forceDepositCenter();loadTonConnect().catch(function(){});if(!tonUsd)loadTonUsd();
  }
  function bind(){ensureUi();document.addEventListener('input',function(ev){if(ev.target&&ev.target.id==='starsAmountSheet')syncModeUi()});document.addEventListener('click',function(ev){var button=ev.target&&ev.target.closest?ev.target.closest('button'):null;if(!button)return;var action=button.getAttribute('data-action');if(action==='open-deposit')setTimeout(ensureUi,40);if(action==='set-deposit-mode'){ev.preventDefault();ev.stopPropagation();setMode(button.getAttribute('data-mode'))}if(action==='confirm-ton-payment'){ev.preventDefault();ev.stopPropagation();confirmTonPayment()}},true);setTimeout(ensureUi,220);setTimeout(ensureUi,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
