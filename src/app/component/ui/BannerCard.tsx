import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import PrimaryButton from "./PrimaryButton";
import axios from "axios";
import ActionModal from "./ActionModal";
import toast from "react-hot-toast";
import { withBasePath } from "@/lib/base-path";

export interface BannerCardProps {
  approvalId?: number;
  approvalUserId?: number;
  currentUserId?: number;
  allowActions?: boolean;
  title: string;
  name: string;
  createddate: string | Date | null | undefined;
  remarks: string;
  currentLevel: number; // this approver’s level
  totalLevel: number; // total approval steps
  activeLevel?: number; // lowest currently active approval level
  roles?: string;
  status?: string; // ✅ new status prop
  onActionComplete?: () => void; // Callback after action is complete
  onClick?: () => void; // Optional click handler
  profileImg?: string;
}

export default function BannerCard({
  approvalId,
  approvalUserId,
  currentUserId,
  allowActions = false,
  title,
  name,
  createddate,
  remarks,
  currentLevel,
  totalLevel,
  activeLevel,
  roles,
  status,
  onActionComplete,
  onClick,
  profileImg,
}: BannerCardProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );

  useEffect(() => {
    if (!createddate) {
      setFormattedDate("-");
      return;
    }

    if (createddate instanceof Date) {
      setFormattedDate(
        Number.isNaN(createddate.getTime())
          ? "-"
          : createddate.toLocaleDateString("en-GB"),
      );
      return;
    }

    const rawValue = createddate.trim();
    const parsedDate = new Date(rawValue);

    if (!Number.isNaN(parsedDate.getTime())) {
      setFormattedDate(parsedDate.toLocaleDateString("en-GB"));
      return;
    }

    setFormattedDate(rawValue);
  }, [createddate]);

  const isFormCompleted = status === "APPROVED" || status === "REJECTED";
  const isWaitingForOtherLevel =
    activeLevel !== undefined && currentLevel !== activeLevel;
  const isLocked = isFormCompleted || isWaitingForOtherLevel;

  // Status color
  const statusColor =
    status === "APPROVED"
      ? "bg-green-100 text-green-700"
      : status === "REJECTED"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700"; // Pending or other

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
      : parts[0][0].toUpperCase();

  return (
    <>
      <div
        onClick={openForm}
        className="bg-white w-full rounded-xl border border-gray-300 shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all duration-200 p-4 cursor-pointer"
      >
        {/* Top Section */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3 w-full">
            <div className="bg-indigo-700 text-white font-semibold w-10 h-10 flex items-center justify-center rounded-full text-sm overflow-hidden">
              {profileImg ? (
                <Image
                  src={profileImg}
                  alt="Profile"
                  width={40}
                  height={40}
                  sizes="40px"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex gap-x-4 items-center">
                <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
                {status && (
                  <span
                    className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}
                  >
                    {status.toLowerCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <FaUser className="text-indigo-700 text-[0.7rem]" />
                  <span className="font-medium text-indigo-700">{name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <FaClipboardList className="text-indigo-700 text-[0.7rem]" />
                  <span>{title}</span>
                </div>

                <div className="flex items-center gap-1">
                  <FaCalendarAlt className="text-indigo-700 text-[0.7rem]" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="text-right flex flex-col items-end gap-2">
            <p className="text-[0.6rem] text-gray-500 uppercase tracking-wide font-medium text-nowrap">
              Approval Level
            </p>
            <p className="text-xs font-semibold text-indigo-700">
              {currentLevel} / {totalLevel}
            </p>
          </div>
        </div>

        <div className="mt-3 bg-indigo-50 border border-indigo-200 p-2 text-xs rounded-md">
          <p className="text-gray-700">
            <span className="font-medium text-indigo-700">Remarks:</span>{" "}
            {remarks}
          </p>
        </div>
        {!roles || roles === "STAFF" ? null : (
          <>
            {/* Divider */}
            <div className="border-t border-gray-300 my-2" />

            {isFormCompleted ? (
              <>
                {status === "APPROVED" ? (
                  <p className="text-xs text-green-600 italic">
                    This form has been {status?.toLowerCase()}. Open the form to
                    see the approver remarks.
                  </p>
                ) : (
                  <p className="text-xs text-red-600 italic">
                    This form has been {status?.toLowerCase()}. Open the form to
                    see the approver remarks.
                  </p>
                )}
              </>
            ) : (
              <>
                {/* Actions */}
                {canApprove && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-2">
                      <PrimaryButton
                        name={loading ? "Processing..." : "Reject"}
                        disabled={isLocked || loading}
                        className={`w-24 rounded-md py-2 text-xs font-medium transition-all duration-200 ${
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
                        name={loading ? "Processing..." : "Approve"}
                        disabled={isLocked || loading}
                        className={`w-24 rounded-md py-2 text-xs font-medium transition-all duration-200 ${
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
                      <p className="text-[0.6rem] text-gray-500 italic mt-1">
                        Waiting for Level {activeLevel} to approve first.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      <ActionModal
        isOpen={confirmModalOpen}
        title={`Do you want to ${
          actionType === "approve" ? "approve" : "reject"
        } this form?`}
        message={`Please check the details carefully. Once ${
          actionType === "approve" ? "approved" : "rejected"
        }, this action cannot be undone.`}
        onConfirm={(remarks) => performApproval(remarks)} // ✅ now passes remarks
        onCancel={() => setConfirmModalOpen(false)}
        confirmText={actionType === "approve" ? "Approve" : "Reject"}
        cancelText="Cancel"
      />
    </>
  );
}
