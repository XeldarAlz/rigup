import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { fetchIndex } from "../registry/client.js";
import { resolve, resolveAll } from "../registry/resolver.js";
import { findProjectRoot } from "../utils/paths.js";
import { isInstalled, getInstalledRecord } from "../core/tracker.js";
import { formatItemType, formatVersion, box } from "../utils/display.js";
import type { ItemType } from "../types/common.js";

export const infoCommand = new Command("info")
  .description("Show detailed info about a registry item")
  .argument("<name>", "Item name")
  .option("-t, --type <type>", "Item type filter")
  .action(async (name: string, opts: { type?: string }) => {
    const s = p.spinner();
    s.start("Fetching item info");

    try {
      const index = await fetchIndex();
      const item = resolve(index, name, opts.type as ItemType | undefined);
      s.stop("Done");

      console.log(`\n${pc.bold(item.name)} ${formatVersion(item.version)}`);
      console.log(`${formatItemType(item.type as ItemType)}`);
      console.log(`${pc.dim(item.description)}\n`);

      console.log(`${pc.bold("Author:")} ${item.author}`);
      console.log(`${pc.bold("Tags:")} ${item.tags.length > 0 ? item.tags.join(", ") : pc.dim("none")}`);

      console.log(`\n${pc.bold("Files:")}`);
      for (const f of item.files) {
        console.log(`  ${f.path} → ${pc.cyan(f.target)}`);
      }

      if (item.dependencies.length > 0) {
        console.log(`\n${pc.bold("Dependencies:")} ${item.dependencies.join(", ")}`);
      }

      if (item.conflicts.length > 0) {
        console.log(`\n${pc.bold("Conflicts:")} ${pc.red(item.conflicts.join(", "))}`);
      }

      if (item.settings) {
        console.log(`\n${pc.bold("Settings:")} ${pc.dim("Merges into .claude/settings.json")}`);
      }
      if (item.mcp) {
        console.log(`${pc.bold("MCP:")} ${pc.dim("Adds servers to .mcp.json")}`);
      }
      if (item.claudeMd) {
        console.log(`${pc.bold("CLAUDE.md:")} ${pc.dim("Appends section to CLAUDE.md")}`);
      }

      // Check install status
      const projectRoot = await findProjectRoot();
      if (projectRoot) {
        const record = await getInstalledRecord(projectRoot, name);
        if (record) {
          console.log(`\n${pc.green("✓ Installed")} ${pc.dim(`(${formatVersion(record.version)} on ${new Date(record.installedAt).toLocaleDateString()})`)}`);
          const semver = await import("semver");
          if (semver.default.gt(item.version, record.version)) {
            console.log(`${pc.yellow("⚠ Update available:")} ${formatVersion(record.version)} → ${pc.green(formatVersion(item.version))}`);
          }
        } else {
          console.log(`\n${pc.dim("Not installed")}`);
        }
      }

      console.log();
    } catch (error) {
      s.stop("Failed");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
