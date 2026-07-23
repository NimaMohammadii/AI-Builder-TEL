export const ADMIN_SECTION_LOADING_PANEL_SCRIPT = `<script>
(function(){
  var observer=null,patching=false,stateTimer=0,broadcastTimer=0;
  var loadingSections={home:1,connect:1,playzone:1,predict:1,flow:1,mines:1,plinko:1,crash:1,ghostrun:1};
  function minutes(row){var i=row&&row.querySelector('[data-loading-minutes]');return Math.max(0,Number(i&&i.value||0))}
  function formatLeft(ms){ms=Math.max(0,Math.floor(Number(ms)||0));var d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60,sec=Math.floor(ms/1000)%60;return d+'d '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
  function broadcastLockChange(){
    if(broadcastTimer)clearTimeout(broadcastTimer);
    broadcastTimer=setTimeout(function(){broadcastTimer=0;fetch('/admin/api/section-lock-events/broadcast',{method:'POST',credentials:'same-origin',cache:'no-store'}).catch(function(){})},350);
  }
  function globalBlock(){
    var list=document.getElementById('locksList');if(!list||document.getElementById('globalMiniAppLoadingBlock'))return;
    var block=document.createElement('div');
    block.id='globalMiniAppLoadingBlock';
    block.style.cssText='margin:0 0 14px;padding:12px;border-radius:18px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.10)';
    block.innerHTML='<strong style="display:block;font-size:13px;margin-bottom:6px">Global Mini App Loading</strong><p class="muted small-text" style="margin:0 0 10px">Put the entire mini app into loading mode for all users.</p><input id="globalLoadingMinutes" type="number" min="0" step="1" placeholder="global loading minutes" style="margin-bottom:8px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button id="globalLoadingOn" class="lock-toggle loading" type="button">Global Loading</button><button id="globalLoadingOff" class="lock-toggle" type="button">Open App</button></div>';
    list.parentNode.insertBefore(block,list);
    var on=block.querySelector('#globalLoadingOn');var off=block.querySelector('#globalLoadingOff');var input=block.querySelector('#globalLoadingMinutes');
    on.onclick=function(){var st=document.getElementById('locksStatus');if(st)st.textContent='Saving global loading...';fetch('/admin/api/section-loading-mode',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({sectionId:'global-loading',minutes:Math.max(0,Number(input&&input.value||0))})}).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})}).then(function(res){if(!res.ok)throw new Error(res.json&&res.json.error||'Could not save');if(st)st.textContent='Global loading saved';broadcastLockChange();if(typeof loadLocks==='function')loadLocks();setTimeout(patch,140)}).catch(function(e){if(st)st.textContent=e.message||'Could not save'});};
    off.onclick=function(){var st=document.getElementById('locksStatus');if(st)st.textContent='Opening mini app...';fetch('/admin/api/section-locks-timed',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({sectionId:'global-loading',locked:false})}).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})}).then(function(res){if(!res.ok)throw new Error(res.json&&res.json.error||'Could not open app');if(st)st.textContent='Mini app opened';broadcastLockChange();if(typeof loadLocks==='function')loadLocks();setTimeout(patch,140)}).catch(function(e){if(st)st.textContent=e.message||'Could not open app'});};
  }
  function patchLoadingStates(){
    fetch('/admin/api/section-locks',{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      var map={};(data.sections||[]).forEach(function(x){map[x.id]=x});
      var global=map['global-loading'];var on=document.getElementById('globalLoadingOn');var off=document.getElementById('globalLoadingOff');
      if(on)on.classList.toggle('active',global&&global.mode==='loading');if(off)off.classList.toggle('active',!global||global.mode==='open');
      var list=document.getElementById('locksList');if(!list)return;
      list.querySelectorAll('.lock-row').forEach(function(row){
        var base=row.querySelector('[data-lock-section]');if(!base)return;
        var id=base.getAttribute('data-lock-section');var item=map[id];if(!item)return;
        var loading=row.querySelector('[data-loading-lock]');if(loading)loading.classList.toggle('active',item.mode==='loading');
        var lock=row.querySelector('[data-lock-section]');if(lock)lock.classList.toggle('active',item.mode==='locked');
        var open=row.querySelector('[data-lock-open]');if(open)open.classList.toggle('active',item.mode==='open');
        var code=row.querySelector('[data-code-lock]');if(code)code.classList.toggle('active',item.mode==='code');
        var state=row.querySelector('.lock-state');
        if(state&&item.mode==='loading')state.innerHTML='LOADING'+(item.expiresAt?' · <span data-expires-at="'+item.expiresAt+'">'+formatLeft(item.remainingMs)+'</span>':' · forever')+(item.hasCode?' · code saved':'');
      });
    }).catch(function(){});
  }
  function scheduleStatePatch(delay){if(stateTimer)clearTimeout(stateTimer);stateTimer=setTimeout(function(){stateTimer=0;patchLoadingStates()},delay||80)}
  function patch(){
    if(patching)return;patching=true;
    var list=document.getElementById('locksList');if(!list){patching=false;return}
    globalBlock();
    list.querySelectorAll('.lock-row').forEach(function(row){
      var base=row.querySelector('[data-lock-section]');if(!base)return;
      var id=base.getAttribute('data-lock-section');var actions=row.querySelector('.lock-actions');if(!actions)return;
      if(id==='global-loading'){row.style.display='none';return;}
      if(!loadingSections[id]){var old=row.querySelector('[data-loading-lock]');if(old)old.remove();var oldInput=row.querySelector('[data-loading-minutes]');if(oldInput)oldInput.remove();return;}
      actions.style.gridTemplateColumns='1fr 1fr 1fr';
      if(!row.querySelector('[data-loading-minutes]')){
        var input=document.createElement('input');input.type='number';input.min='0';input.step='1';input.placeholder='loading minutes';input.setAttribute('data-loading-minutes',id);input.style.marginTop='0';row.insertBefore(input,actions);
      }
      if(row.querySelector('[data-loading-lock]'))return;
      var b=document.createElement('button');b.type='button';b.className='lock-toggle loading';b.textContent='Loading';b.setAttribute('data-loading-lock',id);actions.appendChild(b);
      b.onclick=function(){var st=document.getElementById('locksStatus');if(st)st.textContent='Saving loading...';fetch('/admin/api/section-loading-mode',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({sectionId:id,minutes:minutes(row)})}).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})}).then(function(res){if(!res.ok)throw new Error(res.json&&res.json.error||'Could not save');if(st)st.textContent='Loading saved';broadcastLockChange();if(typeof loadLocks==='function')loadLocks();setTimeout(patch,120);setTimeout(patch,500);scheduleStatePatch(180);scheduleStatePatch(650)}).catch(function(e){if(st)st.textContent=e.message||'Could not save'});};
    });
    patching=false;scheduleStatePatch(60);
  }
  function watch(){
    var list=document.getElementById('locksList');if(!list||observer)return;
    observer=new MutationObserver(function(){setTimeout(patch,20)});
    observer.observe(list,{childList:true,subtree:false});
    patch();
  }
  document.addEventListener('click',function(ev){
    var t=ev.target&&ev.target.closest?ev.target.closest('[data-lock-section],[data-lock-open],[data-code-lock],[data-loading-lock]'):null;
    if(t)setTimeout(broadcastLockChange,700);
    setTimeout(watch,60);setTimeout(patch,150);setTimeout(patch,500);
  },true);
  document.addEventListener('DOMContentLoaded',function(){setTimeout(watch,300);setTimeout(patch,900)});
  setInterval(function(){watch();patch()},1200);
  watch();setTimeout(watch,600);setTimeout(patch,1400);
})();
</script>`;