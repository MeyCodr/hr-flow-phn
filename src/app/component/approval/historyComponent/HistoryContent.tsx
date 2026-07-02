import React from "react";
import BannerCard from "../../ui/BannerCard";
import { Approval, SexualHarassmentReportItem } from "../ApprovalComponent";
import { SelfForm, UserType } from "@/app/types/types";
import PaginatedList from "../../ui/PaginatedList";
import { FiShield } from "react-icons/fi";
import { FaCalendarAlt, FaUser } from "react-icons/fa";

interface HistoryContentProps {
  approvalsHistory: Approval[];
  userFormsHistory: SelfForm[];
  user: UserType;
  onViewForm: (formId: number, formName: string, source: "history") => void;
  sexualHarassmentReports?: SexualHarassmentReportItem[];
  onViewReport?: (reportId: number) => void;
}

// Define a unified item type for pagination
type HistoryItem =
  | { type: "approval"; data: Approval }
  | { type: "form"; data: SelfForm };

export default function HistoryContent({
  approvalsHistory,
  userFormsHistory,
  user,
  onViewForm,
  sexualHarassmentReports = [],
  onViewReport,
}: HistoryContentProps) {
  const historyItems: HistoryItem[] = [
    ...approvalsHistory.map((approval) => ({
      type: "approval" as const,
      data: approval,
    })),
    ...userFormsHistory.map((form) => ({
      type: "form" as const,
      data: form,
    })),
  ];

  const hasItems = historyItems.length > 0 || sexualHarassmentReports.length > 0;

  if (!hasItems) {
    return <p className="text-gray-600">No history found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {historyItems.length > 0 && (
        <PaginatedList
          items={historyItems}
          pageSize={10}
          renderItem={(item) => {
            if (item.type === "approval") {
              const approval = item.data;
              const submission = approval.submission;

              if (!submission) return;

              return (
                <BannerCard
                  key={`approval-history-${approval.id}`}
                  approvalId={approval.id}
                  profileImg={submission.createdBy.attachment || ""}
                  title={submission.formType.name}
                  name={submission.createdBy.fullname}
                  createddate={submission.createdAt}
                  remarks={
                    (submission.formData as { remarks?: string } | null)?.remarks ||
                    "No remarks"
                  }
                  currentLevel={approval.currentLevel}
                  totalLevel={approval.totalLevel}
                  activeLevel={approval.activeLevel}
                  roles={user.role}
                  status={approval.status}
                  onClick={() =>
                    onViewForm(submission.id, submission.formType.name, "history")
                  }
                />
              );
            } else {
              const form = item.data;
              return (
                <BannerCard
                  key={`form-history-${form.id}`}
                  profileImg={user.attachment || ""}
                  title={form.formType.name}
                  name={"You"}
                  createddate={form.createdAt}
                  remarks={(form.formData?.remarks as string) || "No remarks"}
                  currentLevel={form.currentLevel ?? 0}
                  totalLevel={form.totalLevel ?? 0}
                  activeLevel={form.activeLevel ?? 0}
                  roles={user.role}
                  status={form.status}
                  onClick={() => onViewForm(form.id, form.formType.name, "history")}
                />
              );
            }
          }}
        />
      )}

      {sexualHarassmentReports.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FiShield className="text-indigo-700" />
            Sexual Harassment Reports
          </h2>
          {sexualHarassmentReports.map((report) => {
            const date = new Date(report.createdAt);
            const formattedDate = Number.isNaN(date.getTime())
              ? "-"
              : date.toLocaleDateString("en-GB");
            const statusColor =
              report.status === "RESOLVED"
                ? "bg-green-100 text-green-700"
                : report.status === "CLOSED"
                  ? "bg-red-100 text-red-700"
                  : report.status === "UNDER_REVIEW"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700";
            const initials = report.reporterName.trim().split(/\s+/).reduce(
              (acc, part, i, arr) =>
                i === 0 || i === arr.length - 1 ? acc + part[0].toUpperCase() : acc,
              ""
            );
            return (
              <div
                key={report.id}
                onClick={() => onViewReport?.(report.id)}
                className="bg-white w-full rounded-xl border border-gray-300 shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all duration-200 p-4 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-700 text-white font-semibold w-10 h-10 flex items-center justify-center rounded-full text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-x-3 items-center">
                      <h1 className="text-sm font-semibold text-gray-900">Sexual Harassment Report</h1>
                      <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                        {report.status.toLowerCase().replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <FaUser className="text-indigo-700 text-[0.7rem]" />
                        <span className="font-medium text-indigo-700">{report.reporterName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="text-indigo-700 text-[0.7rem]" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 bg-indigo-50 border border-indigo-200 p-2 text-xs rounded-md">
                  <p className="text-gray-700 line-clamp-2">{report.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
