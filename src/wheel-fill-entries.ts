export const WHEEL_FILL_DELAY_MS = 12_000;
export const WHEEL_FILL_ENTRY_COUNT = 60;

export type WheelFillEntry = {
  userId: string;
  name: string;
  amountTon: number;
};

export function isWheelFillReady(createdAt: string, nowMs = Date.now()): boolean {
  const createdAtMs = Date.parse(createdAt);
  return Number.isFinite(createdAtMs) && nowMs - createdAtMs >= WHEEL_FILL_DELAY_MS;
}

export function pickWheelFillEntries(roundId: string, usedIds: string[], needed: number): WheelFillEntry[] {
  const used = new Set(usedIds);
  const entries: WheelFillEntry[] = [];
  let seed = hashWheelFillSeed(roundId);
  for (let attempts = 0; entries.length < needed && attempts < WHEEL_FILL_ENTRY_COUNT * 3; attempts += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const index = seed % WHEEL_FILL_ENTRY_COUNT;
    const userId = `wheel_fill_${index + 1}`;
    if (used.has(userId)) continue;
    used.add(userId);
    entries.push({ userId, name: wheelFillName(index), amountTon: wheelFillAmountTon(index) });
  }
  return entries;
}

function wheelFillName(index: number): string {
  return `Fill Entry ${String(index + 1).padStart(2, '0')}`;
}

function wheelFillAmountTon(index: number): number {
  if (index <= 0) return 4;
  if (index >= WHEEL_FILL_ENTRY_COUNT - 1) return 100;
  return 5 + ((index * 7) % 95);
}

function hashWheelFillSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
