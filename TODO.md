# Project Overview & TODO List

Welcome to the **Chat / Collaboration Application** project. This document serves as the central hub for tracking our tech stack, completed milestones, and upcoming roadmap tasks.

---

## 📂 Tech Stack & Architecture

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Radix UI, Lucide Icons
- **Backend & Database:** Convex (fully reactive serverless queries & mutations with real-time sync)
- **Authentication:** Clerk + Webhooks (Svix) for keeping users in sync with Convex

---

## 📝 Milestone & Task Tracker

### 🟢 1. Core Foundations & Auth (Completed)
- [x] **Project Setup:** Initialize Next.js 16 + React 19 workspace structure.
- [x] **Tailwind CSS v4 Integration:** Set up PostCSS and v4 design parameters.
- [x] **Design Primitives:** Implement the shadcn-style `Button` component and the Tailwind merger utility (`cn`).
- [x] **Database Schema:** Establish a `users` table indexed by `clerkId` and `email` for rapid lookups (`convex/schema.ts`).
- [x] **Convex Backend Mutations/Queries:** Create, read, and patch user profiles (`convex/user.ts`).
- [x] **Auth integration:** Configure `<ConvexProviderWithClerk>` inside `ConvexClientProvider.tsx` to handle authentication states smoothly.
- [x] **UI Animations:** Build a custom spin-animated `<LoadingLogo />` component for high-fidelity load states.
- [x] **Fix Clerk Middleware Typo:** Renamed `midleware.ts` to `middleware.ts` so Next.js matches and runs it.
- [x] **Fix Clerk Webhook Logic:** Corrected `convex/http.ts` switch cases, resolved the fallthrough bug between user creation/updating, and added robust fallback checks for optional fields like names and emails.

---

### 🚀 2. Next Steps & Feature Roadmap (Pending)

#### Phase 1: Interactive Home & Landing Page
- [ ] **Interactive Landing Page:** Craft an attractive onboarding / sign-in layout on the homepage (`app/page.tsx`).
- [ ] **Auth Guards:** Set up clean redirects and custom loading gates using `<Authenticated>`, `<Unauthenticated>`, and `<AuthLoading>`.

#### Phase 2: Schema & Database Design Expansion
- [ ] **Conversations Table:** Add a table to `convex/schema.ts` for managing direct messages (1-on-1) and group chats.
- [ ] **Messages Table:** Design a table to store messages with sender ID, conversation ID, content, and timestamps.
- [ ] **Friends & Relationships Table:** Create standard status fields (e.g., `pending`, `accepted`, `blocked`) for user connections.

#### Phase 3: Real-Time Mutations & Queries (Convex)
- [ ] **Conversation Queries:** Retrieve user conversations, sorting them by latest activity.
- [ ] **Message Mutations/Queries:** Set up a paginated search/query of messages in a conversation and mutations to send new messages.
- [ ] **Friend Request Handlers:** Establish safe mutations for sending, accepting, and declining friend invites.

#### Phase 4: Main Layout & Sidebar UI
- [ ] **Responsive Navigation Layout:** Design a main navigation layout with toggles for Mobile vs Desktop views.
- [ ] **Active Sidebar:** Dynamically pull and render active chats, direct messages, and friendship status lists.
- [ ] **User Profile Card:** Show current user status and quick-actions (e.g., sign out, settings, status indicators).

#### Phase 5: Rich Messaging Features
- [ ] **Typing Indicators:** Real-time feedback of who is currently composing a message in a conversation.
- [ ] **Media Sharing:** Add image and file upload support using Convex File Storage.
- [ ] **Unread Message Badges:** Dynamically compute and display unread counts for conversations.
