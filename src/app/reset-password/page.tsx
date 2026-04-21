"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import LoadingScreen from "../component/ui/LoadingScreen";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { withBasePath } from "@/lib/base-path";
import {
  Password,
  ResetPasswordForm,
} from "../component/form/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingScreen show={true} />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const search = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    router.push("/");
  }, [session, router]);

  const resetPassword = async (values: Password) => {
    setLoading(true);
    const token = search.get("token");
    if (!token) return;

    try {
      const res = await axios.put(
        withBasePath(`/api/user/forget-password/${token}`),
        values,
      );
      if (res.status === 200) {
        toast.success("Password has been reset!");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast.error("Unable to reset password. Please contact your admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 min-h-screen w-full">
      <ResetPasswordForm resetPassword={resetPassword} />
      <LoadingScreen show={loading} />
    </div>
  );
}
