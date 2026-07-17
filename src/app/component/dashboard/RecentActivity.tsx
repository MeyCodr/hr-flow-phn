"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { FiClock } from "react-icons/fi";

export interface RecentActivityItem {
  key: string;
  submissionId: number;
  formTypeName: string;
  status: string;
  personName: string | null;
  personAttachment?: string | null;
  role: "reviewer" | "requester";
  date: string;
}

interface RecentActivityProps {
  items: RecentActivityItem[];
}

const statusColor = (status: string) =>
  status === "APPROVED"
    ? "bg-green-100 text-green-700"
    : status === "REJECTED"
      ? "bg-red-100 text-red-700"
      : status === "CANCELLED"
        ? "bg-gray-100 text-gray-700"
        : "bg-orange-100 text-orange-700"; // ESCALATED

export default function RecentActivity({ items }: RecentActivityProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold">Recent Activity</h1>
        <p className="text-indigo-800 text-sm font-light">
          Latest resolved forms and reviews
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <FiClock className="text-3xl text-gray-400" />
          <p className="text-sm text-gray-600">No activity yet.</p>
        </div>
      ) : (
        <div className="flex flex-col mt-4 divide-y divide-gray-100">
          {items.map((item) => {
            const label =
              item.role === "reviewer"
                ? `${item.formTypeName} from ${item.personName}`
                : `Your ${item.formTypeName}`;

            const nameParts = item.personName?.trim().split(/\s+/) ?? [];
            const initials =
              nameParts.length > 1
                ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                : (nameParts[0]?.[0]?.toUpperCase() ?? "Y");

            const activityDate = new Date(item.date);
            const formattedDate = Number.isNaN(activityDate.getTime())
              ? "-"
              : activityDate.toLocaleDateString("en-GB");

            return (
              <Link
                key={item.key}
                href={`/dashboard/approval?id=${item.submissionId}&name=${encodeURIComponent(item.formTypeName)}`}
                className="group flex items-center justify-between gap-3 py-3 hover:bg-indigo-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-indigo-700 text-white font-semibold w-9 h-9 flex items-center justify-center rounded-full text-xs overflow-hidden flex-shrink-0">
                    {item.personAttachment ? (
                      <Image
                        src={item.personAttachment}
                        alt="Profile"
                        width={36}
                        height={36}
                        sizes="36px"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FaCalendarAlt className="text-[0.65rem]" />
                      {formattedDate}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor(item.status)}`}
                >
                  {item.status.toLowerCase()}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
