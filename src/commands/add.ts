import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { findProjectRoot } from "../utils/paths.js";
import { install } from "../core/installer.js";
import { formatItemType, formatVersion } from "../utils/display.js";
import type { ItemType, InstallResult, DryRunResult } from "../types/common.js";

export const addCommand = new Command("add")
  .description("Add an item from the registry")
  .argument("<name>", "Item name to install")
  .option("-t, --type <type>", "Item type filter")
  .option("-d, --dry-run", "Preview what would be installed")
  .option("-f, --force", "Force install, ignore conflicts")
  .action(async (name: string, opts: { type?: string; dryRun?: boolean; force?: boolean }) => {
    const projectRoot = await findProjectRoot();
    if (!projectRoot) {
      p.log.error("No project root found. Run this from a project directory.");
      process.exit(1);
    }

    const s = p.spinner();
    s.start(`Resolving ${name} from registry`);

    try {
      const result = await install(name, {
        projectRoot,
        type: opts.type as ItemType | undefined,
        dryRun: opts.dryRun,
        force: opts.force,
      });

      s.stop("Resolved");

      if (opts.dryRun) {
        const dry = result as DryRunResult;
        p.log.info(pc.bold("Dry run results:"));
        console.log(`  Item: ${pc.cyan(dry.item)} ${formatItemType(dry.type)}`);
        console.log(`  Files to write:`);
        for (const f of dry.filesToWrite) {
          const status = f.exists ? pc.yellow("(overwrite)") : pc.green("(new)");
          console.log(`    ${f.path} ${status}`);
        }
        if (dry.dependencies.length > 0) {
          console.log(`  Dependencies: ${dry.dependencies.join(", ")}`);
        }
        if (dry.conflicts.length > 0) {
          console.log(`  ${pc.red("Conflicts:")}`);
          for (const c of dry.conflicts) {
            console.log(`    ${pc.red("!")} ${c.description}`);
          }
        }
      } else {
        const res = result as InstallResult;
        p.log.success(
          `${pc.green("✓")} Installed ${pc.cyan(res.item)} ${formatItemType(res.type)}`
        );
        if (res.filesWritten.length > 0) {
          console.log(`  Files:`);
          for (const f of res.filesWritten) {
            console.log(`    ${pc.dim("+")} ${f}`);
          }
        }
        if (res.settingsMerged) console.log(`  ${pc.dim("+")} settings.json updated`);
        if (res.mcpMerged) console.log(`  ${pc.dim("+")} .mcp.json updated`);
        if (res.claudeMdAppended) console.log(`  ${pc.dim("+")} CLAUDE.md updated`);
        if (res.dependenciesInstalled.length > 0) {
          console.log(`  Dependencies installed: ${res.dependenciesInstalled.join(", ")}`);
        }
      }
    } catch (error) {
      s.stop("Failed");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
