import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { fetchIndex } from "../registry/client.js";
import { fuzzySearch } from "../registry/resolver.js";
import { formatItemType, formatVersion, formatTable } from "../utils/display.js";
import type { ItemType } from "../types/common.js";

export const searchCommand = new Command("search")
  .description("Search the registry")
  .argument("<query>", "Search query")
  .action(async (query: string) => {
    const s = p.spinner();
    s.start("Searching registry");

    try {
      const index = await fetchIndex();
      const results = fuzzySearch(index, query);
      s.stop(`Found ${results.length} results`);

      if (results.length === 0) {
        console.log(pc.dim(`No items matching "${query}". Try a different search term.`));
        return;
      }

      const rows = results.slice(0, 20).map((item) => [
        formatItemType(item.type as ItemType),
        pc.bold(item.name),
        formatVersion(item.version),
        pc.dim(item.description),
        pc.dim(item.tags.join(", ")),
      ]);

      console.log(
        formatTable(["Type", "Name", "Version", "Description", "Tags"], rows)
      );
    } catch (error) {
      s.stop("Failed");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
