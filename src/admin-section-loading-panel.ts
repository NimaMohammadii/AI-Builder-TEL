export const ADMIN_SECTION_LOADING_PANEL_SCRIPT = `<script>
(function(){
  var observer=null,patching=false,stateTimer=0;
  function minutes(row){var i=row&&row.querySelector('[data-loading-minutes]');return Math.max(0,Number(i&&i.value||0))}
  function expiresFromMinutes(row){var n=minutes(row);return n>0?new Date(Date.now()+n*60000).toISOString():null}
  function formatLeft(ms){ms=Math.max(0,Math.floor(Number(ms)||0));var d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60,sec=Math.floor(ms/1000)%60;return d+'d '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
  function patchLoadingStates(){
    fetch('/admin/api/section-locks',{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      var map={};(data.sections||[]).forEach(function(x){map[x.id]=x});
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
    list.querySelectorAll('.lock-row').forEach(function(row){
      var base=row.querySelector('[data-lock-section]');if(!base)return;
      var id=base.getAttribute('data-lock-section');var actions=row.querySelector('.lock-actions');if(!actions)return;
      actions.style.gridTemplateColumns='1fr 1fr 1fr';
      if(!row.querySelector('[data-loading-minutes]')){
        var input=document.createElement('input');input.type='number';input.min='0';input.step='1';input.placeholder='loading minutes';input.setAttribute('data-loading-minutes',id);input.style.marginTop='0';row.insertBefore(input,actions);
      }
      if(row.querySelector('[data-loading-lock]'))return;
      var b=document.createElement('button');b.type='button';b.className='lock-toggle loading';b.textContent='Loading';b.setAttribute('data-loading-lock',id);actions.appendChild(b);
      b.onclick=function(){var st=document.getElementById('locksStatus');if(st)st.textContent='Saving loading...';fetch('/admin/api/section-locks/loading-timed',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({sectionId:id,expiresAt:expiresFromMinutes(row)})}).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})}).then(function(res){if(!res.ok)throw new Error(res.json&&res.json.error||'Could not save');if(st)st.textContent='Loading saved';if(typeof loadLocks==='function')loadLocks();setTimeout(patch,120);setTimeout(patch,500);scheduleStatePatch(180);scheduleStatePatch(650)}).catch(function(e){if(st)st.textContent=e.message||'Could not save'});};
    });
    patching=false;scheduleStatePatch(60);
  }
  function watch(){
    var list=document.getElementById('locksList');if(!list||observer)return;
    observer=new MutationObserver(function(){setTimeout(patch,20)});
    observer.observe(list,{childList:true,subtree:false});
    patch();
  }
  document.addEventListener('click',function(){setTimeout(watch,60);setTimeout(patch,150);setTimeout(patch,500)},true);
  document.addEventListener('DOMContentLoaded',function(){setTimeout(watch,300);setTimeout(patch,900)});
  setInterval(function(){watch();patch()},1200);
  watch();setTimeout(watch,600);setTimeout(patch,1400);
})();
</script>`;