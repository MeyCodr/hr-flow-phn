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

function createPrismaClient() {
  return new PrismaClient({ adapter, log: ["query", "warn", "error"] });
}

function hasExpectedModels(
  client: PrismaClient | undefined,
): client is PrismaClient {
  return Boolean(client && "manpowerUpload" in client);
}

// Recreate the cached client if it was initialized before a new Prisma model existed.
const prismaClient = hasExpectedModels(global.prisma)
  ? global.prisma
  : createPrismaClient();

export const prisma: PrismaClient = prismaClient;

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
