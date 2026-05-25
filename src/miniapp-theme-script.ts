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
    style.textContent=':root{--vexa-theme-accent:#23020b;--vexa-theme-soft:rgba(48,3,15,.28);--vexa-theme-shadow:rgba(88,7,27,.18)}html,body{background:#020001!important;background-color:#020001!important}body:before{background:radial-gradient(ellipse 118% 55% at 48% -10%,var(--vexa-theme-soft),transparent 62%),radial-gradient(ellipse 72% 42% at 50% 42%,var(--vexa-theme-shadow),transparent 68%),radial-gradient(ellipse 58% 40% at -8% 46%,var(--vexa-theme-shadow),transparent 70%),radial-gradient(ellipse 58% 40% at 108% 44%,var(--vexa-theme-shadow),transparent 70%),radial-gradient(ellipse 86% 48% at 20% 2%,var(--vexa-theme-soft),transparent 66%),radial-gradient(ellipse 82% 50% at 96% 8%,rgba(0,0,0,.52),transparent 64%),linear-gradient(180deg,#050203 0%,#060303 34%,#040303 62%,#000 100%)!important}body:after{background:linear-gradient(166deg,transparent 0 41%,var(--vexa-theme-shadow) 48%,rgba(0,0,0,.16) 55%,transparent 66%),linear-gradient(18deg,transparent 0 42%,var(--vexa-theme-shadow) 49%,rgba(0,0,0,.14) 56%,transparent 67%),radial-gradient(ellipse 78% 42% at 50% 10%,rgba(255,255,255,.035),transparent 60%),linear-gradient(180deg,rgba(255,255,255,.012),transparent 22%,rgba(0,0,0,.22) 100%)!important}.app:before{background:radial-gradient(ellipse 72% 70% at 48% 4%,var(--vexa-theme-soft),transparent 66%),radial-gradient(ellipse 96% 14% at 50% 45%,rgba(0,0,0,.22),transparent 78%),linear-gradient(24deg,transparent 0 44%,rgba(0,0,0,.14) 52%,transparent 66%),linear-gradient(151deg,transparent 0 43%,rgba(0,0,0,.13) 52%,transparent 67%),linear-gradient(92deg,transparent 0 44%,var(--vexa-theme-shadow) 51%,rgba(0,0,0,.08) 58%,transparent 68%),radial-gradient(ellipse 70% 58% at 52% 52%,var(--vexa-theme-shadow),transparent 70%),radial-gradient(ellipse 50% 60% at 4% 48%,var(--vexa-theme-shadow),transparent 72%),radial-gradient(ellipse 50% 60% at 98% 44%,var(--vexa-theme-shadow),transparent 72%),radial-gradient(ellipse 62% 72% at 20% 16%,var(--vexa-theme-soft),transparent 70%),radial-gradient(ellipse 66% 72% at 88% 8%,rgba(0,0,0,.55),transparent 72%)!important}.app:after{background:linear-gradient(160deg,transparent 0 40%,rgba(0,0,0,.08) 50%,transparent 61%),linear-gradient(26deg,transparent 0 42%,rgba(0,0,0,.07) 51%,transparent 62%),linear-gradient(180deg,rgba(255,255,255,.012),transparent 26%,rgba(0,0,0,.12) 100%)!important}main.app,.app,.content{background:transparent!important;background-color:transparent!important}.view,.view.active,#home,#playzone,#predictzone,#market,#results,#topplayers,#mines,#plinko,#crash,#wheel,#dice,#rps{background:transparent!important}.home-view,.play-zone-view,.predict-zone-view,.market-view,.results-view,.top-players-view{background:radial-gradient(ellipse at 50% -10%,var(--vexa-theme-soft),transparent 44%),linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.72) 88%,#000 100%)!important}.top,header.top,.tabs{background:rgba(0,0,0,.34)!important;box-shadow:0 0 22px var(--vexa-theme-shadow),0 14px 36px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.07)!important}.tab.active,.menu-item.active,.wheel-quick button.active,.rps-choice.is-picked{background:var(--vexa-theme-accent)!important;box-shadow:0 0 18px var(--vexa-theme-shadow),0 14px 30px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.08)!important}.card,.glass,.panel,.home-card,.finance-card,.game-card-shell,.play-zone-section-head,.market-card,.predict-card,.action-card,.daily-card,.league-card{box-shadow:0 0 18px var(--vexa-theme-shadow),0 14px 34px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.07)!important}.rps-view{--rps-accent:var(--vexa-theme-accent)!important;--rps-accent-soft:var(--vexa-theme-soft)!important;--rps-accent-edge:var(--vexa-theme-shadow)!important;background:radial-gradient(ellipse at 50% -10%,var(--vexa-theme-soft),transparent 44%),radial-gradient(ellipse at 50% 104%,var(--vexa-theme-soft),transparent 42%),linear-gradient(180deg,#050001 0%,#020001 52%,#000 100%)!important}.rps-arena,.rps-panel{box-shadow:0 0 0 1px var(--vexa-theme-shadow),0 0 22px var(--vexa-theme-shadow),0 18px 46px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.045)!important}.rps-play{background:linear-gradient(180deg,var(--vexa-theme-accent),#090003)!important;box-shadow:0 0 0 1px var(--vexa-theme-shadow),0 0 18px var(--vexa-theme-shadow),0 14px 30px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.07)!important}.rankPill,#rankPill,.top-balance-pill,.home-action,.deposit-primary,.withdraw-primary{box-shadow:0 0 18px var(--vexa-theme-shadow),0 12px 28px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.14)!important}.game-card-live,.wheel-panel,.wheel-stat,.wheel-multiplier-btn,.wheel-join{box-shadow:0 0 16px var(--vexa-theme-shadow),0 14px 34px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.09)!important}.wheel-join{background:var(--vexa-theme-accent)!important;color:rgba(255,255,255,.92)!important}.rps-arena:before{background:linear-gradient(180deg,var(--vexa-theme-soft),transparent 30%),radial-gradient(circle at 50% 0%,var(--vexa-theme-soft),transparent 52%)!important}.vexa-boot,.vexa-boot:before{background:radial-gradient(ellipse 118% 56% at 50% -10%,var(--vexa-theme-soft),transparent 62%),radial-gradient(ellipse 84% 10% at 50% 39%,rgba(0,0,0,.42),transparent 72%),linear-gradient(180deg,#050203 0%,#060303 34%,#030303 100%)!important}';
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
