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
  width: 100%;
  min-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 50% 46%, rgba(90, 12, 28, .20), transparent 34%), #000;
  overflow: hidden;
  isolation: isolate;
}
#ghostrun .ghost-run-scene {
  position: relative;
  height: min(54dvh, 430px);
  min-height: 310px;
  overflow: hidden;
  border-radius: 0 0 34px 34px;
  background: linear-gradient(180deg, #030206 0%, #09040a 42%, #080205 100%);
  box-shadow: 0 28px 60px rgba(0, 0, 0, .72);
}
#ghostrun .ghost-run-sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 72% 18%, rgba(255,255,255,.10), transparent 0 3px, transparent 4px),
    radial-gradient(circle at 24% 28%, rgba(255,255,255,.12), transparent 0 2px, transparent 3px),
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
  opacity: .42;
  background-image:
    radial-gradient(circle, rgba(255,255,255,.7) 0 1px, transparent 1.5px),
    radial-gradient(circle, rgba(255,255,255,.35) 0 1px, transparent 1.5px);
  background-size: 82px 64px, 118px 92px;
  background-position: 8px 20px, 42px 6px;
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
  bottom: 78px;
  height: 178px;
  opacity: .50;
  background-size: 180px 160px;
  background-image:
    linear-gradient(145deg, transparent 0 52%, #130812 53% 100%),
    linear-gradient(215deg, transparent 0 52%, #130812 53% 100%),
    linear-gradient(90deg, transparent 0 17px, #130812 18px 29px, transparent 30px 80px);
  animation: ghostRunForestFar 18s linear infinite;
}
#ghostrun .ghost-run-layer-mid {
  bottom: 54px;
  height: 208px;
  opacity: .76;
  background-size: 132px 200px;
  background-image:
    linear-gradient(148deg, transparent 0 48%, #1b0914 49% 100%),
    linear-gradient(212deg, transparent 0 48%, #1b0914 49% 100%),
    linear-gradient(90deg, transparent 0 20px, #16070f 21px 35px, transparent 36px 86px);
  filter: drop-shadow(0 0 18px rgba(55, 6, 19, .20));
  animation: ghostRunForestMid 9.5s linear infinite;
}
#ghostrun .ghost-run-layer-near {
  bottom: 28px;
  height: 245px;
  opacity: .98;
  background-size: 108px 232px;
  background-image:
    linear-gradient(150deg, transparent 0 46%, #090307 47% 100%),
    linear-gradient(210deg, transparent 0 46%, #090307 47% 100%),
    linear-gradient(90deg, transparent 0 24px, #070205 25px 42px, transparent 43px 82px);
  animation: ghostRunForestNear 5.6s linear infinite;
}
#ghostrun .ghost-run-ground {
  position: absolute;
  left: -20%;
  right: -20%;
  bottom: 0;
  height: 96px;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(115, 14, 38, .34), transparent 42%),
    linear-gradient(180deg, rgba(26, 5, 12, .96), #020101 76%);
  box-shadow: 0 -24px 50px rgba(0,0,0,.46), inset 0 1px 0 rgba(120,20,44,.28);
}
#ghostrun .ghost-run-ground:before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(90deg, transparent 0 26px, rgba(90,12,28,.22) 27px 34px, transparent 35px 88px);
  background-size: 120px 100%;
  animation: ghostRunGround 1.8s linear infinite;
}
#ghostrun .ghost-run-fog {
  position: absolute;
  left: -25%;
  right: -25%;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255,255,255,.10), rgba(255,255,255,.03) 46%, transparent 72%);
  filter: blur(12px);
  pointer-events: none;
}
#ghostrun .ghost-run-fog-a { bottom: 42px; animation: ghostRunFogA 8s ease-in-out infinite alternate; opacity: .42; }
#ghostrun .ghost-run-fog-b { bottom: 8px; animation: ghostRunFogB 11s ease-in-out infinite alternate; opacity: .30; }
#ghostrun .ghost-run-hud {
  position: absolute;
  z-index: 12;
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
  background: rgba(0,0,0,.35);
  border: 1px solid rgba(255,255,255,.08);
  color: rgba(255,255,255,.72);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: .02em;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
#ghostrun .ghost-run-state { grid-column: 1 / 3; color: rgba(255,255,255,.58); }
#ghostrun .ghost-run-multiplier {
  justify-self: end;
  font-size: clamp(38px, 12vw, 68px);
  font-weight: 1000;
  letter-spacing: -.08em;
  line-height: .9;
  color: #fff;
  text-shadow: 0 0 18px rgba(112, 18, 44, .65), 0 16px 34px rgba(0,0,0,.72);
}
#ghostrun .ghost-run-ghost {
  position: absolute;
  z-index: 9;
  left: 16%;
  bottom: 74px;
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
  box-shadow: 0 0 0 2px rgba(0,0,0,.04);
}
#ghostrun .ghost-run-eye-left { left: 27px; }
#ghostrun .ghost-run-eye-right { right: 27px; }
#ghostrun .ghost-run-danger {
  position: absolute;
  z-index: 8;
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
  z-index: 20;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 112px;
  background: linear-gradient(180deg, transparent 0%, rgba(12,2,6,.64) 48%, #000 100%);
  pointer-events: none;
}
#ghostrun .ghost-run-shadow-fade:after {
  content: '';
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 12px;
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
  background:
    radial-gradient(circle at 50% 0%, rgba(105, 13, 37, .26), transparent 34%),
    linear-gradient(180deg, #000 0%, #030102 100%);
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
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-layer-near { animation-duration: 3.2s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-ground:before { animation-duration: .9s; }
#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-main-button {
  background: linear-gradient(180deg, #8d1438, #4c071d);
  color: #fff;
  box-shadow: 0 18px 42px rgba(94, 10, 32, .34), inset 0 1px 0 rgba(255,255,255,.24);
}
#ghostrun .ghost-run-screen[data-ghost-state='won'] .ghost-run-ghost { animation: ghostRunWon .75s ease-out both; }
#ghostrun .ghost-run-screen[data-ghost-state='lost'] .ghost-run-ghost { animation: ghostRunLost .72s ease-in both; }
#ghostrun .ghost-run-screen[data-ghost-state='lost'] .ghost-run-ghost-body { filter: brightness(.65) saturate(.6); }
@keyframes ghostRunForestFar { to { background-position: -180px bottom; } }
@keyframes ghostRunForestMid { to { background-position: -132px bottom; } }
@keyframes ghostRunForestNear { to { background-position: -108px bottom; } }
@keyframes ghostRunGround { to { background-position: -120px 0; } }
@keyframes ghostRunFogA { from { transform: translateX(-4%); } to { transform: translateX(7%); } }
@keyframes ghostRunFogB { from { transform: translateX(6%); } to { transform: translateX(-7%); } }
@keyframes ghostRunFloat { 0%,100% { transform: translate3d(0,0,0) rotate(-1deg); } 50% { transform: translate3d(0,-10px,0) rotate(1deg); } }
@keyframes ghostRunShine { 0%,50% { transform: translateX(-80%); opacity: 0; } 72% { opacity: .7; } 100% { transform: translateX(80%); opacity: 0; } }
@keyframes ghostRunEyes { 0%,45%,100% { opacity: 0; transform: scale(.8); } 58%,72% { opacity: .85; transform: scale(1); } }
@keyframes ghostRunWon { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-18px) scale(1.08); } }
@keyframes ghostRunLost { 0% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 70% { opacity: .45; transform: translateY(-10px) scale(.9); filter: blur(2px); } 100% { opacity: 0; transform: translateY(-34px) scale(.68); filter: blur(9px); } }
@media (max-width: 380px) {
  #ghostrun .ghost-run-scene { height: 52dvh; min-height: 288px; border-radius: 0 0 28px 28px; }
  #ghostrun .ghost-run-ghost { left: 13%; bottom: 68px; width: 76px; height: 90px; }
  #ghostrun .ghost-run-controls { padding-left: 12px; padding-right: 12px; gap: 8px; }
  #ghostrun .ghost-run-main-button { height: 58px; }
}
`;