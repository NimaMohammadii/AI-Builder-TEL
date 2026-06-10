export const PREDICT_ZONE_NAV_HIDE_STYLES = `
/* Predict keeps the shared chrome on its landing card grid, then switches to Telegram-native back navigation inside a selected prediction card. */
body:has(#predictzone.active) .top{display:flex!important}
body:has(#predictzone.active) .tabs{display:grid!important}
body:has(#predictzone.active) #predictzone .predict-zone-back{display:none!important}
body:has(#predictzone.active.predict-market-detail-mode) .tabs{display:none!important}
body:has(#predictzone.active.predict-market-detail-mode) .content{padding-bottom:0!important}
#predictzone.predict-market-detail-mode .predict-zone-category-menu,
#predictzone.predict-market-detail-mode .predict-toolbar-row{display:none!important}
#predictzone.predict-market-detail-mode{padding-bottom:calc(22px + env(safe-area-inset-bottom))!important}
#predictzone.predict-market-detail-mode .predict-zone-simple-shell{min-height:calc(100vh - 82px);padding-bottom:calc(24px + env(safe-area-inset-bottom))!important}
`;
