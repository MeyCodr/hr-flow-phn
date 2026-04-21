"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import type { Session } from "next-auth";
import { authBasePath } from "@/lib/base-path";
import axios from "axios";

axios.defaults.timeout = 30000;

interface ProvidersProps {
  children: ReactNode;
  session?: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session} basePath={authBasePath}>
      {children}
    </SessionProvider>
  );
}
