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
  cursor: pointer;
}

#slot .slot-spin-button:active {
  transform: translateY(1px) scale(.985);
}

#slot .slot-spin-button:disabled {
  opacity: .62;
}

.slot-control-panel {
  position: relative;
  z-index: 9;
  width: min(100%, 408px);
  margin: -38px auto 0;
}

.slot-controls {
  width: 88%;
  margin: 0 auto;
}

.slot-image-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  align-items: center;
}

.slot-image-control {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  height: 58px;
  padding: 0;
  border: 0;
  border-radius: 18px;
  color: #fff;
  background: transparent !important;
  box-shadow: none;
  overflow: hidden;
  isolation: isolate;
  transition: transform .18s ease, opacity .18s ease;
}

.slot-control-image {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  pointer-events: none;
  transition: opacity .22s ease;
}

.slot-control-image.is-loaded {
  opacity: 1;
}

.slot-control-fallback {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: inherit;
  background: linear-gradient(135deg, #170007 0%, #320313 42%, #51071f 68%, #190008 100%);
  box-shadow: 0 18px 42px rgba(12,0,5,.52), inset 0 1px 0 rgba(255,255,255,.12);
  font-size: 15px;
  font-weight: 950;
  letter-spacing: -.03em;
  text-shadow: 0 1px 12px rgba(0,0,0,.48);
}

.slot-control-image.is-loaded + .slot-control-fallback {
  opacity: 0;
}

.slot-input-control {
  cursor: text;
}

.slot-input-control input {
  position: relative;
  z-index: 1;
  width: 72%;
  height: 70%;
  border: 0;
  outline: 0;
  color: #fff;
  background: transparent;
  font-size: 16px;
  font-weight: 950;
  text-align: center;
  letter-spacing: -.03em;
  text-shadow: 0 1px 10px rgba(0,0,0,.58);
}

.slot-input-control input:disabled {
  opacity: .62;
}

.slot-input-control:before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: inherit;
  background: rgba(255,255,255,.06);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), inset 0 0 0 1px rgba(255,255,255,.06);
}

.slot-input-control:has(.slot-control-image.is-loaded):before {
  opacity: 0;
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
    box-shadow: 0 18px 42px rgba(12,0,5,.66), 0 0 22px rgba(68,3,24,.14), inset 0 1px 0 rgba(255,255,255,.12), inset 0 0 0 1px rgba(255,255,255,.06), inset 0 -18px 34px rgba(5,0,2,.58);
    border-color: rgba(255,255,255,.12);
  }
  50% {
    box-shadow: 0 21px 48px rgba(16,0,7,.70), 0 0 28px rgba(78,6,30,.20), inset 0 1px 0 rgba(255,255,255,.16), inset 0 0 0 1px rgba(255,255,255,.08), inset 0 -18px 34px rgba(5,0,2,.52);
    border-color: rgba(255,255,255,.18);
  }
}

@keyframes slotSpinGlassShine {
  0%, 42% { transform: translateX(-145%) rotate(18deg); opacity: 0; }
  54% { opacity: .34; }
  72%, 100% { transform: translateX(360%) rotate(18deg); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  #slot .slot-spin-button {
    transition: none;
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
    margin-top: -38px;
  }

  .slot-image-control {
    height: 54px;
  }
}
`;