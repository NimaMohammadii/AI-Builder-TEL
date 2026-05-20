export const PREDICT_ZONE_NAV_HIDE_STYLES = `
body:has(#predictzone.active) .tabs{display:none!important}
body:has(#predictzone.active) .content{padding-bottom:calc(18px + env(safe-area-inset-bottom))!important}
body:has(#predictzone.active) #predictzone .predict-zone-simple-shell{position:relative!important;min-height:calc(100vh - 188px)!important;display:grid!important;align-content:start!important;padding:0 0 120px!important;overflow:visible!important;background:transparent!important}
body:has(#predictzone.active) #predictzone .predict-zone-category-menu{left:0!important;width:100%!important;max-width:100%!important;margin:0 0 13px!important;padding:0 0 10px!important;overflow-x:auto!important;overflow-y:visible!important;scroll-snap-type:none!important;box-sizing:border-box!important}
body:has(#predictzone.active) #predictzone .predict-zone-category-menu:after{flex-basis:36px!important}
@media(max-width:380px){body:has(#predictzone.active) #predictzone .predict-zone-category-menu{left:0!important;width:100%!important;margin:0 0 12px!important;padding:0 0 10px!important}}
`;