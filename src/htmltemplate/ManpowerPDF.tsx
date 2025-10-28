// ManpowerPDFTemplate.tsx
import React from "react";
import { ManPowerTypes } from "@/app/types/types";

interface Props {
  formData: ManPowerTypes;
  departmentName: string;
  divisionName: string;
  sectionName: string;
  categoryName: string;
  createdBy: {
    fullname: string;
    staffid: string;
    email: string;
  };
}

const ManpowerPDFTemplate: React.FC<Props> = ({
  formData,
  departmentName,
  divisionName,
  sectionName,
  categoryName,
  createdBy,
}) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: 12,
        padding: 20,
        lineHeight: 1.5,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "#d9e2f3",
            width: 120,
            height: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          [Company Logo]
        </div>
        <div style={{ textAlign: "right", fontSize: 10 }}>
          <div style={{ fontWeight: "bold" }}>HC -- R, D&C (02-Rev 10)</div>
          <div>Effective: 14/07/2025</div>
        </div>
      </div>

      {/* TITLE */}
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        MANPOWER REQUISITION FORM
      </h2>

      {/* MAIN TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 20,
        }}
      >
        <tbody>
          <tr>
            <td style={cellLabel}>Date of Submission</td>
            <td style={cellValue}>{formData.createddate || "-"}</td>
            <td style={cellLabel}>Work Location</td>
            <td style={cellValue}>{formData.workLocation || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel}>Division</td>
            <td style={cellValue}>{divisionName || "-"}</td>
            <td style={cellLabel}>Workstation Availability</td>
            <td style={cellValue}>{formData.workStation || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel}>Department</td>
            <td style={cellValue}>{departmentName || "-"}</td>
            <td style={cellLabel}>Employment Type</td>
            <td style={cellValue}>{formData.employmentType || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel}>Section</td>
            <td style={cellValue}>{sectionName || "-"}</td>
            <td style={cellLabel}>Manpower Plan</td>
            <td style={cellValue}>{formData.manpowerPlan || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel}>Designation</td>
            <td style={cellValue}>{formData.designation || "-"}</td>
            <td style={cellLabel}>Approved AMP</td>
            <td style={cellValue}>{formData.approvedAmp || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel}>Reporting To</td>
            <td style={cellValue}>{formData.reportingTo || "-"}</td>
            <td style={cellLabel}>Category</td>
            <td style={cellValue}>{categoryName || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel}>No Requested</td>
            <td style={cellValue}>{formData.noRequested || "-"}</td>
            <td style={cellLabel}>Employment Type</td>
            <td style={cellValue}>{formData.employmentType || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel} colSpan={2}>
              Current Headcount vs Approved Requirement
            </td>
            <td style={cellValue} colSpan={2}>
              {formData.currentHeadCount || "-"}
            </td>
          </tr>

          {/* Key Requirements */}
          <tr>
            <td style={sectionHeader} colSpan={4}>
              1) Key Requirements (e.g. Education, Language proficiency &
              Computer skills)
            </td>
          </tr>
          <tr>
            <td style={emptyRow} colSpan={4}>
              {formData.keyRequirement || ""}
            </td>
          </tr>

          {/* Key Responsibilities */}
          <tr>
            <td style={sectionHeader} colSpan={4}>
              2) Key Responsibilities (Attach Job Description)
            </td>
          </tr>
          <tr>
            <td style={emptyRow} colSpan={4}>
              {formData.keyResponsibilities || ""}
            </td>
          </tr>

          {/* Reason of Requisition */}
          <tr>
            <td style={sectionHeader} colSpan={4}>
              3) Reason of Requisition (Please tick (√) where applicable)
            </td>
          </tr>
          <tr>
            <td style={cellLabel} colSpan={2}>
              Replacement
            </td>
            <td style={cellLabel} colSpan={2}>
              Additional
            </td>
          </tr>
          <tr>
            <td style={cellLabel}>Incumbent Name</td>
            <td style={cellValue}>{formData.incumbentName || "-"}</td>
            <td style={cellLabel}>Production Volume Increase (Item)</td>
            <td style={cellValue}>{formData.productionVolumeIncrease || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel}>Last Working Day</td>
            <td style={cellValue}>{formData.lastWorkingDay || "-"}</td>
            <td style={cellLabel}>New Project</td>
            <td style={cellValue}>{formData.newProject || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel}></td>
            <td style={cellValue}></td>
            <td style={cellLabel}>Machine Faulty</td>
            <td style={cellValue}>{formData.machineFaulty || "-"}</td>
          </tr>
          <tr>
            <td style={cellLabel}></td>
            <td style={cellValue}></td>
            <td style={cellLabel}>Other</td>
            <td style={cellValue}>{formData.other || "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* APPROVAL TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={approvalHeader}>Requested by:</td>
            <td style={approvalHeader}>Recommended by:</td>
            <td style={approvalHeader}>Reviewed by:</td>
            <td style={approvalHeader}>Verified by:</td>
            <td style={approvalHeader}>Approved by:</td>
          </tr>

          <tr>
            <td style={approvalBox}>Head Section/Department</td>
            <td style={approvalBox}>Head Division</td>
            <td style={approvalBox}>Head Talent Acquisition</td>
            <td style={approvalBox}>
              Head Human Capital & ESG/Culture & Talent Management
            </td>
            <td style={approvalBox}>Chief Executive Officer</td>
          </tr>

          <tr>
            <td style={dateCell}>Date:</td>
            <td style={dateCell}>Date:</td>
            <td style={dateCell}>Date:</td>
            <td style={dateCell}>Date:</td>
            <td style={dateCell}>Date:</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ✅ Shared styles
const cellLabel: React.CSSProperties = {
  border: "1px solid #000",
  fontWeight: "bold",
  padding: "5px 8px",
};

const cellValue: React.CSSProperties = {
  border: "1px solid #000",
  padding: "5px 8px",
};

const sectionHeader: React.CSSProperties = {
  border: "1px solid #000",
  fontWeight: "bold",
  padding: "5px 8px",
  backgroundColor: "#f2f2f2",
};

const emptyRow: React.CSSProperties = {
  border: "1px solid #000",
  padding: "20px 8px",
  height: "60px",
};

const approvalHeader: React.CSSProperties = {
  border: "1px solid #000",
  fontWeight: "bold",
  padding: "5px 8px",
};

const approvalBox: React.CSSProperties = {
  border: "1px solid #000",
  fontWeight: "bold",
  padding: "100px 8px 10px 8px",
  textAlign: "center",
  verticalAlign: "bottom",
};

const dateCell: React.CSSProperties = {
  border: "1px solid #000",
  fontWeight: "bold",
  padding: "5px 8px",
  textAlign: "center",
};

export default ManpowerPDFTemplate;
