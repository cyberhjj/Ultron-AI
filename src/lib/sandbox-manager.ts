/**
 * Shared Sandbox Session Manager
 * ═══════════════════════════════════════════════════════════════
 * Extracted from chat/route.ts so both the chat route and the
 * execute-approved route can reuse the SAME persistent sandbox.
 *
 * Key design: one VM per session, files/tools survive between commands.
 * ═══════════════════════════════════════════════════════════════
 */

import { Sandbox } from "e2b";

// ─── Sandbox Session Map ──────────────────────────────────────────────────────
// Stores active sandbox instances keyed by sessionId.
const sandboxSessions = new Map<string, { sandbox: Sandbox; lastUsed: number }>();

// Clean up idle sandboxes older than 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sandboxSessions.entries()) {
    if (now - session.lastUsed > 10 * 60 * 1000) {
      session.sandbox.kill().catch(() => {});
      sandboxSessions.delete(id);
      console.log(`[Ultron] Session ${id} expired and cleaned up`);
    }
  }
}, 60_000);

// ─── Get or Create Sandbox ────────────────────────────────────────────────────
export async function getOrCreateSandbox(sessionId: string): Promise<Sandbox> {
  const existing = sandboxSessions.get(sessionId);
  if (existing) {
    existing.lastUsed = Date.now();
    console.log(`[Ultron] Reusing sandbox for session: ${sessionId}`);
    return existing.sandbox;
  }

  console.log(`[Ultron] Creating new sandbox for session: ${sessionId}`);
  const sandbox = await Sandbox.create({ apiKey: process.env.E2B_API_KEY! });

  // Bootstrap pentest workspace on first creation
  await sandbox.commands.run(
    "mkdir -p /home/user/pentest && " +
    "echo '# Ultron Pentest Session' > /home/user/pentest/findings.md && " +
    "echo 'Session started: ' $(date) >> /home/user/pentest/findings.md"
  );

  sandboxSessions.set(sessionId, { sandbox, lastUsed: Date.now() });
  return sandbox;
}

// ─── Kill Sandbox ─────────────────────────────────────────────────────────────
export async function killSandbox(sessionId: string): Promise<boolean> {
  const session = sandboxSessions.get(sessionId);
  if (session) {
    await session.sandbox.kill().catch(() => {});
    sandboxSessions.delete(sessionId);
    return true;
  }
  return false;
}
