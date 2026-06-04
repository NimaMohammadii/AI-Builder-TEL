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

.slot-machine {
  position: relative;
  z-index: 2;
  width: min(100%, 408px);
  margin: 8px auto 0;
  padding: 0 0 18px;
  background: transparent;
  overflow: visible;
  transform: translateY(-42px);
}

.slot-frame-image {
  position: absolute;
  top: -44px;
  left: 0;
  z-index: 8;
  width: 100%;
  height: 100%;
  object-fit: fill;
  opacity: 0;
  transition: opacity .22s ease;
}

.slot-frame-image.is-loaded {
  opacity: 1;
}

.slot-window {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  width: 68%;
  height: 258px;
  margin: 92px auto 0;
  padding: 0;
  background: transparent;
  overflow: hidden;
  transform: translateX(-4px);
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

.slot-reel {
  position: relative;
  z-index: 2;
  height: 100%;
  border-radius: 21px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.018));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), inset 0 0 0 1px rgba(255,255,255,.055);
}

.slot-reel:before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse at 50% 50%,
      rgba(255,255,255,.06) 0%,
      rgba(255,255,255,.026) 30%,
      rgba(0,0,0,.08) 58%,
      rgba(0,0,0,.50) 100%
    ),
    linear-gradient(
      90deg,
      rgba(0,0,0,.40) 0%,
      rgba(0,0,0,.14) 16%,
      rgba(255,255,255,.018) 50%,
      rgba(0,0,0,.14) 84%,
      rgba(0,0,0,.42) 100%
    ),
    linear-gradient(
      180deg,
      rgba(0,0,0,.90) 0%,
      rgba(0,0,0,.46) 26%,
      rgba(0,0,0,0) 42%,
      rgba(0,0,0,0) 58%,
      rgba(0,0,0,.46) 74%,
      rgba(0,0,0,.92) 100%
    );
}

.slot-reel-strip {
  position: absolute;
  left: 0;
  right: 0;
  top: 14px;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.slot-symbol {
  height: 92px;
  display: grid;
  place-items: center;
  font-size: 38px;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,.32));
  user-select: none;
}

.slot-symbol-fallback {
  display: block;
}

.slot-symbol.has-image .slot-symbol-fallback {
  display: none;
}

.slot-symbol-image {
  width: 68px;
  height: 68px;
  object-fit: contain;
  display: block;
  pointer-events: none;
  opacity: 1;
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.slot-symbol.has-image .slot-symbol-image {
  opacity: 1;
}

.slot-spin-button {
  position: relative;
  z-index: 9;
  width: 100%;
  height: 50px;
  margin-top: 64px;
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
  box-shadow: 0 0 34px rgba(192,58,91,.12);
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
    width: 68%;
    height: 240px;
    margin-top: 88px;
    gap: 4px;
    transform: translateX(-4px);
  }

  .slot-reel-strip {
    top: 12px;
  }

  .slot-symbol {
    height: 86px;
    font-size: 35px;
  }

  .slot-symbol-image {
    width: 62px;
    height: 62px;
  }

  .slot-machine {
    width: min(100%, 398px);
    margin-top: 6px;
    transform: translateY(-42px);
  }
}
`;