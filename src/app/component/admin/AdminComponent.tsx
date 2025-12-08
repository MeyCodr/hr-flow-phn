"use client";

import React, { useEffect, useState } from "react";
import { TabItem } from "../ui/Tabs";
import UserListing from "./user/UserListing";
import {
  Department,
  Division,
  Section,
  SelfFormData,
  UserType,
} from "@/app/types/types";
import axios from "axios";
import FormTypeComponent from "./form-type/FormTypeComponent";
import { FormType } from "@prisma/client";
import dynamic from "next/dynamic";
import ApprovalFlow, { ApprovalFlowStep } from "./approval/ApprovalFlow";
import { motion, Variants } from "framer-motion";
import FormSubmission from "./form-submission/FormSubmission";

const Tabs = dynamic(() => import("../ui/Tabs"), { ssr: false });

interface AdminComponentProps {
  userListing: UserType[];
  formType: FormType[];
  approvalStep: ApprovalFlowStep[];
  formSubmission: SelfFormData[];
}

export default function AdminComponent({
  userListing,
  formType,
  approvalStep,
  formSubmission,
}: AdminComponentProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
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

  // Motion variants for tab content
  const tabContentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const categories: TabItem[] = [
    {
      name: "Form Create",
      content: (
        <motion.div
          key="form-create"
          initial="hidden"
          animate="visible"
          variants={tabContentVariants}
        >
          <FormTypeComponent formType={formType} />
        </motion.div>
      ),
    },
    {
      name: "Approval Flow",
      content: (
        <motion.div
          key="approval-flow"
          initial="hidden"
          animate="visible"
          variants={tabContentVariants}
        >
          <ApprovalFlow
            approvalStep={approvalStep}
            formType={formType}
            divisions={divisions}
            departments={departments}
            sections={sections}
            setSelectedDivision={setSelectedDivision}
            setSelectedDepartment={setSelectedDepartment}
          />
        </motion.div>
      ),
    },
    {
      name: "User Listing",
      content: (
        <motion.div
          key="user-listing"
          initial="hidden"
          animate="visible"
          variants={tabContentVariants}
        >
          <UserListing
            userListing={userListing}
            divisions={divisions}
            departments={departments}
            sections={sections}
            setSelectedDivision={setSelectedDivision}
            setSelectedDepartment={setSelectedDepartment}
          />
        </motion.div>
      ),
    },
    {
      name: "Form Submission",
      content: (
        <motion.div
          key="form-submission"
          initial="hidden"
          animate="visible"
          variants={tabContentVariants}
        >
          <FormSubmission
            formSubmission={formSubmission}
          />
        </motion.div>
      ),
    },
  ];

  return (
    <div className="my-6">
      <Tabs tabs={categories} />
    </div>
  );
}
