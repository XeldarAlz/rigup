import { join, resolve, dirname } from "node:path";
import { homedir } from "node:os";
import { fileExists } from "./fs.js";
import {
  CLAUDE_DIR,
  RIG_TRACKING_FILE,
  CLAUDE_SETTINGS_FILE,
  MCP_FILE,
  CLAUDE_MD_FILE,
  BACKUP_DIR,
  RIG_DIR,
  CACHE_DIR,
} from "./constants.js";

export async function findProjectRoot(startDir?: string): Promise<string | null> {
  let dir = resolve(startDir || process.cwd());
  const root = dirname(dir);

  while (dir !== root) {
    if (
      (await fileExists(join(dir, ".git"))) ||
      (await fileExists(join(dir, "package.json")))
    ) {
      return dir;
    }
    dir = dirname(dir);
  }

  return null;
}

export function getClaudeDir(projectRoot: string): string {
  return join(projectRoot, CLAUDE_DIR);
}

export function getTrackingPath(projectRoot: string): string {
  return join(projectRoot, CLAUDE_DIR, RIG_TRACKING_FILE);
}

export function getSettingsPath(projectRoot: string): string {
  return join(projectRoot, CLAUDE_DIR, CLAUDE_SETTINGS_FILE);
}

export function getMcpPath(projectRoot: string): string {
  return join(projectRoot, MCP_FILE);
}

export function getClaudeMdPath(projectRoot: string): string {
  return join(projectRoot, CLAUDE_MD_FILE);
}

export function getBackupDir(projectRoot: string): string {
  return join(projectRoot, CLAUDE_DIR, BACKUP_DIR);
}

export function getRigDir(): string {
  return RIG_DIR;
}

export function getCacheDir(): string {
  return CACHE_DIR;
}

export function getRigHomePath(): string {
  return join(homedir(), ".rigup");
}
