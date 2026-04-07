"use client";

import axios from "axios";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import type { Session } from "next-auth";
import { authBasePath, basePath } from "@/lib/base-path";

interface ProvidersProps {
  children: ReactNode;
  session?: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  useEffect(() => {
    axios.defaults.baseURL = basePath || undefined;
  }, []);

  return (
    <SessionProvider session={session} basePath={authBasePath}>
      {children}
    </SessionProvider>
  );
}
