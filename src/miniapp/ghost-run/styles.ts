export const GHOST_RUN_STYLES = `
body:has(#ghostrun.active) .tabs { display: none !important; }
#ghostrun.ghost-run-view {
  min-height: 100% !important;
  background: transparent !important;
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
  background: transparent;
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
  background: linear-gradient(180deg, #030207 0%, #0b050b 48%, #040102 100%);
  box-shadow: none;
}
#ghostrun .ghost-run-sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 9% 16%, rgba(255,255,255,.45) 0 .8px, transparent 1.7px),
    radial-gradient(circle at 18% 9%, rgba(255,255,255,.24) 0 1px, transparent 2px),
    radial-gradient(circle at 31% 25%, rgba(255,255,255,.34) 0 1px, transparent 2px),
    radial-gradient(circle at 47% 13%, rgba(255,255,255,.18) 0 1px, transparent 2px),
    radial-gradient(circle at 63% 30%, rgba(255,255,255,.36) 0 1px, transparent 2px),
    radial-gradient(circle at 82% 17%, rgba(255,255,255,.25) 0 1px, transparent 2px),
    radial-gradient(circle at 52% 18%, rgba(72, 8, 26, .42), transparent 43%),
    linear-gradient(180deg, #05030a 0%, #100611 58%, #030102 100%);
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
  opacity: .42;
  background-image:
    radial-gradient(circle at 13% 36%, rgba(255,255,255,.52) 0 1px, transparent 1.7px),
    radial-gradient(circle at 27% 18%, rgba(255,255,255,.25) 0 1px, transparent 1.7px),
    radial-gradient(circle at 43% 31%, rgba(255,255,255,.40) 0 1px, transparent 1.7px),
    radial-gradient(circle at 61% 14%, rgba(255,255,255,.22) 0 1px, transparent 1.7px),
    radial-gradient(circle at 77% 29%, rgba(255,255,255,.38) 0 1px, transparent 1.7px),
    radial-gradient(circle at 91% 20%, rgba(255,255,255,.28) 0 1px, transparent 1.7px);
  background-size: 310px 160px;
  background-position: 12px 6px;
}
#ghostrun .ghost-run-layer {
  position: absolute;
  left: -12%;
  right: -12%;
  background-repeat: repeat-x;
  background-position: 0 bottom;
  will-change: background-position;
}
#ghostrun .ghost-run-layer-far {
  bottom: 116px;
  height: 150px;
  opacity: .48;
  background-size: 220px 150px;
  background-image:
    radial-gradient(ellipse at 28% 62%, #170814 0 28px, transparent 29px),
    radial-gradient(ellipse at 70% 63%, #140711 0 24px, transparent 25px),
    linear-gradient(90deg, transparent 0 20px, #10060d 21px 34px, transparent 35px 95px, #0e050b 96px 108px, transparent 109px 220px);
  animation: ghostRunForestFar 20s linear infinite;
}
#ghostrun .ghost-run-layer-mid {
  bottom: 108px;
  height: 186px;
  opacity: .72;
  background-size: 180px 186px;
  background-image:
    radial-gradient(ellipse at 28% 57%, #250b19 0 36px, transparent 37px),
    radial-gradient(ellipse at 68% 58%, #1d0915 0 30px, transparent 31px),
    linear-gradient(90deg, transparent 0 22px, #11070e 23px 40px, transparent 41px 104px, #0f050c 105px 120px, transparent 121px 180px);
  animation: ghostRunForestMid 11s linear infinite;
}
#ghostrun .ghost-run-near-realism {
  z-index: 2;
  bottom: 94px;
  height: 120px;
  opacity: .72;
  background-size: 170px 120px;
  background-image:
    radial-gradient(ellipse at 22% 95%, rgba(25, 42, 18, .82) 0 14px, transparent 15px),
    radial-gradient(ellipse at 60% 96%, rgba(28, 45, 20, .70) 0 18px, transparent 19px),
    radial-gradient(ellipse at 86% 95%, rgba(18, 32, 16, .76) 0 12px, transparent 13px);
  animation: ghostRunForestRealism 8s linear infinite;
}
#ghostrun .ghost-run-layer-near {
  bottom: 106px;
  height: 210px;
  opacity: .96;
  background-size: 130px 210px;
  background-image:
    radial-gradient(ellipse at 40% 48%, #080206 0 31px, transparent 32px),
    radial-gradient(ellipse at 76% 46%, #060104 0 23px, transparent 24px),
    linear-gradient(90deg, transparent 0 25px, #050103 26px 43px, transparent 44px 88px, #050103 89px 101px, transparent 102px 130px);
  animation: ghostRunForestNear 6.8s linear infinite;
}
#ghostrun .ghost-run-ground {
  position: absolute;
  z-index: 5;
  left: -20%;
  right: -20%;
  bottom: 0;
  height: 112px;
  background:
    linear-gradient(180deg, rgba(112,22,43,.55) 0 3px, rgba(0,0,0,.70) 4px 7px, transparent 8px),
    linear-gradient(180deg, #291017 0%, #16070b 28%, #050202 100%);
  box-shadow: 0 -18px 34px rgba(0,0,0,.38), inset 0 2px 0 rgba(170,44,75,.30);
}
#ghostrun .ghost-run-ground:before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(ellipse at 12% 18%, rgba(255,255,255,.08) 0 2px, transparent 3px),
    radial-gradient(ellipse at 34% 26%, rgba(0,0,0,.42) 0 8px, transparent 9px),
    radial-gradient(ellipse at 57% 20%, rgba(255,255,255,.06) 0 2px, transparent 3px),
    radial-gradient(ellipse at 79% 30%, rgba(0,0,0,.42) 0 9px, transparent 10px),
    linear-gradient(90deg, transparent 0 28px, rgba(96,16,34,.20) 29px 36px, transparent 37px 98px);
  background-size: 120px 58px, 150px 60px, 100px 52px, 160px 62px, 130px 100%;
  background-position: 0 18px, 22px 22px, 30px 36px, 56px 28px, 0 0;
  animation: ghostRunGround 2.2s linear infinite;
}
#ghostrun .ghost-run-ground:after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -2px;
  height: 22px;
  background:
    linear-gradient(180deg, rgba(185,48,80,.32) 0 2px, rgba(0,0,0,.50) 3px 5px, transparent 6px),
    repeating-linear-gradient(90deg, transparent 0 18px, rgba(34,70,32,.55) 19px 24px, transparent 25px 46px);
  opacity: .9;
}
#ghostrun .ghost-run-rock {
  position: absolute;
  z-index: 10;
  bottom: 98px;
  border-radius: 42% 58% 36% 64%;
  background: linear-gradient(145deg, #292526, #070506 72%);
  box-shadow: inset 8px 7px 12px rgba(255,255,255,.05), inset -8px -10px 14px rgba(0,0,0,.72), 0 8px 12px rgba(0,0,0,.46);
  animation: ghostRunRocks 4.8s linear infinite;
}
#ghostrun .ghost-run-rock:after,
#ghostrun .ghost-run-plant:after,
#ghostrun .ghost-run-mushroom:after {
  content: '';
  position: absolute;
  left: -6px;
  right: -6px;
  bottom: -5px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0,0,0,.45);
  filter: blur(3px);
}
#ghostrun .ghost-run-rock-a { left: 62%; width: 50px; height: 30px; animation-delay: -1.2s; }
#ghostrun .ghost-run-rock-b { left: 82%; bottom: 99px; width: 35px; height: 22px; opacity: .82; animation-delay: -3.1s; }
#ghostrun .ghost-run-plant {
  position: absolute;
  z-index: 11;
  bottom: 100px;
  width: 42px;
  height: 54px;
  animation: ghostRunPlants 5.4s linear infinite;
}
#ghostrun .ghost-run-plant i {
  position: absolute;
  bottom: 0;
  left: 18px;
  width: 9px;
  height: 42px;
  border-radius: 999px 999px 4px 4px;
  background: linear-gradient(180deg, rgba(58, 82, 43, .95), rgba(8, 14, 8, .98));
  transform-origin: bottom center;
}
#ghostrun .ghost-run-plant i:nth-child(1){ transform: rotate(-24deg); height: 34px; left: 11px; }
#ghostrun .ghost-run-plant i:nth-child(2){ transform: rotate(4deg); height: 48px; }
#ghostrun .ghost-run-plant i:nth-child(3){ transform: rotate(26deg); height: 31px; left: 25px; }
#ghostrun .ghost-run-plant-a { left: 76%; animation-delay: -1.7s; }
#ghostrun .ghost-run-plant-b { left: 93%; bottom: 99px; transform: scale(.72); opacity: .82; animation-delay: -4.2s; }
#ghostrun .ghost-run-mushroom {
  position: absolute;
  z-index: 11;
  bottom: 100px;
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
  left: 2px;
  right: 2px;
  bottom: -5px;
}
#ghostrun .ghost-run-mushroom b { display: none; }
#ghostrun .ghost-run-fog {
  position: absolute;
  z-index: 14;
  left: -25%;
  right: -25%;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255,255,255,.08), rgba(255,255,255,.025) 48%, transparent 72%);
  filter: blur(10px);
  pointer-events: none;
}
#ghostrun .ghost-run-fog-a { bottom: 58px; animation: ghostRunFogA 10s ease-in-out infinite alternate; opacity: .28; }
#ghostrun .ghost-run-fog-b { bottom: 20px; animation: ghostRunFogB 13s ease-in-out infinite alternate; opacity: .18; }
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
#ghostrun .ghost-run-state { display: none !important; }
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
  bottom: 104px;
  width: 86px;
  height: 100px;
  animation: ghostRunFloat 1.35s ease-in-out infinite;
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
  opacity: 0;
  animation: ghostRunEyes 5s ease-in-out infinite;
}
#ghostrun .ghost-run-danger-a { right: 18%; bottom: 194px; }
#ghostrun .ghost-run-danger-b { right: 26%; bottom: 160px; animation-delay: 1.8s; }
#ghostrun .ghost-run-shadow-fade {
  position: absolute;
  z-index: 28;
  left: 0;
  right: 0;
  bottom: -28px;
  height: 68px;
  background: linear-gradient(180deg, transparent 0%, rgba(12,2,6,.42) 54%, rgba(0,0,0,.86) 100%);
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
  background: linear-gradient(90deg, transparent, rgba(105, 13, 37, .60), transparent);
  box-shadow: 0 0 22px rgba(105, 13, 37, .34);
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
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-layer-far { animation-duration: 14s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-layer-mid { animation-duration: 8s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-near-realism { animation-duration: 6s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-layer-near { animation-duration: 4.8s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-ground:before { animation-duration: 1.4s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-rock { animation-duration: 4s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-plant { animation-duration: 4.6s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-mushroom { animation-duration: 5.2s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-main-button {
  background: linear-gradient(180deg, #8d1438, #4c071d);
  color: #fff;
  box-shadow: 0 18px 42px rgba(94, 10, 32, .34), inset 0 1px 0 rgba(255,255,255,.24);
}
#ghostrun .ghost-run-screen[data-ghost-state='won'] .ghost-run-ghost { animation: ghostRunWon .75s ease-out both; }
#ghostrun .ghost-run-screen[data-ghost-state='lost'] .ghost-run-ghost { animation: ghostRunLost .72s ease-in both; }
#ghostrun .ghost-run-screen[data-ghost-state='lost'] .ghost-run-ghost-body { filter: brightness(.65) saturate(.6); }
@keyframes ghostRunForestFar { to { background-position: -220px bottom; } }
@keyframes ghostRunForestMid { to { background-position: -180px bottom; } }
@keyframes ghostRunForestRealism { to { background-position: -170px bottom; } }
@keyframes ghostRunForestNear { to { background-position: -130px bottom; } }
@keyframes ghostRunGround { to { background-position: -120px 18px, -150px 22px, -100px 36px, -160px 28px, -130px 0; } }
@keyframes ghostRunRocks { from { transform: translateX(170px); } to { transform: translateX(-520px); } }
@keyframes ghostRunPlants { from { transform: translateX(160px); } to { transform: translateX(-520px); } }
@keyframes ghostRunMushroom { from { transform: translateX(180px); } to { transform: translateX(-540px); } }
@keyframes ghostRunFogA { from { transform: translateX(-4%); } to { transform: translateX(7%); } }
@keyframes ghostRunFogB { from { transform: translateX(6%); } to { transform: translateX(-7%); } }
@keyframes ghostRunFloat { 0%,100% { transform: translate3d(0,0,0) rotate(-1deg); } 50% { transform: translate3d(0,-10px,0) rotate(1deg); } }
@keyframes ghostRunShine { 0%,50% { transform: translateX(-80%); opacity: 0; } 72% { opacity: .7; } 100% { transform: translateX(80%); opacity: 0; } }
@keyframes ghostRunEyes { 0%,45%,100% { opacity: 0; transform: scale(.8); } 58%,72% { opacity: .85; transform: scale(1); } }
@keyframes ghostRunWon { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-18px) scale(1.08); } }
@keyframes ghostRunLost { 0% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 70% { opacity: .45; transform: translateY(-10px) scale(.9); filter: blur(2px); } 100% { opacity: 0; transform: translateY(-34px) scale(.68); filter: blur(9px); } }
@media (max-width: 380px) {
  #ghostrun .ghost-run-scene { height: 56dvh; min-height: 306px; border-radius: 0; }
  #ghostrun .ghost-run-ghost { left: 13%; bottom: 94px; width: 76px; height: 90px; }
  #ghostrun .ghost-run-controls { padding-left: 12px; padding-right: 12px; gap: 8px; }
  #ghostrun .ghost-run-main-button { height: 58px; }
}
`;
