export const MINES_SCRIPT = `
(function(){
  var size=25;
  var NANO=1000000000;
  var audioCtx=null;
  var toastTimer=null;
  var statusTimer=null;
  var statusMessage='';
  var statusUntil=0;
  var lastMultiplierText='1.00x';
  var friendMode=false;
  var friendState=null;
  var friendBusy=false;
  var friendSyncing=false;
  var friendSyncQueued=false;
  var friendLastSyncAt=0;
  var friendCreditBlocked=false;
  var lastFriendMessage='';
  var tileImages={safe:'/app/api/uploaded-image/mines-safe.png',bomb:'/app/api/uploaded-image/mines-bomb.png'};
  var state={active:false,ended:false,amountNano:10000000,mines:3,revealed:0,bombs:{},safe:{},multiplier:1};
  var xpRoundActive=false;
  var xpRoundFinished=false;
  function q(id){return document.getElementById(id)}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function toNano(value){return Math.max(0,Math.floor((Number(String(value||'').replace(',','.'))||0)*NANO))}
  function fromNano(value){var ton=Math.max(0,Math.floor(Number(value)||0))/NANO;return ton.toFixed(2)}
  function preload(url){if(!url)return;var img=new Image();img.decoding='async';img.src=url;if(img.decode)img.decode().catch(function(){})}
  function imageEl(kind){var img=document.createElement('img');img.decoding='async';img.loading='eager';img.alt=kind==='bomb'?'Mine':'Safe';img.src=kind==='bomb'?tileImages.bomb:tileImages.safe;img.onerror=function(){img.remove()};return img}
  function applyImages(data){if(!data)return;if(data.minesSafeUrl)tileImages.safe=data.minesSafeUrl;if(data.minesBombUrl)tileImages.bomb=data.minesBombUrl;preload(tileImages.safe);preload(tileImages.bomb);primeBoardImages()}
  function loadImages(){
    var cached=window.VexaUploadedImages&&window.VexaUploadedImages.read?window.VexaUploadedImages.read():null;
    if(cached)applyImages(cached);else{preload(tileImages.safe);preload(tileImages.bomb);primeBoardImages()}
    if(window.VexaUploadedImages&&window.VexaUploadedImages.load){window.VexaUploadedImages.load().then(applyImages).catch(function(){})}
  }
  function tone(freq,duration,type,gain){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();var osc=audioCtx.createOscillator();var vol=audioCtx.createGain();osc.type=type||'sine';osc.frequency.value=freq;vol.gain.value=0.0001;osc.connect(vol);vol.connect(audioCtx.destination);var now=audioCtx.currentTime;vol.gain.exponentialRampToValueAtTime(gain||0.035,now+0.012);vol.gain.exponentialRampToValueAtTime(0.0001,now+duration);osc.start(now);osc.stop(now+duration+0.02)}catch(e){}}
  function sound(name){if(name==='start'){tone(240,.09,'sine',.026);setTimeout(function(){tone(360,.11,'sine',.026)},55)}else if(name==='safe'){tone(520,.075,'triangle',.022);setTimeout(function(){tone(720,.08,'triangle',.018)},38)}else if(name==='mine'){tone(120,.18,'sawtooth',.026);setTimeout(function(){tone(72,.24,'sine',.022)},70)}else if(name==='cash'){tone(620,.08,'triangle',.025);setTimeout(function(){tone(880,.1,'triangle',.022)},55);setTimeout(function(){tone(1180,.12,'sine',.018)},120)}}
  function readTonBalance(){return window.VexaTonBalance?Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0)):0}
  function addTonDelta(deltaNano){if(window.VexaTonBalance)window.VexaTonBalance.add(Math.floor(Number(deltaNano)||0),'mines')}
  function addGameXp(amount,source,metadata){
    if(!window.VexaLevel||typeof window.VexaLevel.add!=='function')return;
    window.VexaLevel.add(amount,source,Object.assign({game:'mines'},metadata||{}));
  }
  function friendPointKey(kind,roomId){return 'minesFriend:'+kind+':'+String(roomId||'')}
  function getFriendAmount(room){return Math.max(1,Math.floor(Number(room&&room.amountNano)||Number(state.amountNano)||10000000))}
  function hasFriendRoundPoints(room){return Boolean(room&&room.id&&localStorage.getItem(friendPointKey('joined',room.id)))||readTonBalance()>=getFriendAmount(room)}
  function friendRoundResult(data){var room=data&&data.room||{};var board=data&&data.board||{};var revealed=board.revealed||[];var result={winnerRole:room.winnerRole||null,isDraw:Boolean(room.isDraw)};if(result.winnerRole||result.isDraw)return result;var last=revealed[revealed.length-1];if(last&&last.result==='hidden'&&last.byRole){result.winnerRole=last.byRole==='host'?'guest':'host';return result}var hostSafe=0,guestSafe=0;revealed.forEach(function(item){if(item.result==='safe'&&item.byRole==='host')hostSafe++;if(item.result==='safe'&&item.byRole==='guest')guestSafe++});if(hostSafe===guestSafe)result.isDraw=true;else result.winnerRole=hostSafe>guestSafe?'host':'guest';return result}
  function applyFriendPointFlow(data){var room=data&&data.room;var player=data&&data.player||{};if(!room||!room.id||!room.hasGuest)return;var amount=getFriendAmount(room);var joinedKey=friendPointKey('joined',room.id);if((room.status==='active'||room.status==='finished')&&!localStorage.getItem(joinedKey)){if(readTonBalance()<amount){friendCreditBlocked=true;setFriendStatus('You need more points for this friend round');return}friendCreditBlocked=false;addTonDelta(-amount);localStorage.setItem(joinedKey,'1');setFriendStatus('Round points reserved')}if(room.status!=='finished')return;var settledKey=friendPointKey('settled',room.id);if(localStorage.getItem(settledKey))return;var result=friendRoundResult(data);if(result.isDraw){addTonDelta(amount);localStorage.setItem(settledKey,'draw');setFriendStatus('Draw — points returned');return}if(result.winnerRole&&result.winnerRole===player.role){addTonDelta(amount*2);localStorage.setItem(settledKey,'win');setFriendStatus('You finished first — points are yours');return}localStorage.setItem(settledKey,'done');setFriendStatus('Friend finished first — points are theirs')}
  function calcMultiplier(){var safeLeft=size-state.mines-state.revealed;var totalLeft=size-state.revealed;if(totalLeft<=0||safeLeft<=0)return state.multiplier;var edge=.96;var chance=safeLeft/totalLeft;state.multiplier=Math.max(1,state.multiplier*(1/chance)*edge);return state.multiplier}
  function hideOldNotice(){var old=q('minesFriendNotice')||q('minesToast');if(old){old.style.setProperty('display','none','important');old.style.setProperty('opacity','0','important')}}
  function currentMultiplierText(){return state.multiplier.toFixed(2)+'x'}
  function applyDisplayText(text,isStatus){var mx=q('minesMultiplier');if(!mx)return;hideOldNotice();text=String(text||currentMultiplierText());mx.classList.toggle('mines-status-label',!!isStatus);if(mx.textContent!==text){mx.classList.remove('mines-status-fade');void mx.offsetWidth;mx.classList.add('mines-status-fade');setTimeout(function(){mx.textContent=text;mx.classList.remove('mines-status-fade')},140)}}
  function setStatus(text){text=String(text||'').trim();if(!text)return;statusMessage=text;statusUntil=Date.now()+2300;clearTimeout(statusTimer);applyDisplayText(statusMessage,true);statusTimer=setTimeout(function(){statusMessage='';setMultiplierText()},2350)}
  function setFriendStatus(text){text=text||'';var el=q('minesFriendStatus');if(el)el.textContent=text;if(text&&text!==lastFriendMessage)setStatus(text);lastFriendMessage=text}
  function setMultiplierText(){var mx=q('minesMultiplier');if(!mx)return;var showStatus=statusMessage&&Date.now()<statusUntil;var next=showStatus?statusMessage:currentMultiplierText();if(!showStatus)lastMultiplierText=next;applyDisplayText(next,showStatus);var view=q('mines');if(view){view.classList.toggle('playing',state.active||friendMode);view.classList.toggle('is-friend-mode',friendMode)}}
  function setBetNano(nano){var amount=q('minesBet');state.amountNano=clamp(Math.floor(Number(nano)||0),1,999999999999999);if(amount)amount.value=fromNano(state.amountNano);setMultiplierText()}
  function refresh(){var amount=q('minesBet');var count=q('minesCount');if(!friendMode){state.amountNano=clamp(toNano(amount&&amount.value),1,999999999999999);state.mines=clamp(Math.floor(Number(count&&count.value)||3),1,20)}if(amount){amount.setAttribute('step','0.01');amount.value=fromNano(state.amountNano);amount.disabled=friendMode}if(count)count.disabled=friendMode;setMultiplierText();var start=q('minesStart');if(start){start.textContent=friendMode?'Friend Round':state.active?'Playing':'Start Round';start.disabled=friendMode}var cash=q('minesCashout');if(cash)cash.disabled=friendMode||!state.active||state.revealed<1;var invite=q('minesInviteFriend');if(invite)invite.disabled=friendBusy;var exit=q('minesFriendExit');if(exit)exit.style.display=friendMode?'block':'none'}
  function tileKind(i){return state.active||state.ended?state.bombs[i]?'bomb':'safe':'safe'}
  function setTileBack(tile,kind){var back=tile&&tile.querySelector&&tile.querySelector('.mine-tile-back');if(!back||back.getAttribute('data-kind')===kind)return;back.setAttribute('data-kind',kind);back.textContent='';back.appendChild(imageEl(kind))}
  function primeBoardImages(){document.querySelectorAll('[data-mine-cell]').forEach(function(tile){var i=Number(tile.getAttribute('data-mine-cell'));setTileBack(tile,tileKind(i))})}
  function buildBoard(){var board=q('minesBoard');if(!board)return;board.innerHTML='';var frag=document.createDocumentFragment();for(var i=0;i<size;i++){var b=document.createElement('button');var card=document.createElement('span');var front=document.createElement('span');var back=document.createElement('span');b.type='button';b.className='mine-tile';b.setAttribute('data-mine-cell',String(i));b.setAttribute('aria-label','Hidden tile');card.className='mine-tile-card';front.className='mine-tile-face mine-tile-front';back.className='mine-tile-face mine-tile-back';card.appendChild(front);card.appendChild(back);b.appendChild(card);setTileBack(b,tileKind(i));frag.appendChild(b)}board.appendChild(frag)}
  function placeBombs(){state.bombs={};var picked=0;while(picked<state.mines){var n=Math.floor(Math.random()*size);if(!state.bombs[n]){state.bombs[n]=true;picked++}}}
  function revealTile(tile,kind){if(!tile||tile.classList.contains('revealed'))return;setTileBack(tile,kind);tile.disabled=true;tile.setAttribute('aria-label',kind==='bomb'?'Mine tile':'Safe tile');tile.classList.add('revealed',kind==='bomb'?'bomb':'safe')}
  function revealAll(){document.querySelectorAll('[data-mine-cell]').forEach(function(tile){var i=Number(tile.getAttribute('data-mine-cell'));revealTile(tile,state.bombs[i]?'bomb':'safe')})}
  function revealMines(){document.querySelectorAll('[data-mine-cell]').forEach(function(tile){var i=Number(tile.getAttribute('data-mine-cell'));if(state.bombs[i])revealTile(tile,'bomb');else tile.disabled=true})}
  function start(){
    refresh();
    if(friendMode||state.active)return;
    var balance=readTonBalance();
    if(balance<state.amountNano){setStatus('Not enough points');return}
    sound('start');
    state.active=true;
    state.ended=false;
    state.revealed=0;
    state.bombs={};
    state.safe={};
    state.multiplier=1;
    addTonDelta(-state.amountNano);
    placeBombs();
    buildBoard();
    xpRoundActive=true;
    xpRoundFinished=false;
    addGameXp(2,'game-start',{action:'start'});
    setStatus('Choose a safe tile');
    refresh();
  }
  function cashout(){
    if(friendMode||!state.active||state.revealed<1)return;
    var resultNano=Math.max(0,Math.floor(state.amountNano*state.multiplier));
    sound('cash');
    state.active=false;
    state.ended=true;
    addTonDelta(resultNano);
    revealAll();
    if(xpRoundActive&&!xpRoundFinished){
      xpRoundFinished=true;
      addGameXp(state.multiplier<2?15:25,'game-win',{result:'cashout',multiplier:Number(state.multiplier.toFixed(2))});
    }
    setStatus('Result +' + fromNano(resultNano));
    refresh();
  }
  function hit(cell){
    if(friendMode){friendHit(cell);return}
    if(!state.active||state.ended)return;
    var i=Number(cell.getAttribute('data-mine-cell'));
    if(!Number.isFinite(i)||state.safe[i]||cell.classList.contains('revealed'))return;
    if(window.VexaGameChance&&typeof window.VexaGameChance.decideWin==='function'){var wantSafe=window.VexaGameChance.decideWin();if(wantSafe===null||wantSafe===undefined)wantSafe=state.bombs[i]?false:true;if(wantSafe&&state.bombs[i]){delete state.bombs[i];var repl=0;while(repl<size&&(state.safe[repl]||repl===i||state.bombs[repl]))repl++;if(repl<size)state.bombs[repl]=true}else if(!wantSafe&&!state.bombs[i]){state.bombs[i]=true}}
    if(state.bombs[i]){
      sound('mine');
      state.active=false;
      state.ended=true;
      revealMines();
      if(xpRoundActive&&!xpRoundFinished){
        xpRoundFinished=true;
        addGameXp(5,'game-lose',{result:'mine'});
      }
      setStatus('Hidden tile found');
      refresh();
      return;
    }
    sound('safe');
    state.safe[i]=true;
    state.revealed++;
    revealTile(cell,'safe');
    addGameXp(1,'game-action',{action:'safe-tile',revealed:state.revealed});
    calcMultiplier();
    if(state.revealed>=size-state.mines){cashout();return}
    refresh();
  }
  function tg(){return window.Telegram&&window.Telegram.WebApp}
  function user(){var t=tg();var u=(t&&t.initDataUnsafe&&t.initDataUnsafe.user)||{};var id=String(u.id||localStorage.getItem('ownerId')||'').replace(/[^0-9A-Za-z_-]/g,'').slice(0,80);if(!id){id=localStorage.getItem('minesFriendUserId')||('local_'+Math.random().toString(36).slice(2)+Date.now().toString(36));localStorage.setItem('minesFriendUserId',id)}var name=String(u.first_name||u.username||localStorage.getItem('ownerName')||'Player').replace(/[<>]/g,'').slice(0,80);return{id:id,name:name||'Player'}}
  function api(path,opt){return fetch(path,Object.assign({credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json'}},opt||{})).then(function(r){return r.json().catch(function(){return{error:'Invalid response'}}).then(function(j){if(!r.ok)throw new Error(j.error||'Request failed');return j})})}
  function minesStartParam(roomId){return 'minesroom_'+String(roomId||'').replace(/[^0-9A-Za-z_-]/g,'').slice(0,80)}
  function inviteUrl(roomId){var url=new URL(location.href);url.searchParams.set('minesRoom',roomId);url.searchParams.set('startapp',minesStartParam(roomId));url.searchParams.delete('open');return url.toString()}
  function shareFallback(link,text){var share='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent(text||'Join my friend round in Vexa.');var t=tg();try{if(t&&typeof t.openTelegramLink==='function'){t.openTelegramLink(share);return true}}catch(e){}try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(link);setFriendStatus('Invite link copied');return true}}catch(e){}var field=q('minesFriendLink');if(field){field.value=link;field.select();document.execCommand&&document.execCommand('copy');setFriendStatus('Invite link copied');return true}return false}
  function showMinesFromInvite(){document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});var root=q('mines');if(root)root.classList.add('active');document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')==='mines')});var title=document.getElementById('brandTitle');if(title)title.textContent='Mines'}
  function enterFriendMode(data){lastFriendMessage='';friendMode=true;friendState=data||friendState;friendCreditBlocked=false;state.active=false;state.ended=false;state.bombs={};state.safe={};state.revealed=0;state.multiplier=1;renderFriendState(data);requestFriendSync(true);refresh()}
  function leaveFriendMode(message){lastFriendMessage='';friendMode=false;friendState=null;friendBusy=false;friendCreditBlocked=false;stopPolling();state.bombs={};state.safe={};state.revealed=0;state.multiplier=1;buildBoard();setFriendStatus(message||'');refresh()}
  function friendCanPick(){var room=friendState&&friendState.room;return friendMode&&!friendBusy&&!friendCreditBlocked&&room&&room.status==='active'&&room.hasGuest&&room.isYourTurn&&friendState.youHavePoints!==false&&friendState.friendHasPoints!==false}
  function renderFriendResult(data){var room=data&&data.room||{};var player=data&&data.player||{};var result=friendRoundResult(data);if(result.isDraw)return 'Draw — points returned';if(result.winnerRole&&result.winnerRole===player.role)return 'You finished first — points are yours';if(result.winnerRole)return 'Friend finished first — points are theirs';if(room.finishedReason==='returned')return 'Points returned';return 'Round complete'}
  function renderFriendState(data){if(!data||!data.room){refresh();return}friendState=data;var room=data.room,board=data.board||{};if(room.status==='expired'||(data.player&&data.player.role==='spectator')){leaveFriendMode(room.status==='expired'?'Room expired':'Could not join room');return}var field=q('minesFriendLink');if(field)field.value=inviteUrl(room.id);state.amountNano=Number(room.amountNano||state.amountNano||10000000);state.mines=Number(room.mineCount||3);friendCreditBlocked=data.youHavePoints===false;applyFriendPointFlow(data);state.bombs={};state.safe={};state.revealed=0;document.querySelectorAll('[data-mine-cell]').forEach(function(tile){tile.disabled=true;tile.classList.remove('revealed','safe','bomb');tile.setAttribute('aria-label','Hidden tile');setTileBack(tile,'safe')});(board.revealed||[]).forEach(function(item){var tile=document.querySelector('[data-mine-cell="'+item.cell+'"]');if(item.result==='safe'){state.safe[item.cell]=true;state.revealed++;revealTile(tile,'safe')}else revealTile(tile,'bomb')});if(room.status==='finished'||room.status==='expired'){(board.hiddenCells||[]).forEach(function(cell){var tile=document.querySelector('[data-mine-cell="'+cell+'"]');revealTile(tile,'bomb')})}else if(friendCanPick()){document.querySelectorAll('[data-mine-cell]').forEach(function(tile){if(!tile.classList.contains('revealed'))tile.disabled=false})}var msg='';if(room.status==='finished')msg=renderFriendResult(data);else if(data.youHavePoints===false||friendCreditBlocked)msg='You need more points for this friend round';else if(data.friendHasPoints===false)msg='Friend needs more points for this friend round';else if(room.status==='active'&&room.isYourTurn)msg='Your turn';else if(room.status==='active')msg='Friend turn';else if(room.hasGuest)msg='Friend joined';setFriendStatus(msg);refresh()}
  function sendFriendReady(data){var room=data&&data.room;if(!friendMode||!room||!room.id)return Promise.resolve(data);var u=user();var hasPoints=hasFriendRoundPoints(room);return api('/app/api/mines/friend/rooms/'+encodeURIComponent(room.id)+'/ready',{method:'POST',body:JSON.stringify({userId:u.id,name:u.name,hasPoints:hasPoints,amountNano:getFriendAmount(room)})}).catch(function(){return data})}
  function syncFriend(){if(!friendMode||!friendState||!friendState.room||!q('mines')||!q('mines').classList.contains('active'))return Promise.resolve();var u=user();return api('/app/api/mines/friend/rooms/'+encodeURIComponent(friendState.room.id)+'?userId='+encodeURIComponent(u.id)).then(sendFriendReady).then(renderFriendState).catch(function(e){leaveFriendMode(e.message||'Sync failed')})}
  function requestFriendSync(force){if(!friendMode||!friendState||!friendState.room)return Promise.resolve();var now=Date.now();if(!force&&now-friendLastSyncAt<1200)return Promise.resolve();if(friendSyncing){friendSyncQueued=Boolean(force||friendSyncQueued);return Promise.resolve()}friendSyncing=true;friendLastSyncAt=now;return syncFriend().finally(function(){friendSyncing=false;if(friendSyncQueued){friendSyncQueued=false;requestFriendSync(true)}})}
  function startPolling(){requestFriendSync(true)}
  function stopPolling(){friendSyncing=false;friendSyncQueued=false;friendLastSyncAt=0}
  function shareInvite(){if(!friendState||!friendState.room)return;var roomId=friendState.room.id;var link=inviteUrl(roomId);var text='Join my friend round in Vexa.';var field=q('minesFriendLink');if(field)field.value=link;setFriendStatus('Preparing invite...');var u=user();api('/app/api/mines/friend/rooms/'+encodeURIComponent(roomId)+'/share',{method:'POST',body:JSON.stringify({userId:u.id,name:u.name})}).then(function(data){var invite=data.inviteUrl||link;if(field)field.value=invite;var t=tg();if(data.preparedMessageId&&t&&typeof t.shareMessage==='function'){try{var sent=t.shareMessage(data.preparedMessageId);if(sent&&typeof sent.then==='function')sent.catch(function(){shareFallback(invite,data.fallbackText||text)});setFriendStatus('Choose a chat to send the invite');return}catch(e){}}shareFallback(invite,data.fallbackText||text)}).catch(function(){shareFallback(link,text)}).finally(function(){requestFriendSync(true)})}
  function createFriendRoom(){if(friendBusy)return;refresh();if(readTonBalance()<state.amountNano){setFriendStatus('You need more points for this friend round');return}friendBusy=true;setFriendStatus('Creating friend room...');var u=user();api('/app/api/mines/friend/rooms',{method:'POST',body:JSON.stringify({userId:u.id,name:u.name,amountNano:state.amountNano,mineCount:state.mines})}).then(function(data){enterFriendMode(data);shareInvite()}).catch(function(e){leaveFriendMode(e.message||'Could not create room')}).finally(function(){friendBusy=false;refresh()})}
  function joinFriendRoom(roomId){if(friendBusy||!roomId)return;friendBusy=true;setFriendStatus('Joining friend room...');var u=user();api('/app/api/mines/friend/rooms/'+encodeURIComponent(roomId)+'/join',{method:'POST',body:JSON.stringify({userId:u.id,name:u.name})}).then(enterFriendMode).catch(function(e){leaveFriendMode((e.message||'Could not join room'))}).finally(function(){friendBusy=false;refresh()})}
  function friendHit(cell){if(!friendCanPick())return;var i=Number(cell.getAttribute('data-mine-cell'));if(!Number.isInteger(i))return;friendBusy=true;cell.disabled=true;setFriendStatus('Friend turn');var u=user();api('/app/api/mines/friend/rooms/'+encodeURIComponent(friendState.room.id)+'/reveal',{method:'POST',body:JSON.stringify({userId:u.id,name:u.name,cell:i})}).then(function(data){var before=friendState&&friendState.board&&friendState.board.revealed?friendState.board.revealed.length:0;var result='safe';if(data&&data.board&&data.board.revealed){var latest=data.board.revealed[data.board.revealed.length-1];if(latest&&latest.result==='hidden')result='mine'}renderFriendState(data);requestFriendSync(true);var after=data&&data.board&&data.board.revealed?data.board.revealed.length:before;if(after>before)sound(result)}).catch(function(e){setFriendStatus(e.message||'Could not select tile');requestFriendSync(true)}).finally(function(){friendBusy=false;refresh()})}
  function startRoomFromParams(){var roomId='';try{var t=tg();var qs=new URLSearchParams(location.search);roomId=qs.get('minesRoom')||'';var start=(t&&t.initDataUnsafe&&t.initDataUnsafe.start_param)||qs.get('startapp')||qs.get('tgWebAppStartParam')||'';if(!roomId&&start){start=String(start);if(start.indexOf('minesroom_')===0)roomId=start.slice(10);else if(start.indexOf('mines_')===0)roomId=start}}catch(e){}if(roomId){showMinesFromInvite();setTimeout(function(){joinFriendRoom(roomId)},120)}}
  function bind(){buildBoard();refresh();window.addEventListener('vexa-ton-balance-sync',refresh);window.addEventListener('vexa-mines-images-sync',function(ev){if(!ev||!ev.detail)return;applyImages({minesSafeUrl:ev.detail.safeUrl,minesBombUrl:ev.detail.bombUrl})});window.addEventListener('beforeunload',stopPolling);window.addEventListener('focus',function(){requestFriendSync(false)});document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')requestFriendSync(false)});if(window.MutationObserver)new MutationObserver(function(){if(friendMode&&q('mines')&&q('mines').classList.contains('active'))requestFriendSync(true)}).observe(q('mines'),{attributes:true,attributeFilter:['class']});var amount=q('minesBet');var count=q('minesCount');if(amount)amount.addEventListener('input',refresh);if(count)count.addEventListener('change',refresh);var invite=q('minesInviteFriend');if(invite)invite.addEventListener('click',function(){if(friendMode)shareInvite();else createFriendRoom()});var exit=q('minesFriendExit');if(exit)exit.addEventListener('click',function(){leaveFriendMode('Solo mode')});document.addEventListener('click',function(ev){var open=ev.target&&ev.target.closest&&ev.target.closest('[data-game-view="mines"],[data-view="mines"]');if(open){setTimeout(loadImages,120);setTimeout(function(){requestFriendSync(true)},140)}var quick=ev.target&&ev.target.closest&&ev.target.closest('[data-mines-action]');if(quick){if(friendMode)return;var action=quick.getAttribute('data-mines-action');tone(260,.045,'sine',.014);refresh();if(action==='bet-half')setBetNano(Math.max(1,Math.floor(state.amountNano/2)));else if(action==='bet-double')setBetNano(state.amountNano*2);refresh();return}var startBtn=ev.target&&ev.target.closest&&ev.target.closest('#minesStart');if(startBtn){loadImages();start();return}var cash=ev.target&&ev.target.closest&&ev.target.closest('#minesCashout');if(cash){cashout();return}var tile=ev.target&&ev.target.closest&&ev.target.closest('[data-mine-cell]');if(tile){if(friendMode)requestFriendSync(false);hit(tile)}});startRoomFromParams()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
