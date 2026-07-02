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
import ViewSexualHarassmentReport, { FullSexualHarassmentReport } from "../compliance/ViewSexualHarassmentReport";
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

export interface SexualHarassmentReportItem {
  id: number;
  reporterName: string;
  description: string;
  status: string;
  createdAt: string | Date;
}

interface ApprovalComponentProps {
  pendingApprovals: Approval[];
  selfForms: SelfForm[];
  user: UserType;
  sexualHarassmentReports?: SexualHarassmentReportItem[];
  sexualHarassmentReportsHistory?: SexualHarassmentReportItem[];
}

type ViewSource = "pending" | "submissions" | "history";

export default function ApprovalComponent({
  pendingApprovals,
  selfForms,
  user,
  sexualHarassmentReports = [],
  sexualHarassmentReportsHistory = [],
}: ApprovalComponentProps) {
  const [approvals, setApprovals] = useState(pendingApprovals);
  const [forms, setForms] = useState(selfForms);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isViewing, setIsViewing] = useState(false);
  const [viewedFormData, setViewedFormData] = useState<SelfFormData | null>(null);
  const [viewSource, setViewSource] = useState<ViewSource>("pending");
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isViewingReport, setIsViewingReport] = useState(false);
  const [viewedReport, setViewedReport] = useState<FullSexualHarassmentReport | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const approvalRoute = "/dashboard/approval";
  const approvalPagePath = withBasePath(approvalRoute);

  useEffect(() => {
    const id = searchParams.get("id");
    const shrid = searchParams.get("shrid");
    if (!id && !shrid && (pathname === approvalRoute || pathname === approvalPagePath)) {
      setIsViewing(false);
      setViewedFormData(null);
      setViewSource("pending");
      setIsNavigatingBack(false);
      setIsViewingReport(false);
      setViewedReport(null);
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

  const handleViewReport = useCallback(async (reportId: number) => {
    setIsNavigatingBack(false);
    setIsViewingReport(true);
    try {
      const res = await axios.get(withBasePath(`/api/compliance/sexual-harassment/${reportId}`));
      setViewedReport(res.data.data);
      router.replace(`${approvalRoute}?shrid=${reportId}&name=Sexual+Harassment+Report`);
    } catch (error) {
      console.error(error);
      setIsViewingReport(false);
    }
  }, [approvalRoute, router]);

  useEffect(() => {
    if (isNavigatingBack) return;
    const shrid = searchParams.get("shrid");
    if (shrid && (!viewedReport || viewedReport.id !== Number(shrid))) {
      handleViewReport(Number(shrid));
    }
  }, [handleViewReport, isNavigatingBack, searchParams, viewedReport]);

  const handleBack = () => {
    setIsNavigatingBack(true);
    setIsViewing(false);
    setViewedFormData(null);
    setViewSource("pending");
    router.replace(approvalRoute);
  };

  const handleBackFromReport = () => {
    setIsNavigatingBack(true);
    setIsViewingReport(false);
    setViewedReport(null);
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

  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

  const isInRange = (date: string | Date) => {
    const d = new Date(date);
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  };

  const filteredApprovals = approvals.filter((a) =>
    isInRange(a.submission?.createdAt ?? new Date()),
  );
  const filteredForms = forms.filter((f) => isInRange(f.createdAt));

  const formsWithLevels = filteredForms.map((form) => {
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

  const approvalsHistory = filteredApprovals.filter(
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
          approvals={filteredApprovals}
          userPendingForms={userPendingForms}
          user={user}
          onActionComplete={refreshData}
          onViewForm={handleViewForm}
          onViewReport={handleViewReport}
          sexualHarassmentReports={sexualHarassmentReports}
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
          sexualHarassmentReports={sexualHarassmentReportsHistory}
          onViewReport={handleViewReport}
        />
      ),
    },
  ];

  const hasFilter = dateFrom || dateTo;

  const dateFilter = (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-0.5">
        <label className="text-xs font-medium text-gray-500">From</label>
        <input
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={(e) => setDateFrom(e.target.value)}
          className="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <label className="text-xs font-medium text-gray-500">To</label>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(e) => setDateTo(e.target.value)}
          className="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      {hasFilter && (
        <button
          onClick={() => { setDateFrom(""); setDateTo(""); }}
          className="text-xs text-indigo-700 hover:text-indigo-900 underline mt-4"
        >
          Clear
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col my-6 w-full max-w-6xl">
      <div className="text-sm">
        <Toaster position="top-right" />
      </div>
      <AnimatePresence mode="wait">
        {isViewingReport && viewedReport ? (
          <motion.div
            key="viewing-report"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            <ViewSexualHarassmentReport
              report={viewedReport}
              onBack={handleBackFromReport}
              onUpdate={(updated) =>
                setViewedReport((prev) => prev ? { ...prev, ...updated } : prev)
              }
            />
          </motion.div>
        ) : isViewing && viewedFormData ? (
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
            <Tabs tabs={categories} rightSlot={dateFilter} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
