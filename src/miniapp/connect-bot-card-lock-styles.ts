export const CONNECT_BOT_CARD_LOCK_STYLES = `
#connect>.card:first-child{position:relative;overflow:hidden}
#connect>.card:first-child.connect-bot-card-locked>.pad{filter:blur(1px);opacity:.42;pointer-events:none;user-select:none}
.connect-card-locked-view{position:absolute;inset:0;z-index:12;display:grid;place-items:center;padding:14px;background:rgba(255,255,255,.012);backdrop-filter:blur(4px) saturate(1.18);-webkit-backdrop-filter:blur(4px) saturate(1.18);pointer-events:auto}
.connect-card-lock-box{width:min(100%,260px);min-height:164px;border-radius:30px;border:0;background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.024));box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 18px 58px rgba(0,0,0,.28);backdrop-filter:blur(4px) saturate(1.22);-webkit-backdrop-filter:blur(4px) saturate(1.22);display:grid;justify-items:center;align-content:center;gap:7px;padding:14px 16px;text-align:center;color:#fff}
.connect-card-lock-icon{width:48px;height:48px;border-radius:20px;display:grid;place-items:center;background:rgba(255,255,255,.055);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.connect-card-lock-icon svg{width:34px;height:34px;color:#fff;opacity:.95}
.connect-card-lock-image{width:58px;height:58px;object-fit:contain;border:0;background:transparent;box-shadow:none}
.connect-card-heart{width:28px;height:28px;border-radius:999px;display:grid;place-items:center;margin-top:-17px;margin-left:42px;background:rgba(255,255,255,.065);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);color:rgba(255,255,255,.9)}
.connect-card-heart svg{width:17px;height:17px}
.connect-card-lock-box h2{margin:0;font-size:18px;font-weight:850;line-height:1;letter-spacing:-.045em}
.connect-card-lock-box p{margin:0;color:rgba(255,255,255,.62);font-size:11.5px;font-weight:520;line-height:1.3}
.connect-card-code-input{width:100%;height:38px;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.055)!important;color:#fff!important;text-align:center;font-size:13px;padding:0 12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.09)!important;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.connect-card-code-input::placeholder{color:rgba(255,255,255,.38)}
.connect-card-code-submit{width:100%;height:38px;border-radius:999px;background:rgba(255,255,255,.88);color:#050505;font-weight:820;font-size:13px;box-shadow:0 10px 32px rgba(255,255,255,.10)}
.connect-card-code-status{min-height:14px;color:rgba(255,255,255,.6);font-size:10.5px}
`;
