export const CRASH_STYLES = `
#crash.crash-view{height:100%;overflow:hidden}
#crash .crash-page{height:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;padding:4px 0 128px}
#crash .crash-stage{position:relative;height:min(43vh,356px);min-height:322px;border-radius:34px;overflow:hidden;background:#050506!important;border:0!important;outline:0!important;box-shadow:0 22px 56px rgba(0,0,0,.24)!important;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#crash .crash-stage:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 0,rgba(92,10,31,.10),rgba(92,10,31,0) 42%),linear-gradient(180deg,rgba(255,255,255,.010),rgba(255,255,255,0) 45%);pointer-events:none;z-index:1}
#crash .crash-stage:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.024) 1px,transparent 1px);background-size:20% 100%;opacity:.28;pointer-events:none;z-index:1}
#crash .crash-chart-square{position:absolute;left:50%;top:52%;width:138px;height:138px;transform:translate(-50%,-50%);border-radius:22px;background:rgba(255,255,255,.028);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 22px 50px rgba(0,0,0,.20);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:1;pointer-events:none}
#crash .crash-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;background:transparent;z-index:2}
#crash .crash-multiplier{position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);text-align:center;font-size:clamp(52px,16vw,72px);font-weight:930;letter-spacing:-.085em;color:#fff!important;text-shadow:0 16px 38px rgba(0,0,0,.42);z-index:3;pointer-events:none}
#crash .crash-hidden-state,#crash .crash-starting,#crash .crash-network{display:none!important}
#crash .crash-controls{border:0!important;outline:0!important;border-radius:32px;background:transparent!important;padding:15px;box-shadow:0 20px 52px rgba(0,0,0,.16)!important;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#crash .crash-field{display:grid;gap:9px}#crash .crash-label{font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:rgba(255,255,255,.52);font-weight:860}#crash .crash-amount{display:grid;grid-template-columns:minmax(0,1fr) 112px;gap:8px}
#crash .crash-amount input{height:50px!important;border-radius:21px!important;background:transparent!important;border:0!important;outline:0!important;color:#fff!important;text-align:center!important;font-weight:930!important;font-size:20px!important;box-shadow:0 12px 26px rgba(0,0,0,.12)!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;-webkit-text-fill-color:#fff!important}
#crash .crash-quick{display:grid;grid-template-columns:1fr 1fr;gap:6px}
#crash .crash-quick button{height:50px;border:0!important;outline:0!important;border-radius:19px;background:transparent!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-weight:910;box-shadow:0 10px 22px rgba(0,0,0,.10)!important;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#crash .crash-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:11px}
#crash .crash-primary,#crash .crash-secondary{height:54px;border:0!important;outline:0!important;border-radius:22px;font-weight:950;font-size:14px;color:#fff!important;-webkit-text-fill-color:#fff!important;box-shadow:0 12px 28px rgba(0,0,0,.14)!important;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);background:transparent!important}
#crash .crash-primary:disabled,#crash .crash-secondary:disabled{opacity:.42;background:transparent!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
#crash .crash-primary:not(:disabled):active,#crash .crash-secondary:not(:disabled):active,#crash .crash-quick button:active{transform:scale(.985)}
#crash .crash-history{display:flex;gap:6px;overflow:hidden;margin-top:12px;min-height:28px}
#crash .crash-history span{border-radius:999px;background:transparent!important;border:0!important;outline:0!important;padding:7px 10px;font-size:11px;font-weight:870;color:rgba(255,255,255,.74);box-shadow:none!important;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
`;
