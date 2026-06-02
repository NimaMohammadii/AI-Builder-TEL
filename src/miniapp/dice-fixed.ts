import { DICE_SECTION as RAW_DICE_SECTION } from './dice';

const VISUAL_SPACING_STYLES = `
.dice-view .dice-wrap {
  justify-content: center !important;
  gap: 10px !important;
  transform: translateY(12px) !important;
}

.dice-view .dice-range-card {
  width: 100% !important;
  max-width: 500px !important;
  align-self: center !important;
  margin: 0 auto !important;
  padding: 18px 10px 12px !important;
  border-radius: 28px !important;
  background: rgba(255, 255, 255, .032) !important;
  border: 1px solid rgba(255, 255, 255, .12) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10) !important;
  transform: none !important;
  backdrop-filter: blur(14px) saturate(1.18) !important;
  -webkit-backdrop-filter: blur(14px) saturate(1.18) !important;
}

.dice-view .dice-status {
  margin: 0 !important;
}

.dice-view .dice-panel {
  margin-top: -2px !important;
  background: rgba(255, 255, 255, .032) !important;
}

@media (max-width: 420px) {
  .dice-view .dice-wrap {
    gap: 10px !important;
    transform: translateY(10px) !important;
  }

  .dice-view .dice-range-card {
    margin: 0 auto !important;
    padding: 16px 8px 10px !important;
    transform: none !important;
  }
}
`;

export const DICE_SECTION = RAW_DICE_SECTION.replace('</style>', VISUAL_SPACING_STYLES + '</style>');
