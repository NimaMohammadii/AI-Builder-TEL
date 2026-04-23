import type { Env } from '../types/env';

export function getDb(env?: Env) {
  if (!env || !env.DB) {
    return null;
  }

  return env.DB;
}
