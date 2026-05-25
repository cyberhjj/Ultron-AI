import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getBySession = query({
  args: { sessionId: v.id("pentest_sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attack_reports")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .collect();
  },
});

export const create = mutation({
  args: {
    sessionId: v.id("pentest_sessions"),
    format: v.union(v.literal("pdf"), v.literal("word"), v.literal("excel"), v.literal("hackerone"), v.literal("bugcrowd"), v.literal("ctf_writeup")),
    s3Key: v.string(),
    findingsCount: v.number(),
    criticalCount: v.number(),
    highCount: v.number(),
    cvssMax: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("attack_reports", {
      sessionId: args.sessionId,
      format: args.format,
      s3Key: args.s3Key,
      findingsCount: args.findingsCount,
      criticalCount: args.criticalCount,
      highCount: args.highCount,
      cvssMax: args.cvssMax,
      createdAt: Date.now(),
    });
    return id;
  },
});
