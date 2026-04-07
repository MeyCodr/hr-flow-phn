"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/base-path";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as XLSX from "xlsx";

type EmployeeRecord = {
  empNo: string;
  division: string;
  department: string;
  section: string;
  plant: string;
  gender: string;
  labourCategory: string;
  employeeType: string;
  employeeStatus: string;
  citizenship: string;
  joinDate: string;
  resignationDate: string | null;
  snapshotMonth?: number | null;
  snapshotYear?: number | null;
};

type TrendPoint = {
  label: string;
  fullLabel?: string;
  value: number;
  highlight?: boolean;
  year?: number;
  month?: number;
};

type TurnoverTrendPoint = {
  label: string;
  fullLabel: string;
  resignations: number;
  turnoverRate: number;
};

type SavedManpowerUpload = {
  id: number;
  fileName: string;
  fileType: string | null;
  fileSize: number;
  recordCount: number;
  createdAt: string;
  uploadedBy?: {
    fullname: string;
    staffid: string;
  };
  employees: EmployeeRecord[];
};

const monthNames = [
  "All Months",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const categoryOptions = [
  "All Categories",
  "Direct Labour",
  "Indirect Labour",
  "Executive",
  "Non Executive",
  "Permanent",
  "Contract",
  "Local",
  "Foreign",
];

const currentDate = new Date();
const chartBarColors = ["#0f766e", "#1d4ed8", "#b45309", "#7c3aed"];
const preferredPlantOrder = [
  "SHAH ALAM 1 PLANT",
  "SHAH ALAM 2 PLANT",
  "PEGOH PLANT",
  "RASA PLANT",
  "BUKIT BERUNTUNG PLANT",
  "FIF TANJUNG MALIM",
  "PEKAN PLANT",
  "TANJUNG MALIM 2",
  "ALAM IMPIAN PLANT",
];

const monthNumberByName: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeNullableText(value: unknown) {
  const normalized = normalizeText(value);
  return normalized ? normalized : null;
}

function formatCount(value: number) {
  return value.toLocaleString();
}

function normalizeExcelDate(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getMonth() + 1}/${value.getDate()}/${value.getFullYear()}`;
  }

  if (typeof value === "number") {
    const parsedDate = XLSX.SSF.parse_date_code(value);

    if (parsedDate) {
      return `${parsedDate.m}/${parsedDate.d}/${parsedDate.y}`;
    }
  }

  return normalizeText(value);
}

function parseSheetPeriod(sheetName: string) {
  const normalizedSheetName = sheetName.trim().toLowerCase();
  const monthMatch = normalizedSheetName.match(
    /(?:^|[^a-z])(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:[^a-z]|$)/i,
  );
  const yearMatch = normalizedSheetName.match(/(?:19|20)?\d{2,4}/);

  if (!monthMatch || !yearMatch) {
    return { snapshotMonth: null, snapshotYear: null };
  }

  const matchedMonth = monthMatch[1].toLowerCase();
  const snapshotMonth = monthNumberByName[matchedMonth] ?? null;
  const rawYear = yearMatch[0];
  const numericYear = Number(rawYear);
  const snapshotYear =
    rawYear.length === 2 ? 2000 + numericYear : numericYear;

  return {
    snapshotMonth,
    snapshotYear,
  };
}

function mapWorksheetRowsToEmployees(
  rows: Record<string, unknown>[],
  sheetName?: string,
) {
  const { snapshotMonth, snapshotYear } = parseSheetPeriod(sheetName ?? "");

  return rows
    .map((row) => ({
      empNo: normalizeText(row.EmpNo),
      division: normalizeText(row.Division),
      department: normalizeText(row.Department),
      section: normalizeText(row.Section_Occ),
      plant: normalizeText(row.Team),
      gender: normalizeText(row.Sex).toUpperCase(),
      labourCategory: normalizeText(row.Level_Occ).toUpperCase(),
      employeeType: normalizeText(row.Employee_Type).toUpperCase(),
      employeeStatus: normalizeText(row.Employee_Status).toUpperCase(),
      citizenship: normalizeText(row.Citizenship).toUpperCase(),
      joinDate: normalizeExcelDate(row.Date_Join),
      resignationDate: normalizeNullableText(
        normalizeExcelDate(row.Date_Resignation),
      ),
      snapshotMonth,
      snapshotYear,
    }))
    .filter(
      (employee) =>
        employee.empNo &&
        employee.division &&
        employee.department &&
        employee.section &&
        employee.plant &&
        employee.joinDate,
    );
}

function parseDate(value: string | null) {
  if (!value) return null;

  const [month, day, year] = value.split("/").map(Number);
  if (!month || !day || !year) return null;

  const normalizedYear =
    year < 100 ? (year >= 70 ? 1900 + year : 2000 + year) : year;

  return new Date(normalizedYear, month - 1, day);
}

function isActiveAt(employee: EmployeeRecord, date: Date) {
  const joinDate = parseDate(employee.joinDate);
  const resignationDate = parseDate(employee.resignationDate);

  if (!joinDate) return false;

  return joinDate <= date && (!resignationDate || resignationDate > date);
}

function isActiveWithinPeriod(
  employee: EmployeeRecord,
  startDate: Date,
  endDate: Date,
) {
  const joinDate = parseDate(employee.joinDate);
  const resignationDate = parseDate(employee.resignationDate);

  if (!joinDate) return false;

  return joinDate <= endDate && (!resignationDate || resignationDate >= startDate);
}

function matchesCategory(employee: EmployeeRecord, category: string) {
  if (category === "All Categories") return true;

  const normalizedCategory = category.toUpperCase();

  return (
    employee.labourCategory === normalizedCategory ||
    employee.employeeType === normalizedCategory ||
    employee.employeeStatus === normalizedCategory ||
    (normalizedCategory === "LOCAL" && employee.citizenship === "MALAYSIAN") ||
    (normalizedCategory === "FOREIGN" &&
      employee.citizenship !== "" &&
      employee.citizenship !== "MALAYSIAN")
  );
}

function HeadcountBarChart({
  data,
  title,
  description,
  gridColor,
}: {
  data: TrendPoint[];
  title: string;
  description: string;
  gridColor: string;
}) {
  const topDivision = data[0];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm font-poppins">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {/* <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          {badgeLabel}
        </span> */}
      </div>

      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
        <span>Count</span>
        <span>Division</span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 12, right: 12, left: 0, bottom: 18 }}
            barCategoryGap={12}
          >
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              angle={-20}
              interval={0}
              textAnchor="end"
              height={52}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
            <Tooltip
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullLabel ?? payload?.[0]?.payload?.label ?? ""
              }
              formatter={(value) => [`${value ?? 0}`, "Count"]}
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
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.label}-${index}`}
                  fill={chartBarColors[index % chartBarColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {topDivision && (
        <p className="mt-3 text-xs font-medium text-gray-600">
          Top division: {topDivision.fullLabel ?? topDivision.label}
        </p>
      )}
    </div>
  );
}

function MonthlyHeadcountTrendChart({
  data,
  selectedMonth,
  selectedMonthIndex,
  selectedYear,
}: {
  data: TrendPoint[];
  selectedMonth: string;
  selectedMonthIndex: number;
  selectedYear: string;
}) {
  const selectedPoint =
    selectedMonth === "All Months"
      ? null
      : data.find(
          (entry) =>
            entry.month === selectedMonthIndex &&
            entry.year === Number(selectedYear),
        );

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Monthly Headcount Trend
          </h2>
          <p className="text-sm text-gray-600">
            Rolling 12-month headcount trend based on Date Join and Date Resignation.
          </p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 6 }}>
            <CartesianGrid stroke="#e0e7ff" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickFormatter={(value: number) => formatCount(value)}
            />
            <Tooltip
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullLabel ?? payload?.[0]?.payload?.label ?? ""
              }
              formatter={(value) => [formatCount(Number(value ?? 0)), "Headcount"]}
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
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4f46e5"
              strokeWidth={3}
              label={({ x, y, value, index }) => {
                if (
                  typeof x !== "number" ||
                  typeof y !== "number" ||
                  typeof value !== "number"
                ) {
                  return null;
                }

                const point = data[index ?? 0];

                return (
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={point?.highlight ? 700 : 600}
                    fill={point?.highlight ? "#312e81" : "#475569"}
                  >
                    {formatCount(value)}
                  </text>
                );
              }}
              dot={{ r: 4, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#312e81", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* <div className="mt-4 flex flex-wrap gap-2">
        {data.map((entry) => (
          <div
            key={entry.fullLabel ?? entry.label}
            className={`rounded-lg border px-3 py-2 text-sm ${
              entry.highlight
                ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                : "border-gray-200 bg-gray-50 text-gray-700"
            }`}
          >
            <span className="font-medium">{entry.fullLabel ?? entry.label}</span>:{" "}
            <span className="font-semibold">{formatCount(entry.value)}</span>
          </div>
        ))}
      </div> */}

      {selectedPoint && (
        <p className="mt-3 text-sm text-gray-600">
          {selectedPoint.fullLabel} headcount:{" "}
          <span className="font-semibold text-gray-900">
            {formatCount(selectedPoint.value)}
          </span>
        </p>
      )}
    </article>
  );
}

function TurnoverTrendChart({
  data,
}: {
  data: TurnoverTrendPoint[];
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Turnover Trend</h2>
        <p className="text-sm text-gray-600">
          Monthly resignations and turnover rate for the same rolling 12-month period.
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 12, right: 12, left: 0, bottom: 6 }}
          >
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} />
            <YAxis
              yAxisId="count"
              allowDecimals={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <YAxis
              yAxisId="rate"
              orientation="right"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickFormatter={(value: number) => `${value.toFixed(1)}%`}
            />
            <Tooltip
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullLabel ?? payload?.[0]?.payload?.label ?? ""
              }
              formatter={(value, name) => {
                if (name === "turnoverRate") {
                  return [`${Number(value ?? 0).toFixed(2)}%`, "Turnover Rate"];
                }

                return [formatCount(Number(value ?? 0)), "Resignations"];
              }}
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
            <Bar
              yAxisId="count"
              dataKey="resignations"
              fill="#f97316"
              radius={[6, 6, 0, 0]}
            />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="turnoverRate"
              stroke="#0f766e"
              strokeWidth={3}
              dot={{ r: 4, fill: "#0f766e", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#115e59", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function EmploymentTypeDonutChart({
  permanentCount,
  contractCount,
}: {
  permanentCount: number;
  contractCount: number;
}) {
  const totalEmploymentCount = permanentCount + contractCount;
  const formatPercentage = (value: number) =>
    totalEmploymentCount === 0
      ? "0.0%"
      : `${((value / totalEmploymentCount) * 100).toFixed(1)}%`;

  const data = [
    { name: "Permanent", value: permanentCount, color: "#1d4ed8" },
    { name: "Contract", value: contractCount, color: "#f59e0b" },
  ];

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">Employment Type</p>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              // outerRadius={70}
              paddingAngle={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => {
                const numericValue = Number(value ?? 0);
                return [
                  `${formatCount(numericValue)} (${formatPercentage(numericValue)})`,
                  "Count",
                ];
              }}
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
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <span className="h-3 w-3 rounded-full bg-blue-700" />
          <span>
            Permanent: {formatCount(permanentCount)} ({formatPercentage(permanentCount)})
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <span>
            Contract: {formatCount(contractCount)} ({formatPercentage(contractCount)})
          </span>
        </div>
      </div>
    </article>
  );
}

function LocalForeignChart({
  localCount,
  foreignCount,
}: {
  localCount: number;
  foreignCount: number;
}) {
  return (
    <div className="">
      <p className="text-sm font-medium text-gray-600">Local vs Foreign</p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-600" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Local
            </p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-emerald-900">
            {localCount}
          </p>
        </div>

        <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              Foreign
            </p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-orange-900">
            {foreignCount}
          </p>
        </div>
      </div>
    </div>
  );
}

function LabourTypeSummaryCard({
  directCount,
  indirectCount,
  executiveCount,
  nonExecutiveCount,
}: {
  directCount: number;
  indirectCount: number;
  executiveCount: number;
  nonExecutiveCount: number;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">Workforce Mix</p>
      <div className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Total Direct
            </p>
            <p className="mt-2 text-xl font-semibold text-emerald-900">
              {directCount}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Total Indirect
            </p>
            <p className="mt-2 text-xl font-semibold text-amber-900">
              {indirectCount}
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-sky-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            Executive
          </p>
          <p className="mt-2 text-xl font-semibold text-sky-900">
            {executiveCount}
          </p>
        </div>
        <div className="rounded-xl bg-violet-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
            Non Executive
          </p>
          <p className="mt-2 text-xl font-semibold text-violet-900">
            {nonExecutiveCount}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function ManpowerAnalyticsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [uploadMessage, setUploadMessage] = useState(
    "Upload an Excel workbook to load manpower dashboard data.",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingSavedData, setIsLoadingSavedData] = useState(true);
  const latestYear =
    employees.length > 0
      ? Math.max(
          ...employees.flatMap((employee) => {
            const years = [
              employee.snapshotYear ??
                parseDate(employee.joinDate)?.getFullYear() ??
                currentDate.getFullYear(),
            ];
            const resignationYear = parseDate(
              employee.resignationDate,
            )?.getFullYear();

            if (resignationYear) {
              years.push(resignationYear);
            }

            return years;
          }),
        )
      : currentDate.getFullYear();

  const earliestYear =
    employees.length > 0
      ? Math.min(
          ...employees.map(
            (employee) =>
              employee.snapshotYear ??
              parseDate(employee.joinDate)?.getFullYear() ??
              latestYear,
          ),
        )
      : currentDate.getFullYear();

  const years = Array.from(
    { length: latestYear - earliestYear + 1 },
    (_, index) => latestYear - index,
  );

  const plantOptions = [
    "All Plants",
    ...Array.from(new Set(employees.map((employee) => employee.plant))).sort(),
  ];

  const departmentOptions = [
    "All Departments",
    ...Array.from(new Set(employees.map((employee) => employee.department))).sort(),
  ];

  const [selectedMonth, setSelectedMonth] = useState(
    "All Months",
  );
  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear().toString(),
  );
  const [selectedPlant, setSelectedPlant] = useState(plantOptions[0]);
  const [selectedDepartment, setSelectedDepartment] = useState(
    departmentOptions[0],
  );
  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);

  const applyEmployees = (
    nextEmployees: EmployeeRecord[],
    message: string,
  ) => {
    setEmployees(nextEmployees);

    const uploadedYears = nextEmployees
      .map((employee) => employee.snapshotYear)
      .filter((year): year is number => typeof year === "number");
    const defaultUploadYear =
      uploadedYears.length > 0
        ? Math.max(...uploadedYears)
        : currentDate.getFullYear();

    setSelectedYear(defaultUploadYear.toString());
    setSelectedPlant("All Plants");
    setSelectedDepartment("All Departments");
    setSelectedCategory("All Categories");
    setUploadMessage(message);
  };

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const response = await fetch(withBasePath("/api/manpower-dashboard"));

        if (!response.ok) {
          if (response.status !== 404) {
            throw new Error("Failed to fetch saved manpower data.");
          }

          return;
        }

        const payload: { data: SavedManpowerUpload | null } = await response.json();

        if (!payload.data || payload.data.employees.length === 0) {
          return;
        }

        const uploadedAt = new Date(payload.data.createdAt).toLocaleString();
        const uploadedBy = payload.data.uploadedBy?.fullname
          ? ` by ${payload.data.uploadedBy.fullname}`
          : "";

        applyEmployees(
          payload.data.employees,
          `Loaded ${payload.data.recordCount} employee records from saved workbook ${payload.data.fileName}${uploadedBy} on ${uploadedAt}.`,
        );
      } catch (error) {
        console.error(error);
        setUploadMessage(
          "Unable to load the latest saved manpower workbook. You can upload a new Excel file.",
        );
      } finally {
        setIsLoadingSavedData(false);
      }
    };

    loadSavedData();
  }, []);

  const hasSnapshotPeriods = employees.some(
    (employee) => employee.snapshotMonth && employee.snapshotYear,
  );
  const selectedMonthIndex = monthNames.indexOf(selectedMonth);
  const isWholeYearView = selectedMonth === "All Months";

  const periodMatchedEmployees = hasSnapshotPeriods
    ? employees.filter((employee) => {
        if (!employee.snapshotYear) {
          return false;
        }

        if (employee.snapshotYear !== Number(selectedYear)) {
          return false;
        }

        if (isWholeYearView) {
          return true;
        }

        return employee.snapshotMonth === selectedMonthIndex;
      })
    : employees;

  const filteredEmployees = periodMatchedEmployees.filter((employee) => {
    if (selectedPlant !== "All Plants" && employee.plant !== selectedPlant) {
      return false;
    }

    if (
      selectedDepartment !== "All Departments" &&
      employee.department !== selectedDepartment
    ) {
      return false;
    }

    return matchesCategory(employee, selectedCategory);
  });

  const periodStartDate = isWholeYearView
    ? new Date(Number(selectedYear), 0, 1, 0, 0, 0)
    : new Date(Number(selectedYear), selectedMonthIndex - 1, 1, 0, 0, 0);
  const periodEndDate = isWholeYearView
    ? new Date(Number(selectedYear), 11, 31, 23, 59, 59)
    : new Date(Number(selectedYear), selectedMonthIndex, 0, 23, 59, 59);

  const activeEmployees = filteredEmployees.filter((employee) =>
    hasSnapshotPeriods
      ? true
      : isWholeYearView
      ? isActiveWithinPeriod(employee, periodStartDate, periodEndDate)
      : isActiveAt(employee, periodEndDate),
  );

  const totalManpower = filteredEmployees.length;
  const totalDirectCount = activeEmployees.filter(
    (employee) => employee.labourCategory === "DIRECT LABOUR",
  ).length;
  const totalIndirectCount = activeEmployees.filter(
    (employee) => employee.labourCategory !== "DIRECT LABOUR",
  ).length;
  const executiveCount = activeEmployees.filter(
    (employee) => employee.employeeType === "EXECUTIVE",
  ).length;
  const nonExecutiveCount = activeEmployees.filter(
    (employee) => employee.employeeType === "NON EXECUTIVE",
  ).length;
  const localCount = activeEmployees.filter(
    (employee) => employee.citizenship === "MALAYSIAN",
  ).length;
  const foreignCount = activeEmployees.filter(
    (employee) =>
      employee.citizenship !== "" && employee.citizenship !== "MALAYSIAN",
  ).length;

  const permanentCount = activeEmployees.filter(
    (employee) => employee.employeeStatus === "PERMANENT",
  ).length;

  const contractCount = activeEmployees.filter(
    (employee) => employee.employeeStatus === "CONTRACT",
  ).length;

  const divisionBreakdown = Array.from(
    activeEmployees.reduce((map, employee) => {
      const currentCount = map.get(employee.division) ?? 0;
      map.set(employee.division, currentCount + 1);
      return map;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const departmentBreakdown = Array.from(
    activeEmployees.reduce((map, employee) => {
      const currentCount = map.get(employee.department) ?? 0;
      map.set(employee.department, currentCount + 1);
      return map;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const sectionBreakdown = Array.from(
    activeEmployees.reduce((map, employee) => {
      const currentCount = map.get(employee.section) ?? 0;
      map.set(employee.section, currentCount + 1);
      return map;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const plantBreakdown = Array.from(
    activeEmployees.reduce((map, employee) => {
      const currentCount = map.get(employee.plant) ?? 0;
      map.set(employee.plant, currentCount + 1);
      return map;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const genderBreakdown = Array.from(
    activeEmployees.reduce((map, employee) => {
      const genderLabel =
        employee.gender === "M"
          ? "Male"
          : employee.gender === "F"
          ? "Female"
          : employee.gender || "Unspecified";
      const currentCount = map.get(genderLabel) ?? 0;
      map.set(genderLabel, currentCount + 1);
      return map;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const buildPlantDivisionData = (plantName: string) =>
    Array.from(
      employees
        .filter((employee) => employee.plant === plantName)
        .filter((employee) =>
          hasSnapshotPeriods
            ? isWholeYearView
              ? employee.snapshotYear === Number(selectedYear)
              : employee.snapshotYear === Number(selectedYear) &&
                employee.snapshotMonth === selectedMonthIndex
            : true,
        )
        .filter((employee) =>
          selectedDepartment === "All Departments"
            ? true
            : employee.department === selectedDepartment,
        )
        .filter((employee) => matchesCategory(employee, selectedCategory))
        .filter((employee) =>
          hasSnapshotPeriods
            ? true
            : isWholeYearView
            ? isActiveWithinPeriod(employee, periodStartDate, periodEndDate)
            : isActiveAt(employee, periodEndDate),
        )
        .reduce((map, employee) => {
          const currentCount = map.get(employee.division) ?? 0;
          map.set(employee.division, currentCount + 1);
          return map;
        }, new Map<string, number>()),
    )
      .map(([division, value]) => ({
        division,
        value,
      }))
      .sort(
        (a, b) => b.value - a.value || a.division.localeCompare(b.division),
      )
      .slice(0, 4)
      .map(({ division, value }) => ({
        label: division.length > 12 ? `${division.slice(0, 12)}...` : division,
        fullLabel: division,
        value,
      }))
      .sort((a, b) => b.value - a.value);

  const availableChartPlants = Array.from(
    new Set(
      activeEmployees
        .map((employee) => employee.plant)
        .filter((plant) =>
          selectedPlant === "All Plants" ? true : plant === selectedPlant,
        ),
    ),
  );

  const chartPlants = [
    ...preferredPlantOrder.filter((plant) => availableChartPlants.includes(plant)),
    ...availableChartPlants
      .filter((plant) => !preferredPlantOrder.includes(plant))
      .sort(),
  ];

  const trendBaseEmployees = employees
    .filter((employee) =>
      selectedPlant === "All Plants" ? true : employee.plant === selectedPlant,
    )
    .filter((employee) =>
      selectedDepartment === "All Departments"
        ? true
        : employee.department === selectedDepartment,
    )
    .filter((employee) => matchesCategory(employee, selectedCategory));

  const rollingWindow = Array.from({ length: 12 }, (_, index) => {
    const monthDate = new Date(
      Number(selectedYear) - 1,
      currentDate.getMonth() + index,
      1,
    );

    return {
      year: monthDate.getFullYear(),
      month: monthDate.getMonth() + 1,
      label: monthNames[monthDate.getMonth() + 1].slice(0, 3),
      fullLabel: `${monthNames[monthDate.getMonth() + 1]} ${monthDate.getFullYear()}`,
    };
  });

  const monthlyHeadcountTrend = rollingWindow.map((period) => {
    const value = trendBaseEmployees.filter((employee) =>
      isActiveAt(employee, new Date(period.year, period.month, 0, 23, 59, 59)),
    ).length;

    return {
      label: period.label,
      fullLabel: period.fullLabel,
      value,
      year: period.year,
      month: period.month,
      highlight:
        selectedMonth !== "All Months" &&
        monthNames[period.month] === selectedMonth &&
        period.year === Number(selectedYear),
    };
  });

  const turnoverTrend = rollingWindow.map((period) => {
    const periodStartDate = new Date(period.year, period.month - 1, 1, 0, 0, 0);
    const periodEndDate = new Date(period.year, period.month, 0, 23, 59, 59);
    const previousMonthEndDate = new Date(period.year, period.month - 1, 0, 23, 59, 59);

    const resignations = trendBaseEmployees.filter((employee) => {
      const resignationDate = parseDate(employee.resignationDate);

      return (
        resignationDate !== null &&
        resignationDate >= periodStartDate &&
        resignationDate <= periodEndDate
      );
    }).length;

    const openingHeadcount = trendBaseEmployees.filter((employee) =>
      isActiveAt(employee, previousMonthEndDate),
    ).length;
    const closingHeadcount = trendBaseEmployees.filter((employee) =>
      isActiveAt(employee, periodEndDate),
    ).length;
    const averageHeadcount = (openingHeadcount + closingHeadcount) / 2;
    const turnoverRate =
      averageHeadcount > 0 ? (resignations / averageHeadcount) * 100 : 0;

    return {
      label: period.label,
      fullLabel: period.fullLabel,
      resignations,
      turnoverRate,
    };
  });

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadMessage(`Reading ${file.name} and saving it to the database...`);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        setUploadMessage("The uploaded workbook does not contain any worksheet.");
        return;
      }

      const parsedEmployees = workbook.SheetNames.flatMap((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: "",
          raw: false,
        });

        return mapWorksheetRowsToEmployees(rows, sheetName);
      });

      if (parsedEmployees.length === 0) {
        setUploadMessage(
          "No valid manpower rows were found. Expected columns include EmpNo, Department, Team, Level_Occ, Employee_Type, Employee_Status, Education_Category, Date_Join, and Date_Resignation.",
        );
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("employees", JSON.stringify(parsedEmployees));

      const response = await fetch(withBasePath("/api/manpower-dashboard"), {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save manpower workbook.");
      }

      applyEmployees(
        parsedEmployees,
        `Saved and loaded ${parsedEmployees.length} employee records from ${file.name}.`,
      );
    } catch (error) {
      console.error("Failed to read workbook:", error);
      setUploadMessage(
        error instanceof Error
          ? error.message
          : "The Excel file could not be read. Please upload a valid .xlsx file.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <section className="space-y-6 font-poppins">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-800 via-indigo-700 to-sky-700 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-100">
              Workforce Planning
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Manpower Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Live summary based on the workbook data, with manpower counts and
              monthly trends by selected period.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
                Month
              </span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-indigo-300"
              >
                {monthNames.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <label className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
                Year
              </span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-indigo-300"
              >
                {years.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Data Source
            </h2>
            <p className="text-sm text-gray-600">{uploadMessage}</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLoadingSavedData}
              className="inline-flex items-center rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
            >
              {isUploading
                ? "Saving..."
                : isLoadingSavedData
                ? "Loading..."
                : "Upload Excel File"}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Active Records
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {employees.length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <p className="text-sm text-gray-600">
            Refine the manpower dashboard by plant, department, and category.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Plant
            </span>
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-indigo-300"
            >
              {plantOptions.map((plant) => (
                <option key={plant} value={plant}>
                  {plant}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Department
            </span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-indigo-300"
            >
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Category
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-indigo-300"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-4">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Manpower
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-gray-900">
              {totalManpower}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Total loaded manpower records for the applied filters.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <LocalForeignChart
              localCount={localCount}
              foreignCount={foreignCount}
            />
          </article>
        </div>
        <EmploymentTypeDonutChart
          permanentCount={permanentCount}
          contractCount={contractCount}
        />
        <LabourTypeSummaryCard
          directCount={totalDirectCount}
          indirectCount={totalIndirectCount}
          executiveCount={executiveCount}
          nonExecutiveCount={nonExecutiveCount}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <MonthlyHeadcountTrendChart
          data={monthlyHeadcountTrend}
          selectedMonth={selectedMonth}
          selectedMonthIndex={selectedMonthIndex}
          selectedYear={selectedYear}
        />
        <TurnoverTrendChart data={turnoverTrend} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {chartPlants.map((plantName, index) => {
          const data = buildPlantDivisionData(plantName);
          const gridColors = ["#ccfbf1", "#dbeafe", "#fef3c7", "#ede9fe"];

          if (data.length === 0) {
            return null;
          }

          return (
            <HeadcountBarChart
              key={plantName}
              data={data}
              title={plantName}
              description=""
              gridColor={gridColors[index % gridColors.length]}
            />
          );
        })}

        <div className="rounded-2xl border border-dashed border-indigo-200 bg-white p-6 shadow-sm xl:col-span-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Selected Snapshot
              </h2>
              <p className="text-sm text-gray-600">
                {selectedMonth === "All Months"
                  ? `Full year ${selectedYear} currently shows ${activeEmployees.length} employees for the applied filters.`
                  : `${selectedMonth} ${selectedYear} currently shows ${activeEmployees.length} active employees for the applied filters.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                {selectedMonth} {selectedYear}
              </span>
              <span className="inline-flex rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                {selectedPlant}
              </span>
              <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                {selectedDepartment}
              </span>
              <span className="inline-flex rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                {selectedCategory}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm col-span-3">
          <p className="font-semibold text-lg">Breakdown Summary</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between ">
            <div>
              <h3 className="text-sm font-semibold uppercase text-indigo-700">
                Division
              </h3>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">
              {divisionBreakdown.length} divisions
            </span>
          </div>

          {divisionBreakdown.length > 0 ? (
            <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50">
              <div className="divide-y divide-gray-200">
                {divisionBreakdown.map(([division, count]) => (
                  <div
                    key={division}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-gray-700">{division}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No division data available for the selected filters.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ">
          <div className="mb-4 flex items-center justify-between ">
            <div>
              <h3 className="text-sm font-semibold uppercase text-indigo-700">
                Department
              </h3>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">
              {departmentBreakdown.length} departments
            </span>
          </div>

          {departmentBreakdown.length > 0 ? (
            <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50">
              <div className="divide-y divide-gray-200">
                {departmentBreakdown.map(([department, count]) => (
                  <div
                    key={department}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-gray-700">
                      {department}
                    </p>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No department data available for the selected filters.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ">
          <div className="mb-4 flex items-center justify-between ">
            <div>
              <h3 className="text-sm font-semibold uppercase text-indigo-700">
                Section
              </h3>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">
              {sectionBreakdown.length} sections
            </span>
          </div>

          {sectionBreakdown.length > 0 ? (
            <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50">
              <div className="divide-y divide-gray-200">
                {sectionBreakdown.map(([section, count]) => (
                  <div
                    key={section}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-gray-700">{section}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No section data available for the selected filters.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ">
          <div className="mb-4 flex items-center justify-between ">
            <div>
              <h3 className="text-sm font-semibold uppercase text-indigo-700">
                Plant
              </h3>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">
              {plantBreakdown.length} plants
            </span>
          </div>

          {plantBreakdown.length > 0 ? (
            <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50">
              <div className="divide-y divide-gray-200">
                {plantBreakdown.map(([plant, count]) => (
                  <div
                    key={plant}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-gray-700">{plant}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No plant data available for the selected filters.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ">
          <div className="mb-4 flex items-center justify-between ">
            <div>
              <h3 className="text-sm font-semibold uppercase text-indigo-700">
                Gender
              </h3>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">
              {genderBreakdown.length} groups
            </span>
          </div>

          {genderBreakdown.length > 0 ? (
            <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50">
              <div className="divide-y divide-gray-200">
                {genderBreakdown.map(([gender, count]) => (
                  <div
                    key={gender}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-gray-700">{gender}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No gender data available for the selected filters.
            </div>
          )}
        </div>
      </div>

      {employees.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            No Data Loaded
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Upload an Excel workbook to populate the manpower dashboard.
          </p>
        </div>
      )}
    </section>
  );
}
