import React from "react";
import BannerCard from "../../ui/BannerCard";
import { Approval } from "../ApprovalComponent";
import { SelfForm, UserType } from "@/app/types/types";

interface HistoryContentProps {
  approvalsHistory: Approval[];
  userFormsHistory: SelfForm[];
  user: UserType;
  onViewForm: (formId: number, formName: string) => void;
}

export default function HistoryContent({
  approvalsHistory,
  userFormsHistory,
  user,
  onViewForm,
}: HistoryContentProps) {
  const historyContent =
    approvalsHistory.length > 0 || userFormsHistory.length > 0 ? (
      <div className="flex flex-col gap-4">
        {/* Approvals handled by the user */}
        {approvalsHistory.map((approval) => {
          const submission = approval.submission;
          return (
            <BannerCard
              key={`approval-history-${approval.id}`}
              approvalId={approval.id}
              profileImg={""}
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
        })}

        {/* User’s submitted forms */}
        {userFormsHistory.map((form) => (
          <BannerCard
            key={`form-history-${form.id}`}
            profileImg={""}
            title={form.formType.name}
            name={"You"}
            createddate={new Date(form.createdAt).toLocaleDateString()}
            remarks={(form.formData?.remarks as string) || "No remarks"}
            currentLevel={form.currentLevel ?? 0}
            totalLevel={form.totalLevel ?? 0}
            activeLevel={form.activeLevel}
            roles={user.role}
            status={form.status}
            onClick={() => onViewForm(form.id, form.formType.name)}
          />
        ))}
      </div>
    ) : (
      <p className="text-gray-600">No history found.</p>
    );

  return <div>{historyContent}</div>;
}
