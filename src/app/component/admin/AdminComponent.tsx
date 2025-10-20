"use client";

import React, { useEffect, useState } from "react";
import { TabItem } from "../ui/Tabs";
import UserListing from "./UserListing";
import { Department, Division, Section, UserType } from "@/app/types/types";
import axios from "axios";
import FormTypeComponent from "./FormTypeComponent";
import { ApprovalFlowStep, FormType } from "@prisma/client";
import dynamic from "next/dynamic";
import ApprovalFlow from "./ApprovalFlow";

const Tabs = dynamic(() => import("../ui/Tabs"), { ssr: false });

interface AdminComponentProps {
  userListing: UserType[];
  formType: FormType[];
  approvalStep: ApprovalFlowStep[];
}

export default function AdminComponent({
  userListing,
  formType,
  approvalStep
}: AdminComponentProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  // state for selection (for filtering)
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  useEffect(() => {
    axios
      .get("/api/division")
      .then((res) => setDivisions(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      axios
        .get(`/api/department?divisionId=${selectedDivision}`)
        .then((res) => setDepartments(res.data))
        .catch(console.error);
    } else {
      setDepartments([]);
      setSections([]);
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDepartment) {
      axios
        .get(`/api/section?departmentId=${selectedDepartment}`)
        .then((res) => setSections(res.data))
        .catch(console.error);
    } else {
      setSections([]);
    }
  }, [selectedDepartment]);

  console.log("approvalStep2: ", approvalStep);

  const categories: TabItem[] = [
    { name: "Form Create", content: <FormTypeComponent formType={formType} /> },
    {
      name: "Approval Flow",
      content: <ApprovalFlow approvalStep={approvalStep}/> ,
    },
    {
      name: "User Listing",
      content: (
        <UserListing
          userListing={userListing}
          divisions={divisions}
          departments={departments}
          sections={sections}
          setSelectedDivision={setSelectedDivision}
          setSelectedDepartment={setSelectedDepartment}
        />
      ),
    },
  ];
  return (
    <div className="my-6">
      <Tabs tabs={categories} />
    </div>
  );
}
