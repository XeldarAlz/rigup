import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  ensureDir,
  safeWriteFile,
  readJsonSafe,
  readTextSafe,
  fileExists,
  removeFile,
  isEmptyDir,
} from "../../src/utils/fs.js";

describe("fs utilities", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "rigup-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("ensureDir", () => {
    it("creates nested directories", async () => {
      const dir = join(tempDir, "a", "b", "c");
      await ensureDir(dir);
      expect(await fileExists(dir)).toBe(true);
    });

    it("does not fail if directory already exists", async () => {
      await ensureDir(tempDir);
      expect(await fileExists(tempDir)).toBe(true);
    });
  });

  describe("safeWriteFile", () => {
    it("writes content to a file, creating directories as needed", async () => {
      const filePath = join(tempDir, "sub", "test.txt");
      await safeWriteFile(filePath, "hello");
      const content = await readTextSafe(filePath);
      expect(content).toBe("hello");
    });
  });

  describe("readJsonSafe", () => {
    it("reads and parses valid JSON", async () => {
      const filePath = join(tempDir, "test.json");
      await safeWriteFile(filePath, '{"key": "value"}');
      const data = await readJsonSafe<{ key: string }>(filePath);
      expect(data).toEqual({ key: "value" });
    });

    it("returns null for non-existent files", async () => {
      const data = await readJsonSafe(join(tempDir, "nope.json"));
      expect(data).toBeNull();
    });

    it("returns null for invalid JSON", async () => {
      const filePath = join(tempDir, "bad.json");
      await safeWriteFile(filePath, "not json");
      const data = await readJsonSafe(filePath);
      expect(data).toBeNull();
    });
  });

  describe("fileExists", () => {
    it("returns true for existing files", async () => {
      const filePath = join(tempDir, "exists.txt");
      await safeWriteFile(filePath, "");
      expect(await fileExists(filePath)).toBe(true);
    });

    it("returns false for non-existent files", async () => {
      expect(await fileExists(join(tempDir, "nope.txt"))).toBe(false);
    });
  });

  describe("removeFile", () => {
    it("removes an existing file", async () => {
      const filePath = join(tempDir, "remove.txt");
      await safeWriteFile(filePath, "content");
      await removeFile(filePath);
      expect(await fileExists(filePath)).toBe(false);
    });

    it("does not throw for non-existent files", async () => {
      await expect(removeFile(join(tempDir, "nope.txt"))).resolves.toBeUndefined();
    });
  });

  describe("isEmptyDir", () => {
    it("returns true for empty directories", async () => {
      const dir = join(tempDir, "empty");
      await ensureDir(dir);
      expect(await isEmptyDir(dir)).toBe(true);
    });

    it("returns false for non-empty directories", async () => {
      await safeWriteFile(join(tempDir, "file.txt"), "content");
      expect(await isEmptyDir(tempDir)).toBe(false);
    });
  });
});
