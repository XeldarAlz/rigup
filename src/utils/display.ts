import pc from "picocolors";
import type { ItemType } from "../types/common.js";

const TYPE_COLORS: Record<ItemType, (s: string) => string> = {
  agent: pc.cyan,
  skill: pc.magenta,
  hook: pc.yellow,
  "claude-md": pc.green,
  mcp: pc.blue,
  settings: pc.gray,
};

const TYPE_ICONS: Record<ItemType, string> = {
  agent: "A",
  skill: "S",
  hook: "H",
  "claude-md": "M",
  mcp: "C",
  settings: "G",
};

export function formatItemType(type: ItemType): string {
  const color = TYPE_COLORS[type];
  const icon = TYPE_ICONS[type];
  return color(`[${icon}] ${type}`);
}

export function formatVersion(version: string): string {
  return pc.dim(`v${version}`);
}

export function formatTable(
  headers: string[],
  rows: string[][]
): string {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => stripAnsi(r[i] || "").length))
  );

  const headerLine = headers
    .map((h, i) => pc.bold(h.padEnd(colWidths[i])))
    .join("  ");
  const separator = colWidths.map((w) => "-".repeat(w)).join("  ");
  const bodyLines = rows.map((row) =>
    row.map((cell, i) => {
      const stripped = stripAnsi(cell);
      const padding = colWidths[i] - stripped.length;
      return cell + " ".repeat(Math.max(0, padding));
    }).join("  ")
  );

  return [headerLine, separator, ...bodyLines].join("\n");
}

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

export function box(title: string, content: string): string {
  const lines = content.split("\n");
  const maxLen = Math.max(title.length, ...lines.map((l) => stripAnsi(l).length));
  const top = `┌─ ${pc.bold(title)} ${"─".repeat(Math.max(0, maxLen - title.length))}┐`;
  const bottom = `└${"─".repeat(maxLen + 3)}┘`;
  const body = lines.map((l) => {
    const padding = maxLen - stripAnsi(l).length;
    return `│ ${l}${" ".repeat(Math.max(0, padding))} │`;
  });
  return [top, ...body, bottom].join("\n");
}
