export const CRASH_STYLES = `
#crash.crash-view{height:100%;overflow:hidden}
#crash .crash-page{height:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;padding:4px 0 128px}
#crash .crash-stage{position:relative;height:min(43vh,356px);min-height:322px;border-radius:34px;overflow:hidden;background:#000!important;border:0!important;outline:0!important;box-shadow:0 22px 56px rgba(0,0,0,.24)!important;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#crash .crash-stage:before{content:"";position:absolute;inset:0;background:none!important;pointer-events:none;z-index:1}
#crash .crash-stage:after{content:"";position:absolute;inset:0;background:none!important;pointer-events:none;z-index:1}
#crash .crash-chart-square{display:none!important}
#crash .crash-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;background:#000!important;z-index:2}
#crash .crash-multiplier-wrap{position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);text-align:center;z-index:4;pointer-events:none}
#crash .crash-multiplier{position:static!important;transform:none!important;text-align:center;font-size:clamp(38px,12vw,52px);font-weight:930;letter-spacing:-.075em;color:#fff!important;text-shadow:0 14px 30px rgba(0,0,0,.42);pointer-events:none}
#crash .crash-next-round{margin-top:7px;color:rgba(255,255,255,.60);font-size:12px;font-weight:850;letter-spacing:.02em;text-shadow:0 8px 18px rgba(0,0,0,.42)}
#crash .crash-hidden-state,#crash .crash-starting,#crash .crash-network{display:none!important}
#crash .crash-controls{position:relative;border:0!important;outline:0!important;border-radius:34px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012))!important;padding:15px;box-shadow:0 26px 70px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.045)!important;backdrop-filter:blur(18px) saturate(128%);-webkit-backdrop-filter:blur(18px) saturate(128%);overflow:hidden}
#crash .crash-controls:before{content:"";position:absolute;inset:-35% -20% auto -20%;height:72%;background:radial-gradient(circle at 50% 0,rgba(70,0,20,.30),rgba(70,0,20,.10) 38%,rgba(70,0,20,0) 72%);pointer-events:none;z-index:0}
#crash .crash-controls:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.028),rgba(255,255,255,0) 45%,rgba(42,0,12,.055));pointer-events:none;z-index:0}
#crash .crash-controls>*{position:relative;z-index:1}
#crash .crash-field{display:grid;gap:9px}
#crash .crash-label{font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:rgba(255,255,255,.56);font-weight:860;text-shadow:0 7px 18px rgba(0,0,0,.32)}
#crash .crash-amount{display:grid;grid-template-columns:minmax(0,1fr) 112px;gap:8px}
#crash .crash-amount input{height:50px!important;border-radius:21px!important;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.010))!important;border:0!important;outline:0!important;color:#fff!important;text-align:center!important;font-weight:930!important;font-size:20px!important;box-shadow:0 14px 32px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.035)!important;backdrop-filter:blur(18px) saturate(125%)!important;-webkit-backdrop-filter:blur(18px) saturate(125%)!important;-webkit-text-fill-color:#fff!important}
#crash .crash-auto-field{margin-top:11px}
#crash .crash-auto{height:50px;border-radius:21px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.010))!important;border:0!important;outline:0!important;display:grid;grid-template-columns:minmax(0,1fr) 38px;align-items:center;box-shadow:0 14px 32px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.035)!important;backdrop-filter:blur(18px) saturate(125%);-webkit-backdrop-filter:blur(18px) saturate(125%)}
#crash .crash-auto input{height:50px!important;border:0!important;outline:0!important;background:transparent!important;color:#fff!important;text-align:center!important;font-weight:930!important;font-size:20px!important;-webkit-text-fill-color:#fff!important}
#crash .crash-auto span{display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.60);font-size:14px;font-weight:920;padding-right:8px}
#crash .crash-quick{display:grid;grid-template-columns:1fr 1fr;gap:6px}
#crash .crash-quick button{height:50px;border:0!important;outline:0!important;border-radius:19px;background:linear-gradient(145deg,rgba(255,255,255,.030),rgba(60,0,18,.050))!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-weight:910;box-shadow:0 12px 28px rgba(0,0,0,.13),inset 0 1px 0 rgba(255,255,255,.030)!important;backdrop-filter:blur(18px) saturate(125%);-webkit-backdrop-filter:blur(18px) saturate(125%)}
#crash .crash-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:11px}
#crash .crash-primary,#crash .crash-secondary{height:54px;border:0!important;outline:0!important;border-radius:22px;font-weight:950;font-size:14px;color:#fff!important;-webkit-text-fill-color:#fff!important;box-shadow:0 16px 34px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.040)!important;backdrop-filter:blur(18px) saturate(128%);-webkit-backdrop-filter:blur(18px) saturate(128%);background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(55,0,16,.085))!important}
#crash .crash-primary{background:linear-gradient(145deg,rgba(75,0,22,.22),rgba(255,255,255,.030))!important}
#crash .crash-secondary{background:linear-gradient(145deg,rgba(255,255,255,.028),rgba(45,0,14,.070))!important}
#crash .crash-primary:disabled,#crash .crash-secondary:disabled{opacity:.42;background:linear-gradient(145deg,rgba(255,255,255,.018),rgba(40,0,12,.035))!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
#crash .crash-primary:not(:disabled):active,#crash .crash-secondary:not(:disabled):active,#crash .crash-quick button:active{transform:scale(.985)}
#crash .crash-amount input:focus,#crash .crash-auto:focus-within,#crash .crash-quick button:focus-visible,#crash .crash-primary:focus-visible,#crash .crash-secondary:focus-visible{box-shadow:0 16px 38px rgba(0,0,0,.18),0 0 0 1px rgba(92,0,28,.28),inset 0 1px 0 rgba(255,255,255,.04)!important}
#crash .crash-history{display:flex!important;gap:6px;overflow-x:auto;overflow-y:hidden;margin-top:12px;min-height:28px;padding-bottom:1px;scrollbar-width:none}
#crash .crash-history::-webkit-scrollbar{display:none}
#crash .crash-history span{flex:0 0 auto;border-radius:999px;background:linear-gradient(145deg,rgba(255,255,255,.030),rgba(45,0,14,.050))!important;border:0!important;outline:0!important;padding:7px 10px;font-size:11px;font-weight:870;color:rgba(255,255,255,.76);box-shadow:0 8px 20px rgba(0,0,0,.10),inset 0 1px 0 rgba(255,255,255,.025)!important;backdrop-filter:blur(18px) saturate(125%);-webkit-backdrop-filter:blur(18px) saturate(125%)}
`;