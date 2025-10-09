import ManPowerForm from "@/app/component/form/hr-form/ManPowerRequisition";
import { DynamicFormProps } from "@/app/dashboard/forms/hr-forms/page";

export const HrFormComponents: Record<string, React.FC<DynamicFormProps>> = {
  "man-power-requisition": ManPowerForm,
};