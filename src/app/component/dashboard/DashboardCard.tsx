import React from "react";

interface DashboardCardProps {
  name?: string;
  count?: number;
  icon?: React.ReactNode;
  color?: string; // color for icon background
  nameColor?: string; // color for card title
}

export default function DashboardCard({
  name,
  count,
  icon,
  color = "indigo",
  nameColor = "gray-500",
}: DashboardCardProps) {
  return (
    <div
      className={`p-6 rounded-xl shadow-sm border border-gray-300 bg-white transform transition-transform hover:shadow-md hover:-translate-y-1`}
    >
      <div className="flex items-center justify-between">
        {/* Text */}
        <div className="flex flex-col gap-2">
          <h2 className={`font-medium text-${nameColor} text-sm`} >{name}</h2>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>

        {/* Icon with circular gradient */}
        <div
          className={`p-4 rounded-xl text-2xl flex items-center justify-center bg-${color}-300 text-${color}-600`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
