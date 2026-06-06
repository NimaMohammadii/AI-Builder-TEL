export const TON_WALLET_DEPOSIT_SCRIPT = `
(function(){
  var STARS_TO_NANO=5890080;
  var NANO_PER_TON=1000000000;
  var VERIFY_INTERVAL_MS=4200;
  var verifyTimer=0;
  var verifying=false;
  var tg=window.Telegram&&window.Telegram.WebApp;
  function q(id){return document.getElementById(id)}
  function toast(text){var n=q('toast');if(!n)return;n.textContent=text;n.style.display='block';setTimeout(function(){n.style.display='none'},2800)}
  function esc(value){return String(value==null?'':value).replace(/[&<>'\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]||c})}
  function ownerId(){return localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'')}
  function setStatus(text,kind){var n=q('tonWalletDepositStatus');if(!n)return;n.textContent=text||'';n.classList.toggle('success',kind==='success');n.classList.toggle('error',kind==='error');n.classList.toggle('pending',kind==='pending')}
  function amountFromStars(){var input=q('starsAmountSheet');var stars=Math.max(0,Math.floor(Number(input&&input.value)||0));return stars>0?stars*STARS_TO_NANO/NANO_PER_TON:0}
  function cleanAmount(value){var n=Number(String(value||'').replace(',','.'));return Number.isFinite(n)&&n>0?Math.floor(n*NANO_PER_TON)/NANO_PER_TON:0}
  function formatTon(value){var n=cleanAmount(value);return n?n.toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1'):'0'}
  function activeAmount(){var input=q('tonWalletAmountSheet');var typed=cleanAmount(input&&input.value);return typed||amountFromStars()}
  function syncAmountHint(){var input=q('tonWalletAmountSheet');var hint=q('tonWalletAmountHint');var derived=amountFromStars();if(input&&!input.value&&derived)input.placeholder=formatTon(derived);if(hint)hint.textContent=derived?'Default from Stars: '+formatTon(derived)+' TON':'Enter TON amount'}
  async function api(path,payload){var r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload||{})});var j=await r.json().catch(function(){return{error:'Invalid response'}});if(!r.ok)throw new Error(j.error||'Request failed');return j}
  function savePending(deposit){try{localStorage.setItem('vexa:pending-ton-wallet-deposit',JSON.stringify({id:deposit.id,userId:deposit.userId||ownerId(),amountTon:deposit.amountTon,status:deposit.status,createdAt:Date.now()}))}catch(e){}}
  function readPending(){try{return JSON.parse(localStorage.getItem('vexa:pending-ton-wallet-deposit')||'null')}catch(e){return null}}
  function clearPending(){try{localStorage.removeItem('vexa:pending-ton-wallet-deposit')}catch(e){}}
  function showPendingControls(show){var verify=q('tonWalletVerifyButton');if(verify)verify.style.display=show?'block':'none'}
  function renderPending(deposit){if(!deposit||!deposit.id){showPendingControls(false);return}showPendingControls(true);setStatus('Payment created. Send exactly '+esc(deposit.amountTon||'')+' TON, then tap Verify Payment. Memo: '+deposit.id,'pending')}
  function openPayUrl(url){if(!url)return;try{if(tg&&typeof tg.openLink==='function'){tg.openLink(url);return}}catch(e){}try{window.location.href=url}catch(e){}}
  async function startDeposit(){
    var user=ownerId();
    if(!user){toast('Telegram user not found');return}
    var amount=activeAmount();
    if(!amount){toast('Enter a valid TON amount');return}
    setStatus('Creating TON wallet payment','pending');
    try{
      var deposit=await api('/app/api/ton/deposits',{userId:user,amountTon:amount});
      savePending(deposit);
      renderPending(deposit);
      openPayUrl(deposit.payUrl);
      setTimeout(function(){verifyDeposit(deposit.id,false)},6000);
    }catch(error){setStatus(error&&error.message?error.message:'Could not create TON deposit','error');toast(error&&error.message?error.message:'Could not create TON deposit')}
  }
  async function verifyDeposit(id,manual){
    var pending=readPending();
    var depositId=id||(pending&&pending.id);
    if(!depositId){if(manual)toast('No pending TON payment');return}
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
        try{window.dispatchEvent(new CustomEvent('vexa-ton-wallet-deposit-completed',{detail:result}))}catch(e){}
      }else{
        savePending(result||pending||{id:depositId});
        renderPending(result||pending||{id:depositId});
        if(manual)toast('Payment not found yet. Try again after confirmation.');
      }
    }catch(error){setStatus(error&&error.message?error.message:'Could not verify TON payment','error');if(manual)toast(error&&error.message?error.message:'Could not verify TON payment')}
    verifying=false;
  }
  function schedulePendingVerify(){if(verifyTimer)return;verifyTimer=setInterval(function(){var p=readPending();if(p&&p.id)verifyDeposit(p.id,false);else{clearInterval(verifyTimer);verifyTimer=0}},VERIFY_INTERVAL_MS)}
  function installStyles(){
    if(q('vexa-ton-wallet-deposit-style'))return;
    var style=document.createElement('style');style.id='vexa-ton-wallet-deposit-style';
    style.textContent='#home .ton-wallet-deposit-box{width:min(100%,340px);margin:-8px auto 18px;display:grid;gap:10px}#home .ton-wallet-split{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;height:52px;border-radius:999px;background:rgba(255,255,255,.052);box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 14px 34px rgba(0,0,0,.14);padding:0 12px 0 18px}#home .ton-wallet-split input{height:100%!important;min-width:0!important;background:transparent!important;border:0!important;border-radius:0!important;color:#fff!important;font-size:16px!important;font-weight:750!important;box-shadow:none!important;padding:0!important}#home .ton-wallet-split span{white-space:nowrap;color:rgba(255,255,255,.7);font-size:11px;font-weight:850;background:rgba(255,255,255,.065);border-radius:999px;padding:8px 10px;line-height:1}#home .ton-wallet-hint{margin:-2px 0 0;text-align:center;color:rgba(255,255,255,.46);font-size:10px;font-weight:750}#home .ton-wallet-pay-button{display:block!important;width:100%!important;height:54px!important;margin:0!important;border-radius:999px!important;font-size:15.5px!important;font-weight:950!important;background:linear-gradient(135deg,rgba(0,150,255,.34),rgba(255,255,255,.075))!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 18px 38px rgba(0,0,0,.22)!important;border:0!important}#home .ton-wallet-verify-button{display:none!important;width:100%!important;height:46px!important;margin:0!important;border-radius:999px!important;font-size:13px!important;font-weight:900!important;background:rgba(255,255,255,.095)!important;color:#fff!important;border:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)!important}#home .ton-wallet-verify-button[style*="block"]{display:block!important}#home .ton-wallet-status{min-height:17px;margin:0;text-align:center;color:rgba(255,255,255,.62);font-size:11px;font-weight:750;line-height:1.35}#home .ton-wallet-status.success{color:#42f594}#home .ton-wallet-status.error{color:#ff7b9a}#home .ton-wallet-status.pending{color:#ffcf6b}';
    document.head.appendChild(style);
  }
  function ensureUi(){
    installStyles();
    var payStars=document.querySelector('#depositSheet [data-action="deposit-custom-stars-sheet"]');
    if(!payStars||q('tonWalletDepositBox'))return;
    payStars.insertAdjacentHTML('afterend','<div id="tonWalletDepositBox" class="ton-wallet-deposit-box"><div class="ton-wallet-split"><input id="tonWalletAmountSheet" inputmode="decimal" placeholder="0.1"/><span>TON</span></div><p id="tonWalletAmountHint" class="ton-wallet-hint">Enter TON amount</p><button class="ton-wallet-pay-button" type="button" data-action="open-ton-wallet-deposit">Pay With TON Wallet</button><button id="tonWalletVerifyButton" class="ton-wallet-verify-button" type="button" data-action="verify-ton-wallet-deposit">Verify Payment</button><p id="tonWalletDepositStatus" class="ton-wallet-status"></p></div>');
    syncAmountHint();
    var pending=readPending();
    if(pending&&pending.id){renderPending(pending);schedulePendingVerify()}
  }
  function bind(){ensureUi();document.addEventListener('input',function(ev){if(ev.target&&(ev.target.id==='starsAmountSheet'||ev.target.id==='tonWalletAmountSheet'))syncAmountHint()});document.addEventListener('click',function(ev){var button=ev.target&&ev.target.closest?ev.target.closest('button'):null;if(!button)return;var action=button.getAttribute('data-action');if(action==='open-deposit')setTimeout(ensureUi,40);if(action==='open-ton-wallet-deposit'){ev.preventDefault();ev.stopPropagation();startDeposit()}if(action==='verify-ton-wallet-deposit'){ev.preventDefault();ev.stopPropagation();verifyDeposit('',true)}},true);var pending=readPending();if(pending&&pending.id)schedulePendingVerify();setTimeout(ensureUi,220);setTimeout(ensureUi,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
