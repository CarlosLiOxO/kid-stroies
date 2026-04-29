const { cpSync, existsSync, mkdirSync, rmSync } = require('fs');
const { resolve } = require('path');

/**
 * 复制 Prisma Client 到 dist 目录，保证 Render 运行 dist 产物时能正确加载生成代码。
 */
function copyPrismaClient() {
  const sourceDir = resolve(__dirname, '../src/generated/prisma');
  const targetDir = resolve(__dirname, '../dist/generated/prisma');

  if (!existsSync(sourceDir)) {
    throw new Error(`Prisma Client 不存在，无法复制：${sourceDir}`);
  }

  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(resolve(targetDir, '..'), { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });

  console.log(`Prisma Client 已复制到 dist：${targetDir}`);
}

copyPrismaClient();
