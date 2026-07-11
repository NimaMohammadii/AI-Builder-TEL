import { SLOT_BACKGROUND_DATA_URI } from './slot-background';

export const SLOT_STYLES = `
html:has(#slot.active),
body:has(#slot.active) {
  min-height: 100%;
  background: #010005 !important;
  background-image: none !important;
}

body:has(#slot.active)::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,.34)), url('${SLOT_BACKGROUND_DATA_URI}');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transform: translateZ(0);
}

body:has(#slot.active) .app,
body:has(#slot.active) main.app,
body:has(#slot.active) .content,
body:has(#slot.active) .view.active,
body:has(#slot.active) #slot,
body:has(#slot.active) .top,
body:has(#slot.active) header.top {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
}

body:has(#slot.active) .content {
  min-height: 100dvh;
}

body:has(#slot.active) .app {
  position: relative;
  z-index: 1;
}

.slot-view {
  position: relative;
  min-height: 100dvh;
  padding: 4px 0 18px;
  overflow: auto;
  isolation: isolate;
}

body:has(#slot.active) .tabs {
  display: none !important;
}

.slot-machine {
  position: relative;
  z-index: 2;
  width: min(100%, 408px);
  margin: 8px auto 0;
  min-height: 465px;
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
  height: auto;
  object-fit: contain;
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
  margin: -112px auto 0;
}

.slot-controls {
  width: 94%;
  margin: 0 auto;
}

.slot-image-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-items: center;
}

.slot-image-control {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  height: clamp(72px, 18vw, 86px);
  padding: 0;
  border: 0 !important;
  border-radius: 0 !important;
  color: #fff;
  background: transparent !important;
  box-shadow: none !important;
  appearance: none;
  -webkit-appearance: none;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  overflow: visible;
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
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
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
  border: 0 !important;
  outline: 0;
  color: #fff;
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  padding: 0 !important;
  font-size: 16px;
  font-weight: 950;
  text-align: center;
  letter-spacing: -.03em;
  text-shadow: 0 1px 10px rgba(0,0,0,.58);
}

.slot-input-control input:disabled {
  opacity: .62;
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


#slot .slot-live {
  width: min(92%, 408px);
  margin: -2px auto 18px;
  border-radius: 32px !important;
  background: #050505 !important;
  border: 1px solid rgba(255,255,255,.10) !important;
  box-shadow: 0 24px 74px rgba(0,0,0,.50), inset 0 1px 0 rgba(255,255,255,.08) !important;
  padding: 14px !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  overflow: hidden !important;
  transition: max-height .34s cubic-bezier(.2,.8,.2,1), padding .28s ease, opacity .2s ease !important;
  max-height: 430px !important;
}

#slot .slot-live:not(.open) {
  max-height: 54px !important;
  padding-bottom: 12px !important;
}

#slot .slot-live-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  margin-bottom: 10px !important;
  color: rgba(255,255,255,.50) !important;
  font-size: 13px !important;
  font-weight: 850 !important;
  letter-spacing: -.02em !important;
  text-transform: none !important;
}

#slot .slot-live-title {
  display: inline-flex !important;
  align-items: center !important;
  gap: 7px !important;
  min-width: 0 !important;
  color: rgba(255,255,255,.58) !important;
}

#slot .slot-live-title svg {
  width: 17px !important;
  height: 17px !important;
  display: block !important;
  flex: 0 0 auto !important;
  color: rgba(255,255,255,.55) !important;
}

#slot .slot-live-title svg path {
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 1.9 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}

#slot .slot-live-title span {
  display: inline-block !important;
  white-space: nowrap !important;
}

#slot .slot-live-head-actions {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

#slot .slot-live-head b {
  color: rgba(255,255,255,.92) !important;
  font-size: 13px !important;
  font-weight: 900 !important;
  letter-spacing: -.02em !important;
  text-transform: none !important;
}

#slot .slot-live-toggle {
  width: 28px !important;
  height: 28px !important;
  border: 0 !important;
  outline: 0 !important;
  border-radius: 10px !important;
  background: rgba(255,255,255,.055) !important;
  color: rgba(255,255,255,.85) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  box-shadow: none !important;
  transition: transform .22s ease, background .18s ease !important;
}

#slot .slot-live-toggle svg {
  width: 18px !important;
  height: 18px !important;
  display: block !important;
  transition: transform .28s cubic-bezier(.2,.8,.2,1) !important;
}

#slot .slot-live-toggle path {
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 2.4 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}

#slot .slot-live.open .slot-live-toggle svg {
  transform: rotate(180deg) !important;
}

#slot .slot-live-toggle:active {
  transform: scale(.94) !important;
  background: rgba(255,255,255,.09) !important;
}

#slot .slot-live-list {
  display: grid !important;
  gap: 6px !important;
  max-height: 394px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding-right: 2px !important;
  scrollbar-width: thin !important;
  scrollbar-color: rgba(255,255,255,.18) transparent !important;
  transition: max-height .34s cubic-bezier(.2,.8,.2,1), opacity .22s ease !important;
}

#slot .slot-live:not(.open) .slot-live-list {
  max-height: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

#slot .slot-live-list::-webkit-scrollbar {
  width: 4px !important;
  display: block !important;
}

#slot .slot-live-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,.18) !important;
  border-radius: 999px !important;
}

#slot .slot-live-empty {
  font-size: 12px !important;
  font-weight: 820 !important;
  color: rgba(255,255,255,.45) !important;
  padding: 14px 0 !important;
  text-align: center !important;
}

#slot .slot-live-row {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto !important;
  align-items: center !important;
  gap: 8px !important;
  min-height: 34px !important;
  border-radius: 17px !important;
  background: #030303 !important;
  border: 1px solid rgba(255,255,255,.08) !important;
  outline: 0 !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.035) !important;
  color: #fff !important;
  padding: 2px 10px !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

#slot .slot-live-user {
  min-width: 0 !important;
  font-size: 12px !important;
  font-weight: 900 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  color: rgba(255,255,255,.92) !important;
}

#slot .slot-live-result {
  font-size: 14px !important;
  font-weight: 930 !important;
  color: rgba(255,255,255,.84) !important;
  white-space: nowrap !important;
  letter-spacing: .04em !important;
}


#slot .slot-live-row.is-entering {
  animation: slotLiveRowIn .54s cubic-bezier(.2,.9,.2,1) both !important;
}

#slot .slot-live-result {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 7px !important;
}

#slot .slot-live-symbol {
  width: 21px !important;
  height: 21px !important;
  display: inline-grid !important;
  place-items: center !important;
  flex: 0 0 auto !important;
  font-size: 16px !important;
  line-height: 1 !important;
  filter: drop-shadow(0 5px 10px rgba(0,0,0,.38)) !important;
  animation: slotLiveSymbolPop .46s cubic-bezier(.2,.9,.2,1) both !important;
}

#slot .slot-live-symbol:nth-child(2) {
  animation-delay: .05s !important;
}

#slot .slot-live-symbol:nth-child(3) {
  animation-delay: .10s !important;
}

#slot .slot-live-symbol img {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  display: block !important;
  pointer-events: none !important;
}

#slot .slot-live-symbol.has-image > span {
  display: none !important;
}

@keyframes slotLiveRowIn {
  0% { opacity: 0; transform: translate3d(0, -12px, 0) scale(.985); filter: blur(5px); }
  58% { opacity: 1; transform: translate3d(0, 2px, 0) scale(1.006); filter: blur(0); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
}

@keyframes slotLiveSymbolPop {
  0% { opacity: 0; transform: translateY(5px) scale(.72) rotate(-7deg); }
  70% { opacity: 1; transform: translateY(-1px) scale(1.08) rotate(2deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
}

@media (prefers-reduced-motion: reduce) {
  #slot .slot-spin-button {
    transition: none;
  }

  #slot .slot-live-row.is-entering,
  #slot .slot-live-symbol {
    animation: none !important;
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
    min-height: 452px;
    margin-top: 6px;
    transform: translateY(-42px);
  }

  .slot-control-panel {
    width: min(100%, 398px);
    margin-top: -106px;
  }

  .slot-image-control {
    height: 68px;
  }
}
`;
