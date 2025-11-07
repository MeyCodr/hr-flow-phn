import ManPowerForm from "@/app/component/form/hr-form/ManPowerRequisition";
import { DynamicFormProps } from "@/app/component/form/hr-form/HrFormsClient";
import GrievanceReport from "@/app/component/form/hr-form/grievance-report/GrievanceReport";

export const HrFormComponents: Record<string, React.FC<DynamicFormProps>> = {
  "man-power-requisition": ManPowerForm,
  "grievance-report" : GrievanceReport,
};