export const CHICKEN_CROSS_SECTION = `
<section id="hilo" class="view chicken-cross-view" aria-label="Chicken Cross">
  <div class="cc-world" data-cc-world>
    <canvas data-cc-canvas aria-label="Real-time 3D Chicken Cross game"></canvas>
    <div class="cc-vignette"></div>
    <div class="cc-render-loading" data-cc-loading>Loading 3D world</div>
    <div class="cc-hud">
      <div class="cc-multi"><span data-cc-multiplier>1.00x</span><small data-cc-next>Next 1.01x</small></div>
      <div class="cc-step-pill" data-cc-step>0 / 24</div>
    </div>
    <div class="cc-message" data-cc-message>Choose a risk and start</div>
    <div class="cc-progress" data-cc-progress aria-hidden="true"></div>
  </div>
  <div class="cc-controls">
    <div class="cc-controls-inner">
      <div class="cc-top-controls">
        <div>
          <div class="cc-label"><span>Difficulty</span><span data-cc-risk>4% risk / lane</span></div>
          <div class="cc-difficulty" data-cc-difficulty>
            <button type="button" class="active" data-cc-mode="easy">Easy</button>
            <button type="button" data-cc-mode="medium">Medium</button>
            <button type="button" data-cc-mode="hard">Hard</button>
            <button type="button" data-cc-mode="hardcore">Extreme</button>
          </div>
        </div>
        <div>
          <div class="cc-label"><span>Bet amount</span><span>TON</span></div>
          <div class="cc-bet">
            <button type="button" data-cc-half>1/2</button>
            <input data-cc-amount inputmode="decimal" pattern="[0-9.]*" value="0.1" aria-label="Bet amount in TON" />
            <button type="button" data-cc-double>2x</button>
          </div>
        </div>
      </div>
      <div class="cc-actions" data-cc-actions>
        <button type="button" class="cc-primary" data-cc-primary>Start crossing</button>
        <button type="button" class="cc-cashout" data-cc-cashout disabled>Cash out</button>
      </div>
      <div class="cc-proof" data-cc-proof><b>Provably fair</b> · seed commitment appears when the round starts</div>
    </div>
  </div>
</section>
`;
