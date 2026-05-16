import app from './index';
import './vexa-league-admin-user-routes';
import './vexa-league-winners-routes';
import './vexa-league-week-routes';
import type { Env } from './types';

export type LeagueMissionTemplate = { id: string; title: string; description: string; type: string; defaultVex: number; difficulty: 'Easy' | 'Medium' | 'Hard' | 'Special'; icon: string };
export type LeaguePrizeTemplate = { id: string; title: string; description: string; type: string; icon: string };

export const VEXA_LEAGUE_MISSIONS: LeagueMissionTemplate[] = [
  { id:'daily-checkin', title:'Daily Check-in', description:'Open Vexa once today.', type:'daily', defaultVex:20, difficulty:'Easy', icon:'check' },
  { id:'open-rewards', title:'Open Rewards Hub', description:'Check today rewards page.', type:'daily', defaultVex:15, difficulty:'Easy', icon:'gift' },
  { id:'open-leaderboard', title:'Open Top Players', description:'View the Top 50 players.', type:'daily', defaultVex:15, difficulty:'Easy', icon:'rank' },
  { id:'claim-daily-prize', title:'Claim Daily Prize', description:'Claim today daily reward.', type:'reward', defaultVex:30, difficulty:'Easy', icon:'gift' },
  { id:'play-1-game', title:'Play 1 Game', description:'Play any Play Zone game once.', type:'game', defaultVex:25, difficulty:'Easy', icon:'game' },
  { id:'play-3-games', title:'Play 3 Games', description:'Complete any three Play Zone rounds.', type:'game', defaultVex:70, difficulty:'Medium', icon:'game' },
  { id:'play-10-games', title:'Play 10 Games', description:'Complete ten Play Zone rounds.', type:'game', defaultVex:180, difficulty:'Hard', icon:'game' },
  { id:'win-1-game', title:'Win 1 Game', description:'Win any Play Zone game.', type:'game', defaultVex:45, difficulty:'Medium', icon:'win' },
  { id:'win-3-games', title:'Win 3 Games', description:'Win three Play Zone games.', type:'game', defaultVex:130, difficulty:'Hard', icon:'win' },
  { id:'try-mines', title:'Try Mines', description:'Play Mines once today.', type:'game', defaultVex:35, difficulty:'Easy', icon:'mine' },
  { id:'try-plinko', title:'Try Plinko', description:'Play Plinko once today.', type:'game', defaultVex:35, difficulty:'Easy', icon:'ball' },
  { id:'try-crash', title:'Try Crash', description:'Play Crash once today.', type:'game', defaultVex:35, difficulty:'Easy', icon:'bolt' },
  { id:'try-wheel', title:'Try Wheel', description:'Spin the wheel once today.', type:'game', defaultVex:35, difficulty:'Easy', icon:'wheel' },
  { id:'try-dice', title:'Try Dice', description:'Roll Dice once today.', type:'game', defaultVex:30, difficulty:'Easy', icon:'dice' },
  { id:'try-limbo', title:'Try Limbo', description:'Play Limbo once today.', type:'game', defaultVex:30, difficulty:'Easy', icon:'bolt' },
  { id:'try-tower', title:'Try Tower', description:'Play Tower once today.', type:'game', defaultVex:40, difficulty:'Easy', icon:'tower' },
  { id:'try-hilo', title:'Try Hi-Lo', description:'Play Hi-Lo once today.', type:'game', defaultVex:35, difficulty:'Easy', icon:'cards' },
  { id:'try-coinflip', title:'Try Coin Flip', description:'Flip Coin once today.', type:'game', defaultVex:30, difficulty:'Easy', icon:'coin' },
  { id:'use-tts', title:'Use Text To Speech', description:'Generate one voice with Vexa.', type:'ai', defaultVex:45, difficulty:'Easy', icon:'audio' },
  { id:'use-ai-chat', title:'Use AI Chat', description:'Send one message to Vexa AI.', type:'ai', defaultVex:40, difficulty:'Easy', icon:'ai' },
  { id:'open-market', title:'Open Market', description:'View the NFT market.', type:'market', defaultVex:20, difficulty:'Easy', icon:'market' },
  { id:'view-transactions', title:'View Transactions', description:'Open your transaction history.', type:'wallet', defaultVex:20, difficulty:'Easy', icon:'list' },
  { id:'deposit-ton', title:'Deposit TON', description:'Charge your TON balance.', type:'wallet', defaultVex:120, difficulty:'Special', icon:'wallet' },
  { id:'invite-friend', title:'Invite a Friend', description:'Invite one friend to Vexa.', type:'social', defaultVex:90, difficulty:'Medium', icon:'user' },
  { id:'keep-streak', title:'Keep Streak Alive', description:'Return to Vexa for your daily streak.', type:'daily', defaultVex:25, difficulty:'Easy', icon:'fire' },
  { id:'reach-level-5', title:'Reach Level 5', description:'Level up your Vexa profile to level 5.', type:'level', defaultVex:160, difficulty:'Hard', icon:'level' },
  { id:'reach-level-10', title:'Reach Level 10', description:'Level up your Vexa profile to level 10.', type:'level', defaultVex:300, difficulty:'Hard', icon:'level' },
  { id:'daily-risk', title:'Daily Risk', description:'Play any risk game with TON balance.', type:'game', defaultVex:85, difficulty:'Medium', icon:'bolt' },
  { id:'weekly-grinder', title:'Weekly Grinder', description:'Complete 25 total rounds this week.', type:'weekly', defaultVex:420, difficulty:'Hard', icon:'crown' },
  { id:'top-chaser', title:'Top Chaser', description:'Enter the Top 50 list this week.', type:'weekly', defaultVex:500, difficulty:'Special', icon:'rank' },
];

export const VEXA_LEAGUE_PRIZES: LeaguePrizeTemplate[] = [
  { id:'ton-mini-1', title:'0.5 TON Bonus', description:'Small TON reward for weekly winners.', type:'ton', icon:'ton' },
  { id:'ton-mini-2', title:'1 TON Bonus', description:'TON reward for active weekly winners.', type:'ton', icon:'ton' },
  { id:'ton-pro-1', title:'2 TON Bonus', description:'Premium TON weekly reward.', type:'ton', icon:'ton' },
  { id:'ton-pro-2', title:'5 TON Bonus', description:'High tier TON prize.', type:'ton', icon:'ton' },
  { id:'nft-basic', title:'Basic NFT Drop', description:'A simple Vexa NFT reward.', type:'nft', icon:'nft' },
  { id:'nft-rare', title:'Rare NFT Drop', description:'Rare NFT for top competitors.', type:'nft', icon:'nft' },
  { id:'nft-legend', title:'Legend NFT Drop', description:'Legendary NFT reward.', type:'nft', icon:'crown' },
  { id:'role-vip', title:'VIP Role', description:'Temporary VIP status inside Vexa.', type:'role', icon:'star' },
  { id:'fee-discount', title:'Fee Discount', description:'Reduced fees for a limited time.', type:'utility', icon:'bolt' },
  { id:'bonus-vex', title:'Bonus Vex Pack', description:'Extra Vex points for next week.', type:'vex', icon:'rank' },
  { id:'mystery-box', title:'Mystery Box', description:'Mystery weekly prize.', type:'mystery', icon:'gift' },
  { id:'founder-badge', title:'Founder Badge', description:'Special badge for early winners.', type:'badge', icon:'badge' },
  { id:'creator-pass', title:'Creator Pass', description:'Future creator feature pass.', type:'utility', icon:'ai' },
  { id:'market-credit', title:'Market Credit', description:'Credit for future NFT market.', type:'market', icon:'market' },
  { id:'group-ai-credit', title:'Group AI Credit', description:'Bonus usage for group AI.', type:'ai', icon:'ai' },
  { id:'tts-pack', title:'TTS Pack', description:'Extra text to speech quota.', type:'ai', icon:'audio' },
  { id:'game-pass', title:'Game Pass', description:'Special game access reward.', type:'game', icon:'game' },
  { id:'daily-boost', title:'Daily Boost', description:'Boost daily mission rewards.', type:'boost', icon:'fire' },
  { id:'rank-boost', title:'Rank Boost', description:'Temporary rank XP boost.', type:'boost', icon:'level' },
  { id:'custom-prize', title:'Custom Prize', description:'Admin-defined weekly reward.', type:'custom', icon:'gift' },
];
