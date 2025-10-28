import { DateValueType } from "../component/ui/DatePicker";

export interface Division {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Section {
  id: number;
  name: string;
}

export interface categoryManPower {
  id: number;
  name: string;
}

export interface FormType {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  flowSteps?: FlowStep[];
}

export interface FlowStep {
  id: number;
  formTypeId: number;
  order: number;
  role: string;
  departmentId: number | null;
  divisionId: number | null;
  sectionId: number | null;
  createdAt: string;
}

export interface ManPowerTypes {
  category: categoryManPower | null;
  createddate: DateValueType;
  lastWorkingDay: DateValueType;
  dateRequested: DateValueType;
  dateRecommended: DateValueType;
  dateReviewed: DateValueType;
  dateVerified: DateValueType;
  dateApproved: DateValueType;
  division: string;
  department: string;
  section: string;
  designation: string;
  reportingTo: string;
  noRequested: string;
  currentHeadCount: string;
  approvedRequirement: string;
  workLocation: string;
  workStation: string;
  employmentType: string;
  manpowerPlan: string;
  approvedAmp: string;
  keyRequirement: string;
  keyResponsibilities: string;
  reasonOfRequisition: string;
  selectedOption: string;
  incumbentName: string;
  productionVolumeIncrease: string;
  newProject: string;
  machineFaulty: string;
  other: string;
  requestedBy: string;
  recommendedBy: string;
  reviewedBy: string;
  verifiedBy: string;
  approvedby: string;
  fileAttachment?: File | null;
  remarks: string;
}

export interface UserInfo {
  departmentId: number;
  divisionId: number;
  role: string;
  sectionId: number;
  workLocation: string;
  designation?: string
}

export interface fullUserInfo {
  id: number;
  staffid: string;
  email: string;
  fullname: string;
  password: string;
  designation: string;
  departmentId: number;
  divisionId: number;
  role: string;
  sectionId: number;
  workLocation: string;
}

export interface User {
  staffid: string;
  email: string;
  name: string;
}

export interface UserType {
  id: number;
  fullname: string;
  staffid: string;
  email: string;
  division?: Division | null;
  department?: Department | null;
  section?: Section | null;
  designation?: string | null;
  workLocation?: string | null;
  role: string;
}

export interface FormData {
  [key: string]: string | number | boolean | null | string[] | number[];
}

export interface SelfForm {
  id: number;
  formTypeId: number;
  createdById: number;
  status: string;
  totalLevel?: number;
  currentLevel?: number;
  activeLevel?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  formData: FormData | null; // ✅ allows null, matches Prisma JsonValue
  formType: {
    id: number;
    name: string;
    description?: string | null;
    createdAt: string | Date;
  };
  approvals?: {
    id: number;
    formSubmissionId: number;
    approverId: number;
    stepOrder: number;
    status: string;
    remarks?: string | null;
  }[];
}
