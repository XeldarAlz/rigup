export type ItemType = "agent" | "skill" | "hook" | "claude-md" | "mcp" | "settings";

export const ITEM_TYPES: ItemType[] = ["agent", "skill", "hook", "claude-md", "mcp", "settings"];

export interface InstallResult {
  item: string;
  type: ItemType;
  filesWritten: string[];
  settingsMerged: boolean;
  mcpMerged: boolean;
  claudeMdAppended: boolean;
  dependenciesInstalled: string[];
}

export interface DryRunResult {
  item: string;
  type: ItemType;
  filesToWrite: Array<{ path: string; exists: boolean }>;
  settingsToMerge: Record<string, unknown> | null;
  mcpToMerge: Record<string, unknown> | null;
  claudeMdToAppend: string | null;
  dependencies: string[];
  conflicts: ConflictInfo[];
}

export interface ConflictInfo {
  type: "item" | "file";
  name: string;
  description: string;
}

export interface DiagnosticCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
}

export interface DiagnosticResult {
  checks: DiagnosticCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
}
