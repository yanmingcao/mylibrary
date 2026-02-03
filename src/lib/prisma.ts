import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const prismaGlobal = globalThis as unknown as { prismaGlobal?: PrismaClient };

export const prisma = prismaGlobal.prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  prismaGlobal.prismaGlobal = prisma;
}
