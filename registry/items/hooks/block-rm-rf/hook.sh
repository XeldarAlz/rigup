#!/bin/bash
# block-rm-rf hook: Prevents destructive rm commands
# Triggered on: PreToolUse (Bash)

TOOL_INPUT="$1"

# Extract command from tool input
COMMAND=$(echo "$TOOL_INPUT" | grep -o '"command":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Block rm -rf on dangerous paths
if echo "$COMMAND" | grep -qE 'rm\s+(-rf|-fr|--recursive)\s+(/|~|\$HOME|\.\.)'; then
  echo "BLOCKED: Destructive rm command detected."
  echo "Removing root, home, or parent directories is not allowed."
  exit 2
fi

# Block rm -rf with wildcards at root level
if echo "$COMMAND" | grep -qE 'rm\s+(-rf|-fr)\s+/\*'; then
  echo "BLOCKED: rm -rf /* is not allowed."
  exit 2
fi

exit 0
