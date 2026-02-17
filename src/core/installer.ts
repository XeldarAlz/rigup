import { join } from "node:path";
import { fetchIndex, fetchItemFile } from "../registry/client.js";
import { resolve, resolveDependencyTree } from "../registry/resolver.js";
import { detectConflicts } from "./conflict.js";
import { createBackup } from "./backup.js";
import { recordInstall, isInstalled } from "./tracker.js";
import { mergeSettings, mergeMcp, appendClaudeMd } from "./merger.js";
import { safeWriteFile } from "../utils/fs.js";
import type { RegistryItem } from "../types/registry.js";
import type { ItemType, InstallResult, DryRunResult } from "../types/common.js";

export interface InstallOptions {
  projectRoot: string;
  type?: ItemType;
  force?: boolean;
  dryRun?: boolean;
}

export async function install(
  name: string,
  options: InstallOptions
): Promise<InstallResult | DryRunResult> {
  const { projectRoot, type, force, dryRun } = options;

  // Resolve item from registry
  const index = await fetchIndex();
  const item = resolve(index, name, type);

  // Resolve dependency tree
  const depTree = resolveDependencyTree(index, item);

  // Check conflicts
  const conflicts = await detectConflicts(projectRoot, item);
  if (conflicts.length > 0 && !force && !dryRun) {
    const conflictMsgs = conflicts.map((c) => c.description).join("\n");
    throw new Error(`Conflicts detected:\n${conflictMsgs}\n\nUse --force to override.`);
  }

  if (dryRun) {
    return buildDryRunResult(projectRoot, item, depTree, conflicts);
  }

  // Install dependencies first
  const depsInstalled: string[] = [];
  for (const dep of depTree) {
    if (dep.name === item.name) continue;
    if (await isInstalled(projectRoot, dep.name)) continue;
    await installItem(projectRoot, dep);
    depsInstalled.push(dep.name);
  }

  // Install the main item
  const filesWritten = await installItem(projectRoot, item);

  // Handle settings merge
  let settingsMerged = false;
  if (item.settings) {
    await mergeSettings(projectRoot, item.settings);
    settingsMerged = true;
  }

  // Handle MCP merge
  let mcpMerged = false;
  if (item.mcp) {
    await mergeMcp(projectRoot, item.mcp);
    mcpMerged = true;
  }

  // Handle CLAUDE.md append
  let claudeMdAppended = false;
  if (item.claudeMd) {
    await appendClaudeMd(projectRoot, item.claudeMd, item.name);
    claudeMdAppended = true;
  }

  // Record in tracking
  await recordInstall(projectRoot, item.name, item.type as ItemType, item.version, filesWritten);

  return {
    item: item.name,
    type: item.type as ItemType,
    filesWritten,
    settingsMerged,
    mcpMerged,
    claudeMdAppended,
    dependenciesInstalled: depsInstalled,
  };
}

async function installItem(
  projectRoot: string,
  item: RegistryItem
): Promise<string[]> {
  // Backup existing files
  const targetPaths = item.files.map((f) => f.target);
  await createBackup(projectRoot, targetPaths);

  const filesWritten: string[] = [];

  for (const file of item.files) {
    const content = await fetchItemFile(item.type, item.name, file.path);
    const targetPath = join(projectRoot, file.target);
    await safeWriteFile(targetPath, content);
    filesWritten.push(file.target);
  }

  return filesWritten;
}

async function buildDryRunResult(
  projectRoot: string,
  item: RegistryItem,
  depTree: RegistryItem[],
  conflicts: import("../types/common.js").ConflictInfo[]
): Promise<DryRunResult> {
  const { fileExists } = await import("../utils/fs.js");
  const filesToWrite = await Promise.all(
    item.files.map(async (f) => ({
      path: f.target,
      exists: await fileExists(join(projectRoot, f.target)),
    }))
  );

  return {
    item: item.name,
    type: item.type as ItemType,
    filesToWrite,
    settingsToMerge: (item.settings as Record<string, unknown>) || null,
    mcpToMerge: (item.mcp as Record<string, unknown>) || null,
    claudeMdToAppend: item.claudeMd || null,
    dependencies: depTree.filter((d) => d.name !== item.name).map((d) => d.name),
    conflicts,
  };
}
