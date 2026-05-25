export const MINIAPP_THEME_SCRIPT = `<script>
(function(){
  var defaults={
    accent:'#23020b',
    accentSoft:'rgba(48, 3, 15, .28)',
    accentShadow:'rgba(88, 7, 27, .18)'
  };
  function setVars(theme){
    var root=document.documentElement;
    var accent=theme&&theme.accent||defaults.accent;
    var soft=theme&&theme.accentSoft||defaults.accentSoft;
    var shadow=theme&&theme.accentShadow||defaults.accentShadow;
    root.style.setProperty('--vexa-theme-accent',accent);
    root.style.setProperty('--vexa-theme-soft',soft);
    root.style.setProperty('--vexa-theme-shadow',shadow);
    root.style.setProperty('--rps-accent',accent);
    root.style.setProperty('--rps-accent-soft',soft);
    root.style.setProperty('--rps-accent-edge',shadow);
  }
  function ensureStyle(){
    if(document.getElementById('vexaMiniAppThemeStyle'))return;
    var style=document.createElement('style');
    style.id='vexaMiniAppThemeStyle';
    style.textContent=':root{--vexa-theme-accent:#23020b;--vexa-theme-soft:rgba(48,3,15,.28);--vexa-theme-shadow:rgba(88,7,27,.18)}html,body,main.app,.app,.content{background:radial-gradient(ellipse at 50% -8%,var(--vexa-theme-soft),transparent 42%),radial-gradient(ellipse at 50% 108%,var(--vexa-theme-soft),transparent 46%),linear-gradient(180deg,#050001 0%,#020001 54%,#000 100%)!important;background-color:#020001!important}.view,.view.active,#home,#playzone,#predictzone,#market,#results{background:transparent!important}.home-view,.play-zone-view,.predict-zone-view,.market-view,.results-view,.top-players-view{background:radial-gradient(ellipse at 50% -10%,var(--vexa-theme-soft),transparent 44%),linear-gradient(180deg,rgba(0,0,0,.12),#000 88%)!important}.top,header.top,.tabs{background:rgba(0,0,0,.34)!important;box-shadow:0 0 22px var(--vexa-theme-shadow),0 14px 36px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.07)!important}.tab.active,.menu-item.active,.wheel-quick button.active,.rps-choice.is-picked{background:var(--vexa-theme-accent)!important;box-shadow:0 0 18px var(--vexa-theme-shadow),0 14px 30px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.08)!important}.card,.glass,.panel,.home-card,.finance-card,.game-card-shell,.play-zone-section-head,.market-card,.predict-card{box-shadow:0 0 18px var(--vexa-theme-shadow),0 14px 34px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.07)!important}.rps-view{--rps-accent:var(--vexa-theme-accent)!important;--rps-accent-soft:var(--vexa-theme-soft)!important;--rps-accent-edge:var(--vexa-theme-shadow)!important}.rps-view{background:radial-gradient(ellipse at 50% -10%,var(--vexa-theme-soft),transparent 44%),radial-gradient(ellipse at 50% 104%,var(--vexa-theme-soft),transparent 42%),linear-gradient(180deg,#050001 0%,#020001 52%,#000 100%)!important}.rps-arena,.rps-panel{box-shadow:0 0 0 1px var(--vexa-theme-shadow),0 0 22px var(--vexa-theme-shadow),0 18px 46px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.045)!important}.rps-play{background:linear-gradient(180deg,var(--vexa-theme-accent),#090003)!important;box-shadow:0 0 0 1px var(--vexa-theme-shadow),0 0 18px var(--vexa-theme-shadow),0 14px 30px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.07)!important}.rankPill,#rankPill,.top-balance-pill,.home-action,.deposit-primary,.withdraw-primary{box-shadow:0 0 18px var(--vexa-theme-shadow),0 12px 28px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.14)!important}.game-card-live,.wheel-panel,.wheel-stat,.wheel-multiplier-btn,.wheel-join{box-shadow:0 0 16px var(--vexa-theme-shadow),0 14px 34px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.09)!important}.wheel-join{background:var(--vexa-theme-accent)!important;color:rgba(255,255,255,.92)!important}.rps-arena::before{background:linear-gradient(180deg,var(--vexa-theme-soft),transparent 30%),radial-gradient(circle at 50% 0%,var(--vexa-theme-soft),transparent 52%)!important}';
    document.head.appendChild(style);
  }
  async function load(){
    ensureStyle();
    setVars(defaults);
    try{
      var r=await fetch('/app/api/miniapp-theme',{cache:'no-store'});
      var j=await r.json().catch(function(){return null});
      if(r.ok&&j&&j.theme)setVars(j.theme);
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  window.VexaApplyMiniAppTheme=function(theme){ensureStyle();setVars(theme||defaults)};
})();
</script>`;
