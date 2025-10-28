import React, { useState } from "react";

interface PaginatedListProps<T> {
  items: T[];
  pageSize?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export default function PaginatedList<T>({
  items,
  pageSize = 10,
  renderItem,
}: PaginatedListProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / pageSize);

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);

  return (
    <div>
      <div className="flex flex-col gap-4">{pageItems.map(renderItem)}</div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
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
