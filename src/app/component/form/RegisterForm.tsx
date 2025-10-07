"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import PrimaryButton from "../ui/PrimaryButton";
import Label from "../ui/Label";
import toast, { Toaster } from "react-hot-toast";
import { Input } from "../ui/Input";
import { useRouter } from "next/navigation";

export interface RegisterUser {
  designation: string;
  staffid: string;
  fullname: string;
  email: string;
  password: string;
  division: string;
  department: string;
  section: string;
  worklocation: string;
}

interface RegisterFormProps {
  onRegister: (data: RegisterUser) => void;
}

function RegisterForm({ onRegister }: RegisterFormProps) {
  const [data, setData] = useState<RegisterUser>({
    staffid: "",
    fullname: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    division: "",
    section: "",
    worklocation: "",
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !data.staffid ||
      !data.email ||
      !data.password ||
      !data.fullname ||
      !data.department ||
      !data.designation ||
      !data.division ||
      !data.section
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    onRegister(data);
    setData({
      staffid: "",
      email: "",
      department: "",
      fullname: "",
      password: "",
      designation: "",
      division: "",
      section: "",
      worklocation: "",
    });
  };

  const handleNavigateToLogin = () => {
    setTimeout(() => router.push("/login"), 400); // Wait for animation
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="register-page"
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
              Register and start using this management system
            </p>
          </div>

          {/* Card */}
          <div className="bg-white p-10 rounded-lg shadow-lg max-w-xl w-full">
            <div className="flex flex-col space-y-1">
              <h1 className="font-bold text-2xl">Create account</h1>
              <p className="text-sm text-gray-400">
                Enter your details to get started
              </p>
            </div>

            <form className="mt-10 space-y-6" method="POST" onSubmit={onSubmit}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                {/* Staff ID */}
                <div className="flex flex-col space-y-2">
                  <Label
                    name="Staff Id"
                    htmlFor="staffid"
                    className={"text-sm font-medium text-gray-900"}
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

                {/* Work Email */}
                <div className="flex flex-col space-y-2">
                  <Label
                    name="Work Email"
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={handleChange}
                    placeholder="@phn.com.my"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Full Name - spans both columns */}
                <div className="col-span-2 flex flex-col space-y-2">
                  <Label
                    name="Full Name"
                    htmlFor="fullname"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <Input
                    id="fullname"
                    name="fullname"
                    type="text"
                    value={data.fullname}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Password */}
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

                {/* Designation */}
                <div className="flex flex-col space-y-2">
                  <Label
                    name="Designation"
                    htmlFor="designation"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <Input
                    id="designation"
                    name="designation"
                    type="text"
                    value={data.designation}
                    onChange={handleChange}
                    placeholder="Designation"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Department - spans both columns */}
                <div className="col-span-2 flex flex-col space-y-2">
                  <Label
                    name="Division"
                    htmlFor="division"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <Input
                    id="division"
                    name="division"
                    type="text"
                    value={data.division}
                    onChange={handleChange}
                    placeholder="Choose division . . ."
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2 flex flex-col space-y-2">
                  <Label
                    name="Department"
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    value={data.department}
                    onChange={handleChange}
                    placeholder="Choose department . . ."
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className=" flex flex-col space-y-2">
                  <Label
                    name="Section"
                    htmlFor="section"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <Input
                    id="section"
                    name="section"
                    type="text"
                    value={data.section}
                    onChange={handleChange}
                    placeholder="Choose section . . ."
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className=" flex flex-col space-y-2">
                  <Label
                    name="Work Location"
                    htmlFor="worklocation"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <Input
                    id="worklocation"
                    name="worklocation"
                    type="text"
                    value={data.worklocation}
                    onChange={handleChange}
                    placeholder="Choose work location . . ."
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <PrimaryButton
                name="Sign up"
                type="submit"
                className="border w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all ease-in-out duration-150 cursor-pointer"
              />
            </form>

            <div className="text-sm text-center my-2">
              <p>
                Already have an account?{" "}
                <span
                  onClick={handleNavigateToLogin}
                  className="text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Sign in
                </span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export { RegisterForm };
