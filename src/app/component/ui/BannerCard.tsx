import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import PrimaryButton from "./PrimaryButton";

export interface BannerCardProps {
  profileImg: string;
  title: string;
  name: string;
  createddate: string;
  remarks: string;
  currentLevel: number; // this approver’s level
  totalLevel: number; // total approval steps
  activeLevel?: number; // lowest currently active approval level
}

export default function BannerCard({
  profileImg,
  title,
  name,
  createddate,
  remarks,
  currentLevel,
  totalLevel,
  activeLevel,
}: BannerCardProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    if (createddate) {
      const date = new Date(createddate);
      setFormattedDate(date.toLocaleDateString());
    }
  }, [createddate]);

  // 🔒 Determine if this approver can act
  const isLocked = activeLevel !== undefined && currentLevel !== activeLevel;

  return (
    <div className="bg-white w-full rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-x-4">
          <div className="bg-indigo-700 text-white font-semibold w-14 h-14 flex items-center justify-center rounded-full shadow-sm text-lg">
            AC
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

            {/* Info Row */}
            <div className="flex flex-wrap items-center gap-x-3 text-sm text-gray-600 mt-1">
              <div className="flex items-center gap-1">
                <FaUser className="text-indigo-700 text-[0.9rem]" />
                <span className="font-medium text-indigo-700">{name}</span>
              </div>

              <span className="text-gray-400">•</span>

              <div className="flex items-center gap-1">
                <FaClipboardList className="text-indigo-700" />
                <span>{title}</span>
              </div>

              <span className="text-gray-400">•</span>

              <div className="flex items-center gap-1">
                <FaCalendarAlt className="text-indigo-700" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="text-right self-start mt-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Approval Level
          </p>
          <p className="text-sm font-semibold text-indigo-700">
            {currentLevel} / {totalLevel}
          </p>
        </div>
      </div>

      <div className="mt-6 bg-indigo-50 border border-indigo-200 p-4 text-sm rounded-lg">
        <p className="text-gray-700">
          <span className="font-medium text-indigo-700">Remarks:</span>{" "}
          {remarks}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6" />

      {/* Actions */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-3">
          <PrimaryButton
            name="Reject"
            disabled={isLocked}
            className={`w-32 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
              isLocked
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            }`}
          />
          <PrimaryButton
            name="Approve"
            disabled={isLocked}
            className={`w-32 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
              isLocked
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-700 hover:bg-indigo-800 text-white cursor-pointer"
            }`}
          />
        </div>

        {isLocked && (
          <p className="text-xs text-gray-500 italic">
            Waiting for Level {activeLevel} to approve first.
          </p>
        )}
      </div>
    </div>
  );
}
