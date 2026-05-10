export const MINIAPP_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  if(tg){try{tg.ready();tg.expand()}catch(e){}}

  var ownerId=localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'');
  var bots=[];
  var selectedBot=null;
  var selectedVoice='TX3LPaxmHKxFdv7VOQHJ';
  var sectionTitles={home:'Home',connect:'Connect',results:'Bot Control',playzone:'Play Zone',flow:'Text To Speech',mines:'Mines',plinko:'Plinko',crash:'Crash',wheel:'Wheel',dice:'Dice',limbo:'Limbo',tower:'Tower',coinflip:'Coin Flip',hilo:'Hi-Lo'};

  function q(id){return document.getElementById(id)}
  function clean(v){return String(v||'').replace(/[^0-9A-Za-z:_-]/g,'').replace(/：/g,':').trim()}
  function setText(id,v){var n=q(id);if(n)n.textContent=v}
  function toast(v){var n=q('toast');if(!n)return;n.textContent=v;n.style.display='block';setTimeout(function(){n.style.display='none'},3000)}
  function esc(v){return String(v||'').replace(/[&<>']/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;'}[s]||s})}
  function initials(v){v=String(v||'B').replace(/@/g,'').trim();return (v.match(/[A-Za-z0-9]/g)||['B']).slice(0,2).join('').toUpperCase()}
  function fallbackAvatar(b){return '<div class="avatar-fallback"><span>'+esc(initials(b.username||b.title||b.id))+'</span></div>'}
  function avatarImg(b){var username=b.username||'';if(!username)return fallbackAvatar(b);var src='https://t.me/i/userpic/320/'+encodeURIComponent(username)+'.jpg';return '<img class="avatar" src="'+src+'" alt="" referrerpolicy="no-referrer"/>'}
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
    loadBots(false);
  }

  async function api(path,opt){
    opt=opt||{};
    var r=await fetch(path,Object.assign({},opt,{headers:Object.assign({'content-type':'application/json'},opt.headers||{})}));
    var j=await r.json().catch(function(){return{error:'Invalid response'}});
    if(!r.ok)throw new Error(j.error||'Request failed');
    return j;
  }

  function userLine(){var n=q('userLine');if(!n)return;n.innerHTML='<span style="display:block;color:#fff;font-weight:800;font-size:12px;line-height:1">Level 1 <span style="color:rgba(255,255,255,.55);font-weight:700">• 42%</span></span><span style="display:block;width:158px;height:6px;margin-top:6px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden"><span style="display:block;width:42%;height:100%;border-radius:999px;background:linear-gradient(90deg,#5b0f24,#8f1d3d,#c03a5b);box-shadow:0 0 14px rgba(192,58,91,.48)"></span></span><span style="display:block;margin-top:5px;color:rgba(255,255,255,.5);font-size:9.5px;line-height:1">580 XP left to finish</span>'}
  function row(b){var img=avatarImg(b);return '<button class="bot-row" data-bot-id="'+esc(b.id)+'">'+img+'<div><strong>'+esc(b.title)+'</strong><small>'+(b.username?'@'+esc(b.username):esc(b.id))+'</small></div><span class="pill">'+esc(b.status)+'</span></button>'}
  function render(){
    var html=bots.length?bots.map(row).join(''):'<div class="notice">No bots yet. Connect your bot first.</div>';
    if(q('botsList'))q('botsList').innerHTML=html;
    if(q('homeBots'))q('homeBots').innerHTML=html;
    setText('statBots',String(bots.length));
    setText('statActive',String(bots.filter(function(b){return b.status==='active'}).length));
    setText('statPaused',String(bots.filter(function(b){return b.status==='paused'}).length));
    if(q('botSelect'))q('botSelect').innerHTML=bots.length?bots.map(function(b){return '<option value="'+esc(b.id)+'">'+esc(b.title)+'</option>'}).join(''):'<option value="">No bots</option>';
    if(bots[0]&&!selectedBot)selectBot(bots[0].id);
  }

  async function loadBots(force){
    if(!ownerId){render();return}
    if(bots.length&&!force){render();return}
    try{var d=await api('/app/api/bots?ownerId='+encodeURIComponent(ownerId));bots=d.bots||[];render()}catch(x){render();toast(x.message)}
  }

  async function createBot(){
    var input=q('botKey');
    var key=clean(input&&input.value);
    if(input)input.value=key;
    if(!ownerId)return toast('Set Telegram user first');
    if(key.indexOf(':')<1)return toast('Paste the full BotFather key.');
    try{
      setText('builderStatus','Checking');
      var body={ownerTelegramId:ownerId,prompt:'VexaFlow bot'};
      body['telegram'+'Token']=key;
      var d=await api('/app/api/bots',{method:'POST',body:JSON.stringify(body)});
      if(input)input.value='';
      bots=[];
      await loadBots(true);
      await selectBot(d.botId);
      show('flow');
      toast('Bot connected');
    }catch(x){setText('builderStatus','Failed');toast(x.message)}
  }

  async function selectBot(id){
    if(!id)return;
    try{
      var d=await api('/app/api/bots/'+encodeURIComponent(id));
      selectedBot=d;
      setText('activeBotLabel',d.username?'@'+d.username:d.title);
      if(q('botInfo'))q('botInfo').innerHTML='<b>'+esc(d.title)+'</b><br>Status: '+esc(d.status);
      setText('pauseBtn',d.status==='active'?'Pause':'Activate');
      if(q('botSelect'))q('botSelect').value=id;
    }catch(x){toast(x.message)}
  }

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
    if(status)status.textContent='Creating secure Telegram invoice...';
    try{
      var d=await api('/app/api/stars/deposits',{method:'POST',body:JSON.stringify({userId:ownerId,stars:amount})});
      if(status)status.textContent='Opening Telegram Stars payment...';
      if(d.invoiceLink){
        if(tg&&typeof tg.openInvoice==='function'){
          tg.openInvoice(d.invoiceLink,function(state){
            if(status)status.textContent=state==='paid'?'Payment received. Balance will update shortly.':'Payment status: '+state;
            if(state==='paid'&&window.VexaTonBalance&&window.VexaTonBalance.load)setTimeout(function(){window.VexaTonBalance.load()},900);
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

  function playTts(){var a=q('ttsAudio');if(!a||!a.src)return toast('Generate voice first');if(a.paused){a.play();setText('wavePlay','❚❚')}else{a.pause();setText('wavePlay','▶')}}
  async function publishBot(){if(!selectedBot)return toast('Select a bot first');try{var d=await api('/app/api/bots/'+encodeURIComponent(selectedBot.id)+'/publish',{method:'POST'});toast('Published');bots=[];await loadBots(true);await selectBot(d.botId)}catch(x){toast(x.message)}}
  async function togglePause(){if(!selectedBot)return toast('Select a bot first');var status=selectedBot.status==='active'?'paused':'active';try{var d=await api('/app/api/bots/'+encodeURIComponent(selectedBot.id)+'/status',{method:'PATCH',body:JSON.stringify({status:status})});toast(status==='active'?'Activated':'Paused');bots=[];await loadBots(true);await selectBot(d.botId)}catch(x){toast(x.message)}}
  async function deleteBot(){if(!selectedBot)return toast('Select a bot first');if(!confirm('Delete this bot?'))return;try{await api('/app/api/bots/'+encodeURIComponent(selectedBot.id),{method:'DELETE'});selectedBot=null;bots=[];await loadBots(true);toast('Bot deleted')}catch(x){toast(x.message)}}
  function saveUser(){ownerId=(q('ownerId')&&q('ownerId').value.trim())||ownerId;localStorage.setItem('ownerId',ownerId);userLine();loadBots(true)}

  document.body.addEventListener('focusin',function(ev){if(ev.target&&ev.target.id==='ttsText')setKeyboardOpen(true)});
  document.body.addEventListener('focusout',function(ev){if(ev.target&&ev.target.id==='ttsText')setTimeout(function(){if(document.activeElement!==q('ttsText'))setKeyboardOpen(false)},80)});

  document.body.addEventListener('click',function(ev){
    var b=ev.target.closest('button');
    if(!b){var w=q('voiceWrap');if(w)w.classList.remove('open');return}
    var v=b.getAttribute('data-view');if(v){show(v);return}
    var id=b.getAttribute('data-bot-id');if(id){selectBot(id);show('results');return}
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
    if(a==='create-bot')createBot();
    if(a==='generate-tts')generateTts();
    if(a==='play-tts')playTts();
    if(a==='refresh')loadBots(true);
    if(a==='publish')publishBot();
    if(a==='toggle-pause')togglePause();
    if(a==='delete')deleteBot();
    if(a==='save-user')saveUser();
  });

  if(q('botKey'))q('botKey').addEventListener('input',function(){var k=clean(q('botKey').value);if(q('botKey').value!==k)q('botKey').value=k});
  if(q('ttsText'))q('ttsText').addEventListener('input',updateTtsCharCount);
  if(q('botSelect'))q('botSelect').addEventListener('change',function(){selectBot(this.value)});
  if(q('ownerId'))q('ownerId').value=ownerId;
  setText('brandTitle',sectionTitles.home);
  userLine();
  updateTtsCharCount();
  loadBots(true);
})();
`;
