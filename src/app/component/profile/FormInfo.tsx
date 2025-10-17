"use client";

import React, { useEffect, useState } from "react";
import Label from "../ui/Label";
import { Input } from "../ui/Input";
import { RegisterUser } from "../form/RegisterForm";
import ComboBox from "../ui/ComboBox";
import PrimaryButton from "../ui/PrimaryButton";
import { workLocation } from "../../../../lib/data";
import { PersonalInfoType } from "./PersonalInfo";
import axios from "axios";
import { fullUserInfo } from "@/app/types/types";
import LoadingScreen from "../ui/LoadingScreen";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

function FormInfo({
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
  setSelectedSection,
  setSelectedWorkLocation,
  user,
}: PersonalInfoType) {
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
  const [userInfo, setUserInfo] = useState<fullUserInfo>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }
    const staffid = user.staffid;
    console.log("staffid: ", staffid);

    if (!staffid) {
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/user/${staffid}`);
        console.log("res: ", res.data.data);
        const userInfo = res.data.data;
        setUserInfo(userInfo);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching user:", error.message);
        } else {
          console.error("Unknown error fetching user:", error);
        }
      }
    };

    fetchUser();
  }, [user]);

  useEffect(() => {
    if (!userInfo) return;

    setData((prev) => ({
      ...prev,
      division: userInfo.divisionId ? userInfo.divisionId.toString() : "",
      department: userInfo.departmentId ? userInfo.departmentId.toString() : "",
      section: userInfo.sectionId ? userInfo.sectionId.toString() : "",
      workLocation: userInfo.workLocation.toString() || "",
      staffid: userInfo.staffid.toString().toUpperCase() || "",
      email: userInfo.email.toString() || "",
      fullname: userInfo.fullname.toString().toUpperCase() || "",
      password: userInfo.password.toString() || "",
      designation: userInfo.designation.toString().toUpperCase() || "",
    }));

    if (userInfo.divisionId)
      setSelectedDivision(userInfo.divisionId.toString());
    if (userInfo.departmentId)
      setSelectedDepartment(userInfo.departmentId.toString());
    if (userInfo.sectionId) setSelectedSection(userInfo.sectionId.toString());
    if (userInfo.workLocation)
      setSelectedWorkLocation(userInfo.workLocation.toString());
  }, [
    userInfo,
    setSelectedDivision,
    setSelectedDepartment,
    setSelectedSection,
    setSelectedWorkLocation,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const addDashOption = (menu: { id: number; name: string }[]) => {
    if (!menu.some((item) => item.name === "-")) {
      return [{ id: 0, name: "-" }, ...menu];
    }
    return menu;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    console.log("data staff id: ", data);
    const toastId = "";

    try {
      const res = await axios.put(`/api/user/${data.staffid}`, data);
      if (res.status === 200) {
        toast.success("Information has been updated", { id: toastId });

        // ✅ manually re-fetch the updated user info
        const updatedRes = await axios.get(`/api/user/${data.staffid}`);
        setUserInfo(updatedRes.data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error ||
            error.message ||
            "Something went wrong",
          { toasterId: toastId }
        );
      } else if (error instanceof Error) {
        toast.error(error.message, { toasterId: toastId });
      } else {
        toast.error("An unexpected error occurred", { toasterId: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-sm">
        <Toaster position="top-right" />
      </div>
      <LoadingScreen show={loading} />
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
              disabled
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
          name="Save Changes"
          type="submit"
          className="border px-6 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all ease-in-out duration-150 cursor-pointer"
        />
      </form>
    </>
  );
}

export default FormInfo;
