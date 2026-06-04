export const SLOT_STYLES = `
.slot-view {
  position: relative;
  min-height: calc(100dvh - 130px);
  padding: 4px 0 18px;
  overflow: auto;
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
  background: linear-gradient(180deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.34) 28%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.34) 72%, rgba(0,0,0,.82) 100%);
}

.slot-reel-strip {
  position: absolute;
  left: 0;
  right: 0;
  top: 14px;
  transform: translate3d(0, 0, 0);
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
  width: 62px;
  height: 62px;
  object-fit: contain;
  display: block;
  pointer-events: none;
  opacity: 1;
}

.slot-symbol.has-image .slot-symbol-image {
  opacity: 1;
}

#slot .slot-spin-button {
  position: relative;
  z-index: 9;
  display: block;
  width: 84%;
  height: 50px;
  margin: 64px auto 0;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 20px;
  color: #fff;
  background: linear-gradient(135deg, #2a020f 0%, #4b061d 42%, #6f0d2d 68%, #2f0313 100%) !important;
  box-shadow: 0 18px 42px rgba(28,0,10,.56), 0 0 26px rgba(84,4,31,.18), inset 0 1px 0 rgba(255,255,255,.18), inset 0 0 0 1px rgba(255,255,255,.08), inset 0 -18px 34px rgba(8,0,4,.48);
  backdrop-filter: blur(22px) saturate(170%);
  -webkit-backdrop-filter: blur(22px) saturate(170%);
  font-size: 16px;
  font-weight: 950;
  letter-spacing: -.03em;
  text-shadow: 0 1px 12px rgba(0,0,0,.38);
  overflow: hidden;
  isolation: isolate;
  transition: transform .18s ease, box-shadow .22s ease, border-color .22s ease;
  animation: slotSpinGlassPulse 2.8s ease-in-out infinite;
}

#slot .slot-spin-button:before {
  content: "";
  position: absolute;
  inset: 1px;
  z-index: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.025) 34%, rgba(255,255,255,0) 58%), radial-gradient(circle at 18% 0%, rgba(155,28,70,.16), transparent 32%);
  pointer-events: none;
}

#slot .slot-spin-button:after {
  content: "";
  position: absolute;
  top: -35%;
  bottom: -35%;
  left: -55%;
  width: 42%;
  z-index: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(190,44,88,.22), transparent);
  transform: translateX(-130%) rotate(18deg);
  animation: slotSpinGlassShine 3.2s ease-in-out infinite;
  pointer-events: none;
}

#slot .slot-spin-button:active {
  transform: translateY(1px) scale(.985);
}

#slot .slot-spin-button:disabled {
  opacity: .62;
  animation: none;
}

#slot .slot-spin-button:disabled:after {
  animation: none;
}

.slot-control-panel {
  position: relative;
  z-index: 9;
  width: min(100%, 408px);
  margin: -48px auto 0;
}

.slot-controls {
  width: 84%;
  margin: 0 auto;
}

.slot-field {
  display: grid;
  gap: 7px;
}

.slot-label {
  color: rgba(255,255,255,.54);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: -.02em;
}

.slot-point-amount {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  min-height: 48px;
  padding: 7px 7px 7px 13px;
  border-radius: 18px;
  background: rgba(255,255,255,.06);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), inset 0 0 0 1px rgba(255,255,255,.06);
  box-sizing: border-box;
}

.slot-point-amount input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #fff;
  background: transparent;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -.03em;
}

.slot-quick-actions {
  display: flex;
  gap: 5px;
}

.slot-quick-actions button {
  min-width: 34px;
  height: 32px;
  border: 0;
  border-radius: 13px;
  color: #fff;
  background: rgba(255,255,255,.10);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
  font-size: 11px;
  font-weight: 950;
}

.slot-machine.is-spinning .slot-window {
  box-shadow: 0 0 34px rgba(192,58,91,.12);
}

.slot-machine.is-spinning .slot-reel-strip {
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.slot-machine.is-spinning .slot-symbol {
  filter: none;
}

.slot-machine.is-win .slot-window {
  animation: slotWinPulse .7s ease both;
}

@keyframes slotWinPulse {
  0% { transform: scale(1); }
  42% { transform: scale(1.018); }
  100% { transform: scale(1); }
}

@keyframes slotSpinGlassPulse {
  0%, 100% {
    box-shadow: 0 18px 42px rgba(28,0,10,.56), 0 0 26px rgba(84,4,31,.18), inset 0 1px 0 rgba(255,255,255,.18), inset 0 0 0 1px rgba(255,255,255,.08), inset 0 -18px 34px rgba(8,0,4,.48);
    border-color: rgba(255,255,255,.16);
  }
  50% {
    box-shadow: 0 21px 48px rgba(36,0,13,.62), 0 0 34px rgba(106,8,40,.26), inset 0 1px 0 rgba(255,255,255,.22), inset 0 0 0 1px rgba(255,255,255,.10), inset 0 -18px 34px rgba(8,0,4,.42);
    border-color: rgba(255,255,255,.24);
  }
}

@keyframes slotSpinGlassShine {
  0%, 42% { transform: translateX(-145%) rotate(18deg); opacity: 0; }
  54% { opacity: .48; }
  72%, 100% { transform: translateX(360%) rotate(18deg); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  #slot .slot-spin-button,
  #slot .slot-spin-button:after {
    animation: none;
  }
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
    width: 56px;
    height: 56px;
  }

  .slot-machine {
    width: min(100%, 398px);
    margin-top: 6px;
    transform: translateY(-42px);
  }

  .slot-control-panel {
    width: min(100%, 398px);
    margin-top: -48px;
  }
}
`;