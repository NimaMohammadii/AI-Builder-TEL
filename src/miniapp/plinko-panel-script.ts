export const PLINKO_PANEL_SCRIPT = `
(function(){
  var NANO=1000000000;
  function q(id){return document.getElementById(id)}
  function tonToNano(value){return Math.max(0,Math.floor((Number(String(value||'').replace(',','.'))||0)*NANO))}
  function readBalanceNano(){if(window.VexaTonBalance&&typeof window.VexaTonBalance.read==='function')return Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0));var source=q('plinkoTonBalance')||q('topTonBalance')||q('plinkoCredit');return tonToNano(source&&source.textContent)}
  function isPlinkoActive(){var active=document.querySelector('.view.active');return !!(active&&active.id==='plinko')}
  function roundCurrency(value){var next=Math.round((Math.max(0,Number(value)||0)+Number.EPSILON)*100)/100;return next}
  function money(value){var next=roundCurrency(value);return next.toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1')}
  function syncHiddenInput(){var input=q('plinkoBet'),open=document.querySelector('[data-plinko-bet-input-open]');if(input&&open)input.value=money(open.textContent||input.value||1)}
  function currentBet(){var input=q('plinkoBet');var value=Number(String(input&&input.value||'').replace(',','.'));return Number.isFinite(value)&&value>=1?roundCurrency(value):1}
  function setBet(value){var input=q('plinkoBet'),open=document.querySelector('[data-plinko-bet-input-open]'),editorInput=document.querySelector('[data-plinko-bet-input]');var next=roundCurrency(value);if(!Number.isFinite(next)||next<1)next=1;var balance=readBalanceNano()/NANO;if(balance>=1&&next>balance)next=roundCurrency(balance);var display=money(next);if(input)input.value=display;if(open)open.textContent=display;if(editorInput&&document.activeElement!==editorInput)editorInput.value=display;renderStats()}
  function multiplyBet(multiplier){var value=currentBet();setBet(multiplier===.5?Math.max(1,value/2):value*2)}
  function renderStats(){var bet=currentBet(),balance=readBalanceNano()/NANO;var current=document.querySelector('[data-plinko-current]'),balanceEl=document.querySelector('[data-plinko-balance]');if(current)current.textContent=money(bet);if(balanceEl)balanceEl.textContent=money(balance);syncHiddenInput()}
  function openEditor(anchor){var editor=document.querySelector('[data-plinko-bet-editor]'),input=document.querySelector('[data-plinko-bet-input]');if(!editor||!input)return;var rect=anchor&&anchor.getBoundingClientRect?anchor.getBoundingClientRect():null;if(rect)editor.style.setProperty('--plinko-editor-top',Math.max(120,rect.top+rect.height/2)+'px');input.value=money(currentBet());editor.classList.add('active');setTimeout(function(){try{input.focus();input.select()}catch(e){}},40)}
  function closeEditor(save){var editor=document.querySelector('[data-plinko-bet-editor]'),input=document.querySelector('[data-plinko-bet-input]');if(save&&input)setBet(input.value);if(editor)editor.classList.remove('active')}
  function syncHeaderCredit(){var source=q('plinkoTonBalance')||q('topTonBalance')||q('plinkoCredit');var header=q('plinkoCreditHeader');if(source&&header)header.textContent=source.textContent||'0';renderStats()}
  function setLastWin(value){var win=document.querySelector('[data-plinko-win]');if(win)win.textContent=money(value)}
  document.addEventListener('click',function(ev){var button=ev.target&&ev.target.closest&&ev.target.closest('button');if(!button)return;if(button.hasAttribute('data-plinko-bet-input-open')){ev.preventDefault();openEditor(button);return}if(button.hasAttribute('data-plinko-bet-done')){ev.preventDefault();closeEditor(true);return}var action=button.getAttribute('data-action');if(action==='plinko-bet-half'){ev.preventDefault();multiplyBet(.5);return}if(action==='plinko-bet-double'){ev.preventDefault();multiplyBet(2);return}},true);
  document.addEventListener('click',function(ev){var editor=document.querySelector('[data-plinko-bet-editor]');if(editor&&editor.classList.contains('active')&&ev.target===editor)closeEditor(true)});
  document.addEventListener('keydown',function(ev){var editor=document.querySelector('[data-plinko-bet-editor]');if(!editor||!editor.classList.contains('active'))return;if(ev.key==='Escape')closeEditor(false);if(ev.key==='Enter')closeEditor(true)});
  document.addEventListener('input',function(ev){if(ev.target&&ev.target.id==='plinkoBet')setBet(ev.target.value);if(ev.target&&ev.target.hasAttribute&&ev.target.hasAttribute('data-plinko-bet-input')){var input=q('plinkoBet');if(input)input.value=ev.target.value}});
  document.addEventListener('focusout',function(ev){if(ev.target&&ev.target.hasAttribute&&ev.target.hasAttribute('data-plinko-bet-input'))setBet(ev.target.value)});
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')syncHeaderCredit()});
  window.addEventListener('focus',syncHeaderCredit);window.addEventListener('vexa-ton-balance-sync',syncHeaderCredit);window.addEventListener('vexa-credit-sync',syncHeaderCredit);window.addEventListener('vexa-credit-game-change',syncHeaderCredit);
  window.addEventListener('vexa-plinko-last-win',function(ev){setLastWin(ev&&ev.detail?ev.detail.total:0);renderStats()});
  if(window.MutationObserver){var root=q('plinko');if(root)new MutationObserver(function(){if(isPlinkoActive())syncHeaderCredit()}).observe(root,{attributes:true,attributeFilter:['class']})}
  var start=function(){setBet(currentBet());syncHeaderCredit()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
`;
