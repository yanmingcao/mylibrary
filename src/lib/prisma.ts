import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const globalForPrisma = globalThis as unknown as { prismaGlobal?: PrismaClient };
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const isSqlite = databaseUrl.startsWith("file:");

if (!isSqlite) {
  throw new Error("DATABASE_URL must use SQLite file: scheme.");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

const prismaClientOptions = { adapter };

export const prisma =
  globalForPrisma.prismaGlobal ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}
