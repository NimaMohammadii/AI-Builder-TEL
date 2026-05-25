export const PREDICT_BOTTOM_OVERLAY_FIX_STYLES = `
body:has(#predictzone.active) .content{height:auto!important;min-height:calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;padding-bottom:calc(10px + env(safe-area-inset-bottom))!important}
body:has(#predictzone.active) #predictzone.active{min-height:calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;overflow:visible!important}
body:has(#predictzone.active) #predictzone .predict-zone-simple-shell{min-height:0!important;padding-bottom:calc(34px + env(safe-area-inset-bottom))!important;overflow:visible!important}
body:has(#predictzone.active) #predictzone .football-predict-view{padding-bottom:calc(34px + env(safe-area-inset-bottom))!important}
body:has(#predictzone.active) #predictzone:after,body:has(#predictzone.active) .content:after,body:has(#predictzone.active) .app:after{pointer-events:none!important}
`;
