import { ApprovalUser, ManPowerTypes } from "@/app/types/types";
import { Prisma } from "@prisma/client";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

export interface FormPDFData {
  // formData: ManPowerTypes;
    formData: Prisma.JsonValue | null;
  departmentName: string;
  divisionName: string;
  sectionName: string;
  createdBy: {
    fullname: string;
    staffid: string;
    email: string;
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

export const downloadFormPDF = async (data: FormPDFData) => {
  console.log("data: ", data);
  const {
    formData,
    departmentName,
    divisionName,
    sectionName,
    createdBy,
    approvals,
  } = data;
  console.log("approvals pdf: ", approvals);
  console.log("department: ", departmentName);
  console.log("division: ", divisionName);
  console.log("section: ", sectionName);

  // Initialize an array of empty strings for 5 columns
  const approverNames: string[] = new Array(5).fill("");

  // Fill approverNames based on stepOrder
  approvals.forEach((a) => {
    const index = a.stepOrder - 1; // stepOrder starts at 1
    if (index >= 0 && index < 5) {
      approverNames[index] = a.approver?.name || "-";
    }
  });

  // Similarly for dates
  const approverDates: string[] = new Array(5).fill("");
  approvals.forEach((a) => {
    const index = a.stepOrder - 1;
    if (index >= 0 && index < 5) {
      approverDates[index] = a.approvedAt
        ? new Date(a.approvedAt).toLocaleDateString("en-GB")
        : "";
    }
  });

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
  doc.text("MANPOWER REQUISITION FORM", titleX, titleY, { align: "center" });

  doc.setFontSize(10);

  const parsedFormData = formData as unknown as ManPowerTypes | null;


  // Define table rows properly
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
          `${parsedFormData?.currentHeadCount}/${parsedFormData?.approvedRequirement}` || "-",
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
      `${parsedFormData?.lastWorkingDay}` || "-",
      "New Project",
      `${parsedFormData?.newProject}` || "-",
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
      "Verified by:",
      "Approved by:",
    ],
    approverNames,
    [
      "Head Section/Department",
      "Head Division",
      "Head Talent/Acquisition",
      "Head Human Capital & ESG/Culture & Talent Management",
      "Chief Executive Officer",
    ],
    approverDates.map((d) => `Date: ${d}`),
  ];

  const pageWidth1 = doc.internal.pageSize.getWidth();
  const margin = 14;
  const usableWidth = pageWidth1 - margin * 2;
  const colWidth = usableWidth / 5;

  autoTable(doc, {
    startY: finalY,
    body: approveData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 3, halign: "center", valign: "middle" },
    columnStyles: {
      0: { cellWidth: colWidth },
      1: { cellWidth: colWidth },
      2: { cellWidth: colWidth },
      3: { cellWidth: colWidth },
      4: { cellWidth: colWidth },
    },
    didParseCell: (data) => {
      if (data.row.index === 1) {
        data.cell.styles.minCellHeight = 30;
        data.cell.styles.valign = "middle";
      }
    },
  });

  doc.save(`ManPowerRequisition_${createdBy.staffid}.pdf`);
};
