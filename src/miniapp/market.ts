export const MARKET_SECTION = `
<section id="market" class="view market-view">
  <div class="market-hero card">
    <div class="market-hero-copy">
      <span class="market-kicker">Vexa Market</span>
      <h2>Trade internal NFTs</h2>
      <p>Collect Vexa-designed digital items, manage your inventory, and list assets for resale when marketplace logic is enabled.</p>
    </div>
    <div class="market-orb" aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none">
        <rect x="20" y="20" width="80" height="80" rx="26" stroke="currentColor" stroke-opacity=".55" stroke-width="2"/>
        <path d="M60 32l27 15v30L60 92 33 77V47l27-15z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M60 32v31m27-16L60 63 33 47m27 16v29" stroke="currentColor" stroke-opacity=".5" stroke-width="1.6"/>
      </svg>
    </div>
  </div>

  <div class="market-grid">
    <article class="market-card card">
      <div class="market-card-head">
        <div>
          <span class="market-label">Featured drop</span>
          <h3>Genesis Vexa Pass</h3>
        </div>
        <span class="market-chip">Soon</span>
      </div>
      <div class="market-art genesis-art"><span>VX</span></div>
      <p class="market-text">Admin-created NFTs will appear here first. Price, supply, and utility will be connected in the next step.</p>
      <button class="market-button" type="button" disabled>Buy soon</button>
    </article>

    <article class="market-card card">
      <div class="market-card-head">
        <div>
          <span class="market-label">Marketplace</span>
          <h3>Listed NFTs</h3>
        </div>
        <span class="market-chip">0 listed</span>
      </div>
      <div class="market-empty">
        <strong>No listings yet</strong>
        <span>When buying and selling is connected, live user listings will show here.</span>
      </div>
    </article>

    <article class="market-card card">
      <div class="market-card-head">
        <div>
          <span class="market-label">Inventory</span>
          <h3>My NFTs</h3>
        </div>
        <span class="market-chip">Wallet</span>
      </div>
      <div class="market-empty">
        <strong>Your collection is empty</strong>
        <span>Purchased NFTs will appear in this section with options to list them for sale.</span>
      </div>
    </article>

    <article class="market-card card">
      <div class="market-card-head">
        <div>
          <span class="market-label">Seller tools</span>
          <h3>List for sale</h3>
        </div>
        <span class="market-chip">Fee ready</span>
      </div>
      <div class="market-seller-box">
        <div><b>Market fee</b><span>Will be configured from admin panel later.</span></div>
        <div><b>Resale</b><span>Users will be able to set price and cancel listing.</span></div>
      </div>
      <button class="market-button ghost" type="button" disabled>Listing logic soon</button>
    </article>
  </div>
</section>
`;
