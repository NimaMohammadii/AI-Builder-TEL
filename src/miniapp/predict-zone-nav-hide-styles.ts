export const PREDICT_ZONE_NAV_HIDE_STYLES = `
body:has(#predictzone.active) .top{display:none!important}
body:has(#predictzone.active) .tabs{display:none!important}
body:has(#predictzone.active) .app{padding-top:calc(14px + env(safe-area-inset-top))!important;padding-bottom:calc(18px + env(safe-area-inset-bottom))!important}
body:has(#predictzone.active) .content{width:calc(100% + 32px)!important;height:calc(100dvh - 32px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;margin-left:-16px!important;margin-right:-16px!important;padding:0 0 calc(18px + env(safe-area-inset-bottom))!important;overflow:hidden!important}
body:has(#predictzone.active) .app:before,body:has(#predictzone.active) .app:after{display:none!important}
body:has(#predictzone.active) #predictzone.active{padding-left:16px!important;padding-right:16px!important}
body:has(#predictzone.active) #predictzone .predict-zone-simple-shell{position:relative!important;min-height:calc(100vh - 56px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;display:block!important;padding:30px 0 120px!important;overflow:visible!important;background:transparent!important}
body:has(#predictzone.active) #predictzone .predict-zone-category-menu{position:sticky!important;top:0!important;left:-16px!important;z-index:40!important;width:calc(100% + 32px)!important;max-width:none!important;margin:0 0 13px!important;padding:0 16px 10px!important;overflow-x:auto!important;overflow-y:visible!important;scroll-snap-type:none!important;box-sizing:border-box!important;background:transparent!important}
body:has(#predictzone.active) #predictzone .predict-zone-category-card{background:rgba(255,255,255,.035)!important;color:rgba(255,255,255,.58)!important;box-shadow:0 12px 26px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.10),inset 0 -1px 0 rgba(255,255,255,.03)!important;-webkit-backdrop-filter:blur(2px)!important;backdrop-filter:blur(2px)!important}
body:has(#predictzone.active) #predictzone .predict-zone-category-card span{color:rgba(255,255,255,.58)!important;font-weight:760!important}
body:has(#predictzone.active) #predictzone .predict-zone-category-card.active{background:rgba(255,255,255,.055)!important}
body:has(#predictzone.active) #predictzone .predict-zone-category-card.active span{color:#fff!important;font-weight:820!important}
body:has(#predictzone.active) #predictzone .predict-zone-category-menu:after{flex-basis:48px!important}
@media(max-width:380px){body:has(#predictzone.active) .app{padding-top:calc(12px + env(safe-area-inset-top))!important}body:has(#predictzone.active) #predictzone .predict-zone-simple-shell{padding-top:26px!important}body:has(#predictzone.active) #predictzone .predict-zone-category-menu{left:-16px!important;width:calc(100% + 32px)!important;margin:0 0 12px!important;padding:0 16px 10px!important}}
`;