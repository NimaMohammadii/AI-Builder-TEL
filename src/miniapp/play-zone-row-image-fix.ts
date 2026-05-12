export const PLAY_ZONE_ROW_IMAGE_FIX = `
#playzone .game-grid{row-gap:16px!important}
#playzone .play-zone-row-ad{grid-column:1/-1!important;display:grid!important;align-items:center!important;justify-content:stretch!important;gap:10px!important;height:104px!important;min-height:104px!important;margin:2px 0 6px!important;overflow:hidden!important;pointer-events:none!important}
#playzone .play-zone-row-ad--right{grid-template-columns:minmax(0,34%) minmax(0,66%)!important;grid-template-areas:"copy image"!important}
#playzone .play-zone-row-ad--left{grid-template-columns:minmax(0,58%) minmax(0,42%)!important;grid-template-areas:"image copy"!important}
#playzone .play-zone-row-ad__copy{grid-area:copy!important;max-width:none!important;margin:0!important;align-self:center!important;position:relative!important;z-index:2!important}
#playzone .play-zone-row-ad img{grid-area:image!important;width:100%!important;height:104px!important;max-width:none!important;max-height:104px!important;min-width:0!important;display:block!important;object-fit:contain!important;object-position:center!important;align-self:center!important;justify-self:center!important;background:transparent!important}
#playzone .play-zone-row-ad--right img{width:100%!important;height:104px!important}
#playzone .play-zone-row-ad--left img{width:100%!important;height:104px!important}
#playzone .play-zone-row-ad.is-empty{display:none!important}
@media(max-width:380px){#playzone .game-grid{row-gap:14px!important}#playzone .play-zone-row-ad{height:96px!important;min-height:96px!important;margin:0 0 4px!important;gap:8px!important}#playzone .play-zone-row-ad--right{grid-template-columns:minmax(0,35%) minmax(0,65%)!important}#playzone .play-zone-row-ad--left{grid-template-columns:minmax(0,58%) minmax(0,42%)!important}#playzone .play-zone-row-ad img,#playzone .play-zone-row-ad--right img,#playzone .play-zone-row-ad--left img{height:96px!important;max-height:96px!important;object-fit:contain!important}}
`;
