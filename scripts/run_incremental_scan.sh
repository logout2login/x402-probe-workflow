#!/bin/bash
# Incremental TWA scan runner for GitHub Actions
# Uses node to run the incremental scanner
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="${SCRIPT_DIR}/logs"

# Create logs dir if needed
mkdir -p "$LOGS_DIR"

# Run incremental scan
echo "Starting incremental TWA scan..."
echo "Origin: ${ORIGIN_TAG:-gh-actions-us}"

node "${SCRIPT_DIR}/incremental_scan.mjs" 2>&1 | tee "${LOGS_DIR}/scan_latest.log"

echo ""
echo "Scan complete."
echo "Results in: ${LOGS_DIR}/scan_events.json"
echo "Cursor: ${LOGS_DIR}/cursor.json"

# Output summary for workflow
EVENTS_COUNT=$(jq length "${LOGS_DIR}/scan_events.json" 2>/dev/null || echo "0")
CURSOR_BLOCK=$(jq -r '.lastBlock // 0' "${LOGS_DIR}/cursor.json" 2>/dev/null || echo "0")

echo "Total events in archive: ${EVENTS_COUNT}"
echo "Last scanned block: ${CURSOR_BLOCK}"
echo "Origin: ${ORIGIN_TAG:-gh-actions-us}"
echo "Timestamp: $(date -u +%FT%TZ)"
