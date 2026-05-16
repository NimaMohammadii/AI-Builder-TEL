export const PLAY_ZONE_ROW_IMAGE_FIX = `
#playzone .game-grid{row-gap:0!important}
#playzone .play-zone-row-ad{display:none!important}
#playzone .play-zone-card-ad{width:100%!important;min-width:0!important;height:140px!important;min-height:140px!important;margin:-18px 0 -2px!important;overflow:visible!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;pointer-events:none!important}
#playzone .play-zone-card-ad img{width:100%!important;height:140px!important;max-width:none!important;max-height:140px!important;display:block!important;object-fit:contain!important;object-position:center!important;background:transparent!important;border:0!important;box-shadow:none!important;margin:0 auto!important;padding:0!important}
#playzone .play-zone-card-ad.is-empty{visibility:hidden!important}
@media(max-width:380px){#playzone .game-grid{row-gap:0!important}#playzone .play-zone-card-ad{height:122px!important;min-height:122px!important;margin:-14px 0 -2px!important}#playzone .play-zone-card-ad img{height:122px!important;max-height:122px!important}}
`;
