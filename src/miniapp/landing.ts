export const LANDING_STYLES = `
#landing{background:transparent!important}
@media(max-width:699px),(max-height:599px){#landing{display:none!important}}
@media(min-width:700px) and (min-height:600px){
  html body:has(#landing.active) main.app{width:min(100%,1180px)!important;padding-left:32px!important;padding-right:32px!important}
  html body:has(#landing.active) .top{width:min(100%,1080px)!important;margin-left:auto!important;margin-right:auto!important}
  #landing.web-landing-view{padding:8px 0 36px!important;overflow-y:auto!important;overflow-x:hidden!important}
  #landing .web-landing-shell{width:min(100%,1080px)!important;margin:0 auto!important;display:grid!important;gap:18px!important}
  #landing .web-landing-hero{position:relative!important;overflow:hidden!important;min-height:286px!important;padding:34px!important;border-radius:34px!important;border:1px solid rgba(255,255,255,.10)!important;background:radial-gradient(70% 130% at 0 0,rgba(120,24,50,.20),transparent 62%),radial-gradient(65% 120% at 100% 100%,rgba(92,14,40,.16),transparent 68%),rgba(7,7,8,.72)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 24px 70px rgba(0,0,0,.28)!important;backdrop-filter:blur(20px) saturate(1.12)!important;-webkit-backdrop-filter:blur(20px) saturate(1.12)!important;display:grid!important;align-content:center!important}
  #landing .web-landing-eyebrow{margin:0 0 10px!important;color:rgba(255,255,255,.48)!important;font-size:12px!important;font-weight:850!important;letter-spacing:.13em!important;text-transform:uppercase!important}
  #landing .web-landing-hero h2{max-width:720px!important;margin:0!important;color:#fff!important;font-size:clamp(44px,6vw,74px)!important;line-height:.94!important;font-weight:900!important;letter-spacing:-.065em!important}
  #landing .web-landing-copy{max-width:620px!important;margin:18px 0 0!important;color:rgba(255,255,255,.58)!important;font-size:15px!important;font-weight:560!important;line-height:1.55!important;letter-spacing:-.02em!important}
  #landing .web-landing-actions{display:flex!important;flex-wrap:wrap!important;gap:10px!important;margin-top:24px!important}
  #landing .web-landing-action{height:46px!important;padding:0 18px!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.10)!important;background:rgba(255,255,255,.055)!important;color:#fff!important;font-size:13px!important;font-weight:820!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09)!important;transition:transform .18s ease,background .18s ease!important}
  #landing .web-landing-action.primary{background:#f4f4f5!important;color:#101114!important;border-color:transparent!important;box-shadow:0 10px 28px rgba(0,0,0,.24),inset 0 1px 0 #fff!important}
  #landing .web-landing-action:active{transform:scale(.97)!important}
  #landing .web-landing-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important}
  #landing .web-landing-card{min-height:154px!important;padding:20px!important;border-radius:28px!important;border:1px solid rgba(255,255,255,.085)!important;background:rgba(8,8,9,.68)!important;color:#fff!important;text-align:left!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.075)!important;backdrop-filter:blur(16px) saturate(1.08)!important;-webkit-backdrop-filter:blur(16px) saturate(1.08)!important;display:grid!important;align-content:space-between!important;gap:16px!important;transition:transform .2s ease,background .2s ease!important}
  #landing .web-landing-card:active{transform:scale(.985)!important}
  #landing .web-landing-card strong{display:block!important;font-size:18px!important;font-weight:880!important;letter-spacing:-.04em!important}
  #landing .web-landing-card span{display:block!important;margin-top:6px!important;color:rgba(255,255,255,.48)!important;font-size:12px!important;font-weight:560!important;line-height:1.45!important}
  #landing .web-landing-card b{color:rgba(255,255,255,.72)!important;font-size:11px!important;font-weight:800!important;letter-spacing:.02em!important}
}
@media(min-width:700px) and (min-height:600px) and (max-width:899px){
  #landing .web-landing-shell{width:min(100%,680px)!important}
  #landing .web-landing-hero{min-height:250px!important;padding:28px!important}
  #landing .web-landing-grid{grid-template-columns:1fr!important}
  #landing .web-landing-card{min-height:116px!important}
}
`;

export const LANDING_SECTION = `<section id="landing" class="view web-landing-view"><div class="web-landing-shell"><section class="web-landing-hero"><p class="web-landing-eyebrow">Vexa Game</p><h2>Play, predict, and increase your chances of winning.</h2><p class="web-landing-copy">One place for quick games, live predictions, and the Lucky Zone. Choose where you want to start.</p><div class="web-landing-actions"><button class="web-landing-action primary" type="button" data-view="home">Open Lucky Zone</button><button class="web-landing-action" type="button" data-view="playzone">Explore Play Hub</button></div></section><div class="web-landing-grid"><button class="web-landing-card" type="button" data-view="home"><span><strong>Lucky Zone</strong><span>Tickets, prize pool, live draw, and previous winners.</span></span><b>Open Lucky Zone →</b></button><button class="web-landing-card" type="button" data-view="playzone"><span><strong>Play Hub</strong><span>Jump into Vexa games from one clean game hub.</span></span><b>Explore games →</b></button><button class="web-landing-card" type="button" data-view="predictzone"><span><strong>Predict</strong><span>Follow prediction markets for assets and important events.</span></span><b>Open Predict →</b></button></div></div></section>`;
