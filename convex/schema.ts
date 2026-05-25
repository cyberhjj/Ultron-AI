import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // === Conversations ===
  conversations: defineTable({
    title: v.string(),
    model: v.string(),
    mode: v.union(v.literal("chat"), v.literal("agent")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // === Messages ===
  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    content: v.string(),
    toolCalls: v.optional(v.any()),
    toolResults: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_conversationId", ["conversationId"]),

  // === Pentest Sessions (Replaces v1 Agent Sessions) ===
  pentest_sessions: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(), // We don't have auth yet, this can be a dummy string like "local_user"
    mode: v.union(v.literal("standard"), v.literal("ctf"), v.literal("bug_bounty"), v.literal("continuous")),
    target_scope: v.array(v.string()), // IPs, domains in scope
    ptg_state: v.any(), // Serialized PTG JSON
    kg_session_id: v.optional(v.string()), // Neo4j session node ID
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_conversationId", ["conversationId"]),

  // === Human-in-the-Loop Approvals ===
  hitl_approvals: defineTable({
    sessionId: v.id("pentest_sessions"),
    taskId: v.string(), // PTG node ID
    riskLevel: v.union(v.literal("yellow"), v.literal("red")),
    command: v.string(),
    justification: v.string(),
    decision: v.union(v.literal("pending"), v.literal("approved"), v.literal("denied"), v.literal("timeout")),
    decidedAt: v.optional(v.number()),
    timeoutAt: v.number(),
    createdAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),

  // === Immutable Audit Log ===
  audit_log: defineTable({
    sessionId: v.id("pentest_sessions"),
    eventType: v.union(v.literal("llm_call"), v.literal("tool_invocation"), v.literal("sandbox_command"), v.literal("hitl_decision")),
    payload: v.any(),
    timestamp: v.number(),
  }).index("by_sessionId", ["sessionId"]),

  // === RAG Retrievals ===
  rag_retrievals: defineTable({
    sessionId: v.id("pentest_sessions"),
    query: v.string(),
    collection: v.union(v.literal("cve_exploits"), v.literal("pentest_writeups"), v.literal("past_sessions")),
    results: v.any(), // Array of {cve_id, score, used}
    createdAt: v.number(),
  }),

  // === Attack Reports ===
  attack_reports: defineTable({
    sessionId: v.id("pentest_sessions"),
    format: v.union(v.literal("pdf"), v.literal("word"), v.literal("excel"), v.literal("hackerone"), v.literal("bugcrowd"), v.literal("ctf_writeup")),
    s3Key: v.string(),
    findingsCount: v.number(),
    criticalCount: v.number(),
    highCount: v.number(),
    cvssMax: v.number(),
    createdAt: v.number(),
  }),
});
