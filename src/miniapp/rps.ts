export const RPS_SECTION = `
<section id="rps" class="view rps-view">
  <style>
    html:has(#rps.active),body:has(#rps.active){background:#000!important;background-color:#000!important;background-image:none!important}
    body:has(#rps.active)::before,body:has(#rps.active)::after,body:has(#rps.active) .app::before,body:has(#rps.active) .app::after{content:none!important;display:none!important;background:none!important;box-shadow:none!important}
    body:has(#rps.active) .tabs{display:none!important}
    body:has(#rps.active) .app,body:has(#rps.active) main.app,body:has(#rps.active) .content,body:has(#rps.active) .view.active,body:has(#rps.active) #rps,body:has(#rps.active) .rps-view,body:has(#rps.active) .top,body:has(#rps.active) header.top{background:#000!important;background-color:#000!important;background-image:none!important;box-shadow:none!important}
    .rps-view{min-height:100%;padding:4px 14px calc(104px + env(safe-area-inset-bottom));color:#fff;background:#000!important;overflow-y:auto!important;overflow-x:hidden;-webkit-overflow-scrolling:touch;box-sizing:border-box;scrollbar-width:none}
    .rps-view::-webkit-scrollbar{display:none}
    .rps-wrap{width:100%;max-width:560px;margin:0 auto;display:grid;gap:10px}
    .rps-title{display:none!important}
    .rps-multipliers{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;margin:2px -14px 8px;padding:2px 14px 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity}
    .rps-multipliers::-webkit-scrollbar{display:none}
    .rps-multiplier{flex:0 0 auto;height:34px;min-width:58px;padding:0 12px;border:0;border-radius:999px;display:grid;place-items:center;color:rgba(255,255,255,.58);font-size:12px;font-weight:950;letter-spacing:-.025em;background:rgba(255,255,255,.035);box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 10px 24px rgba(0,0,0,.22);-webkit-backdrop-filter:blur(8px) saturate(130%);backdrop-filter:blur(8px) saturate(130%);scroll-snap-align:center;transition:transform .32s cubic-bezier(.2,.9,.18,1),background .32s ease,color .32s ease,box-shadow .32s ease,filter .32s ease}
    .rps-multiplier.is-active{color:#fff;background:linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,.035));box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 12px 28px rgba(0,0,0,.30);transform:scale(1.04)}
    .rps-multiplier.rps-win{color:rgba(220,255,232,.96);background:linear-gradient(180deg,rgba(8,86,42,.58),rgba(2,32,17,.72));box-shadow:inset 0 1px 0 rgba(149,255,187,.16),0 0 18px rgba(8,92,43,.26),0 12px 28px rgba(0,0,0,.36);animation:rpsMultiplierWin .82s cubic-bezier(.18,.86,.2,1) both}
    .rps-multiplier.rps-loss{color:rgba(255,218,226,.94);background:linear-gradient(180deg,rgba(85,5,28,.64),rgba(31,1,12,.82));box-shadow:inset 0 1px 0 rgba(255,124,151,.14),0 0 18px rgba(92,5,30,.28),0 12px 28px rgba(0,0,0,.38);animation:rpsMultiplierLoss .82s cubic-bezier(.18,.86,.2,1) both}
    .rps-arena{position:relative;min-height:476px;display:grid;grid-template-rows:auto auto auto auto;border:0!important;border-radius:0;background:transparent!important;box-shadow:none!important;overflow:visible!important;padding:4px 0 0}
    .rps-duel{display:grid;grid-template-columns:1fr 64px 1fr;align-items:center;gap:12px;margin:24px 0 14px}
    .rps-hand-card{height:168px;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;display:grid;place-items:center;gap:6px;overflow:visible!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
    .rps-hand-img{display:none;width:116px;height:116px;object-fit:contain;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;filter:drop-shadow(0 18px 28px rgba(0,0,0,.46));pointer-events:none;--rps-hand-angle:90deg;--rps-hand-drop-start:-90deg;--rps-hand-drop-overshoot:5deg;transform:rotate(var(--rps-hand-angle));transform-origin:center;transition:transform 1.15s cubic-bezier(.18,.82,.22,1);will-change:transform}
    [data-rps-bot-img]{--rps-hand-angle:-90deg;--rps-hand-drop-start:90deg;--rps-hand-drop-overshoot:-5deg}
    .rps-choice .rps-hand-img{width:58px;height:58px;filter:drop-shadow(0 10px 14px rgba(0,0,0,.32))}
    .rps-hand-card.has-rps-image .rps-hand-img,.rps-choice.has-rps-image .rps-hand-img{display:block}
    .rps-hand-card small,.rps-choice span{color:rgba(255,255,255,.54);font-size:11px;font-weight:900}
    .rps-vs{width:auto!important;height:auto!important;border:0!important;background:transparent!important;box-shadow:none!important;display:grid;place-items:center;font-weight:950;color:#fff;font-size:18px;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
    .rps-result{min-height:30px;text-align:center;font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;font-size:17px;font-weight:850;letter-spacing:-.025em;color:rgba(255,255,255,.92);margin-bottom:2px}
    .rps-choices{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-top:-2px}
    .rps-choice{height:92px;border:0!important;border-radius:0!important;outline:0!important;appearance:none!important;-webkit-appearance:none!important;margin:0!important;padding:0!important;color:#fff;background:none!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;display:grid;place-items:center;gap:4px;font-weight:950;overflow:visible!important;transition:transform .18s cubic-bezier(.2,.9,.16,1),opacity .18s ease;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
    .rps-choice::before,.rps-choice::after{content:none!important;display:none!important;background:none!important;box-shadow:none!important;border:0!important}
    .rps-choice:focus,.rps-choice:focus-visible{outline:0!important;box-shadow:none!important}
    .rps-choice:disabled{opacity:.48;pointer-events:none}
    .rps-choice:active{transform:scale(.96)}
    .rps-choice.is-picked{opacity:1;transform:scale(1.04)}
    .rps-choice:not(.is-picked){opacity:.72}
    .rps-panel{position:relative;display:grid;gap:10px;border:0!important;border-radius:28px;padding:14px;background:linear-gradient(180deg,rgba(255,255,255,.026),rgba(255,255,255,.012));box-shadow:0 0 0 1px rgba(62,4,19,.10),0 0 22px rgba(54,3,17,.15),0 18px 46px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.045);-webkit-backdrop-filter:blur(18px) saturate(138%);backdrop-filter:blur(18px) saturate(138%);overflow:hidden;margin-top:-2px}
    .rps-input-row{display:grid;grid-template-columns:1fr auto auto;gap:8px}
    .rps-input-row input,.rps-input-row button,.rps-stat{border:0!important;background:rgba(255,255,255,.04);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 12px 26px rgba(0,0,0,.22);-webkit-backdrop-filter:blur(12px) saturate(135%);backdrop-filter:blur(12px) saturate(135%)}
    .rps-input-row input,.rps-input-row button{height:50px;border-radius:18px;color:#fff;font-weight:950;outline:none}
    .rps-input-row input{padding:0 14px;font-size:18px}.rps-input-row button{min-width:58px;font-size:13px}
    .rps-play{height:60px;border:0;border-radius:999px;background:linear-gradient(180deg,#2b0310,#170107);color:rgba(255,255,255,.94);font-size:18px;font-weight:950;letter-spacing:-.045em;box-shadow:0 0 0 1px rgba(95,8,30,.10),0 0 18px rgba(70,4,22,.20),0 14px 30px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.07)}
    .rps-play:disabled{opacity:.42}
    .rps-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.rps-stat{border-radius:18px;padding:10px;text-align:center}.rps-stat small{display:block;color:rgba(255,255,255,.45);font-size:10px;font-weight:850}.rps-stat b{display:block;margin-top:4px;font-size:14px}.rps-won-amount{color:rgba(58,164,82,.96)!important;text-shadow:0 0 12px rgba(13,80,32,.28)}
    .rps-hand-drop{animation:rpsHandDrop .92s cubic-bezier(.16,.86,.2,1) both}@keyframes rpsHandDrop{0%{opacity:0;transform:translateY(-74px) rotate(calc(var(--rps-hand-angle) + var(--rps-hand-drop-start))) scale(.88)}74%{opacity:1;transform:translateY(4px) rotate(calc(var(--rps-hand-angle) + var(--rps-hand-drop-overshoot))) scale(1.02)}100%{opacity:1;transform:translateY(0) rotate(var(--rps-hand-angle)) scale(1)}}
    @keyframes rpsMultiplierWin{0%{filter:saturate(1);transform:translateY(0) scale(1)}42%{filter:saturate(1.28);transform:translateY(-2px) scale(1.045)}100%{filter:saturate(1);transform:translateY(0) scale(1)}}
    @keyframes rpsMultiplierLoss{0%{filter:saturate(1);transform:translateY(0) scale(1)}42%{filter:saturate(1.24);transform:translateY(2px) scale(.985)}100%{filter:saturate(1);transform:translateY(0) scale(1)}}
    @media(max-width:380px){.rps-arena{min-height:436px}.rps-duel{margin:18px 0 12px}.rps-hand-card{height:148px}.rps-hand-img{width:86px;height:86px}.rps-hand-card.has-rps-image .rps-hand-img{width:104px;height:104px}.rps-choice{height:78px}.rps-choice .rps-hand-img{width:50px;height:50px}.rps-panel{margin-top:0}}
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
      <button class="rps-play" type="button" data-rps-play>Cash Out</button>
      <div class="rps-stats"><div class="rps-stat"><small>WINS</small><b data-rps-wins>0</b></div><div class="rps-stat"><small>WON</small><b class="rps-won-amount" data-rps-streak>0.00</b></div><div class="rps-stat"><small>BET</small><b data-rps-bet-label>0.1</b></div></div>
    </div>
  </div>
  <script>
    (function(){
      var root=document.getElementById('rps');if(!root||root.dataset.readyRps)return;root.dataset.readyRps='1';
      var beats={rock:'scissors',paper:'rock',scissors:'paper'};
      var multipliers=[1.2,1.4,1.7,2,2.5,3,4,5,7,10];
      var rpsImages={you:{rock:'/app/api/uploaded-image/rps-you-rock.png',paper:'/app/api/uploaded-image/rps-you-paper.png',scissors:'/app/api/uploaded-image/rps-you-scissors.png'},bot:{rock:'/app/api/uploaded-image/rps-bot-rock.png',paper:'/app/api/uploaded-image/rps-bot-paper.png',scissors:'/app/api/uploaded-image/rps-bot-scissors.png'}};
      var picked='rock',wins=0,streak=0,playing=false,sessionActive=false,betNano=0,currentWinNano=0,rate=1000000000,playerAngle=90,botAngle=-90;
      var playerImg=root.querySelector('[data-rps-player-img]'),botImg=root.querySelector('[data-rps-bot-img]'),resultEl=root.querySelector('[data-rps-result]'),betInput=root.querySelector('[data-rps-bet]'),betLabel=root.querySelector('[data-rps-bet-label]'),winsEl=root.querySelector('[data-rps-wins]'),wonEl=root.querySelector('[data-rps-streak]'),playerCard=root.querySelector('[data-rps-player-card]'),botCard=root.querySelector('[data-rps-bot-card]'),playBtn=root.querySelector('[data-rps-play]'),halfBtn=root.querySelector('[data-rps-half]'),doubleBtn=root.querySelector('[data-rps-double]'),choices=['rock','paper','scissors'];
      var multWrap=root.querySelector('[data-rps-multipliers]');
      function imageFor(side,value){return value&&rpsImages[side]?rpsImages[side][value]||'':''}
      function tone(type){try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;var ctx=new A();var o=ctx.createOscillator();var g=ctx.createGain();o.type='sine';o.frequency.value=type==='win'?740:type==='lose'?180:420;g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(type==='win'?.12:.09,ctx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.24);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.28);setTimeout(function(){try{ctx.close()}catch(e){}},420)}catch(e){}}
      function formatTon(nano){var n=Math.max(0,Number(nano)||0)/rate;return n.toFixed(2).replace(/\.00$/,'.00')}
      function renderMultipliers(){if(!multWrap)return;multWrap.innerHTML=multipliers.map(function(m,i){return '<span class="rps-multiplier '+(i===Math.min(streak,multipliers.length-1)?'is-active':'')+'">'+m+'x</span>'}).join('');var active=multWrap.querySelector('.is-active');if(active)try{active.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}catch(e){}}
      function flashMultiplier(type,index){if(!multWrap)return;var cards=multWrap.querySelectorAll('.rps-multiplier');var card=cards[Math.max(0,Math.min(index,cards.length-1))];if(!card)return;card.classList.remove('rps-win','rps-loss');void card.offsetWidth;card.classList.add(type==='win'?'rps-win':'rps-loss');setTimeout(function(){card.classList.remove('rps-win','rps-loss')},980)}
      function updateStats(){winsEl.textContent=String(wins);wonEl.textContent=formatTon(currentWinNano);betLabel.textContent=betInput.value||'0.1'}
      function updateControls(){var locked=sessionActive||playing;betInput.disabled=locked;if(halfBtn)halfBtn.disabled=locked;if(doubleBtn)doubleBtn.disabled=locked;root.querySelectorAll('[data-rps-choice]').forEach(function(button){button.disabled=playing});playBtn.textContent='Cash Out';playBtn.disabled=playing||!sessionActive||currentWinNano<=0;updateStats()}
      function applyUploadedRpsImages(data){if(!data)return;rpsImages.you.rock=data.rpsYouRockUrl||rpsImages.you.rock;rpsImages.you.paper=data.rpsYouPaperUrl||rpsImages.you.paper;rpsImages.you.scissors=data.rpsYouScissorsUrl||rpsImages.you.scissors;rpsImages.bot.rock=data.rpsBotRockUrl||rpsImages.bot.rock;rpsImages.bot.paper=data.rpsBotPaperUrl||rpsImages.bot.paper;rpsImages.bot.scissors=data.rpsBotScissorsUrl||rpsImages.bot.scissors}
      function replayDrop(target){if(!target)return;target.classList.remove('rps-hand-drop');void target.offsetWidth;target.classList.add('rps-hand-drop')}
      function setHandAngle(image,angle){if(image)image.style.setProperty('--rps-hand-angle',angle+'deg')}
      function bindImage(container,image,url){if(!container||!image)return false;image.decoding='async';image.loading='eager';image.onload=function(){container.classList.add('has-rps-image')};image.onerror=function(){image.removeAttribute('src');container.classList.remove('has-rps-image')};if(url&&image.getAttribute('src')!==url)image.src=url;else if(url)container.classList.add('has-rps-image');return !!url}
      function setCardImage(card,image,side,value,animate){setHandAngle(image,side==='bot'?botAngle:playerAngle);var hasImage=bindImage(card,image,imageFor(side,value));if(animate&&hasImage)replayDrop(image)}
      function paintChoiceImages(){root.querySelectorAll('[data-rps-choice-img]').forEach(function(img){var kind=img.getAttribute('data-rps-choice-img')||'';bindImage(img.closest('[data-rps-choice]'),img,imageFor('you',kind))})}
      function refreshRpsImages(){paintChoiceImages();setCardImage(playerCard,playerImg,'you',picked,false)}
      function betValue(){var next=Math.max(.1,Number(String(betInput.value||'0.1').replace(',','.'))||.1);next=Math.round(next*100)/100;return next}
      function setBet(value){var next=Math.max(.1,Number(value)||.1);next=Math.round(next*100)/100;betInput.value=String(next).replace(/\.0$/,'');betLabel.textContent=betInput.value}
      function setPick(value,animate){picked=value;setCardImage(playerCard,playerImg,'you',value,animate!==false);root.querySelectorAll('[data-rps-choice]').forEach(function(button){button.classList.toggle('is-picked',button.getAttribute('data-rps-choice')===value)})}
      function chooseBotHand(){
        var losingChoice=choices.filter(function(x){return beats[x]===picked})[0];
        var botPool=[picked,picked,losingChoice,losingChoice,losingChoice,beats[picked]];
        return botPool[Math.floor(Math.random()*botPool.length)];
      }
      function balanceRead(){return window.VexaTonBalance&&window.VexaTonBalance.read?Number(window.VexaTonBalance.read()):0}
      function balanceAdd(delta){if(window.VexaTonBalance&&window.VexaTonBalance.add)return window.VexaTonBalance.add(delta);window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{deltaNano:delta}}));return Promise.resolve(balanceRead()+delta)}
      function startSession(){var bet=betValue();setBet(bet);betNano=Math.round(bet*rate);if(balanceRead()<betNano){resultEl.textContent='Not enough credit';tone('lose');return false}sessionActive=true;streak=0;currentWinNano=0;balanceAdd(-betNano);renderMultipliers();updateControls();return true}
      function cashOut(){if(playing||!sessionActive||currentWinNano<=0)return;var paid=currentWinNano;balanceAdd(paid);resultEl.textContent='Cashed out • '+formatTon(paid);sessionActive=false;streak=0;currentWinNano=0;renderMultipliers();updateControls();tone('win')}
      function playChoice(value){if(playing)return;setPick(value,true);if(!sessionActive&&!startSession())return;playing=true;updateControls();var roundIndex=Math.min(streak,multipliers.length-1);var bot=chooseBotHand();if(botImg){botImg.removeAttribute('src');setHandAngle(botImg,botAngle)}botCard.classList.remove('has-rps-image');resultEl.textContent='Shuffling...';setTimeout(function(){setCardImage(botCard,botImg,'bot',bot,true);if(bot===picked){resultEl.textContent='Draw — pick again';tone('draw')}else if(beats[picked]===bot){var m=multipliers[roundIndex];currentWinNano=Math.round(betNano*m);wins+=1;streak=Math.min(streak+1,multipliers.length-1);resultEl.textContent='Win • '+m+'x or cash out';tone('win');renderMultipliers();flashMultiplier('win',roundIndex)}else{resultEl.textContent='You lose';sessionActive=false;streak=0;currentWinNano=0;tone('lose');renderMultipliers();flashMultiplier('loss',roundIndex)}playing=false;updateControls()},620)}
      root.querySelectorAll('[data-rps-choice]').forEach(function(button){button.onclick=function(){playChoice(button.getAttribute('data-rps-choice')||'rock')}});
      root.querySelector('[data-rps-half]').onclick=function(){if(!sessionActive&&!playing)setBet(betValue()/2)};root.querySelector('[data-rps-double]').onclick=function(){if(!sessionActive&&!playing)setBet(betValue()*2)};betInput.oninput=function(){betLabel.textContent=betInput.value||'0.1'};playBtn.onclick=cashOut;
      window.addEventListener('vexa-rps-images-sync',function(event){applyUploadedRpsImages(event.detail||null);refreshRpsImages()});
      try{if(window.VexaUploadedImages&&window.VexaUploadedImages.read)applyUploadedRpsImages(window.VexaUploadedImages.read());if(window.VexaUploadedImages&&window.VexaUploadedImages.load)window.VexaUploadedImages.load().then(function(data){applyUploadedRpsImages(data);refreshRpsImages()}).catch(function(){})}catch(e){}
      setPick('rock',false);setBet(betInput.value);paintChoiceImages();renderMultipliers();updateControls();
    })();
  </script>
</section>
`;
