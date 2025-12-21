"use client";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { RedirectToSignIn, UserButton } from "@clerk/nextjs";

// function CustomGoogleButton() {
//   return (
//     <SignInButton>
//       <Button>Sign in with Google</Button>
//     </SignInButton>
//   );
// }

export default function Home() {
  return (
    <main>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
      <Authenticated>
        <UserButton />
        <p>Authenticated</p>
      </Authenticated>
      <AuthLoading>
        <p>Still loading</p>
      </AuthLoading>
    </main>
  );
}
