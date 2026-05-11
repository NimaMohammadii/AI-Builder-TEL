export const HOME_OVERRIDES = `
#home{padding-top:4px}
#home .home-intro-card,
#connect .card{
  margin:0 0 12px;
  padding:18px 18px 20px;
  border-radius:30px;
  background:rgba(255,255,255,.035)!important;
  border:0!important;
  outline:0!important;
  color:#fff;
  box-shadow:0 18px 42px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.14)!important;
  backdrop-filter:blur(4px) saturate(1.12)!important;
  -webkit-backdrop-filter:blur(4px) saturate(1.12)!important;
}
#connect .card .pad{padding:0!important}
#connect .card .title{margin:0 0 12px!important}
#connect .card h3{
  margin:0;
  font-size:24px!important;
  line-height:1.04!important;
  font-weight:850!important;
  letter-spacing:-.055em!important;
}
#connect .card .title span,
#connect .card .tiny,
#connect .card .notice{
  color:rgba(255,255,255,.62)!important;
  font-size:13px!important;
  line-height:1.48!important;
  font-weight:470!important;
  letter-spacing:-.015em!important;
}
#connect .card .field label{
  color:rgba(255,255,255,.52)!important;
}
#connect .card input,
#connect .card .primary,
#connect .card .ghost{
  border-radius:999px!important;
}
#home .home-intro-card h2{
  margin:0 0 8px;
  font-size:24px;
  line-height:1.04;
  font-weight:850;
  letter-spacing:-.055em;
}
#home .home-intro-card p{
  margin:0;
  color:rgba(255,255,255,.62);
  font-size:13px;
  line-height:1.48;
  font-weight:470;
  letter-spacing:-.015em;
}
#home .deposit-sheet{position:fixed;inset:0;z-index:120;display:none;align-items:center;justify-content:center;padding:20px 16px calc(92px + env(safe-area-inset-bottom))}
#home .deposit-sheet.open{display:flex}
#home .deposit-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.18);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
#home .deposit-panel{position:relative!important;left:auto!important;right:auto!important;bottom:auto!important;width:min(100%,528px);max-height:min(78vh,620px);margin:auto;border-radius:32px!important;background:rgba(255,255,255,.028)!important;border:0!important;box-shadow:0 22px 62px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.12)!important;backdrop-filter:blur(2px) saturate(1.1)!important;-webkit-backdrop-filter:blur(2px) saturate(1.1)!important;overflow:auto;animation:depositCenterIn .34s cubic-bezier(.18,.88,.22,1.08)}
#home .deposit-panel .pad{padding:24px 22px 26px!important}
#home .deposit-panel .notice,
#home .deposit-panel input,
#home .connect-style-presets button{background:rgba(255,255,255,.045)!important;border:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 14px 34px rgba(0,0,0,.15)!important;backdrop-filter:blur(6px) saturate(1.14)!important;-webkit-backdrop-filter:blur(6px) saturate(1.14)!important}
#home .deposit-panel .notice{border-radius:26px!important;color:rgba(255,255,255,.68)!important}
#home .deposit-panel input{color:#fff!important}
#home .connect-style-presets{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}
#home .connect-style-presets button{min-height:64px;border-radius:22px;color:#fff}
#home .connect-style-presets b{display:block;font-size:18px}
#home .connect-style-presets span{display:block;margin-top:4px;color:rgba(255,255,255,.58);font-size:11px}
@keyframes depositIn{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes depositCenterIn{from{opacity:0;transform:translateY(22px) scale(.92)}to{opacity:1;transform:translateY(0) scale(1)}}
`;
