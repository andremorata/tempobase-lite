import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Prisma CLI doesn't load .env.local — only Next.js does.
// Load it here so DATABASE_URL is available for migrate/generate commands.
try {
  process.loadEnvFile(path.resolve(import.meta.dirname, '.env.local'))
} catch {}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? '',
  },
})
