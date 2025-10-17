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
}

export interface fullUserInfo {
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