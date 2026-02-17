import { z } from "zod";
import type { ItemType } from "./common.js";

export const registryFileSchema = z.object({
  path: z.string(),
  target: z.string(),
  template: z.boolean().optional(),
});

export const registryItemSchema = z.object({
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

export const registryIndexSchema = z.object({
  version: z.number(),
  updatedAt: z.string(),
  items: z.array(registryItemSchema),
});

export type RegistryFile = z.infer<typeof registryFileSchema>;
export type RegistryItem = z.infer<typeof registryItemSchema>;
export type RegistryIndex = z.infer<typeof registryIndexSchema>;
