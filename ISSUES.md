# ISSUES

## 1. Failed to authenticate error

> Failed to authenticate: "No auth provider found matching the given token. Check that your JWT's issuer and audience match one of your configured providers: [OIDC(domain=https://something.clerk.accounts.dev, app_id=convex)]", check your server auth config

### Solution

This error happens because Clerk is sending a "passport" (the JWT) that Convex doesn't recognize. This mismatch usually occurs between the Clerk Dashboard settings and your local configuration file.

**Step A: Verify your Clerk Template**

1.  Go to your [Clerk Dashboard](https://dashboard.clerk.com/).
2.  Go to **JWT Templates** -> Click on your **Convex** template.
3.  Check the **Issuer** URL. It should match the domain in the error (e.g., `https://something.clerk.accounts.dev`).
4.  Check the **Claims** section. It **must** have:

```json
{
  "aud": "convex"
}

```

*If the `aud` says something else, change it to `convex` and save.*

**Step B: Update your Local Config**

Ensure your `convex/auth.config.ts` matches the Clerk settings exactly:

```typescript
export default {
  providers: [
    {
      domain: "[https://something.clerk.accounts.dev](https://something.clerk.accounts.dev)",
      applicationID: "convex",
    },
  ],
};

```

**Step C: Sync Changes to Convex Cloud**

Changes to `auth.config.ts` are not automatic. You must run this command to update the Convex backend:

```bash
npx convex dev --configure-auth

```

---

## 2. Hydration Mismatch (Browser Extensions)

### Problem

The console shows a "Hydration failed" error because browser extensions (like Dark Reader) inject attributes into the HTML before React takes control.

### Solution

Add `suppressHydrationWarning` to the `<html>` tag in `app/layout.tsx`, or use a "mounted" state check in components that are highly susceptible to changes (like those using `next/image` or animations).

---

## 3. Cannot find module '@clerk/nextjs/dist/types/server'

### Problem

TypeScript error `ts(2307)` when trying to import `WebhookEvent`. This is caused by using a deep import path that is no longer supported in newer versions of the Clerk SDK.

### Solution

Update the import path to the official server entry point:

**Wrong:**
`import { WebhookEvent } from "@clerk/nextjs/dist/types/server";`

**Right:**
`import { WebhookEvent } from "@clerk/nextjs/server";`

```