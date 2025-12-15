"use client";
import { Button } from "@/components/ui/button";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";

import { useState } from "react";

function CustomGoogleButton() {
  return (
    <SignInButton>
      <Button>Sign in with Google</Button>
    </SignInButton>
  );
}

export default function Home() {
  return (
    <main>
      <Unauthenticated>
        <CustomGoogleButton />
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
