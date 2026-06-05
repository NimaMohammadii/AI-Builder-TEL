import { DICE_SECTION as RAW_DICE_SECTION } from './dice';

const DICE_RANGE_CARD_STYLES = `
.dice-view .dice-range-card {
  position: fixed !important;
  top: calc(env(safe-area-inset-top) + 138px) !important;
  left: 14px !important;
  right: 14px !important;
  z-index: 8 !important;
  width: auto !important;
  max-width: 520px !important;
  height: 170px !important;
  margin: 0 auto !important;
  padding: 18px 12px !important;
  box-sizing: border-box !important;
  border-radius: 28px !important;
  background: rgba(0, 0, 0, .62) !important;
  border: 1px solid rgba(255, 255, 255, .12) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10) !important;
  transform: none !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  gap: 0 !important;
  backdrop-filter: blur(14px) saturate(1.16) !important;
  -webkit-backdrop-filter: blur(14px) saturate(1.16) !important;
}

.dice-view .dice-track-labels {
  flex: 0 0 auto !important;
  height: 18px !important;
  padding: 0 19px !important;
  transform: translateY(14px) !important;
  color: rgba(255, 255, 255, .50) !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  z-index: 5 !important;
}

.dice-view .dice-slider-shell {
  flex: 0 0 auto !important;
  width: 100% !important;
  margin-top: 0 !important;
}

.dice-view .dice-slider-visual {
  background: rgba(0, 0, 0, .78) !important;
}

.dice-view .dice-slider-thumb {
  width: 34px !important;
  height: 34px !important;
  border-radius: 12px !important;
  backdrop-filter: blur(7px) saturate(1.22) !important;
  -webkit-backdrop-filter: blur(7px) saturate(1.22) !important;
}

body:has(#dice.active) #brandTitle {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.dice-online-badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 5px !important;
  min-width: 0 !important;
  color: rgba(255, 255, 255, .90) !important;
  font-size: 10.5px !important;
  font-weight: 900 !important;
  letter-spacing: -.02em !important;
  white-space: nowrap !important;
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin-left: 2px !important;
  transform: translateY(1px) !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

.dice-online-badge i {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: #18ff84 !important;
  box-shadow: 0 0 0 1px rgba(24, 255, 132, .25), 0 0 10px rgba(24, 255, 132, .46), 0 0 20px rgba(24, 255, 132, .18), inset 0 1px 0 rgba(255, 255, 255, .34) !important;
  flex: 0 0 auto !important;
  position: relative !important;
  animation: liveDotSoft 1.35s ease-in-out infinite !important;
}

.dice-online-badge i::before {
  content: '' !important;
  position: absolute !important;
  inset: -5px !important;
  border-radius: inherit !important;
  border: 1px solid rgba(24, 255, 132, .46) !important;
  opacity: .45 !important;
  animation: liveDotRing 1.35s ease-in-out infinite !important;
}

.dice-online-badge em {
  font-style: normal !important;
  font-size: 8px !important;
  font-weight: 900 !important;
  letter-spacing: .08em !important;
  color: rgba(24, 255, 132, .92) !important;
  text-transform: uppercase !important;
  line-height: 1 !important;
}

.dice-online-badge b {
  display: inline-block !important;
  min-width: 23px !important;
  font-size: 10.5px !important;
  font-weight: 900 !important;
  color: rgba(255, 255, 255, .90) !important;
  text-shadow: 0 6px 14px rgba(0, 0, 0, .56), 0 0 10px rgba(255, 255, 255, .08) !important;
  font-variant-numeric: tabular-nums !important;
}

.dice-view .dice-result-card {
  position: fixed !important;
  top: calc(env(safe-area-inset-top) + 318px) !important;
  left: 14px !important;
  right: 14px !important;
  z-index: 7 !important;
  width: auto !important;
  max-width: 520px !important;
  margin: 0 auto !important;
  padding: 14px !important;
  box-sizing: border-box !important;
  border-radius: 32px !important;
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, .12) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08) !important;
  overflow: hidden !important;
  max-height: 430px !important;
  transition: max-height .34s cubic-bezier(.2, .8, .2, 1), padding .28s ease, opacity .2s ease !important;
  backdrop-filter: blur(3px) !important;
  -webkit-backdrop-filter: blur(3px) !important;
}

.dice-view .dice-result-card:not(.open) {
  max-height: 54px !important;
  padding-bottom: 12px !important;
}

.dice-view .dice-result-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  margin-bottom: 10px !important;
  color: rgba(255, 255, 255, .50) !important;
  font-size: 13px !important;
  font-weight: 850 !important;
  letter-spacing: -.02em !important;
  text-transform: none !important;
}

.dice-view .dice-result-title {
  display: inline-flex !important;
  align-items: center !important;
  gap: 7px !important;
  min-width: 0 !important;
  color: rgba(255, 255, 255, .58) !important;
}

.dice-view .dice-result-title svg {
  width: 17px !important;
  height: 17px !important;
  display: block !important;
  flex: 0 0 auto !important;
  color: rgba(255, 255, 255, .55) !important;
}

.dice-view .dice-result-title svg path {
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 1.9 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}

.dice-view .dice-result-head-actions {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.dice-view .dice-result-total {
  color: rgba(255, 255, 255, .92) !important;
  font-size: 13px !important;
  font-weight: 900 !important;
  letter-spacing: -.02em !important;
  text-transform: none !important;
}

.dice-view .dice-result-toggle {
  width: 28px !important;
  height: 28px !important;
  border: 0 !important;
  outline: 0 !important;
  border-radius: 10px !important;
  background: rgba(255, 255, 255, .055) !important;
  color: rgba(255, 255, 255, .85) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  box-shadow: none !important;
  transition: transform .22s ease, background .18s ease !important;
}

.dice-view .dice-result-toggle svg {
  width: 18px !important;
  height: 18px !important;
  display: block !important;
  transition: transform .28s cubic-bezier(.2, .8, .2, 1) !important;
}

.dice-view .dice-result-toggle path {
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 2.4 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}

.dice-view .dice-result-card.open .dice-result-toggle svg {
  transform: rotate(180deg) !important;
}

.dice-view .dice-result-toggle:active {
  transform: scale(.94) !important;
  background: rgba(255, 255, 255, .09) !important;
}

.dice-view .dice-result-list {
  display: grid !important;
  gap: 6px !important;
  max-height: 394px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding-right: 2px !important;
  scrollbar-width: thin !important;
  scrollbar-color: rgba(255, 255, 255, .18) transparent !important;
  transition: max-height .34s cubic-bezier(.2, .8, .2, 1), opacity .22s ease !important;
}

.dice-view .dice-result-card:not(.open) .dice-result-list {
  max-height: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.dice-view .dice-result-list::-webkit-scrollbar {
  width: 4px !important;
  display: block !important;
}

.dice-view .dice-result-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, .18) !important;
  border-radius: 999px !important;
}

.dice-view .dice-result-empty {
  font-size: 12px !important;
  font-weight: 820 !important;
  color: rgba(255, 255, 255, .45) !important;
  padding: 14px 0 !important;
  text-align: center !important;
}

.dice-view .dice-result-row {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto auto !important;
  align-items: center !important;
  gap: 8px !important;
  min-height: 34px !important;
  border-radius: 17px !important;
  background: rgba(0, 0, 0, .16) !important;
  border: 1px solid rgba(255, 255, 255, .08) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .035) !important;
  color: #fff !important;
  padding: 2px 10px !important;
  backdrop-filter: blur(3px) !important;
  -webkit-backdrop-filter: blur(3px) !important;
}

.dice-view .dice-result-name {
  min-width: 0 !important;
  font-size: 12px !important;
  font-weight: 900 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  color: rgba(255, 255, 255, .92) !important;
}

.dice-view .dice-result-value,
.dice-view .dice-result-roll {
  font-size: 11px !important;
  font-weight: 930 !important;
  color: rgba(255, 255, 255, .62) !important;
  white-space: nowrap !important;
}

.dice-view .dice-result-row.is-positive .dice-result-value {
  color: #78ffb3 !important;
}

@media (max-width: 420px) {
  .dice-view .dice-range-card {
    top: calc(env(safe-area-inset-top) + 130px) !important;
    left: 14px !important;
    right: 14px !important;
    width: auto !important;
    height: 150px !important;
    padding: 16px 10px !important;
  }

  .dice-view .dice-track-labels {
    height: 17px !important;
    font-size: 12px !important;
    transform: translateY(13px) !important;
  }

  .dice-view .dice-slider-thumb {
    width: 32px !important;
    height: 32px !important;
  }

  .dice-view .dice-result-card {
    top: calc(env(safe-area-inset-top) + 288px) !important;
    left: 14px !important;
    right: 14px !important;
  }

  .dice-online-badge {
    gap: 4px !important;
  }

  .dice-online-badge i {
    width: 7px !important;
    height: 7px !important;
  }

  .dice-online-badge em {
    font-size: 7.4px !important;
  }

  .dice-online-badge b {
    min-width: 20px !important;
    font-size: 9.4px !important;
  }
}
`;


const DICE_LUXURY_CASINO_STYLES = `
html:has(#dice.active),
body:has(#dice.active) {
  background: #000 !important;
  background-image: radial-gradient(circle at 50% 8%, rgba(122, 15, 46, .26), rgba(0, 0, 0, 0) 34%), linear-gradient(180deg, #050003 0%, #000 42%, #050003 100%) !important;
  font-family: Inter, ui-rounded, "SF Pro Rounded", "SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important;
}

body:has(#dice.active) .app,
body:has(#dice.active) main.app,
body:has(#dice.active) .content,
body:has(#dice.active) .top,
body:has(#dice.active) header.top {
  background: transparent !important;
  background-image: none !important;
}

.dice-view {
  padding-left: 24px !important;
  padding-right: 24px !important;
  background: radial-gradient(circle at 50% 11%, rgba(122, 15, 46, .22), transparent 36%), linear-gradient(180deg, #040003 0%, #000 52%, #040003 100%) !important;
  font-family: Inter, ui-rounded, "SF Pro Rounded", "SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important;
}

.dice-view::after {
  content: '' !important;
  position: fixed !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background: radial-gradient(circle at 50% 31%, rgba(255, 77, 122, .08), transparent 34%), radial-gradient(circle at 94% 69%, rgba(176, 23, 70, .08), transparent 30%) !important;
}

.dice-wrap {
  max-width: 520px !important;
  gap: 18px !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.dice-view .dice-range-card,
.dice-view .dice-result-card,
.dice-panel,
.dice-bet-box {
  background: linear-gradient(180deg, rgba(20, 12, 16, .78), rgba(7, 4, 6, .74)) !important;
  border: 1px solid rgba(255, 75, 120, .25) !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .55), inset 0 1px 1px rgba(255, 255, 255, .08), inset 0 -1px 12px rgba(255, 0, 80, .08) !important;
  backdrop-filter: blur(18px) saturate(1.28) !important;
  -webkit-backdrop-filter: blur(18px) saturate(1.28) !important;
}

.dice-view .dice-range-card {
  left: 24px !important;
  right: 24px !important;
  height: 184px !important;
  padding: 30px 20px 24px !important;
  border-radius: 34px !important;
}

.dice-view .dice-range-card::before {
  content: 'Move the slider to set your target' !important;
  display: block !important;
  position: absolute !important;
  top: 18px !important;
  left: 0 !important;
  right: 0 !important;
  text-align: center !important;
  color: rgba(255, 255, 255, .62) !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  letter-spacing: -.01em !important;
  text-shadow: 0 1px 10px rgba(255, 77, 122, .16) !important;
}

.dice-view .dice-range-card::after {
  content: 'LOWER                           HIGHER' !important;
  position: absolute !important;
  left: 28px !important;
  right: 28px !important;
  bottom: 20px !important;
  color: rgba(255, 255, 255, .52) !important;
  font-size: 12px !important;
  font-weight: 750 !important;
  letter-spacing: .08em !important;
  white-space: pre !important;
  display: flex !important;
  justify-content: space-between !important;
}

.dice-view .dice-track-labels {
  margin-top: 18px !important;
  height: 28px !important;
  padding: 0 2px !important;
  transform: none !important;
  color: rgba(255, 255, 255, .78) !important;
  font-size: 14px !important;
  font-weight: 850 !important;
  text-shadow: 0 8px 18px rgba(0, 0, 0, .62) !important;
}

.dice-view .dice-track-labels span:nth-child(1){left:2px !important}.dice-view .dice-track-labels span:nth-child(2){left:25% !important}.dice-view .dice-track-labels span:nth-child(3){left:50% !important}.dice-view .dice-track-labels span:nth-child(4){left:75% !important}.dice-view .dice-track-labels span:nth-child(5){left:calc(100% - 2px) !important}

.dice-view .dice-slider-shell {
  height: 76px !important;
  padding: 28px 0 16px !important;
}

.dice-view .dice-slider-shell::before {
  left: 0 !important;
  right: 0 !important;
  top: 2px !important;
  height: 16px !important;
  opacity: .45 !important;
  background: repeating-linear-gradient(90deg, rgba(255, 255, 255, .30) 0 1px, transparent 1px calc(5% - 1px)) !important;
  clip-path: none !important;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent) !important;
  mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent) !important;
}

.dice-view .dice-slider-visual {
  left: 0 !important;
  right: 0 !important;
  height: 38px !important;
  border-radius: 999px !important;
  background: rgba(2, 2, 3, .82) !important;
  border: 1px solid rgba(255, 255, 255, .14) !important;
  box-shadow: 0 18px 40px rgba(0, 0, 0, .6), inset 0 1px 3px rgba(255, 255, 255, .16), inset 0 -1px 4px rgba(255, 77, 122, .12) !important;
}

.dice-view .dice-slider-visual::before {
  left: 10px !important;
  right: 10px !important;
  height: 24px !important;
  background: linear-gradient(90deg, rgba(11, 92, 39, .92) 0%, rgba(30, 128, 61, .78) var(--dice-fill-pos), rgba(122, 15, 46, .88) var(--dice-fill-pos), rgba(80, 2, 27, .92) 100%) !important;
  box-shadow: inset 0 2px 5px rgba(255, 255, 255, .16), inset 0 -5px 13px rgba(0, 0, 0, .32), 0 0 18px rgba(255, 77, 122, .18) !important;
}

.dice-view .dice-slider-thumb {
  width: 54px !important;
  height: 54px !important;
  border-radius: 18px !important;
  background: linear-gradient(180deg, rgba(93, 53, 68, .78), rgba(37, 24, 30, .72)) !important;
  border: 1px solid rgba(255, 104, 148, .7) !important;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, .08), 0 0 32px rgba(255, 77, 122, .35), 0 18px 38px rgba(0, 0, 0, .68), inset 0 1px 1px rgba(255, 255, 255, .22), inset 0 -10px 18px rgba(122, 15, 46, .18) !important;
}

.dice-view .dice-slider-thumb::before {
  width: 24px !important;
  height: 28px !important;
  background: linear-gradient(90deg, rgba(255, 255, 255, .88) 0 5px, transparent 5px 10px, rgba(255, 255, 255, .88) 10px 15px, transparent 15px 20px, rgba(255, 255, 255, .88) 20px 24px) !important;
}

.dice-view .dice-roll-marker::before {
  color: rgba(255, 255, 255, .92) !important;
  text-shadow: 0 0 14px rgba(255, 77, 122, .36) !important;
}

.dice-view .dice-result-card {
  left: 24px !important;
  right: 24px !important;
  top: calc(env(safe-area-inset-top) + 348px) !important;
  min-height: 70px !important;
  padding: 16px 18px !important;
  border-radius: 28px !important;
}

.dice-view .dice-result-card:not(.open) {
  max-height: 70px !important;
  padding-bottom: 16px !important;
}

.dice-view .dice-result-head {
  margin-bottom: 12px !important;
  font-size: 18px !important;
  font-weight: 900 !important;
  color: rgba(255, 255, 255, .92) !important;
}

.dice-view .dice-result-title {
  gap: 13px !important;
  color: rgba(255, 255, 255, .86) !important;
}

.dice-view .dice-result-title svg {
  width: 24px !important;
  height: 24px !important;
  color: rgba(255, 255, 255, .72) !important;
  filter: drop-shadow(0 0 10px rgba(255, 77, 122, .22)) !important;
}

.dice-view .dice-result-total {
  color: #fff !important;
  font-size: 20px !important;
}

.dice-view .dice-result-toggle {
  width: 44px !important;
  height: 44px !important;
  border-radius: 16px !important;
  background: rgba(255, 255, 255, .055) !important;
  border: 1px solid rgba(255, 255, 255, .08) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .06), 0 10px 24px rgba(0, 0, 0, .32) !important;
}

.dice-status {
  margin-top: auto !important;
  margin-bottom: 10px !important;
  min-height: 28px !important;
  color: rgba(255, 255, 255, .58) !important;
  font-size: 18px !important;
  font-weight: 900 !important;
  text-shadow: 0 0 22px rgba(255, 77, 122, .14) !important;
}

.dice-panel {
  border-radius: 34px !important;
  padding: 22px 20px 24px !important;
  border-color: rgba(255, 75, 120, .28) !important;
  background: linear-gradient(180deg, rgba(20, 10, 14, .80), rgba(5, 3, 5, .82)) !important;
}

.dice-control-grid {
  gap: 12px !important;
}

.dice-field,
.dice-bet button,
.dice-stat,
.dice-bet-input {
  background: linear-gradient(180deg, rgba(28, 19, 23, .74), rgba(8, 7, 8, .72)) !important;
  border: 1px solid rgba(255, 255, 255, .08) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08), inset 0 -1px 10px rgba(255, 0, 80, .045), 0 14px 30px rgba(0, 0, 0, .28) !important;
  backdrop-filter: blur(12px) saturate(1.18) !important;
  -webkit-backdrop-filter: blur(12px) saturate(1.18) !important;
}

.dice-field {
  min-height: 116px !important;
  border-radius: 24px !important;
  padding: 18px 14px 15px !important;
}

.dice-field small,
.dice-stat small,
.dice-bet-box small {
  color: rgba(255, 255, 255, .58) !important;
  font-size: 12px !important;
  font-weight: 850 !important;
  letter-spacing: .08em !important;
  text-transform: uppercase !important;
}

.dice-field b {
  margin-top: 20px !important;
  color: #fff !important;
  font-size: 32px !important;
  font-weight: 950 !important;
  letter-spacing: -.055em !important;
  text-shadow: 0 0 16px rgba(255, 77, 122, .30) !important;
}

.dice-field b span,
.dice-field b i {
  color: #fff !important;
}

.dice-field::after {
  content: '' !important;
  display: block !important;
  width: 24px !important;
  height: 22px !important;
  margin: 12px auto 0 !important;
  opacity: .86 !important;
  background: linear-gradient(135deg, rgba(255, 77, 122, .88), rgba(255, 255, 255, .42)) !important;
  -webkit-mask: radial-gradient(circle at 30% 70%, transparent 0 3px, #000 3.5px) left/50% 100% no-repeat, linear-gradient(#000 0 0) !important;
  mask: linear-gradient(#000 0 0) !important;
  border-radius: 7px !important;
}

.dice-mode-field {
  border-color: rgba(255, 77, 122, .38) !important;
  box-shadow: 0 0 28px rgba(255, 77, 122, .14), inset 0 1px 0 rgba(255, 255, 255, .08), inset 0 -1px 14px rgba(255, 0, 80, .10) !important;
}

.dice-bet {
  gap: 16px !important;
  margin-top: 18px !important;
}

.dice-bet button {
  height: 58px !important;
  border-radius: 22px !important;
  color: rgba(255, 255, 255, .82) !important;
  font-size: 18px !important;
  font-weight: 950 !important;
}

.dice-bet button.active,
.dice-bet-main {
  color: #fff !important;
  background: linear-gradient(180deg, rgba(73, 13, 34, .70), rgba(18, 9, 14, .78)) !important;
  border-color: rgba(255, 77, 122, .72) !important;
  box-shadow: 0 0 24px rgba(255, 77, 122, .25), inset 0 1px 0 rgba(255, 255, 255, .12), inset 0 -1px 12px rgba(255, 0, 80, .12) !important;
}

.dice-roll-button {
  position: relative !important;
  height: 86px !important;
  margin-top: 18px !important;
  border-radius: 999px !important;
  color: #fff !important;
  background: linear-gradient(180deg, rgba(130, 20, 55, .95), rgba(55, 5, 22, .95)) !important;
  border: 1px solid rgba(255, 95, 140, .55) !important;
  box-shadow: 0 22px 54px rgba(0, 0, 0, .62), 0 0 38px rgba(255, 77, 122, .24), inset 0 2px 1px rgba(255, 169, 194, .26), inset 0 -18px 30px rgba(15, 0, 7, .42) !important;
  font-size: 34px !important;
  font-weight: 950 !important;
  letter-spacing: -.045em !important;
  text-shadow: 0 2px 18px rgba(0, 0, 0, .58) !important;
  overflow: hidden !important;
}

.dice-roll-button::before {
  content: '🎲' !important;
  margin-right: 16px !important;
  font-size: 28px !important;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, .24)) !important;
}

.dice-roll-button::after {
  content: '' !important;
  position: absolute !important;
  inset: 1px 12px auto !important;
  height: 34px !important;
  border-radius: 999px !important;
  background: linear-gradient(180deg, rgba(255, 119, 160, .33), rgba(255, 255, 255, 0)) !important;
  pointer-events: none !important;
}

.dice-roll-button:active {
  transform: scale(.982) !important;
}

.dice-stats {
  position: relative !important;
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 0 !important;
  margin-top: 20px !important;
  padding: 17px 0 15px !important;
  border-radius: 28px !important;
  background: linear-gradient(180deg, rgba(16, 10, 13, .78), rgba(4, 3, 4, .78)) !important;
  border: 1px solid rgba(255, 75, 120, .22) !important;
  box-shadow: 0 18px 44px rgba(0, 0, 0, .42), inset 0 1px 1px rgba(255, 255, 255, .08), inset 0 -1px 12px rgba(255, 0, 80, .06) !important;
  overflow: hidden !important;
}

.dice-stat {
  position: relative !important;
  padding: 0 8px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.dice-stat + .dice-stat::after {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  top: 8px !important;
  bottom: 8px !important;
  width: 1px !important;
  background: linear-gradient(180deg, transparent, rgba(255, 95, 140, .28), transparent) !important;
}

.dice-stat::before {
  display: block !important;
  margin: 0 auto 7px !important;
  color: rgba(255, 255, 255, .78) !important;
  font-size: 19px !important;
  line-height: 1 !important;
  filter: drop-shadow(0 0 10px rgba(255, 77, 122, .18)) !important;
}

.dice-stat:nth-child(1)::before { content: '◉' !important; }
.dice-stat:nth-child(2)::before { content: '◇' !important; }
.dice-stat:nth-child(3)::before { content: '▣' !important; }

.dice-stat small {
  font-size: 11px !important;
  letter-spacing: .14em !important;
}

.dice-stat b {
  margin-top: 6px !important;
  color: #fff !important;
  font-size: 18px !important;
  font-weight: 900 !important;
  letter-spacing: -.025em !important;
}

.dice-bet-editor.active .dice-bet-box,
.dice-bet-input:focus {
  border-color: rgba(255, 77, 122, .68) !important;
  box-shadow: 0 0 36px rgba(255, 77, 122, .24), 0 20px 60px rgba(0, 0, 0, .55), inset 0 1px 1px rgba(255, 255, 255, .08), inset 0 -1px 12px rgba(255, 0, 80, .10) !important;
}

@media (max-width: 420px) {
  .dice-view {
    padding-left: 24px !important;
    padding-right: 24px !important;
  }

  .dice-view .dice-range-card {
    left: 24px !important;
    right: 24px !important;
    height: 174px !important;
    padding: 28px 18px 22px !important;
    border-radius: 32px !important;
  }

  .dice-view .dice-result-card {
    left: 24px !important;
    right: 24px !important;
    top: calc(env(safe-area-inset-top) + 324px) !important;
  }

  .dice-panel {
    padding: 20px 18px 22px !important;
  }

  .dice-field {
    min-height: 104px !important;
    border-radius: 22px !important;
    padding: 16px 10px 13px !important;
  }

  .dice-field small {
    font-size: 10px !important;
    letter-spacing: .06em !important;
  }

  .dice-field b {
    margin-top: 17px !important;
    font-size: 26px !important;
  }

  .dice-bet button {
    height: 54px !important;
  }

  .dice-roll-button {
    height: 78px !important;
    font-size: 28px !important;
  }
}
`;

const DICE_RESULT_CARD = `<div class="dice-result-card" data-dice-result-card><div class="dice-result-head"><span class="dice-result-title"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M7 12h10"/><path d="M9 17h6"/></svg><span>Results</span></span><div class="dice-result-head-actions"><b class="dice-result-total" data-dice-result-total>0</b><button class="dice-result-toggle" type="button" data-dice-result-toggle aria-label="Toggle results" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg></button></div></div><div class="dice-result-list" data-dice-result-list><div class="dice-result-empty">No results yet</div></div></div>`;

const DICE_RESULT_SCRIPT = `
(function(){
  var root = document.getElementById('dice');
  if (!root || root.dataset.resultHistoryReady) return;
  root.dataset.resultHistoryReady = '1';

  var box = root.querySelector('[data-dice-result-card]');
  var toggle = root.querySelector('[data-dice-result-toggle]');
  var list = root.querySelector('[data-dice-result-list]');
  var total = root.querySelector('[data-dice-result-total]');
  var button = root.querySelector('[data-dice-play]');
  var roll = root.querySelector('[data-dice-roll]');
  var win = root.querySelector('[data-dice-win]');
  var amount = root.querySelector('[data-dice-current]');
  var rows = [];

  function value(el) {
    return el ? String(el.textContent || '').trim() : '';
  }

  function render() {
    if (!list) return;
    list.innerHTML = '';

    if (!rows.length) {
      var empty = document.createElement('div');
      empty.className = 'dice-result-empty';
      empty.textContent = 'No results yet';
      list.appendChild(empty);
      if (total) total.textContent = '0';
      return;
    }

    if (total) total.textContent = String(rows.length);

    rows.forEach(function(item) {
      var row = document.createElement('div');
      row.className = 'dice-result-row' + (item.positive ? ' is-positive' : '');

      var name = document.createElement('span');
      name.className = 'dice-result-name';
      name.textContent = item.label;

      var valueNode = document.createElement('b');
      valueNode.className = 'dice-result-value';
      valueNode.textContent = item.result;

      var rollNode = document.createElement('span');
      rollNode.className = 'dice-result-roll';
      rollNode.textContent = item.roll;

      row.appendChild(name);
      row.appendChild(valueNode);
      row.appendChild(rollNode);
      list.appendChild(row);
    });
  }

  function capture() {
    var resultValue = value(win);
    var rollValue = value(roll);
    var amountValue = value(amount);
    var numericResult = Number(resultValue.replace(/[^0-9.-]/g, '')) || 0;

    rows.unshift({
      label: 'You',
      result: numericResult > 0 ? '+' + resultValue : resultValue,
      roll: rollValue ? 'Roll ' + rollValue : '',
      positive: numericResult > 0,
      amount: amountValue,
    });

    rows = rows.slice(0, 50);
    render();
  }

  if (toggle && box) {
    toggle.onclick = function() {
      var open = !box.classList.contains('open');
      box.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
  }

  if (button) {
    button.addEventListener('click', function() {
      setTimeout(capture, 520);
    });
  }
})();
`;

export const DICE_SECTION = RAW_DICE_SECTION
  .replace('</style>', DICE_RANGE_CARD_STYLES + DICE_LUXURY_CASINO_STYLES + '</style>')
  .replace('<div class="dice-status" data-dice-status>', DICE_RESULT_CARD + '<div class="dice-status" data-dice-status>')
  .replace('</script></section>', DICE_RESULT_SCRIPT + '</script></section>')
  .replace('data-dice-bet-input-open>1</button>', 'data-dice-bet-input-open>1.00</button>')
  .replace('<b data-dice-current>1</b>', '<b data-dice-current>1.00</b>')
  .replace('min="1" inputmode="decimal" value="1"', 'min="0.01" step="0.01" inputmode="decimal" value="1.00"')
  .replace("function money(n){var x=Number(n)||0;return x.toFixed(4).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1')}", "function money(n){var x=Number(n)||0;return x.toFixed(2)}")
  .replace("function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;return Math.max(.0001,Number(s)||1)}", "function cleanBet(n){var s=String(n==null?'':n).replace(',','.').trim();if(!s)return 1;var v=Math.max(.01,Number(s)||1);return Math.round(v*100)/100}")
  .replace('setBet(Math.max(.0001,bet/2))', 'setBet(Math.max(.01,bet/2))');
