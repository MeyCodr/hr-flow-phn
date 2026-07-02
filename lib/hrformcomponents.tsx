import React, { JSX } from "react";
import { FiUserPlus, FiAlertTriangle, FiFileText, FiClipboard, FiShield } from "react-icons/fi";
import ManPowerForm from "@/app/component/form/hr-form/ManPowerRequisition";
import { DynamicFormProps } from "@/app/component/form/hr-form/HrFormsClient";
import GrievanceReport from "@/app/component/form/hr-form/grievance-report/GrievanceReport";
import EmployeeReview from "@/app/component/form/hr-form/employee-review/EmployeeReview";
import SexualHarassmentReportDashboardForm from "@/app/component/form/sexual-harassment-report/SexualHarassmentReportDashboardForm";

export const HrFormComponents: Record<string, React.FC<DynamicFormProps>> = {
  "man-power-requisition": ManPowerForm,
  "grievance-report": GrievanceReport,
  "employee-monthly-performance-review": EmployeeReview,
  "employee-monthly-performance": EmployeeReview,
  "employee-performance-review": EmployeeReview,
  "employee-review": EmployeeReview,
  "monthly-performance-review": EmployeeReview,
  "sexual-harassment-report": SexualHarassmentReportDashboardForm,
};

export const HrFormIcons: Record<string, JSX.Element> = {
  "man-power-requisition": (
    <FiUserPlus className="w-12 h-12 rounded-xl bg-purple-200 text-indigo-800 p-3" />
  ),
  "grievance-report": (
    <FiAlertTriangle className="w-12 h-12 rounded-xl bg-red-200 text-red-800 p-3" />
  ),
  "employee-monthly-performance": (
    <FiClipboard className="w-12 h-12 rounded-xl bg-green-100 text-green-700 p-3" />
  ),
  "sexual-harassment-report": (
    <FiShield className="w-12 h-12 rounded-xl bg-red-200 text-red-800 p-3" />
  ),
  default: (
    <FiFileText className="w-12 h-12 rounded-xl bg-gray-200 text-gray-700 p-3" />
  ),
};