#!/bin/bash
# auto-lint hook: Runs the project linter after file edits
# Triggered on: PostToolUse (Edit, Write)

TOOL_INPUT="$1"

# Extract file path from tool input
FILE_PATH=$(echo "$TOOL_INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Detect and run the appropriate linter
if [ -f "biome.json" ] || [ -f "biome.jsonc" ]; then
  npx biome check --write "$FILE_PATH" 2>/dev/null
elif [ -f ".eslintrc" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ] || [ -f "eslint.config.mjs" ]; then
  npx eslint --fix "$FILE_PATH" 2>/dev/null
elif [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ] || [ -f "prettier.config.js" ]; then
  npx prettier --write "$FILE_PATH" 2>/dev/null
elif [ -f "ruff.toml" ] || [ -f "pyproject.toml" ]; then
  ruff format "$FILE_PATH" 2>/dev/null
fi

exit 0
