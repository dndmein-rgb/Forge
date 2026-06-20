import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import dns from 'dns'

// Overriding DNS before Prisma attempts to connect
if (process.env.NODE_ENV === 'development') {
  dns.setServers(['1.1.1.1', '8.8.8.8'])
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

export const db=globalForPrisma.prisma ?? createPrismaClient();

if(process.env.NODE_ENV!=="production") globalForPrisma.prisma=db 