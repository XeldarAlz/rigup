#!/bin/bash
# auto-test hook: Runs related tests after file edits
# Triggered on: PostToolUse (Edit, Write)

TOOL_INPUT="$1"

# Extract file path from tool input
FILE_PATH=$(echo "$TOOL_INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Skip test files themselves to avoid infinite loops
if echo "$FILE_PATH" | grep -qE '\.(test|spec)\.(ts|tsx|js|jsx)$'; then
  exit 0
fi

# Try to find a related test file
DIR=$(dirname "$FILE_PATH")
BASE=$(basename "$FILE_PATH" | sed 's/\.\(ts\|tsx\|js\|jsx\)$//')
TEST_FILE=""

for ext in test.ts test.tsx spec.ts spec.tsx test.js test.jsx spec.js spec.jsx; do
  if [ -f "$DIR/$BASE.$ext" ]; then
    TEST_FILE="$DIR/$BASE.$ext"
    break
  fi
  if [ -f "$DIR/__tests__/$BASE.$ext" ]; then
    TEST_FILE="$DIR/__tests__/$BASE.$ext"
    break
  fi
done

if [ -z "$TEST_FILE" ]; then
  exit 0
fi

# Run the related test
if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
  npx vitest run "$TEST_FILE" --reporter=dot 2>/dev/null
elif [ -f "jest.config.ts" ] || [ -f "jest.config.js" ]; then
  npx jest "$TEST_FILE" --silent 2>/dev/null
fi

exit 0
