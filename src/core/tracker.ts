import { readJsonSafe, safeWriteFile, fileExists } from "../utils/fs.js";
import { getTrackingPath, getClaudeDir } from "../utils/paths.js";
import { ensureDir } from "../utils/fs.js";
import type { RigTracking, InstalledItemRecord } from "../types/config.js";
import type { ItemType } from "../types/common.js";

function createEmptyTracking(): RigTracking {
  return {
    version: 1,
    installedAt: new Date().toISOString(),
    installed: {},
  };
}

export async function getTracking(projectRoot: string): Promise<RigTracking> {
  const path = getTrackingPath(projectRoot);
  const data = await readJsonSafe<RigTracking>(path);
  return data || createEmptyTracking();
}

export async function saveTracking(
  projectRoot: string,
  tracking: RigTracking
): Promise<void> {
  await ensureDir(getClaudeDir(projectRoot));
  await safeWriteFile(
    getTrackingPath(projectRoot),
    JSON.stringify(tracking, null, 2)
  );
}

export async function recordInstall(
  projectRoot: string,
  name: string,
  type: ItemType,
  version: string,
  files: string[]
): Promise<void> {
  const tracking = await getTracking(projectRoot);
  tracking.installed[name] = {
    name,
    type,
    version,
    installedAt: new Date().toISOString(),
    files,
  };
  await saveTracking(projectRoot, tracking);
}

export async function recordRemoval(
  projectRoot: string,
  name: string
): Promise<void> {
  const tracking = await getTracking(projectRoot);
  delete tracking.installed[name];
  await saveTracking(projectRoot, tracking);
}

export async function isInstalled(
  projectRoot: string,
  name: string
): Promise<boolean> {
  const tracking = await getTracking(projectRoot);
  return name in tracking.installed;
}

export async function getInstalled(
  projectRoot: string
): Promise<Record<string, InstalledItemRecord>> {
  const tracking = await getTracking(projectRoot);
  return tracking.installed;
}

export async function getInstalledRecord(
  projectRoot: string,
  name: string
): Promise<InstalledItemRecord | null> {
  const tracking = await getTracking(projectRoot);
  return tracking.installed[name] || null;
}
