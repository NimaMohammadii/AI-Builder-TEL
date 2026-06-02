import { DICE_SECTION as RAW_DICE_SECTION } from './dice';

const VISUAL_SPACING_STYLES = `
.dice-view .dice-wrap {
  width: min(500px, 100%) !important;
  min-height: auto !important;
  aspect-ratio: 1 / 1 !important;
  justify-content: center !important;
  gap: 10px !important;
  margin: 0 auto !important;
  padding: 18px !important;
  border-radius: 30px !important;
  background: rgba(255, 255, 255, .026) !important;
  border: 1px solid rgba(255, 255, 255, .12) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10) !important;
  transform: translateY(12px) !important;
  backdrop-filter: blur(14px) saturate(1.18) !important;
  -webkit-backdrop-filter: blur(14px) saturate(1.18) !important;
}

.dice-view .dice-range-card {
  width: 100% !important;
  max-width: 100% !important;
  align-self: center !important;
  margin: 0 auto !important;
  padding: 14px 8px 8px !important;
  border-radius: 26px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  transform: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.dice-view .dice-slider-visual {
  background: rgba(0, 0, 0, .72) !important;
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
  margin: 0 !important;
}

.dice-view .dice-panel {
  margin-top: 0 !important;
  background: rgba(255, 255, 255, .032) !important;
}

@media (max-width: 420px) {
  .dice-view .dice-wrap {
    width: min(360px, 100%) !important;
    gap: 9px !important;
    padding: 14px !important;
    transform: translateY(10px) !important;
  }

  .dice-view .dice-range-card {
    margin: 0 auto !important;
    padding: 12px 6px 6px !important;
    transform: none !important;
  }
}
`;

export const DICE_SECTION = RAW_DICE_SECTION.replace('</style>', VISUAL_SPACING_STYLES + '</style>');
