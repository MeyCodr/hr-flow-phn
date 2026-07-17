"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ChartContainer({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <div className={className}>{mounted ? children : null}</div>;
}

type StatusCount = { status: string; count: number };
type NameCount = { name: string; count: number };
type MonthlyTrendPoint = {
  label: string;
  fullLabel: string;
  submitted: number;
  resolved: number;
};

interface FormAnalyticsComponentProps {
  totalSubmissions: number;
  statusBreakdown: StatusCount[];
  formTypeBreakdown: NameCount[];
  departmentBreakdown: NameCount[];
  monthlyTrend: MonthlyTrendPoint[];
  avgTurnaroundDays: number | null;
  approverWorkload: NameCount[];
  totalPendingApprovals: number;
}

const statusColors: Record<string, string> = {
  PENDING: "#d97706",
  APPROVED: "#059669",
  REJECTED: "#dc2626",
  CANCELLED: "#6b7280",
};

const statusBgClasses: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const barPalette = ["#4338ca", "#0f766e", "#b45309", "#7c3aed", "#0891b2", "#be123c", "#65a30d", "#9333ea"];

function formatCount(value: number) {
  return value.toLocaleString();
}

function StatusDonutChart({ data, total }: { data: StatusCount[]; total: number }) {
  const chartData = data.filter((entry) => entry.count > 0);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-w-0">
      <h2 className="text-lg font-semibold text-gray-900">Submissions by Status</h2>
      <p className="text-sm text-gray-600">Distribution of all form submissions.</p>

      <ChartContainer className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={statusColors[entry.status] ?? "#6366f1"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => {
                const numericValue = Number(value ?? 0);
                const percentage = total > 0 ? ((numericValue / total) * 100).toFixed(1) : "0.0";
                return [`${formatCount(numericValue)} (${percentage}%)`, name];
              }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "8px 10px",
                fontSize: "12px",
              }}
              itemStyle={{ fontSize: "12px" }}
              wrapperStyle={{ outline: "none" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="mt-4 flex flex-wrap gap-2">
        {data.map((entry) => (
          <span
            key={entry.status}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              statusBgClasses[entry.status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: statusColors[entry.status] ?? "#6366f1" }}
            />
            {entry.status.charAt(0) + entry.status.slice(1).toLowerCase()}: {formatCount(entry.count)}
          </span>
        ))}
      </div>
    </article>
  );
}

function RankedBarChart({
  title,
  description,
  data,
  emptyMessage,
  chartHeight = "h-64",
  orientation = "bars",
}: {
  title: string;
  description: string;
  data: NameCount[];
  emptyMessage: string;
  chartHeight?: string;
  orientation?: "bars" | "columns";
}) {
  if (data.length === 0) {
    return (
      <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-w-0">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          {emptyMessage}
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-w-0">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>

      <ChartContainer className={`mt-4 w-full ${chartHeight}`}>
        <ResponsiveContainer width="100%" height="100%">
          {orientation === "columns" ? (
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 16, left: 0, bottom: 48 }}
            >
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-35}
                interval={0}
                textAnchor="end"
                height={70}
                tick={{ fill: "#374151", fontSize: 11 }}
              />
              <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [formatCount(Number(value ?? 0)), "Submissions"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  padding: "8px 10px",
                  fontSize: "12px",
                }}
                itemStyle={{ fontSize: "12px" }}
                wrapperStyle={{ outline: "none" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={barPalette[index % barPalette.length]} />
                ))}
              </Bar>
            </ComposedChart>
          ) : (
            <ComposedChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={160}
                tick={{ fill: "#374151", fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => [formatCount(Number(value ?? 0)), "Submissions"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  padding: "8px 10px",
                  fontSize: "12px",
                }}
                itemStyle={{ fontSize: "12px" }}
                wrapperStyle={{ outline: "none" }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={barPalette[index % barPalette.length]} />
                ))}
              </Bar>
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </ChartContainer>
    </article>
  );
}

function MonthlyTrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-w-0 xl:col-span-2">
      <h2 className="text-lg font-semibold text-gray-900">Monthly Submission Trend</h2>
      <p className="text-sm text-gray-600">
        Submitted vs. resolved forms over the last 12 months.
      </p>

      <ChartContainer className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 6 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
            <Tooltip
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel ?? ""}
              formatter={(value, name) => [
                formatCount(Number(value ?? 0)),
                name === "submitted" ? "Submitted" : "Resolved",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "8px 10px",
                fontSize: "12px",
              }}
              itemStyle={{ fontSize: "12px" }}
              labelStyle={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar dataKey="submitted" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            <Line
              type="monotone"
              dataKey="resolved"
              stroke="#059669"
              strokeWidth={3}
              dot={{ r: 3, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#047857", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </article>
  );
}

function ApproverWorkloadList({ data }: { data: NameCount[] }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-w-0">
      <h2 className="text-lg font-semibold text-gray-900">Pending Approver Workload</h2>
      <p className="text-sm text-gray-600">Approvers with the most forms currently waiting on them.</p>

      {data.length > 0 ? (
        <div className="mt-4 divide-y divide-gray-100">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4 py-3">
              <p className="text-sm font-medium text-gray-700">{entry.name}</p>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                {formatCount(entry.count)} pending
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          No pending approvals right now.
        </div>
      )}
    </article>
  );
}

export default function FormAnalyticsComponent({
  totalSubmissions,
  statusBreakdown,
  formTypeBreakdown,
  departmentBreakdown,
  monthlyTrend,
  avgTurnaroundDays,
  approverWorkload,
  totalPendingApprovals,
}: FormAnalyticsComponentProps) {
  const countByStatus = (status: string) =>
    statusBreakdown.find((entry) => entry.status === status)?.count ?? 0;

  return (
    <section className="space-y-6 font-poppins">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-800 via-indigo-700 to-sky-700 p-6 text-white shadow-lg">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-100">
          Analytics
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Form Insights</h1>
        <p className="mt-2 max-w-2xl text-sm text-indigo-100">
          A live overview of all form submissions across the organisation, including
          status breakdown, approval turnaround, and workload distribution.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-w-0">
          <p className="text-sm font-medium text-gray-500">Total Submissions</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">
            {formatCount(totalSubmissions)}
          </h2>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-w-0">
          <p className="text-sm font-medium text-amber-600">Pending</p>
          <h2 className="mt-3 text-3xl font-semibold text-amber-700">
            {formatCount(countByStatus("PENDING"))}
          </h2>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-w-0">
          <p className="text-sm font-medium text-emerald-600">Approved</p>
          <h2 className="mt-3 text-3xl font-semibold text-emerald-700">
            {formatCount(countByStatus("APPROVED"))}
          </h2>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-w-0">
          <p className="text-sm font-medium text-red-600">Rejected</p>
          <h2 className="mt-3 text-3xl font-semibold text-red-700">
            {formatCount(countByStatus("REJECTED"))}
          </h2>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-w-0">
          <p className="text-sm font-medium text-gray-500">Avg. Turnaround</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">
            {avgTurnaroundDays !== null ? `${avgTurnaroundDays.toFixed(1)}d` : "-"}
          </h2>
          <p className="mt-1 text-xs text-gray-500">From submission to resolution</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <StatusDonutChart data={statusBreakdown} total={totalSubmissions} />
        <RankedBarChart
          title="Submissions by Form Type"
          description="Which form types are submitted the most."
          data={formTypeBreakdown}
          emptyMessage="No form submissions yet."
        />
      </div>

      <RankedBarChart
        title="Submissions by Department"
        description="Top departments by submission volume."
        data={departmentBreakdown}
        emptyMessage="No department data available."
        chartHeight="h-80"
        orientation="columns"
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <MonthlyTrendChart data={monthlyTrend} />
        <ApproverWorkloadList data={approverWorkload} />
      </div>

      {totalPendingApprovals === 0 && totalSubmissions === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">No Data Yet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Once forms are submitted, this page will populate with live analytics.
          </p>
        </div>
      )}
    </section>
  );
}
