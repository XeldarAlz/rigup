#!/bin/bash
# block-secrets hook: Prevents edits to sensitive files
# Triggered on: PreToolUse (Edit, Write)

TOOL_INPUT="$1"

# Extract file path from tool input
FILE_PATH=$(echo "$TOOL_INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# List of blocked patterns
BLOCKED_PATTERNS=(
  ".env"
  ".env.local"
  ".env.production"
  ".env.staging"
  "credentials.json"
  "secrets.json"
  "service-account.json"
  ".key"
  ".pem"
  "id_rsa"
  "id_ed25519"
)

BASENAME=$(basename "$FILE_PATH")

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if [[ "$BASENAME" == "$pattern" ]] || [[ "$BASENAME" == *"$pattern" ]]; then
    echo "BLOCKED: Editing sensitive file '$FILE_PATH' is not allowed."
    echo "This file may contain secrets or credentials."
    exit 2
  fi
done

exit 0
