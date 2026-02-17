#!/bin/bash
# block-force-push hook: Prevents git push --force
# Triggered on: PreToolUse (Bash)

TOOL_INPUT="$1"

# Extract command from tool input
COMMAND=$(echo "$TOOL_INPUT" | grep -o '"command":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Check for force push patterns
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*(-f|--force)'; then
  echo "BLOCKED: git push --force is not allowed."
  echo "Force pushing can overwrite remote history and cause data loss."
  echo "Use git push --force-with-lease for safer force pushing."
  exit 2
fi

exit 0
