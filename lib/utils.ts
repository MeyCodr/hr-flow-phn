import { Prisma } from "@prisma/client";
import crypto from "crypto";

export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return "";

  // Trim whitespace and split by space
  const firstName = fullName.trim().split(" ")[0].toLowerCase();

  // Capitalize only the first letter
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

export function getFormRemarks(formData: Prisma.JsonValue | null): string {
  if (formData && typeof formData === "object" && !Array.isArray(formData)) {
    const obj = formData as Record<string, unknown>;
    if (typeof obj.remarks === "string") {
      return obj.remarks;
    }
  }
  return "";
}

export function generateResetToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export const addDashOption = (menu: { id: number; name: string }[]) => {
  if (!menu.some((item) => item.name === "-")) {
    return [{ id: 0, name: "-" }, ...menu];
  }
  return menu;
};

export function getCurrentDateTime(): string {
  const now = new Date();

  const date = now.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const time = now.toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return `${date} ${time}`; // e.g. "08/11/2025 14:35:42"
}

// ✅ Function to convert formatted date-time ("dd/mm/yyyy hh:mm:ss") → ISO format
export function convertToISO(dateTimeStr: string): string {
  // Expected input: "dd/mm/yyyy hh:mm:ss"
  const [datePart, timePart] = dateTimeStr.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);

  const isoString = new Date(
    year,
    month - 1, // JS months are 0-based
    day,
    ...timePart.split(":").map(Number)
  ).toISOString();

  return isoString; // e.g. "2025-11-08T06:35:42.000Z"
}

export function sanitizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
}
