import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { findProjectRoot, getClaudeDir, getTrackingPath } from "../utils/paths.js";
import { ensureDir, safeWriteFile, fileExists } from "../utils/fs.js";
import { getTracking, saveTracking } from "../core/tracker.js";
import { install } from "../core/installer.js";
import type { RigTracking } from "../types/config.js";

const STARTER_ITEMS = [
  { value: "react-expert", label: "react-expert", hint: "React/Next.js specialist agent" },
  { value: "tdd-driver", label: "tdd-driver", hint: "Test-driven development agent" },
  { value: "code-reviewer", label: "code-reviewer", hint: "Code review agent" },
  { value: "commit", label: "commit", hint: "Smart conventional commit skill" },
  { value: "auto-lint", label: "auto-lint", hint: "Auto-run linter on edits hook" },
  { value: "block-secrets", label: "block-secrets", hint: "Block edits to secret files hook" },
  { value: "block-force-push", label: "block-force-push", hint: "Block git push --force hook" },
  { value: "typescript", label: "typescript", hint: "TypeScript CLAUDE.md template" },
];

export const initCommand = new Command("init")
  .description("Initialize rigup in your project")
  .action(async () => {
    p.intro(pc.bgCyan(pc.black(" rigup init ")));

    const projectRoot = await findProjectRoot();
    if (!projectRoot) {
      p.cancel("No project root found. Run this from a project directory.");
      process.exit(1);
    }

    const claudeDir = getClaudeDir(projectRoot);
    const trackingPath = getTrackingPath(projectRoot);

    if (await fileExists(trackingPath)) {
      const overwrite = await p.confirm({
        message: "rigup is already initialized in this project. Reinitialize?",
        initialValue: false,
      });
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel("Cancelled.");
        process.exit(0);
      }
    }

    const projectType = await p.select({
      message: "What type of project is this?",
      options: [
        { value: "web", label: "Web app" },
        { value: "api", label: "API / Backend" },
        { value: "mobile", label: "Mobile app" },
        { value: "library", label: "Library / Package" },
        { value: "monorepo", label: "Monorepo" },
      ],
    });

    if (p.isCancel(projectType)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    const language = await p.select({
      message: "Primary language?",
      options: [
        { value: "typescript", label: "TypeScript" },
        { value: "python", label: "Python" },
        { value: "rust", label: "Rust" },
        { value: "go", label: "Go" },
        { value: "other", label: "Other" },
      ],
    });

    if (p.isCancel(language)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    const createClaudeMd = await p.confirm({
      message: "Create CLAUDE.md from template?",
      initialValue: true,
    });

    if (p.isCancel(createClaudeMd)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    const starterItems = await p.multiselect({
      message: "Install starter items? (space to select, enter to confirm)",
      options: STARTER_ITEMS,
      required: false,
    });

    if (p.isCancel(starterItems)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    const s = p.spinner();

    // Create directory structure
    s.start("Creating .claude/ directory");
    await ensureDir(claudeDir);

    // Create tracking file
    const tracking: RigTracking = {
      version: 1,
      installedAt: new Date().toISOString(),
      installed: {},
    };
    await saveTracking(projectRoot, tracking);
    s.stop(".claude/ directory created");

    // Create CLAUDE.md if requested
    if (createClaudeMd) {
      s.start("Creating CLAUDE.md");
      const template = getTemplate(language as string, projectType as string);
      const mdPath = `${projectRoot}/CLAUDE.md`;
      if (!(await fileExists(mdPath))) {
        await safeWriteFile(mdPath, template);
      }
      s.stop("CLAUDE.md created");
    }

    // Install starter items
    const selected = starterItems as string[];
    if (selected.length > 0) {
      for (const name of selected) {
        s.start(`Installing ${name}`);
        try {
          await install(name, { projectRoot, force: true });
          s.stop(`${pc.green("✓")} ${name} installed`);
        } catch {
          s.stop(`${pc.yellow("⚠")} ${name} skipped (registry not available)`);
        }
      }
    }

    p.outro(
      pc.green("rigup initialized! ") +
        pc.dim(`Run ${pc.cyan("rig add <name>")} to install items.`)
    );
  });

function getTemplate(language: string, projectType: string): string {
  return `# Project Guidelines

## Project Type
${projectType}

## Language
${language}

## Conventions
- Follow existing code style and patterns
- Write tests for new features
- Keep commits focused and well-described

## Structure
<!-- Add your project structure notes here -->

## Testing
<!-- Add testing instructions here -->
`;
}
