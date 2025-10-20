"use client";

import BannerCard from "../ui/BannerCard";
import Tabs, { TabItem } from "../ui/Tabs";

interface User {
  fullname: string;
}

interface FormType {
  name: string;
}

interface Submission {
  createdBy: User;
  formType: FormType;
  createdAt: string | Date;
}

interface Approval {
  id: number;
  remarks?: string | null;
  currentLevel: number;
  totalLevel: number;
  activeLevel: number;
  submission: Submission;
}

interface ApprovalComponentProps {
  pendingApprovals: Approval[];
}

export default function ApprovalComponent({
  pendingApprovals,
}: ApprovalComponentProps) {
  const pendingContent =
    pendingApprovals.length > 0 ? (
      <div className="flex flex-col gap-4">
        {pendingApprovals.map((approval) => {
          const submission = approval.submission;
          return (
            <BannerCard
              key={approval.id}
              profileImg={""}
              title={submission.formType.name}
              name={submission.createdBy.fullname}
              createddate={new Date(submission.createdAt).toLocaleDateString()}
              remarks={approval.remarks || "No remarks yet"}
              currentLevel={approval.currentLevel}
              totalLevel={approval.totalLevel}
              activeLevel={approval.activeLevel}
            />
          );
        })}
      </div>
    ) : (
      <p className="text-gray-600">No pending approvals found.</p>
    );

  const categories: TabItem[] = [
    { name: "Pending", content: pendingContent },
    { name: "History", content: <p>History goes here</p> },
  ];

  return (
    <div className="flex my-6">
      <div className="w-full max-w-6xl">
        <Tabs tabs={categories} />
      </div>
    </div>
  );
}
