export const PLAY_ZONE_ROW_IMAGE_FIX = `
#playzone .game-grid{row-gap:8px!important}
#playzone .play-zone-row-ad{display:none!important}
#playzone .play-zone-card-ad{width:100%!important;min-width:0!important;height:86px!important;min-height:86px!important;margin:-4px 0 10px!important;overflow:visible!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;pointer-events:none!important}
#playzone .play-zone-card-ad img{width:100%!important;height:86px!important;max-width:none!important;max-height:86px!important;display:block!important;object-fit:contain!important;object-position:center!important;background:transparent!important;border:0!important;box-shadow:none!important;margin:0 auto!important;padding:0!important}
#playzone .play-zone-card-ad.is-empty{visibility:hidden!important}
@media(max-width:380px){#playzone .game-grid{row-gap:7px!important}#playzone .play-zone-card-ad{height:76px!important;min-height:76px!important;margin:-3px 0 9px!important}#playzone .play-zone-card-ad img{height:76px!important;max-height:76px!important}}
`;
