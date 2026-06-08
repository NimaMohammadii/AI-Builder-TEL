export const SLOT_SCRIPT = `
(function(){
  var symbols=[
    {id:'cherry',label:'Cherry'},
    {id:'lemon',label:'Lemon'},
    {id:'orange',label:'Orange'},
    {id:'grape',label:'Grape'},
    {id:'watermelon',label:'Watermelon'},
    {id:'diamond',label:'Diamond'},
    {id:'gold',label:'Gold Star or Bell'},
    {id:'lucky7',label:'Lucky 7'}
  ];
  var reelCount=3;
  var symbolHeight=92;
  var restLoop=6;
  var preparedLoops=18;
  var maxSpinLoops=10;
  var totalSpinMs=7600;
  var reelStopGapMs=800;
  var soundStopDelayMs=1000;
  var NANO=1000000000;
  var amountNano=NANO;
  var activeCostNano=0;
  var spinning=false;
  var currentIndexes=[0,1,2];
  var slotSound=null,slotAudio=null,slotAudioUrl='',slotSoundTimer=null,slotSoundStopTimer=null;
  var liveTimer=null,liveRows=[];

  function q(id){return document.getElementById(id)}
  function fromNano(value){return (Math.max(0,Math.floor(Number(value)||0))/NANO).toFixed(2)}
  function readPointBalance(){return window.VexaTonBalance?Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0)):0}
  function addPointDelta(deltaNano){var delta=Math.floor(Number(deltaNano)||0);if(window.VexaTonBalance){window.VexaTonBalance.add(delta);return}window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{deltaNano:delta}}))}
  function awardXP(amount,source,metadata){if(window.VexaLevel&&typeof window.VexaLevel.add==='function')window.VexaLevel.add(amount,source,metadata||{section:'slot'})}
  function setBrand(title){var brand=q('brandTitle');if(brand)brand.textContent=title}
  function setResultText(text){var node=q('slotResultText');if(node)node.textContent=text}
  function setMultiplierText(value){var node=q('slotMultiplier');if(node)node.textContent=Number(value||0).toFixed(2)+'x'}
  function cleanText(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return ch==='&'?'&amp;':ch==='<'?'&lt;':ch==='>'?'&gt;':ch==='"'?'&quot;':'&#39;'})}

  function currentUserName(){try{var user=window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.initDataUnsafe&&window.Telegram.WebApp.initDataUnsafe.user;if(user){return String([user.first_name,user.last_name].filter(Boolean).join(' ')).replace(/[<>]/g,'').trim().slice(0,18)}}catch(e){}return localStorage.getItem('slotLiveName')||'You'}
  function symbolFallback(symbol){var icons={cherry:'🍒',lemon:'🍋',orange:'🍊',grape:'🍇',watermelon:'🍉',diamond:'💎',gold:'⭐',lucky7:'7️⃣'};return symbol?(icons[symbol.id]||symbol.label||symbol.id):'—'}
  function randomSymbolIndex(){if(window.crypto&&window.crypto.getRandomValues){var values=new Uint32Array(1);window.crypto.getRandomValues(values);return values[0]%symbols.length}return Math.floor(Math.random()*symbols.length)}
  function randomInt(max){if(window.crypto&&window.crypto.getRandomValues){var values=new Uint32Array(1);window.crypto.getRandomValues(values);return values[0]%max}return Math.floor(Math.random()*max)}
  function shuffle(items){var out=items.slice();for(var i=out.length-1;i>0;i--){var j=randomInt(i+1);var t=out[i];out[i]=out[j];out[j]=t}return out}
  function symbolIndex(id){for(var i=0;i<symbols.length;i++)if(symbols[i]&&symbols[i].id===id)return i;return 0}
  function noWinResult(){var indexes=[0,1,2,3,4,5,6,7];return shuffle(indexes).slice(0,3)}
  function pairFruitResult(){var fruit=randomInt(5);var third=randomInt(symbols.length-1);if(third>=fruit)third++;return shuffle([fruit,fruit,third])}
  function tripleFruitResult(){var fruit=randomInt(5);return [fruit,fruit,fruit]}
  function controlledResult(){var roll=randomInt(10000);if(roll<6500)return noWinResult();if(roll<8945)return pairFruitResult();if(roll<9783)return tripleFruitResult();if(roll<9958)return [symbolIndex('diamond'),symbolIndex('diamond'),symbolIndex('diamond')];if(roll<9993)return [symbolIndex('gold'),symbolIndex('gold'),symbolIndex('gold')];return [symbolIndex('lucky7'),symbolIndex('lucky7'),symbolIndex('lucky7')]}
  function randomResult(){var out=[];for(var i=0;i<reelCount;i++)out.push(randomSymbolIndex());return out}
  function slotLiveResultHtml(result){return result.map(function(symbolIndex){var symbol=symbols[symbolIndex];if(symbol&&symbol.imageUrl)return '<span class="slot-live-symbol has-image"><img src="'+cleanText(symbol.imageUrl)+'" alt="'+cleanText(symbol.label||symbol.id)+'" loading="eager" decoding="async"><span>'+cleanText(symbolFallback(symbol))+'</span></span>';return '<span class="slot-live-symbol">'+cleanText(symbolFallback(symbol))+'</span>'}).join('')}
  function renderLive(){var list=q('slotLiveList');if(!list)return;if(!liveRows.length){liveRows=[{name:'AriSpin',result:randomResult()},{name:'MayaWin',result:randomResult()},{name:'NimaLuck',result:randomResult()}]}list.innerHTML=liveRows.slice(0,24).map(function(row){return '<div class="slot-live-row is-entering"><span class="slot-live-user">'+cleanText(row.name)+'</span><span class="slot-live-result">'+slotLiveResultHtml(row.result)+'</span></div>'}).join('')}
  function pushSlotLiveUserResult(indexes){liveRows=liveRows.filter(function(row){return row.name!==currentUserName()});liveRows.unshift({name:currentUserName(),result:indexes});renderLive()}
  function bindSlotLive(){renderLive();var box=q('slotLive'),toggle=q('slotLiveToggle');if(toggle&&box){toggle.onclick=function(){var open=!box.classList.contains('open');box.classList.toggle('open',open);toggle.setAttribute('aria-expanded',open?'true':'false')}}if(liveTimer)clearInterval(liveTimer);liveTimer=setInterval(function(){var names=['AriSpin','MayaWin','LiaBet','NoraLux','KianRush','SinaAce','RayanJet','ParsaKing'];liveRows.unshift({name:names[Math.floor(Math.random()*names.length)],result:randomResult()});liveRows=liveRows.slice(0,24);renderLive()},2200)}

  function syncAmountInput(){var input=q('slotAmount');if(input)input.value='1'}
  function refreshControls(){var button=q('slotSpinButton');var input=q('slotAmount');amountNano=NANO;if(input){input.value='1';input.disabled=true}if(button){button.disabled=spinning;var fallback=button.querySelector('.slot-control-fallback');if(fallback)fallback.textContent=spinning?'Running':'Spin'}}
  function readAmountInput(){amountNano=NANO;syncAmountInput();return amountNano}

  function prepareSlotSound(url){slotAudioUrl=url||'';slotAudio=null;if(!slotAudioUrl)return;slotAudio=new Audio(slotAudioUrl);slotAudio.loop=false;slotAudio.preload='auto';try{slotAudio.load()}catch(e){}}
  function startSlotSound(){if(!slotAudioUrl)return;stopSlotSound();slotSoundTimer=setTimeout(function(){var audio=slotAudio||new Audio(slotAudioUrl);audio.loop=false;audio.preload='auto';audio.currentTime=0;slotSound=audio;audio.play().catch(function(){})},120)}
  function scheduleSlotSoundStop(){if(slotSoundStopTimer){clearTimeout(slotSoundStopTimer);slotSoundStopTimer=null}slotSoundStopTimer=setTimeout(stopSlotSound,soundStopDelayMs)}
  function stopSlotSound(){if(slotSoundTimer){clearTimeout(slotSoundTimer);slotSoundTimer=null}if(slotSoundStopTimer){clearTimeout(slotSoundStopTimer);slotSoundStopTimer=null}if(!slotSound)return;try{slotSound.pause();slotSound.currentTime=0}catch(e){}slotSound=null}

  function createSymbol(symbol){var cell=document.createElement('div');cell.className=symbol&&symbol.imageUrl?'slot-symbol has-image':'slot-symbol';var fallback=document.createElement('span');fallback.className='slot-symbol-fallback';fallback.textContent=symbolFallback(symbol);cell.appendChild(fallback);if(symbol&&symbol.imageUrl){var img=document.createElement('img');img.className='slot-symbol-image';img.alt=symbol.label||symbol.id||'Slot symbol';img.decoding='async';img.draggable=false;img.onerror=function(){cell.classList.remove('has-image');img.remove()};img.src=symbol.imageUrl;cell.appendChild(img)}return cell}
  function stripNode(reelIndex){return document.querySelector('[data-slot-reel="'+reelIndex+'"] .slot-reel-strip')}
  function reelOffset(reelIndex){return reelIndex%symbols.length}
  function stripIndexForSymbol(reelIndex,symbolIndex,loopCount){var offset=reelOffset(reelIndex);var localIndex=(symbolIndex-offset+symbols.length)%symbols.length;return loopCount*symbols.length+localIndex}
  function symbolStep(){var sample=document.querySelector('.slot-symbol');return sample&&sample.offsetHeight?sample.offsetHeight:symbolHeight}
  function stripY(index){var step=symbolStep();return -index*step+step}
  function stripFragment(reelIndex,loops){var fragment=document.createDocumentFragment();var total=Math.max(18,loops*symbols.length+6);var offset=reelOffset(reelIndex);for(var i=0;i<total;i++)fragment.appendChild(createSymbol(symbols[(i+offset)%symbols.length]));return fragment}
  function buildStrip(reelIndex,loops){var strip=stripNode(reelIndex);if(!strip)return;strip.replaceChildren(stripFragment(reelIndex,loops))}
  function setReelPosition(reelIndex,symbolIndex,animate){var strip=stripNode(reelIndex);if(!strip)return;var index=stripIndexForSymbol(reelIndex,symbolIndex,restLoop);strip.style.transition=animate?'transform .75s linear':'none';strip.style.transform='translate3d(0,'+stripY(index)+'px,0)'}
  function initReels(){for(var i=0;i<reelCount;i++){buildStrip(i,preparedLoops);setReelPosition(i,currentIndexes[i],false)}}
  function refreshReels(){for(var i=0;i<reelCount;i++){buildStrip(i,preparedLoops);setReelPosition(i,currentIndexes[i],false)}}

  function isFruitSymbol(symbolId){return ['cherry','lemon','orange','grape','watermelon'].indexOf(symbolId)!==-1}
  function resultCounts(result){var counts={};result.forEach(function(symbolIndex){var symbol=symbols[symbolIndex];var id=symbol&&symbol.id;if(id)counts[id]=(counts[id]||0)+1});return counts}
  function topResultEntry(counts){var top={symbolId:'',count:0};Object.keys(counts).forEach(function(id){if(counts[id]>top.count)top={symbolId:id,count:counts[id]}});return top}
  function resultProfile(result){var entry=topResultEntry(resultCounts(result));if(entry.count===3){if(isFruitSymbol(entry.symbolId))return{tier:'triple-fruit',multiplier:2,xp:30};if(entry.symbolId==='diamond')return{tier:'triple-diamond',multiplier:5,xp:80};if(entry.symbolId==='gold')return{tier:'triple-gold',multiplier:20,xp:150};if(entry.symbolId==='lucky7')return{tier:'triple-seven',multiplier:100,xp:300}}if(entry.count===2&&isFruitSymbol(entry.symbolId))return{tier:'pair-fruit',multiplier:.8,xp:10};return{tier:'standard',multiplier:0,xp:5}}
  function resultLabel(profile,deltaNano){if(deltaNano>0)return'Result +'+fromNano(deltaNano);return'Result 0.00'}

  function winSymbolHtml(symbol){if(symbol&&symbol.imageUrl)return '<span class="slot-win-symbol"><img src="'+cleanText(symbol.imageUrl)+'" alt="'+cleanText(symbol.label||symbol.id||'win')+'" decoding="async"><b>'+cleanText(symbolFallback(symbol))+'</b></span>';return '<span class="slot-win-symbol text-only"><b>'+cleanText(symbolFallback(symbol))+'</b></span>'}
  function showWinEffect(result,profile,resultNano){
    try{
      var machine=document.querySelector('.slot-window')||document.querySelector('.slot-machine');
      var rect=machine?machine.getBoundingClientRect():{left:window.innerWidth/2,top:window.innerHeight/2,width:1,height:1};
      var startX=rect.left+rect.width/2,startY=rect.top+rect.height/2;
      var endX=window.innerWidth/2,endY=Math.max(150,window.innerHeight*.43);
      var layer=document.createElement('div');
      layer.className='slot-win-pop-layer';
      layer.style.cssText='position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden;';
      var glow=document.createElement('div');
      glow.style.cssText='position:absolute;left:50%;top:43%;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(255,235,170,.42),rgba(183,28,69,.22) 42%,rgba(0,0,0,0) 72%);filter:blur(12px);opacity:0;transform:translate(-50%,-50%) scale(.55);';
      var group=document.createElement('div');
      group.className='slot-win-pop-group';
      group.style.cssText='position:absolute;left:'+startX+'px;top:'+startY+'px;display:flex;align-items:center;justify-content:center;gap:12px;padding:16px 18px;border-radius:32px;background:rgba(8,0,4,.34);border:1px solid rgba(255,255,255,.18);box-shadow:0 0 42px rgba(255,212,104,.34),0 0 82px rgba(184,20,62,.30),inset 0 1px 0 rgba(255,255,255,.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transform:translate(-50%,-50%) scale(.48);opacity:0;will-change:transform,opacity,filter;';
      group.innerHTML=result.map(function(index){return winSymbolHtml(symbols[index])}).join('')+'<span style="position:absolute;left:50%;top:100%;transform:translate(-50%,8px);font-size:13px;font-weight:950;letter-spacing:.02em;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.75);white-space:nowrap;">WIN '+Number(profile.multiplier||0).toFixed(2)+'x</span>';
      layer.appendChild(glow);layer.appendChild(group);document.body.appendChild(layer);
      Array.prototype.forEach.call(group.querySelectorAll('.slot-win-symbol'),function(el,i){el.style.cssText='width:74px;height:74px;display:grid;place-items:center;border-radius:22px;background:rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 12px 30px rgba(0,0,0,.32);font-size:42px;font-weight:950;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.72);overflow:hidden;animation:none;';var img=el.querySelector('img');if(img)img.style.cssText='width:82%;height:82%;object-fit:contain;display:block;filter:drop-shadow(0 10px 18px rgba(0,0,0,.42));';var b=el.querySelector('b');if(img&&b)b.style.display='none';el.animate([{transform:'translateY(18px) scale(.72) rotate(-8deg)',opacity:0},{transform:'translateY(-5px) scale(1.08) rotate(3deg)',opacity:1},{transform:'translateY(0) scale(1) rotate(0)',opacity:1}],{duration:620,delay:180+i*80,easing:'cubic-bezier(.2,.9,.2,1)',fill:'both'})});
      glow.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.45)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.08)'},{opacity:0,transform:'translate(-50%,-50%) scale(1.38)'}],{duration:1700,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
      group.animate([{left:startX+'px',top:startY+'px',transform:'translate(-50%,-50%) scale(.48)',opacity:0,filter:'blur(3px)'},{left:endX+'px',top:endY+'px',transform:'translate(-50%,-50%) scale(1.08)',opacity:1,filter:'blur(0)'},{left:endX+'px',top:endY+'px',transform:'translate(-50%,-50%) scale(1)',opacity:1,filter:'blur(0)'},{left:endX+'px',top:endY+'px',transform:'translate(-50%,-50%) scale(.92)',opacity:0,filter:'blur(5px)'}],{duration:1850,easing:'cubic-bezier(.18,.86,.22,1)',fill:'both'});
      setTimeout(function(){try{layer.remove()}catch(e){}},1950);
    }catch(e){}
  }

  function finish(result){var button=q('slotSpinButton');var box=document.querySelector('.slot-machine');var profile=resultProfile(result);var active=profile.multiplier>0;var resultNano=activeCostNano>0&&profile.multiplier>0?Math.floor(activeCostNano*profile.multiplier):0;spinning=false;scheduleSlotSoundStop();if(resultNano>0)addPointDelta(resultNano);setMultiplierText(profile.multiplier||0);setResultText(resultLabel(profile,resultNano));pushSlotLiveUserResult(result);if(active)showWinEffect(result,profile,resultNano);if(button)button.disabled=false;if(box){box.classList.remove('is-spinning');box.classList.toggle('is-win',active)}awardXP(profile.xp,'reel-result',{section:'slot',event:'finish',tier:profile.tier,multiplier:profile.multiplier});activeCostNano=0;refreshControls()}
  function spin(){if(spinning)return;var button=q('slotSpinButton');var box=document.querySelector('.slot-machine');var result=controlledResult();var pending=reelCount;readAmountInput();activeCostNano=NANO;if(readPointBalance()<activeCostNano){setResultText('Not enough TON');return}addPointDelta(-activeCostNano);spinning=true;awardXP(2,'reel-start',{section:'slot',event:'spin',amountNano:activeCostNano});setResultText('Running 1 TON');setMultiplierText(1);startSlotSound();if(button)button.disabled=true;if(box){box.classList.remove('is-win');box.classList.add('is-spinning')}result.forEach(function(symbolIndex,reelIndex){var strip=stripNode(reelIndex);if(!strip)return;var loops=maxSpinLoops-(reelCount-reelIndex-1);var finalIndex=stripIndexForSymbol(reelIndex,symbolIndex,restLoop+loops);var duration=totalSpinMs-((reelCount-reelIndex-1)*reelStopGapMs);var y=stripY(finalIndex);strip.style.willChange='transform';strip.style.transition='transform '+duration+'ms linear';strip.style.transform='translate3d(0,'+y+'px,0)';setTimeout(function(){currentIndexes[reelIndex]=symbolIndex;setReelPosition(reelIndex,symbolIndex,false);strip.style.willChange='auto';pending--;if(pending<=0)finish(result)},duration+220)});refreshControls()}

  function loadSlotSymbols(){fetch('/app/api/slot-symbols',{cache:'no-store'}).then(function(response){return response.json().then(function(body){return{ok:response.ok,body:body}})}).then(function(result){if(!result.ok||!result.body||!result.body.symbols)return;var byId={};result.body.symbols.forEach(function(symbol){byId[symbol.id]=symbol});symbols=symbols.map(function(symbol){var uploaded=byId[symbol.id];if(!uploaded||!uploaded.imageUrl)return{id:symbol.id,label:symbol.label};return{id:symbol.id,label:uploaded.label||symbol.label,imageUrl:uploaded.imageUrl}});refreshReels();renderLive()}).catch(function(){})}
  function loadSlotFrame(){var img=q('slotFrameImage');if(!img)return;fetch('/app/api/slot-frame',{cache:'no-store'}).then(function(response){return response.json().then(function(body){return{ok:response.ok,body:body}})}).then(function(result){if(!result.ok||!result.body||!result.body.slotFrameUrl)return;img.onload=function(){img.classList.add('is-loaded')};img.onerror=function(){img.classList.remove('is-loaded');img.removeAttribute('src')};img.src=result.body.slotFrameUrl}).catch(function(){img.classList.remove('is-loaded')})}
  function loadSlotControls(){fetch('/app/api/slot-controls',{cache:'no-store'}).then(function(response){return response.json().then(function(body){return{ok:response.ok,body:body}})}).then(function(result){if(!result.ok||!result.body||!result.body.controls)return;result.body.controls.forEach(function(control){if(control.id!=='spin')return;var img=q('slotSpinButtonImage');if(!img||!control.imageUrl)return;img.onload=function(){img.classList.add('is-loaded')};img.onerror=function(){img.classList.remove('is-loaded');img.removeAttribute('src')};img.src=control.imageUrl})}).catch(function(){})}
  function loadSlotSpinAudio(){fetch('/app/api/slot-spin-audio',{cache:'no-store'}).then(function(response){return response.json().then(function(body){return{ok:response.ok,body:body}})}).then(function(result){if(!result.ok||!result.body||!result.body.audioUrl)return;prepareSlotSound(result.body.audioUrl)}).catch(function(){})}

  function bind(){initReels();loadSlotFrame();loadSlotSymbols();loadSlotControls();loadSlotSpinAudio();syncAmountInput();setMultiplierText(1);setResultText('Spin 1 TON');refreshControls();bindSlotLive();var spinButton=q('slotSpinButton');if(spinButton)spinButton.addEventListener('click',spin);document.addEventListener('click',function(ev){var openButton=ev.target&&ev.target.closest?ev.target.closest('[data-game-view="slot"]'):null;if(openButton)setBrand('Slot')},true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;