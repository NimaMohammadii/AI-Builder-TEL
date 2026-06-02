import { DICE_SECTION as RAW_DICE_SECTION } from './dice';

const VISUAL_SPACING_STYLES = `
.dice-view .dice-wrap {
  width: min(520px, 100%) !important;
  min-height: auto !important;
  justify-content: center !important;
  gap: 8px !important;
  margin: 0 auto !important;
  padding: 10px 0 0 !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  transform: translateY(12px) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.dice-view .dice-range-card {
  width: calc(100% + 18px) !important;
  max-width: 540px !important;
  align-self: center !important;
  margin: 0 -9px -30px !important;
  padding: 18px 10px 42px !important;
  border-radius: 30px !important;
  background: rgba(255, 255, 255, .026) !important;
  border: 1px solid rgba(255, 255, 255, .12) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10) !important;
  transform: none !important;
  backdrop-filter: blur(14px) saturate(1.18) !important;
  -webkit-backdrop-filter: blur(14px) saturate(1.18) !important;
}

.dice-view .dice-slider-shell {
  margin-left: -6px !important;
  margin-right: -6px !important;
}

.dice-view .dice-slider-visual {
  background: rgba(0, 0, 0, .78) !important;
  border-color: rgba(255, 255, 255, .12) !important;
  backdrop-filter: blur(8px) saturate(1.12) !important;
  -webkit-backdrop-filter: blur(8px) saturate(1.12) !important;
}

.dice-view .dice-slider-thumb {
  background: rgba(255, 255, 255, .10) !important;
  backdrop-filter: blur(8px) saturate(1.25) !important;
  -webkit-backdrop-filter: blur(8px) saturate(1.25) !important;
}

.dice-view .dice-status {
  position: relative !important;
  z-index: 2 !important;
  margin: 0 0 8px !important;
  transform: translateY(-6px) !important;
}

.dice-view .dice-panel {
  margin-top: 0 !important;
  background: #050505 !important;
  border-color: rgba(255, 255, 255, .12) !important;
}

.dice-view .dice-field,
.dice-view .dice-stat {
  background: #030303 !important;
  border-color: rgba(255, 255, 255, .12) !important;
}

.dice-view .dice-bet button {
  background: #030303 !important;
  border-color: rgba(255, 255, 255, .14) !important;
}

.dice-view .dice-bet-main {
  background: #0a0a0a !important;
  border-color: rgba(255, 255, 255, .20) !important;
}

@media (max-width: 420px) {
  .dice-view .dice-wrap {
    width: min(360px, 100%) !important;
    gap: 8px !important;
    padding: 10px 0 0 !important;
    transform: translateY(10px) !important;
  }

  .dice-view .dice-range-card {
    width: calc(100% + 14px) !important;
    margin: 0 -7px -30px !important;
    padding: 16px 8px 40px !important;
    transform: none !important;
  }

  .dice-view .dice-slider-shell {
    margin-left: -5px !important;
    margin-right: -5px !important;
  }
}
`;

export const DICE_SECTION = RAW_DICE_SECTION.replace('</style>', VISUAL_SPACING_STYLES + '</style>');
