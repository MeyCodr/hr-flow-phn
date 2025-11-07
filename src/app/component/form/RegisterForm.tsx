"use client";

import { motion } from "framer-motion";
import React, { SetStateAction, useState } from "react";
import PrimaryButton from "../ui/PrimaryButton";
import Label from "../ui/Label";
import toast, { Toaster } from "react-hot-toast";
import { Input } from "../ui/Input";
import { useRouter } from "next/navigation";
import { Department, Division, Section } from "@/app/types/types";
import ComboBox from "../ui/ComboBox";
import { workLocation } from "../../../../lib/data";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

export interface RegisterUser {
  designation: string;
  staffid: string;
  fullname: string;
  email: string;
  password: string;
  division: string;
  department: string;
  section: string;
  workLocation: string;
}

interface RegisterFormProps {
  onRegister: (data: RegisterUser) => void;
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  setSelectedDivision: React.Dispatch<SetStateAction<string>>;
  setSelectedDepartment: React.Dispatch<SetStateAction<string>>;
  setSelectedSection: React.Dispatch<SetStateAction<string>>;
  setSelectedWorkLocation: React.Dispatch<SetStateAction<string>>;
}

function RegisterForm({
  onRegister,
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
  setSelectedSection,
  setSelectedWorkLocation,
}: RegisterFormProps) {
  const [data, setData] = useState<RegisterUser>({
    staffid: "",
    fullname: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    division: "",
    section: "",
    workLocation: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let newValue = value;

    // Apply uppercase only for specific fields
    if (name === "fullname" || name === "designation" || name === "staffid") {
      newValue = value.toUpperCase();
    }

    if (name === "email") {
      newValue = value.toLowerCase();
    }
    setData((prev) => ({ ...prev, [name]: newValue }));
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
      workLocation: "",
    });
  };

  const handleNavigateToLogin = () => {
    setTimeout(() => router.push("/login"), 400); // Wait for animation
  };

  const addDashOption = (menu: { id: number; name: string }[]) => {
    if (!menu.some((item) => item.name === "-")) {
      return [{ id: 0, name: "-" }, ...menu];
    }
    return menu;
  };

  return (
    <>
      <motion.div
        key="register-page"
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
                    value={data.staffid.toUpperCase()}
                    onChange={handleChange}
                    placeholder="Staff ID"
                    className="w-full border border-gray-300 rounded-sm py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full border border-gray-300 rounded-sm py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    value={data.fullname.toUpperCase()}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full border border-gray-300 rounded-sm py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Password */}
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
                    value={data.designation.toUpperCase()}
                    onChange={handleChange}
                    placeholder="Designation"
                    className="w-full border border-gray-300 rounded-sm py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Department - spans both columns */}
                <div className="col-span-2 flex flex-col space-y-2">
                  <Label
                    name="Division"
                    htmlFor="division"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <ComboBox
                    menu={divisions}
                    selectedValue={data.division}
                    onSelect={(item) => {
                      // if "-" selected, use "0"
                      const value = item ? item.id.toString() : "0";
                      setSelectedDivision(value);
                      setSelectedDepartment("0");
                      setSelectedSection("0");
                      setData((prev) => ({
                        ...prev,
                        division: value,
                        department: "0",
                        section: "0",
                      }));
                    }}
                  />
                </div>
                <div className="col-span-2 flex flex-col space-y-2">
                  <Label
                    name="Department"
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <ComboBox
                    menu={addDashOption(departments)}
                    selectedValue={data.department}
                    onSelect={(item) => {
                      const value = item ? item.id.toString() : "0";
                      setSelectedDepartment(value);
                      setSelectedSection("0");
                      setData((prev) => ({
                        ...prev,
                        department: value,
                        section: "0",
                      }));
                    }}
                  />
                </div>
                <div className=" flex flex-col space-y-2">
                  <Label
                    name="Section"
                    htmlFor="section"
                    className="block text-sm font-medium text-gray-900"
                  />
                  <ComboBox
                    menu={addDashOption(sections)}
                    selectedValue={data.section}
                    onSelect={(item) => {
                      const value = item ? item.id.toString() : "0";
                      setSelectedSection(value);
                      setData((prev) => ({ ...prev, section: value }));
                    }}
                  />
                </div>
                <div className=" flex flex-col space-y-2">
                  <Label
                    name="Work Location"
                    htmlFor="workLocation "
                    className="block text-sm font-medium text-gray-900"
                  />
                  <ComboBox
                    menu={workLocation}
                    selectedValue={data.workLocation}
                    onSelect={(item) => {
                      const value = item ? item.name : "";
                      setSelectedWorkLocation(value);
                      setData((prev) => ({ ...prev, workLocation: value }));
                    }}
                  />
                </div>
              </div>

              <PrimaryButton
                name="Sign up"
                type="submit"
                className="border w-full py-2 text-sm bg-indigo-800 text-white rounded-sm hover:bg-indigo-700 transition-all ease-in-out duration-150 cursor-pointer"
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
    </>
  );
}

export { RegisterForm };
