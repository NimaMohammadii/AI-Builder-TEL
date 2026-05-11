export const HOME_FINANCE_STYLES = `
.home-finance-split{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:12px;margin:12px 0 4px;align-items:stretch}
.home-finance-actions{display:grid;grid-template-rows:1fr 1fr;gap:10px;min-width:0}
.home-finance-card{min-height:82px;border:0;border-radius:28px;background:rgba(255,255,255,.026);backdrop-filter:blur(3px) saturate(1.14);-webkit-backdrop-filter:blur(3px) saturate(1.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 16px 42px rgba(0,0,0,.24);color:#fff;text-align:left;padding:16px 15px;display:grid;align-content:center;gap:6px;overflow:hidden}
.home-finance-card strong{font-size:19px;line-height:1;font-weight:900;letter-spacing:-.055em}
.home-finance-card span{font-size:11px;line-height:1.25;font-weight:650;color:rgba(255,255,255,.58)}
.home-finance-visual{min-height:174px;border-radius:0;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:none!important;overflow:visible;display:grid;place-items:center;position:relative}
.home-finance-visual img{width:100%;height:100%;object-fit:contain;display:block;opacity:.98;background:transparent;border:0;box-shadow:none;filter:drop-shadow(0 18px 34px rgba(0,0,0,.26))}
.home-finance-visual img[src$="home-finance-image.png"]{object-fit:contain;padding:0;opacity:.98}
@media(max-width:360px){.home-finance-split{gap:9px}.home-finance-card{min-height:74px;border-radius:24px;padding:13px}.home-finance-card strong{font-size:17px}.home-finance-visual{min-height:158px}}
`;
