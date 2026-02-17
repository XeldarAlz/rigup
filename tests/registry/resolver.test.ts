import { describe, it, expect } from "vitest";
import { resolve, resolveAll, resolveDependencyTree, fuzzySearch } from "../../src/registry/resolver.js";
import type { RegistryIndex, RegistryItem } from "../../src/types/registry.js";

function createItem(overrides: Partial<RegistryItem> = {}): RegistryItem {
  return {
    name: "test-item",
    type: "agent",
    version: "1.0.0",
    description: "A test item",
    author: "test",
    tags: [],
    files: [],
    dependencies: [],
    conflicts: [],
    ...overrides,
  };
}

function createIndex(items: RegistryItem[]): RegistryIndex {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    items,
  };
}

describe("resolve", () => {
  it("finds an item by name", () => {
    const item = createItem({ name: "react-expert" });
    const index = createIndex([item]);
    expect(resolve(index, "react-expert")).toEqual(item);
  });

  it("filters by type when specified", () => {
    const agent = createItem({ name: "test", type: "agent" });
    const skill = createItem({ name: "test", type: "skill" });
    const index = createIndex([agent, skill]);

    expect(resolve(index, "test", "skill")).toEqual(skill);
  });

  it("throws ItemNotFoundError when not found", () => {
    const index = createIndex([]);
    expect(() => resolve(index, "nonexistent")).toThrow("not found");
  });
});

describe("resolveAll", () => {
  it("returns all matching items", () => {
    const agent = createItem({ name: "test", type: "agent" });
    const skill = createItem({ name: "test", type: "skill" });
    const other = createItem({ name: "other" });
    const index = createIndex([agent, skill, other]);

    expect(resolveAll(index, "test")).toEqual([agent, skill]);
  });
});

describe("resolveDependencyTree", () => {
  it("returns item alone when no dependencies", () => {
    const item = createItem({ name: "solo" });
    const index = createIndex([item]);
    expect(resolveDependencyTree(index, item)).toEqual([item]);
  });

  it("resolves dependencies in topological order", () => {
    const dep = createItem({ name: "dep", dependencies: [] });
    const main = createItem({ name: "main", dependencies: ["dep"] });
    const index = createIndex([dep, main]);

    const result = resolveDependencyTree(index, main);
    expect(result.map((i) => i.name)).toEqual(["dep", "main"]);
  });

  it("detects circular dependencies", () => {
    const a = createItem({ name: "a", dependencies: ["b"] });
    const b = createItem({ name: "b", dependencies: ["a"] });
    const index = createIndex([a, b]);

    expect(() => resolveDependencyTree(index, a)).toThrow("Circular");
  });
});

describe("fuzzySearch", () => {
  it("finds items by exact name match", () => {
    const item = createItem({ name: "react-expert" });
    const index = createIndex([item]);

    const results = fuzzySearch(index, "react-expert");
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("react-expert");
  });

  it("finds items by partial name match", () => {
    const item = createItem({ name: "react-expert" });
    const index = createIndex([item]);

    const results = fuzzySearch(index, "react");
    expect(results.length).toBe(1);
  });

  it("finds items by tag", () => {
    const item = createItem({ name: "other", tags: ["react", "frontend"] });
    const index = createIndex([item]);

    const results = fuzzySearch(index, "react");
    expect(results.length).toBe(1);
  });

  it("finds items by description", () => {
    const item = createItem({ description: "A React component helper" });
    const index = createIndex([item]);

    const results = fuzzySearch(index, "react");
    expect(results.length).toBe(1);
  });

  it("returns empty array when nothing matches", () => {
    const index = createIndex([createItem()]);
    expect(fuzzySearch(index, "nonexistent")).toEqual([]);
  });

  it("sorts by relevance score", () => {
    const exact = createItem({ name: "react" });
    const partial = createItem({ name: "react-expert" });
    const tagged = createItem({ name: "other", tags: ["react"] });
    const index = createIndex([tagged, partial, exact]);

    const results = fuzzySearch(index, "react");
    expect(results[0].name).toBe("react");
    expect(results[1].name).toBe("react-expert");
  });
});
