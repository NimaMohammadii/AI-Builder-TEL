export const GHOST_RUN_STYLES = `
body:has(#ghostrun.active) .tabs {
  display: none !important;
}
#ghostrun.ghost-run-view {
  min-height: 100% !important;
  background: #000 !important;
  padding: 0 !important;
  overflow: hidden !important;
  color: #fff !important;
}
#ghostrun * { box-sizing: border-box; }
#ghostrun .ghost-run-screen {
  --ghost-speed: 0;
  --ghost-intensity: 0;
  width: 100%;
  min-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 50% 44%, rgba(110, 12, 38, .24), transparent 34%), #000;
  overflow: hidden;
  isolation: isolate;
}
#ghostrun .ghost-run-scene {
  position: relative;
  height: min(55dvh, 450px);
  min-height: 318px;
  overflow: hidden;
  border-radius: 0 0 36px 36px;
  background: #020104;
  box-shadow: 0 30px 72px rgba(0,0,0,.78), inset 0 -1px 0 rgba(122,18,45,.22);
  transform: translateZ(0);
}
#ghostrun .ghost-run-sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 67% 15%, rgba(255,246,231,.20) 0 2px, transparent 3px),
    radial-gradient(circle at 31% 20%, rgba(255,255,255,.11) 0 1.5px, transparent 2.5px),
    radial-gradient(circle at 50% 8%, rgba(102, 10, 35, .42), transparent 39%),
    linear-gradient(180deg, #05040b 0%, #100711 42%, #090208 72%, #030102 100%);
}
#ghostrun .ghost-run-noise,
#ghostrun .ghost-run-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
#ghostrun .ghost-run-noise {
  z-index: 30;
  opacity: .075;
  mix-blend-mode: screen;
  background-image:
    repeating-radial-gradient(circle at 13% 27%, rgba(255,255,255,.36) 0 1px, transparent 1.5px 5px),
    repeating-linear-gradient(92deg, rgba(255,255,255,.06) 0 1px, transparent 1px 4px);
  background-size: 86px 86px, 5px 5px;
}
#ghostrun .ghost-run-vignette {
  z-index: 29;
  background: radial-gradient(ellipse at 50% 42%, transparent 0 48%, rgba(0,0,0,.42) 75%, rgba(0,0,0,.88) 100%);
}
#ghostrun .ghost-run-moon {
  position: absolute;
  top: 27px;
  right: 30px;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  opacity: .55;
  filter: blur(.15px);
  background:
    radial-gradient(circle at 38% 30%, rgba(70,64,74,.36) 0 4px, transparent 5px),
    radial-gradient(circle at 65% 62%, rgba(96,88,100,.24) 0 6px, transparent 7px),
    radial-gradient(circle at 38% 33%, #fff 0 5px, #f4f0ff 6px 31px, rgba(210,220,255,.22) 43px, transparent 72%);
  box-shadow: 0 0 48px rgba(255,255,255,.14), 0 0 96px rgba(116,18,48,.10);
}
#ghostrun .ghost-run-stars {
  position: absolute;
  inset: 0;
  opacity: .35;
  background-image:
    radial-gradient(circle, rgba(255,255,255,.72) 0 1px, transparent 1.4px),
    radial-gradient(circle, rgba(255,255,255,.30) 0 .8px, transparent 1.2px);
  background-size: 92px 74px, 136px 102px;
  background-position: 8px 20px, 52px 6px;
}
#ghostrun .ghost-run-cloud {
  position: absolute;
  left: -30%;
  right: -30%;
  height: 120px;
  border-radius: 50%;
  filter: blur(20px);
  background: radial-gradient(ellipse, rgba(80, 18, 42, .26), rgba(30, 7, 18, .12) 48%, transparent 72%);
  opacity: .62;
}
#ghostrun .ghost-run-cloud-a { top: 68px; animation: ghostRunCloudA 20s ease-in-out infinite alternate; }
#ghostrun .ghost-run-cloud-b { top: 124px; opacity: .38; animation: ghostRunCloudB 28s ease-in-out infinite alternate; }
#ghostrun .ghost-run-layer {
  position: absolute;
  left: -24%;
  right: -24%;
  bottom: 64px;
  background-repeat: repeat-x;
  background-position: 0 bottom;
  will-change: background-position;
}
#ghostrun .ghost-run-mountains {
  bottom: 82px;
  height: 150px;
  opacity: .40;
  background-size: 240px 150px;
  background-image:
    linear-gradient(137deg, transparent 0 48%, #120713 49% 100%),
    linear-gradient(223deg, transparent 0 52%, #0b050d 53% 100%);
  animation: ghostRunMountains 34s linear infinite;
}
#ghostrun .ghost-run-layer-far {
  bottom: 76px;
  height: 194px;
  opacity: .56;
  background-size: 196px 178px;
  background-image:
    radial-gradient(ellipse at 38% 58%, #160814 0 24px, transparent 25px),
    linear-gradient(145deg, transparent 0 52%, #160814 53% 100%),
    linear-gradient(215deg, transparent 0 52%, #160814 53% 100%),
    linear-gradient(90deg, transparent 0 17px, #10060f 18px 32px, transparent 33px 92px);
  animation: ghostRunForestFar calc(18s / max(.65, var(--ghost-speed))) linear infinite;
}
#ghostrun .ghost-run-layer-mid {
  bottom: 50px;
  height: 226px;
  opacity: .82;
  background-size: 142px 220px;
  background-image:
    radial-gradient(ellipse at 42% 55%, #210a17 0 28px, transparent 29px),
    linear-gradient(148deg, transparent 0 48%, #210a17 49% 100%),
    linear-gradient(212deg, transparent 0 48%, #210a17 49% 100%),
    linear-gradient(90deg, transparent 0 20px, #170711 21px 38px, transparent 39px 90px);
  filter: drop-shadow(0 0 20px rgba(70, 7, 24, .22));
  animation: ghostRunForestMid calc(9.2s / max(.75, var(--ghost-speed))) linear infinite;
}
#ghostrun .ghost-run-layer-near {
  bottom: 26px;
  height: 266px;
  opacity: .99;
  background-size: 112px 252px;
  background-image:
    radial-gradient(ellipse at 46% 48%, #090207 0 30px, transparent 31px),
    linear-gradient(150deg, transparent 0 46%, #090207 47% 100%),
    linear-gradient(210deg, transparent 0 46%, #090207 47% 100%),
    linear-gradient(90deg, transparent 0 23px, #060104 24px 43px, transparent 44px 88px);
  animation: ghostRunForestNear calc(5.2s / max(.85, var(--ghost-speed))) linear infinite;
}
#ghostrun .ghost-run-branch {
  position: absolute;
  z-index: 7;
  top: 72px;
  width: 130px;
  height: 22px;
  border-radius: 999px;
  background: linear-gradient(90deg, #050103, #0b0206 78%, transparent);
  box-shadow: 0 4px 0 #030102, 0 0 20px rgba(0,0,0,.44);
  opacity: .78;
}
#ghostrun .ghost-run-branch:before,
#ghostrun .ghost-run-branch:after {
  content: '';
  position: absolute;
  width: 72px;
  height: 13px;
  border-radius: 999px;
  background: #050103;
  transform-origin: left center;
}
#ghostrun .ghost-run-branch:before { left: 42px; top: -18px; transform: rotate(-31deg); }
#ghostrun .ghost-run-branch:after { left: 58px; top: 16px; transform: rotate(28deg); }
#ghostrun .ghost-run-branch-left { left: -34px; transform: rotate(4deg); animation: ghostRunBranchLeft 6.2s linear infinite; }
#ghostrun .ghost-run-branch-right { right: -54px; top: 116px; transform: scaleX(-1) rotate(-6deg); animation: ghostRunBranchRight 7.4s linear infinite; }
#ghostrun .ghost-run-runway {
  position: absolute;
  z-index: 4;
  left: -18%;
  right: -18%;
  bottom: 58px;
  height: 70px;
  perspective: 260px;
  opacity: .70;
  transform: skewX(-8deg);
}
#ghostrun .ghost-run-runway span {
  position: absolute;
  bottom: 0;
  width: 34%;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(142, 18, 51, .62), transparent);
  box-shadow: 0 0 18px rgba(142,18,51,.24);
  animation: ghostRunPath 1.3s linear infinite;
}
#ghostrun .ghost-run-runway span:nth-child(1){ left: 3%; animation-delay: 0s; }
#ghostrun .ghost-run-runway span:nth-child(2){ left: 30%; animation-delay: -.35s; }
#ghostrun .ghost-run-runway span:nth-child(3){ left: 57%; animation-delay: -.7s; }
#ghostrun .ghost-run-runway span:nth-child(4){ left: 77%; animation-delay: -1s; }
#ghostrun .ghost-run-ground {
  position: absolute;
  z-index: 5;
  left: -24%;
  right: -24%;
  bottom: 0;
  height: 104px;
  background:
    radial-gradient(ellipse at 18% 0%, rgba(135, 16, 46, .38), transparent 43%),
    radial-gradient(ellipse at 72% 0%, rgba(50, 8, 20, .56), transparent 48%),
    linear-gradient(180deg, rgba(28, 5, 13, .98), #020101 76%);
  box-shadow: 0 -28px 54px rgba(0,0,0,.50), inset 0 1px 0 rgba(130,22,50,.30);
}
#ghostrun .ghost-run-ground:before,
#ghostrun .ghost-run-ground:after {
  content: '';
  position: absolute;
  inset: 0;
}
#ghostrun .ghost-run-ground:before {
  background-image:
    linear-gradient(90deg, transparent 0 24px, rgba(126,16,43,.24) 25px 33px, transparent 34px 88px),
    radial-gradient(ellipse at bottom, rgba(255,255,255,.06) 0 3px, transparent 4px);
  background-size: 120px 100%, 66px 40px;
  animation: ghostRunGround calc(1.8s / max(.75, var(--ghost-speed))) linear infinite;
}
#ghostrun .ghost-run-ground:after {
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,.72) 75%);
}
#ghostrun .ghost-run-embers {
  position: absolute;
  z-index: 6;
  left: -20%;
  right: -20%;
  bottom: 82px;
  height: 120px;
  opacity: calc(.18 + var(--ghost-intensity) * .35);
  background-image:
    radial-gradient(circle, rgba(149, 22, 56, .74) 0 1px, transparent 2px),
    radial-gradient(circle, rgba(255, 210, 225, .42) 0 1px, transparent 2px);
  background-size: 92px 42px, 138px 58px;
  animation: ghostRunEmbers 2.9s linear infinite;
  filter: blur(.2px);
}
#ghostrun .ghost-run-fog {
  position: absolute;
  z-index: 14;
  left: -35%;
  right: -35%;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(16px);
  background: radial-gradient(ellipse, rgba(255,255,255,.14), rgba(255,255,255,.035) 46%, transparent 72%);
}
#ghostrun .ghost-run-fog-a { bottom: 46px; height: 124px; animation: ghostRunFogA 8s ease-in-out infinite alternate; opacity: .42; }
#ghostrun .ghost-run-fog-b { bottom: 8px; height: 132px; animation: ghostRunFogB 11s ease-in-out infinite alternate; opacity: .32; }
#ghostrun .ghost-run-fog-c { bottom: 112px; height: 92px; opacity: .18; animation: ghostRunFogC 13s ease-in-out infinite alternate; }
#ghostrun .ghost-run-hud {
  position: absolute;
  z-index: 24;
  top: 18px;
  left: 16px;
  right: 16px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 8px 10px;
}
#ghostrun .ghost-run-pill,
#ghostrun .ghost-run-state {
  width: max-content;
  max-width: 100%;
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(0,0,0,.42);
  border: 1px solid rgba(255,255,255,.08);
  color: rgba(255,255,255,.72);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: .02em;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 12px 28px rgba(0,0,0,.30);
}
#ghostrun .ghost-run-state { grid-column: 1 / 3; color: rgba(255,255,255,.58); }
#ghostrun .ghost-run-multiplier {
  justify-self: end;
  font-size: clamp(40px, 12.5vw, 72px);
  font-weight: 1000;
  letter-spacing: -.08em;
  line-height: .9;
  color: #fff;
  text-shadow: 0 0 18px rgba(122, 18, 46, .72), 0 0 44px rgba(122,18,46,.22), 0 18px 36px rgba(0,0,0,.76);
}
#ghostrun .ghost-run-ghost {
  position: absolute;
  z-index: 18;
  left: 15%;
  bottom: 78px;
  width: 92px;
  height: 108px;
  transform-origin: 50% 80%;
  animation: ghostRunFloat 1.24s ease-in-out infinite;
  filter: drop-shadow(0 18px 28px rgba(0,0,0,.48));
}
#ghostrun .ghost-run-trail {
  position: absolute;
  right: 70%;
  top: 28%;
  width: 92px;
  height: 34px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(230,240,255,.10), rgba(255,255,255,.26));
  filter: blur(10px);
  opacity: calc(.28 + var(--ghost-intensity) * .32);
}
#ghostrun .ghost-run-trail-b { top: 53%; width: 70px; height: 24px; opacity: calc(.16 + var(--ghost-intensity) * .26); }
#ghostrun .ghost-run-ghost-glow {
  position: absolute;
  inset: 0 -22px -18px;
  border-radius: 50%;
  background:
    radial-gradient(ellipse, rgba(255,255,255,.30), rgba(194,216,255,.16) 35%, rgba(110,18,46,.10) 58%, transparent 74%);
  filter: blur(18px);
  opacity: .92;
  animation: ghostRunGlow 1.6s ease-in-out infinite;
}
#ghostrun .ghost-run-ghost-body {
  position: absolute;
  inset: 3px 5px 0;
  display: block;
  border-radius: 48px 48px 30px 30px;
  background:
    radial-gradient(circle at 36% 24%, #fff 0 10px, transparent 11px),
    radial-gradient(circle at 62% 70%, rgba(190,205,230,.48), transparent 34%),
    linear-gradient(145deg, #ffffff 0%, #edf3ff 43%, #bdc8df 100%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.98),
    inset -16px -20px 34px rgba(109,122,154,.24),
    0 0 26px rgba(220,235,255,.38),
    0 0 68px rgba(115,18,46,.12),
    0 16px 38px rgba(0,0,0,.50);
  overflow: hidden;
}
#ghostrun .ghost-run-ghost-body:before {
  content: '';
  position: absolute;
  inset: -20% -30%;
  background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,.40) 44%, transparent 62%);
  transform: translateX(-72%);
  animation: ghostRunShine 2.6s ease-in-out infinite;
}
#ghostrun .ghost-run-ghost-body:after {
  content: '';
  position: absolute;
  inset: auto 10px 11px;
  height: 38px;
  border-radius: 999px 999px 24px 24px;
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(95,110,140,.10));
  filter: blur(1px);
}
#ghostrun .ghost-run-ghost-body b {
  position: absolute;
  z-index: 2;
  bottom: -9px;
  width: 24px;
  height: 29px;
  border-radius: 50%;
  background: #000;
}
#ghostrun .ghost-run-ghost-body b:nth-of-type(1){ left: -1px; }
#ghostrun .ghost-run-ghost-body b:nth-of-type(2){ left: 22px; }
#ghostrun .ghost-run-ghost-body b:nth-of-type(3){ left: 46px; }
#ghostrun .ghost-run-ghost-body b:nth-of-type(4){ right: -1px; }
#ghostrun .ghost-run-eye {
  position: absolute;
  top: 38px;
  width: 10px;
  height: 16px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 25%, rgba(255,255,255,.26), transparent 0 2px, #070205 3px);
  z-index: 4;
  box-shadow: 0 0 0 2px rgba(0,0,0,.04);
}
#ghostrun .ghost-run-eye-left { left: 30px; }
#ghostrun .ghost-run-eye-right { right: 30px; }
#ghostrun .ghost-run-mouth {
  position: absolute;
  z-index: 4;
  left: 50%;
  top: 58px;
  width: 12px;
  height: 7px;
  transform: translateX(-50%);
  border-radius: 0 0 999px 999px;
  border-bottom: 2px solid rgba(7,2,5,.62);
}
#ghostrun .ghost-run-danger {
  position: absolute;
  z-index: 16;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: radial-gradient(circle, #ff345f 0 2px, #5b0b20 4px, transparent 8px);
  box-shadow: 0 0 16px rgba(190,18,60,.72), 0 0 44px rgba(80,6,24,.34);
  opacity: 0;
  animation: ghostRunEyes 4.4s ease-in-out infinite;
}
#ghostrun .ghost-run-danger-a { right: 18%; bottom: 178px; }
#ghostrun .ghost-run-danger-b { right: 26%; bottom: 142px; animation-delay: 1.8s; }
#ghostrun .ghost-run-danger-c { right: 9%; bottom: 214px; animation-delay: 3.1s; }
#ghostrun .ghost-run-speed-lines {
  position: absolute;
  z-index: 17;
  inset: 0;
  opacity: calc(var(--ghost-intensity) * .48);
  background-image: linear-gradient(90deg, transparent 0 14%, rgba(255,255,255,.20) 15% 16%, transparent 17% 100%);
  background-size: 140px 100%;
  filter: blur(.7px);
  animation: ghostRunSpeedLines .42s linear infinite;
  pointer-events: none;
}
#ghostrun .ghost-run-shadow-fade {
  position: absolute;
  z-index: 28;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 120px;
  background: linear-gradient(180deg, transparent 0%, rgba(12,2,6,.64) 44%, #000 100%);
  pointer-events: none;
}
#ghostrun .ghost-run-shadow-fade:after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 13px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(120, 14, 43, .82), transparent);
  box-shadow: 0 0 28px rgba(120, 14, 43, .54), 0 0 70px rgba(120,14,43,.16);
}
#ghostrun .ghost-run-controls {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-content: start;
  padding: 18px 16px calc(28px + env(safe-area-inset-bottom));
  background:
    radial-gradient(circle at 50% 0%, rgba(116, 14, 42, .28), transparent 34%),
    linear-gradient(180deg, #000 0%, #030102 100%);
}
#ghostrun .ghost-run-control-card {
  min-height: 70px;
  border-radius: 22px;
  padding: 13px 14px;
  background: linear-gradient(180deg, rgba(255,255,255,.078), rgba(255,255,255,.035));
  border: 1px solid rgba(255,255,255,.08);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.13), 0 18px 34px rgba(0,0,0,.30);
}
#ghostrun .ghost-run-control-card span,
#ghostrun .ghost-run-note {
  display: block;
  color: rgba(255,255,255,.48);
  font-size: 11px;
  font-weight: 800;
}
#ghostrun .ghost-run-control-card strong {
  display: block;
  margin-top: 7px;
  font-size: 18px;
  font-weight: 950;
  letter-spacing: -.04em;
  color: #fff;
}
#ghostrun .ghost-run-control-card em { font-style: normal; }
#ghostrun .ghost-run-main-button {
  grid-column: 1 / 3;
  height: 62px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff, #d9d9d9);
  color: #070205;
  font-size: 16px;
  font-weight: 1000;
  letter-spacing: -.02em;
  box-shadow: 0 18px 42px rgba(255,255,255,.12), 0 0 34px rgba(120,14,43,.22);
  transition: transform .14s ease, filter .14s ease;
}
#ghostrun .ghost-run-main-button:active { transform: scale(.985); }
#ghostrun .ghost-run-note {
  grid-column: 1 / 3;
  text-align: center;
  margin: 0;
  padding-top: 2px;
}
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-main-button {
  background: linear-gradient(180deg, #9a173d, #4b061d);
  color: #fff;
  box-shadow: 0 18px 42px rgba(116, 12, 40, .40), inset 0 1px 0 rgba(255,255,255,.25);
}
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-ghost {
  animation-duration: .86s;
}
#ghostrun .ghost-run-screen[data-ghost-state='won'] .ghost-run-ghost { animation: ghostRunWon .75s ease-out both; }
#ghostrun .ghost-run-screen[data-ghost-state='lost'] .ghost-run-ghost { animation: ghostRunLost .72s ease-in both; }
#ghostrun .ghost-run-screen[data-ghost-state='lost'] .ghost-run-ghost-body { filter: brightness(.62) saturate(.58); }
@keyframes ghostRunMountains { to { background-position: -240px bottom; } }
@keyframes ghostRunForestFar { to { background-position: -196px bottom; } }
@keyframes ghostRunForestMid { to { background-position: -142px bottom; } }
@keyframes ghostRunForestNear { to { background-position: -112px bottom; } }
@keyframes ghostRunGround { to { background-position: -120px 0, -66px 0; } }
@keyframes ghostRunCloudA { from { transform: translateX(-4%); } to { transform: translateX(8%); } }
@keyframes ghostRunCloudB { from { transform: translateX(7%); } to { transform: translateX(-9%); } }
@keyframes ghostRunBranchLeft { 0% { transform: translateX(0) rotate(4deg); } 100% { transform: translateX(-260px) rotate(4deg); } }
@keyframes ghostRunBranchRight { 0% { transform: scaleX(-1) translateX(0) rotate(-6deg); } 100% { transform: scaleX(-1) translateX(-260px) rotate(-6deg); } }
@keyframes ghostRunPath { from { transform: translateX(120%) translateY(0) scaleX(.55); opacity: 0; } 30% { opacity: .75; } to { transform: translateX(-180%) translateY(18px) scaleX(1.8); opacity: 0; } }
@keyframes ghostRunEmbers { to { background-position: -92px -42px, -138px -58px; } }
@keyframes ghostRunFogA { from { transform: translateX(-4%); } to { transform: translateX(7%); } }
@keyframes ghostRunFogB { from { transform: translateX(6%); } to { transform: translateX(-7%); } }
@keyframes ghostRunFogC { from { transform: translateX(-9%); } to { transform: translateX(5%); } }
@keyframes ghostRunFloat { 0%,100% { transform: translate3d(0,0,0) rotate(-1deg); } 50% { transform: translate3d(0,-11px,0) rotate(1deg); } }
@keyframes ghostRunGlow { 0%,100% { opacity: .72; transform: scale(.96); } 50% { opacity: 1; transform: scale(1.04); } }
@keyframes ghostRunShine { 0%,48% { transform: translateX(-78%); opacity: 0; } 70% { opacity: .72; } 100% { transform: translateX(72%); opacity: 0; } }
@keyframes ghostRunEyes { 0%,45%,100% { opacity: 0; transform: scale(.75); } 58%,72% { opacity: .88; transform: scale(1); } }
@keyframes ghostRunSpeedLines { to { background-position: -140px 0; } }
@keyframes ghostRunWon { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-22px) scale(1.10); } }
@keyframes ghostRunLost { 0% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 58% { opacity: .52; transform: translateY(-12px) scale(.90); filter: blur(2px); } 100% { opacity: 0; transform: translateY(-38px) scale(.62); filter: blur(10px); } }
@media (max-width: 380px) {
  #ghostrun .ghost-run-scene { height: 53dvh; min-height: 294px; border-radius: 0 0 28px 28px; }
  #ghostrun .ghost-run-ghost { left: 13%; bottom: 72px; width: 80px; height: 96px; }
  #ghostrun .ghost-run-controls { padding-left: 12px; padding-right: 12px; gap: 8px; }
  #ghostrun .ghost-run-main-button { height: 58px; }
}
`;