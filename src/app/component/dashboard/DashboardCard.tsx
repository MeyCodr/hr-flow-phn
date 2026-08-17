import React from "react";

export type DashboardCardColor = "yellow" | "green" | "indigo" | "purple";

// Tailwind's scanner needs full literal class names to generate them — a
// template-interpolated `text-${color}-600` never matches, so each variant's
// classes are spelled out here instead.
const COLOR_CLASSES: Record<
  DashboardCardColor,
  { name: string; icon: string }
> = {
  yellow: {
    name: "text-yellow-600 dark:text-yellow-400",
    icon: "bg-yellow-300 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400",
  },
  green: {
    name: "text-green-600 dark:text-green-400",
    icon: "bg-green-300 dark:bg-green-900/40 text-green-600 dark:text-green-400",
  },
  indigo: {
    name: "text-indigo-600 dark:text-indigo-400",
    icon: "bg-indigo-300 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
  },
  purple: {
    name: "text-purple-600 dark:text-purple-400",
    icon: "bg-purple-300 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
  },
};

interface DashboardCardProps {
  name?: string;
  count?: number;
  icon?: React.ReactNode;
  color?: DashboardCardColor;
}

export default function DashboardCard({
  name,
  count,
  icon,
  color = "indigo",
}: DashboardCardProps) {
  const classes = COLOR_CLASSES[color];

  return (
    <div className="p-6 rounded-xl shadow-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 transform transition-transform hover:shadow-md hover:-translate-y-1">
      <div className="flex items-center justify-between">
        {/* Text */}
        <div className="flex flex-col gap-2">
          <h2 className={`font-medium ${classes.name} text-sm`}>{name}</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
        </div>

        {/* Icon with circular gradient */}
        <div className={`p-4 rounded-xl text-2xl flex items-center justify-center ${classes.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
