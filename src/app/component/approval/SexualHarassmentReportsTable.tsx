import React from "react";
import { FiShield } from "react-icons/fi";
import ApprovalTable from "../ui/ApprovalTable";
import { SexualHarassmentReportItem } from "./ApprovalComponent";

interface SexualHarassmentReportsTableProps {
  reports: SexualHarassmentReportItem[];
  onViewReport?: (reportId: number) => void;
}

const statusColor = (status: string) =>
  status === "RESOLVED"
    ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
    : status === "CLOSED"
      ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
      : status === "UNDER_REVIEW"
        ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400"
        : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400";

export default function SexualHarassmentReportsTable({
  reports,
  onViewReport,
}: SexualHarassmentReportsTableProps) {
  if (reports.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <FiShield className="text-indigo-700 dark:text-indigo-400" />
        Sexual Harassment Reports
      </h2>
      <ApprovalTable
        items={reports}
        columns={[
          { label: "Reporter" },
          { label: "Description" },
          { label: "Status", sortAccessor: (report) => report.status },
          { label: "Date", sortAccessor: (report) => report.createdAt },
        ]}
        renderRow={(report) => {
          const date = new Date(report.createdAt);
          const formattedDate = Number.isNaN(date.getTime())
            ? "-"
            : date.toLocaleDateString("en-GB");

          return (
            <tr
              key={report.id}
              onClick={() => onViewReport?.(report.id)}
              className="cursor-pointer divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            >
              <td className="px-4 py-3 text-xs font-medium text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                {report.reporterName}
              </td>
              <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 max-w-[280px] truncate" title={report.description}>
                {report.description}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${statusColor(report.status)}`}
                >
                  {report.status.toLowerCase().replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {formattedDate}
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
}
