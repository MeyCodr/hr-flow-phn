"use client";

import React, { useEffect, useState } from "react";
import PrimaryButton from "../../ui/PrimaryButton";
import { IoReturnDownBack } from "react-icons/io5";
import Label from "../../ui/Label";
import { Input } from "../../ui/Input";
import ComboBox from "../../ui/ComboBox";
import {
  Department,
  Division,
  FormType,
  Section,
  UserType,
} from "@/app/types/types";
import { roles } from "../../../../../lib/data";
import { Role } from "@/generated/client";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { ApprovalFlowStep } from "./ApprovalFlow";
import MultiComboBox from "../../ui/MultiComboBox";
import { withBasePath } from "@/lib/base-path";

interface ApprovalFlowFormProps {
  handleBack?: () => void;
  onUpdate?: () => void;
  formType: FormType[];
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  setSelectedDivision: (id: string) => void;
  setSelectedDepartment: (id: string) => void;
  selectedStep?: ApprovalFlowStep | null;
}

export default function ApprovalFlowForm({
  handleBack,
  onUpdate,
  formType,
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
  selectedStep,
}: ApprovalFlowFormProps) {
  const [data, setData] = useState({
    formTypeId: "",
    order: "",
    role: "",
    division: "",
    department: "",
    section: "",
    approver: [] as string[],
  });
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const styleLink = `flex flex-col gap-y-2`;

  useEffect(() => {
    if (selectedStep) {
      setData({
        formTypeId: selectedStep.formTypeId.toString(),
        order: selectedStep.order.toString(),
        role: selectedStep.role,
        division: selectedStep.divisionId
          ? selectedStep.divisionId.toString()
          : "",
        department: selectedStep.department
          ? selectedStep.department.name.toString()
          : "",
        section: selectedStep.section
          ? selectedStep.section.name.toString()
          : "",
        approver: selectedStep.approvalStepApprovers
          ? selectedStep.approvalStepApprovers.map((a) => a.user.id.toString())
          : [],
      });
    }
  }, [selectedStep]);

  useEffect(() => {
    const getAllUser = async () => {
      const res = await axios.get(withBasePath("/api/user"));
      setUsers(res.data);
    };

    getAllUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = selectedStep
      ? withBasePath(`/api/approval-flow/${selectedStep.id}`)
      : withBasePath(`/api/approval-flow`);
    const method = selectedStep ? axios.put : axios.post;
    setLoading(true);
    try {
      await method(url, data);
      if (method === axios.put) {
        toast.success("Approval Flow Step updated successfully");
      } else {
        toast.success("Approval Flow Step added successfully"); // ✅ no id
      }
      if (onUpdate) onUpdate();

      setTimeout(() => {
        if (handleBack) handleBack();
      }, 1000);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error adding Approval Flow Step"); // ✅ no id
    } finally {
      setLoading(false);
    }
  };

  const addDashOption = (menu: { id: number; name: string }[]) => {
    if (!menu.some((item) => item.name === "-")) {
      return [{ id: 0, name: "-" }, ...menu];
    }
    return menu;
  };

  return (
    <>
      <div className="text-xs">
        <Toaster position="top-right" />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Add Approval Step
          </h2>
          <PrimaryButton
            name="Back to list"
            icon={<IoReturnDownBack className="w-5 h-5" />}
            onClick={handleBack}
            className="text-indigo-900 hover:text-indigo-500 text-xs font-medium cursor-pointer"
          />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className={styleLink}>
            <Label
              name="Form Type"
              htmlFor="formType"
              className="block text-sm font-medium text-gray-900"
            />
            <ComboBox
              menu={formType.map((f) => ({
                id: f.id.toString(),
                name: f.name,
              }))}
              onSelect={(item) => {
                setData((prev) => ({
                  ...prev,
                  formTypeId: item ? item.id.toString() : "",
                }));
              }}
              selectedValue={data.formTypeId}
            />
          </div>

          <div className={styleLink}>
            <Label
              name="Order"
              htmlFor="order"
              className="block text-sm font-medium text-gray-900"
            />
            <Input
              id="order"
              name="order"
              type="number"
              placeholder="Order"
              value={data.order}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className={styleLink}>
            <Label
              name="Roles"
              htmlFor="role"
              className="block text-sm font-medium text-gray-900"
            />
            <ComboBox
              menu={roles}
              onSelect={(item) => {
                setData((prev) => ({
                  ...prev,
                  role: item?.id as Role, // cast to Role type
                }));
              }}
              selectedValue={data.role}
            />
          </div>

          <div className={styleLink}>
            <Label
              name="Division"
              htmlFor="division"
              className="block text-sm font-medium text-gray-900"
            />
            <ComboBox
              menu={addDashOption(divisions)}
              onSelect={(item) => {
                const divisionId = item ? item.id.toString() : "";
                setData((prev) => ({
                  ...prev,
                  division: divisionId,
                  department: "",
                  section: "",
                }));
                setSelectedDivision(divisionId); // ✅ trigger parent handler
              }}
              selectedValue={data.division}
            />
          </div>
          <div className={styleLink}>
            <Label
              name="Department"
              htmlFor="department"
              className="block text-sm font-medium text-gray-900"
            />
            <ComboBox
              menu={addDashOption(departments)}
              onSelect={(item) => {
                const departmentId = item ? item.id.toString() : "";
                setData((prev) => ({
                  ...prev,
                  department: departmentId,
                  section: "",
                }));
                setSelectedDepartment(departmentId);
              }}
              selectedValue={data.department}
            />
          </div>

          <div className={styleLink}>
            <Label
              name="Section"
              htmlFor="section"
              className="block text-sm font-medium text-gray-900"
            />
            <ComboBox
              menu={addDashOption(sections)}
              onSelect={(item) => {
                const sectionId = item ? item.id.toString() : "";
                setData((prev) => ({
                  ...prev,
                  section: sectionId,
                }));
              }}
              selectedValue={data.section}
            />
          </div>

          <div className={styleLink}>
            <Label
              name="Approver"
              htmlFor="approver"
              className="block text-sm font-medium text-gray-900"
            />
            <MultiComboBox
              menu={users.map((i) => ({ id: i.id, name: i.fullname }))}
              selectedValues={data.approver}
              onSelect={(items) => {
                setData((prev) => ({
                  ...prev,
                  approver: items.map((i) => i.id.toString()),
                }));
              }}
            />
          </div>

          <div className="flex justify-end">
            <PrimaryButton
              name={loading ? "Saving..." : "Save"}
              type="submit"
              disabled={loading}
              className="bg-indigo-800 max-w-3xs flex text-xs cursor-pointer text-white px-4 py-2 rounded-sm hover:bg-indigo-700"
            />
          </div>
        </form>
      </div>
    </>
  );
}
