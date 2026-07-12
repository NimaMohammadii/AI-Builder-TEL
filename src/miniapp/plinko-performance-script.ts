export const PLINKO_PERFORMANCE_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function ensureStyle(){
    if(q('plinkoPerformanceGuardStyle'))return;
    var style=document.createElement('style');
    style.id='plinkoPerformanceGuardStyle';
    style.textContent='#plinkoCanvasV2,#plinko .plinko-stage{contain:layout paint style}#plinkoLiveHistoryFeed{width:min(92%,408px)!important;margin:18px auto!important;border-radius:32px!important;background:#050505!important;border:1px solid rgba(255,255,255,.10)!important;box-shadow:0 24px 74px rgba(0,0,0,.50),inset 0 1px 0 rgba(255,255,255,.08)!important;padding:14px!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow:hidden!important;transition:max-height .34s cubic-bezier(.2,.8,.2,1),padding .28s ease,opacity .2s ease!important;max-height:430px!important;contain:layout paint style;content-visibility:auto;contain-intrinsic-size:374px 220px}#plinkoLiveHistoryFeed:not(.open){max-height:54px!important;padding-bottom:12px!important}.plinko-history-head{display:flex!important;align-items:center!important;justify-content:space-between!important;margin-bottom:10px!important;color:rgba(255,255,255,.50)!important;font-size:13px!important;font-weight:850!important;letter-spacing:-.02em!important;text-transform:none!important}.plinko-history-title{display:inline-flex!important;align-items:center!important;gap:7px!important;color:rgba(255,255,255,.58)!important}.plinko-history-title svg{width:17px!important;height:17px!important;color:rgba(255,255,255,.55)!important}.plinko-history-head b{color:rgba(255,255,255,.92)!important;font-size:13px!important;font-weight:900!important;letter-spacing:-.02em!important;text-transform:none!important;white-space:nowrap!important}.plinko-history-head-actions{display:flex!important;align-items:center!important;gap:8px!important}.plinko-history-toggle{width:28px!important;height:28px!important;border:0!important;outline:0!important;border-radius:10px!important;background:rgba(255,255,255,.055)!important;color:rgba(255,255,255,.85)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;box-shadow:none!important;transition:transform .22s ease,background .18s ease!important}.plinko-history-toggle svg{width:18px!important;height:18px!important;display:block!important;transition:transform .28s cubic-bezier(.2,.8,.2,1)!important}.plinko-history-toggle path{fill:none!important;stroke:currentColor!important;stroke-width:2.4!important;stroke-linecap:round!important;stroke-linejoin:round!important}#plinkoLiveHistoryFeed.open .plinko-history-toggle svg{transform:rotate(180deg)!important}.plinko-history-toggle:active{transform:scale(.94)!important;background:rgba(255,255,255,.09)!important}.plinko-history-list{display:grid!important;gap:6px!important;max-height:394px!important;overflow-y:auto!important;overflow-x:hidden!important;padding-right:2px!important;scrollbar-width:thin!important;scrollbar-color:rgba(255,255,255,.18) transparent!important;transition:max-height .34s cubic-bezier(.2,.8,.2,1),opacity .22s ease!important;contain:layout paint style;content-visibility:auto;contain-intrinsic-size:350px 220px}#plinkoLiveHistoryFeed:not(.open) .plinko-history-list{max-height:0!important;opacity:0!important;pointer-events:none!important}.plinko-history-list::-webkit-scrollbar{width:4px!important;display:block!important}.plinko-history-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18)!important;border-radius:999px!important}.plinko-history-row{min-height:34px!important;border-radius:17px!important;background:#030303!important;border:1px solid rgba(255,255,255,.08)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important;padding:2px 10px!important}.plinko-history-name{font-size:12px!important}.plinko-history-meta,.plinko-history-total{font-size:11px!important}';
    document.head.appendChild(style);
  }
  function isPlinkoLiveUrl(url){return String(url||'').indexOf('/app/api/plinko/live')!==-1}
  function isRemoteBallMessage(data){try{var msg=JSON.parse(data);return !!(msg&&msg.type==='plinko-ball')}catch(e){return false}}
  function installLiveBallFilter(){
    if(window.__vexaPlinkoLiveBallFilter||typeof window.WebSocket!=='function')return;
    window.__vexaPlinkoLiveBallFilter=true;
    var NativeWebSocket=window.WebSocket;
    function VexaWebSocket(url,protocols){
      if(!isPlinkoLiveUrl(url))return protocols!==undefined?new NativeWebSocket(url,protocols):new NativeWebSocket(url);
      var native=protocols!==undefined?new NativeWebSocket(url,protocols):new NativeWebSocket(url);
      var handlers={onopen:null,onmessage:null,onclose:null,onerror:null};
      var proxy={
        send:function(data){return native.send(data)},
        close:function(code,reason){return native.close(code,reason)},
        addEventListener:function(type,listener,options){
          if(typeof listener!=='function')return native.addEventListener(type,listener,options);
          return native.addEventListener(type,function(ev){if(type==='message'&&isRemoteBallMessage(ev&&ev.data))return;return listener.call(proxy,ev)},options);
        },
        removeEventListener:function(type,listener,options){return native.removeEventListener(type,listener,options)},
        dispatchEvent:function(event){return native.dispatchEvent(event)}
      };
      ['url','protocol','extensions','readyState','bufferedAmount'].forEach(function(key){Object.defineProperty(proxy,key,{get:function(){return native[key]}})});
      Object.defineProperty(proxy,'binaryType',{get:function(){return native.binaryType},set:function(value){native.binaryType=value}});
      ['open','message','close','error'].forEach(function(type){
        var prop='on'+type;
        Object.defineProperty(proxy,prop,{get:function(){return handlers[prop]},set:function(fn){handlers[prop]=fn}});
        native.addEventListener(type,function(ev){if(type==='message'&&isRemoteBallMessage(ev&&ev.data))return;var fn=handlers[prop];if(typeof fn==='function')fn.call(proxy,ev)});
      });
      return proxy;
    }
    ['CONNECTING','OPEN','CLOSING','CLOSED'].forEach(function(key){try{VexaWebSocket[key]=NativeWebSocket[key]}catch(e){}});
    VexaWebSocket.prototype=NativeWebSocket.prototype;
    window.WebSocket=VexaWebSocket;
  }
  function ensureLiveCardToggle(){
    var card=q('plinkoLiveHistoryFeed');
    if(!card)return;
    if(!card.classList.contains('open')&&!card.dataset.plinkoToggleTouched)card.classList.add('open');
    var head=card.querySelector('.plinko-history-head');
    if(!head||head.querySelector('.plinko-history-toggle'))return;
    var total=head.querySelector('#plinkoHistoryTotal');
    var actions=document.createElement('div');
    actions.className='plinko-history-head-actions';
    if(total)actions.appendChild(total);
    var toggle=document.createElement('button');
    toggle.id='plinkoHistoryToggle';
    toggle.className='plinko-history-toggle';
    toggle.type='button';
    toggle.setAttribute('aria-label','Toggle live Plinko bets');
    toggle.setAttribute('aria-expanded','true');
    toggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>';
    actions.appendChild(toggle);
    head.appendChild(actions);
  }
  ensureStyle();
  installLiveBallFilter();
  ensureLiveCardToggle();
  if(window.MutationObserver){
    var toggleFrame=0;
    var toggleObserver=new MutationObserver(function(){
      if(toggleFrame)return;
      toggleFrame=requestAnimationFrame(function(){
        toggleFrame=0;
        ensureLiveCardToggle();
        if(q('plinkoHistoryToggle'))toggleObserver.disconnect();
      });
    });
    toggleObserver.observe(document.body,{childList:true,subtree:true});
  }
  document.addEventListener('click',function(ev){
    var toggle=ev.target&&ev.target.closest&&ev.target.closest('#plinkoHistoryToggle');
    if(toggle){
      var card=q('plinkoLiveHistoryFeed');
      if(card){var open=!card.classList.contains('open');card.dataset.plinkoToggleTouched='1';card.classList.toggle('open',open);toggle.setAttribute('aria-expanded',open?'true':'false')}
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }
  },true);
})();
`;
