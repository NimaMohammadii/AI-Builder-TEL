export const DEPOSIT_ENHANCEMENTS_SCRIPT = `
(function(){
  var STARS_TO_NANO=5890080;
  var tg=window.Telegram&&window.Telegram.WebApp;
  var ownerId=localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'');
  function q(id){return document.getElementById(id)}
  function tonText(nano){
    var value=Math.max(0,Math.floor(Number(nano)||0))/1000000000;
    return value.toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')+' TON';
  }
  function toast(text){
    var n=q('toast');
    if(!n)return;
    n.textContent=text;
    n.style.display='block';
    setTimeout(function(){n.style.display='none'},2600);
  }
  async function api(path,payload){
    var r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    var j=await r.json().catch(function(){return{error:'Invalid response'}});
    if(!r.ok)throw new Error(j.error||'Request failed');
    return j;
  }
  function updateEquivalent(){
    var input=q('starsAmountSheet');
    var out=q('starsTonEquivalent');
    if(!out)return;
    var stars=Math.max(0,Math.floor(Number(input&&input.value)||0));
    out.textContent=stars>0?'≈ '+tonText(stars*STARS_TO_NANO):'≈ 0 TON';
  }
  function syncOpenState(){
    var deposit=q('depositSheet');
    var withdraw=q('withdrawSheet');
    document.body.classList.toggle('deposit-open',!!(deposit&&deposit.classList.contains('open')));
    document.body.classList.toggle('withdraw-open',!!(withdraw&&withdraw.classList.contains('open')));
  }
  function setDepositKeyboard(open){
    document.body.classList.toggle('deposit-keyboard-open',!!open);
  }
  function setSheet(id,open){
    var sheet=q(id);
    if(!sheet)return;
    sheet.classList.toggle('open',!!open);
    sheet.setAttribute('aria-hidden',open?'false':'true');
    setTimeout(syncOpenState,20);
  }
  function resetWithdraw(){
    var status=q('withdrawStatus');
    var success=q('withdrawSuccess');
    var content=document.querySelector('.withdraw-content');
    if(status)status.textContent='';
    if(success){success.classList.remove('show');success.setAttribute('aria-hidden','true')}
    if(content)content.classList.remove('withdraw-done');
  }
  async function submitWithdraw(){
    var amount=q('withdrawAmountTon');
    var wallet=q('withdrawWalletAddress');
    var status=q('withdrawStatus');
    var success=q('withdrawSuccess');
    var content=document.querySelector('.withdraw-content');
    if(!ownerId){toast('Telegram user not found');return}
    if(status)status.textContent='Submitting withdrawal request...';
    if(success){success.classList.remove('show');success.setAttribute('aria-hidden','true')}
    if(content)content.classList.remove('withdraw-done');
    try{
      await api('/app/api/ton/withdrawals',{userId:ownerId,amountTon:amount&&amount.value,walletAddress:wallet&&wallet.value});
      if(status)status.textContent='';
      if(content)content.classList.add('withdraw-done');
      if(success){success.classList.add('show');success.setAttribute('aria-hidden','false')}
      if(window.VexaTonBalance&&window.VexaTonBalance.load)setTimeout(function(){window.VexaTonBalance.load()},500);
    }catch(error){
      if(status)status.textContent=error&&error.message?error.message:'Withdrawal failed';
      toast(error&&error.message?error.message:'Withdrawal failed');
    }
  }
  function bind(){
    updateEquivalent();
    syncOpenState();
    ['depositSheet','withdrawSheet'].forEach(function(id){
      var sheet=q(id);
      if(sheet&&window.MutationObserver)new MutationObserver(syncOpenState).observe(sheet,{attributes:true,attributeFilter:['class','aria-hidden']});
    });
    document.addEventListener('input',function(ev){
      if(ev.target&&ev.target.id==='starsAmountSheet')updateEquivalent();
    });
    document.addEventListener('focusin',function(ev){
      if(ev.target&&(ev.target.id==='starsAmountSheet'||ev.target.id==='withdrawAmountTon'||ev.target.id==='withdrawWalletAddress'))setDepositKeyboard(true);
    });
    document.addEventListener('focusout',function(ev){
      if(ev.target&&(ev.target.id==='starsAmountSheet'||ev.target.id==='withdrawAmountTon'||ev.target.id==='withdrawWalletAddress'))setTimeout(function(){
        var a=document.activeElement;
        if(!a||!['starsAmountSheet','withdrawAmountTon','withdrawWalletAddress'].includes(a.id))setDepositKeyboard(false);
      },80);
    });
    document.addEventListener('click',function(ev){
      var button=ev.target&&ev.target.closest&&ev.target.closest('button');
      if(!button)return;
      var action=button.getAttribute('data-action');
      if(action==='open-deposit')setTimeout(function(){updateEquivalent();syncOpenState()},50);
      if(action==='close-deposit')setTimeout(function(){setDepositKeyboard(false);syncOpenState()},50);
      if(action==='open-withdraw'){resetWithdraw();setSheet('withdrawSheet',true)}
      if(action==='close-withdraw'){setDepositKeyboard(false);setSheet('withdrawSheet',false)}
      if(action==='submit-withdraw'){submitWithdraw()}
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;