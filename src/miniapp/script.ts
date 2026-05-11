export const MINIAPP_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  if(tg){try{tg.ready();tg.expand()}catch(e){}}

  var ownerId=localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'');
  var selectedVoice='TX3LPaxmHKxFdv7VOQHJ';
  var sectionTitles={home:'Home',connect:'Connect',results:'Bot Control',playzone:'Play Zone',flow:'Text To Speech',mines:'Mines',plinko:'Plinko',crash:'Crash',wheel:'Wheel',dice:'Dice',limbo:'Limbo',tower:'Tower',coinflip:'Coin Flip',hilo:'Hi-Lo'};

  function q(id){return document.getElementById(id)}
  function setText(id,v){var n=q(id);if(n)n.textContent=v}
  function toast(v){var n=q('toast');if(!n)return;n.textContent=v;n.style.display='block';setTimeout(function(){n.style.display='none'},3000)}
  function setKeyboardOpen(open){document.body.classList.toggle('keyboard-open',!!open)}
  function dismissKeyboard(){var active=document.activeElement;if(active&&typeof active.blur==='function')active.blur();setKeyboardOpen(false)}
  function setLimitSheet(open){var s=q('ttsLimitSheet');if(!s)return;s.classList.toggle('open',!!open);s.setAttribute('aria-hidden',open?'false':'true')}
  function setDepositSheet(open){var s=q('depositSheet');if(!s)return;s.classList.toggle('open',!!open);s.setAttribute('aria-hidden',open?'false':'true')}
  function updateTtsCharCount(){var input=q('ttsText');var counter=q('ttsCharCount');var flow=q('flow');var count=(input&&input.value||'').length;if(counter)counter.textContent=String(count)+' characters';if(flow)flow.classList.toggle('over-limit',count>1000)}

  function show(id){
    document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
    var v=q(id);if(v)v.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')===id)});
    setText('brandTitle',sectionTitles[id]||'Vexa FLOW');
    if(id!=='flow'){setKeyboardOpen(false);setLimitSheet(false)}
  }

  async function api(path,opt){
    opt=opt||{};
    var r=await fetch(path,Object.assign({},opt,{headers:Object.assign({'content-type':'application/json'},opt.headers||{})}));
    var j=await r.json().catch(function(){return{error:'Invalid response'}});
    if(!r.ok)throw new Error(j.error||'Request failed');
    return j;
  }

  function rankFallback(level){level=Math.max(1,Math.floor(Number(level)||1));if(level>=50)return 'Legend';if(level>=35)return 'Elite';if(level>=20)return 'Pro';if(level>=10)return 'Builder';if(level>=5)return 'Explorer';return 'Starter'}
  function renderLevel(profile){var n=q('userLine');var level=Math.max(1,Math.floor(Number(profile&&profile.level)||1));var progress=Math.max(0,Math.min(100,Math.floor(Number(profile&&profile.progressPercent)||0)));var left=Math.max(0,Math.floor(Number(profile&&profile.xpLeft)||0));var rank=String((profile&&profile.rankName)||rankFallback(level));var pill=q('rankPill');if(pill)pill.textContent=rank;if(!n)return;n.innerHTML='<span style="display:block;color:#fff;font-weight:800;font-size:12px;line-height:1">Level '+level+' <span style="color:rgba(255,255,255,.55);font-weight:700">• '+progress+'%</span></span><span style="display:block;width:158px;height:6px;margin-top:6px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden"><span style="display:block;width:'+progress+'%;height:100%;border-radius:999px;background:linear-gradient(90deg,#5b0f24,#8f1d3d,#c03a5b);box-shadow:0 0 14px rgba(192,58,91,.48)"></span></span><span style="display:block;margin-top:5px;color:rgba(255,255,255,.5);font-size:9.5px;line-height:1">'+left+' XP left to finish</span>'}
  async function loadLevel(){renderLevel({level:1,progressPercent:42,xpLeft:580,rankName:'Starter'});if(!ownerId)return;try{renderLevel(await api('/app/api/level?userId='+encodeURIComponent(ownerId),{headers:{'accept':'application/json'}}))}catch(e){}}
  function userLine(){loadLevel()}

  function setVoice(v,label){
    selectedVoice=v;
    setText('voiceLabel',label);
    document.querySelectorAll('[data-voice]').forEach(function(x){x.classList.toggle('active',x.getAttribute('data-voice')===v)});
    var w=q('voiceWrap');if(w)w.classList.remove('open');
  }

  async function depositStars(stars){
    var amount=Math.floor(Number(stars)||0);
    if(!ownerId)return toast('Telegram user not found');
    if(!amount||amount<1)return toast('Enter a valid Stars amount');
    var status=q('depositStatus');
    if(status)status.textContent='Creating secure Telegram invoice';
    try{
      var d=await api('/app/api/stars/deposits',{method:'POST',body:JSON.stringify({userId:ownerId,stars:amount})});
      if(status)status.textContent='Opening Telegram Stars payment';
      if(d.invoiceLink){
        if(tg&&typeof tg.openInvoice==='function'){
          tg.openInvoice(d.invoiceLink,function(state){
            if(status)status.textContent=state==='paid'?'Payment received Balance will update shortly':'Payment status: '+state;
            if(state==='paid'&&window.VexaTonBalance&&window.VexaTonBalance.load)setTimeout(function(){window.VexaTonBalance.load()},900);
            if(state==='paid')setTimeout(loadLevel,1100);
          });
        }else{window.location.href=d.invoiceLink}
      }
    }catch(x){if(status)status.textContent=x.message;toast(x.message)}
  }

  async function generateTts(){
    var text=(q('ttsText')&&q('ttsText').value.trim())||'';
    if(!text)return toast('Type text first');
    if(text.length>1000){setLimitSheet(true);return}
    try{
      var r=await fetch('/app/api/tts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:text,voice:selectedVoice})});
      if(!r.ok)throw new Error('TTS API is not ready yet');
      var blob=await r.blob();
      var url=URL.createObjectURL(blob);
      q('ttsAudio').src=url;
      q('wavePlayer').classList.add('show');
      toast('Voice generated');
    }catch(x){q('wavePlayer').classList.add('show');toast(x.message)}
  }

  function playTts(){var a=q('ttsAudio');if(!a||!a.src)return toast('Generate voice first');if(a.paused){a.play();setText('wavePlay','Pause')}else{a.pause();setText('wavePlay','Play')}}
  function saveUser(){ownerId=(q('ownerId')&&q('ownerId').value.trim())||ownerId;localStorage.setItem('ownerId',ownerId);userLine()}

  document.body.addEventListener('focusin',function(ev){if(ev.target&&ev.target.id==='ttsText')setKeyboardOpen(true)});
  document.body.addEventListener('focusout',function(ev){if(ev.target&&ev.target.id==='ttsText')setTimeout(function(){if(document.activeElement!==q('ttsText'))setKeyboardOpen(false)},80)});

  document.body.addEventListener('click',function(ev){
    var target=ev.target;
    var b=target&&target.closest?target.closest('button'):null;
    if(!b){var w=q('voiceWrap');if(w)w.classList.remove('open');return}
    var v=b.getAttribute('data-view');if(v){show(v);return}
    var stars=b.getAttribute('data-stars-deposit');if(stars){depositStars(stars);return}
    var voice=b.getAttribute('data-voice');if(voice){setVoice(voice,b.textContent||voice);return}
    var a=b.getAttribute('data-action');
    if(a==='open-deposit'){setDepositSheet(true);return}
    if(a==='close-deposit'){setDepositSheet(false);return}
    if(a==='deposit-custom-stars'){depositStars(q('starsAmount')&&q('starsAmount').value);return}
    if(a==='deposit-custom-stars-sheet'){depositStars(q('starsAmountSheet')&&q('starsAmountSheet').value);return}
    if(a==='open-char-limit'){setLimitSheet(true);return}
    if(a==='close-char-limit'){setLimitSheet(false);return}
    if(a==='dismiss-keyboard'){dismissKeyboard();return}
    if(a==='toggle-voice'){q('voiceWrap').classList.toggle('open');return}
    if(a==='generate-tts')generateTts();
    if(a==='play-tts')playTts();
    if(a==='save-user')saveUser();
  });

  if(q('ttsText'))q('ttsText').addEventListener('input',updateTtsCharCount);
  if(q('ownerId'))q('ownerId').value=ownerId;
  setText('brandTitle',sectionTitles.home);
  userLine();
  updateTtsCharCount();
})();
`;