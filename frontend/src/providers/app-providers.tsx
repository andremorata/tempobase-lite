"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
