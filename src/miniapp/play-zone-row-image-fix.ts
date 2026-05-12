export const PLAY_ZONE_ROW_IMAGE_FIX = `
#playzone .game-grid{row-gap:10px!important}
#playzone .play-zone-row-ad{grid-column:1/-1!important;display:block!important;width:100%!important;height:138px!important;min-height:138px!important;margin:0!important;overflow:visible!important;pointer-events:none!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}
#playzone .play-zone-row-ad__copy{display:none!important}
#playzone .play-zone-row-ad img{width:100%!important;height:138px!important;max-width:none!important;max-height:138px!important;min-width:0!important;display:block!important;object-fit:contain!important;object-position:center!important;background:transparent!important;border:0!important;box-shadow:none!important;margin:0 auto!important;padding:0!important;transform:none!important}
#playzone .play-zone-row-ad.is-empty{display:none!important}
@media(max-width:380px){#playzone .game-grid{row-gap:8px!important}#playzone .play-zone-row-ad{height:128px!important;min-height:128px!important}#playzone .play-zone-row-ad img{height:128px!important;max-height:128px!important}}
`;
