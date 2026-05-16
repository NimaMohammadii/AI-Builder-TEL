export const MARKET_TAB_SHAPE_FIX = `
#market .market-segment-split{column-gap:2px!important;overflow:visible!important;background:transparent!important}
#market .market-segment-split .market-segment-btn{clip-path:none!important;background:transparent!important;overflow:visible!important}
#market .market-segment-split .market-segment-btn:after{content:""!important;position:absolute!important;inset:0!important;z-index:-1!important;background:rgba(255,255,255,.035)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important;pointer-events:none!important}
#market .market-segment-split .market-segment-btn:first-child{padding-right:14px!important;border-radius:999px 13px 13px 999px!important}
#market .market-segment-split .market-segment-btn:first-child:after{right:-6px!important;border-radius:999px 15px 15px 999px!important;transform:skewX(-14deg)!important;transform-origin:right center!important}
#market .market-segment-split .market-segment-btn:last-child{padding-left:14px!important;border-radius:13px 999px 999px 13px!important}
#market .market-segment-split .market-segment-btn:last-child:after{left:-6px!important;border-radius:15px 999px 999px 15px!important;transform:skewX(-14deg)!important;transform-origin:left center!important}
#market .market-segment-split .market-segment-btn.active{background:transparent!important;box-shadow:none!important}
#market .market-segment-split .market-segment-btn:first-child.active:after{background:linear-gradient(100deg,rgba(255,255,255,.11),rgba(255,255,255,.05))!important;box-shadow:0 12px 28px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.15)!important}
#market .market-segment-split .market-segment-btn:last-child.active:after{background:linear-gradient(100deg,rgba(255,255,255,.05),rgba(255,255,255,.11))!important;box-shadow:0 12px 28px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.15)!important}
@media(max-width:380px){#market .market-segment-split{column-gap:1px!important}#market .market-segment-split .market-segment-btn:first-child{padding-right:10px!important}#market .market-segment-split .market-segment-btn:last-child{padding-left:10px!important}}
`;
