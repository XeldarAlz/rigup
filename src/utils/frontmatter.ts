export interface ParsedFrontmatter<T = Record<string, unknown>> {
  data: T;
  content: string;
}

export function parseFrontmatter<T = Record<string, unknown>>(
  raw: string
): ParsedFrontmatter<T> {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { data: {} as T, content: raw };
  }

  const yamlBlock = match[1];
  const content = match[2];

  // Simple YAML-like parser for flat key-value frontmatter
  const data: Record<string, unknown> = {};
  for (const line of yamlBlock.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value: unknown = line.slice(colonIdx + 1).trim();

    // Handle arrays (simple inline format: [a, b, c])
    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""));
    }
    // Handle booleans
    else if (value === "true") value = true;
    else if (value === "false") value = false;
    // Handle numbers
    else if (typeof value === "string" && /^\d+$/.test(value)) value = parseInt(value, 10);
    // Strip quotes
    else if (typeof value === "string") value = value.replace(/^["']|["']$/g, "");

    data[key] = value;
  }

  return { data: data as T, content };
}

export function serializeFrontmatter(
  data: Record<string, unknown>,
  content: string
): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map((v) => `"${v}"`).join(", ")}]`);
    } else if (typeof value === "string") {
      lines.push(`${key}: "${value}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  return `---\n${lines.join("\n")}\n---\n${content}`;
}
