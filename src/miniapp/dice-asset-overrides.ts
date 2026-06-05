export const DICE_ASSET_OVERRIDES = `
#dice.dice-view .dice-bet {
  background-size: 118% auto !important;
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, .40)) !important;
}

#dice.dice-view .dice-roll-button {
  background-size: 108% auto !important;
  background-position: center !important;
}

@media (max-width: 420px) {
  #dice.dice-view .dice-bet {
    background-size: 120% auto !important;
  }

  #dice.dice-view .dice-roll-button {
    background-size: 110% auto !important;
  }
}
`;
