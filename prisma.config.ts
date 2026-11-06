import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
    // Optional: only `migrate dev` on your machine needs a shadow database.
    // env() throws when a variable is missing, so production (Vercel), which
    // has no shadow database, would fail. process.env returns undefined instead.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
