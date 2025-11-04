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

