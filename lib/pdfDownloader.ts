import { ApprovalUser, ManPowerTypes } from "@/app/types/types";
import { Prisma } from "@/generated/client";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

export interface FormPDFData {
  formTypeId: number;
  formType: string;
  // formData: Prisma.JsonValue | null;
  formData: Prisma.InputJsonValue | null;
  departmentName: string;
  divisionName: string;
  sectionName: string;
  createdBy: {
    fullname: string;
    staffid: string;
    email: string;
    createdAt?: string | Date;
  };
  approvals: ApprovalUser[];
}

const logoUrl = "/company-logo-phn.png";

const loadImage = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

const generateManPowerPDF = (doc: jsPDF, data: FormPDFData) => {
  console.log("data", data);
  const {
    formData,
    departmentName,
    divisionName,
    sectionName,
    createdBy,
    approvals,
  } = data;

  const digitalSignedRow: string[] = new Array(6).fill("");
  digitalSignedRow[0] = "Digital Signed";

  approvals.forEach((a) => {
    const index = a.stepOrder;
    if (index >= 1 && index <= 5) {
      digitalSignedRow[index] = a.status === "APPROVED" ? "Digital Signed" : "";
    }
  });

  const approverNames: string[] = new Array(6).fill("");
  const parsedFormData = formData as unknown as ManPowerTypes | null;

  approvals.forEach((a) => {
    const index = a.stepOrder; // stepOrder 1 goes to index 1

    if (index >= 1 && index < 6) {
      approverNames[index] =
        a.status === "APPROVED" ? a.approver?.name || "-" : "";
    }
  });

  approverNames[0] = createdBy.fullname || "-";

  // Dates row
  const approverDates: string[] = new Array(6).fill("");

  // Requested by date (index 0)
  approverDates[0] = parsedFormData?.createddate
    ? new Date(parsedFormData.createddate).toLocaleDateString("en-GB")
    : "-";

  // Approver dates
  approvals.forEach((a) => {
    const index = a.stepOrder; // stepOrder: 1..5 for approvers
    if (index >= 1 && index <= 5) {
      approverDates[index] = a.approvedAt
        ? new Date(a.approvedAt).toLocaleDateString("en-GB")
        : "";
    }
  });

  const finalStatus = approvals.find((a) => a.stepOrder === 5)?.status || "";

  // Checkbox helper
  const checkbox = (selected: boolean) => (selected ? "[X]" : "[ ]");

  // Build the 3-line block
  const approvalStatusBlock =
    `${checkbox(finalStatus === "APPROVED")} Approved\n` +
    `${checkbox(finalStatus === "KIV")} KIV\n` +
    `${checkbox(finalStatus === "REJECTED")} Rejected`;

  const tableData: RowInput[] = [
    [
      "Date of Submission",
      parsedFormData?.createddate || "-",
      "Work Location",
      parsedFormData?.workLocation || "-",
    ],
    [
      "Division",
      divisionName || "-",
      "Workstation Availability",
      parsedFormData?.workStation || "-",
    ],
    [
      "Department",
      departmentName || "-",
      "Employment Type",
      parsedFormData?.employmentType || "-",
    ],
    [
      "Section",
      sectionName || "-",
      "Manpower Plan",
      parsedFormData?.manpowerPlan || "-",
    ],
    [
      "Designation",
      parsedFormData?.designation || "-",
      "Approved AMP",
      parsedFormData?.approvedAmp || "-",
    ],
    [
      "Reporting To",
      parsedFormData?.reportingTo || "-",
      "Category",
      parsedFormData?.category?.name || "-",
    ],
    [
      "No Requested",
      parsedFormData?.noRequested || "-",
      "Employment Type",
      parsedFormData?.employmentType || "-",
    ],
    [
      {
        content: "Current Headcount vs Approved Requirement",
        colSpan: 3,
        styles: { fontStyle: "bold" },
      },
      {
        content:
          `${parsedFormData?.currentHeadCount}/${parsedFormData?.approvedRequirement}` ||
          "-",
      },
    ],
    [
      {
        content:
          "1) Key Requirements (eg: Education, Language proficiency & Level of computer skills)",
        colSpan: 4,
        styles: { fontStyle: "bold" },
      },
    ],
    [
      {
        content: `${parsedFormData?.keyRequirement}` || "-",
        colSpan: 4,
        styles: { fontStyle: "normal" },
      },
    ],
    [
      {
        content:
          "2) Key Responsibilities (Job Description must be attached with this application)",
        colSpan: 4,
        styles: { fontStyle: "bold" },
      },
    ],
    [
      {
        content: `${parsedFormData?.keyResponsibilities}` || "-",
        colSpan: 4,
        styles: { fontStyle: "normal" },
      },
    ],
    [
      {
        content: "3) Reason of Requisition (Please tick (/) where applicable)",
        colSpan: 4,
        styles: { fontStyle: "bold" },
      },
    ],
    [
      {
        content:
          parsedFormData?.selectedOption === "replacement"
            ? "[X] Replacement (Please provide copy of resignation details for replacement hiring)"
            : "[ ] Replacement (Please provide copy of resignation details for replacement hiring)",
        colSpan: 2,
      },
      {
        content:
          parsedFormData?.selectedOption === "additional"
            ? "[X] Additional (Please provide justification for additional manpower request)"
            : "[ ] Additional (Please provide justification for additional manpower request)",
        colSpan: 2,
      },
    ],
    [
      "Incumbent Name",
      `${parsedFormData?.incumbentName}` || "-",
      "Production Volume Increase (Item)",
      `${parsedFormData?.productionVolumeIncrease}` || "-",
    ],
    [
      "Last Working Day",
      parsedFormData?.lastWorkingDay ?? "-",
      "New Project",
      parsedFormData?.newProject || "-",
    ],
    [
      { content: "", colSpan: 2, rowSpan: 2 },
      "Machine Faulty",
      `${parsedFormData?.machineFaulty}` || "-",
    ],
    ["Other", `${parsedFormData?.other}` || "-"],
  ];

  autoTable(doc, {
    startY: 40,
    body: tableData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold" },
      2: { fontStyle: "bold" },
    },
  });

  // Get Y position of last table
  const finalY =
    (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY || 45;
  // Approval table

  const approveData: RowInput[] = [
    [
      "Requested by:",
      "Recommended by:",
      "Reviewed by:",
      "Verified by (Level 1):",
      "Verified by (Level 2):",
      "Approved by:",
    ],
    approverNames,
    [
      "Head Section/Department",
      "Head Division",
      "Head Talent/Acquisition",
      "Head Culture & Talent Management",
      "Head Human Capital & ESG",
      "Chief Executive Officer",
    ],
    approverDates.map((d) => `Date: ${d}`),
    digitalSignedRow,

    [
      { content: "", colSpan: 5 },
      { content: approvalStatusBlock, styles: { halign: "left" } },
    ],
  ];

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const usableWidth = pageWidth - margin * 2;
  const colWidth = usableWidth / 6;

  autoTable(doc, {
    startY: finalY,
    body: approveData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 3, halign: "center", valign: "bottom" },
    columnStyles: {
      // 0: { cellWidth: colWidth },
      // 1: { cellWidth: colWidth },
      // 2: { cellWidth: colWidth },
      // 3: { cellWidth: colWidth },
      // 4: { cellWidth: colWidth },
      5: { cellWidth: colWidth, halign: "left" },
    },

    didParseCell: (data) => {
      if (data.row.index === 0) {
        data.cell.styles.overflow = "ellipsize"; // or "visible"
        data.cell.styles.cellWidth = "wrap"; // allow content width to expand without wrapping
      }
    },
  });
};

const generateGrievancePDF = (doc: jsPDF, data: FormPDFData) => {
  const { formData, divisionName, departmentName, sectionName } = data;
  const parsedForm = formData as {
    dateOfComplaint: string;
    complaintTypes: string;
    detailComplaints: string;
    attemptsResolve: string;
    preferredOutcome: string;
    contactNo: string;
    declaration: boolean;
    fullname: string;
    others: string;
    remarks: string;
    staffId: string;
    designation: string;
    supportEvidence: string;
  };

  const tableData: RowInput[] = [
    ["Full Name", parsedForm.fullname || "-"],
    ["Staff ID", parsedForm.staffId || "-"],
    ["Division", divisionName || "-"],
    ["Department", departmentName || "-"],
    ["Section", sectionName || "-"],
    ["Contact No", parsedForm.contactNo || "-"],
    ["Designation", parsedForm.designation || "-"],
    ["Date of Complaint", parsedForm.dateOfComplaint || "-"],
    ["Type of Complaint", parsedForm.complaintTypes || "-"],
    ["Complaint Detail", parsedForm.detailComplaints || "-"],
    ["Attempt Resolve", parsedForm.attemptsResolve || "-"],
    ["Preferred Outcome", parsedForm.preferredOutcome || "-"],
    ["Support Evidence", parsedForm.supportEvidence || "-"],
    ["Declaration", parsedForm.declaration || "-"],
  ];

  autoTable(doc, {
    startY: 40,
    body: tableData,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3 },
  });
};

export const downloadFormPDF = async (data: FormPDFData) => {
  const logoBase64 = await loadImage(logoUrl);
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = 30;
  const logoHeight = 20;

  // Center logo horizontally
  const logoX = (pageWidth - logoWidth) / 2;
  const logoY = 10;

  doc.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);

  // Title (centered below logo)
  doc.setFontSize(14);
  const titleX = pageWidth / 2;
  const titleY = logoY + logoHeight + 5;
  doc.setFontSize(10);

  if (data.formType === "Man Power Requisition") {
    doc.text("MANPOWER REQUISITION FORM", titleX, titleY, { align: "center" });
    generateManPowerPDF(doc, data);
    doc.save(`ManPowerRequisition_${data.createdBy.staffid}.pdf`);
  } else if (data.formType === "Grievance Report") {
    doc.text("GRIEVANCE REPORT FORM", titleX, titleY, { align: "center" });
    generateGrievancePDF(doc, data);
    doc.save(`Grievance_Report_${data.createdBy.staffid}.pdf`);
  }
};
