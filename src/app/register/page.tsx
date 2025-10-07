"use client";

import React, { useEffect, useState } from "react";
import { RegisterForm, RegisterUser } from "../component/form/RegisterForm";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import LoadingScreen from "../component/ui/LoadingScreen";

export default function Register() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      return;
    }
    setLoading(true);
    router.push("/");
  }, [session]);

  const handleSubmit = async (values: RegisterUser) => {
    console.log("values: ", values);

    const toastId = toast.loading("Creating account . . .");
    setLoading(true);

    try {
      const response = await axios.post(`/api/user`, values);
      console.log("response: ", response);
      if (response.status === 201) {
        toast.success("Account created!", { id: toastId });

        const loginResult = await signIn("credentials", {
          redirect: false,
          staffid: values.staffid,
          password: values.password,
        });

        if (loginResult?.error) {
          toast.error("Failed to login!", { id: toastId });
          router.push(`/login`);
        } else {
          router.push(`/`);
        }
      }
    } catch (error: unknown) {
      console.error(error);

      let errorMessage = "Failed to create account!";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || errorMessage;
      }

      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 min-h-screen w-full">
      <div className="text-sm">
        <Toaster position="top-center" />
      </div>
      <RegisterForm onRegister={handleSubmit} />
      <LoadingScreen show={loading} />
    </div>
  );
}
