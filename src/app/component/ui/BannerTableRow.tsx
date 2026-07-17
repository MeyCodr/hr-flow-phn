import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PrimaryButton from "./PrimaryButton";
import axios from "axios";
import ActionModal from "./ActionModal";
import toast from "react-hot-toast";
import { withBasePath } from "@/lib/base-path";

function formatDisplayDate(value: string | Date | null | undefined): string {
  if (!value) return "-";

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "-" : value.toLocaleDateString("en-GB");
  }

  const rawValue = value.trim();
  const parsedDate = new Date(rawValue);

  return Number.isNaN(parsedDate.getTime())
    ? rawValue
    : parsedDate.toLocaleDateString("en-GB");
}

export interface BannerTableRowProps {
  approvalId?: number;
  approvalUserId?: number;
  currentUserId?: number;
  allowActions?: boolean;
  title: string;
  name: string;
  department?: string | null;
  createddate: string | Date | null | undefined;
  lastApprovalDate?: string | Date | null;
  currentLevel: number; // this approver's level
  totalLevel: number; // total approval steps
  activeLevel?: number; // lowest currently active approval level
  roles?: string;
  status?: string;
  onActionComplete?: () => void;
  onClick?: () => void;
  profileImg?: string;
}

export default function BannerTableRow({
  approvalId,
  approvalUserId,
  currentUserId,
  allowActions = false,
  title,
  name,
  department,
  createddate,
  lastApprovalDate,
  currentLevel,
  totalLevel,
  activeLevel,
  roles,
  status,
  onActionComplete,
  onClick,
  profileImg,
}: BannerTableRowProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [formattedLastApprovalDate, setFormattedLastApprovalDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );

  useEffect(() => {
    setFormattedDate(formatDisplayDate(createddate));
  }, [createddate]);

  useEffect(() => {
    setFormattedLastApprovalDate(formatDisplayDate(lastApprovalDate));
  }, [lastApprovalDate]);

  const isFormCompleted = status === "APPROVED" || status === "REJECTED";
  const isWaitingForOtherLevel =
    activeLevel !== undefined && currentLevel !== activeLevel;
  const isLocked = isFormCompleted || isWaitingForOtherLevel;

  const statusColor =
    status === "APPROVED"
      ? "bg-green-100 text-green-700"
      : status === "REJECTED"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  const performApproval = async (remarks: string) => {
    if (!approvalId || !actionType) return;

    setLoading(true);
    try {
      await axios.post(withBasePath("/api/approval-form/action"), {
        approvalId,
        action: actionType,
        remarks,
      });
      toast.success("Form has been processed successfully.", {
        id: `approval-success-${approvalId}`,
        duration: 3000,
      });
      if (onActionComplete) await onActionComplete();
    } catch (error) {
      console.error("Error handling approval action:", error);
      toast.error("There was an error processing the form. Please try again.", {
        id: `approval-error-${approvalId}`,
        duration: 4000,
      });
    } finally {
      setLoading(false);
      setConfirmModalOpen(false);
      setActionType(null);
    }
  };

  const confirmAction = (type: "approve" | "reject") => {
    setActionType(type);
    setConfirmModalOpen(true);
  };

  const openForm = () => {
    if (onClick) {
      onClick();
    }
  };

  const isMyApproval = approvalUserId === currentUserId;
  const canApprove =
    allowActions &&
    isMyApproval &&
    status === "PENDING" &&
    currentLevel === activeLevel;

  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (parts[0]?.[0]?.toUpperCase() ?? "?");

  return (
    <>
      <tr
        onClick={openForm}
        className="cursor-pointer divide-x divide-gray-100 border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors"
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-700 text-white font-semibold w-8 h-8 flex items-center justify-center rounded-full text-xs overflow-hidden flex-shrink-0">
              {profileImg ? (
                <Image
                  src={profileImg}
                  alt="Profile"
                  width={32}
                  height={32}
                  sizes="32px"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <span className="font-medium text-indigo-700 text-xs">{name}</span>
          </div>
        </td>

        <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
          {title}
        </td>

        <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
          {department || "-"}
        </td>

        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
          {formattedDate}
        </td>

        <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap text-center">
          {currentLevel} / {totalLevel}
        </td>

        <td className="px-4 py-3 whitespace-nowrap">
          {status && (
            <span
              className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}
            >
              {status.toLowerCase()}
            </span>
          )}
        </td>

        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
          {formattedLastApprovalDate}
        </td>

        <td
          className="px-4 py-3"
          onClick={(e) => e.stopPropagation()}
        >
          {!roles || roles === "STAFF" ? (
            <span className="text-gray-300 text-xs">-</span>
          ) : canApprove ? (
            <div className="flex flex-col items-start gap-1">
              <div className="flex gap-2">
                <PrimaryButton
                  name={loading ? "..." : "Reject"}
                  disabled={isLocked || loading}
                  className={`w-20 rounded-md py-1.5 text-xs font-medium transition-all duration-200 ${
                    isLocked
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmAction("reject");
                  }}
                />
                <PrimaryButton
                  name={loading ? "..." : "Approve"}
                  disabled={isLocked || loading}
                  className={`w-20 rounded-md py-1.5 text-xs font-medium transition-all duration-200 ${
                    isLocked
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-700 hover:bg-indigo-800 text-white cursor-pointer"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmAction("approve");
                  }}
                />
              </div>
              {isLocked && (
                <p className="text-[0.6rem] text-gray-500 italic">
                  Waiting for Level {activeLevel}
                </p>
              )}
            </div>
          ) : isFormCompleted ? (
            <span
              className={`text-[0.65rem] italic ${
                status === "APPROVED" ? "text-green-600" : "text-red-600"
              }`}
            >
              {status?.toLowerCase()}
            </span>
          ) : (
            <span className="text-gray-300 text-xs">-</span>
          )}
        </td>
      </tr>
      {typeof document !== "undefined" &&
        createPortal(
          <ActionModal
            isOpen={confirmModalOpen}
            title={`Do you want to ${
              actionType === "approve" ? "approve" : "reject"
            } this form?`}
            message={`Please check the details carefully. Once ${
              actionType === "approve" ? "approved" : "rejected"
            }, this action cannot be undone.`}
            onConfirm={(remarks) => performApproval(remarks)}
            onCancel={() => setConfirmModalOpen(false)}
            confirmText={actionType === "approve" ? "Approve" : "Reject"}
            cancelText="Cancel"
          />,
          document.body,
        )}
    </>
  );
}
