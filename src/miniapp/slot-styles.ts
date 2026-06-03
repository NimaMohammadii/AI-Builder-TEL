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

.slot-frame-image {
  position: absolute;
  inset: 0;
  z-index: 8;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  opacity: 0;
  transition: opacity .22s ease;
}

.slot-frame-image.is-loaded {
  opacity: 1;
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
  background: linear-gradient(180deg, rgba(0,0,0,.88), transparent);
}

.slot-window:after {
  bottom: 0;
  background: linear-gradient(0deg, rgba(0,0,0,.88), transparent);
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
  background: linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.018));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), inset 0 0 0 1px rgba(255,255,255,.055);
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
  height: 82px;
  display: grid;
  place-items: center;
  font-size: 38px;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,.32));
  user-select: none;
}

.slot-status-card {
  position: relative;
  z-index: 9;
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
  position: relative;
  z-index: 9;
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
    font-size: 35px;
  }

  .slot-machine {
    border-radius: 30px;
    padding: 15px 12px 15px;
  }
}
`;