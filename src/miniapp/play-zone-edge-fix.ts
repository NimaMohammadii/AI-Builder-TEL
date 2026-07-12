import { PLAYHUB_BG_DATA_1 } from './playhub-bg-data-1';
import { PLAYHUB_BG_DATA_2 } from './playhub-bg-data-2';
import { PLAYHUB_BG_DATA_3 } from './playhub-bg-data-3';

const PLAYHUB_BACKGROUND = PLAYHUB_BG_DATA_1 + PLAYHUB_BG_DATA_2 + PLAYHUB_BG_DATA_3;

export const PLAY_ZONE_EDGE_FIX = `
#playzone.play-zone-view{contain:layout paint!important;transform:translateZ(0)!important;will-change:scroll-position!important}
#playzone .play-zone-stage{--play-card-gap:3px!important;contain:layout paint style!important}
#playzone .game-card-shell{contain:layout paint!important;will-change:auto!important}
#playzone .game-card-live,#playzone .play-zone-featured-card,#playzone .game-players{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
#playzone .game-card-live{background:rgba(255,255,255,.055)!important;box-shadow:0 10px 22px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.14)!important}
#playzone .game-card-live:before,#playzone .game-card-live:after{content:none!important;display:none!important}
#playzone .game-card-live .game-image img{transform:none!important;backface-visibility:visible!important;will-change:auto!important}
#playzone .game-card-shell.is-stacking{transform:none!important;opacity:1!important}
#playzone .game-players i,#playzone .game-players i:before{animation:none!important}
@media (prefers-reduced-motion:reduce){#playzone .game-card,#playzone .game-card-shell,#playzone .game-players b{transition:none!important;animation:none!important}}

html body:has(#playzone.active)::before{
  background-image:url('/assets/playhub.png?v=1'),url('data:image/webp;base64,${PLAYHUB_BACKGROUND}')!important;
  background-size:cover,cover!important;
  background-position:center top,center top!important;
  background-repeat:no-repeat,no-repeat!important;
  transform:none!important;
  animation:none!important;
  filter:none!important;
  opacity:1!important;
}
`;
