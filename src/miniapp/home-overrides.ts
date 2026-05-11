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
#home .deposit-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.28);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
#home .deposit-panel{position:relative!important;left:auto!important;right:auto!important;bottom:auto!important;width:min(100%,528px);max-height:min(78vh,620px);margin:auto;border-radius:32px!important;background:rgba(8,8,8,.34)!important;border:0!important;box-shadow:0 22px 62px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.10)!important;backdrop-filter:blur(2px) saturate(1.08)!important;-webkit-backdrop-filter:blur(2px) saturate(1.08)!important;overflow:auto;animation:depositCenterIn .34s cubic-bezier(.18,.88,.22,1.08)}
#home .deposit-panel .pad{padding:24px 22px 24px!important}
#home .deposit-title{display:flex!important;align-items:center!important;justify-content:space-between!important;margin:0 0 14px!important;gap:12px!important}
#home .deposit-title-main{display:flex;align-items:center;gap:10px;min-width:0}
#home .deposit-credit-icon{width:34px;height:34px;border-radius:50%;object-fit:cover;filter:drop-shadow(0 8px 18px rgba(255,255,255,.12))}
#home .deposit-title h3{font-size:20px!important;line-height:1.05!important;font-weight:900!important;letter-spacing:-.055em!important;white-space:nowrap}
#home .deposit-close{width:38px!important;height:38px!important;min-width:38px!important;padding:0!important;border:0!important;background:rgba(255,255,255,.035)!important;color:#fff!important;display:grid!important;place-items:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important}
#home .deposit-close svg{width:20px;height:20px;display:block}
#home .deposit-copy{margin:8px auto 18px!important;max-width:330px;text-align:center;color:rgba(255,255,255,.76)!important;font-size:16px!important;line-height:1.36!important;font-weight:750!important;letter-spacing:-.035em!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}
#home .deposit-presets,#home .connect-style-presets{display:none!important}
#home .deposit-custom-field{margin:0 auto 12px!important;max-width:340px}
#home .deposit-custom-field label{display:block;text-align:center;color:rgba(255,255,255,.58)!important;font-size:11px!important;line-height:1!important;font-weight:800!important;letter-spacing:.14em!important;text-transform:uppercase;margin:0 0 10px!important}
#home .deposit-amount-row{height:58px;border-radius:999px;background:rgba(255,255,255,.052)!important;border:0!important;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;padding:0 14px 0 18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 14px 34px rgba(0,0,0,.14)!important;backdrop-filter:blur(6px) saturate(1.14)!important;-webkit-backdrop-filter:blur(6px) saturate(1.14)!important}
#home .deposit-panel .deposit-amount-row input{height:100%!important;min-width:0!important;background:transparent!important;border:0!important;border-radius:0!important;color:#fff!important;text-align:left!important;font-size:17px!important;font-weight:650!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;padding:0!important;letter-spacing:-.015em!important}
#home .deposit-panel .deposit-amount-row input::placeholder{color:rgba(255,255,255,.48)!important;font-weight:520!important;font-size:17px!important;letter-spacing:-.015em!important}
#home .deposit-ton-equivalent{white-space:nowrap;color:rgba(255,255,255,.72);font-size:12px;font-weight:800;letter-spacing:-.015em;background:rgba(255,255,255,.065);border-radius:999px;padding:8px 10px;line-height:1}
#home .deposit-pay-button{display:block!important;width:min(100%,340px)!important;height:54px!important;margin:0 auto 18px!important;border-radius:999px!important;font-size:16px!important;font-weight:900!important;background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.07))!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 18px 38px rgba(0,0,0,.22)!important;backdrop-filter:blur(6px) saturate(1.14)!important;-webkit-backdrop-filter:blur(6px) saturate(1.14)!important}
#home .deposit-stars-logo{display:grid;justify-items:center;gap:7px;margin:4px auto 0;color:rgba(255,255,255,.72);font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
#home .deposit-stars-logo svg{width:48px;height:48px;filter:drop-shadow(0 12px 22px rgba(255,174,0,.22))}
body.deposit-keyboard-open .tabs{transform:none!important;bottom:calc(12px + env(safe-area-inset-bottom))!important;opacity:0!important;pointer-events:none!important}
body.deposit-keyboard-open #home .deposit-sheet{padding-bottom:20px!important}
@keyframes depositIn{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes depositCenterIn{from{opacity:0;transform:translateY(22px) scale(.92)}to{opacity:1;transform:translateY(0) scale(1)}}
`;
