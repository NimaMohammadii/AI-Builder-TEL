export const RPS_SECTION = `
<section id="rps" class="view rps-view">
  <style>
    html:has(#rps.active),body:has(#rps.active){background:#000!important;background-color:#000!important;background-image:none!important}
    body:has(#rps.active)::before,body:has(#rps.active)::after,body:has(#rps.active) .app::before,body:has(#rps.active) .app::after{content:none!important;display:none!important;background:none!important;box-shadow:none!important}
    body:has(#rps.active) .tabs{display:none!important}
    body:has(#rps.active) .app,body:has(#rps.active) main.app,body:has(#rps.active) .content,body:has(#rps.active) .view.active,body:has(#rps.active) #rps,body:has(#rps.active) .rps-view,body:has(#rps.active) .top,body:has(#rps.active) header.top{background:#000!important;background-color:#000!important;background-image:none!important;box-shadow:none!important}
    .rps-view{min-height:100%;padding:4px 14px calc(104px + env(safe-area-inset-bottom));color:#fff;background:#000!important;overflow-y:auto!important;overflow-x:hidden;-webkit-overflow-scrolling:touch;box-sizing:border-box;scrollbar-width:none}
    .rps-view::-webkit-scrollbar{display:none}
    .rps-wrap{width:100%;max-width:560px;margin:0 auto;display:grid;gap:16px}
    .rps-title{display:none!important}
    .rps-multipliers{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;margin:2px -14px 10px;padding:2px 14px 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity}
    .rps-multipliers::-webkit-scrollbar{display:none}
    .rps-multiplier{flex:0 0 auto;height:34px;min-width:58px;padding:0 12px;border:0;border-radius:999px;display:grid;place-items:center;color:rgba(255,255,255,.58);font-size:12px;font-weight:950;letter-spacing:-.025em;background:rgba(255,255,255,.035);box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 10px 24px rgba(0,0,0,.22);-webkit-backdrop-filter:blur(8px) saturate(130%);backdrop-filter:blur(8px) saturate(130%);scroll-snap-align:center;transition:transform .18s ease,background .18s ease,color .18s ease}
    .rps-multiplier.is-active{color:#fff;background:linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,.035));box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 12px 28px rgba(0,0,0,.30);transform:scale(1.04)}
    .rps-arena{position:relative;min-height:520px;display:grid;grid-template-rows:auto auto 1fr auto;border:0!important;border-radius:0;background:transparent!important;box-shadow:none!important;overflow:visible!important;padding:8px 0 0}
    .rps-duel{display:grid;grid-template-columns:1fr 64px 1fr;align-items:center;gap:12px;margin:34px 0 22px}
    .rps-hand-card{height:168px;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;display:grid;place-items:center;gap:6px;overflow:visible!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
    .rps-hand-img{display:none;width:116px;height:116px;object-fit:contain;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;filter:drop-shadow(0 18px 28px rgba(0,0,0,.46));pointer-events:none;--rps-hand-angle:90deg;--rps-hand-drop-start:-90deg;--rps-hand-drop-overshoot:5deg;transform:rotate(var(--rps-hand-angle));transform-origin:center;transition:transform 1.15s cubic-bezier(.18,.82,.22,1);will-change:transform}
    [data-rps-bot-img]{--rps-hand-angle:-90deg;--rps-hand-drop-start:90deg;--rps-hand-drop-overshoot:-5deg}
    .rps-choice .rps-hand-img{width:54px;height:54px;filter:none}
    .rps-hand-card.has-rps-image .rps-hand-img,.rps-choice.has-rps-image .rps-hand-img{display:block}
    .rps-hand-card small,.rps-choice span{color:rgba(255,255,255,.54);font-size:11px;font-weight:900}
    .rps-vs{width:auto!important;height:auto!important;border:0!important;background:transparent!important;box-shadow:none!important;display:grid;place-items:center;font-weight:950;color:#fff;font-size:18px;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
    .rps-result{min-height:30px;text-align:center;font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;font-size:17px;font-weight:850;letter-spacing:-.025em;color:rgba(255,255,255,.92);margin-bottom:8px}
    .rps-choices{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}
    .rps-choice{height:108px;border:0!important;border-radius:0!important;color:#fff;background:transparent!important;box-shadow:none!important;display:grid;place-items:center;gap:4px;font-weight:950;overflow:visible!important;transition:transform .18s cubic-bezier(.2,.9,.16,1),opacity .18s ease;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
    .rps-choice:active{transform:scale(.96)}
    .rps-choice.is-picked{opacity:1;transform:scale(1.04)}
    .rps-choice:not(.is-picked){opacity:.72}
    .rps-panel{position:relative;display:grid;gap:10px;border:0!important;border-radius:28px;padding:14px;background:linear-gradient(180deg,rgba(255,255,255,.026),rgba(255,255,255,.012));box-shadow:0 0 0 1px rgba(62,4,19,.10),0 0 22px rgba(54,3,17,.15),0 18px 46px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.045);-webkit-backdrop-filter:blur(18px) saturate(138%);backdrop-filter:blur(18px) saturate(138%);overflow:hidden}
    .rps-input-row{display:grid;grid-template-columns:1fr auto auto;gap:8px}
    .rps-input-row input,.rps-input-row button,.rps-stat{border:0!important;background:rgba(255,255,255,.04);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 12px 26px rgba(0,0,0,.22);-webkit-backdrop-filter:blur(12px) saturate(135%);backdrop-filter:blur(12px) saturate(135%)}
    .rps-input-row input,.rps-input-row button{height:50px;border-radius:18px;color:#fff;font-weight:950;outline:none}
    .rps-input-row input{padding:0 14px;font-size:18px}.rps-input-row button{min-width:58px;font-size:13px}
    .rps-play{height:60px;border:0;border-radius:999px;background:linear-gradient(180deg,#2b0310,#170107);color:rgba(255,255,255,.94);font-size:18px;font-weight:950;letter-spacing:-.045em;box-shadow:0 0 0 1px rgba(95,8,30,.10),0 0 18px rgba(70,4,22,.20),0 14px 30px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.07)}
    .rps-play:disabled{opacity:.58}
    .rps-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.rps-stat{border-radius:18px;padding:10px;text-align:center}.rps-stat small{display:block;color:rgba(255,255,255,.45);font-size:10px;font-weight:850}.rps-stat b{display:block;margin-top:4px;font-size:14px}
    .rps-hand-drop{animation:rpsHandDrop .92s cubic-bezier(.16,.86,.2,1) both}@keyframes rpsHandDrop{0%{opacity:0;transform:translateY(-74px) rotate(calc(var(--rps-hand-angle) + var(--rps-hand-drop-start))) scale(.88)}74%{opacity:1;transform:translateY(4px) rotate(calc(var(--rps-hand-angle) + var(--rps-hand-drop-overshoot))) scale(1.02)}100%{opacity:1;transform:translateY(0) rotate(var(--rps-hand-angle)) scale(1)}}
    @media(max-width:380px){.rps-arena{min-height:474px}.rps-duel{margin:26px 0 18px}.rps-hand-card{height:148px}.rps-hand-img{width:86px;height:86px}.rps-hand-card.has-rps-image .rps-hand-img{width:104px;height:104px}.rps-choice{height:94px}.rps-choice .rps-hand-img{width:48px;height:48px}}
  </style>
  <div class="rps-wrap">
    <div class="rps-arena">
      <div class="rps-title"><strong>Rock Paper Scissors</strong></div>
      <div class="rps-multipliers" data-rps-multipliers></div>
      <div class="rps-duel">
        <div class="rps-hand-card" data-rps-player-card><img class="rps-hand-img" data-rps-player-img alt=""/><small>You</small></div>
        <div class="rps-vs">VS</div>
        <div class="rps-hand-card" data-rps-bot-card><img class="rps-hand-img" data-rps-bot-img alt=""/><small>Bot</small></div>
      </div>
      <div class="rps-result" data-rps-result>Pick a hand</div>
      <div class="rps-choices">
        <button class="rps-choice" type="button" data-rps-choice="rock"><img class="rps-hand-img" data-rps-choice-img="rock" alt=""/><span>Rock</span></button>
        <button class="rps-choice" type="button" data-rps-choice="paper"><img class="rps-hand-img" data-rps-choice-img="paper" alt=""/><span>Paper</span></button>
        <button class="rps-choice" type="button" data-rps-choice="scissors"><img class="rps-hand-img" data-rps-choice-img="scissors" alt=""/><span>Scissors</span></button>
      </div>
    </div>
    <div class="rps-panel">
      <div class="rps-input-row"><input data-rps-bet inputmode="decimal" pattern="[0-9.]*" value="0.1"/><button type="button" data-rps-half>1/2</button><button type="button" data-rps-double>2x</button></div>
      <button class="rps-play" type="button" data-rps-play>Play Round</button>
      <div class="rps-stats"><div class="rps-stat"><small>WINS</small><b data-rps-wins>0</b></div><div class="rps-stat"><small>STREAK</small><b data-rps-streak>0</b></div><div class="rps-stat"><small>BET</small><b data-rps-bet-label>0.1</b></div></div>
    </div>
  </div>
  <script>
    (function(){
      var root=document.getElementById('rps');if(!root||root.dataset.readyRps)return;root.dataset.readyRps='1';
      var beats={rock:'scissors',paper:'rock',scissors:'paper'};
      var multipliers=[1.2,1.4,1.7,2,2.5,3,4,5,7,10];
      var rpsImages={you:{rock:'/app/api/uploaded-image/rps-you-rock.png',paper:'/app/api/uploaded-image/rps-you-paper.png',scissors:'/app/api/uploaded-image/rps-you-scissors.png'},bot:{rock:'/app/api/uploaded-image/rps-bot-rock.png',paper:'/app/api/uploaded-image/rps-bot-paper.png',scissors:'/app/api/uploaded-image/rps-bot-scissors.png'}};
      var picked='rock',wins=0,streak=0,playing=false,rate=1000000000,playerAngle=90,botAngle=-90;
      var playerImg=root.querySelector('[data-rps-player-img]'),botImg=root.querySelector('[data-rps-bot-img]'),resultEl=root.querySelector('[data-rps-result]'),betInput=root.querySelector('[data-rps-bet]'),betLabel=root.querySelector('[data-rps-bet-label]'),winsEl=root.querySelector('[data-rps-wins]'),streakEl=root.querySelector('[data-rps-streak]'),playerCard=root.querySelector('[data-rps-player-card]'),botCard=root.querySelector('[data-rps-bot-card]'),playBtn=root.querySelector('[data-rps-play]'),choices=['rock','paper','scissors'];
      var multWrap=root.querySelector('[data-rps-multipliers]');
      function imageFor(side,value){return value&&rpsImages[side]?rpsImages[side][value]||'':''}
      function tone(type){try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;var ctx=new A();var o=ctx.createOscillator();var g=ctx.createGain();o.type='sine';o.frequency.value=type==='win'?740:type==='lose'?180:420;g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(type==='win'?.12:.09,ctx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.24);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.28);setTimeout(function(){try{ctx.close()}catch(e){}},420)}catch(e){}}
      function renderMultipliers(){if(!multWrap)return;multWrap.innerHTML=multipliers.map(function(m,i){return '<span class="rps-multiplier '+(i===Math.min(streak,multipliers.length-1)?'is-active':'')+'">'+m+'x</span>'}).join('');var active=multWrap.querySelector('.is-active');if(active)try{active.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}catch(e){}}
      function applyUploadedRpsImages(data){if(!data)return;rpsImages.you.rock=data.rpsYouRockUrl||rpsImages.you.rock;rpsImages.you.paper=data.rpsYouPaperUrl||rpsImages.you.paper;rpsImages.you.scissors=data.rpsYouScissorsUrl||rpsImages.you.scissors;rpsImages.bot.rock=data.rpsBotRockUrl||rpsImages.bot.rock;rpsImages.bot.paper=data.rpsBotPaperUrl||rpsImages.bot.paper;rpsImages.bot.scissors=data.rpsBotScissorsUrl||rpsImages.bot.scissors}
      function replayDrop(target){if(!target)return;target.classList.remove('rps-hand-drop');void target.offsetWidth;target.classList.add('rps-hand-drop')}
      function setHandAngle(image,angle){if(image)image.style.setProperty('--rps-hand-angle',angle+'deg')}
      function bindImage(container,image,url){if(!container||!image)return false;image.decoding='async';image.loading='eager';image.onload=function(){container.classList.add('has-rps-image')};image.onerror=function(){image.removeAttribute('src');container.classList.remove('has-rps-image')};if(!url){image.removeAttribute('src');container.classList.remove('has-rps-image');return false}if(image.getAttribute('src')!==url)image.src=url;if(image.complete&&image.naturalWidth>0)container.classList.add('has-rps-image');return true}
      function setCardImage(card,image,side,value,animate){setHandAngle(image,side==='bot'?botAngle:playerAngle);var hasImage=bindImage(card,image,imageFor(side,value));if(animate&&hasImage)replayDrop(image)}
      function paintChoiceImages(){root.querySelectorAll('[data-rps-choice-img]').forEach(function(img){var kind=img.getAttribute('data-rps-choice-img')||'';bindImage(img.closest('[data-rps-choice]'),img,imageFor('you',kind))})}
      function refreshRpsImages(){paintChoiceImages();setCardImage(playerCard,playerImg,'you',picked,false)}
      function betValue(){var next=Math.max(.1,Number(String(betInput.value||'0.1').replace(',','.'))||.1);next=Math.round(next*100)/100;return next}
      function setBet(value){var next=Math.max(.1,Number(value)||.1);next=Math.round(next*100)/100;betInput.value=String(next).replace(/\.0$/,'');betLabel.textContent=betInput.value}
      function setPick(value,animate){if(playing)return;picked=value;setCardImage(playerCard,playerImg,'you',value,animate!==false);root.querySelectorAll('[data-rps-choice]').forEach(function(button){button.classList.toggle('is-picked',button.getAttribute('data-rps-choice')===value)})}
      function balanceRead(){return window.VexaTonBalance&&window.VexaTonBalance.read?Number(window.VexaTonBalance.read()):0}
      function balanceAdd(delta){if(window.VexaTonBalance&&window.VexaTonBalance.add)return window.VexaTonBalance.add(delta);window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{deltaNano:delta}}));return Promise.resolve(balanceRead()+delta)}
      function play(){if(playing)return;var bet=betValue();setBet(bet);var betNano=Math.round(bet*rate);if(balanceRead()<betNano){resultEl.textContent='Not enough credit';tone('lose');return}playing=true;playBtn.disabled=true;balanceAdd(-betNano);var bot=choices[Math.floor(Math.random()*choices.length)];setCardImage(playerCard,playerImg,'you',picked,true);if(botImg){botImg.removeAttribute('src');setHandAngle(botImg,botAngle)}botCard.classList.remove('has-rps-image');resultEl.textContent='Shuffling...';setTimeout(function(){setCardImage(botCard,botImg,'bot',bot,true);if(bot===picked){resultEl.textContent='Draw — bet returned';balanceAdd(betNano);tone('draw')}else if(beats[picked]===bot){var m=multipliers[Math.min(streak,multipliers.length-1)];var payout=Math.round(betNano*m);wins+=1;streak+=1;resultEl.textContent='You win • '+m+'x';balanceAdd(payout);tone('win')}else{streak=0;resultEl.textContent='You lose';tone('lose')}winsEl.textContent=String(wins);streakEl.textContent=String(streak);renderMultipliers();playing=false;playBtn.disabled=false},620)}
      root.querySelectorAll('[data-rps-choice]').forEach(function(button){button.onclick=function(){setPick(button.getAttribute('data-rps-choice')||'rock',true)}});
      root.querySelector('[data-rps-half]').onclick=function(){setBet(betValue()/2)};root.querySelector('[data-rps-double]').onclick=function(){setBet(betValue()*2)};betInput.oninput=function(){betLabel.textContent=betInput.value||'0.1'};playBtn.onclick=play;
      window.addEventListener('vexa-rps-images-sync',function(event){applyUploadedRpsImages(event.detail||null);refreshRpsImages()});
      try{if(window.VexaUploadedImages&&window.VexaUploadedImages.read)applyUploadedRpsImages(window.VexaUploadedImages.read());if(window.VexaUploadedImages&&window.VexaUploadedImages.load)window.VexaUploadedImages.load().then(function(data){applyUploadedRpsImages(data);refreshRpsImages()}).catch(function(){})}catch(e){}
      setPick('rock',false);setBet(betInput.value);paintChoiceImages();renderMultipliers();
    })();
  </script>
</section>
`;