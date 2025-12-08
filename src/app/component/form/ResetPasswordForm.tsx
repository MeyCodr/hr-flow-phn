"use client";

import React, { useState } from "react";
import { Input } from "../ui/Input";
import Label from "../ui/Label";
import PrimaryButton from "../ui/PrimaryButton";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

export interface Password {
  password: string;
  cpassword: string;
}

interface ResetPasswordFormProps {
  resetPassword: (password: Password) => void;
}

function ResetPasswordForm({ resetPassword }: ResetPasswordFormProps) {
  const [data, setData] = useState<Password>({ password: "", cpassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validations
    if (!data.password.trim()) {
      toast.error("Please enter your Password!");
      return;
    }

    if (!data.cpassword.trim()) {
      toast.error("Please enter your confirm password!");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    if (data.password !== data.cpassword) {
      toast.error("Password and confirm password are not the same!");
      return;
    }

    // Call the reset password function with password data
    resetPassword(data);
    setData({ password: "", cpassword: "" });
  };

  return (
    <motion.div
      key="reset-password-page"
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
        {/* Reset Password Card */}
        <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl">Reset Password</h1>
          </div>

          {/* Form */}
          <form className="mt-10 space-y-6" onSubmit={onSubmit}>
            {/* Password */}
            <div className="flex flex-col space-y-2 relative">
              <Label
                name="Password"
                htmlFor="password"
                className="text-sm font-medium text-gray-900"
              />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full border border-gray-300 rounded-sm py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col space-y-2 relative">
              <Label
                name="Confirm Password"
                htmlFor="cpassword"
                className="text-sm font-medium text-gray-900"
              />
              <Input
                id="cpassword"
                name="cpassword"
                type={showCPassword ? "text" : "password"}
                value={data.cpassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full border border-gray-300 rounded-sm py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCPassword(!showCPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showCPassword ? (
                  <IoEyeOffOutline size={18} />
                ) : (
                  <IoEyeOutline size={18} />
                )}
              </button>
            </div>

            <PrimaryButton
              name="Reset"
              type="submit"
              className="border w-full text-sm py-2 bg-indigo-800 text-white rounded-md hover:bg-indigo-700 transition-all ease-in-out duration-150 cursor-pointer text-center"
            />
          </form>
        </div>
      </div>
    </motion.div>
  );
}

export { ResetPasswordForm };
