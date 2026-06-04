export const SLOT_SECTION = `
<section id="slot" class="view slot-view">
  <div class="slot-machine" aria-label="Slot machine game">
    <img id="slotFrameImage" class="slot-frame-image" alt="" aria-hidden="true"/>

    <div class="slot-window" aria-hidden="true">
      <div class="slot-reel" data-slot-reel="0">
        <div class="slot-reel-strip"></div>
      </div>
      <div class="slot-reel" data-slot-reel="1">
        <div class="slot-reel-strip"></div>
      </div>
      <div class="slot-reel" data-slot-reel="2">
        <div class="slot-reel-strip"></div>
      </div>
    </div>
  </div>

  <div class="slot-control-panel">
    <div class="slot-control-row">
      <div class="slot-controls">
        <div class="slot-field slot-point-field">
          <span class="slot-label">Point Amount</span>
          <div class="slot-point-amount">
            <input id="slotAmount" inputmode="decimal" pattern="[0-9.]*" value="0.01"/>
            <div class="slot-quick-actions">
              <button type="button" data-slot-action="amount-half">1/2</button>
              <button type="button" data-slot-action="amount-double">2x</button>
            </div>
          </div>
        </div>
      </div>

      <button id="slotSpinButton" class="slot-spin-button" type="button">
        Spin
      </button>
    </div>
  </div>
</section>
`;