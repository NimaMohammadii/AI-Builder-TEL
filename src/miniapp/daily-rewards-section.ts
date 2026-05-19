export const DAILY_REWARDS_SECTION = `
<button id="dailyRewardsEntry" class="home-daily-rewards-entry" type="button" data-action="open-daily-rewards">
  <span class="home-daily-rewards-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 12v8H4v-8"/><path d="M2.5 7h19v5h-19z"/><path d="M12 7v13"/><path d="M12 7H8.4A2.2 2.2 0 1 1 12 4.8V7z"/><path d="M12 7h3.6A2.2 2.2 0 1 0 12 4.8V7z"/></svg></span>
  <span class="home-daily-rewards-main"><span>Daily Rewards</span><strong>Daily Prize</strong><small>Complete 6 missions every day for XP</small></span>
  <span class="home-daily-rewards-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></span>
</button>
<div id="dailyRewardsPage" class="daily-rewards-page" aria-hidden="true">
  <section class="daily-rewards-hero">
    <div class="daily-rewards-hero-text">
      <p class="daily-rewards-kicker">Daily Rewards</p>
      <h2 class="daily-rewards-title">Daily Prize</h2>
      <p class="daily-rewards-sub">Complete daily missions, earn XP, level up, and climb the weekly Top Players board.</p>
    </div>
    <div class="daily-rewards-art"><img src="/app/api/daily-rewards-hero-image.png?v=1" alt="" onerror="this.style.display='none'"/></div>
  </section>
  <div id="dailyRewardsDays" class="daily-rewards-days" aria-label="Daily reward days"></div>
  <div class="daily-rewards-missions-title"><strong id="dailyRewardsMissionTitle">Today missions</strong><span id="dailyRewardsMissionCount">6 missions</span></div>
  <div id="dailyRewardsMissions" class="daily-rewards-missions"></div>
</div>
`;
