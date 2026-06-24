export const SECTION_BACKGROUND_SCRIPT = `
(function(){
  function cssUrl(url){return 'url("'+String(url).replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'")'}
  function apply(sections){
    if(!Array.isArray(sections))return;
    sections.forEach(function(section){
      if(!section||!section.id)return;
      var aliases={predict:'predictzone','top-players':'topplayers','topplayers':'topplayers'};
      var el=document.getElementById(section.id)||document.getElementById(aliases[section.id]||'');
      if(!el)return;
      if(!section.backgroundUrl){el.classList.remove('has-admin-background');el.style.removeProperty('--admin-section-background-image');return;}
      el.classList.add('has-admin-background');
      el.style.setProperty('--admin-section-background-image',cssUrl(section.backgroundUrl));
    });
  }
  function load(){
    fetch('/app/api/section-backgrounds',{credentials:'same-origin',cache:'no-store'})
      .then(function(r){return r.ok?r.json():null})
      .then(function(j){if(j)apply(j.sections)})
      .catch(function(){});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
})();
`;

export const SECTION_BACKGROUND_STYLES = `
.view.has-admin-background {
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
