export const PLAY_ZONE_ROW_IMAGE_FIX = `
#playzone .game-grid{row-gap:8px!important}
#playzone .play-zone-row-ad{display:none!important}
#playzone .play-zone-card-ad{width:100%!important;min-width:0!important;height:74px!important;min-height:74px!important;margin:-2px 0 8px!important;overflow:visible!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;pointer-events:none!important}
#playzone .play-zone-card-ad img{width:100%!important;height:74px!important;max-width:none!important;max-height:74px!important;display:block!important;object-fit:contain!important;object-position:center!important;background:transparent!important;border:0!important;box-shadow:none!important;margin:0 auto!important;padding:0!important}
#playzone .play-zone-card-ad.is-empty{visibility:hidden!important}
@media(max-width:380px){#playzone .game-grid{row-gap:7px!important}#playzone .play-zone-card-ad{height:66px!important;min-height:66px!important;margin:-2px 0 7px!important}#playzone .play-zone-card-ad img{height:66px!important;max-height:66px!important}}
`;
