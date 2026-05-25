import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pentest_sessions")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .first();
  },
});

export const create = mutation({
  args: {
    conversationId: v.id("conversations"),
    mode: v.union(v.literal("standard"), v.literal("ctf"), v.literal("bug_bounty"), v.literal("continuous")),
    targetScope: v.array(v.string()),
    ptgState: v.any(),
  },
  handler: async (ctx, args) => {
    // Check if session already exists
    const existing = await ctx.db
      .query("pentest_sessions")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .first();
      
    if (existing) {
      return existing._id;
    }

    const id = await ctx.db.insert("pentest_sessions", {
      conversationId: args.conversationId,
      userId: "local_user",
      mode: args.mode,
      target_scope: args.targetScope,
      ptg_state: args.ptgState,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

export const updatePTG = mutation({
  args: {
    id: v.id("pentest_sessions"),
    ptgState: v.any(),
    status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("completed"), v.literal("failed"))),
  },
  handler: async (ctx, args) => {
    const patches: any = {
      ptg_state: args.ptgState,
      updatedAt: Date.now(),
    };
    if (args.status) {
      patches.status = args.status;
    }
    await ctx.db.patch(args.id, patches);
  },
});
