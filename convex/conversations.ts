import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("conversations").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.id);
    if (!conversation) return null;
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.id))
      .collect();
      
    return {
      ...conversation,
      messages,
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    model: v.string(),
    mode: v.union(v.literal("chat"), v.literal("agent")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("conversations", {
      title: args.title,
      model: args.model,
      mode: args.mode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    content: v.string(),
    toolCalls: v.optional(v.any()),
    toolResults: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      toolCalls: args.toolCalls,
      toolResults: args.toolResults,
      createdAt: Date.now(),
    });
    
    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });
    
    return id;
  },
});
