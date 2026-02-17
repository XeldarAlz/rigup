import { join } from "node:path";
import { homedir } from "node:os";

export const REGISTRY_BASE_URL =
  "https://raw.githubusercontent.com/XeldarAlz/rigup-registry/main";

export const DEFAULT_CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

export const RIG_DIR = join(homedir(), ".rigup");
export const CACHE_DIR = join(RIG_DIR, "cache");
export const CONFIG_FILE = join(RIG_DIR, "config.json");

export const CLAUDE_DIR = ".claude";
export const RIG_TRACKING_FILE = "rig.json";
export const CLAUDE_SETTINGS_FILE = "settings.json";
export const CLAUDE_MD_FILE = "CLAUDE.md";
export const MCP_FILE = ".mcp.json";

export const BACKUP_DIR = "backups";

export const SECTION_START = (name: string) => `<!-- rigup:start:${name} -->`;
export const SECTION_END = (name: string) => `<!-- rigup:end:${name} -->`;
