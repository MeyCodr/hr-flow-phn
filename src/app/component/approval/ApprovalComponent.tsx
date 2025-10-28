"use client";

import { SelfForm, UserType } from "@/app/types/types";
import Tabs, { TabItem } from "../ui/Tabs";
import { useEffect, useState } from "react";
import axios from "axios";
import PendingContent from "./pendingComponent/PendingContent";
import SubmissionContent from "./submissionComponent/SubmissionContent";
import HistoryContent from "./historyComponent/HistoryContent";
import ViewSubmission, {
  SelfFormData,
} from "./submissionComponent/ViewSubmission";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface User {
  fullname: string;
}

interface FormType {
  name: string;
}
interface Submission {
  id: number;
  createdBy: User;
  formType: FormType;
  formData: Record<string, unknown> | null;
  createdAt: string | Date;
}

export interface Approval {
  id: number;
  remarks?: string | null;
  currentLevel: number;
  totalLevel: number;
  activeLevel: number;
  submission: Submission;
  approverId: number;
  status: string;
  approver?: {
    email: string;
    fullname: string;
    id: number;
    staffid: string;
  };
  approvedAt?: Date | null;
}

interface ApprovalComponentProps {
  pendingApprovals: Approval[];
  selfForms: SelfForm[];
  user: UserType;
}

export default function ApprovalComponent({
  pendingApprovals,
  selfForms,
  user,
}: ApprovalComponentProps) {
  const [approvals, setApprovals] = useState(pendingApprovals);
  const [forms, setForms] = useState(selfForms);
  const [isViewing, setIsViewing] = useState(false);
  const [viewedFormData, setViewedFormData] = useState<SelfFormData | null>(
    null
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");

    if (!id && pathname === "/dashboard/approval") {
      // Reset when no query params present (sidebar click)
      setIsViewing(false);
      setViewedFormData(null);
    }
  }, [pathname, searchParams]);

  const refreshData = async () => {
    const res = await axios.get("/api/approval-form/fetch");
    console.log("res.data: ", res.data);
    if (res.data) {
      setApprovals(res.data.pendingApprovals);
      setForms(
        res.data.selfForms.map((form: SelfForm) => ({
          ...form,
          approvals: form.approvals || [], // make sure approvals are included
        }))
      );
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const formsWithLevels = forms.map((form) => {
    const approvals = form.approvals || []; // make sure approvals are included in your fetch
    const totalLevel = approvals.length;

    type ApprovalStep = NonNullable<SelfForm["approvals"]>[number];
    // Find the current active approval (lowest stepOrder still pending)
    const activeApproval = approvals.find(
      (a: ApprovalStep) => a.status === "PENDING"
    );
    const activeLevel = activeApproval ? activeApproval.stepOrder : totalLevel;

    return {
      ...form,
      totalLevel,
      currentLevel: activeLevel || 0, // show current level
      activeLevel,
    };
  });

  // Only user’s own PENDING forms
  const userPendingForms = formsWithLevels.filter(
    (form) => form.status === "PENDING"
  );

  const userFormsHistory = formsWithLevels.filter(
    (form) => form.status === "APPROVED" || form.status === "REJECTED"
  );

  const approvalsHistory = approvals.filter(
    (approval) =>
      approval.status === "APPROVED" || approval.status === "REJECTED"
  );

  const handleViewForm = async (formId: number, formName: string) => {
    setIsViewing(true);
    try {
      const [formRes, approvalRes] = await Promise.all([
        axios.get(`/api/form/${formId}`),
        axios.get(`/api/get-approval/${formId}`),
      ]);

      const formData = formRes.data;
      const approvalsWithNames = approvalRes.data.approvals;
      console.log("approvalsssss: ", approvalRes);

      console.log("Form data:", formData);
      console.log("Approvals with names:", approvalsWithNames);
      router.replace(`/dashboard/approval?id=${formId}&name=${formName}`);

      setViewedFormData({
        ...formData,
        approvals: approvalsWithNames,
      });
    } catch (error) {
      console.error("Error fetching form details:", error);
    }
  };

  const handleBack = () => {
    setIsViewing(false);
    setViewedFormData(null);
    router.push(`/dashboard/approval`);
  };

  if (isViewing && viewedFormData) {
    return (
      <ViewSubmission
        selfForm={viewedFormData}
        onBack={handleBack}
        onActionComplete={refreshData}
      />
    );
  }

  const categories: TabItem[] = [
    {
      name: "Pending",
      content: (
        <PendingContent
          approvals={approvals}
          userPendingForms={userPendingForms}
          user={user}
          onActionComplete={refreshData}
          onViewForm={handleViewForm}
        />
      ),
    },
    {
      name: "Submissions",
      content: (
        <SubmissionContent
          formsWithLevels={formsWithLevels}
          user={user}
          onViewForm={handleViewForm}
        />
      ),
    },
    {
      name: "History",
      content: (
        <HistoryContent
          approvalsHistory={approvalsHistory}
          userFormsHistory={userFormsHistory}
          user={user}
          onViewForm={handleViewForm}
        />
      ),
    },
  ];

  return (
    <div className="flex my-6">
      <div className="w-full max-w-6xl">
        <Tabs tabs={categories} />
      </div>
    </div>
  );
}
