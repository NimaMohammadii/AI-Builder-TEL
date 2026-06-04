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

  <div class="slot-control-panel" style="margin-top:-190px;background:transparent!important;border:0!important;box-shadow:none!important">
    <div class="slot-controls slot-image-controls" style="width:100%;gap:8px">
      <button id="slotSpinButton" class="slot-image-control slot-spin-button" type="button" aria-label="Spin" style="height:clamp(112px,27vw,132px);background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible">
        <img id="slotSpinButtonImage" class="slot-control-image" alt="" aria-hidden="true" style="inset:-12px;width:calc(100% + 24px);height:calc(100% + 24px);border:0!important;box-shadow:none!important;background:transparent!important"/>
        <span class="slot-control-fallback">Spin</span>
      </button>
      <label class="slot-image-control slot-input-control" aria-label="Point Amount" style="height:clamp(112px,27vw,132px);background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible">
        <img id="slotInputButtonImage" class="slot-control-image" alt="" aria-hidden="true" style="inset:-12px;width:calc(100% + 24px);height:calc(100% + 24px);border:0!important;box-shadow:none!important;background:transparent!important"/>
        <input id="slotAmount" inputmode="decimal" pattern="[0-9.]*" value="0.01" style="font-size:20px"/>
      </label>
    </div>
  </div>
</section>
`;
