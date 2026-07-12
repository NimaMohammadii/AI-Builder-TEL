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

/* ImageGen premium slot skin */
#slot.slot-view {
  isolation: isolate;
  min-height: calc(100dvh - 64px);
  padding: 22px 0 30px;
  background: #020202;
  overflow-y: auto;
  overflow-x: hidden;
  color: #f5f1ed;
}

#slot .slot-rewards-card {
  left:16px;top:14px;width:44px;height:44px;border-radius:15px;
  color:rgba(248,242,238,.9);
  background:linear-gradient(145deg,rgba(31,27,27,.96),rgba(6,5,5,.96))!important;
  border:1px solid rgba(255,255,255,.1)!important;
  box-shadow:0 14px 34px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.1)!important;
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
}
#slot .slot-rewards-card svg{filter:drop-shadow(0 5px 8px rgba(0,0,0,.5))}
#slot .slot-rewards-panel {
  background:linear-gradient(155deg,rgba(25,20,21,.99),rgba(3,3,3,.99))!important;
  border:1px solid rgba(255,255,255,.1)!important;
  box-shadow:0 34px 100px rgba(0,0,0,.76),inset 0 1px 0 rgba(255,255,255,.08);
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
}
#slot .slot-reward-row {
  background:linear-gradient(110deg,rgba(255,255,255,.035),rgba(76,13,30,.08))!important;
  border:1px solid rgba(255,255,255,.055)!important;
}

#slot .slot-machine {
  position:relative;z-index:3;width:min(96vw,430px);height:432px;min-height:0;
  margin:34px auto 0;padding:0;transform:none;perspective:900px;
}
#slot .slot-machine-shadow {
  position:absolute;left:8%;right:8%;bottom:16px;height:68px;z-index:0;border-radius:50%;
  background:rgba(0,0,0,.7);filter:blur(20px);transform:scaleX(.92);
  animation:slotMachineShadow 5s ease-in-out infinite;
}
#slot .slot-frame-image {
  top:0;left:0;z-index:8;width:100%;height:auto;object-fit:contain;opacity:1;
  filter:drop-shadow(0 28px 34px rgba(0,0,0,.72)) drop-shadow(0 5px 8px rgba(0,0,0,.48));
  transform-origin:50% 55%;animation:slotMachineFloat 5s cubic-bezier(.45,0,.55,1) infinite;
}
#slot .slot-window {
  position:absolute;top:116px;left:15.8%;z-index:4;width:68.4%;height:188px;
  margin:0;padding:5px;gap:5px;border-radius:24px;
  background:linear-gradient(180deg,#080707,#020202);
  border:1px solid rgba(255,255,255,.08);
  box-shadow:inset 0 18px 28px rgba(0,0,0,.78),inset 0 -18px 28px rgba(0,0,0,.82);
  transform:none;
}
#slot .slot-window::before,#slot .slot-window::after{height:49px}
#slot .slot-reel {
  border-radius:17px;
  background:linear-gradient(90deg,rgba(255,255,255,.035),transparent 24%,transparent 72%,rgba(255,255,255,.025)),linear-gradient(180deg,#100c0d,#060505 48%,#0d090a);
  border:1px solid rgba(255,255,255,.065);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),inset 0 0 24px rgba(0,0,0,.42);
}
#slot .slot-reel::after {
  content:"";position:absolute;inset:0;z-index:5;pointer-events:none;
  background:linear-gradient(112deg,transparent 7%,rgba(255,255,255,.055) 28%,transparent 46%);
  transform:translateX(-125%);animation:slotReelReflection 7s ease-in-out infinite;
}
#slot .slot-reel-strip{top:-4px}
#slot .slot-symbol{height:66px;filter:drop-shadow(0 8px 12px rgba(0,0,0,.5))}
#slot .slot-symbol-image{width:57px;height:57px}

#slot .slot-control-panel {
  position:relative;z-index:12;width:min(92vw,430px);margin:-60px auto 0;
  overflow:visible;background:transparent!important;border:0!important;box-shadow:none!important;
}
#slot .slot-controls.slot-image-controls {
  display:flex;align-items:center;justify-content:center;width:76%;margin:0 auto;overflow:visible;
}
#slot .slot-image-control.slot-spin-button {
  width:100%;max-width:326px;height:124px;margin:0 auto;overflow:visible;
  border-radius:30px!important;background:transparent!important;box-shadow:none!important;
  transform:translateZ(0);transition:transform .22s cubic-bezier(.2,.8,.2,1),filter .22s ease;
}
#slot .slot-button-shadow {
  position:absolute;left:11%;right:11%;bottom:19px;height:28px;z-index:-1;border-radius:50%;
  background:rgba(0,0,0,.78);filter:blur(12px);transition:transform .2s ease,opacity .2s ease;
}
#slot .slot-control-image {
  inset:0;width:100%;height:100%;object-fit:contain;opacity:1;
  filter:drop-shadow(0 17px 18px rgba(0,0,0,.66));
  transition:transform .2s cubic-bezier(.2,.8,.2,1),filter .2s ease,opacity .2s ease;
}
#slot .slot-spin-button::after {
  content:"";position:absolute;left:18%;top:30%;width:20%;height:37%;z-index:2;pointer-events:none;
  border-radius:50%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.13),transparent);
  filter:blur(3px);opacity:0;transform:skewX(-16deg) translateX(-190%);
  animation:slotButtonSheen 5.8s ease-in-out infinite;
}
#slot .slot-spin-button:active{transform:translateY(3px) scale(.975)}
#slot .slot-spin-button:active .slot-control-image{filter:drop-shadow(0 8px 10px rgba(0,0,0,.62)) brightness(.92)}
#slot .slot-spin-button:active .slot-button-shadow{opacity:.72;transform:scaleX(.82) translateY(-2px)}
#slot .slot-spin-button:disabled{opacity:.72}
#slot .slot-spin-button:disabled .slot-control-image {
  filter:drop-shadow(0 10px 12px rgba(0,0,0,.62)) saturate(.55) brightness(.8);
  animation:slotButtonRunning 1.1s ease-in-out infinite;
}
#slot .slot-control-fallback{opacity:0;pointer-events:none}
#slot .slot-machine.is-spinning .slot-frame-image{animation:slotMachineRunning .19s linear infinite}
#slot .slot-machine.is-spinning .slot-window {
  box-shadow:inset 0 20px 32px rgba(0,0,0,.84),inset 0 -20px 32px rgba(0,0,0,.88),0 14px 28px rgba(0,0,0,.3);
}
#slot .slot-machine.is-win .slot-frame-image{animation:slotMachineWin .72s cubic-bezier(.16,.84,.24,1) both}

#slot .slot-live {
  position:relative;z-index:5;width:min(90vw,398px);margin:18px auto 24px!important;
  border-radius:26px!important;
  background:linear-gradient(145deg,rgba(18,15,15,.97),rgba(3,3,3,.98))!important;
  border:1px solid rgba(255,255,255,.085)!important;
  box-shadow:0 28px 60px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.07)!important;
}
#slot .slot-live::before {
  content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;
  background:radial-gradient(circle at 15% 0,rgba(103,20,43,.12),transparent 38%);
}
#slot .slot-live-row {
  min-height:44px!important;border-radius:15px!important;
  background:linear-gradient(100deg,rgba(255,255,255,.035),rgba(73,13,29,.055))!important;
  border:1px solid rgba(255,255,255,.045)!important;
}
#slot .slot-live-toggle {
  background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025))!important;
  border:1px solid rgba(255,255,255,.065)!important;
}

@keyframes slotBackdropBreathe {
  from{transform:scale(1.012) translate3d(0,0,0);filter:brightness(.9) saturate(.88)}
  to{transform:scale(1.035) translate3d(0,-5px,0);filter:brightness(1) saturate(1)}
}
@keyframes slotDustRise {
  0%{opacity:0;transform:translate3d(0,24px,0) scale(.6)}
  25%{opacity:.5}72%{opacity:.16}
  100%{opacity:0;transform:translate3d(10px,-90px,0) scale(1)}
}
@keyframes slotMachineFloat {
  0%,100%{transform:translate3d(0,0,0) rotateX(0deg)}
  50%{transform:translate3d(0,-4px,0) rotateX(.35deg)}
}
@keyframes slotMachineShadow {
  0%,100%{opacity:.64;transform:scaleX(.9)}
  50%{opacity:.52;transform:scaleX(.86)}
}
@keyframes slotReelReflection {
  0%,64%{transform:translateX(-130%);opacity:0}72%{opacity:.72}
  90%,100%{transform:translateX(230%);opacity:0}
}
@keyframes slotButtonSheen {
  0%,68%{transform:skewX(-16deg) translateX(-210%);opacity:0}74%{opacity:.7}
  86%,100%{transform:skewX(-16deg) translateX(480%);opacity:0}
}
@keyframes slotButtonRunning{0%,100%{transform:scale(.99)}50%{transform:scale(.975)}}
@keyframes slotMachineRunning {
  0%{transform:translate3d(-.6px,0,0)}50%{transform:translate3d(.6px,-.4px,0)}
  100%{transform:translate3d(-.4px,.3px,0)}
}
@keyframes slotMachineWin {
  0%{transform:scale(1);filter:drop-shadow(0 28px 34px rgba(0,0,0,.72))}
  38%{transform:scale(1.025) translateY(-3px);filter:drop-shadow(0 34px 42px rgba(0,0,0,.78)) brightness(1.12)}
  100%{transform:scale(1);filter:drop-shadow(0 28px 34px rgba(0,0,0,.72))}
}

@media (max-width:380px) {
  #slot .slot-machine{width:min(98vw,398px);height:404px;margin-top:40px;transform:none}
  #slot .slot-window{top:108px;height:174px;margin:0;transform:none}
  #slot .slot-symbol{height:62px}
  #slot .slot-symbol-image{width:53px;height:53px}
  #slot .slot-control-panel{margin-top:-58px}
  #slot .slot-image-control.slot-spin-button{height:112px}
}

@media (prefers-reduced-motion:reduce) {
  #slot .slot-frame-image,#slot .slot-reel::after,#slot .slot-spin-button::after{animation:none!important}
}

/* Reference-led modern cabinet v2 */
body:has(#slot.active) { background:#020202!important; }
body:has(#slot.active) .app,
body:has(#slot.active) .app-shell,
body:has(#slot.active) .app-content,
body:has(#slot.active) .content,
body:has(#slot.active) main { background:transparent!important; }

#slot.slot-view {
  min-height:100dvh;
  background-color:#020202;
  background-image:url('/assets/Slotbackground.PNG?v=1');
  background-size:cover;
  background-position:center top;
  background-repeat:no-repeat;
  background-attachment:fixed;
}
#slot.slot-view::before,
#slot.slot-view::after {
  content:none!important;
  display:none!important;
}
#slot .slot-machine {
  width:min(96vw,430px);
  height:548px;
  margin-top:36px;
}
#slot .slot-frame-image {
  width:100%;
  height:auto;
  filter:drop-shadow(0 28px 34px rgba(0,0,0,.7));
}
#slot .slot-window {
  top:109px;
  left:11.2%;
  width:69.6%;
  height:289px;
  padding:6px;
  border-radius:24px;
  gap:5px;
}
#slot .slot-window::before,#slot .slot-window::after { height:68px; }
#slot .slot-reel-strip { top:0; }
#slot .slot-symbol { height:96px; }
#slot .slot-symbol-image { width:64px;height:64px; }
#slot .slot-control-panel { margin-top:-15px; }
#slot .slot-controls.slot-image-controls { width:78%; }
#slot .slot-image-control.slot-spin-button { max-width:330px;height:112px; }
#slot .slot-live { margin-top:8px!important; }

@media (max-width:380px) {
  #slot .slot-machine { width:min(97vw,398px);height:510px;margin-top:40px; }
  #slot .slot-window { top:101px;height:267px; }
  #slot .slot-symbol { height:89px; }
  #slot .slot-symbol-image { width:59px;height:59px; }
  #slot .slot-control-panel { margin-top:-12px; }
}


/* ImageGen integrated slot control console */
#slot .slot-control-panel{
  position:relative!important;
  z-index:12!important;
  width:min(96vw,430px)!important;
  aspect-ratio:900/445!important;
  height:auto!important;
  margin:-38px auto 0!important;
  overflow:visible!important;
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
  isolation:isolate;
}
#slot .slot-console-image{
  position:absolute;
  inset:0;
  z-index:0;
  width:100%;
  height:100%;
  object-fit:contain;
  display:block;
  pointer-events:none;
  filter:drop-shadow(0 24px 28px rgba(0,0,0,.7));
}
#slot .slot-console-ui{
  position:absolute;
  inset:0;
  z-index:2;
}
#slot .slot-console-hit,
#slot .slot-bet-display{
  position:absolute;
  transform:translate(-50%,-50%);
  margin:0!important;
}
#slot .slot-console-hit{
  display:flex;
  align-items:center;
  justify-content:center;
  padding:0!important;
  border:0!important;
  outline:0!important;
  color:#f4e2cd!important;
  background:transparent!important;
  box-shadow:none!important;
  font-family:inherit;
  font-weight:950;
  text-shadow:0 2px 8px rgba(0,0,0,.8);
  cursor:pointer;
  -webkit-tap-highlight-color:transparent;
  transition:transform .13s ease,opacity .18s ease,filter .18s ease;
}
#slot .slot-console-hit:active{
  transform:translate(-50%,-47%) scale(.91);
  filter:brightness(.84);
}
#slot .slot-console-hit:disabled{
  opacity:.48!important;
  cursor:default;
}
#slot .slot-bet-step{
  top:30%;
  width:16%;
  height:27%;
  border-radius:50%!important;
  font-size:27px;
  line-height:1;
}
#slot .slot-bet-minus{left:16.3%}
#slot .slot-bet-plus{left:83.7%}
#slot .slot-bet-display{
  left:50%;
  top:30%;
  width:44%;
  height:24%;
  display:grid;
  grid-template-columns:auto minmax(0,1fr) auto;
  align-items:center;
  gap:7px;
  padding:0 8px;
  color:#f4e2cd;
  pointer-events:auto;
}
#slot .slot-bet-display span,
#slot .slot-bet-display small{
  font-size:9px;
  font-weight:950;
  letter-spacing:.12em;
  color:rgba(244,226,205,.66);
}
#slot .slot-bet-display input{
  width:100%;
  min-width:0;
  height:100%;
  padding:0!important;
  border:0!important;
  outline:0!important;
  color:#fff4e8!important;
  background:transparent!important;
  box-shadow:none!important;
  appearance:textfield;
  -moz-appearance:textfield;
  text-align:center;
  font-size:22px;
  font-weight:1000;
  letter-spacing:-.04em;
  text-shadow:0 2px 10px rgba(0,0,0,.85);
}
#slot .slot-bet-display input::-webkit-inner-spin-button,
#slot .slot-bet-display input::-webkit-outer-spin-button{
  margin:0;
  -webkit-appearance:none;
}
#slot .slot-bet-quick{
  top:68%;
  width:15%;
  height:26%;
  border-radius:50%!important;
  font-size:14px;
  letter-spacing:.02em;
}
#slot .slot-bet-half{left:16%}
#slot .slot-bet-max{left:84%}
#slot .slot-spin-button{
  left:50%;
  top:68%;
  width:47%;
  height:28%;
  border-radius:28px!important;
  flex-direction:column;
  gap:0;
}
#slot .slot-spin-label{
  display:block;
  font-family:Georgia,serif;
  font-size:22px;
  line-height:1;
  letter-spacing:.065em;
  color:#fff0dc;
}
#slot .slot-spin-cost{
  display:block;
  margin-top:4px;
  font-size:9px;
  line-height:1;
  letter-spacing:.15em;
  color:rgba(255,235,211,.72);
}
#slot .slot-spin-button::after{content:none!important;display:none!important}
#slot .slot-live{margin-top:10px!important}

@media(max-width:380px){
  #slot .slot-control-panel{
    width:min(97vw,398px)!important;
    margin-top:-34px!important;
  }
  #slot .slot-bet-step{font-size:24px}
  #slot .slot-bet-display input{font-size:20px}
  #slot .slot-spin-label{font-size:20px}
}


/* Unified physical cabinet: machine + controls */
#slot .slot-cabinet{
  position:relative;
  z-index:3;
  width:min(96vw,430px);
  margin:36px auto 0;
  animation:slotCabinetFloat 5s cubic-bezier(.45,0,.55,1) infinite;
  transform-origin:50% 52%;
}
#slot .slot-cabinet .slot-machine{
  width:100%!important;
  height:548px!important;
  min-height:0!important;
  margin:0!important;
  transform:none!important;
  perspective:none!important;
}
#slot .slot-cabinet .slot-frame-image,
#slot .slot-cabinet .slot-machine.is-spinning .slot-frame-image,
#slot .slot-cabinet .slot-machine.is-win .slot-frame-image{
  animation:none!important;
}
#slot .slot-cabinet .slot-control-panel{
  width:83.5%!important;
  max-width:359px!important;
  margin:-68px auto 0!important;
  transform:none!important;
}
#slot .slot-cabinet:has(.slot-machine.is-spinning){
  animation:slotCabinetRunning .2s linear infinite;
}
#slot .slot-cabinet:has(.slot-machine.is-win){
  animation:slotCabinetWin .72s cubic-bezier(.16,.84,.24,1) both;
}
#slot .slot-live{
  margin-top:2px!important;
}
@keyframes slotCabinetFloat{
  0%,100%{transform:translate3d(0,0,0)}
  50%{transform:translate3d(0,-3px,0)}
}
@keyframes slotCabinetRunning{
  0%{transform:translate3d(-.45px,0,0)}
  50%{transform:translate3d(.45px,-.25px,0)}
  100%{transform:translate3d(-.3px,.2px,0)}
}
@keyframes slotCabinetWin{
  0%{transform:scale(1)}
  38%{transform:scale(1.018) translateY(-2px)}
  100%{transform:scale(1)}
}
@media(max-width:380px){
  #slot .slot-cabinet{
    width:min(97vw,398px);
    margin-top:40px;
  }
  #slot .slot-cabinet .slot-machine{
    height:510px!important;
  }
  #slot .slot-cabinet .slot-control-panel{
    width:84%!important;
    max-width:334px!important;
    margin-top:-64px!important;
  }
}
@media(prefers-reduced-motion:reduce){
  #slot .slot-cabinet,
  #slot .slot-cabinet:has(.slot-machine.is-spinning),
  #slot .slot-cabinet:has(.slot-machine.is-win){
    animation:none!important;
  }
}


/* Flush-mounted console + unboxed control typography */
#slot .slot-cabinet .slot-control-panel{
  margin-top:-96px!important;
}
#slot .slot-console-ui,
#slot .slot-console-ui label,
#slot .slot-console-ui button,
#slot .slot-console-ui input,
#slot .slot-console-ui strong,
#slot .slot-console-ui span,
#slot .slot-console-ui small{
  background:none!important;
  background-color:transparent!important;
  background-image:none!important;
  border:0!important;
  outline:0!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
#slot .slot-console-ui label::before,
#slot .slot-console-ui label::after,
#slot .slot-console-ui button::before,
#slot .slot-console-ui button::after,
#slot .slot-console-ui input::before,
#slot .slot-console-ui input::after,
#slot .slot-console-ui strong::before,
#slot .slot-console-ui strong::after,
#slot .slot-console-ui span::before,
#slot .slot-console-ui span::after,
#slot .slot-console-ui small::before,
#slot .slot-console-ui small::after{
  content:none!important;
  display:none!important;
  background:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
#slot .slot-bet-display,
#slot .slot-spin-button{
  filter:none!important;
}
@media(max-width:380px){
  #slot .slot-cabinet .slot-control-panel{
    margin-top:-92px!important;
  }
}

`;
