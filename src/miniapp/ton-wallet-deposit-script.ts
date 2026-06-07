export const TON_WALLET_DEPOSIT_SCRIPT = `
(function(){
  var STARS_TO_NANO=5890080;
  var NANO_PER_TON=1000000000;
  var TONCONNECT_SOURCES=['https://cdn.jsdelivr.net/npm/@tonconnect/ui@latest/dist/tonconnect-ui.min.js','https://unpkg.com/@tonconnect/ui@latest/dist/tonconnect-ui.min.js'];
  var tonConnectUi=null;
  var tonConnectReady=null;
  var paying=false;
  var verifying=false;
  var depositMode='stars';
  var tonUsd=0;
  var invoiceHooked=false;
  var tg=window.Telegram&&window.Telegram.WebApp;
  function q(id){return document.getElementById(id)}
  function toast(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2800)}
  function ownerId(){return localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'')}
  function setStatus(text,kind){var n=q('tonWalletDepositStatus');if(!n)return;n.textContent=text||'';n.classList.toggle('success',kind==='success');n.classList.toggle('error',kind==='error');n.classList.toggle('pending',kind==='pending')}
  function lockDepositHeight(){var h=window.__vexaDepositHeight||0;if(!h){h=Math.max(window.innerHeight||0,window.visualViewport&&window.visualViewport.height?Math.round(window.visualViewport.height):0);window.__vexaDepositHeight=h}if(h>0)document.documentElement.style.setProperty('--vexa-deposit-sheet-height',h+'px')}
  function clearDepositHeight(){window.__vexaDepositHeight=0;document.documentElement.style.removeProperty('--vexa-deposit-sheet-height')}
  function forceDepositCenter(){var sheet=q('depositSheet');if(!sheet)return;lockDepositHeight();sheet.removeAttribute('style');var panel=sheet.querySelector('.deposit-panel');if(panel)panel.removeAttribute('style')}
  function closeDepositSheet(){var sheet=q('depositSheet');if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');sheet.removeAttribute('style');var panel=sheet.querySelector('.deposit-panel');if(panel)panel.removeAttribute('style')}var home=q('home');if(home)home.style.removeProperty('overflow-y');document.body.classList.remove('deposit-open','deposit-keyboard-open');clearDepositHeight()}
  function normalizeNumericText(value){
    var text=String(value==null?'':value).trim();
    var fa='۰۱۲۳۴۵۶۷۸۹';
    var ar='٠١٢٣٤٥٦٧٨٩';
    text=text.replace(/[۰-۹]/g,function(d){return String(fa.indexOf(d))}).replace(/[٠-٩]/g,function(d){return String(ar.indexOf(d))});
    text=text.replace(/[٫٬،，,]/g,'.').replace(/[\u200e\u200f\u202a-\u202e\s]/g,'').replace(/[^0-9.]/g,'');
    var first=text.indexOf('.');
    if(first!==-1)text=text.slice(0,first+1)+text.slice(first+1).replace(/\./g,'');
    return text;
  }
  function cleanAmount(value){var n=Number(normalizeNumericText(value));return Number.isFinite(n)&&n>0?Math.floor(n*NANO_PER_TON)/NANO_PER_TON:0}
  function preciseTon(value){var n=cleanAmount(value);return n?n.toFixed(9).replace(/0+$/,'').replace(/\.$/,''):'0'}
  function shortTon(value){var n=cleanAmount(value);return n?n.toFixed(4).replace(/0+$/,'').replace(/\.$/,''):'0'}
  function tonToNanoString(value){var s=preciseTon(value);var parts=s.split('.');var whole=parts[0]||'0';var frac=((parts[1]||'')+'000000000').slice(0,9);try{return (BigInt(whole)*1000000000n+BigInt(frac)).toString()}catch(e){return String(Math.floor(cleanAmount(value)*NANO_PER_TON))}}
  function bytesBase64(bytes){var s='';for(var i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s)}
  function textBytes(text){return Array.prototype.slice.call(new TextEncoder().encode(String(text||'')))}
  function tonCommentPayload(comment){var body=[0,0,0,0].concat(textBytes(comment));var cell=[0,body.length*2].concat(body);var total=cell.length;var boc=[0xb5,0xee,0x9c,0x72,0x01,0x01,0x01,0x01,0x00,total,0].concat(cell);return bytesBase64(boc)}
  async function api(path,payload){var r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload||{})});var j=await r.json().catch(function(){return{error:'Invalid response'}});if(!r.ok)throw new Error(j.error||'Request failed');return j}
  function savePending(deposit){try{localStorage.setItem('vexa:pending-ton-wallet-deposit',JSON.stringify({id:deposit.id,userId:deposit.userId||ownerId(),amountTon:deposit.amountTon,amountNano:deposit.amountNano,wallet:deposit.wallet,status:deposit.status,createdAt:Date.now()}))}catch(e){}}
  function clearPending(){try{localStorage.removeItem('vexa:pending-ton-wallet-deposit')}catch(e){}}

  function installDoneOverlayStyle(){
    if(q('vexa-payment-done-style'))return;
    var style=document.createElement('style');style.id='vexa-payment-done-style';
    style.textContent='.vexa-payment-done{position:fixed!important;inset:0!important;z-index:2147483000!important;display:grid!important;place-items:center!important;pointer-events:none!important;opacity:0!important;transition:opacity .34s ease!important}.vexa-payment-done.show{opacity:1!important}.vexa-payment-done-card{width:154px!important;height:154px!important;border-radius:42px!important;background:rgba(7,10,9,.58)!important;backdrop-filter:blur(18px) saturate(1.18)!important;-webkit-backdrop-filter:blur(18px) saturate(1.18)!important;box-shadow:0 28px 88px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.09),inset 0 0 44px rgba(47,255,139,.055)!important;display:grid!important;place-items:center!important;transform:translateY(18px) scale(.82)!important;transition:transform .62s cubic-bezier(.16,1,.3,1),opacity .34s ease!important;opacity:0!important}.vexa-payment-done.show .vexa-payment-done-card{transform:translateY(0) scale(1)!important;opacity:1!important}.vexa-payment-done-icon{width:78px!important;height:78px!important;border-radius:999px!important;background:radial-gradient(circle at 35% 28%,rgba(123,255,169,.95),rgba(23,198,88,.98) 54%,rgba(11,118,54,.98))!important;box-shadow:0 0 0 8px rgba(50,255,126,.065),0 18px 46px rgba(30,255,118,.24),inset 0 1px 0 rgba(255,255,255,.42)!important;display:grid!important;place-items:center!important;animation:vexaDonePop .76s cubic-bezier(.16,1,.3,1) both!important}.vexa-payment-done-icon svg{width:42px!important;height:42px!important}.vexa-payment-done-icon path{stroke-dasharray:64!important;stroke-dashoffset:64!important;animation:vexaDoneDraw .62s cubic-bezier(.2,.8,.2,1) .18s forwards!important}.vexa-payment-done-text{margin-top:14px!important;color:#fff!important;font-size:20px!important;font-weight:950!important;letter-spacing:-.03em!important;text-shadow:0 8px 28px rgba(0,0,0,.32)!important;opacity:0!important;transform:translateY(8px)!important;animation:vexaDoneText .42s ease .42s forwards!important}@keyframes vexaDoneDraw{to{stroke-dashoffset:0}}@keyframes vexaDonePop{0%{transform:scale(.42);filter:blur(4px);opacity:0}58%{transform:scale(1.08);filter:blur(0);opacity:1}100%{transform:scale(1);opacity:1}}@keyframes vexaDoneText{to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(style);
  }
  function showPaymentDone(){
    installDoneOverlayStyle();
    var old=q('vexaPaymentDone');if(old)old.remove();
    var overlay=document.createElement('div');overlay.id='vexaPaymentDone';overlay.className='vexa-payment-done';
    overlay.innerHTML='<div class="vexa-payment-done-card"><div><div class="vexa-payment-done-icon"><svg viewBox="0 0 52 52" fill="none"><path d="M15 27.5L23 35L38 17" stroke="white" stroke-width="6.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="vexa-payment-done-text">Done</div></div></div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function(){overlay.classList.add('show')});
    setTimeout(function(){overlay.classList.remove('show')},1850);
    setTimeout(function(){try{overlay.remove()}catch(e){}},2300);
  }
  window.VexaShowPaymentDone=showPaymentDone;
  function installInvoiceDoneHook(){
    if(invoiceHooked||!tg||typeof tg.openInvoice!=='function')return;
    invoiceHooked=true;
    var original=tg.openInvoice.bind(tg);
    tg.openInvoice=function(link,callback){
      return original(link,function(state){
        try{if(typeof callback==='function')callback(state)}catch(e){}
        if(state==='paid')showPaymentDone();
      });
    };
  }

  function applyTonConnectDarkTheme(){if(!tonConnectUi)return;try{tonConnectUi.uiOptions={uiPreferences:{theme:'DARK'}}}catch(e){}}
  function loadTonConnectScript(index){
    if(window.TON_CONNECT_UI&&window.TON_CONNECT_UI.TonConnectUI)return Promise.resolve(true);
    if(index>=TONCONNECT_SOURCES.length)return Promise.reject(new Error('Could not load TonConnect'));
    return new Promise(function(resolve,reject){var script=document.createElement('script');script.src=TONCONNECT_SOURCES[index];script.async=true;script.crossOrigin='anonymous';script.onload=function(){resolve(true)};script.onerror=function(){try{script.remove()}catch(e){};loadTonConnectScript(index+1).then(resolve).catch(reject)};document.head.appendChild(script)});
  }
  function loadTonConnect(){
    if(tonConnectUi){applyTonConnectDarkTheme();return Promise.resolve(tonConnectUi)};
    if(tonConnectReady)return tonConnectReady;
    tonConnectReady=new Promise(function(resolve,reject){function init(){try{tonConnectUi=new window.TON_CONNECT_UI.TonConnectUI({manifestUrl:window.location.origin+'/tonconnect-manifest.json',uiPreferences:{theme:'DARK'}});applyTonConnectDarkTheme();resolve(tonConnectUi)}catch(e){tonConnectReady=null;reject(e)}}if(window.TON_CONNECT_UI&&window.TON_CONNECT_UI.TonConnectUI){init();return}loadTonConnectScript(0).then(init).catch(function(error){tonConnectReady=null;reject(error)})});
    return tonConnectReady;
  }
  function waitForWalletConnection(ui){
    if(ui&&ui.connected)return Promise.resolve(true);
    return new Promise(function(resolve,reject){var done=false;var unsubStatus=null;var unsubModal=null;var timer=setTimeout(function(){finish(false,'Wallet connection timed out')},90000);function cleanup(){clearTimeout(timer);try{if(unsubStatus)unsubStatus()}catch(e){}try{if(unsubModal)unsubModal()}catch(e){}}function finish(ok,message){if(done)return;done=true;cleanup();ok?resolve(true):reject(new Error(message||'Wallet is not connected'))}try{if(ui&&ui.onStatusChange){unsubStatus=ui.onStatusChange(function(wallet){if(wallet||ui.connected)finish(true)})}}catch(e){}try{if(ui&&ui.onModalStateChange){unsubModal=ui.onModalStateChange(function(state){var status=String((state&&state.status)||'').toLowerCase();if((status==='closed'||status==='close')&&!ui.connected)finish(false,'Wallet selection cancelled')})}}catch(e){}});
  }
  async function chooseTonWallet(ui){try{if(ui&&ui.connected&&ui.disconnect)await ui.disconnect()}catch(e){}await new Promise(function(resolve){setTimeout(resolve,160)});var wait=waitForWalletConnection(ui);await ui.openModal();await wait}
  async function loadTonUsd(){try{var user=ownerId();var path='/app/api/predict-round?market=ton'+(user?'&userId='+encodeURIComponent(user):'');var r=await fetch(path,{cache:'no-store'});var j=await r.json();var value=Number(j&&j.round&&j.round.startPrice);if(Number.isFinite(value)&&value>0){tonUsd=value;syncModeUi()}}catch(e){}}
  function setMode(mode){
    depositMode=mode==='ton'?'ton':'stars';
    var input=q('starsAmountSheet');var label=document.querySelector('#depositSheet .deposit-custom-field label');var pay=q('depositMainPayButton')||document.querySelector('#depositSheet [data-action="deposit-custom-stars-sheet"],#depositSheet [data-action="confirm-ton-payment"]');
    if(label)label.textContent=depositMode==='ton'?'TON Amount':'Custom Stars Amount';
    if(input){try{input.type='text'}catch(e){}input.inputMode=depositMode==='ton'?'decimal':'numeric';input.setAttribute('inputmode',depositMode==='ton'?'decimal':'numeric');input.setAttribute('autocomplete','off');input.setAttribute('autocorrect','off');input.placeholder=depositMode==='ton'?'TON amount':'Stars amount';if(depositMode==='ton'&&String(input.value||'').match(/^\d+$/)&&Number(input.value)>20){input.value=''}}
    if(pay){pay.textContent=depositMode==='ton'?'Pay With TON':'Pay With Stars';pay.setAttribute('data-action',depositMode==='ton'?'confirm-ton-payment':'deposit-custom-stars-sheet');pay.classList.toggle('ton-mode',depositMode==='ton')}
    var box=q('depositPaymentModeSwitch');if(box){box.classList.toggle('ton',depositMode==='ton');box.setAttribute('aria-label',depositMode==='ton'?'Payment method TON':'Payment method Stars')}
    var sheet=q('depositSheet');if(sheet)sheet.classList.toggle('deposit-ton-mode',depositMode==='ton');syncModeUi();if(depositMode==='ton'&&!tonUsd)loadTonUsd();
  }
  function syncModeUi(){var input=q('starsAmountSheet');var out=q('starsTonEquivalent');if(!input||!out)return;if(depositMode==='ton'){var normalized=normalizeNumericText(input.value);if(input.value!==normalized&&document.activeElement!==input)input.value=normalized;var ton=cleanAmount(normalized);var usd=tonUsd&&ton?ton*tonUsd:0;out.textContent=usd?'≈ $'+usd.toFixed(2):'USD';out.classList.add('usd-mode')}else{var stars=Math.max(0,Math.floor(Number(normalizeNumericText(input.value))||0));var ton=stars>0?stars*STARS_TO_NANO/NANO_PER_TON:0;out.textContent=stars>0?'≈ '+shortTon(ton)+' TON':'≈ 0 TON';out.classList.remove('usd-mode')}}
  async function createDeposit(amount){var user=ownerId();if(!user)throw new Error('Telegram user not found');return api('/app/api/ton/deposits',{userId:user,amountTon:preciseTon(amount)})}
  async function verifyDeposit(id){
    if(!id||verifying)return;verifying=true;
    try{var result=await api('/app/api/ton/deposits/'+encodeURIComponent(id)+'/verify',{});if(result&&result.status==='completed'){clearPending();setStatus('Payment received. Balance updated.','success');showPaymentDone();if(window.VexaTonBalance&&window.VexaTonBalance.load)setTimeout(function(){window.VexaTonBalance.load()},500)}else{savePending(result||{id:id});setStatus('Payment sent. Waiting for confirmation.','pending');setTimeout(function(){verifyDeposit(id)},5000)}}catch(error){setStatus(error&&error.message?error.message:'Could not verify payment','error')}
    verifying=false;
  }
  async function confirmTonPayment(){
    if(paying)return;var input=q('starsAmountSheet');var raw=input&&input.value;var amount=cleanAmount(raw);if(!amount){toast('Enter a valid TON amount');return}if(input)input.value=preciseTon(raw);paying=true;
    try{setStatus('Preparing payment…','pending');var ui=await loadTonConnect();applyTonConnectDarkTheme();var deposit=await createDeposit(amount);savePending(deposit);closeDepositSheet();await new Promise(function(resolve){setTimeout(resolve,180)});await chooseTonWallet(ui);await ui.sendTransaction({validUntil:Math.floor(Date.now()/1000)+300,messages:[{address:deposit.wallet,amount:String(deposit.amountNano||tonToNanoString(deposit.amountTon)),payload:tonCommentPayload(deposit.id)}]});setStatus('Payment sent. Checking confirmation…','pending');setTimeout(function(){verifyDeposit(deposit.id)},4500)}catch(error){setStatus(error&&error.message?error.message:'Payment cancelled or failed','error');toast(error&&error.message?error.message:'Payment cancelled or failed')}paying=false;
  }
  function installStyles(){
    if(q('vexa-ton-wallet-deposit-style'))return;
    var style=document.createElement('style');style.id='vexa-ton-wallet-deposit-style';
    style.textContent='body.deposit-keyboard-open #depositSheet.deposit-sheet{height:var(--vexa-deposit-sheet-height,100vh)!important;min-height:var(--vexa-deposit-sheet-height,100vh)!important;max-height:var(--vexa-deposit-sheet-height,100vh)!important;align-items:center!important;justify-content:center!important;padding:0 16px!important;overflow:hidden!important}body.deposit-keyboard-open #depositSheet .deposit-panel{margin:auto!important;transform:translateY(0) scale(1)!important;max-height:min(calc(var(--vexa-deposit-sheet-height,100vh) - 32px),680px)!important}body.deposit-keyboard-open #depositSheet .deposit-backdrop{height:var(--vexa-deposit-sheet-height,100vh)!important}#depositSheet .deposit-action-row{width:min(100%,340px)!important;margin:0 auto 18px!important;display:grid!important;grid-template-columns:1fr 132px!important;gap:10px!important;align-items:center!important}#depositSheet .deposit-action-row .deposit-pay-button{width:100%!important;margin:0!important;height:54px!important;transition:background .28s ease,transform .28s ease,opacity .28s ease!important}#depositSheet .deposit-action-row .deposit-pay-button.ton-mode{background:linear-gradient(135deg,rgba(0,40,62,.22),rgba(255,255,255,.04))!important}.deposit-mode-switch{height:42px!important;align-self:center!important;border-radius:999px!important;background:rgba(255,255,255,.035)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055)!important;padding:3px!important;display:grid!important;grid-template-columns:1fr 1fr!important;position:relative!important;overflow:hidden!important;border:0!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important}.deposit-mode-switch:before{content:"";position:absolute!important;top:3px!important;bottom:3px!important;left:3px!important;width:calc(50% - 3px)!important;border-radius:999px!important;background:rgba(255,255,255,.105)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 8px 18px rgba(0,0,0,.16)!important;transition:transform .34s cubic-bezier(.16,1,.3,1),background .26s ease!important}.deposit-mode-switch.ton:before{transform:translateX(100%)!important;background:rgba(0,46,70,.30)!important}.deposit-mode-switch button{appearance:none!important;-webkit-appearance:none!important;position:relative!important;z-index:1!important;border:0!important;background:transparent!important;box-shadow:none!important;color:rgba(255,255,255,.42)!important;font-size:10.5px!important;font-weight:850!important;letter-spacing:.01em!important;border-radius:999px!important;padding:0!important;margin:0!important;line-height:1!important;min-width:0!important;outline:0!important}.deposit-mode-switch:not(.ton) button[data-mode="stars"],.deposit-mode-switch.ton button[data-mode="ton"]{color:rgba(255,255,255,.94)!important}.deposit-mode-switch button:active{transform:scale(.98)!important}#depositSheet .deposit-ton-equivalent{transition:opacity .22s ease,transform .22s ease,background .22s ease!important}#depositSheet.deposit-ton-mode .deposit-ton-equivalent{background:rgba(255,255,255,.075)!important;color:rgba(255,255,255,.82)!important;transform:scale(1.02)!important}.ton-wallet-status{min-height:17px!important;margin:8px 0 0!important;text-align:center!important;color:rgba(255,255,255,.62)!important;font-size:11px!important;font-weight:750!important;line-height:1.35!important}.ton-wallet-status.success{color:#42f594!important}.ton-wallet-status.error{color:#ff7b9a!important}.ton-wallet-status.pending{color:#ffcf6b!important}';
    document.head.appendChild(style);
  }
  function ensureUi(){
    installStyles();installDoneOverlayStyle();installInvoiceDoneHook();lockDepositHeight();
    var pay=document.querySelector('#depositSheet [data-action="deposit-custom-stars-sheet"],#depositSheet [data-action="confirm-ton-payment"]');if(!pay)return;pay.id='depositMainPayButton';var old=q('tonWalletDepositBox');if(old)old.remove();
    if(!q('depositPaymentModeSwitch')){var row=document.createElement('div');row.className='deposit-action-row';pay.parentNode.insertBefore(row,pay);row.appendChild(pay);row.insertAdjacentHTML('beforeend','<div id="depositPaymentModeSwitch" class="deposit-mode-switch" role="switch" aria-label="Payment method Stars"><button type="button" data-action="set-deposit-mode" data-mode="stars">Stars</button><button type="button" data-action="set-deposit-mode" data-mode="ton">TON</button></div>');row.insertAdjacentHTML('afterend','<p id="tonWalletDepositStatus" class="ton-wallet-status"></p>')}
    setMode(depositMode);forceDepositCenter();loadTonConnect().catch(function(){});if(!tonUsd)loadTonUsd();
  }
  function bind(){ensureUi();document.addEventListener('input',function(ev){if(ev.target&&ev.target.id==='starsAmountSheet')syncModeUi()});document.addEventListener('focusin',function(ev){if(ev.target&&ev.target.id==='starsAmountSheet'){lockDepositHeight();setTimeout(function(){window.scrollTo(0,0)},40);setTimeout(function(){window.scrollTo(0,0)},180)}});document.addEventListener('click',function(ev){var button=ev.target&&ev.target.closest?ev.target.closest('button'):null;if(!button)return;var action=button.getAttribute('data-action');if(action==='open-deposit'){lockDepositHeight();setTimeout(ensureUi,40)}if(action==='set-deposit-mode'){ev.preventDefault();ev.stopPropagation();setMode(button.getAttribute('data-mode'))}if(action==='confirm-ton-payment'){ev.preventDefault();ev.stopPropagation();confirmTonPayment()}},true);setTimeout(ensureUi,220);setTimeout(ensureUi,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
