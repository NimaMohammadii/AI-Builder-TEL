export const MINIAPP_THEME_SCRIPT = `<script>
(function(){
  var defaults={accent:'#23020b',accentSoft:'rgba(48, 3, 15, .28)',accentShadow:'rgba(88, 7, 27, .18)'};
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
    style.textContent=':root{--vexa-theme-accent:#23020b;--vexa-theme-soft:rgba(48,3,15,.28);--vexa-theme-shadow:rgba(88,7,27,.18)}html,body{background:#000!important;background-color:#000!important;background-image:none!important}body:before,body:after{background:transparent!important;background-image:none!important;box-shadow:none!important}.app{background:#000!important;background-color:#000!important;background-image:none!important;isolation:isolate!important}.app:before{content:""!important;position:fixed!important;inset:0!important;left:0!important;right:0!important;top:0!important;bottom:0!important;height:auto!important;width:auto!important;z-index:0!important;background:radial-gradient(ellipse 115% 58% at 50% -9%,var(--vexa-theme-soft),transparent 62%),radial-gradient(ellipse 76% 44% at 50% 42%,var(--vexa-theme-shadow),transparent 72%),radial-gradient(ellipse 58% 42% at -10% 40%,var(--vexa-theme-shadow),transparent 76%),radial-gradient(ellipse 58% 42% at 110% 40%,var(--vexa-theme-shadow),transparent 76%),radial-gradient(ellipse 82% 46% at 50% 108%,var(--vexa-theme-soft),transparent 72%),linear-gradient(180deg,#050203 0%,#030202 46%,#000 100%)!important;pointer-events:none!important}.app:after{background:transparent!important;background-image:none!important;box-shadow:none!important}.top,.content,.tabs,.toast{position:relative!important;z-index:1!important}main.app,.content,.view,.view.active,#home,#playzone,#predictzone,#market,#results,#topplayers,#mines,#plinko,#crash,#wheel,#dice,#rps,.home-view,.play-zone-view,.predict-zone-view,.market-view,.results-view,.top-players-view{background:transparent!important;background-color:transparent!important;background-image:none!important}.top,header.top{background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;border:0!important}.top:before,.top:after,header.top:before,header.top:after{background:transparent!important;background-image:none!important;box-shadow:none!important;border:0!important}.brand:before{opacity:.38!important;background:radial-gradient(ellipse 64% 46% at 48% 50%,rgba(0,0,0,.42),transparent 76%)!important}.tabs{background:rgba(0,0,0,.38)!important;box-shadow:0 0 22px var(--vexa-theme-shadow),0 14px 36px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.07)!important}.tab.active,.menu-item.active,.wheel-quick button.active,.rps-choice.is-picked{background:var(--vexa-theme-accent)!important;box-shadow:0 0 18px var(--vexa-theme-shadow),0 14px 30px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.08)!important}.card,.glass,.panel,.home-card,.finance-card,.game-card-shell,.play-zone-section-head,.market-card,.predict-card,.action-card,.daily-card,.league-card{box-shadow:0 0 18px var(--vexa-theme-shadow),0 14px 34px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.07)!important}.rps-view{--rps-accent:var(--vexa-theme-accent)!important;--rps-accent-soft:var(--vexa-theme-soft)!important;--rps-accent-edge:var(--vexa-theme-shadow)!important}.rps-arena,.rps-panel{box-shadow:0 0 0 1px var(--vexa-theme-shadow),0 0 22px var(--vexa-theme-shadow),0 18px 46px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.045)!important}.rps-play{background:linear-gradient(180deg,var(--vexa-theme-accent),#090003)!important;box-shadow:0 0 0 1px var(--vexa-theme-shadow),0 0 18px var(--vexa-theme-shadow),0 14px 30px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.07)!important}.rankPill,#rankPill,.top-balance-pill,.home-action,.deposit-primary,.withdraw-primary{box-shadow:0 0 12px var(--vexa-theme-shadow),0 10px 24px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.12)!important}.game-card-live,.wheel-panel,.wheel-stat,.wheel-multiplier-btn,.wheel-join{box-shadow:0 0 16px var(--vexa-theme-shadow),0 14px 34px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.09)!important}.wheel-join{background:var(--vexa-theme-accent)!important;color:rgba(255,255,255,.92)!important}.rps-arena:before{background:linear-gradient(180deg,var(--vexa-theme-soft),transparent 30%),radial-gradient(circle at 50% 0%,var(--vexa-theme-soft),transparent 52%)!important}.vexa-boot,.vexa-boot:before{background:radial-gradient(ellipse 118% 56% at 50% -10%,var(--vexa-theme-soft),transparent 62%),linear-gradient(180deg,#050203 0%,#040202 46%,#000 100%)!important}';
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
