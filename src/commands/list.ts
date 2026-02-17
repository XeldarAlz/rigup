import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { findProjectRoot } from "../utils/paths.js";
import { getInstalled } from "../core/tracker.js";
import { fetchIndex } from "../registry/client.js";
import { formatItemType, formatVersion, formatTable } from "../utils/display.js";
import type { ItemType } from "../types/common.js";

export const listCommand = new Command("list")
  .alias("ls")
  .description("List installed or available items")
  .option("-r, --remote", "Show all registry items")
  .option("-t, --type <type>", "Filter by item type")
  .option("-j, --json", "Output as JSON")
  .action(async (opts: { remote?: boolean; type?: string; json?: boolean }) => {
    const projectRoot = await findProjectRoot();

    if (opts.remote) {
      const s = p.spinner();
      s.start("Fetching registry");
      try {
        const index = await fetchIndex();
        s.stop("Registry loaded");

        let items = index.items;
        if (opts.type) {
          items = items.filter((i) => i.type === opts.type);
        }

        if (opts.json) {
          console.log(JSON.stringify(items, null, 2));
          return;
        }

        const installed = projectRoot ? await getInstalled(projectRoot) : {};

        const rows = items.map((item) => [
          item.name in installed ? pc.green("✓") : " ",
          formatItemType(item.type as ItemType),
          pc.bold(item.name),
          formatVersion(item.version),
          pc.dim(item.description),
        ]);

        console.log(
          formatTable(["", "Type", "Name", "Version", "Description"], rows)
        );
        console.log(pc.dim(`\n${items.length} items available`));
      } catch (error) {
        s.stop("Failed");
        p.log.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    } else {
      if (!projectRoot) {
        p.log.error("No project root found. Run this from a project directory.");
        process.exit(1);
      }

      const installed = await getInstalled(projectRoot);
      const entries = Object.values(installed);

      if (opts.type) {
        const filtered = entries.filter((i) => i.type === opts.type);
        if (opts.json) {
          console.log(JSON.stringify(filtered, null, 2));
          return;
        }
        displayInstalled(filtered);
      } else {
        if (opts.json) {
          console.log(JSON.stringify(entries, null, 2));
          return;
        }
        displayInstalled(entries);
      }
    }
  });

function displayInstalled(
  items: Array<{ name: string; type: string; version: string; installedAt: string }>
): void {
  if (items.length === 0) {
    console.log(pc.dim("No items installed. Run `rig add <name>` to get started."));
    return;
  }

  const rows = items.map((item) => [
    formatItemType(item.type as ItemType),
    pc.bold(item.name),
    formatVersion(item.version),
    pc.dim(new Date(item.installedAt).toLocaleDateString()),
  ]);

  console.log(formatTable(["Type", "Name", "Version", "Installed"], rows));
  console.log(pc.dim(`\n${items.length} items installed`));
}
