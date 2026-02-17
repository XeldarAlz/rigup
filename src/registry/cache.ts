import { join } from "node:path";
import { getCacheDir } from "../utils/paths.js";
import { ensureDir, readJsonSafe, safeWriteFile } from "../utils/fs.js";
import { DEFAULT_CACHE_TTL } from "../utils/constants.js";
import type { RegistryIndex } from "../types/registry.js";

interface CacheMeta {
  fetchedAt: number;
  etag?: string;
}

function getCachePath(): string {
  return join(getCacheDir(), "registry.json");
}

function getMetaPath(): string {
  return join(getCacheDir(), "registry.meta.json");
}

export async function getFromCache(): Promise<RegistryIndex | null> {
  if (!(await isCacheValid())) return null;
  return readJsonSafe<RegistryIndex>(getCachePath());
}

export async function saveToCache(
  index: RegistryIndex,
  etag?: string
): Promise<void> {
  await ensureDir(getCacheDir());
  await safeWriteFile(getCachePath(), JSON.stringify(index, null, 2));
  const meta: CacheMeta = { fetchedAt: Date.now(), etag };
  await safeWriteFile(getMetaPath(), JSON.stringify(meta, null, 2));
}

export async function isCacheValid(ttl = DEFAULT_CACHE_TTL): Promise<boolean> {
  const meta = await readJsonSafe<CacheMeta>(getMetaPath());
  if (!meta) return false;
  return Date.now() - meta.fetchedAt < ttl;
}

export async function clearCache(): Promise<void> {
  const { removeFile } = await import("../utils/fs.js");
  await removeFile(getCachePath());
  await removeFile(getMetaPath());
}
