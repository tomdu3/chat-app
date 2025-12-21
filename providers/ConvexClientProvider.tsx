"use client";
import React from "react";
import { Authenticated, AuthLoading, ConvexReactClient, Unauthenticated } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth, ClerkProvider } from "@clerk/nextjs";
import { LoadingLogo } from "../components/common/LoadingLogo";

type Props = {
  children: React.ReactNode;
};

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexReactClient(CONVEX_URL);

export function ConvexClientProvider({ children }: Props) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {/* Render children only when authenticated */}
        <Authenticated>{children}</Authenticated>

        {/* Render children even when NOT authenticated 
            (Remove this if you want the login screen to be forced) */}
        <Unauthenticated>{children}</Unauthenticated>

        {/* Show loading screen while checking auth status */}
        <AuthLoading>
          <LoadingLogo />
        </AuthLoading>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}