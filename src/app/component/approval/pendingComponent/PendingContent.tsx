import React from "react";
import BannerCard from "../../ui/BannerCard";
import { SelfForm, UserType } from "@/app/types/types";
import { Approval } from "../ApprovalComponent";
import PaginatedList from "../../ui/PaginatedList";

interface PendingContentProps {
  approvals: Approval[];
  userPendingForms: SelfForm[];
  user: UserType;
  onActionComplete?: () => void;
  onViewForm: (formId: number, formName: string) => void;
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
}: PendingContentProps) {
  const pendingApprovals = approvals.filter(
    (approval) => approval.status === "PENDING",
  );

  const pendingItems: PendingItem[] = [
    ...pendingApprovals.map((approval) => ({
      type: "approval" as const,
      data: approval,
    })),
    ...userPendingForms.map((form) => ({ type: "form" as const, data: form })),
  ];

  if (pendingItems.length === 0) {
    return <p className="text-gray-600">No pending items found.</p>;
  }

  return (
    <PaginatedList
      items={pendingItems}
      pageSize={10}
      renderItem={(item) => {
        console.log("item: ", item);
        if (item.type === "approval") {
          const approval = item.data;
          console.log("approval: ", approval);
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
              createddate={new Date(submission.createdAt).toLocaleDateString()}
              remarks={remarks}
              currentLevel={approval.currentLevel}
              totalLevel={approval.totalLevel}
              activeLevel={approval.activeLevel}
              currentUserId={user.id}
              roles={user.role}
              status={approval.status}
              onActionComplete={onActionComplete}
              onClick={() =>
                onViewForm(submission.id, submission.formType.name)
              }
            />
          );
        } else {
          const form = item.data;

          // Find this user's approval inside the form
          const myApproval = form.approvals?.find(
            (a) => a.approverId === user.id,
          );

          const canApprove =
            myApproval &&
            myApproval.status === "PENDING" &&
            form.activeLevel === myApproval.stepOrder;

          return (
            <BannerCard
              key={`form-${form.id}`}
              approvalId={myApproval?.id} // 👈 important
              approvalUserId={myApproval?.approverId}
              currentUserId={user.id}
              profileImg={user.attachment || ""}
              title={form.formType.name}
              name={"You"}
              createddate={new Date(form.createdAt).toLocaleDateString()}
              remarks={(form.formData?.remarks as string) || "No remarks yet"}
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
