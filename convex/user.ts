import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
    args: {
        username: v.string(),
        imageURL: v.string(),
        clerkId: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        console.log("Creating user with args:", args);
        await ctx.db.insert("users", args)
        console.log("User created successfully.");
    }
})

export const get = internalQuery({
    args: {
        clerkId: v.string(),
    },
    async handler(ctx, args) {
        console.log("Getting user with clerkId:", args.clerkId);
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq
                ("clerkId", args.clerkId)
            )
            .unique()
        console.log("User get result:", user);
        return user;
    }
})

export const update = internalMutation({
    args: {
        clerkId: v.string(),
        username: v.optional(v.string()),
        imageURL: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        console.log("Updating user with args:", args);
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq
                ("clerkId", args.clerkId)
            )
            .unique()
        if (!user) {
            console.error("User not found for update with clerkId:", args.clerkId);
            throw new Error("User not found")
        }
        await ctx.db.patch(user._id, {
            username: args.username,
            imageURL: args.imageURL,
        })
        console.log("User updated successfully for clerkId:", args.clerkId);
    }
})
