export const PLINKO_CONTROLS_MODERN_STYLES = `
#plinko .plinko-controls{width:min(94%,374px)!important;display:grid!important;gap:12px!important;margin-top:2px!important;padding:14px!important;border-radius:32px!important;border:1px solid rgba(255,255,255,.10)!important;background:#050505!important;background-image:none!important;box-shadow:0 24px 74px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow:hidden!important}
#plinko .plinko-control-row{display:grid!important;grid-template-columns:minmax(0,1fr) 112px!important;gap:9px!important;align-items:end!important}
#plinko .plinko-field{display:grid!important;gap:7px!important;color:#fff!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}
#plinko .plinko-label{display:block!important;color:rgba(255,255,255,.50)!important;font-size:12px!important;font-weight:850!important;letter-spacing:-.02em!important;text-transform:none!important;line-height:1!important;white-space:nowrap!important;padding-left:3px!important}
#plinko .risk-segment,#plinko .rows-select,#plinko .autoplay-row{border-radius:18px!important;border:1px solid rgba(255,255,255,.10)!important;background:#030303!important;background-image:none!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;color:#fff!important}
#plinko .risk-segment{height:46px!important;padding:4px!important;gap:4px!important;display:grid!important;grid-template-columns:repeat(3,1fr)!important}
#plinko .risk-segment button{height:100%!important;border-radius:15px!important;background:transparent!important;color:rgba(255,255,255,.44)!important;font-size:11px!important;font-weight:900!important;letter-spacing:-.03em!important;box-shadow:none!important;transition:background .18s ease,color .18s ease,transform .18s ease!important}
#plinko .risk-segment button.active{background:rgba(255,255,255,.16)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 10px 22px rgba(0,0,0,.26)!important}
#plinko .rows-select{height:46px!important;width:100%!important;padding:0 11px!important;background:rgba(255,255,255,.075)!important;display:flex!important;align-items:center!important;justify-content:space-between!important}
#plinko .rows-select strong{font-size:20px!important;font-weight:850!important;letter-spacing:-.04em!important;font-variant-numeric:tabular-nums lining-nums!important;color:#fff!important}
#plinko .rows-select svg{opacity:.72!important;color:rgba(255,255,255,.78)!important}
#plinko .bet-amount{height:46px!important;display:grid!important;grid-template-columns:.68fr 1.64fr .68fr!important;align-items:center!important;gap:8px!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
#plinko .bet-amount input{order:2!important;min-width:0!important;width:100%!important;height:46px!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.20)!important;background:rgba(255,255,255,.14)!important;color:#fff!important;font-size:17px!important;font-weight:900!important;text-align:center!important;letter-spacing:-.025em!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;font-variant-numeric:tabular-nums lining-nums!important;padding:0 8px!important}
#plinko .bet-quick{display:contents!important}
#plinko .bet-quick button{height:46px!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.12)!important;background:rgba(255,255,255,.075)!important;color:#fff!important;font-size:15px!important;font-weight:900!important;letter-spacing:-.025em!important;box-shadow:none!important;transition:transform .18s ease,background .18s ease!important}
#plinko .bet-quick button:first-child{order:1!important}
#plinko .bet-quick button:last-child{order:3!important}
#plinko .bet-quick button:active{transform:scale(.975)!important;background:rgba(255,255,255,.16)!important}
#plinko .plinko-drop,#plinko .plinko-drop:enabled,#plinko .plinko-drop:disabled,#plinko .plinko-drop[disabled]{width:100%!important;height:62px!important;border-radius:999px!important;background:#fff!important;background-image:none!important;color:#050506!important;-webkit-text-fill-color:#050506!important;font-size:18px!important;font-weight:950!important;letter-spacing:-.025em!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:0 14px 28px rgba(0,0,0,.58)!important;border:1px solid #fff!important;text-shadow:none!important;opacity:1!important;transition:transform .18s ease,opacity .18s ease!important}
#plinko .plinko-drop:enabled:active{transform:scale(.975)!important}
#plinko .plinko-drop:disabled,#plinko .plinko-drop[disabled]{opacity:.58!important;filter:none!important;transform:scale(.985)!important}
#plinko .autoplay-row{height:44px!important;padding:0 12px!important;background:#030303!important;border-radius:18px!important;border-color:rgba(255,255,255,.08)!important}
#plinko .autoplay-label{font-size:12px!important;font-weight:850!important;color:rgba(255,255,255,.58)!important;letter-spacing:-.02em!important}
#plinko .autoplay-icon{width:24px!important;height:24px!important;background:rgba(255,255,255,.06)!important;border-color:rgba(255,255,255,.12)!important;color:rgba(255,255,255,.68)!important}
#plinko .autoplay-toggle{background:rgba(255,255,255,.10)!important;border-color:rgba(255,255,255,.12)!important}
#plinko .autoplay-toggle.active{background:#8a173a!important;border-color:#a8264f!important}
#plinko .autoplay-toggle span{box-shadow:0 4px 12px rgba(0,0,0,.42)!important}
@media(max-width:420px){#plinko .plinko-controls{width:min(94%,374px)!important;border-radius:30px!important;gap:12px!important;padding:14px!important}#plinko .plinko-control-row{gap:7px!important;grid-template-columns:minmax(0,1fr) 108px!important}#plinko .plinko-label{font-size:12px!important}#plinko .rows-select strong{font-size:19px!important}#plinko .bet-amount{grid-template-columns:.68fr 1.64fr .68fr!important;gap:8px!important}}
/* dice-aligned-plinko-controls */
`;
