import { ApprovalUser, EmployeeReviewTypes, ManPowerTypes } from "@/app/types/types";
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
const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
const logoUrl = `${basePath}/company-logo-phn.png`;

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
  const {
    formData,
    departmentName,
    divisionName,
    sectionName,
    createdBy,
    approvals,
  } = data;

  const parsedFormData = formData as unknown as ManPowerTypes | null;
  const uniqueStepOrders = [...new Set(approvals.map((a) => a.stepOrder))].sort(
    (a, b) => a - b,
  );
  const hasRecommendedColumn = uniqueStepOrders.length === 6;
  const colCount = hasRecommendedColumn ? 7 : 6;
  const stepOrderToColumn = new Map(
    uniqueStepOrders.map((stepOrder, index) => [stepOrder, index + 1]),
  );

  // When skipRecommended: stepOrder 2..6 → col 1..5 (offset = -1)
  // Otherwise:           stepOrder 1..6 → col 1..6 (offset = 0)
  const approverColIndex = (stepOrder: number) =>
    stepOrderToColumn.get(stepOrder) ?? -1;

  const digitalSignedRow: string[] = new Array(colCount).fill("");
  digitalSignedRow[0] = "Digital Signed";
  approvals.forEach((a) => {
    const col = approverColIndex(a.stepOrder);
    if (col >= 1 && col < colCount) {
      digitalSignedRow[col] = a.status === "APPROVED" ? "Digital Signed" : "";
    }
  });

  const approverNames: string[] = new Array(colCount).fill("");
  approverNames[0] = createdBy.fullname || "-";
  approvals.forEach((a) => {
    const col = approverColIndex(a.stepOrder);
    if (col >= 1 && col < colCount) {
      approverNames[col] =
        a.status === "APPROVED" ? a.approver?.name || "-" : "";
    }
  });

  const approverDates: string[] = new Array(colCount).fill("");
  approverDates[0] = parsedFormData?.createddate
    ? new Date(parsedFormData.createddate).toLocaleDateString("en-GB")
    : "-";
  approvals.forEach((a) => {
    const col = approverColIndex(a.stepOrder);
    if (col >= 1 && col < colCount) {
      approverDates[col] = a.approvedAt
        ? new Date(a.approvedAt).toLocaleDateString("en-GB")
        : "";
    }
  });

  const finalStepOrder = uniqueStepOrders[uniqueStepOrders.length - 1];
  const finalStatus =
    approvals.find((a) => a.stepOrder === finalStepOrder)?.status || "";

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
    hasRecommendedColumn
      ? [
          "Requested by:",
          "Recommended by:",
          "Reviewed by:",
          "Validated by:",
          "Verified by (Level 1):",
          "Verified by (Level 2):",
          "Approved by:",
        ]
      : [
          "Requested by:",
          "Reviewed by:",
          "Validated by:",
          "Verified by (Level 1):",
          "Verified by (Level 2):",
          "Approved by:",
        ],
    approverNames,
    hasRecommendedColumn
      ? [
          "Form Requestor",
          "Head of Department",
          "Head Division",
          "Head Talent/Acquisition",
          "Head Culture & Talent Management",
          "Head Human Capital & ESG",
          "Chief Executive Officer",
        ]
      : [
          "Form Requestor",
          "Head Division",
          "Head Talent/Acquisition",
          "Head Culture & Talent Management",
          "Head Human Capital & ESG",
          "Chief Executive Officer",
        ],
    approverDates.map((d) => `Date: ${d}`),
    digitalSignedRow,

    [
      { content: "", colSpan: colCount - 1 },
      { content: approvalStatusBlock, styles: { halign: "left" } },
    ],
  ];

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const usableWidth = pageWidth - margin * 2;
  const colWidth = usableWidth / colCount;

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
      // 5: { cellWidth: colWidth },
      [colCount - 1]: { cellWidth: colWidth, halign: "left" },
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

const generateEmployeeReviewPDF = (doc: jsPDF, data: FormPDFData, logoBase64: string) => {
  const { formData } = data;
  const f = (formData as unknown as EmployeeReviewTypes) ?? {};
  const margin = 10;
  const chk = (val: string | undefined, expected: string) => val === expected ? "[X]" : "[ ]";
  const val = (v: unknown) => (v ? String(v) : "-");

  // ── Header row ──
  autoTable(doc, {
    startY: 10,
    body: [[
      { content: "", styles: { cellWidth: 28, minCellHeight: 14 } },
      { content: "EMPLOYEE MONTHLY PERFORMANCE REVIEW", styles: { halign: "center", fontStyle: "bold", fontSize: 10, valign: "middle" } },
      { content: "PHN/HCD/PRF-002", styles: { halign: "center", fontSize: 7, cellWidth: 38, valign: "middle" } },
    ]],
    theme: "grid",
    styles: { cellPadding: 2 },
    margin: { left: margin, right: margin },
    didDrawCell: (hook) => {
      if (hook.row.index === 0 && hook.column.index === 0) {
        doc.addImage(logoBase64, "PNG", hook.cell.x + 1, hook.cell.y + 1, 26, 12);
      }
    },
  });

  let y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;

  // ── Please Note ──
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("PLEASE NOTE:", margin, y);
  doc.setFont("helvetica", "normal");
  const noteLines = doc.splitTextToSize(
    "Evaluator MUST submit a copy of this form on every completion of review period to Human Capital Division. The evaluating manager should ensure that the employee is given a copy of this document at each stage of their probation period and should retain a copy to monitor progress against set objectives at follow-up meetings.",
    190 - margin * 2
  );
  doc.text(noteLines, margin, y + 4);
  y += 4 + noteLines.length * 3.5 + 3;

  // ── Employee Information ──
  autoTable(doc, {
    startY: y,
    head: [[{ content: "Employee Information", colSpan: 4, styles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: "bold", halign: "left" } }]],
    body: [
      [{ content: "Employee Name", styles: { fontStyle: "bold" } }, val(f.staffName), { content: "Employee ID", styles: { fontStyle: "bold" } }, val(f.staffId)],
      [{ content: "Job Title", styles: { fontStyle: "bold" } }, val(f.jobTitle), { content: "Date Join", styles: { fontStyle: "bold" } }, val(f.dateJoin)],
      [{ content: "Department/Section", styles: { fontStyle: "bold" } }, `${val(f.departmentName)} / ${val(f.sectionName)}`, { content: "Evaluator", styles: { fontStyle: "bold" } }, val(f.evaluator)],
      [{ content: "Review Period", styles: { fontStyle: "bold" } }, val(f.reviewPeriodFrom), { content: "To:", styles: { fontStyle: "bold" } }, val(f.reviewPeriodTo)],
    ],
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 38 }, 2: { cellWidth: 28 } },
    margin: { left: margin, right: margin },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;

  // ── Section 1: Month + Review Period ──
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("1)", margin, y + 4);
  doc.text("Month:", margin + 5, y + 4);
  doc.setFont("helvetica", "normal");
  const months = ["1", "2", "3", "4", "5"];
  months.forEach((m, i) => doc.text(`${chk(f.monthReview, m)} ${m}`, margin + 20 + i * 11, y + 4));
  doc.setFont("helvetica", "bold");
  doc.text("Review Period: From", margin + 78, y + 4);
  doc.setFont("helvetica", "normal");
  doc.text(val(f.reviewPeriodFrom), margin + 110, y + 4);
  doc.text("to", margin + 140, y + 4);
  doc.text(val(f.reviewPeriodTo), margin + 146, y + 4);
  doc.setFontSize(6);
  doc.setFont("helvetica", "italic");
  doc.text("(please circle the review month)", margin + 5, y + 8);
  y += 12;

  // ── Performance Review Table ──
  const criteria = [
    { label: "Job Knowledge", field: "jobKnowledge" as keyof EmployeeReviewTypes, commentField: "jobKnowledgeComments" as keyof EmployeeReviewTypes },
    { label: "Work Quality", field: "workQuality" as keyof EmployeeReviewTypes, commentField: "workQualityComments" as keyof EmployeeReviewTypes },
    { label: "Attendance/Punctuality", field: "attendancePunctuality" as keyof EmployeeReviewTypes, commentField: "attendancePunctualityComments" as keyof EmployeeReviewTypes },
    { label: "Communication Skills and Team Work", field: "communicationSkills" as keyof EmployeeReviewTypes, commentField: "communicationSkillsComments" as keyof EmployeeReviewTypes },
    { label: "Competency in the Role", field: "competencyRoles" as keyof EmployeeReviewTypes, commentField: "competencyRolesComments" as keyof EmployeeReviewTypes },
  ];

  const perfBody: RowInput[] = [];
  criteria.forEach(c => {
    const rating = String(f[c.field] ?? "");
    const comment = String(f[c.commentField] ?? "");
    perfBody.push([c.label, chk(rating, "1"), chk(rating, "2"), chk(rating, "3"), chk(rating, "4"), chk(rating, "5")]);
    perfBody.push([{ content: `Comments:  ${comment}`, colSpan: 6, styles: { fontStyle: "italic", textColor: [80, 80, 80] } }]);
  });
  perfBody.push([{ content: `Average Rating / Score:    ${val(f.averageRating)}  / 25`, colSpan: 6, styles: { fontStyle: "bold" } }]);

  autoTable(doc, {
    startY: y,
    head: [[
      { content: "", styles: { cellWidth: 60 } },
      { content: "1 = Poor" },
      { content: "2 = Fair" },
      { content: "3 = Satisfactory" },
      { content: "4 = Good" },
      { content: "5 = Excellent" },
    ]],
    body: perfBody,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, halign: "center" },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: 20 }, 2: { cellWidth: 20 },
      3: { cellWidth: 28 }, 4: { cellWidth: 20 }, 5: { cellWidth: 22 },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // ── Superior & HOD Signatures ──
  autoTable(doc, {
    startY: y,
    body: [
      [
        { content: "Superior Signature:", styles: { fontStyle: "bold" } }, val(f.superiorSignature),
        { content: "HOD Signature:", styles: { fontStyle: "bold" } }, val(f.hodSignature),
      ],
      [
        { content: "Date:", styles: { fontStyle: "bold" } }, val(f.superiorDate),
        { content: "Date:", styles: { fontStyle: "bold" } }, val(f.hodDate),
      ],
    ],
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 38 }, 2: { cellWidth: 32 } },
    margin: { left: margin, right: margin },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // ── Employee Comments and Goals ──
  autoTable(doc, {
    startY: y,
    body: [
      [{
        content: "Employee Comments and Goals:\n(By signing this form, you confirm that you have discussed this review in detail with your superior and acknowledged on the comments and advices for improvements where necessary.)",
        styles: { fontStyle: "bold", fontSize: 7 },
      }],
      [{ content: val(f.employeeComments), styles: { minCellHeight: 18, fontSize: 7 } }],
    ],
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: margin, right: margin },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // ── Employee Signature & HCD Acknowledgement ──
  autoTable(doc, {
    startY: y,
    body: [
      [
        { content: "Employee Signature:", styles: { fontStyle: "bold" } }, val(f.employeeSignature),
        { content: "HCD Acknowledgement:", styles: { fontStyle: "bold" } }, val(f.hcdAcknowledgement),
      ],
      [
        { content: "Date:", styles: { fontStyle: "bold" } }, val(f.employeeDate),
        { content: "Date:", styles: { fontStyle: "bold" } }, val(f.hcdDate),
      ],
    ],
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 38 }, 2: { cellWidth: 38 } },
    margin: { left: margin, right: margin },
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

  if (data.formType.toLowerCase().includes("employee monthly performance")) {
    const empDoc = new jsPDF();
    generateEmployeeReviewPDF(empDoc, data, logoBase64);
    empDoc.save(`EmployeeMonthlyPerformanceReview_${data.createdBy.staffid}.pdf`);
    return;
  }

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
