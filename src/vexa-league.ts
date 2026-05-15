import app from './index';
import type { Env } from './types';

export type LeagueMissionTemplate = { id: string; title: string; description: string; type: string; defaultVex: number; difficulty: 'Easy' | 'Medium' | 'Hard' | 'Special'; icon: string };
export type LeaguePrizeTemplate = { id: string; title: string; description: string; type: string; icon: string };

export const VEXA_LEAGUE_MISSIONS: LeagueMissionTemplate[] = [
  { id:'daily-checkin', title:'Daily Check-in', description:'Open Vexa once today.', type:'daily', defaultVex:20, difficulty:'Easy', icon:'check' },
  { id:'open-rewards', title:'Open Rewards Hub', description:'Check today rewards page.', type:'daily', defaultVex:15, difficulty:'Easy', icon:'gift' },
  { id:'open-leaderboard', title:'Open Vexa League', description:'View the weekly leaderboard.', type:'daily', defaultVex:15, difficulty:'Easy', icon:'rank' },
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
  { id:'try-dice', title:'Try Dice', description:'Play Dice once today.', type:'game', defaultVex:35, difficulty:'Easy', icon:'dice' },
  { id:'try-tower', title:'Try Tower', description:'Play Tower once today.', type:'game', defaultVex:40, difficulty:'Easy', icon:'tower' },
  { id:'use-ai-chat', title:'Use AI Chat', description:'Send one message to Vexa AI.', type:'ai', defaultVex:40, difficulty:'Easy', icon:'ai' },
  { id:'use-tts', title:'Generate Voice', description:'Convert text to speech once.', type:'ai', defaultVex:60, difficulty:'Medium', icon:'audio' },
  { id:'create-bot', title:'Create Telegram Bot', description:'Create or draft a bot with Vexa.', type:'ai-builder', defaultVex:160, difficulty:'Special', icon:'bot' },
  { id:'edit-bot', title:'Edit Your Bot', description:'Improve one existing bot with Vexa.', type:'ai-builder', defaultVex:100, difficulty:'Medium', icon:'bot' },
  { id:'publish-bot', title:'Publish Bot', description:'Publish a bot update.', type:'ai-builder', defaultVex:180, difficulty:'Special', icon:'rocket' },
  { id:'add-vexa-group', title:'Add Vexa to Group', description:'Add Vexa AI to a Telegram group.', type:'social', defaultVex:300, difficulty:'Special', icon:'group' },
  { id:'group-ai-message', title:'Use Group AI', description:'Make Vexa answer inside a group.', type:'social', defaultVex:90, difficulty:'Medium', icon:'chat' },
  { id:'invite-1-friend', title:'Invite 1 Friend', description:'Invite one new user to Vexa.', type:'invite', defaultVex:180, difficulty:'Special', icon:'invite' },
  { id:'invite-3-friends', title:'Invite 3 Friends', description:'Bring three new users to Vexa.', type:'invite', defaultVex:500, difficulty:'Special', icon:'invite' },
  { id:'share-vexa', title:'Share Vexa', description:'Share Vexa with a friend or group.', type:'social', defaultVex:70, difficulty:'Easy', icon:'share' },
  { id:'join-channel', title:'Join Vexa Channel', description:'Join the official Vexa channel.', type:'social', defaultVex:80, difficulty:'Easy', icon:'channel' },
  { id:'deposit-ton', title:'Deposit TON', description:'Make a TON deposit.', type:'finance', defaultVex:220, difficulty:'Special', icon:'ton' },
  { id:'withdraw-request', title:'Request Withdraw', description:'Create one withdraw request.', type:'finance', defaultVex:120, difficulty:'Medium', icon:'ton' },
  { id:'open-market', title:'Open Market', description:'Visit the market section.', type:'market', defaultVex:30, difficulty:'Easy', icon:'market' },
  { id:'view-nft', title:'View NFT Item', description:'Open an NFT or market item.', type:'market', defaultVex:35, difficulty:'Easy', icon:'nft' },
  { id:'generate-image', title:'Generate Image', description:'Create one image with Vexa.', type:'ai-image', defaultVex:120, difficulty:'Medium', icon:'image' },
  { id:'edit-image', title:'Edit Image', description:'Edit one image with Vexa.', type:'ai-image', defaultVex:140, difficulty:'Medium', icon:'image' },
  { id:'complete-profile', title:'Complete Profile', description:'Open your profile and check rank.', type:'profile', defaultVex:40, difficulty:'Easy', icon:'profile' },
  { id:'open-rank-page', title:'Open Rank Page', description:'View all ranks and your current rank.', type:'rank', defaultVex:30, difficulty:'Easy', icon:'rank' },
  { id:'level-up', title:'Level Up', description:'Gain enough XP to level up.', type:'level', defaultVex:250, difficulty:'Special', icon:'level' },
  { id:'earn-100-xp', title:'Earn 100 XP', description:'Earn at least 100 XP today.', type:'level', defaultVex:100, difficulty:'Medium', icon:'xp' },
  { id:'earn-500-xp', title:'Earn 500 XP', description:'Earn at least 500 XP today.', type:'level', defaultVex:350, difficulty:'Hard', icon:'xp' },
  { id:'keep-streak', title:'Keep Streak Alive', description:'Return today and keep your streak.', type:'streak', defaultVex:70, difficulty:'Easy', icon:'fire' },
  { id:'three-day-streak', title:'3 Day Streak', description:'Reach a three day activity streak.', type:'streak', defaultVex:220, difficulty:'Hard', icon:'fire' },
  { id:'seven-day-streak', title:'7 Day Streak', description:'Reach a seven day activity streak.', type:'streak', defaultVex:700, difficulty:'Special', icon:'fire' },
  { id:'mystery-task', title:'Mystery Task', description:'Complete the hidden mission of the day.', type:'special', defaultVex:300, difficulty:'Special', icon:'mystery' },
  { id:'admin-event-task', title:'Special Event Mission', description:'Admin-selected custom event mission.', type:'special', defaultVex:250, difficulty:'Special', icon:'star' },
  { id:'comment-feedback', title:'Send Feedback', description:'Send useful feedback about Vexa.', type:'community', defaultVex:90, difficulty:'Medium', icon:'message' },
  { id:'report-bug', title:'Report a Bug', description:'Report one valid issue or bug.', type:'community', defaultVex:140, difficulty:'Medium', icon:'bug' },
  { id:'vote-feature', title:'Vote Feature', description:'Vote for the next Vexa feature.', type:'community', defaultVex:60, difficulty:'Easy', icon:'vote' },
  { id:'weekly-10-missions', title:'Complete 10 Missions', description:'Complete ten league missions this week.', type:'weekly', defaultVex:400, difficulty:'Hard', icon:'mission' },
  { id:'weekly-25-missions', title:'Complete 25 Missions', description:'Complete twenty five missions this week.', type:'weekly', defaultVex:1000, difficulty:'Special', icon:'mission' },
  { id:'top-50-push', title:'Push Top 50', description:'Reach or defend a Top 50 league position.', type:'league', defaultVex:250, difficulty:'Hard', icon:'league' },
  { id:'top-10-push', title:'Push Top 10', description:'Reach or defend a Top 10 league position.', type:'league', defaultVex:700, difficulty:'Special', icon:'league' },
  { id:'daily-combo', title:'Daily Combo', description:'Complete check-in, one game and one AI action.', type:'combo', defaultVex:180, difficulty:'Medium', icon:'combo' }
];

export const VEXA_LEAGUE_PRIZES: LeaguePrizeTemplate[] = [
  { id:'ton-1', title:'1 TON', description:'Small TON reward.', type:'ton', icon:'ton' },
  { id:'ton-5', title:'5 TON', description:'Medium TON reward.', type:'ton', icon:'ton' },
  { id:'ton-10', title:'10 TON', description:'High TON reward.', type:'ton', icon:'ton' },
  { id:'ton-20', title:'20 TON', description:'Top weekly TON reward.', type:'ton', icon:'ton' },
  { id:'rare-badge', title:'Rare Badge', description:'Special profile badge.', type:'badge', icon:'badge' },
  { id:'legend-badge', title:'Legend Badge', description:'Premium weekly winner badge.', type:'badge', icon:'badge' },
  { id:'profile-frame', title:'Profile Frame', description:'Special profile frame.', type:'cosmetic', icon:'frame' },
  { id:'rank-glow', title:'Rank Glow', description:'Glow effect for rank profile.', type:'cosmetic', icon:'glow' },
  { id:'weekly-chest', title:'Weekly Chest', description:'Chest with bonus items.', type:'chest', icon:'chest' },
  { id:'premium-chest', title:'Premium Chest', description:'Higher value chest.', type:'chest', icon:'chest' },
  { id:'mystery-box', title:'Mystery Box', description:'Hidden random reward.', type:'mystery', icon:'box' },
  { id:'xp-boost-24h', title:'24h XP Boost', description:'Boost XP for one day.', type:'boost', icon:'xp' },
  { id:'xp-boost-7d', title:'7d XP Boost', description:'Boost XP for seven days.', type:'boost', icon:'xp' },
  { id:'vex-boost', title:'Vex Boost', description:'Extra Vex multiplier.', type:'boost', icon:'vex' },
  { id:'nft-chest', title:'NFT Chest', description:'NFT reward chest preview.', type:'nft', icon:'nft' },
  { id:'rare-nft', title:'Rare NFT', description:'Rare NFT reward placeholder.', type:'nft', icon:'nft' },
  { id:'special-title', title:'Special Title', description:'Custom profile title.', type:'title', icon:'title' },
  { id:'invite-bonus', title:'Invite Bonus', description:'Extra invite reward.', type:'invite', icon:'invite' },
  { id:'streak-shield', title:'Streak Shield', description:'Protect one missed day.', type:'streak', icon:'shield' },
  { id:'practice-reward', title:'Practice Reward', description:'Non-cash warm-up reward.', type:'practice', icon:'star' }
];

const SEED_NAMES = ['NexaWolf','AriaFlow','VexaKing','MoonPilot','BlackNova','SilverVex','CryptoRay','Axion','EliteLuna','OrionAI','ProMiner','ZaraTon','NeonBot','PlinkoStar','AIHunter','VexRunner','TowerFox','DiceWave','ExplorerX','RookieOne','NovaByte','TonWizard','LuckyKai','BotSmith','RankFox','AuraNode','MinesAce','CrashLord','WheelBee','PromptFox','VoiceRex','ImageZen','GroupHero','QuestPilot','LeagueCat','VexTiger','NftScout','FlowMaster','SparkTon','LunaQuest','BotCrafter','VexBlade','NovaMint','KaiRunner','EchoVex','PrizeBear','TonKnight','ZetaPlay','CloudVex','OmegaAI'];

export const ADMIN_VEXA_LEAGUE_PANEL_SCRIPT = `<script>
(function(){
  function esc(v){return String(v??'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s))}
  function q(s){return document.querySelector(s)}
  function el(tag,html){var n=document.createElement(tag);n.innerHTML=html;return n}
  function mount(){
    if(document.querySelector('[data-vexa-league-admin]'))return;
    var page=document.querySelector('.page')||document.body;
    var box=el('section','<section class="admin-section" data-vexa-league-admin><div class="row-title"><div><h2>Vexa League</h2><p class="small-text">Weekly Vex race, missions, prizes and seed users. Everything is controlled by admin.</p></div><button class="manage-btn" type="button" data-vl-refresh>Refresh</button></div><div class="mini-status" data-vl-status>Loading League...</div><div data-vl-root></div></section>');
    var first=page.querySelector('.admin-section');
    if(first&&first.parentNode)first.parentNode.insertBefore(box,first);else page.appendChild(box);
    box.querySelector('[data-vl-refresh]').onclick=load;
    load();
  }
  async function api(path,opt){var r=await fetch(path,Object.assign({credentials:'same-origin'},opt||{}, {headers:Object.assign({'content-type':'application/json'},(opt&&opt.headers)||{})}));var j=await r.json().catch(()=>({error:'Invalid response'}));if(!r.ok)throw new Error(j.error||'Request failed');return j}
  async function load(){
    var status=q('[data-vl-status]'),root=q('[data-vl-root]');if(status)status.textContent='Loading League...';
    try{var d=await api('/admin/api/vexa-league');render(d);if(status)status.textContent='League loaded';}catch(e){if(status)status.textContent=e.message||'Could not load League';if(root)root.innerHTML=''}
  }
  function render(d){
    var root=q('[data-vl-root]');if(!root)return;
    var w=d.currentWeek||{};
    root.innerHTML='<div class="section-block"><h3>Current Week</h3><label class="small-text">Title</label><input data-vl-title value="'+esc(w.title||'Vexa Weekly Race')+'"/><label class="small-text">Start</label><input data-vl-start type="datetime-local" value="'+esc(toLocal(w.startsAt))+'"/><label class="small-text">End</label><input data-vl-end type="datetime-local" value="'+esc(toLocal(w.endsAt))+'"/><div class="credit-tools"><button type="button" data-vl-toggle-league>'+(w.status==='active'?'League ON':'League OFF')+'</button><button type="button" data-vl-toggle-rewards>'+(w.rewardsEnabled?'Rewards ON':'Rewards OFF')+'</button><button type="button" data-vl-toggle-seeds>'+(w.seedUsersEnabled?'Seeds ON':'Seeds OFF')+'</button></div><label class="small-text">Winner Count</label><input data-vl-winners type="number" min="0" max="500" value="'+esc(w.winnerCount||50)+'"/><label class="small-text">Announcement</label><input data-vl-announcement value="'+esc(w.announcement||'Top players win weekly rewards.')+'"/><button class="save-credit" type="button" data-vl-save-week>Save Week</button></div><div class="section-block"><h3>Mission Library</h3><p class="small-text">Select missions for the active day and set custom Vex amount.</p><label class="small-text">Active Date</label><input data-vl-date type="date" value="'+today()+'"/><div data-vl-missions></div><button class="save-credit" type="button" data-vl-save-missions>Save Selected Missions</button></div><div class="section-block"><h3>Weekly Prizes</h3><p class="small-text">Choose prizes or keep rewards disabled for this week.</p><div data-vl-prizes></div><button class="save-credit" type="button" data-vl-save-prizes>Save Prizes</button></div><div class="section-block"><h3>Seed Users</h3><p class="small-text">Use 50 demo users so the table does not look empty. Seed users never receive real prizes.</p><button class="save-credit" type="button" data-vl-generate-seeds>Generate / Reset 50 Seed Users</button><div data-vl-seeds></div></div>';
    root.querySelector('[data-vl-toggle-league]').onclick=function(){w.status=w.status==='active'?'hidden':'active';render(Object.assign({},d,{currentWeek:w}))};
    root.querySelector('[data-vl-toggle-rewards]').onclick=function(){w.rewardsEnabled=!w.rewardsEnabled;render(Object.assign({},d,{currentWeek:w}))};
    root.querySelector('[data-vl-toggle-seeds]').onclick=function(){w.seedUsersEnabled=!w.seedUsersEnabled;render(Object.assign({},d,{currentWeek:w}))};
    root.querySelector('[data-vl-save-week]').onclick=saveWeek;
    root.querySelector('[data-vl-save-missions]').onclick=saveMissions;
    root.querySelector('[data-vl-save-prizes]').onclick=savePrizes;
    root.querySelector('[data-vl-generate-seeds]').onclick=generateSeeds;
    renderMissions(d);renderPrizes(d);renderSeeds(d);
  }
  function renderMissions(d){var wrap=q('[data-vl-missions]');if(!wrap)return;var selected={};(d.dailyMissions||[]).forEach(m=>selected[m.templateId]=m);wrap.innerHTML=(d.missionLibrary||[]).map(m=>'<label class="lock-row" style="display:grid!important;grid-template-columns:24px 1fr 82px!important;gap:8px!important;align-items:center!important"><input type="checkbox" data-vl-mission="'+esc(m.id)+'" '+(selected[m.id]?'checked':'')+'/><span class="lock-main"><strong>'+esc(m.title)+'</strong><p>'+esc(m.description)+' · '+esc(m.type)+' · '+esc(m.difficulty)+'</p></span><input type="number" min="0" max="99999" data-vl-mission-vex="'+esc(m.id)+'" value="'+esc((selected[m.id]&&selected[m.id].vexAmount)||m.defaultVex)+'"/></label>').join('')}
  function renderPrizes(d){var wrap=q('[data-vl-prizes]');if(!wrap)return;var saved={};(d.weeklyPrizes||[]).forEach(p=>saved[p.prizeTemplateId]=p);wrap.innerHTML=(d.prizeLibrary||[]).map((p,i)=>{var s=saved[p.id]||{};return '<div class="lock-row" style="display:grid!important;grid-template-columns:24px 1fr 58px 58px!important;gap:8px!important;align-items:center!important"><input type="checkbox" data-vl-prize="'+esc(p.id)+'" '+(s.enabled?'checked':'')+'/><span class="lock-main"><strong>'+esc(p.title)+'</strong><p>'+esc(p.description)+' · '+esc(p.type)+'</p></span><input type="number" min="1" data-vl-prize-from="'+esc(p.id)+'" value="'+esc(s.rankFrom||rankFrom(i))+'"/><input type="number" min="1" data-vl-prize-to="'+esc(p.id)+'" value="'+esc(s.rankTo||rankTo(i))+'"/></div>'}).join('')}
  function renderSeeds(d){var wrap=q('[data-vl-seeds]');if(!wrap)return;wrap.innerHTML=(d.seedUsers||[]).slice(0,12).map(u=>'<div class="mini-status">#'+esc(u.position)+' '+esc(u.name)+' @'+esc(u.username)+' · '+esc(u.vex)+' Vex · Lv '+esc(u.level)+' · '+esc(u.rankName)+' · '+esc(u.balanceTon)+' TON</div>').join('')+'<p class="small-text">Showing first 12 of '+esc((d.seedUsers||[]).length)+' seed users.</p>'}
  async function saveWeek(){var root=q('[data-vexa-league-admin]');var body={title:q('[data-vl-title]').value,startsAt:fromLocal(q('[data-vl-start]').value),endsAt:fromLocal(q('[data-vl-end]').value),status:q('[data-vl-toggle-league]').textContent.includes('ON')?'active':'hidden',rewardsEnabled:q('[data-vl-toggle-rewards]').textContent.includes('ON'),seedUsersEnabled:q('[data-vl-toggle-seeds]').textContent.includes('ON'),winnerCount:Number(q('[data-vl-winners]').value||50),announcement:q('[data-vl-announcement]').value};await api('/admin/api/vexa-league/week',{method:'POST',body:JSON.stringify(body)});load()}
  async function saveMissions(){var date=q('[data-vl-date]').value;var missions=[].slice.call(document.querySelectorAll('[data-vl-mission]')).filter(x=>x.checked).map(x=>({templateId:x.getAttribute('data-vl-mission'),vexAmount:Number((q('[data-vl-mission-vex="'+x.getAttribute('data-vl-mission')+'"]')||{}).value||0),enabled:true}));await api('/admin/api/vexa-league/daily-missions',{method:'POST',body:JSON.stringify({activeDate:date,missions:missions})});load()}
  async function savePrizes(){var prizes=[].slice.call(document.querySelectorAll('[data-vl-prize]')).map(x=>{var id=x.getAttribute('data-vl-prize');return {prizeTemplateId:id,enabled:x.checked,rankFrom:Number((q('[data-vl-prize-from="'+id+'"]')||{}).value||1),rankTo:Number((q('[data-vl-prize-to="'+id+'"]')||{}).value||1)}});await api('/admin/api/vexa-league/prizes',{method:'POST',body:JSON.stringify({prizes:prizes})});load()}
  async function generateSeeds(){await api('/admin/api/vexa-league/seed-users/generate',{method:'POST',body:'{}'});load()}
  function today(){return new Date().toISOString().slice(0,10)}
  function toLocal(v){if(!v)return '';var d=new Date(v);if(!Number.isFinite(d.getTime()))return '';d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)}
  function fromLocal(v){if(!v)return '';return new Date(v).toISOString()}
  function rankFrom(i){return i===0?1:i===1?2:i===2?4:i===3?11:1}
  function rankTo(i){return i===0?1:i===1?3:i===2?10:i===3?50:1}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
</script>`;

app.get('/admin/api/vexa-league', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await ensureVexaLeagueTables(c.env);
  const week = await getCurrentWeek(c.env);
  const [dailyMissions, weeklyPrizes, seedUsers] = await Promise.all([
    getDailyMissions(c.env, week.id, new Date().toISOString().slice(0, 10)),
    getWeeklyPrizes(c.env, week.id),
    getSeedUsers(c.env, week.id),
  ]);
  return c.json({ ok:true, missionLibrary: VEXA_LEAGUE_MISSIONS, prizeLibrary: VEXA_LEAGUE_PRIZES, currentWeek: week, dailyMissions, weeklyPrizes, seedUsers });
});

app.post('/admin/api/vexa-league/week', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await ensureVexaLeagueTables(c.env);
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const week = await upsertCurrentWeek(c.env, body);
  return c.json({ ok:true, currentWeek: week });
});

app.post('/admin/api/vexa-league/daily-missions', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await ensureVexaLeagueTables(c.env);
  const body = await c.req.json().catch(() => ({})) as { activeDate?: unknown; missions?: Array<{ templateId?: unknown; vexAmount?: unknown; enabled?: unknown }> };
  const week = await getCurrentWeek(c.env);
  const activeDate = cleanDate(body.activeDate);
  await c.env.DB.prepare('DELETE FROM vexa_league_daily_missions WHERE week_id = ? AND active_date = ?').bind(week.id, activeDate).run();
  for (const mission of body.missions || []) {
    const templateId = cleanId(mission.templateId, 80);
    if (!VEXA_LEAGUE_MISSIONS.some((m) => m.id === templateId)) continue;
    await c.env.DB.prepare('INSERT INTO vexa_league_daily_missions (id, week_id, active_date, template_id, vex_amount, enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)')
      .bind(id('vlm'), week.id, activeDate, templateId, cleanInt(mission.vexAmount, 0, 99999, 0), mission.enabled === false ? 0 : 1).run();
  }
  return c.json({ ok:true, dailyMissions: await getDailyMissions(c.env, week.id, activeDate) });
});

app.post('/admin/api/vexa-league/prizes', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await ensureVexaLeagueTables(c.env);
  const body = await c.req.json().catch(() => ({})) as { prizes?: Array<{ prizeTemplateId?: unknown; rankFrom?: unknown; rankTo?: unknown; enabled?: unknown }> };
  const week = await getCurrentWeek(c.env);
  await c.env.DB.prepare('DELETE FROM vexa_league_weekly_prizes WHERE week_id = ?').bind(week.id).run();
  for (const prize of body.prizes || []) {
    const prizeTemplateId = cleanId(prize.prizeTemplateId, 80);
    if (!VEXA_LEAGUE_PRIZES.some((p) => p.id === prizeTemplateId)) continue;
    const from = cleanInt(prize.rankFrom, 1, 9999, 1);
    const to = Math.max(from, cleanInt(prize.rankTo, 1, 9999, from));
    await c.env.DB.prepare('INSERT INTO vexa_league_weekly_prizes (id, week_id, prize_template_id, rank_from, rank_to, enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)')
      .bind(id('vlp'), week.id, prizeTemplateId, from, to, prize.enabled ? 1 : 0).run();
  }
  return c.json({ ok:true, weeklyPrizes: await getWeeklyPrizes(c.env, week.id) });
});

app.post('/admin/api/vexa-league/seed-users/generate', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await ensureVexaLeagueTables(c.env);
  const week = await getCurrentWeek(c.env);
  await c.env.DB.prepare('DELETE FROM vexa_league_seed_users WHERE week_id = ?').bind(week.id).run();
  for (let i = 0; i < SEED_NAMES.length; i += 1) {
    const position = i + 1;
    const vex = Math.max(90, Math.floor(2600 - i * 47 - (i % 7) * 13));
    const level = Math.max(2, Math.floor(68 - i * 1.15));
    const rankName = level >= 60 ? 'Titan' : level >= 40 ? 'Legend' : level >= 25 ? 'Master' : level >= 15 ? 'Elite' : level >= 8 ? 'Pro' : level >= 4 ? 'Explorer' : 'Rookie';
    const balanceTon = Math.max(1, Number((420 - i * 7.8).toFixed(1)));
    const name = SEED_NAMES[i];
    await c.env.DB.prepare('INSERT INTO vexa_league_seed_users (id, week_id, position, name, username, avatar_initials, level, rank_name, vex, balance_ton, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)')
      .bind(id('vls'), week.id, position, name, name.toLowerCase().replace(/[^a-z0-9]/g, ''), initials(name), level, rankName, vex, balanceTon).run();
  }
  return c.json({ ok:true, seedUsers: await getSeedUsers(c.env, week.id) });
});

export async function ensureVexaLeagueTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_weeks (id TEXT PRIMARY KEY, title TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'hidden', rewards_enabled INTEGER NOT NULL DEFAULT 0, seed_users_enabled INTEGER NOT NULL DEFAULT 1, show_prizes INTEGER NOT NULL DEFAULT 1, winner_count INTEGER NOT NULL DEFAULT 50, announcement TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_daily_missions (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, active_date TEXT NOT NULL, template_id TEXT NOT NULL, vex_amount INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_weekly_prizes (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, prize_template_id TEXT NOT NULL, rank_from INTEGER NOT NULL DEFAULT 1, rank_to INTEGER NOT NULL DEFAULT 1, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_seed_users (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 999, name TEXT NOT NULL, username TEXT NOT NULL, avatar_initials TEXT NOT NULL, level INTEGER NOT NULL DEFAULT 1, rank_name TEXT NOT NULL DEFAULT 'Rookie', vex INTEGER NOT NULL DEFAULT 0, balance_ton REAL NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_scores (user_id TEXT NOT NULL, week_id TEXT NOT NULL, vex INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, banned INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, week_id))`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_vex_events (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, user_id TEXT NOT NULL, amount INTEGER NOT NULL, source TEXT NOT NULL, reason TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function getCurrentWeek(env: Env): Promise<Record<string, unknown> & { id: string }> {
  const existing = await env.DB.prepare('SELECT id, title, starts_at AS startsAt, ends_at AS endsAt, status, rewards_enabled AS rewardsEnabled, seed_users_enabled AS seedUsersEnabled, show_prizes AS showPrizes, winner_count AS winnerCount, announcement FROM vexa_league_weeks ORDER BY created_at DESC LIMIT 1').first<Record<string, unknown> & { id: string }>();
  if (existing) return boolWeek(existing);
  return upsertCurrentWeek(env, { title:'Vexa Weekly Race', status:'hidden', rewardsEnabled:false, seedUsersEnabled:true, winnerCount:50, announcement:'Top players win weekly rewards.' });
}

async function upsertCurrentWeek(env: Env, body: Record<string, unknown>): Promise<Record<string, unknown> & { id: string }> {
  const current = await env.DB.prepare('SELECT id FROM vexa_league_weeks ORDER BY created_at DESC LIMIT 1').first<{ id: string }>();
  const startsAt = cleanIso(body.startsAt) || defaultStart();
  const endsAt = cleanIso(body.endsAt) || defaultEnd();
  const values = {
    id: current?.id || id('vlw'),
    title: cleanText(body.title, 90, 'Vexa Weekly Race'),
    startsAt,
    endsAt,
    status: ['active','hidden','preview','ended'].includes(String(body.status)) ? String(body.status) : 'hidden',
    rewardsEnabled: truthy(body.rewardsEnabled),
    seedUsersEnabled: body.seedUsersEnabled === false ? false : true,
    showPrizes: body.showPrizes === false ? false : true,
    winnerCount: cleanInt(body.winnerCount, 0, 500, 50),
    announcement: cleanText(body.announcement, 240, ''),
  };
  await env.DB.prepare(`INSERT INTO vexa_league_weeks (id, title, starts_at, ends_at, status, rewards_enabled, seed_users_enabled, show_prizes, winner_count, announcement, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET title=excluded.title, starts_at=excluded.starts_at, ends_at=excluded.ends_at, status=excluded.status, rewards_enabled=excluded.rewards_enabled, seed_users_enabled=excluded.seed_users_enabled, show_prizes=excluded.show_prizes, winner_count=excluded.winner_count, announcement=excluded.announcement, updated_at=CURRENT_TIMESTAMP`)
    .bind(values.id, values.title, values.startsAt, values.endsAt, values.status, values.rewardsEnabled ? 1 : 0, values.seedUsersEnabled ? 1 : 0, values.showPrizes ? 1 : 0, values.winnerCount, values.announcement).run();
  return values;
}

async function getDailyMissions(env: Env, weekId: string, activeDate: string): Promise<Record<string, unknown>[]> {
  const rows = await env.DB.prepare('SELECT id, week_id AS weekId, active_date AS activeDate, template_id AS templateId, vex_amount AS vexAmount, enabled FROM vexa_league_daily_missions WHERE week_id = ? AND active_date = ? ORDER BY created_at ASC').bind(weekId, activeDate).all<Record<string, unknown>>();
  return rows.results.map((row) => ({ ...row, enabled: Boolean(row.enabled) }));
}

async function getWeeklyPrizes(env: Env, weekId: string): Promise<Record<string, unknown>[]> {
  const rows = await env.DB.prepare('SELECT id, week_id AS weekId, prize_template_id AS prizeTemplateId, rank_from AS rankFrom, rank_to AS rankTo, enabled FROM vexa_league_weekly_prizes WHERE week_id = ? ORDER BY rank_from ASC').bind(weekId).all<Record<string, unknown>>();
  return rows.results.map((row) => ({ ...row, enabled: Boolean(row.enabled) }));
}

async function getSeedUsers(env: Env, weekId: string): Promise<Record<string, unknown>[]> {
  const rows = await env.DB.prepare('SELECT id, position, name, username, avatar_initials AS avatarInitials, level, rank_name AS rankName, vex, balance_ton AS balanceTon, is_active AS isActive FROM vexa_league_seed_users WHERE week_id = ? ORDER BY position ASC LIMIT 50').bind(weekId).all<Record<string, unknown>>();
  return rows.results.map((row) => ({ ...row, isActive: Boolean(row.isActive) }));
}

function boolWeek(row: Record<string, unknown> & { id: string }): Record<string, unknown> & { id: string } { return { ...row, rewardsEnabled: Boolean(row.rewardsEnabled), seedUsersEnabled: Boolean(row.seedUsersEnabled), showPrizes: Boolean(row.showPrizes) }; }
function cleanText(value: unknown, max: number, fallback: string): string { const text = String(value ?? '').trim().slice(0, max); return text || fallback; }
function cleanId(value: unknown, max: number): string { return String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, max); }
function cleanInt(value: unknown, min: number, max: number, fallback: number): number { const n = Math.floor(Number(value)); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; }
function cleanDate(value: unknown): string { const text = String(value ?? '').slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : new Date().toISOString().slice(0, 10); }
function cleanIso(value: unknown): string { const d = new Date(String(value ?? '')); return Number.isFinite(d.getTime()) ? d.toISOString() : ''; }
function truthy(value: unknown): boolean { return value === true || value === 'true' || value === 1 || value === '1'; }
function defaultStart(): string { const d = new Date(); d.setUTCHours(0,0,0,0); return d.toISOString(); }
function defaultEnd(): string { const d = new Date(); d.setUTCDate(d.getUTCDate()+7); d.setUTCHours(23,59,59,0); return d.toISOString(); }
function id(prefix: string): string { return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`; }
function initials(name: string): string { return name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'VX'; }
function adminCookieValue(cookie: string | undefined): string { const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/); return match ? decodeURIComponent(match[1]) : ''; }
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }
