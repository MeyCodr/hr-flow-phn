"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import type { Session } from "next-auth";
import { authBasePath } from "@/lib/base-path";
import axios from "axios";
import { ThemeProvider } from "next-themes";

axios.defaults.timeout = 30000;

interface ProvidersProps {
  children: ReactNode;
  session?: Session | null;
  nonce?: string;
}

export function Providers({ children, session, nonce }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem nonce={nonce}>
      <SessionProvider session={session} basePath={authBasePath}>
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
