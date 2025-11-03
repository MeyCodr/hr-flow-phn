import React from "react";
import BannerCard from "../../ui/BannerCard";
import { Approval } from "../ApprovalComponent";
import { SelfForm, UserType } from "@/app/types/types";
import PaginatedList from "../../ui/PaginatedList";

interface HistoryContentProps {
  approvalsHistory: Approval[];
  userFormsHistory: SelfForm[];
  user: UserType;
  onViewForm: (formId: number, formName: string) => void;
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
}: HistoryContentProps) {
  // Combine approvals and forms into one unified list
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

  if (historyItems.length === 0) {
    return <p className="text-gray-600">No history found.</p>;
  }

  return (
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
              createddate={new Date(submission.createdAt).toLocaleDateString()}
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
                onViewForm(submission.id, submission.formType.name)
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
              createddate={new Date(form.createdAt).toLocaleDateString()}
              remarks={(form.formData?.remarks as string) || "No remarks"}
              currentLevel={form.currentLevel ?? 0}
              totalLevel={form.totalLevel ?? 0}
              activeLevel={form.activeLevel ?? 0}
              roles={user.role}
              status={form.status}
              onClick={() => onViewForm(form.id, form.formType.name)}
            />
          );
        }
      }}
    />
  );
}
