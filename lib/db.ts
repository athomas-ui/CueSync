// One shared Prisma client for the whole server.
// In development, Next.js reloads modules on every edit; caching the client on
// globalThis stops each reload from opening a new pool of database connections.
// Server-only: never import this from a "use client" component.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

type Client = InstanceType<typeof PrismaClient>;
const globalForPrisma = globalThis as unknown as { prisma?: Client };

export const db: Client =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
