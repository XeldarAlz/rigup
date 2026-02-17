import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { ensureDir, readJsonSafe, readTextSafe, safeWriteFile } from "../../src/utils/fs.js";
import {
  mergeSettings,
  removeSettings,
  mergeMcp,
  removeMcp,
  appendClaudeMd,
  removeClaudeMdSection,
} from "../../src/core/merger.js";

describe("merger", () => {
  let projectRoot: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), "rigup-merger-"));
    await ensureDir(join(projectRoot, ".claude"));
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  describe("mergeSettings", () => {
    it("creates settings.json when it doesn't exist", async () => {
      await mergeSettings(projectRoot, { permissions: { allow: ["Read(*)"] } });
      const settings = await readJsonSafe(join(projectRoot, ".claude", "settings.json"));
      expect(settings).toEqual({ permissions: { allow: ["Read(*)"] } });
    });

    it("deep merges with existing settings", async () => {
      await safeWriteFile(
        join(projectRoot, ".claude", "settings.json"),
        JSON.stringify({ permissions: { allow: ["Read(*)"] }, other: true })
      );
      await mergeSettings(projectRoot, { permissions: { allow: ["Write(*)"] } });
      const settings = await readJsonSafe<any>(join(projectRoot, ".claude", "settings.json"));
      expect(settings.permissions.allow).toEqual(["Read(*)", "Write(*)"]);
      expect(settings.other).toBe(true);
    });
  });

  describe("removeSettings", () => {
    it("removes specified keys", async () => {
      await safeWriteFile(
        join(projectRoot, ".claude", "settings.json"),
        JSON.stringify({ a: 1, b: 2, c: 3 })
      );
      await removeSettings(projectRoot, ["a", "c"]);
      const settings = await readJsonSafe<any>(join(projectRoot, ".claude", "settings.json"));
      expect(settings).toEqual({ b: 2 });
    });
  });

  describe("mergeMcp", () => {
    it("creates .mcp.json when it doesn't exist", async () => {
      await mergeMcp(projectRoot, {
        "my-server": { command: "npx", args: ["-y", "my-server"] },
      });
      const mcp = await readJsonSafe<any>(join(projectRoot, ".mcp.json"));
      expect(mcp.mcpServers["my-server"]).toBeDefined();
    });

    it("adds servers to existing .mcp.json", async () => {
      await safeWriteFile(
        join(projectRoot, ".mcp.json"),
        JSON.stringify({ mcpServers: { existing: { command: "node" } } })
      );
      await mergeMcp(projectRoot, {
        "new-server": { command: "npx", args: ["new"] },
      });
      const mcp = await readJsonSafe<any>(join(projectRoot, ".mcp.json"));
      expect(mcp.mcpServers.existing).toBeDefined();
      expect(mcp.mcpServers["new-server"]).toBeDefined();
    });
  });

  describe("removeMcp", () => {
    it("removes specified servers", async () => {
      await safeWriteFile(
        join(projectRoot, ".mcp.json"),
        JSON.stringify({ mcpServers: { a: { command: "a" }, b: { command: "b" } } })
      );
      await removeMcp(projectRoot, ["a"]);
      const mcp = await readJsonSafe<any>(join(projectRoot, ".mcp.json"));
      expect(mcp.mcpServers.a).toBeUndefined();
      expect(mcp.mcpServers.b).toBeDefined();
    });
  });

  describe("appendClaudeMd", () => {
    it("creates CLAUDE.md and appends section", async () => {
      await appendClaudeMd(projectRoot, "## My Section\nContent here", "my-item");
      const content = await readTextSafe(join(projectRoot, "CLAUDE.md"));
      expect(content).toContain("<!-- rigup:start:my-item -->");
      expect(content).toContain("## My Section");
      expect(content).toContain("<!-- rigup:end:my-item -->");
    });

    it("replaces existing section with same name", async () => {
      await appendClaudeMd(projectRoot, "Version 1", "my-item");
      await appendClaudeMd(projectRoot, "Version 2", "my-item");
      const content = await readTextSafe(join(projectRoot, "CLAUDE.md"));
      expect(content).not.toContain("Version 1");
      expect(content).toContain("Version 2");
      // Only one pair of markers
      const starts = (content!.match(/rigup:start:my-item/g) || []).length;
      expect(starts).toBe(1);
    });
  });

  describe("removeClaudeMdSection", () => {
    it("removes a marked section", async () => {
      await appendClaudeMd(projectRoot, "Remove me", "to-remove");
      await appendClaudeMd(projectRoot, "Keep me", "to-keep");
      await removeClaudeMdSection(projectRoot, "to-remove");

      const content = await readTextSafe(join(projectRoot, "CLAUDE.md"));
      expect(content).not.toContain("Remove me");
      expect(content).toContain("Keep me");
    });
  });
});
