export const PLAY_ZONE_SCRIPT = `
(function(){
  function setTitle(id){var title=document.getElementById('brandTitle');if(!title)return;if(id==='playzone')title.textContent='Play Zone'}
  document.addEventListener('click',function(ev){var btn=ev.target&&ev.target.closest&&ev.target.closest('[data-view]');if(!btn)return;var id=btn.getAttribute('data-view');setTimeout(function(){setTitle(id)},0)},true);
})();
`;
