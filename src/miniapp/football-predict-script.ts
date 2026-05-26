export const FOOTBALL_PREDICT_SCRIPT = `<script>
(function(){
  var matches=[
    {id:'arg-bra',stage:'World Cup',time:'Today 21:00',a:'argentina',b:'brazil'},
    {id:'fra-eng',stage:'World Cup',time:'Live soon',a:'france',b:'england'},
    {id:'spa-ger',stage:'World Cup',time:'Tomorrow 20:00',a:'spain',b:'germany'}
  ];
  var teams={};
  function root(){return document.getElementById('predictzone')}
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function team(id){return teams[id]||{id:id,name:id.charAt(0).toUpperCase()+id.slice(1),logoUrl:''}}
  function logo(id){var t=team(id),style=t.logoUrl?' style="background-image:url('+String(t.logoUrl).replace(/"/g,'')+')"':'';return '<span class="football-team-logo '+(t.logoUrl?'has-logo':'')+'"'+style+'></span>'}
  function matchHtml(m){var a=team(m.a),b=team(m.b);return '<article class="football-match-card" data-football-match="'+esc(m.id)+'"><div class="football-match-head"><span class="football-match-tag">'+esc(m.stage)+'</span><span class="football-match-time">'+esc(m.time)+'</span></div><div class="football-teams"><div class="football-team">'+logo(m.a)+'<b>'+esc(a.name)+'</b></div><div class="football-vs">VS</div><div class="football-team">'+logo(m.b)+'<b>'+esc(b.name)+'</b></div></div><div class="football-pick-row"><button type="button">'+esc(a.name)+'</button><button type="button">Draw</button><button type="button">'+esc(b.name)+'</button></div></article>'}
  function render(){var r=root();if(!r)return;var shell=r.querySelector('.predict-zone-simple-shell');if(!shell)return;var view=r.querySelector('[data-football-predict-view]');if(!view){view=document.createElement('div');view.className='football-predict-view';view.setAttribute('data-football-predict-view','');shell.appendChild(view)}view.innerHTML='<section class="football-match-list">'+matches.map(matchHtml).join('')+'</section>'}
  function show(){var r=root();if(!r)return;render();r.classList.add('football-predict-open');var grid=r.querySelector('[data-vexa-predict-group-grid]');if(grid)grid.style.display='none';var card=r.querySelector('[data-predict-card]');if(card)card.classList.add('predict-detail-hidden');var menu=r.querySelector('.predict-zone-category-menu');if(menu)menu.querySelectorAll('.predict-zone-category-card').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-vexa-predict-market')==='football')});var balance=r.querySelector('[data-predict-balance],.predict-zone-balance,.predict-balance-pill');if(balance)balance.style.display='none'}
  function hide(){var r=root();if(r)r.classList.remove('football-predict-open')}
  async function loadTeams(){try{var res=await fetch('/app/api/football-teams',{cache:'no-store'});var json=await res.json();(json.teams||[]).forEach(function(t){teams[t.id]=t});render()}catch(e){}}
  function mount(){var r=root();if(!r||r.dataset.footballPredictReady==='1')return;r.dataset.footballPredictReady='1';loadTeams();var menu=r.querySelector('.predict-zone-category-menu');if(menu){menu.addEventListener('click',function(e){var fb=e.target&&e.target.closest&&e.target.closest('[data-vexa-predict-market="football"]');if(fb){e.preventDefault();e.stopImmediatePropagation();show();return}var other=e.target&&e.target.closest&&e.target.closest('[data-vexa-predict-group],[data-vexa-predict-market]');if(other&&!fb)hide()},true)}document.addEventListener('click',function(e){var tab=e.target&&e.target.closest&&e.target.closest('[data-view="predictzone"]');if(tab)setTimeout(loadTeams,200)},true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
</script>`;