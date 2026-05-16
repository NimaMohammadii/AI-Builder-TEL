export type LeagueMissionTemplate = { id: string; title: string; description: string; type: string; defaultVex: number; difficulty: 'Easy' | 'Medium' | 'Hard' | 'Special'; icon: string };
export type LeaguePrizeTemplate = { id: string; title: string; description: string; type: string; icon: string };

export const VEXA_LEAGUE_MISSIONS: LeagueMissionTemplate[] = [
  { id:'daily-checkin', title:'Daily Check-in', description:'Open Vexa once today.', type:'daily', defaultVex:20, difficulty:'Easy', icon:'check' },
  { id:'open-rewards', title:'Open Rewards Hub', description:'Check today rewards page.', type:'daily', defaultVex:15, difficulty:'Easy', icon:'gift' },
  { id:'open-leaderboard', title:'Open Top Players', description:'View the Top 50 players.', type:'daily', defaultVex:15, difficulty:'Easy', icon:'rank' },
  { id:'play-3-games', title:'Play 3 Games', description:'Complete any three Play Zone rounds.', type:'game', defaultVex:70, difficulty:'Medium', icon:'game' },
  { id:'use-ai-chat', title:'Use AI Chat', description:'Send one message to Vexa AI.', type:'ai', defaultVex:40, difficulty:'Easy', icon:'ai' },
  { id:'invite-friend', title:'Invite a Friend', description:'Invite one friend to Vexa.', type:'social', defaultVex:90, difficulty:'Medium', icon:'user' },
  { id:'keep-streak', title:'Keep Streak Alive', description:'Return to Vexa for your daily streak.', type:'daily', defaultVex:25, difficulty:'Easy', icon:'fire' },
  { id:'deposit-ton', title:'Deposit TON', description:'Charge your TON balance.', type:'wallet', defaultVex:120, difficulty:'Special', icon:'wallet' }
];

export const VEXA_LEAGUE_PRIZES: LeaguePrizeTemplate[] = [
  { id:'ton-mini-1', title:'0.5 TON Bonus', description:'Small TON reward for weekly winners.', type:'ton', icon:'ton' },
  { id:'ton-mini-2', title:'1 TON Bonus', description:'TON reward for active weekly winners.', type:'ton', icon:'ton' },
  { id:'rare-badge', title:'Rare Badge', description:'Special profile badge.', type:'badge', icon:'badge' },
  { id:'mystery-box', title:'Mystery Box', description:'Hidden random reward.', type:'mystery', icon:'box' }
];
