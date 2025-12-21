# ISSUES

## 1. Failed to authenticate error

>Failed to authenticate: "No auth provider found matching the given token. Check that your JWT's issuer and audience match one of your configured providers: [OIDC(domain=https://something.clerk.accounts.dev, app_id=convex)]", check your server auth config


### Solution

This error happens because Clerk is sending a "passport" (the JWT) that Convex doesn't recognize.

**Step A: Verify your Clerk Template**

1.  Go to your [Clerk Dashboard](https://dashboard.clerk.com/).
    
2.  Go to **JWT Templates** -> Click on your **Convex** template.
    
3.  Check the **Issuer** URL. It should be `https://something.clerk.accounts.dev`.
    
4.  Check the **Claims** section. It **must** have:

```json
{
  "aud": "convex"
}
```
    
_If the `aud` says something else, change it to `convex` and save._
