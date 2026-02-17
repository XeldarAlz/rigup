import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  initCommand,
  addCommand,
  removeCommand,
  listCommand,
  searchCommand,
  updateCommand,
  doctorCommand,
  infoCommand,
} from "./commands/index.js";

const program = new Command();

program
  .name("rig")
  .description("The package manager for Claude Code")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(addCommand);
program.addCommand(removeCommand);
program.addCommand(listCommand);
program.addCommand(searchCommand);
program.addCommand(updateCommand);
program.addCommand(doctorCommand);
program.addCommand(infoCommand);

program.parse();
