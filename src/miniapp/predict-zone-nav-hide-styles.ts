export const PREDICT_ZONE_NAV_HIDE_STYLES = `
/* Predict now uses the shared app header and bottom navigation, matching the other primary sections. */
body:has(#predictzone.active) .top{display:flex!important}
body:has(#predictzone.active) .tabs{display:grid!important}
body:has(#predictzone.active) #predictzone .predict-zone-back{display:none!important}
`;
