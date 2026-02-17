import { join } from "node:path";
import { fileExists } from "../utils/fs.js";
import { getInstalled } from "./tracker.js";
import type { RegistryItem } from "../types/registry.js";
import type { ConflictInfo } from "../types/common.js";

export async function detectConflicts(
  projectRoot: string,
  item: RegistryItem
): Promise<ConflictInfo[]> {
  const conflicts: ConflictInfo[] = [];

  // Check item conflicts
  if (item.conflicts.length > 0) {
    const installed = await getInstalled(projectRoot);
    for (const conflictName of item.conflicts) {
      if (conflictName in installed) {
        conflicts.push({
          type: "item",
          name: conflictName,
          description: `"${item.name}" conflicts with installed item "${conflictName}"`,
        });
      }
    }
  }

  // Check file path collisions
  for (const file of item.files) {
    const targetPath = join(projectRoot, file.target);
    if (await fileExists(targetPath)) {
      conflicts.push({
        type: "file",
        name: file.target,
        description: `File "${file.target}" already exists`,
      });
    }
  }

  return conflicts;
}
