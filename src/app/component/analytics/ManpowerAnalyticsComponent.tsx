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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as XLSX from "xlsx";

function ChartContainer({
  className,
  style,
  children,
}: {
  className: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className={className} style={style}>
      {mounted ? children : null}
    </div>
  );
}

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
  "Mfg Overhead",
  "General Admin",
  "Executive",
  "Non Executive",
  "Permanent",
  "Contract",
  "Local",
  "Foreign",
];

const currentDate = new Date();
const chartBarColors = ["#0f766e", "#4338ca", "#b45309", "#7c3aed"];
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

const plantAbbreviations: Record<string, string> = {
  "SHAH ALAM 1 PLANT": "SA1",
  "SHAH ALAM 2 PLANT": "SA2",
  "PEGOH PLANT": "PGH",
  "RASA PLANT": "RASA",
  "BUKIT BERUNTUNG PLANT": "BB",
  "FIF TANJUNG MALIM": "FIFTGM",
  "PEKAN PLANT": "PKN",
  "TANJUNG MALIM 2": "TGM2",
  "ALAM IMPIAN PLANT": "AI",
};

function abbreviatePlant(plant: string) {
  return plantAbbreviations[plant] ?? plant;
}

const divisionAbbreviations: Record<string, string> = {
  "BUSINESS DEVELOPMENT & STRATEGY": "BD",
  "DHMSB OPERATIONS": "DHMSB",
  "ENGINEERING AND RD": "ENGINEERING",
  "FINANCE PROCUREMENT AND IT": "FPIT",
  "HUMAN CAPITAL AND ESG": "HC",
  "OPERATION MANAGEMENT": "OPERATIONS",
  "QUALITY MANAGEMENT": "QUALITY",
  "CEO OFFICE": "CEO",
  "BUSINESS COORDINATOR": "BC",
};

function abbreviateDivision(division: string) {
  const normalized = division.trim().toUpperCase();
  return divisionAbbreviations[normalized] ?? division;
}

const departmentAbbreviations: Record<string, string> = {
  "MANUFACTURING AND SCM - TM 1": "MFG SCM TM1",
  "QUALITY ASSURANCE & CONTROL SA 1": "QAQC SA1",
  "MANUFACTURING AND SCM - PEKAN": "MFG SCM PEKAN",
  "MANUFACTURING AND SCM - PEGOH": "MFG SCM PEGOH",
  FINANCE: "FINANCE",
  "HICOM INTELLIGENT MOBILITY": "HICOM MOBILITY",
  "REWARDS AND ADMIN": "REWARDS ADMIN",
  "MANUFACTURING AND SCM - SA1": "MFG SCM SA1",
  "PROGRAM MANAGEMENT II": "PROGRAM MGMT II",
  "INVENTORY MGMT AND PLANNING": "INV & PLAN",
  "MANUFACTURING AND SCM - BB/RASA": "MFG SCM BB/RASA",
  "QUALITY ASSURANCE & CONTROL SA 2": "QAQC SA2",
  "FACILITY AND ENERGY MANAGEMENT": "FACILITY & ENERGY",
  "QUALITY ASSURANCE & CONTROL - BB, RASA, TM 1 AND TM 2": "QAQC BB/RASA",
  "CULTURE AND TALENT MANAGEMENT": "CULTURE & TALENT",
  "PROCESS ENGINEERING": "PROCESS ENG",
  "IT AND DIGITALISATION": "IT & DIGITAL",
  "QUALITY ASSURANCE & CONTROL-DEV - MLK PKN": "QAQC DEV MLK",
  "PROGRAM MANAGEMENT III": "PROGRAM MGMT III",
  "MANUFACTURING AND SCM - SA 2": "MFG SCM SA2",
  "EQUIPMENT MAINT I - SA 1, SA 2, DHMSB, PEGOH": "EQUIP MAINT I",
  "MFG & SCM - DHMSB": "MFG SCM DHMSB",
  "MANUFACTURING AND SCM - TM 2": "MFG SCM TM2",
  "PROGRAM MANAGEMENT I": "PROGRAM MGMT I",
  "EQUIPMENT MAINT II - BB, RASA, TM1, TM2": "EQUIP MAINT II",
  "RESEARCH AND DEVELOPMENT": "R&D",
  "TOOLING DESIGN AND DEVELOPMENT": "TOOLING DEV",
  "PROCUREMENT & VENDOR DEV": "PROC & VENDOR",
  "CEO OFFICE": "CEO OFFICE",
  "ESG HEALTH AND SAFETY": "ESG H&S",
  "COSTING AND COMMERCIAL": "COST & COMM",
  "QMS & SQ": "QMS & SQ",
  "QUALITY DEVELOPMENT": "QUALITY DEV",
  "BUSINESS DEVELOPMENT": "BUSINESS DEV",
  OPERATIONS: "OPERATIONS",
  "ENERGY SOLUTION": "ENERGY SOL",
  "ENGINEERING MANAGEMENT I": "ENGINEERING I",
  "OPERATION III": "OPERATION III",
  "PROGRAM MANAGEMENT": "PROGRAM MGMT",
  "-": "-",
  "ENGINEERING MANAGEMENT II": "ENGINEERING II",
  "OPERATION II": "OPERATION II",
  "OPERATION I AND IMP": "OP I & IMP",
  "OPERATION IV": "OPERATION IV",
  "QUALITY MANAGEMENT": "QUALITY MGMT",
  "QUALITY OPERATIONS": "QUALITY OPS",
  "ENERGY MGMT AUTHORITY LIASON": "ENERGY MGMT",
};

function abbreviateDepartment(department: string) {
  const normalized = department.trim().toUpperCase();
  return departmentAbbreviations[normalized] ?? department;
}

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

function normalizeGender(value: unknown) {
  const normalized = normalizeText(value).toUpperCase();

  if (normalized === "M" || normalized === "MALE") {
    return "M";
  }

  if (normalized === "F" || normalized === "FEMALE") {
    return "F";
  }

  return normalized;
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
  const snapshotYear = rawYear.length === 2 ? 2000 + numericYear : numericYear;

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
      gender: normalizeGender(row.Sex),
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

  return (
    joinDate <= endDate && (!resignationDate || resignationDate >= startDate)
  );
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
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm font-poppins min-w-0">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        {/* <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          {badgeLabel}
        </span> */}
      </div>

      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
        <span>Count</span>
        <span>Division</span>
      </div>

      <ChartContainer className="h-56 w-full">
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
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <Tooltip
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullLabel ??
                payload?.[0]?.payload?.label ??
                ""
              }
              formatter={(value) => [`${value ?? 0}`, "Count"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "8px 10px",
                fontSize: "12px",
              }}
              itemStyle={{ fontSize: "12px" }}
              labelStyle={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#111827",
              }}
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
      </ChartContainer>

      {topDivision && (
        <p className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-400">
          Top division: {topDivision.fullLabel ?? topDivision.label}
        </p>
      )}
    </div>
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
    { name: "Permanent", value: permanentCount, color: "#0d9488" },
    { name: "Contract", value: contractCount, color: "#c026d3" },
  ];

  return (
    <article className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm min-w-0">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Employment Type
      </p>
      <ChartContainer className="mt-4 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
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
              labelStyle={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#111827",
              }}
              wrapperStyle={{ outline: "none" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span className="h-3 w-3 rounded-full bg-teal-600" />
          <span>
            Permanent: {formatCount(permanentCount)} (
            {formatPercentage(permanentCount)})
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span className="h-3 w-3 rounded-full bg-fuchsia-600" />
          <span>
            Contract: {formatCount(contractCount)} (
            {formatPercentage(contractCount)})
          </span>
        </div>
      </div>
    </article>
  );
}

function PermanentContractByPlantChart({
  data,
}: {
  data: {
    plant: string;
    permanent: number;
    contract: number;
    male: number;
    female: number;
  }[];
}) {
  return (
    <article className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm min-w-0">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Permanent vs Contract by Plant
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Bars: Permanent vs Contract · Lines: Male vs Female
      </p>

      <ChartContainer className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 18 }}
          >
            <CartesianGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="plant"
              angle={-20}
              interval={0}
              textAnchor="end"
              height={52}
              tickFormatter={(value: string) => abbreviatePlant(value)}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickFormatter={(value: number) => formatCount(value)}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <Tooltip
              labelFormatter={(label) => label}
              formatter={(value, name) => [
                formatCount(Number(value ?? 0)),
                name,
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "8px 10px",
                fontSize: "12px",
              }}
              itemStyle={{ fontSize: "12px" }}
              labelStyle={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#111827",
              }}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar
              dataKey="permanent"
              name="Permanent"
              stackId="status"
              fill="#4338ca"
            />
            <Bar
              dataKey="contract"
              name="Contract"
              stackId="status"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="male"
              name="Male"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 3, fill: "#0ea5e9", stroke: "#ffffff", strokeWidth: 1 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="female"
              name="Female"
              stroke="#ec4899"
              strokeWidth={2}
              dot={{ r: 3, fill: "#ec4899", stroke: "#ffffff", strokeWidth: 1 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span className="h-3 w-3 rounded-full bg-indigo-700" />
          <span>Permanent</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <span>Contract</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span className="h-3 w-3 rounded-full bg-sky-500" />
          <span>Male</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span className="h-3 w-3 rounded-full bg-pink-500" />
          <span>Female</span>
        </div>
      </div>
    </article>
  );
}

const divisionChartColors = [
  "#4338ca",
  "#0f766e",
  "#b45309",
  "#be185d",
  "#0ea5e9",
  "#7c3aed",
  "#16a34a",
  "#dc2626",
  "#ca8a04",
  "#0891b2",
];

function ManpowerByDivisionChart({
  data,
}: {
  data: { division: string; label: string; value: number }[];
}) {
  return (
    <article className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm min-w-0">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Manpower by Division
      </p>
      <ChartContainer className="mt-4 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              interval={0}
              height={30}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickFormatter={(value: number) => formatCount(value)}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <Tooltip
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.division ?? ""
              }
              formatter={(value) => [formatCount(Number(value ?? 0)), "Count"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "8px 10px",
                fontSize: "12px",
              }}
              itemStyle={{ fontSize: "12px" }}
              labelStyle={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#111827",
              }}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar
              dataKey="value"
              name="Count"
              background={{ fill: "#f3f4f6" }}
              radius={[6, 6, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.division}
                  fill={divisionChartColors[index % divisionChartColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </article>
  );
}

function ManpowerByDepartmentChart({
  data,
}: {
  data: { department: string; label: string; value: number }[];
}) {
  const chartHeight = Math.max(data.length * 28, 160);

  return (
    <article className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm min-w-0">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Manpower by Department
      </p>
      <div className="mt-4 h-[500px] w-full overflow-y-auto">
        <ChartContainer className="w-full" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              barCategoryGap="30%"
              barSize={12}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis
                type="number"
                allowDecimals={false}
                tickFormatter={(value: number) => formatCount(value)}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={180}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />
              <Tooltip
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.department ?? ""
                }
                formatter={(value) => [
                  formatCount(Number(value ?? 0)),
                  "Count",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  padding: "8px 10px",
                  fontSize: "12px",
                }}
                itemStyle={{ fontSize: "12px" }}
                labelStyle={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#111827",
                }}
                wrapperStyle={{ outline: "none" }}
              />
              <Bar
                dataKey="value"
                name="Count"
                background={{ fill: "#f3f4f6" }}
                radius={[0, 6, 6, 0]}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.department}
                    fill={
                      divisionChartColors[index % divisionChartColors.length]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
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
  const total = localCount + foreignCount;
  const getPercentage = (value: number) =>
    total === 0 ? 0 : (value / total) * 100;
  const formatPercentage = (value: number) => `${getPercentage(value).toFixed(1)}%`;

  return (
    <div className="">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Local vs Foreign
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-600" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
              Local
            </p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-emerald-900 dark:text-emerald-300">
            {localCount}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {formatPercentage(localCount)}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/60">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${getPercentage(localCount)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-orange-100 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-400">
              Foreign
            </p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-orange-900 dark:text-orange-300">
            {foreignCount}
          </p>
          <p className="mt-1 text-xs font-medium text-orange-700 dark:text-orange-400">
            {formatPercentage(foreignCount)}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-orange-100 dark:bg-orange-900/60">
            <div
              className="h-full rounded-full bg-orange-600"
              style={{ width: `${getPercentage(foreignCount)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExecutiveMixCard({
  executiveCount,
  nonExecutiveCount,
}: {
  executiveCount: number;
  nonExecutiveCount: number;
}) {
  const total = executiveCount + nonExecutiveCount;
  const getPercentage = (value: number) =>
    total === 0 ? 0 : (value / total) * 100;
  const formatPercentage = (value: number) => `${getPercentage(value).toFixed(1)}%`;

  return (
    <article className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm min-w-0">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Executive vs Non Executive
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-400">
            Executive
          </p>
          <p className="mt-2 text-xl font-semibold text-sky-900 dark:text-sky-300">
            {formatCount(executiveCount)}
          </p>
          <p className="mt-1 text-xs font-medium text-sky-700 dark:text-sky-400">
            {formatPercentage(executiveCount)}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900/60">
            <div
              className="h-full rounded-full bg-sky-600"
              style={{ width: `${getPercentage(executiveCount)}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl bg-violet-50 dark:bg-violet-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-400">
            Non Executive
          </p>
          <p className="mt-2 text-xl font-semibold text-violet-900 dark:text-violet-300">
            {formatCount(nonExecutiveCount)}
          </p>
          <p className="mt-1 text-xs font-medium text-violet-700 dark:text-violet-400">
            {formatPercentage(nonExecutiveCount)}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-violet-100 dark:bg-violet-900/60">
            <div
              className="h-full rounded-full bg-violet-600"
              style={{ width: `${getPercentage(nonExecutiveCount)}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function LabourMixCard({
  directCount,
  indirectCount,
  adminCount,
}: {
  directCount: number;
  indirectCount: number;
  adminCount: number;
}) {
  const total = directCount + indirectCount + adminCount;
  const getPercentage = (value: number) =>
    total === 0 ? 0 : (value / total) * 100;
  const formatPercentage = (value: number) =>
    `${getPercentage(value).toFixed(1)}%`;

  const chartData = [
    {
      label: "Total Direct",
      percentage: getPercentage(directCount),
      color: "#059669",
    },
    {
      label: "Total Indirect",
      percentage: getPercentage(indirectCount),
      color: "#d97706",
    },
    {
      label: "General Admin",
      percentage: getPercentage(adminCount),
      color: "#e11d48",
    },
  ];

  return (
    <article className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm min-w-0">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Total Direct vs Total Indirect vs General Admin
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
            Total Direct
          </p>
          <p className="mt-2 text-xl font-semibold text-emerald-900 dark:text-emerald-300">
            {formatCount(directCount)}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {formatPercentage(directCount)}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/60">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${getPercentage(directCount)}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
            Total Indirect
          </p>
          <p className="mt-2 text-xl font-semibold text-amber-900 dark:text-amber-300">
            {formatCount(indirectCount)}
          </p>
          <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            {formatPercentage(indirectCount)}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/60">
            <div
              className="h-full rounded-full bg-amber-600"
              style={{ width: `${getPercentage(indirectCount)}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700 dark:text-rose-400">
            General Admin
          </p>
          <p className="mt-2 text-xl font-semibold text-rose-900 dark:text-rose-300">
            {formatCount(adminCount)}
          </p>
          <p className="mt-1 text-xs font-medium text-rose-700 dark:text-rose-400">
            {formatPercentage(adminCount)}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-rose-100 dark:bg-rose-900/60">
            <div
              className="h-full rounded-full bg-rose-600"
              style={{ width: `${getPercentage(adminCount)}%` }}
            />
          </div>
        </div>
      </div>

      <ChartContainer className="mt-4 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} />
            <YAxis
              allowDecimals={false}
              tickFormatter={(value: number) => `${value}%`}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) => [
                `${Number(value ?? 0).toFixed(1)}%`,
                "Share",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "8px 10px",
                fontSize: "12px",
              }}
              itemStyle={{ fontSize: "12px" }}
              labelStyle={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#111827",
              }}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </article>
  );
}

function GenderMixCard({
  maleCount,
  femaleCount,
}: {
  maleCount: number;
  femaleCount: number;
}) {
  const total = maleCount + femaleCount;
  const getPercentage = (value: number) =>
    total === 0 ? 0 : (value / total) * 100;
  const formatPercentage = (value: number) => `${getPercentage(value).toFixed(1)}%`;

  return (
    <article className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm min-w-0">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Male vs Female
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-400">
            Male
          </p>
          <p className="mt-2 text-xl font-semibold text-indigo-900 dark:text-indigo-300">
            {formatCount(maleCount)}
          </p>
          <p className="mt-1 text-xs font-medium text-indigo-700 dark:text-indigo-400">
            {formatPercentage(maleCount)}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900/60">
            <div
              className="h-full rounded-full bg-indigo-600"
              style={{ width: `${getPercentage(maleCount)}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl bg-pink-50 dark:bg-pink-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-700 dark:text-pink-400">
            Female
          </p>
          <p className="mt-2 text-xl font-semibold text-pink-900 dark:text-pink-300">
            {formatCount(femaleCount)}
          </p>
          <p className="mt-1 text-xs font-medium text-pink-700 dark:text-pink-400">
            {formatPercentage(femaleCount)}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-pink-100 dark:bg-pink-900/60">
            <div
              className="h-full rounded-full bg-pink-600"
              style={{ width: `${getPercentage(femaleCount)}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ManpowerAnalyticsComponent() {
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
    ...Array.from(
      new Set(employees.map((employee) => employee.department)),
    ).sort(),
  ];

  const divisionOptions = [
    "All Divisions",
    ...Array.from(
      new Set(employees.map((employee) => employee.division)),
    ).sort(),
  ];

  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear().toString(),
  );
  const [selectedPlant, setSelectedPlant] = useState(plantOptions[0]);
  const [selectedDepartment, setSelectedDepartment] = useState(
    departmentOptions[0],
  );
  const [selectedDivision, setSelectedDivision] = useState(
    divisionOptions[0],
  );
  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);

  const applyEmployees = (nextEmployees: EmployeeRecord[], message: string) => {
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
    setSelectedDivision("All Divisions");
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

        const payload: { data: SavedManpowerUpload | null } =
          await response.json();

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

    if (
      selectedDivision !== "All Divisions" &&
      employee.division !== selectedDivision
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
    (employee) => employee.labourCategory === "MFG OVERHEAD",
  ).length;
  const totalAdminCount = activeEmployees.filter(
    (employee) => employee.labourCategory === "GENERAL ADMIN",
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

  const maleCount = activeEmployees.filter(
    (employee) => employee.gender === "M",
  ).length;

  const femaleCount = activeEmployees.filter(
    (employee) => employee.gender === "F",
  ).length;

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
        .filter((employee) =>
          selectedDivision === "All Divisions"
            ? true
            : employee.division === selectedDivision,
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
      .sort((a, b) => b.value - a.value || a.division.localeCompare(b.division))
      .slice(0, 4)
      .map(({ division, value }) => ({
        label: abbreviateDivision(division),
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
    ...preferredPlantOrder.filter((plant) =>
      availableChartPlants.includes(plant),
    ),
    ...availableChartPlants
      .filter((plant) => !preferredPlantOrder.includes(plant))
      .sort(),
  ];

  const permanentContractByPlant = chartPlants.map((plant) => {
    const plantEmployees = activeEmployees.filter(
      (employee) => employee.plant === plant,
    );

    return {
      plant,
      permanent: plantEmployees.filter(
        (employee) => employee.employeeStatus === "PERMANENT",
      ).length,
      contract: plantEmployees.filter(
        (employee) => employee.employeeStatus === "CONTRACT",
      ).length,
      male: plantEmployees.filter((employee) => employee.gender === "M").length,
      female: plantEmployees.filter((employee) => employee.gender === "F")
        .length,
    };
  });

  const manpowerByDivision = Array.from(
    activeEmployees.reduce((map, employee) => {
      const currentCount = map.get(employee.division) ?? 0;
      map.set(employee.division, currentCount + 1);
      return map;
    }, new Map<string, number>()),
  )
    .map(([division, value]) => ({
      division,
      label: abbreviateDivision(division),
      value,
    }))
    .sort((a, b) => b.value - a.value || a.division.localeCompare(b.division));

  const manpowerByDepartment = Array.from(
    activeEmployees.reduce((map, employee) => {
      const currentCount = map.get(employee.department) ?? 0;
      map.set(employee.department, currentCount + 1);
      return map;
    }, new Map<string, number>()),
  )
    .map(([department, value]) => ({
      department,
      label: abbreviateDepartment(department),
      value,
    }))
    .sort(
      (a, b) => b.value - a.value || a.department.localeCompare(b.department),
    );

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
        setUploadMessage(
          "The uploaded workbook does not contain any worksheet.",
        );
        return;
      }

      const parsedEmployees = workbook.SheetNames.flatMap((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          worksheet,
          {
            defval: "",
            raw: false,
          },
        );

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
            <h1 className="mt-2 text-3xl font-semibold">Manpower Dashboard</h1>
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
                className="w-full rounded-lg border border-white/20 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none transition focus:border-indigo-300"
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
                className="w-full rounded-lg border border-white/20 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none transition focus:border-indigo-300"
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

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Data Source
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {uploadMessage}
            </p>
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

        <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            Active Records
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {employees.length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filters
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Refine the manpower dashboard by plant, department, division, and
            category.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Plant
            </span>
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none transition focus:border-indigo-300"
            >
              {plantOptions.map((plant) => (
                <option key={plant} value={plant}>
                  {plant}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Department
            </span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none transition focus:border-indigo-300"
            >
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Division
            </span>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none transition focus:border-indigo-300"
            >
              {divisionOptions.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Category
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none transition focus:border-indigo-300"
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm min-w-0 xl:col-start-1 xl:row-start-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Manpower
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {totalManpower}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Total loaded manpower records for the applied filters.
          </p>
        </article>
        <div className="h-full xl:col-start-1 xl:row-start-2">
          <ExecutiveMixCard
            executiveCount={executiveCount}
            nonExecutiveCount={nonExecutiveCount}
          />
        </div>
        <div className="h-full sm:col-span-2 xl:col-start-2 xl:col-span-2 xl:row-start-1 xl:row-span-2">
          <LabourMixCard
            directCount={totalDirectCount}
            indirectCount={totalIndirectCount}
            adminCount={totalAdminCount}
          />
        </div>
        <article className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm min-w-0 xl:col-start-4 xl:row-start-1">
          <LocalForeignChart
            localCount={localCount}
            foreignCount={foreignCount}
          />
        </article>
        <div className="h-full xl:col-start-4 xl:row-start-2">
          <GenderMixCard maleCount={maleCount} femaleCount={femaleCount} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EmploymentTypeDonutChart
          permanentCount={permanentCount}
          contractCount={contractCount}
        />
        <div className="sm:col-span-2 xl:col-span-3">
          <PermanentContractByPlantChart data={permanentContractByPlant} />
        </div>
      </div>

      <div className="grid gap-4">
        <ManpowerByDivisionChart data={manpowerByDivision} />
      </div>

      <div className="grid gap-4">
        <ManpowerByDepartmentChart data={manpowerByDepartment} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {chartPlants.map((plantName, index) => {
          const data = buildPlantDivisionData(plantName);
          const gridColors = ["#ccfbf1", "#e0e7ff", "#fef3c7", "#ede9fe"];

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
      </div>

      {employees.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            No Data Loaded
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Upload an Excel workbook to populate the manpower dashboard.
          </p>
        </div>
      )}
    </section>
  );
}
