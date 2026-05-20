export const PREDICT_ZONE_NAV_HIDE_STYLES = `
body:has(#predictzone.active) .tabs{display:none!important}
body:has(#predictzone.active) .content{padding-bottom:calc(18px + env(safe-area-inset-bottom))!important}
body:has(#predictzone.active) #predictzone .predict-zone-simple-shell{min-height:0!important;display:block!important;padding:0 0 120px!important;overflow:visible!important;background:transparent!important}
`;