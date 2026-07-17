"use client";

import React, { useEffect, useState } from "react";
import { SelfFormData } from "@/app/types/types";
import ViewSubmission from "../../form/ViewSubmission";
import ViewSexualHarassmentReport, { FullSexualHarassmentReport } from "../../compliance/ViewSexualHarassmentReport";
import axios from "axios";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { withBasePath } from "@/lib/base-path";
import { AdminSHRItem } from "../AdminComponent";
import { FiShield } from "react-icons/fi";
import ApprovalTable from "../../ui/ApprovalTable";
import { getLastApprovalDate } from "../../approval/approvalDateUtils";

interface FormSubmissionProps {
  formSubmission: SelfFormData[];
  sexualHarassmentReports?: AdminSHRItem[];
}

type AdminTableItem =
  | { type: "form"; data: SelfFormData }
  | { type: "shr"; data: AdminSHRItem };

const fmt = (date: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));

const statusColor = (status: string) => {
  if (status === "APPROVED" || status === "RESOLVED") return "bg-green-100 text-green-700";
  if (status === "REJECTED" || status === "CLOSED") return "bg-red-100 text-red-700";
  if (status === "UNDER_REVIEW") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-700";
};

export default function FormSubmission({
  formSubmission,
  sexualHarassmentReports = [],
}: FormSubmissionProps) {
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState<SelfFormData | null>(null);
  const [selectedReport, setSelectedReport] = useState<FullSexualHarassmentReport | null>(null);
  const [form, setForm] = useState<SelfFormData[]>(formSubmission);

  const fetchFormSubmission = async () => {
    setLoading(true);
    try {
      const res = await axios.get(withBasePath(`/api/form`));
      if (Array.isArray(res.data)) {
        setForm(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch form submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormSubmission();
  }, []);

  const handleReportClick = async (id: number) => {
    try {
      const res = await axios.get(withBasePath(`/api/compliance/sexual-harassment/${id}`));
      setSelectedReport(res.data.data);
    } catch (error) {
      console.error("Failed to fetch report:", error);
    }
  };

  const sortedForm = [...form].sort((a, b) => {
    const dateA = getLastApprovalDate(a.approvals);
    const dateB = getLastApprovalDate(b.approvals);
    if (dateA && dateB) return new Date(dateB).getTime() - new Date(dateA).getTime();
    if (dateA) return -1;
    if (dateB) return 1;
    return 0;
  });

  const tableItems: AdminTableItem[] = [
    ...sortedForm.map((data) => ({ type: "form" as const, data })),
    ...sexualHarassmentReports.map((data) => ({ type: "shr" as const, data })),
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const slideVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {selectedReport ? (
          <motion.div key="shr-view" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
            <ViewSexualHarassmentReport
              report={selectedReport}
              onBack={() => setSelectedReport(null)}
              onUpdate={(updated) => setSelectedReport((prev) => prev ? { ...prev, ...updated } : prev)}
            />
          </motion.div>
        ) : selectedForm ? (
          <motion.div key="form-view" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
            <ViewSubmission
              selfForm={selectedForm}
              onBack={() => { fetchFormSubmission(); setSelectedForm(null); }}
            />
          </motion.div>
        ) : (
          <motion.div key="list-view" initial="hidden" animate="visible" exit="exit" variants={containerVariants}
            className="p-6 w-full bg-white rounded-lg border border-gray-300"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Form Submission</h2>

            {loading ? (
              <p className="text-center text-sm text-gray-500 py-6">Loading latest form submission ...</p>
            ) : (
              <>
                <ApprovalTable
                  items={tableItems}
                  pageSize={20}
                  emptyMessage="No submissions found."
                  columns={[
                    { label: "Form Type" },
                    { label: "Created By" },
                    {
                      label: "Created At",
                      sortAccessor: (item) => item.data.createdAt,
                    },
                    {
                      label: "Last Approval Date",
                      sortAccessor: (item) =>
                        item.type === "form" ? getLastApprovalDate(item.data.approvals) : null,
                    },
                    { label: "Status", sortAccessor: (item) => item.data.status },
                  ]}
                  renderRow={(item) => {
                    if (item.type === "form") {
                      const submission = item.data;
                      const latestApproval = getLastApprovalDate(submission.approvals);
                      return (
                        <tr
                          key={`form-${submission.id}`}
                          onClick={() => setSelectedForm(submission)}
                          className="cursor-pointer divide-x divide-gray-100 border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                            {submission.formType.name}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-indigo-700 whitespace-nowrap">
                            {submission.createdBy.fullname}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                            {fmt(submission.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                            {latestApproval ? fmt(latestApproval) : "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusColor(submission.status)}`}>
                              {submission.status.toLowerCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    }

                    const report = item.data;
                    return (
                      <tr
                        key={`shr-${report.id}`}
                        onClick={() => handleReportClick(report.id)}
                        className="cursor-pointer divide-x divide-gray-100 border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <FiShield className="text-indigo-600 flex-shrink-0" />
                            Sexual Harassment Report
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-indigo-700 whitespace-nowrap">
                          {report.reporterName}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {fmt(report.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">-</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusColor(report.status)}`}>
                            {report.status.toLowerCase().replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  }}
                />
                <p className="text-xs text-gray-500 mt-3 text-center sm:hidden">
                  👉 Swipe left/right to view more columns
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
