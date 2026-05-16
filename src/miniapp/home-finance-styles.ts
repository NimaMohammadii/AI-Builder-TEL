export const HOME_FINANCE_STYLES = `
.home-finance-split{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:12px;margin:12px 0 4px;align-items:stretch}
.home-finance-actions{display:grid;grid-template-rows:1fr 1fr;gap:10px;min-width:0}
.home-finance-card{min-height:98px;border:0;border-radius:28px;background:rgba(255,255,255,.026);backdrop-filter:blur(3px) saturate(1.14);-webkit-backdrop-filter:blur(3px) saturate(1.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 16px 42px rgba(0,0,0,.24);color:#fff;text-align:center;padding:14px 12px;display:grid;place-items:center;align-content:center;gap:6px;overflow:hidden}
.home-finance-icon{width:34px;height:34px;border-radius:15px;display:grid;place-items:center;color:#fff;background:rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 12px 26px rgba(0,0,0,.18);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.home-finance-icon svg{width:26px;height:26px;display:block;filter:drop-shadow(0 6px 12px rgba(255,255,255,.08))}
.home-finance-card strong{font-size:18px;line-height:1;font-weight:900;letter-spacing:-.055em;text-align:center}
.home-finance-card span:not(.home-finance-icon){font-size:11px;line-height:1.25;font-weight:650;color:rgba(255,255,255,.58);text-align:center}
.home-finance-visual{min-height:196px;border-radius:0;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:none!important;overflow:visible;display:grid;place-items:center;position:relative}
.home-finance-visual img{width:100%;height:100%;object-fit:contain;display:block;opacity:.98;background:transparent;border:0;box-shadow:none;filter:drop-shadow(0 18px 34px rgba(0,0,0,.26));animation:homeFinanceFloat 3.8s ease-in-out infinite;will-change:transform}
.home-finance-visual img[src$="home-finance-image.png"]{object-fit:contain;padding:0;opacity:.98}
@keyframes homeFinanceFloat{0%,100%{transform:translate3d(0,-5px,0)}50%{transform:translate3d(0,7px,0)}}
@media(prefers-reduced-motion:reduce){.home-finance-visual img{animation:none!important;transform:none!important}}
@media(max-width:360px){.home-finance-split{gap:9px}.home-finance-card{min-height:90px;border-radius:24px;padding:12px 10px}.home-finance-card strong{font-size:17px}.home-finance-visual{min-height:178px}.home-finance-icon{width:31px;height:31px}.home-finance-icon svg{width:23px;height:23px}}
`;
