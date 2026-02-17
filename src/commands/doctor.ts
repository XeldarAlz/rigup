import { Command } from "commander";
import pc from "picocolors";
import { findProjectRoot, getClaudeDir, getTrackingPath, getSettingsPath, getMcpPath, getClaudeMdPath } from "../utils/paths.js";
import { fileExists, readJsonSafe, readTextSafe } from "../utils/fs.js";
import { getTracking, getInstalled } from "../core/tracker.js";
import { isRegistryReachable } from "../registry/client.js";
import { SECTION_START, SECTION_END } from "../utils/constants.js";
import { registryItemSchema } from "../types/registry.js";
import type { DiagnosticCheck, DiagnosticResult } from "../types/common.js";
import { join } from "node:path";

export const doctorCommand = new Command("doctor")
  .description("Diagnose issues with your rigup setup")
  .action(async () => {
    console.log(pc.bold("\nrigup doctor\n"));

    const projectRoot = await findProjectRoot();
    if (!projectRoot) {
      console.log(pc.red("✗ No project root found. Run this from a project directory."));
      process.exit(1);
    }

    const checks: DiagnosticCheck[] = [];

    // 1. .claude/ directory
    const claudeDir = getClaudeDir(projectRoot);
    checks.push({
      name: ".claude/ directory",
      status: (await fileExists(claudeDir)) ? "pass" : "fail",
      message: (await fileExists(claudeDir))
        ? ".claude/ directory exists"
        : ".claude/ directory missing. Run `rig init`.",
    });

    // 2. settings.json validity
    const settingsPath = getSettingsPath(projectRoot);
    if (await fileExists(settingsPath)) {
      const settings = await readJsonSafe(settingsPath);
      checks.push({
        name: "settings.json",
        status: settings ? "pass" : "fail",
        message: settings ? "Valid JSON" : "Invalid JSON in settings.json",
      });
    } else {
      checks.push({
        name: "settings.json",
        status: "warn",
        message: "settings.json not found (optional)",
      });
    }

    // 3. rig.json integrity
    const trackingPath = getTrackingPath(projectRoot);
    if (await fileExists(trackingPath)) {
      const tracking = await readJsonSafe(trackingPath);
      checks.push({
        name: "rig.json",
        status: tracking ? "pass" : "fail",
        message: tracking ? "Valid tracking file" : "Corrupted rig.json",
      });
    } else {
      checks.push({
        name: "rig.json",
        status: "fail",
        message: "rig.json not found. Run `rig init`.",
      });
    }

    // 4. Installed files exist
    const installed = await getInstalled(projectRoot);
    let allFilesExist = true;
    let missingFiles: string[] = [];
    for (const [name, record] of Object.entries(installed)) {
      for (const filePath of record.files) {
        if (!(await fileExists(join(projectRoot, filePath)))) {
          allFilesExist = false;
          missingFiles.push(`${name}: ${filePath}`);
        }
      }
    }
    checks.push({
      name: "Installed files",
      status: allFilesExist ? "pass" : "warn",
      message: allFilesExist
        ? "All installed files present"
        : `Missing files: ${missingFiles.join(", ")}`,
    });

    // 5. .mcp.json validity
    const mcpPath = getMcpPath(projectRoot);
    if (await fileExists(mcpPath)) {
      const mcp = await readJsonSafe(mcpPath);
      checks.push({
        name: ".mcp.json",
        status: mcp ? "pass" : "fail",
        message: mcp ? "Valid JSON" : "Invalid JSON in .mcp.json",
      });
    } else {
      checks.push({
        name: ".mcp.json",
        status: "warn",
        message: ".mcp.json not found (optional)",
      });
    }

    // 6. CLAUDE.md section markers
    const claudeMdPath = getClaudeMdPath(projectRoot);
    if (await fileExists(claudeMdPath)) {
      const content = await readTextSafe(claudeMdPath);
      if (content) {
        const starts = (content.match(/<!-- rigup:start:/g) || []).length;
        const ends = (content.match(/<!-- rigup:end:/g) || []).length;
        checks.push({
          name: "CLAUDE.md markers",
          status: starts === ends ? "pass" : "warn",
          message: starts === ends
            ? `${starts} section(s) properly marked`
            : `Mismatched markers: ${starts} starts, ${ends} ends`,
        });
      }
    } else {
      checks.push({
        name: "CLAUDE.md",
        status: "warn",
        message: "CLAUDE.md not found (optional)",
      });
    }

    // 7. Registry reachability
    const reachable = await isRegistryReachable();
    checks.push({
      name: "Registry",
      status: reachable ? "pass" : "warn",
      message: reachable ? "Registry is reachable" : "Registry unreachable (cached data may be used)",
    });

    // Display results
    const result: DiagnosticResult = {
      checks,
      passCount: checks.filter((c) => c.status === "pass").length,
      warnCount: checks.filter((c) => c.status === "warn").length,
      failCount: checks.filter((c) => c.status === "fail").length,
    };

    for (const check of checks) {
      const icon =
        check.status === "pass"
          ? pc.green("✓")
          : check.status === "warn"
            ? pc.yellow("⚠")
            : pc.red("✗");
      console.log(`  ${icon} ${pc.bold(check.name)}: ${check.message}`);
    }

    console.log(
      `\n  ${pc.green(`${result.passCount} passed`)} · ${pc.yellow(`${result.warnCount} warnings`)} · ${pc.red(`${result.failCount} failed`)}\n`
    );

    if (result.failCount > 0) {
      process.exit(1);
    }
  });
