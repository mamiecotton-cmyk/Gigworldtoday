#!/usr/bin/env bash
# Creates a mail draft in the default macOS mail client with the Upside approval text
# Usage: bash scripts/open_upside_mail_draft.sh

set -euo pipefail

DOC_PATH="$(dirname "$0")/../docs/upside-approval-request.md"
if [ ! -f "$DOC_PATH" ]; then
  echo "Missing $DOC_PATH"
  exit 1
fi

python3 - <<'PY'
import urllib.parse, os
body = open(os.path.join(os.getcwd(), 'docs', 'upside-approval-request.md')).read()
subject = 'Request for approval to reference Upside in GigWorldToday FAQ'
mailto = 'mailto:?subject=' + urllib.parse.quote(subject) + '&body=' + urllib.parse.quote(body)
os.system('open "' + mailto + '"')
PY

echo "Opened mail draft (check your default mail client)."
