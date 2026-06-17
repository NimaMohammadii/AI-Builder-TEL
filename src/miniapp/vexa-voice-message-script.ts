export const VEXA_VOICE_MESSAGE_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var audio=null;
  var current=null;
  var busy=false;
  var queue=[];
  var lastLiveHit=0;
  var liveSource=null;

  function q(id){return document.getElementById(id)}
  function initData(){return tg&&tg.initData?tg.initData:''}

  function ensureUi(){
    if(q('vexaVoiceMessageToast'))return;
    var style=document.createElement('style');
    style.id='vexa-voice-message-style';
    style.textContent='.vexa-voice-message-toast{position:fixed;left:14px;bottom:102px;z-index:12000;display:none;align-items:center;gap:10px;max-width:min(360px,calc(100vw - 28px));padding:10px 12px;border-radius:20px;background:rgba(24,10,15,.88);color:#fff;border:1px solid rgba(255,255,255,.12);box-shadow:0 20px 58px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2)}.vexa-voice-message-toast.open{display:flex}.vexa-voice-message-avatar{width:34px;height:34px;min-width:34px;border-radius:999px;display:grid;place-items:center;background:linear-gradient(135deg,#5b0f24,#9f294b);box-shadow:inset 0 1px 0 rgba(255,255,255,.18);font-size:17px}.vexa-voice-message-copy{min-width:0;display:flex;flex-direction:column;gap:2px}.vexa-voice-message-copy strong{font-size:12.5px;line-height:1.1;font-weight:900;letter-spacing:-.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vexa-voice-message-copy span{font-size:10.5px;line-height:1.1;color:rgba(255,255,255,.58);font-weight:750}.vexa-voice-message-play{margin-left:auto;border:0;border-radius:999px;padding:9px 11px;background:rgba(255,255,255,.10);color:#fff;font-weight:900;font-size:11px;min-width:54px}';
    document.head.appendChild(style);
    var box=document.createElement('div');
    box.id='vexaVoiceMessageToast';
    box.className='vexa-voice-message-toast';
    box.innerHTML='<div class="vexa-voice-message-avatar">&#128064;</div><div class="vexa-voice-message-copy"><strong id="vexaVoiceMessageTitle">Vexa wants to say something</strong><span>Tap to play</span></div><button id="vexaVoiceMessagePlay" class="vexa-voice-message-play" type="button">Play</button>';
    document.body.appendChild(box);
    q('vexaVoiceMessagePlay').addEventListener('click',function(){if(current)playMessage(current,true)});
    audio=document.createElement('audio');
    audio.id='vexaVoiceMessageAudio';
    audio.preload='auto';
    audio.style.display='none';
    document.body.appendChild(audio);
    audio.addEventListener('ended',function(){if(current)markPlayed(current);hideToast();busy=false;current=null;playNext()});
    audio.addEventListener('error',function(){hideToast();busy=false;current=null;playNext()});
  }

  function showToast(message){
    ensureUi();
    current=message;
    var title=q('vexaVoiceMessageTitle');
    if(title)title.textContent=message.title||message.displayText||'Vexa wants to say something';
    q('vexaVoiceMessageToast').classList.add('open');
  }

  function hideToast(){var n=q('vexaVoiceMessageToast');if(n)n.classList.remove('open')}

  async function markPlayed(message){try{await fetch('/app/api/vexa-voice/played',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event:message.eventId,messageKey:message.messageKey,initData:initData()})})}catch(e){}}
  async function fetchMessage(eventId){var r=await fetch('/app/api/vexa-voice/message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event:eventId,initData:initData()}),cache:'no-store'});var j=await r.json().catch(function(){return{ok:false}});return j&&j.ok?j:null}
  function enqueue(message){if(!message||!message.url)return;queue.push(message);playNext()}
  function playNext(){if(busy||!queue.length)return;var message=queue.shift();busy=true;current=message;if(message.requiresTap){showToast(message);return}playMessage(message,false)}
  function playMessage(message,fromTap){ensureUi();current=message;audio.src=message.url;var p=audio.play();if(p&&typeof p.catch==='function'){p.then(function(){if(fromTap)hideToast()}).catch(function(){showToast(message)})}else if(fromTap){hideToast()}}
  async function trigger(eventId){try{var message=await fetchMessage(eventId);if(message)enqueue(message)}catch(e){}}

  function activeViewId(){var n=document.querySelector('.view.active');return n&&n.id||''}
  function triggerForView(id){if(id==='playzone')trigger('playzone_intro');if(id==='predictzone')trigger('predict_intro')}
  function watchClicks(){document.addEventListener('click',function(ev){var target=ev.target;var btn=target&&target.closest?target.closest('button'):null;if(!btn)return;var view=btn.getAttribute('data-view')||'';var action=btn.getAttribute('data-action')||'';if(view==='playzone'||view==='predictzone')setTimeout(function(){triggerForView(view)},320);if(action==='open-daily-guide')setTimeout(function(){trigger('daily_rewards_intro')},320)},true)}
  function watchFinanceSuccess(){var depositStatus=q('depositStatus');var withdrawSuccess=q('withdrawSuccess');if(depositStatus){new MutationObserver(function(){if(depositStatus.classList.contains('success')||/payment received/i.test(depositStatus.textContent||''))trigger('first_deposit')}).observe(depositStatus,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']})}if(withdrawSuccess){new MutationObserver(function(){if(withdrawSuccess.classList.contains('show')||withdrawSuccess.getAttribute('aria-hidden')==='false')trigger('first_withdraw')}).observe(withdrawSuccess,{attributes:true,attributeFilter:['class','aria-hidden']})}}

  function onLive(){var now=Date.now();if(now-lastLiveHit<1200)return;lastLiveHit=now;trigger('admin_message')}
  function connectLiveFallback(){
    if(liveSource||typeof EventSource==='undefined')return;
    try{
      liveSource=new EventSource('/app/api/section-lock-events');
      liveSource.addEventListener('locks',onLive);
      liveSource.onerror=function(){try{liveSource.close()}catch(e){}liveSource=null;setTimeout(connectLiveFallback,5000)};
    }catch(e){}
  }

  function boot(){
    ensureUi();
    watchClicks();
    watchFinanceSuccess();
    window.addEventListener('vexa-live-event',onLive);
    connectLiveFallback();
    window.VexaVoiceMessage={trigger:trigger,admin:function(){trigger('admin_message')}};
    setTimeout(function(){trigger('admin_message')},900);
    setTimeout(function(){triggerForView(activeViewId())},1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  document.addEventListener('visibilitychange',function(){if(!document.hidden)connectLiveFallback()});
})();
`;
