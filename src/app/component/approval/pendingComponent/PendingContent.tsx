import React from "react";
import BannerTableRow from "../../ui/BannerTableRow";
import ApprovalTable from "../../ui/ApprovalTable";
import { SelfForm, UserType } from "@/app/types/types";
import { Approval, SexualHarassmentReportItem } from "../ApprovalComponent";
import SexualHarassmentReportsTable from "../SexualHarassmentReportsTable";
import { getApprovalActionDate, getActionsSortValue, getLastApprovalDate } from "../approvalDateUtils";

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
      {pendingItems.length > 0 && (
      <ApprovalTable
        items={pendingItems}
        pageSize={20}
        columns={[
          {
            label: "Requester",
            sortAccessor: (item) =>
              item.type === "approval" ? item.data.submission?.createdBy.fullname : "You",
          },
          {
            label: "Form Type",
            sortAccessor: (item) =>
              item.type === "approval" ? item.data.submission?.formType.name : item.data.formType.name,
          },
          {
            label: "Department",
            sortAccessor: (item) =>
              item.type === "approval"
                ? item.data.submission?.createdBy.department?.name
                : user.department?.name,
          },
          {
            label: "Date",
            sortAccessor: (item) =>
              item.type === "approval" ? item.data.submission?.createdAt : item.data.createdAt,
          },
          {
            label: "Level",
            sortAccessor: (item) =>
              item.type === "approval" ? item.data.currentLevel : item.data.currentLevel ?? 0,
          },
          { label: "Status", sortAccessor: (item) => item.data.status },
          {
            label: "Last Approval Date",
            sortAccessor: (item) =>
              item.type === "approval"
                ? getApprovalActionDate(item.data)
                : getLastApprovalDate(item.data.approvals),
          },
          {
            label: "Actions",
            sortAccessor: (item) => {
              if (item.type === "approval") {
                const approval = item.data;
                return getActionsSortValue({
                  status: approval.status,
                  roles: user.role,
                  canApprove:
                    approval.approverId === user.id &&
                    approval.currentLevel === approval.activeLevel,
                });
              }
              const form = item.data;
              const myApproval = form.approvals?.find((a) => a.approverId === user.id);
              return getActionsSortValue({
                status: form.status,
                roles: user.role,
                canApprove: !!myApproval && form.currentLevel === form.activeLevel,
              });
            },
          },
        ]}
        emptyMessage="No pending items found."
        renderRow={(item) => {
          if (item.type === "approval") {
            const approval = item.data;
            const submission = approval.submission;
            if (!submission) return null;
            return (
              <BannerTableRow
                key={`approval-${approval.id}`}
                approvalId={approval.id}
                approvalUserId={approval.approverId}
                profileImg={submission.createdBy.attachment || ""}
                title={submission.formType.name}
                name={submission.createdBy.fullname}
                department={submission.createdBy.department?.name}
                createddate={submission.createdAt}
                lastApprovalDate={getApprovalActionDate(approval)}
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
              <BannerTableRow
                key={`form-${form.id}`}
                approvalId={myApproval?.id} // 👈 important
                approvalUserId={myApproval?.approverId}
                currentUserId={user.id}
                profileImg={user.attachment || ""}
                title={form.formType.name}
                name={"You"}
                department={user.department?.name}
                createddate={form.createdAt}
                lastApprovalDate={getLastApprovalDate(form.approvals)}
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
      )}

      <SexualHarassmentReportsTable
        reports={sexualHarassmentReports}
        onViewReport={onViewReport}
      />
    </div>
  );
}
