import { REGISTRY_BASE_URL } from "../utils/constants.js";
import { RegistryFetchError } from "../utils/errors.js";
import { registryIndexSchema } from "../types/registry.js";
import type { RegistryIndex, RegistryItem } from "../types/registry.js";
import { getFromCache, saveToCache } from "./cache.js";

export async function fetchIndex(): Promise<RegistryIndex> {
  // Try cache first
  const cached = await getFromCache();
  if (cached) return cached;

  const url = `${REGISTRY_BASE_URL}/registry.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const index = registryIndexSchema.parse(data);

    // Save to cache
    const etag = response.headers.get("etag") || undefined;
    await saveToCache(index, etag);

    return index;
  } catch (error) {
    // Fallback to stale cache
    const stale = await getFromCache();
    if (stale) return stale;
    throw new RegistryFetchError(
      url,
      error instanceof Error ? error : undefined
    );
  }
}

export async function fetchItemFile(
  type: string,
  name: string,
  filename: string
): Promise<string> {
  const url = `${REGISTRY_BASE_URL}/items/${type}s/${name}/${filename}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new RegistryFetchError(
      url,
      error instanceof Error ? error : undefined
    );
  }
}

export async function isRegistryReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${REGISTRY_BASE_URL}/registry.json`, {
      method: "HEAD",
    });
    return response.ok;
  } catch {
    return false;
  }
}
