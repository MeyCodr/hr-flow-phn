// lib/prisma.ts
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// create adapter
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 10, // increase for VPS
});

// use shared client
export const prisma =
  global.prisma ||
  new PrismaClient({ adapter, log: ["query", "warn", "error"] });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
