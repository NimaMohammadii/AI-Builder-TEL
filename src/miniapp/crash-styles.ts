export const CRASH_STYLES = `
#crash.crash-view{height:100%;overflow:hidden}
#crash .crash-page{height:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:12px;padding:4px 0 112px}
#crash .crash-stage{position:relative;height:min(43vh,356px);min-height:322px;border-radius:34px;overflow:hidden;background:#000!important;border:0!important;outline:0!important;box-shadow:0 22px 56px rgba(0,0,0,.24)!important;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#crash .crash-stage:before,#crash .crash-stage:after{content:"";position:absolute;inset:0;background:none!important;pointer-events:none;z-index:1}
#crash .crash-chart-square{display:none!important}
#crash .crash-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;background:#000!important;z-index:2}
#crash .crash-multiplier-wrap{position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);text-align:center;z-index:4;pointer-events:none}
#crash .crash-multiplier{position:static!important;transform:none!important;text-align:center;font-size:clamp(38px,12vw,52px);font-weight:930;letter-spacing:-.075em;color:#fff!important;text-shadow:0 14px 30px rgba(0,0,0,.42);pointer-events:none}
#crash .crash-next-round{margin-top:7px;color:rgba(255,255,255,.60);font-size:12px;font-weight:850;letter-spacing:.02em;text-shadow:0 8px 18px rgba(0,0,0,.42)}
#crash .crash-hidden-state,#crash .crash-starting,#crash .crash-network{display:none!important}
#crash .crash-controls{position:relative;border:0!important;outline:0!important;border-radius:28px;background:rgba(255,255,255,.018)!important;padding:12px;box-shadow:0 18px 44px rgba(0,0,0,.20)!important;backdrop-filter:blur(20px) saturate(130%);-webkit-backdrop-filter:blur(20px) saturate(130%);overflow:visible}
#crash .crash-controls:before{content:"";position:absolute;inset:0;border-radius:28px;background:radial-gradient(circle at 50% -20%,rgba(55,0,16,.18),rgba(55,0,16,.045) 42%,rgba(55,0,16,0) 78%);pointer-events:none;z-index:0}
#crash .crash-controls:after{display:none!important}
#crash .crash-controls>*{position:relative;z-index:1}
#crash .crash-field{display:grid;gap:6px}
#crash .crash-label{font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.58);font-weight:850;text-shadow:0 6px 16px rgba(0,0,0,.30)}
#crash .crash-amount{display:grid;grid-template-columns:minmax(0,1fr) 94px;gap:7px}
#crash .crash-amount input{height:42px!important;border-radius:17px!important;background:transparent!important;border:0!important;outline:0!important;color:#fff!important;text-align:center!important;font-weight:910!important;font-size:17px!important;box-shadow:0 10px 24px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.025)!important;backdrop-filter:blur(20px) saturate(130%)!important;-webkit-backdrop-filter:blur(20px) saturate(130%)!important;-webkit-text-fill-color:#fff!important}
#crash .crash-auto-field{margin-top:8px}
#crash .crash-auto{height:42px;border-radius:17px;background:transparent!important;border:0!important;outline:0!important;display:grid;grid-template-columns:minmax(0,1fr) 30px;align-items:center;box-shadow:0 10px 24px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.025)!important;backdrop-filter:blur(20px) saturate(130%);-webkit-backdrop-filter:blur(20px) saturate(130%)}
#crash .crash-auto input{height:42px!important;border:0!important;outline:0!important;background:transparent!important;color:#fff!important;text-align:center!important;font-weight:910!important;font-size:17px!important;-webkit-text-fill-color:#fff!important}
#crash .crash-auto span{display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.64);font-size:12px;font-weight:900;padding-right:6px}
#crash .crash-quick{display:grid;grid-template-columns:1fr 1fr;gap:5px}
#crash .crash-quick button{height:42px;border:0!important;outline:0!important;border-radius:16px;background:transparent!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-size:12px;font-weight:900;box-shadow:0 9px 21px rgba(0,0,0,.11),inset 0 1px 0 rgba(255,255,255,.022)!important;backdrop-filter:blur(20px) saturate(130%);-webkit-backdrop-filter:blur(20px) saturate(130%)}
#crash .crash-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}
#crash .crash-primary,#crash .crash-secondary{height:45px;border:0!important;outline:0!important;border-radius:17px;font-weight:930;font-size:12px;color:#fff!important;-webkit-text-fill-color:#fff!important;box-shadow:0 11px 26px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.028)!important;backdrop-filter:blur(20px) saturate(130%);-webkit-backdrop-filter:blur(20px) saturate(130%);background:transparent!important}
#crash .crash-primary{background:linear-gradient(145deg,rgba(60,0,18,.12),rgba(255,255,255,0))!important}
#crash .crash-secondary{background:rgba(255,255,255,0)!important}
#crash .crash-primary:disabled,#crash .crash-secondary:disabled{opacity:.42;background:transparent!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
#crash .crash-primary:not(:disabled):active,#crash .crash-secondary:not(:disabled):active,#crash .crash-quick button:active{transform:scale(.985)}
#crash .crash-amount input:focus,#crash .crash-auto:focus-within,#crash .crash-quick button:focus-visible,#crash .crash-primary:focus-visible,#crash .crash-secondary:focus-visible{box-shadow:0 12px 28px rgba(0,0,0,.16),0 0 0 1px rgba(72,0,22,.24),inset 0 1px 0 rgba(255,255,255,.03)!important}
#crash .crash-history{display:flex!important;gap:6px;overflow-x:auto;overflow-y:hidden;margin-top:10px;min-height:30px;padding:2px 1px 1px;scrollbar-width:none;visibility:visible!important;opacity:1!important}
#crash .crash-history::-webkit-scrollbar{display:none}
#crash .crash-history span{flex:0 0 auto;border-radius:999px;background:rgba(255,255,255,.055)!important;border:0!important;outline:0!important;padding:7px 10px;font-size:11px;font-weight:890;color:rgba(255,255,255,.90)!important;box-shadow:0 8px 18px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.035)!important;backdrop-filter:blur(18px) saturate(125%);-webkit-backdrop-filter:blur(18px) saturate(125%)}
`;