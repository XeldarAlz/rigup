export interface AgentFrontmatter {
  name: string;
  description: string;
  tools?: string[];
  model?: string;
}

export interface SkillFrontmatter {
  name: string;
  description: string;
  command: string;
  args?: string;
}

export type HookEventName =
  | "PreToolUse"
  | "PostToolUse"
  | "Notification"
  | "Stop"
  | "SubagentStop";

export interface HookMatcher {
  tool_name?: string;
  file_paths?: string[];
}

export interface HookHandler {
  type: "command";
  command: string;
  timeout?: number;
}

export interface HookRule {
  matcher: HookMatcher;
  hooks: HookHandler[];
}

export interface HooksConfig {
  hooks: Partial<Record<HookEventName, HookRule[]>>;
}

export interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
}

export interface ClaudeSettings {
  permissions?: {
    allow?: string[];
    deny?: string[];
  };
  hooks?: HooksConfig["hooks"];
  [key: string]: unknown;
}
