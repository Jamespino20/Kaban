import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { prismaAuditExtension } from "./prisma-audit";

const prismaClientSingleton = () => {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.KABANSTORAGE_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.KABANSTORAGE_URL ||
    process.env.KABANSTORAGE_PRISMA_URL;

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter }).$extends(prismaAuditExtension);
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma as unknown as ReturnType<typeof prismaClientSingleton>;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
