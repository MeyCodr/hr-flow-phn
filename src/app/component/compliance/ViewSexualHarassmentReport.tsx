"use client";

import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { IoReturnDownBack } from "react-icons/io5";
import Label from "@/app/component/ui/Label";
import PrimaryButton from "@/app/component/ui/PrimaryButton";
import ActionModal from "@/app/component/ui/ActionModal";
import { withBasePath } from "@/lib/base-path";
import { reportAsOptions, evidenceTypeOptions } from "@/lib/data";

const labelClassName = "block text-xs font-medium text-gray-900";

function ReadField({ value }: { value?: string | null }) {
  return (
    <div className="w-full border border-gray-200 rounded-md py-2 px-3 text-xs bg-gray-50 text-gray-900 min-h-[34px]">
      {value || <span className="text-gray-400 italic">—</span>}
    </div>
  );
}

function ReadCheckboxGroup({
  options,
  value,
}: {
  options: { value: string; label: string }[];
  value?: string | null;
}) {
  return (
    <div className="text-xs">
      {options.map((option) => (
        <div key={option.value} className="flex items-center gap-4 mb-2">
          <div
            className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
              value === option.value
                ? "bg-indigo-700 border-indigo-700"
                : "border-gray-300 bg-white"
            }`}
          >
            {value === option.value && (
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <span className="text-xs text-gray-900">{option.label}</span>
        </div>
      ))}
    </div>
  );
}

export type ReportAttachment = { id: number; fileName: string };

export type FullSexualHarassmentReport = {
  id: number;
  reporterName: string;
  reporterContact: string;
  reporterEmail: string | null;
  isStaff: boolean;
  staffId: string | null;
  workLocation: string | null;
  divisionName: string | null;
  departmentName: string | null;
  sectionName: string | null;
  reportAs: string | null;
  perpetratorName: string | null;
  victimName: string | null;
  incidentLocation: string | null;
  incidentDateTime: string | null;
  description: string;
  witnessName: string | null;
  evidenceType: string | null;
  caseNotes: string | null;
  status: string;
  createdAt: string;
  attachments: ReportAttachment[];
};

interface Props {
  report: FullSexualHarassmentReport;
  onBack: () => void;
  onUpdate: (updated: Partial<FullSexualHarassmentReport>) => void;
}

export default function ViewSexualHarassmentReport({
  report,
  onBack,
  onUpdate,
}: Props) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isClosed = report.status === "RESOLVED" || report.status === "CLOSED";

  const ACTION_CONFIG: Record<
    string,
    {
      label: string;
      nextStatus: string;
      className: string;
      modalTitle: string;
      modalMessage: string;
      confirmText: string;
      successMessage: string;
    }
  > = {
    acknowledge: {
      label: "Acknowledge",
      nextStatus: "UNDER_REVIEW",
      className:
        "border border-indigo-800 bg-indigo-800 text-white px-6 py-2 shadow-md text-xs rounded-sm cursor-pointer hover:bg-indigo-700 transition-all",
      modalTitle: "Acknowledge this report?",
      modalMessage:
        "This will mark the report as under review and begin the investigation process.",
      confirmText: "Acknowledge",
      successMessage: "Report acknowledged. Case is now under review.",
    },
    resolve: {
      label: "Resolve",
      nextStatus: "RESOLVED",
      className:
        "border border-green-700 bg-green-700 text-white px-6 py-2 shadow-md text-xs rounded-sm cursor-pointer hover:bg-green-800 transition-all",
      modalTitle: "Resolve this report?",
      modalMessage:
        "This will mark the case as resolved. Please provide resolution notes.",
      confirmText: "Resolve",
      successMessage: "Case has been resolved successfully.",
    },
    dismiss: {
      label: "Dismiss",
      nextStatus: "CLOSED",
      className:
        "border border-red-600 bg-red-600 text-white px-6 py-2 shadow-md text-xs rounded-sm cursor-pointer hover:bg-red-700 transition-all",
      modalTitle: "Dismiss this report?",
      modalMessage:
        "This will close the case without resolution. Please provide a reason.",
      confirmText: "Dismiss",
      successMessage: "Case has been closed.",
    },
  };

  const actionsForStatus: Record<string, string[]> = {
    SUBMITTED: ["acknowledge"],
    UNDER_REVIEW: ["resolve", "dismiss"],
  };

  const currentActions = actionsForStatus[report.status] ?? [];

  const handleActionClick = (actionKey: string) => {
    setPendingStatus(actionKey);
    setConfirmModalOpen(true);
  };

  const performAction = async (remarks: string) => {
    if (!pendingStatus) return;
    const config = ACTION_CONFIG[pendingStatus];
    setLoading(true);
    try {
      await axios.patch(
        withBasePath(`/api/compliance/sexual-harassment/${report.id}`),
        {
          status: config.nextStatus,
          caseNotes: remarks,
        },
      );
      onUpdate({ status: config.nextStatus, caseNotes: remarks });
      toast.success(config.successMessage);
    } catch {
      toast.error("Failed to update report");
    } finally {
      setLoading(false);
      setConfirmModalOpen(false);
      setPendingStatus(null);
    }
  };

  const downloadAttachment = (id: number) => {
    window.open(
      withBasePath(`/api/compliance/sexual-harassment/attachment/${id}`),
      "_blank",
    );
  };

  const statusColor =
    report.status === "RESOLVED"
      ? "bg-green-100 text-green-700"
      : report.status === "CLOSED"
        ? "bg-red-100 text-red-700"
        : report.status === "UNDER_REVIEW"
          ? "bg-blue-100 text-blue-700"
          : "bg-yellow-100 text-yellow-700";

  const activeConfig = pendingStatus ? ACTION_CONFIG[pendingStatus] : null;

  return (
    <>
      <div className="text-xs">
        <Toaster position="top-right" />
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg px-6 py-4 text-sm font-medium text-gray-700 shadow-lg">
            Saving...
          </div>
        </div>
      )}

      <div className="bg-white my-6 p-6 rounded-lg border border-gray-300 shadow-xs">
        {/* Header */}
        <div className="mb-4 flex justify-between">
          <PrimaryButton
            name="Back to list"
            icon={<IoReturnDownBack className="w-5 h-5" />}
            onClick={onBack}
            className="text-indigo-800 hover:text-indigo-500 text-xs font-medium cursor-pointer"
          />
          <span
            className={`px-4 py-2 text-xs font-semibold rounded ${statusColor}`}
          >
            {report.status.replace("_", " ")}
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Sexual Harassment Report
          </h1>
          <p className="text-xs text-indigo-800 font-light">
            This form is strictly for reference/viewing.
          </p>
        </div>

        <h2 className="font-semibold text-sm mb-4">Your details</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col space-y-2">
            <Label
              name="Full Name"
              htmlFor="reporterName"
              className={labelClassName}
            />
            <ReadField value={report.reporterName} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label
              name="Contact Number"
              htmlFor="reporterContact"
              className={labelClassName}
            />
            <ReadField value={report.reporterContact} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label
              name="Email"
              htmlFor="reporterEmail"
              className={labelClassName}
            />
            <ReadField value={report.reporterEmail} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label
              name="Staff ID"
              htmlFor="staffId"
              className={labelClassName}
            />
            <ReadField value={report.staffId} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label
              name="Work Location"
              htmlFor="workLocation"
              className={labelClassName}
            />
            <ReadField value={report.workLocation} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label
              name="Division"
              htmlFor="divisionName"
              className={labelClassName}
            />
            <ReadField value={report.divisionName} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label
              name="Department"
              htmlFor="departmentName"
              className={labelClassName}
            />
            <ReadField value={report.departmentName} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label
              name="Section"
              htmlFor="sectionName"
              className={labelClassName}
            />
            <ReadField value={report.sectionName} />
          </div>
        </div>

        <h2 className="font-semibold text-sm mb-4">What happened</h2>

        <div className="flex flex-col space-y-2 mb-6">
          <Label
            name="Anda ingin membuat laporan sebagai? / You wish to lodge report as?"
            htmlFor="reportAs"
            className={labelClassName}
          />
          <ReadCheckboxGroup
            options={reportAsOptions}
            value={report.reportAs}
          />
        </div>

        <Label
          name="Sila jelaskan kejadian yang berlaku / Please explain the incident occured:"
          htmlFor="description"
          className={`${labelClassName} mb-4 block`}
        />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col space-y-2">
            <Label
              name="a. Nama Pelaku (Perpetrator's name)"
              htmlFor="perpetratorName"
              className={labelClassName}
            />
            <ReadField value={report.perpetratorName} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label
              name="b. Nama Mangsa (Victim's name)"
              htmlFor="victimName"
              className={labelClassName}
            />
            <ReadField value={report.victimName} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label
              name="c. Tempat Kejadian (Location)"
              htmlFor="incidentLocation"
              className={labelClassName}
            />
            <ReadField value={report.incidentLocation} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label
              name="d. Tarikh / Masa kejadian (Date / time)"
              htmlFor="incidentDateTime"
              className={labelClassName}
            />
            <ReadField
              value={
                report.incidentDateTime
                  ? new Date(report.incidentDateTime).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : null
              }
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2 mb-6">
          <Label
            name="e. Maklumat Kejadian (Incident details)"
            htmlFor="description"
            className={labelClassName}
          />
          <div className="w-full border border-gray-200 rounded-md py-2 px-3 text-xs bg-gray-50 text-gray-900 min-h-[120px] whitespace-pre-wrap">
            {report.description || (
              <span className="text-gray-400 italic">—</span>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2 mb-6">
          <Label
            name="f. Nama saksi (jika ada) (Witness name, if any)"
            htmlFor="witnessName"
            className={labelClassName}
          />
          <ReadField value={report.witnessName} />
        </div>

        <div className="flex flex-col space-y-2 mb-6">
          <Label
            name="Adakah anda mempunyai bukti yang boleh menyokong kenyataan anda? / Do you have any evidence to support your statement?"
            htmlFor="evidenceType"
            className={labelClassName}
          />
          <ReadCheckboxGroup
            options={evidenceTypeOptions}
            value={report.evidenceType}
          />
        </div>

        {report.attachments.length > 0 && (
          <div className="flex flex-col space-y-2 mb-6">
            <Label
              name="Supporting evidence"
              htmlFor="attachments"
              className={labelClassName}
            />
            {report.attachments.map((att) => (
              <button
                key={att.id}
                type="button"
                onClick={() => downloadAttachment(att.id)}
                className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-xs bg-white border-gray-300 text-gray-600 hover:border-indigo-800 hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer transition"
              >
                <span className="truncate">📎 {att.fileName}</span>
                <span className="ml-2 rounded px-3 py-1 text-xs font-medium text-white bg-indigo-800">
                  Download
                </span>
              </button>
            ))}
          </div>
        )}

        {!isClosed && currentActions.length > 0 && (
          <div className="flex gap-x-4 justify-end mt-4">
            {currentActions.map((actionKey) => {
              const cfg = ACTION_CONFIG[actionKey];
              return (
                <PrimaryButton
                  key={actionKey}
                  name={cfg.label}
                  type="button"
                  onClick={() => handleActionClick(actionKey)}
                  className={cfg.className}
                />
              );
            })}
          </div>
        )}
      </div>

      {activeConfig && (
        <ActionModal
          isOpen={confirmModalOpen}
          title={activeConfig.modalTitle}
          message={activeConfig.modalMessage}
          onConfirm={(remarks) => {
            performAction(remarks);
            setConfirmModalOpen(false);
          }}
          onCancel={() => {
            setConfirmModalOpen(false);
            setPendingStatus(null);
          }}
          confirmText={activeConfig.confirmText}
          cancelText="Cancel"
          inputLabel="Case notes / Remarks"
          inputPlaceholder="Enter your notes or remarks here..."
        />
      )}
    </>
  );
}
