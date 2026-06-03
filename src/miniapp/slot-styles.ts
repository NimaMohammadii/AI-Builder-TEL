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
  z-index: 4;
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
  width: min(100%, 390px);
  margin: 10px auto 0;
  padding: 18px 14px 17px;
  border-radius: 34px;
  background: linear-gradient(180deg, rgba(255,255,255,.065), rgba(255,255,255,.028));
  box-shadow: 0 28px 80px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.12);
  overflow: hidden;
}

.slot-frame-glow {
  position: absolute;
  inset: -40% -25% auto;
  height: 210px;
  background: radial-gradient(circle at 50% 20%, rgba(192,58,91,.34), transparent 62%);
  pointer-events: none;
}

.slot-window {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  height: 268px;
  padding: 10px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(0,0,0,.74), rgba(0,0,0,.42));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), inset 0 -18px 36px rgba(0,0,0,.46);
  overflow: hidden;
  perspective: 760px;
  transform-style: preserve-3d;
}

.slot-window:before,
.slot-window:after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 74px;
  z-index: 3;
  pointer-events: none;
}

.slot-window:before {
  top: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.90), rgba(0,0,0,.50) 36%, transparent);
}

.slot-window:after {
  bottom: 0;
  background: linear-gradient(0deg, rgba(0,0,0,.90), rgba(0,0,0,.50) 36%, transparent);
}

.slot-payline {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 50%;
  height: 1px;
  z-index: 4;
  background: linear-gradient(90deg, transparent, rgba(192,58,91,.7), rgba(255,255,255,.28), rgba(192,58,91,.7), transparent);
  box-shadow: 0 0 18px rgba(192,58,91,.42);
  pointer-events: none;
}

.slot-reel {
  position: relative;
  z-index: 2;
  height: 100%;
  border-radius: 21px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.07), transparent 62%),
    linear-gradient(90deg, rgba(255,255,255,.055), transparent 22%, transparent 78%, rgba(255,255,255,.045)),
    linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.018));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.10),
    inset 12px 0 20px rgba(255,255,255,.025),
    inset -12px 0 20px rgba(0,0,0,.24),
    inset 0 0 0 1px rgba(255,255,255,.055);
  perspective: 620px;
  transform-style: preserve-3d;
}

.slot-reel:before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 3;
  background:
    linear-gradient(90deg, rgba(255,255,255,.09), transparent 18%, transparent 82%, rgba(0,0,0,.30)),
    radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(0,0,0,.32) 100%);
  pointer-events: none;
  mix-blend-mode: screen;
}

.slot-reel-strip {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  transform-style: preserve-3d;
}

.slot-symbol {
  height: 82px;
  display: grid;
  place-items: center;
  user-select: none;
  transform-style: preserve-3d;
  perspective: 520px;
}

.slot-symbol-face {
  position: relative;
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  font-size: 36px;
  background:
    linear-gradient(145deg, rgba(255,255,255,.18), rgba(255,255,255,.045) 48%, rgba(0,0,0,.22)),
    radial-gradient(circle at 34% 24%, rgba(255,255,255,.22), transparent 38%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.22),
    inset 0 -12px 18px rgba(0,0,0,.20),
    0 14px 26px rgba(0,0,0,.34);
  transform: rotateX(0deg) translateZ(22px);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,.32));
}

.slot-symbol-face:before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255,255,255,.28), transparent 36%, transparent 66%, rgba(255,255,255,.05));
  pointer-events: none;
}

.slot-symbol-shine {
  position: absolute;
  inset: 2px;
  border-radius: 18px;
  background: linear-gradient(120deg, rgba(255,255,255,.18), transparent 30%, transparent 72%, rgba(255,255,255,.06));
  pointer-events: none;
  transform: translateZ(8px);
}

.slot-symbol-depth-0 .slot-symbol-face {
  transform: rotateX(15deg) translateZ(16px) scale(.92);
  opacity: .72;
}

.slot-symbol-depth-1 .slot-symbol-face {
  transform: rotateX(0deg) translateZ(32px) scale(1.04);
  opacity: 1;
}

.slot-symbol-depth-2 .slot-symbol-face {
  transform: rotateX(-15deg) translateZ(16px) scale(.92);
  opacity: .74;
}

.slot-machine.is-spinning .slot-symbol-face {
  filter: blur(.25px) drop-shadow(0 10px 18px rgba(0,0,0,.32));
}

.slot-status-card {
  width: fit-content;
  max-width: 100%;
  min-width: 128px;
  height: 36px;
  margin: 14px auto 12px;
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
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), inset 0 -18px 36px rgba(0,0,0,.46), 0 0 34px rgba(192,58,91,.12);
}

.slot-machine.is-win .slot-window {
  animation: slotWinPulse .7s ease both;
}

@keyframes slotWinPulse {
  0% { transform: scale(1); }
  42% { transform: scale(1.018); }
  100% { transform: scale(1); }
}

@media (max-width: 380px) {
  .slot-window {
    height: 248px;
    gap: 7px;
    padding: 9px;
  }

  .slot-symbol {
    height: 76px;
  }

  .slot-symbol-face {
    width: 53px;
    height: 53px;
    border-radius: 18px;
    font-size: 34px;
  }

  .slot-symbol-shine {
    border-radius: 16px;
  }

  .slot-machine {
    border-radius: 30px;
    padding: 15px 12px 15px;
  }
}
`;
