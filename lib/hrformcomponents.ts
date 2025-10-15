import ManPowerForm from "@/app/component/form/hr-form/ManPowerRequisition";
import { DynamicFormProps } from "@/app/component/form/hr-form/HrFormsClient";

export const HrFormComponents: Record<string, React.FC<DynamicFormProps>> = {
  "man-power-requisition": ManPowerForm,
};