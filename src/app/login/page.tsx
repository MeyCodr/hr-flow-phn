"use client";

import React, { useEffect, useState } from "react";
import { LoginForm } from "../component/form/LoginForm";
import { signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import LoadingScreen from "../component/ui/LoadingScreen";
import { useRouter } from "next/navigation";
import axios from "axios";
import { withBasePath } from "@/lib/base-path";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    router.push("/");
  }, [session, router]);

  const handleLogin = async (values: { staffid: string; password: string }) => {
    let toastId = "";
    try {
      toastId = toast.loading("Sign in . . .");
      setLoading(true);
      const res = await signIn("credentials", {
        redirect: false,
        staffid: values.staffid,
        password: values.password,
      });

      if (res?.error) {
        toast.error("Invalid Staff id or password!", { id: toastId });
      } else {
        toast.success("Login successful", { id: toastId });
      }
    } catch (error) {
      toast.error("Something went wrong", { id: toastId });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordLogin = async (email: string) => {
    try {
      const res = await axios.post(withBasePath("/api/user/forget-password"), {
        email,
      });
      if (res.status === 200) {
        toast.success("Password has been sent to your email");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed Request. Please contact an admin!");
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 min-h-screen w-full">
      <LoginForm onLogin={handleLogin} sendPassword={sendPasswordLogin} />
      <LoadingScreen show={loading} />
    </div>
  );
}
