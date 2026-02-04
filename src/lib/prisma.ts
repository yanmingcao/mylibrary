import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const globalForPrisma = globalThis as unknown as { prismaGlobal?: PrismaClient };
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

export const prisma =
  globalForPrisma.prismaGlobal ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}
