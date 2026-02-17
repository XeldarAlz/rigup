import { join } from "node:path";
import { readdir, cp, readFile } from "node:fs/promises";
import { getBackupDir } from "../utils/paths.js";
import { ensureDir, fileExists, safeWriteFile } from "../utils/fs.js";

export async function createBackup(
  projectRoot: string,
  filePaths: string[]
): Promise<string | null> {
  const existingFiles = [];
  for (const fp of filePaths) {
    const fullPath = join(projectRoot, fp);
    if (await fileExists(fullPath)) {
      existingFiles.push(fp);
    }
  }

  if (existingFiles.length === 0) return null;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = join(getBackupDir(projectRoot), timestamp);
  await ensureDir(backupPath);

  for (const fp of existingFiles) {
    const src = join(projectRoot, fp);
    const dest = join(backupPath, fp);
    await ensureDir(join(dest, ".."));
    await cp(src, dest);
  }

  // Write manifest
  await safeWriteFile(
    join(backupPath, "manifest.json"),
    JSON.stringify({ files: existingFiles, createdAt: new Date().toISOString() }, null, 2)
  );

  return timestamp;
}

export async function listBackups(
  projectRoot: string
): Promise<string[]> {
  const dir = getBackupDir(projectRoot);
  try {
    const entries = await readdir(dir);
    return entries.sort().reverse();
  } catch {
    return [];
  }
}

export async function restoreBackup(
  projectRoot: string,
  timestamp: string
): Promise<string[]> {
  const backupPath = join(getBackupDir(projectRoot), timestamp);
  const manifestPath = join(backupPath, "manifest.json");

  const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
  const restored: string[] = [];

  for (const fp of manifest.files as string[]) {
    const src = join(backupPath, fp);
    const dest = join(projectRoot, fp);
    if (await fileExists(src)) {
      await ensureDir(join(dest, ".."));
      await cp(src, dest);
      restored.push(fp);
    }
  }

  return restored;
}
