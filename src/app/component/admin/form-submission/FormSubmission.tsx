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

interface FormSubmissionProps {
  formSubmission: SelfFormData[];
  sexualHarassmentReports?: AdminSHRItem[];
}

const fmt = (date: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));

const statusColor = (status: string) => {
  if (status === "RESOLVED") return "bg-green-100 text-green-700";
  if (status === "CLOSED") return "bg-red-100 text-red-700";
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

  const getLatestApprovalDate = (submission: SelfFormData): Date | null => {
    const dates = (submission.approvals || [])
      .map((a) => (a.approvedAt ? new Date(a.approvedAt) : null))
      .filter((d): d is Date => d !== null);
    return dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
  };

  const sortedForm = [...form].sort((a, b) => {
    const dateA = getLatestApprovalDate(a);
    const dateB = getLatestApprovalDate(b);
    if (dateA && dateB) return dateB.getTime() - dateA.getTime();
    if (dateA) return -1;
    if (dateB) return 1;
    return 0;
  });

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
                <div className="w-full overflow-x-auto">
                  <table className="min-w-[700px] w-full text-xs text-left border border-gray-300 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-indigo-800 text-white">
                        <th className="px-4 py-3 font-semibold">No</th>
                        <th className="px-4 py-3 font-semibold">Form Name</th>
                        <th className="px-4 py-3 font-semibold text-nowrap">Created by</th>
                        <th className="px-4 py-3 font-semibold text-nowrap">Created at</th>
                        <th className="px-4 py-3 font-semibold text-nowrap">Latest Approval</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedForm.map((item, i) => {
                        const latestApproval = getLatestApprovalDate(item);
                        return (
                          <tr key={`form-${item.id}`} onClick={() => setSelectedForm(item)}
                            className="hover:bg-indigo-50 transition cursor-pointer"
                          >
                            <td className="px-4 py-3 font-medium text-gray-700">{i + 1}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{item.formType.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{item.createdBy.fullname}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{fmt(item.createdAt)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                              {latestApproval ? fmt(latestApproval) : "—"}
                            </td>
                            <td className="px-4 py-3 text-indigo-700 font-medium whitespace-nowrap">{item.status}</td>
                          </tr>
                        );
                      })}

                      {sexualHarassmentReports.map((report, i) => (
                        <tr key={`shr-${report.id}`} onClick={() => handleReportClick(report.id)}
                          className="hover:bg-indigo-50 transition cursor-pointer"
                        >
                          <td className="px-4 py-3 font-medium text-gray-700">{sortedForm.length + i + 1}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <FiShield className="text-indigo-600 flex-shrink-0" />
                              Sexual Harassment Report
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{report.reporterName}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{fmt(report.createdAt)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-400">—</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${statusColor(report.status)}`}>
                              {report.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {sortedForm.length === 0 && sexualHarassmentReports.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                            No submissions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
