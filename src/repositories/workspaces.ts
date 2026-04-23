import type { Env } from '../types/env';
import { getDb } from '../db/client';

export async function ensureWorkspaceForUser(env: Env, input: {
  userId: string;
  username?: string;
  firstName?: string;
}) {
  const db = getDb(env);
  const existing = await db
    .prepare(`SELECT id FROM workspaces WHERE owner_id = ? LIMIT 1`)
    .bind(input.userId)
    .first<{ id: string }>();

  if (existing?.id) {
    return { id: existing.id };
  }

  const base = (input.username || input.firstName || 'workspace').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'workspace';
  const workspaceId = `ws_${crypto.randomUUID()}`;
  const slug = `${base}-${workspaceId.slice(-6)}`;
  const name = input.firstName ? `${input.firstName}'s Workspace` : 'Vexa Workspace';

  await db
    .prepare(`INSERT INTO workspaces (id, owner_id, name, slug) VALUES (?, ?, ?, ?)`)
    .bind(workspaceId, input.userId, name, slug)
    .run();

  await db
    .prepare(`INSERT INTO workspace_members (id, workspace_id, user_id, role) VALUES (?, ?, ?, ?)`)
    .bind(`wsm_${crypto.randomUUID()}`, workspaceId, input.userId, 'owner')
    .run();

  return { id: workspaceId };
}
