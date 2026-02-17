import { join, dirname } from "node:path";
import { getInstalledRecord, recordRemoval } from "./tracker.js";
import { removeSettings, removeMcp, removeClaudeMdSection } from "./merger.js";
import { removeFile, isEmptyDir, removeDir } from "../utils/fs.js";

export async function uninstall(
  projectRoot: string,
  name: string
): Promise<{ filesRemoved: string[] }> {
  const record = await getInstalledRecord(projectRoot, name);
  if (!record) {
    throw new Error(`Item "${name}" is not installed`);
  }

  // Remove installed files
  const filesRemoved: string[] = [];
  for (const filePath of record.files) {
    const fullPath = join(projectRoot, filePath);
    await removeFile(fullPath);
    filesRemoved.push(filePath);

    // Clean up empty directories
    const dir = dirname(fullPath);
    if (await isEmptyDir(dir)) {
      await removeDir(dir);
    }
  }

  // Remove CLAUDE.md section
  await removeClaudeMdSection(projectRoot, name);

  // Update tracking
  await recordRemoval(projectRoot, name);

  return { filesRemoved };
}
