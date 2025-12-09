"use client";

import React, { useState } from "react";
import { Input } from "../ui/Input";
import Label from "../ui/Label";
import PrimaryButton from "../ui/PrimaryButton";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import ActionModal from "../ui/ActionModal";

interface userData {
  staffid: string;
  password: string;
}

interface LoginFormProps {
  onLogin: (data: userData) => void;
  sendPassword: (email: string) => void;
}

function LoginForm({ onLogin, sendPassword }: LoginFormProps) {
  const [data, setData] = useState<userData>({ staffid: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let newValue = value;
    if (name === "staffid") {
      newValue = value.toUpperCase();
    }
    setData((prev) => ({ ...prev, [name]: newValue }));
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

  const onSend = (email: string) => {
    if (!email.trim()) {
      toast.error("Please enter your email address!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email!");
      return;
    }

    sendPassword(email);
    setOpen(false);
  };

  return (
    <>
      <motion.div
        key="login-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex justify-center items-center min-h-screen font-poppins p-6"
      >
        <div className="text-xs">
          <Toaster position="top-center" />
        </div>

        <div className="flex flex-col space-y-10 w-full justify-center items-center">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="font-bold text-3xl text-center">HR FMS</h1>
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
              {/* Staff ID */}
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
                  value={data.staffid.toUpperCase()}
                  onChange={handleChange}
                  placeholder="Staff ID"
                  className="w-full border border-gray-300 rounded-sm py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Password with Toggle */}
              <div className="flex flex-col space-y-2 relative">
                <Label
                  name="Password"
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-sm py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                />
                {/* Eye toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <IoEyeOffOutline size={18} />
                  ) : (
                    <IoEyeOutline size={18} />
                  )}
                </button>
                <p
                  onClick={() => setOpen(true)}
                  className="flex justify-end text-xs text-indigo-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </p>
              </div>

              <PrimaryButton
                name="Sign in"
                type="submit"
                className="border w-full text-sm py-2 bg-indigo-800 text-white rounded-md hover:bg-indigo-700 transition-all ease-in-out duration-150 cursor-pointer text-center"
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

      <ActionModal
        title="Forgot Password"
        isOpen={open}
        inputLabel="Email Address"
        inputPlaceholder="Password will be send to this email ..."
        inputType="text"
        message=""
        confirmText="Send"
        onConfirm={onSend}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export { LoginForm };
