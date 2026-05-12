export const PLAY_ZONE_ROW_IMAGE_FIX = `
.play-zone-row-ad{grid-column:1/-1!important;display:grid!important;align-items:center!important;justify-content:space-between!important;gap:14px!important;height:136px!important;min-height:136px!important;margin:12px 0 20px!important;overflow:visible!important;pointer-events:none!important}
.play-zone-row-ad--right{grid-template-columns:minmax(0,36%) 178px!important;grid-template-areas:"copy image"!important}
.play-zone-row-ad--left{grid-template-columns:178px minmax(0,36%)!important;grid-template-areas:"image copy"!important}
.play-zone-row-ad__copy{grid-area:copy!important;max-width:none!important}
.play-zone-row-ad img{grid-area:image!important;width:178px!important;height:136px!important;max-width:178px!important;max-height:136px!important;min-width:0!important;display:block!important;object-fit:contain!important;object-position:center!important;align-self:center!important;justify-self:center!important}
@media(max-width:380px){.play-zone-row-ad{height:126px!important;min-height:126px!important;margin:10px 0 18px!important;gap:10px!important}.play-zone-row-ad--right{grid-template-columns:minmax(0,38%) 160px!important}.play-zone-row-ad--left{grid-template-columns:160px minmax(0,38%)!important}.play-zone-row-ad img{width:160px!important;height:126px!important;max-width:160px!important;max-height:126px!important}}
`;
