import { describe, it, expect } from "vitest";
import { parseFrontmatter, serializeFrontmatter } from "../../src/utils/frontmatter.js";

describe("parseFrontmatter", () => {
  it("parses frontmatter with simple key-value pairs", () => {
    const input = `---
name: "test-agent"
description: "A test agent"
---
# Content here`;

    const result = parseFrontmatter(input);
    expect(result.data).toEqual({
      name: "test-agent",
      description: "A test agent",
    });
    expect(result.content).toBe("# Content here");
  });

  it("parses arrays in frontmatter", () => {
    const input = `---
name: "test"
tools: ["Read", "Write", "Bash"]
---
Content`;

    const result = parseFrontmatter(input);
    expect(result.data).toEqual({
      name: "test",
      tools: ["Read", "Write", "Bash"],
    });
  });

  it("parses booleans and numbers", () => {
    const input = `---
enabled: true
disabled: false
count: 42
---
Content`;

    const result = parseFrontmatter(input);
    expect(result.data).toEqual({
      enabled: true,
      disabled: false,
      count: 42,
    });
  });

  it("returns raw content when no frontmatter", () => {
    const input = "# Just content\nNo frontmatter here.";
    const result = parseFrontmatter(input);
    expect(result.data).toEqual({});
    expect(result.content).toBe(input);
  });
});

describe("serializeFrontmatter", () => {
  it("serializes key-value pairs to frontmatter", () => {
    const data = { name: "test", description: "A test" };
    const content = "# Content";
    const result = serializeFrontmatter(data, content);

    expect(result).toContain("---");
    expect(result).toContain('name: "test"');
    expect(result).toContain('description: "A test"');
    expect(result).toContain("# Content");
  });

  it("serializes arrays", () => {
    const data = { tools: ["Read", "Write"] };
    const result = serializeFrontmatter(data, "Content");
    expect(result).toContain('tools: ["Read", "Write"]');
  });

  it("roundtrips correctly", () => {
    const original = { name: "test", enabled: true, count: 5 };
    const content = "Body content";
    const serialized = serializeFrontmatter(original, content);
    const parsed = parseFrontmatter(serialized);

    expect(parsed.data).toEqual(original);
    expect(parsed.content).toBe(content);
  });
});
