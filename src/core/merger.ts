import { join } from "node:path";
import {
  getSettingsPath,
  getMcpPath,
  getClaudeMdPath,
} from "../utils/paths.js";
import { readJsonSafe, safeWriteFile, readTextSafe, fileExists } from "../utils/fs.js";
import { SECTION_START, SECTION_END } from "../utils/constants.js";
import type { ClaudeSettings, McpConfig } from "../types/claude.js";

export async function mergeSettings(
  projectRoot: string,
  fragment: Record<string, unknown>
): Promise<void> {
  const settingsPath = getSettingsPath(projectRoot);
  const existing = (await readJsonSafe<ClaudeSettings>(settingsPath)) || {};
  const merged = deepMerge(existing, fragment);
  await safeWriteFile(settingsPath, JSON.stringify(merged, null, 2));
}

export async function removeSettings(
  projectRoot: string,
  keys: string[]
): Promise<void> {
  const settingsPath = getSettingsPath(projectRoot);
  const existing = await readJsonSafe<Record<string, unknown>>(settingsPath);
  if (!existing) return;

  for (const key of keys) {
    delete existing[key];
  }
  await safeWriteFile(settingsPath, JSON.stringify(existing, null, 2));
}

export async function mergeMcp(
  projectRoot: string,
  servers: Record<string, unknown>
): Promise<void> {
  const mcpPath = getMcpPath(projectRoot);
  const existing = (await readJsonSafe<McpConfig>(mcpPath)) || {
    mcpServers: {},
  };
  existing.mcpServers = { ...existing.mcpServers, ...servers } as McpConfig["mcpServers"];
  await safeWriteFile(mcpPath, JSON.stringify(existing, null, 2));
}

export async function removeMcp(
  projectRoot: string,
  serverNames: string[]
): Promise<void> {
  const mcpPath = getMcpPath(projectRoot);
  const existing = await readJsonSafe<McpConfig>(mcpPath);
  if (!existing) return;

  for (const name of serverNames) {
    delete existing.mcpServers[name];
  }
  await safeWriteFile(mcpPath, JSON.stringify(existing, null, 2));
}

export async function appendClaudeMd(
  projectRoot: string,
  section: string,
  itemName: string
): Promise<void> {
  const mdPath = getClaudeMdPath(projectRoot);
  const existing = (await readTextSafe(mdPath)) || "";

  const marker = `\n\n${SECTION_START(itemName)}\n${section}\n${SECTION_END(itemName)}`;

  // Remove existing section if present
  const cleaned = removeSection(existing, itemName);
  const content = cleaned.trimEnd() + marker + "\n";
  await safeWriteFile(mdPath, content);
}

export async function removeClaudeMdSection(
  projectRoot: string,
  itemName: string
): Promise<void> {
  const mdPath = getClaudeMdPath(projectRoot);
  const existing = await readTextSafe(mdPath);
  if (!existing) return;

  const cleaned = removeSection(existing, itemName);
  await safeWriteFile(mdPath, cleaned);
}

function removeSection(content: string, itemName: string): string {
  const startMarker = SECTION_START(itemName);
  const endMarker = SECTION_END(itemName);
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) return content;

  const before = content.slice(0, startIdx);
  const after = content.slice(endIdx + endMarker.length);
  return (before.trimEnd() + after).trim() + "\n";
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (
      Array.isArray(value) &&
      Array.isArray(result[key])
    ) {
      // Union arrays (dedup)
      const merged = [...(result[key] as unknown[])];
      for (const item of value) {
        if (!merged.some((m) => JSON.stringify(m) === JSON.stringify(item))) {
          merged.push(item);
        }
      }
      result[key] = merged;
    } else if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}
