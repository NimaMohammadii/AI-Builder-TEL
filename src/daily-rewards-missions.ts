import type { Env } from './types';

export type DailyMissionDefinition = {
  id: string;
  title: string;
  description: string;
  type: string;
  defaultXp: number;
};

export type DailyMissionSlot = {
  missionId: string;
  xp: number;
};

export type DailyRewardsDayConfig = {
  day: number;
  missions: DailyMissionSlot[];
};

export type DailyRewardsSettings = {
  days: DailyRewardsDayConfig[];
};

const SETTINGS_KEY = 'daily_rewards_settings_v1';
const DAY_COUNT = 7;
const MISSIONS_PER_DAY = 6;

export const DAILY_REWARD_MISSION_DEFINITIONS: DailyMissionDefinition[] = [
  { id: 'open_app', title: 'Open the app', description: 'Open Vexa today.', type: 'open_app', defaultXp: 40 },
  { id: 'daily_streak', title: 'Keep daily streak', description: 'Return today and keep your streak alive.', type: 'open_app', defaultXp: 70 },
  { id: 'play_predict_1', title: 'Play 1 Predict round', description: 'Complete one Predict round.', type: 'play_predict_rounds', defaultXp: 50 },
  { id: 'play_predict_3', title: 'Play 3 Predict rounds', description: 'Complete three Predict rounds.', type: 'play_predict_rounds', defaultXp: 90 },
  { id: 'play_predict_5', title: 'Play 5 Predict rounds', description: 'Complete five Predict rounds.', type: 'play_predict_rounds', defaultXp: 130 },
  { id: 'play_predict_7', title: 'Play 7 Predict rounds', description: 'Complete seven Predict rounds.', type: 'play_predict_rounds', defaultXp: 180 },
  { id: 'win_predict_1', title: 'Win 1 Predict round', description: 'Win one Predict round.', type: 'win_predict_rounds', defaultXp: 120 },
  { id: 'win_predict_2', title: 'Win 2 Predict rounds', description: 'Win two Predict rounds.', type: 'win_predict_rounds', defaultXp: 160 },
  { id: 'win_predict_3', title: 'Win 3 Predict rounds', description: 'Win three Predict rounds.', type: 'win_predict_rounds', defaultXp: 220 },
  { id: 'place_bets_3', title: 'Place 3 bets', description: 'Place three total bets today.', type: 'place_bets', defaultXp: 70 },
  { id: 'place_bets_5', title: 'Place 5 bets', description: 'Place five total bets today.', type: 'place_bets', defaultXp: 100 },
  { id: 'place_bets_10', title: 'Place 10 bets', description: 'Place ten total bets today.', type: 'place_bets', defaultXp: 190 },
  { id: 'use_up_down', title: 'Use both directions', description: 'Try both Up and Down in Predict.', type: 'use_directions', defaultXp: 80 },
  { id: 'bet_10_ton', title: 'Bet 10 TON total', description: 'Reach 10 TON total bet volume today.', type: 'bet_volume_ton', defaultXp: 120 },
  { id: 'bet_20_ton', title: 'Bet 20 TON total', description: 'Reach 20 TON total bet volume today.', type: 'bet_volume_ton', defaultXp: 180 },
  { id: 'bet_30_ton', title: 'Bet 30 TON total', description: 'Reach 30 TON total bet volume today.', type: 'bet_volume_ton', defaultXp: 240 },
  { id: 'deposit_any', title: 'Deposit TON', description: 'Make any TON deposit today.', type: 'deposit_ton', defaultXp: 180 },
  { id: 'deposit_10_ton', title: 'Deposit 10 TON', description: 'Deposit at least 10 TON today.', type: 'deposit_ton', defaultXp: 220 },
  { id: 'deposit_40_ton', title: 'Deposit 40 TON', description: 'Deposit at least 40 TON today.', type: 'deposit_ton', defaultXp: 400 },
  { id: 'open_play_zone', title: 'Open Play Zone', description: 'Visit the Play Zone section.', type: 'open_section', defaultXp: 40 },
  { id: 'open_market', title: 'Open Market', description: 'Visit the Market section.', type: 'open_section', defaultXp: 35 },
  { id: 'check_top_players', title: 'Check Top Players', description: 'Open the weekly Top Players board.', type: 'open_section', defaultXp: 60 },
  { id: 'check_level_progress', title: 'Check level progress', description: 'View your XP and level progress.', type: 'open_section', defaultXp: 45 },
  { id: 'try_new_game', title: 'Try a new game', description: 'Open a different game in Play Zone.', type: 'open_game', defaultXp: 80 },
  { id: 'play_plinko_1', title: 'Play 1 Plinko round', description: 'Complete one Plinko round.', type: 'play_plinko_rounds', defaultXp: 60 },
  { id: 'play_plinko_3', title: 'Play 3 Plinko rounds', description: 'Complete three Plinko rounds.', type: 'play_plinko_rounds', defaultXp: 120 },
  { id: 'play_mines_1', title: 'Play 1 Mines round', description: 'Complete one Mines round.', type: 'play_mines_rounds', defaultXp: 60 },
  { id: 'win_any_game', title: 'Win any game', description: 'Win once in any Play Zone game.', type: 'win_any_game', defaultXp: 130 },
  { id: 'invite_friend', title: 'Invite a friend', description: 'Bring one friend to Vexa.', type: 'invite_friend', defaultXp: 220 },
  { id: 'finish_all_daily', title: 'Finish all daily missions', description: 'Complete all six missions for the day.', type: 'complete_daily_set', defaultXp: 300 },
];

const DEFAULT_DAY_MISSION_IDS = [
  ['open_app', 'play_predict_3', 'win_predict_1', 'place_bets_5', 'check_level_progress', 'deposit_any'],
  ['open_app', 'play_predict_5', 'win_predict_2', 'use_up_down', 'open_market', 'invite_friend'],
  ['daily_streak', 'play_predict_5', 'bet_20_ton', 'open_play_zone', 'check_level_progress', 'deposit_10_ton'],
  ['open_app', 'play_predict_3', 'win_predict_1', 'try_new_game', 'check_top_players', 'deposit_any'],
  ['daily_streak', 'play_predict_7', 'win_predict_3', 'place_bets_10', 'open_market', 'invite_friend'],
  ['open_app', 'play_predict_5', 'win_predict_2', 'bet_30_ton', 'open_play_zone', 'play_plinko_3'],
  ['daily_streak', 'play_predict_7', 'win_predict_3', 'place_bets_10', 'check_top_players', 'finish_all_daily'],
];

export async function getDailyRewardsAdminPayload(env: Env): Promise<{ definitions: DailyMissionDefinition[]; settings: DailyRewardsSettings }> {
  return { definitions: DAILY_REWARD_MISSION_DEFINITIONS, settings: await getDailyRewardsSettings(env) };
}

export async function getDailyRewardsSettings(env: Env): Promise<DailyRewardsSettings> {
  await ensureDailyRewardsTables(env);
  const row = await env.DB.prepare('SELECT value_json FROM app_settings WHERE key = ?').bind(SETTINGS_KEY).first<{ value_json: string }>().catch(() => null);
  if (!row?.value_json) return defaultSettings();
  try {
    return normalizeSettings(JSON.parse(row.value_json));
  } catch {
    return defaultSettings();
  }
}

export async function saveDailyRewardsSettings(env: Env, input: unknown): Promise<DailyRewardsSettings> {
  await ensureDailyRewardsTables(env);
  const settings = normalizeSettings(input);
  await env.DB.prepare(`INSERT INTO app_settings (key, value_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`)
    .bind(SETTINGS_KEY, JSON.stringify(settings))
    .run();
  return settings;
}

async function ensureDailyRewardsTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

function defaultSettings(): DailyRewardsSettings {
  return { days: DEFAULT_DAY_MISSION_IDS.map((ids, day) => ({ day, missions: ids.map((missionId) => ({ missionId, xp: definitionById(missionId)?.defaultXp ?? 50 })) })) };
}

function normalizeSettings(input: unknown): DailyRewardsSettings {
  const data = input as { days?: unknown };
  const sourceDays = Array.isArray(data?.days) ? data.days : [];
  const fallback = defaultSettings();
  const days: DailyRewardsDayConfig[] = [];
  for (let day = 0; day < DAY_COUNT; day += 1) {
    const rawDay = sourceDays.find((item) => Number((item as { day?: unknown })?.day) === day) as { missions?: unknown } | undefined;
    const rawMissions = Array.isArray(rawDay?.missions) ? rawDay.missions : fallback.days[day].missions;
    const missions = rawMissions
      .map((item) => normalizeSlot(item))
      .filter((slot): slot is DailyMissionSlot => Boolean(slot))
      .slice(0, MISSIONS_PER_DAY);
    while (missions.length < MISSIONS_PER_DAY) missions.push(fallback.days[day].missions[missions.length]);
    days.push({ day, missions });
  }
  return { days };
}

function normalizeSlot(input: unknown): DailyMissionSlot | null {
  const raw = input as { missionId?: unknown; xp?: unknown };
  const missionId = String(raw?.missionId || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 80);
  const definition = definitionById(missionId);
  if (!definition) return null;
  const xp = Math.max(1, Math.min(5000, Math.floor(Number(raw?.xp ?? definition.defaultXp) || definition.defaultXp)));
  return { missionId, xp };
}

function definitionById(id: string): DailyMissionDefinition | undefined {
  return DAILY_REWARD_MISSION_DEFINITIONS.find((item) => item.id === id);
}
