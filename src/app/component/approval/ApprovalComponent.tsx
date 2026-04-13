"use client";

import { SelfForm, SelfFormData, UserType } from "@/app/types/types";
import Tabs, { TabItem } from "../ui/Tabs";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import PendingContent from "./pendingComponent/PendingContent";
import SubmissionContent from "./submissionComponent/SubmissionContent";
import HistoryContent from "./historyComponent/HistoryContent";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import ViewSubmission from "../form/ViewSubmission";
import { withBasePath } from "@/lib/base-path";
import { Toaster } from "react-hot-toast";

interface User {
  fullname: string;
  staffid: string;
  attachment?: string | null;
}

interface FormType {
  name: string;
}
export interface Submission {
  id: number;
  createdBy: User;
  formType: FormType;
  formData: Record<string, unknown> | null;
  createdAt: string | Date;
}

export interface Approval {
  stepOrder: number;
  id: number;
  remarks?: string | null;
  currentLevel: number;
  totalLevel: number;
  activeLevel: number;
  approverId: number;
  status: string;
  submission?: Submission;
  approver?: {
    email: string;
    fullname: string;
    id: number;
    staffid: string;
  };
  approvedAt?: Date | null;
  attachment?: string | null;
}

interface ApprovalComponentProps {
  pendingApprovals: Approval[];
  selfForms: SelfForm[];
  user: UserType;
}

type ViewSource = "pending" | "submissions" | "history";

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
  const [viewSource, setViewSource] = useState<ViewSource>("pending");
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const approvalRoute = "/dashboard/approval";
  const approvalPagePath = withBasePath(approvalRoute);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id && (pathname === approvalRoute || pathname === approvalPagePath)) {
      setIsViewing(false);
      setViewedFormData(null);
      setViewSource("pending");
      setIsNavigatingBack(false);
    }
  }, [approvalPagePath, approvalRoute, pathname, searchParams]);

  const refreshData = useCallback(async () => {
    const res = await axios.get(withBasePath("/api/approval-form/fetch"));
    if (res.data) {
      setApprovals(res.data.pendingApprovals);
      setForms(
        res.data.selfForms.map((form: SelfForm) => ({
          ...form,
          approvals: form.approvals || [],
        }))
      );
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleViewForm = useCallback(
    async (formId: number, formName: string, source: ViewSource) => {
      setIsNavigatingBack(false);
      setIsViewing(true);
      setViewSource(source);
      try {
        const [formRes, approvalRes] = await Promise.all([
          axios.get(withBasePath(`/api/form/${formId}`)),
          axios.get(withBasePath(`/api/get-approval/${formId}`)),
        ]);
        const formData = formRes.data;
        const approvalsWithNames = approvalRes.data.approvals;

        router.replace(`${approvalRoute}?id=${formId}&name=${formName}`);

        setViewedFormData({ ...formData, approvals: approvalsWithNames });
      } catch (error) {
        console.error(error);
      }
    },
    [approvalRoute, router],
  );

  useEffect(() => {
    if (isNavigatingBack) return;

    const id = searchParams.get("id");
    const name = searchParams.get("name");
    if (id && name && (!viewedFormData || viewedFormData.id !== Number(id))) {
      handleViewForm(Number(id), name, viewSource);
    }
  }, [handleViewForm, isNavigatingBack, searchParams, viewSource, viewedFormData]);

  const handleBack = () => {
    setIsNavigatingBack(true);
    setIsViewing(false);
    setViewedFormData(null);
    setViewSource("pending");
    router.replace(approvalRoute);
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const formVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, x: 50, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const formsWithLevels = forms.map((form) => {
    const approvalsList = form.approvals || [];

    const grouped = approvalsList.reduce<Record<number, Approval[]>>(
      (acc, approval) => {
        if (!acc[approval.stepOrder]) acc[approval.stepOrder] = [];
        acc[approval.stepOrder].push(approval as unknown as Approval);
        return acc;
      },
      {}
    );

    const uniqueStepOrders = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b);
    const stepOrderToLevel = new Map(
      uniqueStepOrders.map((stepOrder, index) => [stepOrder, index + 1]),
    );
    const totalLevel = uniqueStepOrders.length; // unique steps

    // Find active step: first step containing ANY PENDING approval
    const activeStep = Object.values(grouped).find((stepGroup) =>
      stepGroup.some((a) => a.status === "PENDING")
    );

    const activeLevel = activeStep
      ? (stepOrderToLevel.get(activeStep[0].stepOrder) ?? totalLevel)
      : totalLevel; // if none pending, last level is active

    return {
      ...form,
      groupedApprovals: grouped, // optional if you need grouped data
      totalLevel,
      currentLevel: activeLevel,
      activeLevel,
    };
  });

  const userPendingForms = formsWithLevels.filter(
    (f) => f.status === "PENDING"
  );
  const userFormsHistory = formsWithLevels.filter(
    (f) =>
      f.status === "APPROVED" ||
      f.status === "REJECTED" ||
      f.status === "ESCALATED"
  );


  const approvalsHistory = approvals.filter(
    (a) =>
      a.status === "APPROVED" ||
      a.status === "REJECTED" ||
      a.status === "ESCALATED"
  );

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
    <div className="flex my-6 w-full max-w-6xl">
      <div className="text-sm">
        <Toaster position="top-right" />
      </div>
      <AnimatePresence mode="wait">
        {isViewing && viewedFormData ? (
          <motion.div
            key="viewing"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            <ViewSubmission
              selfForm={viewedFormData}
              onBack={handleBack}
              onActionComplete={refreshData}
              allowActions={viewSource === "pending"}
            />
          </motion.div>
        ) : (
          <motion.div
            key="tabs"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            <Tabs tabs={categories} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
