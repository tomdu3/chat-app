import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const validatePayload = async (req: Request): Promise<WebhookEvent | undefined> => {
    const payload = await req.text()

    const svixHeaders = {
        "svix-id": req.headers.get("svix-id")!,
        "svix-timestamp": req.headers.get("svix-timestamp")!,
        "svix-signature": req.headers.get("svix-signature")!,
    }

    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

    try {
        const event = webhook.verify(payload, svixHeaders) as WebhookEvent
        return event
    } catch (error) {
        console.error("Failed to verify webhook signature", error)
        return undefined
    }
}

const handlerClerkWebhook = httpAction(async (ctx, req) => {
    const event = await validatePayload(req)
    if (!event) {
        return new Response("Invalid webhook", { status: 400 })
    }

    switch (event.type) {
        case "user.created":
            console.log(`Creating User: ${event.data.id}`)
            await ctx.runMutation(internal.user.create, {
                username: `${event.data.first_name || ""} ${event.data.last_name || ""}`.trim() || "User",
                imageURL: event.data.image_url,
                clerkId: event.data.id,
                email: event.data.email_addresses[0]?.email_address || "",
            })
            break;
        case "user.updated":
            console.log(`Updating User: ${event.data.id}`)
            await ctx.runMutation(internal.user.update, {
                clerkId: event.data.id,
                username: `${event.data.first_name || ""} ${event.data.last_name || ""}`.trim() || "User",
                imageURL: event.data.image_url,
            })
            break;
        default: {
            console.log(`Unknown Clerk webhook event: ${event.type}`)
        }
    }
    return new Response(null, {
        status: 200,
    })
})

const http = httpRouter()

http.route({
    path: '/clerk-users-webhook',
    method: 'POST',
    handler: handlerClerkWebhook
})

export default http;

