import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const logEvent = mutation({
  args: {
    sessionId: v.id("pentest_sessions"),
    eventType: v.union(v.literal("llm_call"), v.literal("tool_invocation"), v.literal("sandbox_command"), v.literal("hitl_decision")),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    // Audit logs are strictly immutable: only inserts allowed.
    // There are no patch/delete endpoints for this table.
    const id = await ctx.db.insert("audit_log", {
      sessionId: args.sessionId,
      eventType: args.eventType,
      payload: args.payload,
      timestamp: Date.now(),
    });
    return id;
  },
});

export const getBySession = query({
  args: { sessionId: v.id("pentest_sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("audit_log")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});
