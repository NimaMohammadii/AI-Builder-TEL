export const SLOT_SECTION = `
<section id="slot" class="view slot-view" style="overflow-x:hidden;max-width:100vw">
  <style>
    #slot .slot-rewards-toggle{position:absolute;opacity:0;pointer-events:none}
    #slot .slot-rewards-card{position:absolute;left:18px;top:18px;z-index:38;width:40px;height:40px;display:grid;place-items:center;border-radius:18px;border:0!important;background:rgba(255,255,255,.035);color:rgba(255,255,255,.92);box-shadow:none!important;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);cursor:pointer;user-select:none;transition:transform .18s ease,opacity .18s ease}
    #slot .slot-rewards-card svg{width:20px;height:20px;display:block;filter:drop-shadow(0 0 10px rgba(233,189,124,.18))}
    #slot .slot-rewards-card svg path{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    #slot .slot-rewards-card:active{transform:scale(.96)}
    #slot .slot-rewards-modal{position:fixed;inset:0;z-index:2147482900;display:grid;place-items:center;padding:22px;opacity:0;pointer-events:none;transition:opacity .28s ease;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
    #slot .slot-rewards-toggle:checked~.slot-rewards-modal{opacity:1;pointer-events:auto}
    #slot .slot-rewards-backdrop{position:absolute;inset:0;cursor:pointer;background:transparent!important;border:0!important;padding:0!important}
    #slot .slot-rewards-panel{position:relative;width:min(92vw,390px);border-radius:34px;border:0!important;background:transparent!important;color:#fff;padding:18px;box-shadow:0 28px 90px rgba(0,0,0,.52),0 0 44px rgba(111,14,45,.16);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);transform:translateY(18px) scale(.96);transition:transform .36s cubic-bezier(.2,.86,.18,1),opacity .26s ease;opacity:0;overflow:hidden}
    #slot .slot-rewards-toggle:checked~.slot-rewards-modal .slot-rewards-panel{transform:translateY(0) scale(1);opacity:1}
    #slot .slot-rewards-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
    #slot .slot-rewards-title{display:flex;align-items:center;gap:9px;font-size:18px;font-weight:1000;letter-spacing:.02em;text-transform:uppercase;text-shadow:0 2px 18px rgba(0,0,0,.70)}
    #slot .slot-rewards-close{width:34px;height:34px;border-radius:14px;display:grid;place-items:center;border:0!important;background:rgba(255,255,255,.04);color:rgba(255,255,255,.88);font-size:20px;font-weight:800;cursor:pointer;box-shadow:none!important}
    #slot .slot-rewards-list{display:grid;gap:9px}
    #slot .slot-reward-row{display:grid;grid-template-columns:68px 1fr auto;align-items:center;gap:10px;min-height:58px;padding:8px 10px;border-radius:22px;border:0!important;background:rgba(255,255,255,.018)!important;box-shadow:0 12px 30px rgba(0,0,0,.18);animation:slotRewardsRowIn .42s cubic-bezier(.2,.86,.2,1) both}
    #slot .slot-reward-row:nth-child(2){animation-delay:.04s}#slot .slot-reward-row:nth-child(3){animation-delay:.08s}#slot .slot-reward-row:nth-child(4){animation-delay:.12s}#slot .slot-reward-row:nth-child(5){animation-delay:.16s}
    #slot .slot-reward-icons{display:flex;align-items:center;justify-content:center;gap:2px;min-width:0;filter:drop-shadow(0 6px 10px rgba(0,0,0,.36))}
    #slot .slot-reward-icons img{width:22px;height:22px;object-fit:contain;display:block;flex:0 0 auto}
    #slot .slot-reward-icons span{font-size:18px;line-height:1;color:rgba(255,255,255,.38)}
    #slot .slot-reward-copy{min-width:0}.slot-reward-name{font-size:13px;font-weight:950;color:rgba(255,255,255,.96);letter-spacing:-.01em}.slot-reward-note{margin-top:2px;font-size:11px;font-weight:800;color:rgba(255,255,255,.48);letter-spacing:-.02em}
    #slot .slot-reward-mult{justify-self:end;padding:7px 10px;border-radius:999px;border:0!important;color:#f1c98b;font-size:13px;font-weight:1000;text-shadow:0 0 16px rgba(233,189,124,.22);background:rgba(255,255,255,.025)!important}
    @keyframes slotRewardsRowIn{0%{opacity:0;transform:translateY(10px) scale(.98);filter:blur(4px)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}
    #slot .slot-bet-step,#slot .slot-bet-quick{display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;text-align:center!important;line-height:1!important}
  </style>
  <input id="slotRewardsToggle" class="slot-rewards-toggle" type="checkbox" aria-hidden="true"/>
  <label class="slot-rewards-card" for="slotRewardsToggle" aria-label="Rewards">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 20 9l-8 11L4 9l8-5.5Z"/><path d="M4 9h16"/><path d="m8.2 9 3.8 11 3.8-11"/><path d="M8.2 9 12 3.5 15.8 9"/></svg>
  </label>
  <div class="slot-rewards-modal" aria-hidden="true">
    <label class="slot-rewards-backdrop" for="slotRewardsToggle" aria-label="Close rewards"></label>
    <div class="slot-rewards-panel" role="dialog" aria-label="Slot rewards">
      <div class="slot-rewards-head">
        <div class="slot-rewards-title"><span>Rewards</span></div>
        <label class="slot-rewards-close" for="slotRewardsToggle" aria-label="Close">×</label>
      </div>
      <div class="slot-rewards-list">
        <div class="slot-reward-row"><div class="slot-reward-icons" data-slot-reward-icons="cherry,cherry,cherry"><span>•••</span></div><div class="slot-reward-copy"><div class="slot-reward-name">Three matching fruits</div><div class="slot-reward-note">Cherry, lemon, orange, grape or watermelon</div></div><div class="slot-reward-mult">5x</div></div>
        <div class="slot-reward-row"><div class="slot-reward-icons" data-slot-reward-icons="diamond,diamond,diamond"><span>•••</span></div><div class="slot-reward-copy"><div class="slot-reward-name">Three diamonds</div><div class="slot-reward-note">Premium hit</div></div><div class="slot-reward-mult">15x</div></div>
        <div class="slot-reward-row"><div class="slot-reward-icons" data-slot-reward-icons="gold,gold,gold"><span>•••</span></div><div class="slot-reward-copy"><div class="slot-reward-name">Three golden stars</div><div class="slot-reward-note">Rare gold line</div></div><div class="slot-reward-mult">30x</div></div>
        <div class="slot-reward-row"><div class="slot-reward-icons" data-slot-reward-icons="lucky7,lucky7,lucky7"><span>•••</span></div><div class="slot-reward-copy"><div class="slot-reward-name">Triple seven</div><div class="slot-reward-note">Jackpot chance: 0.01%</div></div><div class="slot-reward-mult">200x</div></div>
        <div class="slot-reward-row"><div class="slot-reward-icons" data-slot-reward-icons="lemon,lemon,cherry"><span>•••</span></div><div class="slot-reward-copy"><div class="slot-reward-name">Two matching fruits</div><div class="slot-reward-note">Small return</div></div><div class="slot-reward-mult">0.8x</div></div>
      </div>
    </div>
  </div>

  <div class="slot-atmosphere" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="slot-cabinet">
  <div class="slot-machine" aria-label="Interactive section">
    <div class="slot-machine-shadow" aria-hidden="true"></div>
    <img id="slotFrameImage" class="slot-frame-image is-loaded" src="/assets/slot-v2/slot-machine-frame.png?v=2" data-slot-generated="true" alt="" aria-hidden="true" decoding="async"/>
    <div class="slot-jackpot-title" aria-hidden="true">JACKPOT</div>

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

  <div class="slot-simple-controls" aria-label="Slot controls">
    <div class="slot-simple-bet-row">
      <button id="slotBetMinus" class="slot-asset-button slot-asset-step slot-asset-minus" type="button" aria-label="Decrease bet">
        <img src="/assets/slot-v2/slot-minus.png?v=2" alt="" aria-hidden="true"/>
        <span>−</span>
      </button>
      <label class="slot-asset-input" for="slotAmount">
        <img src="/assets/slot-v2/slot-input.png?v=2" alt="" aria-hidden="true"/>
        <input id="slotAmount" type="number" min="1" max="999" step="1" value="1" inputmode="numeric" aria-label="Bet amount in TON"/>
        <small>TON</small>
      </label>
      <button id="slotBetPlus" class="slot-asset-button slot-asset-step slot-asset-plus" type="button" aria-label="Increase bet">
        <img src="/assets/slot-v2/slot-plus.png?v=2" alt="" aria-hidden="true"/>
        <span>+</span>
      </button>
    </div>
    <button id="slotSpinButton" class="slot-asset-button slot-asset-spin" type="button" aria-label="Spin 1 TON">
      <img src="/assets/slot-v2/slot-spin.png?v=2" alt="" aria-hidden="true"/>
      <strong class="slot-spin-label">SPIN</strong>
      <span class="slot-spin-cost">1 TON</span>
    </button>
  </div>

  </div>

  <div class="slot-live open" id="slotLive">
    <div class="slot-live-head">
      <span class="slot-live-title">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M3.4 18.4c.6-3 2.3-4.6 4.8-4.6s4.2 1.6 4.8 4.6"/><path d="M16.3 10.2a2.6 2.6 0 1 0 0-5.2"/><path d="M15.4 13.6c2.4.2 3.9 1.7 4.4 4.3"/></svg>
        <span>Live Bets</span>
      </span>
      <div class="slot-live-head-actions">
        <button id="slotLiveToggle" class="slot-live-toggle" type="button" aria-label="Toggle live slot results" aria-expanded="true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>
        </button>
      </div>
    </div>
    <div class="slot-live-list" id="slotLiveList"><div class="slot-live-empty">Loading players</div></div>
  </div>
</section>
`;
