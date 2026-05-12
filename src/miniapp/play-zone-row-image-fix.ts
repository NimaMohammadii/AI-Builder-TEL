export const PLAY_ZONE_ROW_IMAGE_FIX = `
#playzone .game-grid{row-gap:6px!important}
#playzone .play-zone-row-ad{display:none!important}
#playzone .play-zone-card-ad{width:100%!important;min-width:0!important;height:172px!important;min-height:172px!important;margin:-8px 0 8px!important;overflow:visible!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;pointer-events:none!important}
#playzone .play-zone-card-ad img{width:100%!important;height:172px!important;max-width:none!important;max-height:172px!important;display:block!important;object-fit:contain!important;object-position:center!important;background:transparent!important;border:0!important;box-shadow:none!important;margin:0 auto!important;padding:0!important}
#playzone .play-zone-card-ad.is-empty{visibility:hidden!important}
@media(max-width:380px){#playzone .game-grid{row-gap:6px!important}#playzone .play-zone-card-ad{height:150px!important;min-height:150px!important;margin:-6px 0 8px!important}#playzone .play-zone-card-ad img{height:150px!important;max-height:150px!important}}
`;
