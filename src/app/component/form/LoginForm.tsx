"use client";

import React, { useState } from "react";
import { Input } from "../ui/Input";
import Label from "../ui/Label";
import PrimaryButton from "../ui/PrimaryButton";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface userData {
  staffid: string;
  password: string;
}

interface LoginFormProps {
  onLogin: (data: userData) => void;
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [data, setData] = useState<userData>({ staffid: "", password: "" });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.staffid.trim() && !data.password.trim()) {
      toast.error("Staff ID and Password are required!");
      return;
    }

    if (!data.staffid.trim()) {
      toast.error("Please enter your Staff ID!");
      return;
    }

    if (!data.password.trim()) {
      toast.error("Please enter your Password!");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    onLogin(data);
    setData({ staffid: "", password: "" });
  };

  const handleNavigateToRegister = () => {
    setTimeout(() => router.push("/register"), 400); // wait for exit animation
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="login-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex justify-center items-center min-h-screen font-poppins p-6"
      >
        <div className="text-sm">
          <Toaster position="top-center" />
        </div>

        <div className="flex flex-col space-y-10 w-full justify-center items-center">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="font-bold text-3xl text-center">HR FLOW</h1>
            <p className="text-center text-gray-600">
              Human Resource Forms Management System
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex flex-col space-y-1">
              <h1 className="font-bold text-2xl">Welcome back</h1>
              <p className="text-sm text-gray-400">
                Sign in to your account to continue
              </p>
            </div>

            {/* Form */}
            <form className="mt-10 space-y-6" onSubmit={onSubmit}>
              <div className="flex flex-col space-y-2">
                <Label
                  name="Staff Id"
                  htmlFor="staffid"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="staffid"
                  name="staffid"
                  type="text"
                  value={data.staffid}
                  onChange={handleChange}
                  placeholder="Staff ID"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  name="Password"
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={data.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <PrimaryButton
                name="Sign in"
                type="submit"
                className="border w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all ease-in-out duration-150 cursor-pointer text-center"
              />
            </form>

            <div className="text-sm text-center my-2">
              <p>
                Don&apos;t have an account?{" "}
                <span
                  onClick={handleNavigateToRegister}
                  className="text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Sign up
                </span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export { LoginForm };
