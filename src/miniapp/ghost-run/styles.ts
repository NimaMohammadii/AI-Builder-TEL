export const GHOST_RUN_STYLES = `
:root:has(#ghostrun.active),
html:has(#ghostrun.active),
body:has(#ghostrun.active),
body:has(#ghostrun.active) .app,
body:has(#ghostrun.active) .content,
body:has(#ghostrun.active) .view.active {
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
}
body:has(#ghostrun.active)::before,
body:has(#ghostrun.active)::after,
body:has(#ghostrun.active) .app::before,
body:has(#ghostrun.active) .app::after {
  display: none !important;
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
}
body:has(#ghostrun.active) .tabs {
  display: none !important;
}
body:has(#ghostrun.active) .top {
  position: relative;
  z-index: 20;
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
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
  width: 100%;
  min-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
  isolation: isolate;
}
#ghostrun .ghost-run-scene {
  position: relative;
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  height: min(58dvh, 460px);
  min-height: 330px;
  overflow: hidden;
  border-radius: 0;
  background: #000;
  box-shadow: none;
}
#ghostrun .ghost-run-sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 8% 16%, rgba(255,255,255,.45) 0 .8px, transparent 1.7px),
    radial-gradient(circle at 17% 9%, rgba(255,255,255,.25) 0 1px, transparent 2px),
    radial-gradient(circle at 29% 22%, rgba(255,255,255,.34) 0 .9px, transparent 1.8px),
    radial-gradient(circle at 41% 12%, rgba(255,255,255,.18) 0 1px, transparent 2px),
    radial-gradient(circle at 58% 26%, rgba(255,255,255,.38) 0 1px, transparent 2px),
    radial-gradient(circle at 76% 10%, rgba(255,255,255,.28) 0 .9px, transparent 1.8px),
    radial-gradient(circle at 91% 21%, rgba(255,255,255,.36) 0 1px, transparent 2px),
    radial-gradient(circle at 50% 18%, rgba(75, 8, 25, .45), transparent 42%),
    linear-gradient(180deg, #05030a 0%, #100611 55%, #030102 100%);
}
#ghostrun .ghost-run-moon {
  position: absolute;
  top: 30px;
  right: 34px;
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: radial-gradient(circle at 36% 32%, #fff 0 3px, rgba(255,255,255,.92) 4px 26px, rgba(230,225,255,.22) 42px, transparent 70%);
  opacity: .44;
  filter: blur(.2px);
  box-shadow: 0 0 50px rgba(255,255,255,.12);
}
#ghostrun .ghost-run-stars {
  position: absolute;
  inset: 0;
  opacity: .48;
  background-image:
    radial-gradient(circle at 13% 34%, rgba(255,255,255,.60) 0 1px, transparent 1.8px),
    radial-gradient(circle at 22% 18%, rgba(255,255,255,.28) 0 1px, transparent 1.8px),
    radial-gradient(circle at 36% 28%, rgba(255,255,255,.48) 0 1px, transparent 1.8px),
    radial-gradient(circle at 49% 15%, rgba(255,255,255,.24) 0 1px, transparent 1.8px),
    radial-gradient(circle at 64% 33%, rgba(255,255,255,.50) 0 1px, transparent 1.8px),
    radial-gradient(circle at 83% 26%, rgba(255,255,255,.34) 0 1px, transparent 1.8px);
  background-size: 280px 150px;
  background-position: 11px 8px;
}
#ghostrun .ghost-run-layer {
  position: absolute;
  left: -12%;
  right: -12%;
  bottom: 68px;
  height: 190px;
  background-repeat: repeat-x;
  background-position: 0 bottom;
  opacity: .9;
}
#ghostrun .ghost-run-layer-far {
  bottom: 92px;
  height: 174px;
  opacity: .58;
  background-size: 220px 170px;
  background-image:
    radial-gradient(ellipse at 28% 54%, rgba(29, 11, 20, .95) 0 30px, transparent 31px),
    radial-gradient(ellipse at 67% 50%, rgba(25, 9, 18, .90) 0 24px, transparent 25px),
    linear-gradient(145deg, transparent 0 51%, #140812 52% 100%),
    linear-gradient(215deg, transparent 0 51%, #140812 52% 100%),
    linear-gradient(90deg, transparent 0 18px, #120711 19px 34px, transparent 35px 88px, #10060f 89px 101px, transparent 102px 220px);
  animation: ghostRunForestFar 18s linear infinite;
}
#ghostrun .ghost-run-layer-mid {
  bottom: 76px;
  height: 218px;
  opacity: .82;
  background-size: 190px 215px;
  background-image:
    linear-gradient(135deg, transparent 0 46%, rgba(38,12,24,.92) 47% 58%, transparent 59%),
    linear-gradient(225deg, transparent 0 46%, rgba(38,12,24,.92) 47% 58%, transparent 59%),
    linear-gradient(180deg, transparent 0 58%, rgba(18,7,13,.95) 59% 77%, transparent 78%),
    radial-gradient(ellipse at 28% 58%, rgba(42, 14, 28, .98) 0 38px, transparent 39px),
    radial-gradient(ellipse at 68% 57%, rgba(35, 12, 24, .92) 0 32px, transparent 33px),
    linear-gradient(90deg, transparent 0 20px, #14070f 21px 38px, transparent 39px 102px, #11060d 103px 119px, transparent 120px 190px);
  filter: drop-shadow(0 0 18px rgba(55, 6, 19, .20));
  animation: ghostRunForestMid 9.5s linear infinite;
}
#ghostrun .ghost-run-near-realism {
  z-index: 2;
  bottom: 70px;
  height: 210px;
  opacity: .70;
  background-size: 170px 210px;
  background-image:
    radial-gradient(ellipse at 22% 95%, rgba(18, 28, 15, .74) 0 14px, transparent 15px),
    radial-gradient(ellipse at 58% 96%, rgba(24, 34, 18, .68) 0 18px, transparent 19px),
    radial-gradient(ellipse at 83% 95%, rgba(14, 22, 13, .72) 0 12px, transparent 13px),
    linear-gradient(90deg, transparent 0 12px, rgba(8, 13, 8, .86) 13px 19px, transparent 20px 55px, rgba(12, 16, 10, .74) 56px 64px, transparent 65px 170px);
  filter: blur(.15px);
  animation: ghostRunForestRealism 7.2s linear infinite;
}
#ghostrun .ghost-run-layer-near {
  bottom: 62px;
  height: 250px;
  opacity: .99;
  background-size: 126px 242px;
  background-image:
    radial-gradient(ellipse at 40% 49%, rgba(9, 3, 7, .98) 0 34px, transparent 35px),
    radial-gradient(ellipse at 72% 47%, rgba(7, 2, 5, .95) 0 26px, transparent 27px),
    linear-gradient(150deg, transparent 0 46%, #080206 47% 100%),
    linear-gradient(210deg, transparent 0 46%, #080206 47% 100%),
    linear-gradient(90deg, transparent 0 24px, #060204 25px 44px, transparent 45px 88px, #050103 89px 102px, transparent 103px 126px);
  animation: ghostRunForestNear 5.6s linear infinite;
}
#ghostrun .ghost-run-rock {
  position: absolute;
  z-index: 8;
  bottom: 72px;
  border-radius: 42% 58% 36% 64%;
  background: linear-gradient(145deg, #242022, #080607 70%);
  box-shadow: inset 8px 7px 12px rgba(255,255,255,.045), inset -8px -10px 14px rgba(0,0,0,.68), 0 10px 18px rgba(0,0,0,.38);
  animation: ghostRunRocks 4.8s linear infinite;
}
#ghostrun .ghost-run-rock-a { left: 62%; width: 48px; height: 28px; animation-delay: -1.2s; }
#ghostrun .ghost-run-rock-b { left: 82%; bottom: 76px; width: 34px; height: 21px; opacity: .78; animation-delay: -3.1s; }
#ghostrun .ghost-run-plant {
  position: absolute;
  z-index: 9;
  bottom: 76px;
  width: 42px;
  height: 54px;
  animation: ghostRunPlants 5.4s linear infinite;
}
#ghostrun .ghost-run-plant i {
  position: absolute;
  bottom: 0;
  left: 18px;
  width: 10px;
  height: 48px;
  border-radius: 999px 999px 4px 4px;
  background: linear-gradient(180deg, rgba(58, 82, 43, .95), rgba(8, 14, 8, .98));
  transform-origin: bottom center;
  box-shadow: inset 2px 0 0 rgba(255,255,255,.055), 0 0 12px rgba(44,80,40,.12);
}
#ghostrun .ghost-run-plant i:nth-child(1){ transform: rotate(-24deg); height: 38px; left: 11px; }
#ghostrun .ghost-run-plant i:nth-child(2){ transform: rotate(4deg); height: 52px; }
#ghostrun .ghost-run-plant i:nth-child(3){ transform: rotate(26deg); height: 34px; left: 25px; }
#ghostrun .ghost-run-plant-a { left: 76%; animation-delay: -1.7s; }
#ghostrun .ghost-run-plant-b { left: 93%; bottom: 74px; transform: scale(.72); opacity: .82; animation-delay: -4.2s; }
#ghostrun .ghost-run-mushroom {
  position: absolute;
  z-index: 9;
  bottom: 76px;
  left: 68%;
  width: 22px;
  height: 24px;
  animation: ghostRunMushroom 6.8s linear infinite;
}
#ghostrun .ghost-run-mushroom:before {
  content: '';
  position: absolute;
  left: 2px;
  top: 0;
  width: 20px;
  height: 12px;
  border-radius: 999px 999px 6px 6px;
  background: linear-gradient(180deg, #3c0d1c, #13050a);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 0 10px rgba(105,13,37,.14);
}
#ghostrun .ghost-run-mushroom:after {
  content: '';
  position: absolute;
  left: 9px;
  top: 10px;
  width: 7px;
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(180deg, #2e2422, #090706);
}
#ghostrun .ghost-run-ground {
  position: absolute;
  z-index: 5;
  left: -20%;
  right: -20%;
  bottom: 0;
  height: 96px;
  background:
    radial-gradient(ellipse at 20% 15%, rgba(54, 44, 42, .72) 0 18px, transparent 19px),
    radial-gradient(ellipse at 55% 22%, rgba(46, 38, 38, .64) 0 16px, transparent 17px),
    linear-gradient(180deg, #1a0912, #050202 64%);
  box-shadow: inset 0 18px 20px rgba(255,255,255,.03), 0 -10px 22px rgba(105,13,37,.12);
}
#ghostrun .ghost-run-ground:before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -18px;
  height: 28px;
  background:
    linear-gradient(90deg, transparent 0 10px, rgba(64,13,28,.95) 11px 28px, transparent 29px 48px),
    linear-gradient(180deg, rgba(105,13,37,.88), rgba(33,8,17,.4));
  background-size: 72px 28px, 100% 100%;
  animation: ghostRunGround 2.2s linear infinite;
}
#ghostrun .ghost-run-fog {
  position: absolute;
  z-index: 11;
  left: -10%;
  right: -10%;
  height: 56px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255,255,255,.10), rgba(255,255,255,.03) 46%, transparent 72%);
  filter: blur(12px);
  pointer-events: none;
}
#ghostrun .ghost-run-fog-a { bottom: 42px; animation: ghostRunFogA 8s ease-in-out infinite alternate; opacity: .42; }
#ghostrun .ghost-run-fog-b { bottom: 8px; animation: ghostRunFogB 11s ease-in-out infinite alternate; opacity: .30; }
#ghostrun .ghost-run-hud {
  position: absolute;
  z-index: 24;
  top: 18px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  pointer-events: none;
}
#ghostrun .ghost-run-pill,
#ghostrun .ghost-run-state {
  display: none !important;
}
#ghostrun .ghost-run-multiplier {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(0,0,0,.30);
  border: 1px solid rgba(255,255,255,.07);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  font-size: clamp(25px, 7.2vw, 34px);
  font-weight: 850;
  letter-spacing: -.035em;
  line-height: 1;
  color: rgba(255,255,255,.94);
  text-shadow: 0 0 10px rgba(112, 18, 44, .46), 0 10px 24px rgba(0,0,0,.62);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 14px 28px rgba(0,0,0,.22);
}
#ghostrun .ghost-run-ghost {
  position: absolute;
  z-index: 18;
  left: 16%;
  bottom: 74px;
  width: 86px;
  height: 100px;
  animation: ghostRunFloat 1.35s ease-in-out infinite;
  background: url('/app/api/ghost-run-asset/ghostIdle.png') center/contain no-repeat;
}
#ghostrun .ghost-run-ghost-glow {
  position: absolute;
  inset: 8px -12px -10px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255,255,255,.26), rgba(180,210,255,.12) 35%, transparent 70%);
  filter: blur(16px);
  opacity: .82;
}
#ghostrun .ghost-run-ghost-body {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: 42px 42px 28px 28px;
  background: radial-gradient(circle at 38% 25%, #fff, #eef3ff 44%, #bfc9e0 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.98), 0 0 24px rgba(220,235,255,.34), 0 14px 34px rgba(0,0,0,.44);
  overflow: hidden;
}
#ghostrun .ghost-run-ghost-body:before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.34), transparent);
  transform: translateX(-70%);
  animation: ghostRunShine 2.9s ease-in-out infinite;
}
#ghostrun .ghost-run-ghost-body b {
  position: absolute;
  bottom: -8px;
  width: 26px;
  height: 28px;
  border-radius: 50%;
  background: #000;
}
#ghostrun .ghost-run-ghost-body b:nth-of-type(1){ left: 2px; }
#ghostrun .ghost-run-ghost-body b:nth-of-type(2){ left: 30px; }
#ghostrun .ghost-run-ghost-body b:nth-of-type(3){ right: 2px; }
#ghostrun .ghost-run-eye {
  position: absolute;
  top: 37px;
  width: 10px;
  height: 15px;
  border-radius: 50%;
  background: #070205;
  z-index: 2;
  box-shadow: 0 0 0 2px rgba(0,0,0,.04);
}
#ghostrun .ghost-run-eye-left { left: 27px; }
#ghostrun .ghost-run-eye-right { right: 27px; }
#ghostrun .ghost-run-danger {
  position: absolute;
  z-index: 12;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #5b0b20;
  box-shadow: 0 0 16px rgba(160,14,50,.7), 0 0 40px rgba(80,6,24,.3);
  opacity: .0;
  animation: ghostRunEyes 4.4s ease-in-out infinite;
}
#ghostrun .ghost-run-danger-a { right: 18%; bottom: 178px; }
#ghostrun .ghost-run-danger-b { right: 26%; bottom: 142px; animation-delay: 1.8s; }
#ghostrun .ghost-run-shadow-fade {
  position: absolute;
  z-index: 28;
  left: 0;
  right: 0;
  bottom: -28px;
  height: 72px;
  background: linear-gradient(180deg, transparent 0%, rgba(12,2,6,.46) 52%, rgba(0,0,0,.88) 100%);
  pointer-events: none;
}
#ghostrun .ghost-run-shadow-fade:after {
  content: '';
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 4px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(105, 13, 37, .75), transparent);
  box-shadow: 0 0 28px rgba(105, 13, 37, .46);
}
#ghostrun .ghost-run-controls {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-content: start;
  padding: 18px 16px calc(28px + env(safe-area-inset-bottom));
  background: transparent;
}
#ghostrun .ghost-run-control-card {
  min-height: 70px;
  border-radius: 22px;
  padding: 13px 14px;
  background: linear-gradient(180deg, rgba(255,255,255,.075), rgba(255,255,255,.035));
  border: 1px solid rgba(255,255,255,.08);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 18px 34px rgba(0,0,0,.28);
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
  box-shadow: 0 18px 42px rgba(255,255,255,.12), 0 0 34px rgba(105,13,37,.20);
}
#ghostrun .ghost-run-main-button:active { transform: scale(.985); }
#ghostrun .ghost-run-note {
  grid-column: 1 / 3;
  text-align: center;
  margin: 0;
  padding-top: 2px;
}
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-layer-far { animation-duration: 12s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-layer-mid { animation-duration: 5.8s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-near-realism { animation-duration: 4.4s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-layer-near { animation-duration: 3.2s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-ground:before { animation-duration: .9s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-rock { animation-duration: 2.7s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-plant { animation-duration: 3.1s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-mushroom { animation-duration: 3.5s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-ghost {
  background-image: url('/app/api/ghost-run-asset/ghostMove.png');
}
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-main-button {
  background: linear-gradient(180deg, #8d1438, #4c071d);
  color: #fff;
  box-shadow: 0 18px 42px rgba(94, 10, 32, .34), inset 0 1px 0 rgba(255,255,255,.24);
}

#ghostrun .ghost-run-ghost-body,
#ghostrun .ghost-run-ghost-glow {
  display: none;
}
#ghostrun .ghost-run-ghost {
  filter: drop-shadow(0 0 18px rgba(220,235,255,.30)) drop-shadow(0 14px 24px rgba(0,0,0,.40));
}
#ghostrun .ghost-run-screen[data-ghost-state='won'] .ghost-run-ghost { animation: ghostRunWon .75s ease-out both; }
#ghostrun .ghost-run-screen[data-ghost-state='lost'] .ghost-run-ghost { animation: ghostRunLost .72s ease-in both; }
#ghostrun .ghost-run-screen[data-ghost-state='lost'] .ghost-run-ghost-body { filter: brightness(.65) saturate(.6); }
@keyframes ghostRunForestFar { to { background-position: -220px bottom; } }
@keyframes ghostRunForestMid { to { background-position: -190px bottom; } }
@keyframes ghostRunForestRealism { to { background-position: -170px bottom; } }
@keyframes ghostRunForestNear { to { background-position: -126px bottom; } }
@keyframes ghostRunGround { to { background-position: -120px 0, -68px 0; } }
@keyframes ghostRunRocks { from { transform: translateX(180px); } to { transform: translateX(-520px); } }
@keyframes ghostRunPlants { from { transform: translateX(170px); } to { transform: translateX(-520px); } }
@keyframes ghostRunMushroom { from { transform: translateX(190px); } to { transform: translateX(-540px); } }
@keyframes ghostRunFogA { from { transform: translateX(-4%); } to { transform: translateX(7%); } }
@keyframes ghostRunFogB { from { transform: translateX(6%); } to { transform: translateX(-7%); } }
@keyframes ghostRunFloat { 0%,100% { transform: translate3d(0,0,0) rotate(-1deg); } 50% { transform: translate3d(0,-10px,0) rotate(1deg); } }
@keyframes ghostRunShine { 0%,50% { transform: translateX(-80%); opacity: 0; } 72% { opacity: .7; } 100% { transform: translateX(80%); opacity: 0; } }
@keyframes ghostRunEyes { 0%,45%,100% { opacity: 0; transform: scale(.8); } 58%,72% { opacity: .85; transform: scale(1); } }
@keyframes ghostRunWon { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-18px) scale(1.08); } }
@keyframes ghostRunLost { 0% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 70% { opacity: .45; transform: translateY(-10px) scale(.9); filter: blur(2px); } 100% { opacity: 0; transform: translateY(-34px) scale(.68); filter: blur(9px); } }
@media (max-width: 380px) {
  #ghostrun .ghost-run-scene { height: 56dvh; min-height: 306px; border-radius: 0; }
  #ghostrun .ghost-run-ghost { left: 13%; bottom: 68px; width: 76px; height: 90px; }
  #ghostrun .ghost-run-controls { padding-left: 13px; padding-right: 13px; gap: 8px; }
  #ghostrun .ghost-run-control-card { min-height: 64px; border-radius: 20px; padding: 12px; }
  #ghostrun .ghost-run-main-button { height: 58px; }
}

/* Ghost Run uploaded image replacement layer. */
#ghostrun .ghost-run-scene,
#ghostrun .ghost-run-sky {
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
}
#ghostrun .ghost-run-uploaded-background {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-repeat: repeat-x;
  background-position: 0 center;
  background-size: auto 100%;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-play-state: paused;
  will-change: background-position;
}
#ghostrun .ghost-run-uploaded-background {
  background-image: url('/app/api/ghost-run-asset/background.png');
  animation-name: ghostRunUploadedBackground;
  animation-duration: 18s;
}
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-uploaded-background {
  animation-play-state: running;
}
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-uploaded-background { animation-duration: 10.5s; }
#ghostrun .ghost-run-sky {
  background: #000 !important;
}
#ghostrun .ghost-run-stars,
#ghostrun .ghost-run-fog,
#ghostrun .ghost-run-shadow-fade,
#ghostrun .ghost-run-danger {
  display: none !important;
  background: transparent !important;
}
#ghostrun .ghost-run-moon {
  background: url('/app/api/ghost-run-asset/moon.png') center/contain no-repeat !important;
  border: 0 !important;
  box-shadow: none !important;
}
#ghostrun .ghost-run-moon:before,
#ghostrun .ghost-run-moon:after,
#ghostrun .ghost-run-rock,
#ghostrun .ghost-run-plant,
#ghostrun .ghost-run-mushroom,
#ghostrun .ghost-run-layer-far,
#ghostrun .ghost-run-layer-mid,
#ghostrun .ghost-run-near-realism,
#ghostrun .ghost-run-layer-near {
  display: none !important;
}
#ghostrun .ghost-run-ground {
  left: -50% !important;
  right: -50% !important;
  height: 132px !important;
  background: url('/app/api/ghost-run-asset/ground.png') 0 bottom / auto 100% repeat-x !important;
  box-shadow: none !important;
  animation: ghostRunUploadedGround 3.6s linear infinite;
}
#ghostrun .ghost-run-ground:before { display: none !important; }
#ghostrun .ghost-run-uploaded-trees,
#ghostrun .ghost-run-uploaded-houses {
  position: absolute;
  z-index: 4;
  pointer-events: none;
  background-repeat: repeat-x;
  background-position: 0 bottom;
  background-size: auto 100%;
  filter: drop-shadow(0 18px 18px rgba(0,0,0,.36));
}
#ghostrun .ghost-run-uploaded-tree-1 { left: -30%; right: -30%; bottom: 76px; height: 220px; background-image: url('/app/api/ghost-run-asset/tree1.png'); animation: ghostRunUploadedTree1 8.5s linear infinite; opacity: .82; }
#ghostrun .ghost-run-uploaded-tree-2 { left: -25%; right: -25%; bottom: 68px; height: 250px; background-image: url('/app/api/ghost-run-asset/tree2.png'); animation: ghostRunUploadedTree2 6.6s linear infinite; opacity: .9; }
#ghostrun .ghost-run-uploaded-tree-3 { left: -20%; right: -20%; bottom: 58px; height: 285px; background-image: url('/app/api/ghost-run-asset/tree3.png'); animation: ghostRunUploadedTree3 5.2s linear infinite; opacity: .98; }
#ghostrun .ghost-run-uploaded-house-1 { left: -30%; right: -30%; bottom: 73px; height: 150px; background-image: url('/app/api/ghost-run-asset/house1.png'); animation: ghostRunUploadedHouse1 9.5s linear infinite; opacity: .86; }
#ghostrun .ghost-run-uploaded-house-2 { left: -25%; right: -25%; bottom: 66px; height: 170px; background-image: url('/app/api/ghost-run-asset/house2.png'); animation: ghostRunUploadedHouse2 7.5s linear infinite; opacity: .9; }
#ghostrun .ghost-run-uploaded-house-3 { left: -20%; right: -20%; bottom: 60px; height: 190px; background-image: url('/app/api/ghost-run-asset/house3.png'); animation: ghostRunUploadedHouse3 6s linear infinite; opacity: .95; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-ground { animation-duration: 1.8s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-uploaded-tree-1 { animation-duration: 5.2s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-uploaded-tree-2 { animation-duration: 4s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-uploaded-tree-3 { animation-duration: 3.1s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-uploaded-house-1 { animation-duration: 5.8s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-uploaded-house-2 { animation-duration: 4.6s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-uploaded-house-3 { animation-duration: 3.7s; }
@keyframes ghostRunUploadedGround { to { background-position: -420px bottom; } }
@keyframes ghostRunUploadedBackground { to { background-position: -900px center; } }
@keyframes ghostRunUploadedTree1 { to { background-position: -360px bottom; } }
@keyframes ghostRunUploadedTree2 { to { background-position: -430px bottom; } }
@keyframes ghostRunUploadedTree3 { to { background-position: -520px bottom; } }
@keyframes ghostRunUploadedHouse1 { to { background-position: -390px bottom; } }
@keyframes ghostRunUploadedHouse2 { to { background-position: -470px bottom; } }
@keyframes ghostRunUploadedHouse3 { to { background-position: -560px bottom; } }

/* Ghost Run risk-control system: fear, claim, and cinematic Reaper states. */
#ghostrun .ghost-run-screen[data-ghost-state='idle'] .ghost-run-ground,
#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-ground,
#ghostrun .ghost-run-screen[data-ghost-state='movingBack'] .ghost-run-ground,
#ghostrun .ghost-run-screen[data-ghost-state='claimed'] .ghost-run-ground,
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ground,
#ghostrun .ghost-run-screen[data-ghost-state='idle'] .ghost-run-uploaded-trees,
#ghostrun .ghost-run-screen[data-ghost-state='idle'] .ghost-run-uploaded-houses,
#ghostrun .ghost-run-screen[data-ghost-state='claimed'] .ghost-run-uploaded-trees,
#ghostrun .ghost-run-screen[data-ghost-state='claimed'] .ghost-run-uploaded-houses,
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-uploaded-trees,
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-uploaded-houses {
  animation-play-state: paused !important;
}
#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-ground,
#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-uploaded-trees,
#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-uploaded-houses,
#ghostrun .ghost-run-screen[data-ghost-state='movingBack'] .ghost-run-ground,
#ghostrun .ghost-run-screen[data-ghost-state='movingBack'] .ghost-run-uploaded-trees,
#ghostrun .ghost-run-screen[data-ghost-state='movingBack'] .ghost-run-uploaded-houses {
  animation-play-state: running !important;
}
#ghostrun .ghost-run-hud {
  display: grid !important;
  grid-template-columns: 1fr auto 1fr !important;
  gap: 10px !important;
  align-items: start !important;
  justify-content: stretch !important;
  pointer-events: none !important;
}
#ghostrun .ghost-run-fear-wrap {
  min-width: 122px;
  padding: 9px 10px 10px;
  border-radius: 16px;
  background: rgba(0,0,0,.46);
  border: 1px solid rgba(255,255,255,.09);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 16px 30px rgba(0,0,0,.28);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
#ghostrun .ghost-run-fear-top { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:6px; }
#ghostrun .ghost-run-fear-top span,
#ghostrun .ghost-run-fear-top strong { font-size: 10px; font-weight: 950; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.78); }
#ghostrun .ghost-run-fear-top strong { color: #ffdce5; }
#ghostrun .ghost-run-fear-track { height: 8px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.10); box-shadow: inset 0 0 0 1px rgba(255,255,255,.04); }
#ghostrun .ghost-run-fear-track i { display:block; height:100%; width:0; border-radius:inherit; background: linear-gradient(90deg,#574a55 0%,#8d1438 62%,#e23b53 100%); box-shadow:0 0 18px rgba(170,16,52,.42); transition: width .12s linear; }
#ghostrun .ghost-run-state {
  display: block !important;
  justify-self: end;
  max-width: 160px;
  min-height: 34px;
  padding: 9px 11px;
  border-radius: 14px;
  background: rgba(32, 2, 10, .42);
  border: 1px solid rgba(141,20,56,.18);
  color: rgba(255,226,233,.86) !important;
  font-size: 11px;
  font-weight: 900;
  line-height: 1.15;
  text-align: right;
  text-shadow: 0 0 14px rgba(141,20,56,.38);
  opacity: .95;
}
#ghostrun .ghost-run-state:empty { opacity: 0; }
#ghostrun .ghost-run-curse-overlay {
  display: none !important;
  opacity: 0 !important;
  background: transparent !important;
  pointer-events: none !important;
}
#ghostrun .ghost-run-reaper {
  position: absolute;
  z-index: 17;
  right: clamp(18px, calc(118px - var(--ghost-fear, 0%) * 1.05), 118px);
  bottom: 82px;
  width: 112px;
  height: 172px;
  opacity: 0;
  transform: translate3d(58px, 10px, 0) scale(.82);
  filter: drop-shadow(0 0 24px rgba(141,20,56,.24));
  pointer-events: none;
  transition: opacity .25s ease, transform .25s ease, right .25s ease;
}
#ghostrun .ghost-run-reaper:before { content:''; position:absolute; inset:18px 26px 0; border-radius:50% 50% 18% 18%; background:linear-gradient(180deg,#090407,#000); box-shadow: inset 0 24px 22px rgba(99,9,32,.28), 0 24px 34px rgba(0,0,0,.52); }
#ghostrun .ghost-run-reaper:after { content:''; position:absolute; left:43px; top:44px; width:9px; height:7px; border-radius:50%; background:#d82d48; box-shadow:22px 0 0 #d82d48, 0 0 16px #d82d48, 22px 0 16px #d82d48; }
#ghostrun .ghost-run-reaper i { position:absolute; right:16px; top:4px; width:9px; height:156px; border-radius:999px; background:linear-gradient(180deg,#c8c4c7,#5b5660 36%,#161016); transform:rotate(23deg); transform-origin:bottom center; }
#ghostrun .ghost-run-reaper b { position:absolute; right:-6px; top:0; width:70px; height:36px; border-radius:100% 8px 100% 12px; border-top:7px solid #d8d4d7; transform:rotate(18deg); filter:drop-shadow(0 0 12px rgba(255,255,255,.12)); }
#ghostrun .ghost-run-screen[data-ghost-state='idle'][style*='--ghost-fear'],
#ghostrun .ghost-run-screen[data-ghost-state='movingForward'],
#ghostrun .ghost-run-screen[data-ghost-state='movingBack'] { transition: filter .18s linear; }
#ghostrun .ghost-run-screen[data-danger-stage='4'] .ghost-run-background-strip,
#ghostrun .ghost-run-screen[data-danger-stage='5'] .ghost-run-background-strip,
#ghostrun .ghost-run-screen[data-danger-stage='6'] .ghost-run-background-strip { filter: none !important; }
#ghostrun .ghost-run-screen[data-fear-tier='haunted'] .ghost-run-reaper { opacity: .34; transform: translate3d(28px,6px,0) scale(.9); }
#ghostrun .ghost-run-screen[data-fear-tier='critical'] .ghost-run-reaper,
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-reaper { opacity: .9; transform: translate3d(0,0,0) scale(1); }
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-reaper { z-index: 30; right: 28%; opacity: 1; animation: ghostRunReaperAttack 1.15s cubic-bezier(.2,.8,.2,1) both; }
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-curse-overlay { display:none !important; opacity:0 !important; background:transparent !important; }
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ghost { animation: ghostRunLost 1.05s .38s ease-in both !important; }
#ghostrun .ghost-run-result { position:absolute; z-index:34; left:50%; top:50%; width:min(86vw,360px); transform:translate(-50%,-44%) scale(.96); padding:24px 18px; border-radius:26px; background:rgba(0,0,0,.72); border:1px solid rgba(255,255,255,.10); box-shadow:0 30px 90px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,.10); text-align:center; opacity:0; pointer-events:none; transition:opacity .3s ease, transform .3s ease; -webkit-backdrop-filter:blur(18px); backdrop-filter:blur(18px); }
#ghostrun .ghost-run-result[data-visible='1'] { opacity:1; transform:translate(-50%,-50%) scale(1); pointer-events:auto !important; }
#ghostrun .ghost-run-result strong { display:block; color:#fff; font-size:24px; font-weight:1000; letter-spacing:-.04em; margin-bottom:8px; }
#ghostrun .ghost-run-result span { display:block; color:rgba(255,226,233,.82); font-size:14px; font-weight:850; }
#ghostrun .ghost-run-result button { margin-top:16px; height:44px; min-width:138px; border:0; border-radius:999px; background:linear-gradient(180deg,#f4f0ed,#c9c0bd); color:#12070b; font-size:14px; font-weight:1000; pointer-events:auto !important; cursor:pointer; }
#ghostrun .ghost-run-start-button { background: linear-gradient(180deg, rgba(70,6,25,.82), rgba(24,1,9,.92)) !important; color:#fff !important; box-shadow:0 18px 42px rgba(50,2,18,.30), inset 0 1px 0 rgba(255,255,255,.12) !important; }
#ghostrun .ghost-run-claim-button { background: transparent !important; background-color: transparent !important; border: 0 !important; outline: 0 !important; box-shadow: none !important; color: rgba(255,255,255,.92) !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important; }
#ghostrun .ghost-run-claim-button:disabled,
#ghostrun .ghost-run-move-button:disabled { opacity:.32 !important; pointer-events:none !important; }
#ghostrun .ghost-run-screen[data-ghost-state='movingBack'] .ghost-run-ghost { transform: translate3d(0,-4px,0) scaleX(-1) scale(1.04) !important; transition: left .08s linear, transform .28s cubic-bezier(.2,.8,.2,1), filter .28s ease !important; }
#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-ghost { transform: translate3d(0,-4px,0) scaleX(1) scale(1.04) !important; transition: left .08s linear, transform .28s cubic-bezier(.2,.8,.2,1), filter .28s ease !important; }
#ghostrun .ghost-run-screen[data-ghost-state='idle'] .ghost-run-ghost { animation:none !important; transform:translate3d(0,0,0) scaleX(1) scale(1) !important; }
@keyframes ghostRunReaperAttack { 0%{ transform:translate3d(150px,-24px,0) scale(.88); } 58%{ transform:translate3d(0,0,0) scale(1.08); } 100%{ transform:translate3d(-36px,18px,0) scale(1.18); } }
@media (max-width: 430px) {
  #ghostrun .ghost-run-hud { grid-template-columns: 1fr auto; }
  #ghostrun .ghost-run-state { grid-column: 1 / 3; max-width: none; justify-self: stretch; text-align: center; padding: 7px 10px; }
}

`;