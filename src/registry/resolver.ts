import type { RegistryIndex, RegistryItem } from "../types/registry.js";
import type { ItemType } from "../types/common.js";
import { ItemNotFoundError } from "../utils/errors.js";

export function resolve(
  index: RegistryIndex,
  name: string,
  type?: ItemType
): RegistryItem {
  const matches = index.items.filter(
    (item) => item.name === name && (!type || item.type === type)
  );
  if (matches.length === 0) {
    throw new ItemNotFoundError(name);
  }
  if (matches.length === 1) return matches[0];
  // Multiple matches — prefer exact type match, or return first
  return matches[0];
}

export function resolveAll(
  index: RegistryIndex,
  name: string
): RegistryItem[] {
  return index.items.filter((item) => item.name === name);
}

export function resolveDependencyTree(
  index: RegistryIndex,
  item: RegistryItem
): RegistryItem[] {
  const resolved: RegistryItem[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(current: RegistryItem): void {
    if (visited.has(current.name)) return;
    if (visiting.has(current.name)) {
      throw new Error(`Circular dependency detected: ${current.name}`);
    }

    visiting.add(current.name);

    for (const depName of current.dependencies) {
      const dep = index.items.find((i) => i.name === depName);
      if (dep) visit(dep);
    }

    visiting.delete(current.name);
    visited.add(current.name);
    resolved.push(current);
  }

  visit(item);
  return resolved;
}

export function fuzzySearch(
  index: RegistryIndex,
  query: string
): Array<RegistryItem & { score: number }> {
  const q = query.toLowerCase();
  return index.items
    .map((item) => {
      let score = 0;
      const name = item.name.toLowerCase();
      const desc = item.description.toLowerCase();
      const tags = item.tags.map((t) => t.toLowerCase());

      if (name === q) score += 100;
      else if (name.startsWith(q)) score += 80;
      else if (name.includes(q)) score += 60;

      if (desc.includes(q)) score += 30;

      for (const tag of tags) {
        if (tag === q) score += 50;
        else if (tag.includes(q)) score += 20;
      }

      if (item.type === q) score += 40;

      return { ...item, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}
