#!/bin/bash
# session-logger hook: Logs session activity
# Triggered on: Stop

LOG_DIR=".claude/logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/session_$TIMESTAMP.log"

echo "Session ended: $(date)" > "$LOG_FILE"
echo "Working directory: $(pwd)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Log recent git activity during this session
echo "Recent git activity:" >> "$LOG_FILE"
git log --oneline --since="1 hour ago" 2>/dev/null >> "$LOG_FILE" || echo "No git activity" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Log modified files
echo "Modified files:" >> "$LOG_FILE"
git diff --name-only 2>/dev/null >> "$LOG_FILE" || echo "No modifications" >> "$LOG_FILE"

exit 0
