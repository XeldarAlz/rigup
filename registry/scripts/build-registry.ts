#!/usr/bin/env npx tsx

/**
 * Build script for rigup-registry
 * Scans all items/[type]/[name]/meta.json files and generates registry.json
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

const registryFileSchema = z.object({
  path: z.string(),
  target: z.string(),
  template: z.boolean().optional(),
});

const registryItemSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["agent", "skill", "hook", "claude-md", "mcp", "settings"]),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string(),
  author: z.string(),
  tags: z.array(z.string()).default([]),
  files: z.array(registryFileSchema),
  dependencies: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
  settings: z.record(z.unknown()).optional(),
  mcp: z.record(z.unknown()).optional(),
  claudeMd: z.string().optional(),
});

type RegistryItem = z.infer<typeof registryItemSchema>;

const TYPE_DIRS: Record<string, string> = {
  agents: "agent",
  skills: "skill",
  hooks: "hook",
  "claude-md": "claude-md",
  mcp: "mcp",
  settings: "settings",
};

async function scanItems(registryRoot: string): Promise<RegistryItem[]> {
  const itemsDir = join(registryRoot, "items");
  const items: RegistryItem[] = [];
  const errors: string[] = [];

  for (const [dirName, expectedType] of Object.entries(TYPE_DIRS)) {
    const typeDir = join(itemsDir, dirName);
    let entries: string[];

    try {
      entries = await readdir(typeDir);
    } catch {
      console.warn(`  Skipping ${dirName}/ (directory not found)`);
      continue;
    }

    for (const itemName of entries) {
      const metaPath = join(typeDir, itemName, "meta.json");
      try {
        const raw = await readFile(metaPath, "utf-8");
        const parsed = JSON.parse(raw);
        const validated = registryItemSchema.parse(parsed);

        if (validated.type !== expectedType) {
          errors.push(
            `${dirName}/${itemName}: type "${validated.type}" doesn't match directory "${dirName}" (expected "${expectedType}")`
          );
          continue;
        }

        items.push(validated);
        console.log(`  ✓ ${validated.type}/${validated.name} v${validated.version}`);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(
            `${dirName}/${itemName}: validation failed:\n${error.errors.map((e) => `    - ${e.path.join(".")}: ${e.message}`).join("\n")}`
          );
        } else if (error instanceof SyntaxError) {
          errors.push(`${dirName}/${itemName}: invalid JSON in meta.json`);
        } else {
          // Skip directories without meta.json silently
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error("\nErrors found:");
    for (const err of errors) {
      console.error(`  ✗ ${err}`);
    }
    if (process.argv.includes("--validate")) {
      process.exit(1);
    }
  }

  return items;
}

async function main(): Promise<void> {
  const registryRoot = join(import.meta.dirname || process.cwd(), "..");
  console.log("Building rigup registry...\n");

  const items = await scanItems(registryRoot);

  const registry = {
    version: 1,
    updatedAt: new Date().toISOString(),
    items: items.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.name.localeCompare(b.name);
    }),
  };

  const outputPath = join(registryRoot, "registry.json");
  await writeFile(outputPath, JSON.stringify(registry, null, 2));

  console.log(
    `\n✓ Generated registry.json with ${items.length} items`
  );

  // Summary by type
  const byType = items.reduce(
    (acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`);
  }
}

main().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
