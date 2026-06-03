export const SLOT_STYLES = `
.slot-view {
  position: relative;
  min-height: calc(100dvh - 130px);
  padding: 4px 0 18px;
  overflow: hidden;
}

body:has(#slot.active) .tabs {
  display: none !important;
}

.slot-topbar {
  position: relative;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 42px;
  margin-bottom: 4px;
}

.slot-back-button {
  height: 36px;
  padding: 0 13px 0 9px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 0;
  border-radius: 999px;
  color: #fff;
  background: rgba(255,255,255,.055);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 14px 34px rgba(0,0,0,.22);
  backdrop-filter: blur(12px) saturate(1.15);
  -webkit-backdrop-filter: blur(12px) saturate(1.15);
  font-weight: 850;
  letter-spacing: -.02em;
}

.slot-back-button span {
  font-size: 25px;
  line-height: 1;
  transform: translateY(-1px);
}

.slot-back-button b {
  font-size: 12px;
}

.slot-machine {
  position: relative;
  z-index: 2;
  width: min(100%, 392px);
  margin: 8px auto 0;
  padding: 12px 14px 16px;
  border-radius: 36px;
  background:
    radial-gradient(circle at 50% 0%, rgba(192,58,91,.24), transparent 42%),
    linear-gradient(180deg, rgba(255,255,255,.085), rgba(255,255,255,.026));
  box-shadow:
    0 30px 88px rgba(0,0,0,.48),
    inset 0 1px 0 rgba(255,255,255,.16),
    inset 0 -18px 46px rgba(0,0,0,.24);
  overflow: visible;
}

.slot-frame-glow {
  position: absolute;
  inset: -34% -18% auto;
  height: 230px;
  background: radial-gradient(circle at 50% 20%, rgba(192,58,91,.38), transparent 64%);
  pointer-events: none;
}

.slot-marquee {
  position: relative;
  z-index: 4;
  height: 54px;
  margin: 0 4px 10px;
  border-radius: 24px;
  display: grid;
  grid-template-columns: 62px 1fr 62px;
  align-items: center;
  color: #fff;
  background:
    linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.045)),
    linear-gradient(135deg, rgba(91,15,36,.74), rgba(192,58,91,.42));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.22),
    inset 0 -10px 22px rgba(0,0,0,.18),
    0 16px 42px rgba(0,0,0,.20);
  overflow: hidden;
}

.slot-marquee strong {
  text-align: center;
  font-size: 16px;
  font-weight: 980;
  letter-spacing: .16em;
  text-shadow: 0 0 18px rgba(255,255,255,.20), 0 10px 24px rgba(0,0,0,.40);
}

.slot-bulbs {
  height: 100%;
  background-image: radial-gradient(circle, rgba(255,255,255,.95) 0 3px, rgba(192,58,91,.88) 4px, transparent 6px);
  background-size: 18px 18px;
  background-position: center;
  opacity: .72;
  animation: slotBulbs 1.1s ease-in-out infinite;
}

.slot-bulbs-right {
  animation-delay: .55s;
}

.slot-cabinet-body {
  position: relative;
  z-index: 3;
  padding: 12px 16px 14px;
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255,255,255,.075), rgba(0,0,0,.13)),
    linear-gradient(135deg, rgba(12,12,14,.98), rgba(34,12,20,.92));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.13),
    inset 0 -22px 40px rgba(0,0,0,.34),
    0 20px 54px rgba(0,0,0,.32);
}

.slot-side-lights {
  position: absolute;
  top: 22px;
  bottom: 22px;
  width: 9px;
  border-radius: 999px;
  background-image: radial-gradient(circle, rgba(255,255,255,.95) 0 2px, rgba(192,58,91,.86) 3px, transparent 5px);
  background-size: 9px 20px;
  background-position: center;
  opacity: .72;
  animation: slotSideLights 1.2s ease-in-out infinite;
}

.slot-side-lights-left {
  left: 4px;
}

.slot-side-lights-right {
  right: 4px;
  animation-delay: .6s;
}

.slot-window {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  height: 254px;
  padding: 10px;
  border-radius: 27px;
  background:
    linear-gradient(180deg, rgba(0,0,0,.80), rgba(0,0,0,.45)),
    radial-gradient(circle at 50% 45%, rgba(255,255,255,.08), transparent 62%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.13),
    inset 0 -20px 36px rgba(0,0,0,.52),
    0 0 0 1px rgba(255,255,255,.07);
  overflow: hidden;
}

.slot-window:before,
.slot-window:after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 74px;
  z-index: 4;
  pointer-events: none;
}

.slot-window:before {
  top: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.90), transparent);
}

.slot-window:after {
  bottom: 0;
  background: linear-gradient(0deg, rgba(0,0,0,.90), transparent);
}

.slot-glass-shine {
  position: absolute;
  inset: 1px;
  z-index: 5;
  border-radius: 26px;
  background: linear-gradient(120deg, rgba(255,255,255,.16), transparent 22%, transparent 62%, rgba(255,255,255,.05));
  pointer-events: none;
  mix-blend-mode: screen;
}

.slot-payline {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 50%;
  height: 2px;
  z-index: 6;
  background: linear-gradient(90deg, transparent, rgba(192,58,91,.86), rgba(255,255,255,.38), rgba(192,58,91,.86), transparent);
  box-shadow: 0 0 20px rgba(192,58,91,.48);
  pointer-events: none;
}

.slot-reel {
  position: relative;
  z-index: 2;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.018)),
    linear-gradient(90deg, rgba(255,255,255,.04), transparent 26%, transparent 74%, rgba(255,255,255,.035));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.10),
    inset 0 0 0 1px rgba(255,255,255,.06),
    inset 0 -18px 26px rgba(0,0,0,.22);
}

.slot-reel-strip {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

.slot-symbol {
  height: 78px;
  display: grid;
  place-items: center;
  font-size: 36px;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,.34));
  user-select: none;
}

.slot-symbol-inner {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 19px;
  background: linear-gradient(180deg, rgba(255,255,255,.13), rgba(255,255,255,.035));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.16), 0 10px 24px rgba(0,0,0,.20);
}

.slot-lever {
  position: absolute;
  right: -16px;
  top: 74px;
  width: 38px;
  height: 142px;
  border: 0;
  background: transparent;
  transform-origin: 50% 25%;
  z-index: 5;
}

.slot-lever-stick {
  position: absolute;
  left: 17px;
  top: 26px;
  width: 6px;
  height: 98px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(120,120,130,.44), rgba(255,255,255,.16));
  box-shadow: 0 10px 22px rgba(0,0,0,.32);
}

.slot-lever-knob {
  position: absolute;
  left: 7px;
  top: 2px;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: radial-gradient(circle at 36% 28%, #fff, #c03a5b 38%, #5b0f24 74%);
  box-shadow: 0 12px 26px rgba(192,58,91,.38), inset 0 1px 0 rgba(255,255,255,.42);
}

.slot-machine.is-spinning .slot-lever {
  animation: slotLeverPull .52s cubic-bezier(.2,.9,.18,1) both;
}

.slot-control-panel {
  position: relative;
  z-index: 4;
  padding-top: 13px;
}

.slot-status-card {
  width: fit-content;
  max-width: 100%;
  min-width: 136px;
  height: 36px;
  margin: 0 auto 12px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: rgba(255,255,255,.88);
  background: rgba(255,255,255,.052);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.13), 0 12px 30px rgba(0,0,0,.16);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: -.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slot-spin-button {
  width: 100%;
  height: 50px;
  border: 0;
  border-radius: 20px;
  color: #fff;
  background: linear-gradient(135deg, #5b0f24, #8f1d3d, #c03a5b);
  box-shadow: 0 18px 38px rgba(143,29,61,.34), inset 0 1px 0 rgba(255,255,255,.18);
  font-size: 16px;
  font-weight: 950;
  letter-spacing: -.03em;
}

.slot-spin-button:disabled {
  opacity: .62;
}

.slot-machine.is-spinning .slot-window {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.13),
    inset 0 -20px 36px rgba(0,0,0,.52),
    0 0 34px rgba(192,58,91,.14);
}

.slot-machine.is-win .slot-window {
  animation: slotWinPulse .72s ease both;
}

.slot-machine.is-win .slot-payline {
  animation: slotPaylineWin .82s ease both;
}

.slot-reel.is-final .slot-symbol:nth-child(2) .slot-symbol-inner {
  animation: slotSymbolPop .54s ease both;
}

@keyframes slotBulbs {
  0%, 100% { opacity: .48; filter: brightness(.88); }
  50% { opacity: .95; filter: brightness(1.35); }
}

@keyframes slotSideLights {
  0%, 100% { opacity: .42; }
  50% { opacity: .92; }
}

@keyframes slotLeverPull {
  0% { transform: rotate(0deg); }
  42% { transform: rotate(18deg) translateY(10px); }
  100% { transform: rotate(0deg); }
}

@keyframes slotWinPulse {
  0% { transform: scale(1); }
  42% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

@keyframes slotPaylineWin {
  0%, 100% { opacity: 1; }
  45% { opacity: .25; box-shadow: 0 0 34px rgba(192,58,91,.86); }
}

@keyframes slotSymbolPop {
  0% { transform: scale(1); }
  45% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

@media (max-width: 380px) {
  .slot-machine {
    border-radius: 31px;
    padding: 11px 12px 14px;
  }

  .slot-marquee {
    height: 50px;
    grid-template-columns: 48px 1fr 48px;
  }

  .slot-marquee strong {
    font-size: 14px;
    letter-spacing: .13em;
  }

  .slot-cabinet-body {
    padding: 11px 14px 13px;
  }

  .slot-window {
    height: 238px;
    gap: 7px;
    padding: 9px;
  }

  .slot-symbol {
    height: 72px;
    font-size: 33px;
  }

  .slot-symbol-inner {
    width: 53px;
    height: 53px;
    border-radius: 17px;
  }

  .slot-lever {
    right: -14px;
    top: 70px;
    transform: scale(.92);
  }
}
`;
