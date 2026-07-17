import React, { useMemo, useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export interface ApprovalTableColumn<T> {
  label: string;
  sortAccessor?: (item: T) => string | number | Date | null | undefined;
}

interface ApprovalTableProps<T> {
  items: T[];
  columns: ApprovalTableColumn<T>[];
  pageSize?: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

type SortDirection = "asc" | "desc";

export default function ApprovalTable<T>({
  items,
  columns,
  pageSize = 20,
  renderRow,
  emptyMessage = "No records found.",
}: ApprovalTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortLabel, setSortLabel] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedItems = useMemo(() => {
    const column = columns.find((c) => c.label === sortLabel);
    if (!column?.sortAccessor) return items;

    const { sortAccessor } = column;
    const factor = sortDirection === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
      const valueA = sortAccessor(a);
      const valueB = sortAccessor(b);

      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return 1; // push missing values to the end
      if (valueB == null) return -1;

      if (valueA instanceof Date || valueB instanceof Date) {
        return (new Date(valueA).getTime() - new Date(valueB).getTime()) * factor;
      }
      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * factor;
      }
      return String(valueA).localeCompare(String(valueB)) * factor;
    });
  }, [items, columns, sortLabel, sortDirection]);

  const totalPages = Math.ceil(sortedItems.length / pageSize);
  // Clamp instead of trusting currentPage: if the item set shrinks (e.g. a
  // search filter) while on a later page, currentPage can point past the end.
  const safePage = Math.min(currentPage, totalPages) || 1;

  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = sortedItems.slice(start, end);

  const handleSort = (column: ApprovalTableColumn<T>) => {
    if (!column.sortAccessor) return;

    if (sortLabel !== column.label) {
      setSortLabel(column.label);
      setSortDirection("asc");
    } else {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    }
    setCurrentPage(1);
  };

  if (items.length === 0) {
    return <p className="text-gray-600">{emptyMessage}</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-50">
            <tr className="divide-x divide-gray-200">
              {columns.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className="px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap"
                >
                  {column.sortAccessor ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className="flex items-center gap-1.5 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      {column.label}
                      {sortLabel === column.label ? (
                        sortDirection === "asc" ? (
                          <FaSortUp className="text-indigo-700" />
                        ) : (
                          <FaSortDown className="text-indigo-700" />
                        )
                      ) : (
                        <FaSort className="text-gray-300" />
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageItems.map(renderRow)}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded text-xs ${
                safePage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
