import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { findProjectRoot } from "../utils/paths.js";
import { uninstall } from "../core/uninstaller.js";
import { isInstalled, getInstalled } from "../core/tracker.js";

export const removeCommand = new Command("remove")
  .description("Remove an installed item")
  .argument("<name>", "Item name to remove")
  .action(async (name: string) => {
    const projectRoot = await findProjectRoot();
    if (!projectRoot) {
      p.log.error("No project root found. Run this from a project directory.");
      process.exit(1);
    }

    if (!(await isInstalled(projectRoot, name))) {
      p.log.error(`Item "${name}" is not installed.`);
      process.exit(1);
    }

    // Check for dependents
    const installed = await getInstalled(projectRoot);
    const dependents = Object.values(installed).filter(
      (item) => item.name !== name
    );

    const confirm = await p.confirm({
      message: `Remove ${pc.cyan(name)}? This will delete its files.`,
      initialValue: true,
    });

    if (p.isCancel(confirm) || !confirm) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    const s = p.spinner();
    s.start(`Removing ${name}`);

    try {
      const result = await uninstall(projectRoot, name);
      s.stop(`${pc.green("✓")} Removed ${pc.cyan(name)}`);

      if (result.filesRemoved.length > 0) {
        console.log("  Files removed:");
        for (const f of result.filesRemoved) {
          console.log(`    ${pc.dim("-")} ${f}`);
        }
      }
    } catch (error) {
      s.stop("Failed");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
