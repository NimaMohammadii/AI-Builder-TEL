export const PREDICT_ZONE_NAV_HIDE_STYLES = `
body:has(#predictzone.active) .tabs{display:none!important}
body:has(#predictzone.active) .content{padding-bottom:calc(18px + env(safe-area-inset-bottom))!important;overflow:hidden!important}
body:has(#predictzone.active) .app:before,body:has(#predictzone.active) .app:after{display:none!important}
body:has(#predictzone.active) #predictzone .predict-zone-simple-shell{position:relative!important;min-height:calc(100vh - 188px)!important;display:grid!important;align-content:start!important;padding:0 0 120px!important;overflow:visible!important;background:transparent!important}
body:has(#predictzone.active) #predictzone .predict-zone-category-menu{left:-16px!important;width:calc(100% + 32px)!important;max-width:none!important;margin:0 0 13px!important;padding:0 16px 10px!important;overflow-x:auto!important;overflow-y:visible!important;scroll-snap-type:none!important;box-sizing:border-box!important}
body:has(#predictzone.active) #predictzone .predict-zone-category-menu:after{flex-basis:48px!important}
@media(max-width:380px){body:has(#predictzone.active) #predictzone .predict-zone-category-menu{left:-16px!important;width:calc(100% + 32px)!important;margin:0 0 12px!important;padding:0 16px 10px!important}}
`;