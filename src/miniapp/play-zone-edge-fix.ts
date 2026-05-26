export const PLAY_ZONE_EDGE_FIX = `
body:has(#playzone.active) .content{overflow-x:visible!important;clip-path:none!important;mask-image:none!important;-webkit-mask-image:none!important}
#playzone.play-zone-view{box-sizing:border-box!important;overflow-x:visible!important;padding-left:0!important;padding-right:0!important;clip-path:none!important;mask-image:none!important;-webkit-mask-image:none!important}
#playzone .play-zone-stage{width:100%!important;max-width:100%!important;box-sizing:border-box!important;overflow:visible!important;padding-left:2px!important;padding-right:2px!important;clip-path:none!important;mask-image:none!important;-webkit-mask-image:none!important}
#playzone .play-zone-nft-strip,#playzone .play-zone-nft-viewport{overflow:visible!important;clip-path:none!important;mask-image:none!important;-webkit-mask-image:none!important}
#playzone .play-zone-nft-img video{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important;border:0!important;border-radius:18px!important;background:transparent!important;box-shadow:none!important;filter:drop-shadow(0 14px 20px rgba(0,0,0,.36))!important}
#playzone .play-zone-featured-row,#playzone .play-zone-triangle,#playzone .play-zone-triangle-row{width:100%!important;max-width:100%!important;box-sizing:border-box!important;overflow:visible!important}
#playzone .game-card{box-sizing:border-box!important;max-width:100%!important;transform-origin:center!important}
#playzone .play-zone-featured-card:not(.play-zone-muted-card){animation-name:featuredFloatSafe!important}
#playzone .play-zone-featured-card-1{animation-delay:0s!important}
#playzone .play-zone-featured-card-2{animation-delay:.18s!important}
#playzone .play-zone-featured-card-3{animation-delay:.36s!important}
#playzone .play-zone-muted-card{animation:none!important;transform:scale(.985)!important;background:rgba(255,255,255,.035)!important;background-image:none!important;border-color:rgba(255,255,255,.08)!important;box-shadow:0 18px 42px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.10)!important}
#playzone .play-zone-muted-card:before,#playzone .play-zone-muted-card:after{background:transparent!important;background-image:none!important;box-shadow:none!important;opacity:0!important}
#playzone .play-zone-muted-card .game-image,#playzone .play-zone-muted-card .game-open{background:rgba(255,255,255,.035)!important;background-image:none!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important}
@keyframes featuredFloatSafe{0%,100%{transform:translateY(0) rotateX(0deg) rotateZ(0deg) scale(.985)}50%{transform:translateY(-6px) rotateX(3deg) rotateZ(.5deg) scale(.985)}}
@media(max-width:380px){#playzone .play-zone-stage{padding-left:3px!important;padding-right:3px!important}#playzone .play-zone-nft-img video{border-radius:16px!important}#playzone .play-zone-featured-card:not(.play-zone-muted-card){animation-name:featuredFloatSafeSmall!important}@keyframes featuredFloatSafeSmall{0%,100%{transform:translateY(0) rotateX(0deg) rotateZ(0deg) scale(.975)}50%{transform:translateY(-5px) rotateX(2deg) rotateZ(.35deg) scale(.975)}}}
`;