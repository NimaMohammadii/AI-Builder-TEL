export const PLAY_ZONE_ROW_IMAGE_FIX = `
#playzone .game-grid{row-gap:10px!important}
#playzone .play-zone-row-ad{display:none!important}
#playzone .play-zone-card-ad{width:100%!important;min-width:0!important;height:148px!important;min-height:148px!important;margin:-3px 0 18px!important;overflow:visible!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;pointer-events:none!important}
#playzone .play-zone-card-ad img{width:100%!important;height:148px!important;max-width:none!important;max-height:148px!important;display:block!important;object-fit:contain!important;object-position:center!important;background:transparent!important;border:0!important;box-shadow:none!important;margin:0 auto!important;padding:0!important}
#playzone .play-zone-card-ad.is-empty{visibility:hidden!important}
@media(max-width:380px){#playzone .game-grid{row-gap:10px!important}#playzone .play-zone-card-ad{height:128px!important;min-height:128px!important;margin:-3px 0 16px!important}#playzone .play-zone-card-ad img{height:128px!important;max-height:128px!important}}
`;
