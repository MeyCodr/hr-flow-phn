"use client";

import React from "react";
import SexualHarassmentReportForm from "./SexualHarassmentReportForm";
import { DynamicFormProps } from "../hr-form/HrFormsClient";

export default function SexualHarassmentReportDashboardForm({
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
  user,
}: DynamicFormProps) {
  return (
    <SexualHarassmentReportForm
      divisions={divisions}
      departments={departments}
      sections={sections}
      setSelectedDivision={setSelectedDivision}
      setSelectedDepartment={setSelectedDepartment}
      user={user}
    />
  );
}
