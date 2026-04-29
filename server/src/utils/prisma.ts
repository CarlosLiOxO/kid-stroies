/**
 * Prisma 客户端单例 - 全局唯一的数据库连接实例
 * 开发环境使用 SQLite，生产环境使用 PostgreSQL（Render 提供）
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * 手动加载 .env 文件（解决 dotenvx 全局拦截问题）
 * prisma.ts 在模块顶层执行，必须先于 dotenv.config() 加载环境变量
 */
function loadEnvFromFile(): void {
  try {
    const envPath = resolve(__dirname, '../../.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const eqIndex = trimmed.indexOf('=');
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env 文件读取失败时忽略，使用系统环境变量 fallback
  }
}
loadEnvFromFile();

import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

/** 全局 Prisma 客户端实例 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL 环境变量未配置');
  }

  // PostgreSQL (生产环境 / Render)
  if (databaseUrl.startsWith('postgres')) {
    const adapter = new PrismaPg(databaseUrl);
    return new PrismaClient({ adapter });
  }

  // SQLite (本地开发环境)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqliteModule = require('@prisma/adapter-better-sqlite3') as {
    PrismaBetterSqlite3: new (config: { url: string }) => { connect: () => Promise<unknown> };
  };
  return new PrismaClient({ adapter: new sqliteModule.PrismaBetterSqlite3({ url: databaseUrl }) as never });
}

/** 导出 Prisma 客户端单例 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

/** 开发环境下将实例挂载到全局对象，防止热重载时重复创建 */
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
