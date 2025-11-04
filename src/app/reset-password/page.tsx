"use client";

import React, { useEffect, useState } from "react";
import { LoginForm } from "../component/form/LoginForm";
import { signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import LoadingScreen from "../component/ui/LoadingScreen";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Password,
  ResetPasswordForm,
} from "../component/form/ResetPasswordForm";

export default function ResetPassword() {
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
    console.log("values: ", values);
    setLoading(true);
    const token = search.get("token");
    if (!token) return;

    try {
      const res = await axios.put(`/api/user/forget-password/${token}`, values);
      if (res.status === 200) {
        toast.success("Password has been reset!");
        setTimeout(() => {
            router.push('/');
        }, 1000);
      }
    } catch (error) {
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
