import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import semver from "semver";
import { findProjectRoot } from "../utils/paths.js";
import { getInstalled } from "../core/tracker.js";
import { fetchIndex } from "../registry/client.js";
import { resolve } from "../registry/resolver.js";
import { install } from "../core/installer.js";
import { formatItemType, formatVersion } from "../utils/display.js";
import type { ItemType } from "../types/common.js";

export const updateCommand = new Command("update")
  .description("Update installed items")
  .argument("[name]", "Item name to update (omit for all)")
  .option("-a, --all", "Update all installed items")
  .option("-d, --dry-run", "Preview what would be updated")
  .action(async (name: string | undefined, opts: { all?: boolean; dryRun?: boolean }) => {
    const projectRoot = await findProjectRoot();
    if (!projectRoot) {
      p.log.error("No project root found. Run this from a project directory.");
      process.exit(1);
    }

    const s = p.spinner();
    s.start("Checking for updates");

    try {
      const installed = await getInstalled(projectRoot);
      const index = await fetchIndex();

      const toCheck = name
        ? { [name]: installed[name] }
        : installed;

      if (name && !installed[name]) {
        s.stop("Not found");
        p.log.error(`Item "${name}" is not installed.`);
        process.exit(1);
      }

      const updates: Array<{ name: string; from: string; to: string; type: ItemType }> = [];

      for (const [itemName, record] of Object.entries(toCheck)) {
        try {
          const registryItem = resolve(index, itemName, record.type as ItemType);
          if (semver.gt(registryItem.version, record.version)) {
            updates.push({
              name: itemName,
              from: record.version,
              to: registryItem.version,
              type: record.type as ItemType,
            });
          }
        } catch {
          // Item no longer in registry, skip
        }
      }

      s.stop("Check complete");

      if (updates.length === 0) {
        console.log(pc.green("All items are up to date!"));
        return;
      }

      console.log(pc.bold(`${updates.length} update(s) available:\n`));
      for (const u of updates) {
        console.log(
          `  ${formatItemType(u.type)} ${pc.bold(u.name)} ${pc.dim(u.from)} → ${pc.green(u.to)}`
        );
      }

      if (opts.dryRun) {
        console.log(pc.dim("\nDry run — no changes made."));
        return;
      }

      const confirm = await p.confirm({
        message: "Apply updates?",
        initialValue: true,
      });

      if (p.isCancel(confirm) || !confirm) {
        p.cancel("Cancelled.");
        return;
      }

      for (const u of updates) {
        const us = p.spinner();
        us.start(`Updating ${u.name}`);
        try {
          await install(u.name, { projectRoot, force: true });
          us.stop(`${pc.green("✓")} Updated ${u.name} to ${formatVersion(u.to)}`);
        } catch (error) {
          us.stop(`${pc.red("✗")} Failed to update ${u.name}`);
          p.log.error(error instanceof Error ? error.message : String(error));
        }
      }
    } catch (error) {
      s.stop("Failed");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
