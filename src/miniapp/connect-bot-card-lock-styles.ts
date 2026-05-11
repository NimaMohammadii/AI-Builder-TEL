export const CONNECT_BOT_CARD_LOCK_STYLES = `
#connect>.card:first-child{position:relative;overflow:hidden}
#connect>.card:first-child.connect-bot-card-locked>.pad{display:none!important}
.connect-card-locked-view{position:relative!important;inset:auto!important;z-index:2;display:block;padding:24px 28px;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;pointer-events:auto}
.connect-card-lock-box{width:100%;min-height:170px;border-radius:30px;border:0;background:rgba(255,255,255,.035);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 14px 42px rgba(0,0,0,.18);backdrop-filter:blur(4px) saturate(1.16);-webkit-backdrop-filter:blur(4px) saturate(1.16);display:grid;justify-items:center;align-content:center;gap:8px;padding:18px 18px;text-align:center;color:#fff}
.connect-card-lock-icon{width:58px;height:58px;border-radius:22px;display:grid;place-items:center;background:rgba(255,255,255,.055);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.connect-card-lock-icon svg{width:38px;height:38px;color:#fff;opacity:.95}
.connect-card-lock-image{width:62px;height:62px;object-fit:contain;border:0;background:transparent;box-shadow:none}
.connect-card-heart{display:none!important}
.connect-card-lock-box h2{margin:2px 0 0;font-size:23px;font-weight:900;line-height:1;letter-spacing:-.055em}
.connect-card-lock-box p{margin:0;color:rgba(255,255,255,.66);font-size:13px;font-weight:560;line-height:1.35;max-width:230px}
.connect-card-lock-box.code-card{min-height:210px;gap:9px}
.connect-card-code-input{width:min(100%,220px);height:40px;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.055)!important;color:#fff!important;text-align:center;font-size:13px;padding:0 12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.connect-card-code-input::placeholder{color:rgba(255,255,255,.38)}
.connect-card-code-submit{width:min(100%,220px);height:40px;border-radius:999px;background:rgba(255,255,255,.88);color:#050505;font-weight:850;font-size:13px;box-shadow:0 10px 28px rgba(255,255,255,.08)}
.connect-card-code-status{min-height:14px;color:rgba(255,255,255,.6);font-size:10.5px}
`;
