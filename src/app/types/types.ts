import { Prisma } from "@prisma/client";
import { DateValueType } from "../component/ui/DatePicker";
import { Approval } from "../component/approval/ApprovalComponent";

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
  selectedReasons: string[];
  divisionName?: string;
  departmentName?: string;
  sectionName?: string;
}

export interface GrievanceReportTypes {
  fullname: string;
  contactNo: string;
  staffId: string;
  designation: string;
  dateOfComplaint: DateValueType;
  division: string;
  department: string;
  section: string;
  complaintTypes: string;
  others: string;
  detailComplaints: string;
  attemptsResolve: string;
  preferredOutcome: string;
  supportEvidence: File | null;
  declaration: boolean;
  remarks: string;
  divisionName?: string;
  departmentName?: string;
  sectionName?: string;
}

export interface UserInfo {
  departmentId: number;
  divisionId: number;
  role: string;
  sectionId: number;
  workLocation: string;
  designation?: string;
  fullname: string;
  staffid: string;
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
  attachment?: string | null;
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

export interface ApprovalUser {
  id: number;
  submissionId: number;
  approverId: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WAITING";
  remarks?: string | null;
  approvedAt?: string | Date | null;
  stepOrder: number;
  approver?: User;
}

export interface FormSubmissionType {
  id: number;
  formTypeId: number;
  formType: FormType;
  createdBy: UserType;
  status: string;
  formData: Prisma.JsonValue | null;
  // attachments?: string | null;
  approvals: Approval[];
  createdAt: string | Date;
  attachments: {
    fileName: string;
    filePath: string;
    fileType: string;
    formSubmissionId: number;
    id: number;
    uploadedAt: Date;
  }[];
}

export interface SelfFormData {
  id: number;
  formTypeId: number;
  formType: {
    name: string;
  };
  approvals: Approval[];
  createdBy: {
    staffid: string;
    email: string;
    fullname: string;
  };
  departmentName?: string;
  divisionName?: string;
  sectionName?: string;
  // formData: ManPowerTypes;
  formData: Prisma.JsonValue | null;
  createdAt: string | Date;
  status: string;
  attachments: {
    fileName: string;
    filePath: string;
    fileType: string;
    formSubmissionId: number;
    id: number;
    uploadedAt: Date;
  }[];
}
