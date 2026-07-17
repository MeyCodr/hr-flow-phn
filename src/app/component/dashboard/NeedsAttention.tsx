"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";

export interface AttentionItem {
  approvalId: number;
  submissionId: number;
  formTypeName: string;
  requesterName: string;
  requesterAttachment?: string | null;
  submittedAt: string;
}

interface NeedsAttentionProps {
  items: AttentionItem[];
  totalCount: number;
}

export default function NeedsAttention({ items, totalCount }: NeedsAttentionProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Needs Your Attention</h1>
          <p className="text-indigo-800 text-sm font-light">
            Forms waiting on your approval
          </p>
        </div>
        {totalCount > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 whitespace-nowrap">
            {totalCount} pending
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <FiCheckCircle className="text-3xl text-green-600" />
          <p className="text-sm text-gray-600">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col mt-4 divide-y divide-gray-100">
          {items.map((item) => {
            const parts = item.requesterName.trim().split(/\s+/);
            const initials =
              parts.length > 1
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : (parts[0]?.[0]?.toUpperCase() ?? "?");
            const submittedDate = new Date(item.submittedAt);
            const formattedDate = Number.isNaN(submittedDate.getTime())
              ? "-"
              : submittedDate.toLocaleDateString("en-GB");

            return (
              <Link
                key={item.approvalId}
                href={`/dashboard/approval?id=${item.submissionId}&name=${encodeURIComponent(item.formTypeName)}`}
                className="group flex items-center justify-between gap-3 py-3 hover:bg-indigo-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-indigo-700 text-white font-semibold w-9 h-9 flex items-center justify-center rounded-full text-xs overflow-hidden flex-shrink-0">
                    {item.requesterAttachment ? (
                      <Image
                        src={item.requesterAttachment}
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
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.formTypeName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="text-indigo-700 font-medium">{item.requesterName}</span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-[0.65rem]" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>
                <FiArrowRight className="text-gray-400 group-hover:text-indigo-700 transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      {totalCount > items.length && (
        <Link
          href="/dashboard/approval"
          className="block text-center text-xs font-medium text-indigo-700 hover:text-indigo-900 mt-4 pt-4 border-t border-gray-100"
        >
          View all {totalCount} pending approvals
        </Link>
      )}
    </div>
  );
}
