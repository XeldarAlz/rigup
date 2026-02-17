import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { ensureDir } from "../../src/utils/fs.js";
import {
  getTracking,
  saveTracking,
  recordInstall,
  recordRemoval,
  isInstalled,
  getInstalled,
  getInstalledRecord,
} from "../../src/core/tracker.js";

describe("tracker", () => {
  let projectRoot: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), "rigup-tracker-"));
    await ensureDir(join(projectRoot, ".claude"));
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
  });

  it("returns empty tracking when no file exists", async () => {
    const tracking = await getTracking(projectRoot);
    expect(tracking.version).toBe(1);
    expect(tracking.installed).toEqual({});
  });

  it("saves and reads tracking", async () => {
    const tracking = await getTracking(projectRoot);
    tracking.installed["test-item"] = {
      name: "test-item",
      type: "agent",
      version: "1.0.0",
      installedAt: new Date().toISOString(),
      files: [".claude/agents/test-item.md"],
    };
    await saveTracking(projectRoot, tracking);

    const loaded = await getTracking(projectRoot);
    expect(loaded.installed["test-item"]).toBeDefined();
    expect(loaded.installed["test-item"].name).toBe("test-item");
  });

  it("records installs", async () => {
    await recordInstall(projectRoot, "my-agent", "agent", "1.0.0", [
      ".claude/agents/my-agent.md",
    ]);
    expect(await isInstalled(projectRoot, "my-agent")).toBe(true);
    expect(await isInstalled(projectRoot, "other")).toBe(false);
  });

  it("records removals", async () => {
    await recordInstall(projectRoot, "my-agent", "agent", "1.0.0", []);
    await recordRemoval(projectRoot, "my-agent");
    expect(await isInstalled(projectRoot, "my-agent")).toBe(false);
  });

  it("lists all installed items", async () => {
    await recordInstall(projectRoot, "agent-1", "agent", "1.0.0", []);
    await recordInstall(projectRoot, "hook-1", "hook", "1.0.0", []);

    const installed = await getInstalled(projectRoot);
    expect(Object.keys(installed)).toEqual(["agent-1", "hook-1"]);
  });

  it("gets individual installed record", async () => {
    await recordInstall(projectRoot, "my-agent", "agent", "2.0.0", [
      ".claude/agents/my-agent.md",
    ]);

    const record = await getInstalledRecord(projectRoot, "my-agent");
    expect(record).not.toBeNull();
    expect(record!.version).toBe("2.0.0");
    expect(record!.files).toEqual([".claude/agents/my-agent.md"]);
  });

  it("returns null for non-installed record", async () => {
    const record = await getInstalledRecord(projectRoot, "nope");
    expect(record).toBeNull();
  });
});
