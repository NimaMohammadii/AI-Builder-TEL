export const SECTION_BACKGROUND_SCRIPT = `
(function(){
  var lastSections=[];
  function cssUrl(url){return 'url("'+String(url).replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'")'}
  function aliases(id){
    var map={predict:['predictzone'],topplayers:['top-players'], 'top-players':['topplayers'],flow:['tts'],playzone:['play-zone']};
    return [id].concat(map[id]||[]);
  }
  function findTarget(id){
    var ids=aliases(String(id||''));
    for(var i=0;i<ids.length;i++){
      var el=document.getElementById(ids[i]);
      if(el)return el;
    }
    for(var j=0;j<ids.length;j++){
      var found=document.querySelector('[data-section-id="'+String(ids[j]).replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"],[data-view="'+String(ids[j]).replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"]');
      if(found)return found;
    }
    return null;
  }
  function apply(sections){
    if(!Array.isArray(sections))return;
    lastSections=sections;
    sections.forEach(function(section){
      if(!section||!section.id)return;
      var el=findTarget(section.id);
      if(!el)return;
      if(!section.backgroundUrl){el.classList.remove('has-admin-background');el.style.removeProperty('--admin-section-background-image');return;}
      el.classList.add('has-admin-background');
      el.style.setProperty('--admin-section-background-image',cssUrl(section.backgroundUrl));
    });
  }
  function load(){
    fetch('/app/api/section-backgrounds',{credentials:'same-origin',cache:'no-store',headers:{'cache-control':'no-store'}})
      .then(function(r){return r.ok?r.json():null})
      .then(function(j){if(j)apply(j.sections)})
      .catch(function(){if(lastSections.length)apply(lastSections)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
  document.addEventListener('click',function(){setTimeout(function(){if(lastSections.length)apply(lastSections)},60)},true);
  window.VexaSectionBackgrounds={refresh:load,apply:apply};
})();
`;

export const SECTION_BACKGROUND_STYLES = `
.has-admin-background {
  background-color: #000 !important;
  background-image: var(--admin-section-background-image) !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
.view.has-admin-background,
.view.has-admin-background.active {
  background-color: #000 !important;
  background-image: var(--admin-section-background-image) !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
.view.has-admin-background::before {
  content: "";
  position: sticky;
  top: 0;
  display: block;
  width: 100%;
  height: 0;
  pointer-events: none;
  z-index: 0;
}
.view.has-admin-background > * {
  position: relative;
  z-index: 1;
}
`;
