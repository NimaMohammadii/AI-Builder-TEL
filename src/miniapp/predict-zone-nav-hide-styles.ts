export const PREDICT_ZONE_NAV_HIDE_STYLES = `
body:has(#predictzone.active) .tabs{display:none!important}
body:has(#predictzone.active) .content{padding-bottom:calc(18px + env(safe-area-inset-bottom))!important}
`;