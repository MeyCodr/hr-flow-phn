import { ManPowerTypes } from "@/app/types/types";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";



export interface FormPDFData {
  formData: ManPowerTypes;
  departmentName: string;
  divisionName: string;
  sectionName: string;
  createdBy: {
    fullname: string;
    staffid: string;
    email: string;
  };
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
  const { formData, departmentName, divisionName, sectionName, createdBy } =
    data;

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

  // Define table rows properly
  const tableData: RowInput[] = [
    [
      "Date of Submission",
      formData.createddate || "-",
      "Work Location",
      formData.workLocation || "-",
    ],
    [
      "Division",
      divisionName || "-",
      "Workstation Availability",
      formData.workStation || "-",
    ],
    [
      "Department",
      departmentName || "-",
      "Employment Type",
      formData.employmentType || "-",
    ],
    [
      "Section",
      sectionName || "-",
      "Manpower Plan",
      formData.manpowerPlan || "-",
    ],
    [
      "Designation",
      formData.designation || "-",
      "Approved AMP",
      formData.approvedAmp || "-",
    ],
    [
      "Reporting To",
      formData.reportingTo || "-",
      "Category",
      formData.category?.name || "-",
    ],
    [
      "No Requested",
      formData.noRequested || "-",
      "Employment Type",
      formData.employmentType || "-",
    ],
    [
      {
        content: "Current Headcount vs Approved Requirement",
        colSpan: 2,
        styles: { fontStyle: "bold" },
      },
      {
        content:
          `${formData.currentHeadCount}/${formData.approvedRequirement}` || "-",
        colSpan: 2,
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
    [{ content: `${formData.keyRequirement}` || "-", colSpan: 4 }],
    [
      {
        content:
          "2) Key Responsibilities (Job Description must be attached with this application)",
        colSpan: 4,
        styles: { fontStyle: "bold" },
      },
    ],
    [{ content: `${formData.keyResponsibilities}` || "-", colSpan: 4 }],
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
          formData.selectedOption === "replacement"
            ? "[X] Replacement (Please provide copy of resignation details for replacement hiring)"
            : "[ ] Replacement (Please provide copy of resignation details for replacement hiring)",
        colSpan: 2,
      },
      {
        content:
          formData.selectedOption === "additional"
            ? "[X] Additional (Please provide justification for additional manpower request)"
            : "[ ] Additional (Please provide justification for additional manpower request)",
        colSpan: 2,
      },
    ],
    [
      "Incumbent Name",
      `${formData.incumbentName}` || "-",
      "Production Volume Increase (Item)",
      `${formData.productionVolumeIncrease}` || "-",
    ],
    [
      "Last Working Day",
      `${formData.lastWorkingDay}` || "-",
      "New Project",
      `${formData.newProject}` || "-",
    ],
    [
      { content: "", colSpan: 2, rowSpan: 2 },
      "Machine Faulty",
      `${formData.machineFaulty}` || "-",
    ],
    ["Other", `${formData.other}` || "-"],
  ];

  autoTable(doc, {
    startY: 40,
    body: tableData,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
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
    [
      "Head Section/Department",
      "Head Division",
      "Head Talent/Acquisition",
      "Head Human Capital & ESG/Culture & Talent Management",
      "Chief Executive Officer",
    ],
    [
      `Date: ${formData.dateRequested || ""}`,
      `Date: ${formData.dateRecommended || ""}`,
      `Date: ${formData.dateReviewed || ""}`,
      `Date: ${formData.dateVerified || ""}`,
      `Date: ${formData.approvedby || ""}`,
    ],
  ];

  const pageWidth1 = doc.internal.pageSize.getWidth();
  const margin = 14;
  const usableWidth = pageWidth1 - margin * 2;
  const colWidth = usableWidth / 5;

  autoTable(doc, {
    startY: finalY,
    body: approveData,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3, halign: "center", valign: "middle" },
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
        data.cell.styles.valign = "bottom";
      }
    },
  });

  doc.save(`ManPowerRequisition_${createdBy.staffid}.pdf`);
};
