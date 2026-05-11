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
body.deposit-open #home .home-intro-card,body.withdraw-open #home .home-intro-card,body.transactions-open #home .home-intro-card{opacity:0!important;filter:blur(14px);transform:scale(.98);transition:opacity .16s ease,filter .16s ease,transform .16s ease;pointer-events:none!important}
#connect .card .pad{padding:0!important}
#connect .card .title{margin:0 0 12px!important}
#connect .card h3{margin:0;font-size:24px!important;line-height:1.04!important;font-weight:850!important;letter-spacing:-.055em!important}
#connect .card .title span,#connect .card .tiny,#connect .card .notice{color:rgba(255,255,255,.62)!important;font-size:13px!important;line-height:1.48!important;font-weight:470!important;letter-spacing:-.015em!important}
#connect .card .field label{color:rgba(255,255,255,.52)!important}
#connect .card input,#connect .card .primary,#connect .card .ghost{border-radius:999px!important}
#home .home-intro-card h2{margin:0 0 8px;font-size:24px;line-height:1.04;font-weight:850;letter-spacing:-.055em}
#home .home-intro-card p{margin:0;color:rgba(255,255,255,.62);font-size:13px;line-height:1.48;font-weight:470;letter-spacing:-.015em}
.top #rankPill{position:fixed!important;left:178px!important;top:calc(120px + env(safe-area-inset-top))!important;transform:none!important;height:32px!important;min-width:76px!important;padding:0 12px!important;font-size:12px!important;z-index:95!important}
#home .deposit-sheet{position:fixed;inset:0;z-index:120;display:none;align-items:center;justify-content:center;padding:20px 16px calc(92px + env(safe-area-inset-bottom))}
#home .deposit-sheet.open{display:flex}
#home .deposit-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.30);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
#home .deposit-panel{position:relative!important;left:auto!important;right:auto!important;bottom:auto!important;width:min(100%,528px);max-height:min(78vh,620px);margin:auto;border-radius:32px!important;background:rgba(8,8,8,.34)!important;border:0!important;box-shadow:0 22px 62px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.10)!important;backdrop-filter:blur(2px) saturate(1.08)!important;-webkit-backdrop-filter:blur(2px) saturate(1.08)!important;overflow:auto;animation:depositCenterIn .34s cubic-bezier(.18,.88,.22,1.08)}
#home .deposit-panel .pad{padding:24px 22px 24px!important}
#home .deposit-panel .deposit-title,#home .deposit-panel .deposit-copy,#home .deposit-panel .deposit-custom-field,#home .deposit-panel .deposit-pay-button,#home .deposit-panel .deposit-stars-logo,#home .withdraw-status,#home .withdraw-success,#home .transactions-list{opacity:0;animation:depositItemIn .42s cubic-bezier(.18,.88,.22,1.08) forwards}
#home .deposit-panel .deposit-title{animation-delay:.04s}#home .deposit-panel .deposit-copy{animation-delay:.10s}#home .deposit-panel .deposit-custom-field{animation-delay:.16s}#home .deposit-panel .deposit-pay-button{animation-delay:.22s}#home .deposit-panel .deposit-stars-logo,#home .withdraw-status,#home .withdraw-success,#home .transactions-list{animation-delay:.29s}
#home .deposit-title{display:flex!important;align-items:center!important;justify-content:space-between!important;margin:0 0 14px!important;gap:12px!important}
#home .deposit-title-main{display:flex;align-items:center;gap:10px;min-width:0}
#home .deposit-credit-icon,.withdraw-title-icon{width:34px;height:34px;border-radius:50%;object-fit:cover;filter:drop-shadow(0 8px 18px rgba(255,255,255,.12));display:grid;place-items:center;background:rgba(255,255,255,.055);color:#fff;flex:0 0 auto}.withdraw-title-icon svg{width:24px;height:24px}
#home .deposit-title h3{font-size:20px!important;line-height:1.05!important;font-weight:900!important;letter-spacing:-.055em!important;white-space:nowrap}
#home .deposit-close{width:38px!important;height:38px!important;min-width:38px!important;padding:0!important;border:0!important;background:rgba(255,255,255,.035)!important;color:#fff!important;display:grid!important;place-items:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important}
#home .deposit-close svg{width:20px;height:20px;display:block}
#home .deposit-copy{margin:8px auto 18px!important;max-width:330px;text-align:center;color:rgba(255,255,255,.76)!important;font-size:16px!important;line-height:1.36!important;font-weight:750!important;letter-spacing:-.035em!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}
#home .deposit-presets,#home .connect-style-presets{display:none!important}
#home .deposit-custom-field{margin:0 auto 12px!important;max-width:340px}
#home .deposit-custom-field label{display:block;text-align:center;color:rgba(255,255,255,.58)!important;font-size:11px!important;line-height:1!important;font-weight:800!important;letter-spacing:.14em!important;text-transform:uppercase;margin:0 0 10px!important}
#home .deposit-amount-row{height:58px;border-radius:999px;background:rgba(255,255,255,.052)!important;border:0!important;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;padding:0 14px 0 18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 14px 34px rgba(0,0,0,.14)!important;backdrop-filter:blur(6px) saturate(1.14)!important;-webkit-backdrop-filter:blur(6px) saturate(1.14)!important}
#home .withdraw-wallet-row{grid-template-columns:1fr!important;padding-right:18px!important}
#home .deposit-panel .deposit-amount-row input{height:100%!important;min-width:0!important;background:transparent!important;border:0!important;border-radius:0!important;color:#fff!important;text-align:left!important;font-size:17px!important;font-weight:650!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;padding:0!important;letter-spacing:-.015em!important}
#home .deposit-panel .deposit-amount-row input::placeholder{color:rgba(255,255,255,.48)!important;font-weight:520!important;font-size:17px!important;letter-spacing:-.015em!important}
#home .deposit-ton-equivalent{white-space:nowrap;color:rgba(255,255,255,.72);font-size:12px;font-weight:800;letter-spacing:-.015em;background:rgba(255,255,255,.065);border-radius:999px;padding:8px 10px;line-height:1}
#home .deposit-pay-button{display:block!important;width:min(100%,340px)!important;height:54px!important;margin:0 auto 18px!important;border-radius:999px!important;font-size:16px!important;font-weight:900!important;background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.07))!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 18px 38px rgba(0,0,0,.22)!important;backdrop-filter:blur(6px) saturate(1.14)!important;-webkit-backdrop-filter:blur(6px) saturate(1.14)!important;transition:transform .18s ease,background .18s ease}
#home .deposit-pay-button:active{transform:scale(.985);background:linear-gradient(135deg,rgba(255,255,255,.23),rgba(255,255,255,.09))!important}
#home .deposit-stars-logo{display:grid;justify-items:center;gap:7px;margin:4px auto 0;color:rgba(255,255,255,.72);font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
#home .deposit-stars-logo svg{width:52px;height:52px;filter:drop-shadow(0 12px 22px rgba(255,174,0,.24));animation:depositStarPulse 2.9s ease-in-out infinite}
#home .withdraw-status{min-height:18px;margin:0 auto 8px;max-width:340px;text-align:center;color:rgba(255,255,255,.62);font-size:12px;font-weight:700}
#home .withdraw-success{display:none;justify-items:center;gap:6px;margin:6px auto 0;text-align:center;color:#fff}.withdraw-success.show{display:grid!important}.withdraw-success svg{width:78px;height:78px;filter:drop-shadow(0 14px 28px rgba(25,230,129,.18));animation:withdrawCheckPop .72s cubic-bezier(.18,.88,.22,1.18) both}.withdraw-success svg path{stroke-dasharray:48;stroke-dashoffset:48;animation:withdrawCheckDraw .55s ease .22s forwards}.withdraw-success strong{font-size:17px;font-weight:900;letter-spacing:-.04em}.withdraw-success span{font-size:12px;color:rgba(255,255,255,.62);font-weight:650}
#home .transactions-panel{max-height:min(82vh,650px)}
#home .transactions-title-icon{background:rgba(255,255,255,.07)}
#home .transactions-copy{margin-bottom:14px!important}
#home .transactions-list{display:grid;gap:10px;max-height:390px;overflow:auto;padding:2px 2px 4px;scrollbar-width:none}
#home .transactions-list::-webkit-scrollbar{display:none}
#home .transaction-row{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:10px;align-items:center;border-radius:22px;background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 12px 28px rgba(0,0,0,.14);backdrop-filter:blur(6px) saturate(1.12);-webkit-backdrop-filter:blur(6px) saturate(1.12);padding:12px 12px;animation:depositItemIn .36s ease both}
#home .transaction-icon{width:42px;height:42px;border-radius:17px;display:grid;place-items:center;color:#fff;background:rgba(255,255,255,.055)}
#home .transaction-icon svg{width:24px;height:24px}.transaction-icon.in{color:#42f594}.transaction-icon.out{color:#ffcf6b}
#home .transaction-main{min-width:0}.transaction-main strong{display:block;font-size:14px;font-weight:900;letter-spacing:-.035em;color:#fff}.transaction-main span{display:block;margin-top:4px;font-size:10px;font-weight:700;color:rgba(255,255,255,.48);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#home .transaction-side{text-align:right;white-space:nowrap}.transaction-side b{display:block;font-size:13px;font-weight:900;color:#fff}.transaction-side em{display:block;margin-top:5px;font-size:9px;font-style:normal;font-weight:850;text-transform:uppercase;letter-spacing:.04em;color:rgba(255,255,255,.55)}.transaction-side em.completed{color:#42f594}.transaction-side em.pending{color:#ffcf6b}
#home .transactions-empty{text-align:center;color:rgba(255,255,255,.62);font-size:13px;font-weight:750;padding:26px 8px;border-radius:22px;background:rgba(255,255,255,.035);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
body.deposit-keyboard-open .tabs{transform:none!important;bottom:calc(12px + env(safe-area-inset-bottom))!important;opacity:0!important;pointer-events:none!important}
body.deposit-keyboard-open #home .deposit-sheet{padding-bottom:20px!important}
@keyframes depositIn{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes depositCenterIn{from{opacity:0;transform:translateY(22px) scale(.92)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes depositItemIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes depositStarPulse{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3px) scale(1.035)}}@keyframes withdrawCheckPop{0%{opacity:0;transform:scale(.62) rotate(-8deg)}70%{opacity:1;transform:scale(1.08) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}@keyframes withdrawCheckDraw{to{stroke-dashoffset:0}}
@media(prefers-reduced-motion:reduce){#home .deposit-panel,#home .deposit-panel .deposit-title,#home .deposit-panel .deposit-copy,#home .deposit-panel .deposit-custom-field,#home .deposit-panel .deposit-pay-button,#home .deposit-panel .deposit-stars-logo,#home .deposit-stars-logo svg,#home .withdraw-status,#home .withdraw-success,#home .withdraw-success svg,#home .withdraw-success svg path,#home .transactions-list,#home .transaction-row{animation:none!important;opacity:1!important;transform:none!important;stroke-dashoffset:0!important}}
`;
