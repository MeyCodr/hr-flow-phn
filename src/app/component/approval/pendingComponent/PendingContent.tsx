import React from "react";
import BannerCard from "../../ui/BannerCard";
import { SelfForm, UserType } from "@/app/types/types";
import { Approval, SexualHarassmentReportItem } from "../ApprovalComponent";
import PaginatedList from "../../ui/PaginatedList";
import { FiShield } from "react-icons/fi";
import { FaCalendarAlt, FaUser } from "react-icons/fa";

interface PendingContentProps {
  approvals: Approval[];
  userPendingForms: SelfForm[];
  user: UserType;
  onActionComplete?: () => void;
  onViewForm: (formId: number, formName: string, source: "pending") => void;
  onViewReport?: (reportId: number) => void;
  sexualHarassmentReports?: SexualHarassmentReportItem[];
}

// Define a union type for items in the paginated list
type PendingItem =
  | { type: "approval"; data: Approval }
  | { type: "form"; data: SelfForm };

export default function PendingContent({
  approvals,
  userPendingForms,
  user,
  onActionComplete,
  onViewForm,
  onViewReport,
  sexualHarassmentReports = [],
}: PendingContentProps) {
  const pendingApprovals = approvals.filter(
    (approval) => approval.status === "PENDING",
  );

  const approvalSubmissionIds = new Set(
    pendingApprovals
      .map((approval) => approval.submission?.id)
      .filter((id): id is number => typeof id === "number"),
  );

  const visiblePendingForms = userPendingForms.filter(
    (form) => !approvalSubmissionIds.has(form.id),
  );

  const pendingItems: PendingItem[] = [
    ...pendingApprovals.map((approval) => ({
      type: "approval" as const,
      data: approval,
    })),
    ...visiblePendingForms.map((form) => ({
      type: "form" as const,
      data: form,
    })),
  ];

  const hasItems = pendingItems.length > 0 || sexualHarassmentReports.length > 0;

  if (!hasItems) {
    return <p className="text-gray-600">No pending items found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
    <PaginatedList
      items={pendingItems}
      pageSize={10}
      renderItem={(item) => {
        if (item.type === "approval") {
          const approval = item.data;
          const submission = approval.submission;
          if (!submission) return;
          const remarks =
            (submission.formData as { remarks?: string } | null)?.remarks ||
            "No remarks yet";
          return (
            <BannerCard
              key={`approval-${approval.id}`}
              approvalId={approval.id}
              approvalUserId={approval.approverId}
              profileImg={submission.createdBy.attachment || ""}
              title={submission.formType.name}
              name={submission.createdBy.fullname}
              createddate={submission.createdAt}
              remarks={remarks}
              currentLevel={approval.currentLevel}
              totalLevel={approval.totalLevel}
              activeLevel={approval.activeLevel}
              allowActions={true}
              currentUserId={user.id}
              roles={user.role}
              status={approval.status}
              onActionComplete={onActionComplete}
              onClick={() =>
                onViewForm(submission.id, submission.formType.name, "pending")
              }
            />
          );
        } else {
          const form = item.data;

          // Find this user's approval inside the form
          const myApproval = form.approvals?.find(
            (a) => a.approverId === user.id,
          );

          return (
            <BannerCard
              key={`form-${form.id}`}
              approvalId={myApproval?.id} // 👈 important
              approvalUserId={myApproval?.approverId}
              currentUserId={user.id}
              profileImg={user.attachment || ""}
              title={form.formType.name}
              name={"You"}
              createddate={form.createdAt}
              remarks={(form.formData?.remarks as string) || "No remarks yet"}
              currentLevel={form.currentLevel ?? 0}
              totalLevel={form.totalLevel ?? 0}
              activeLevel={form.activeLevel ?? 0}
              allowActions={true}
              roles={user.role}
              status={form.status}
              onClick={() => onViewForm(form.id, form.formType.name, "pending")}
            />
          );
        }
      }}
    />

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
            <div key={report.id} onClick={() => onViewReport?.(report.id)} className="bg-white w-full rounded-xl border border-gray-300 shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all duration-200 p-4 cursor-pointer">
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
