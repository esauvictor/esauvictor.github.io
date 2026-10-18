#!/usr/bin/env bash
# Checks the live site and API. Prints one line per check and exits 1 if any check still fails after 3 tries.
# Usage: uptime-check.sh   (override targets with FRONT_URL, API_URL, ADMIN_URL for testing)
FRONT_URL="${FRONT_URL:-https://esauvictor.github.io/}"
API_URL="${API_URL:-https://esauvictor.name.ng/api}"
ADMIN_URL="${ADMIN_URL:-https://esauvictor.name.ng/admin/}"
fails=0

check() { # name url [must-contain]
  local name="$1" url="$2" needle="$3" try code body t
  for try in 1 2 3; do
    body="$(mktemp)"
    code="$(curl -s -o "$body" -m 20 -w '%{http_code} %{time_total}' -H 'User-Agent: uptime-check' "$url" 2>/dev/null)" || code="000 0"
    t="${code#* }"; code="${code%% *}"
    if [ "$code" = "200" ] && { [ -z "$needle" ] || grep -q "$needle" "$body"; }; then
      rm -f "$body"; echo "OK    $name  (${t}s)"; return 0
    fi
    rm -f "$body"
    [ "$try" -lt 3 ] && sleep 20
  done
  echo "DOWN  $name  -> HTTP $code  $url"; fails=$((fails + 1)); return 1
}

check "Website (GitHub Pages)"  "$FRONT_URL"
check "Home content (API)"      "$API_URL/site.php?page=home" '"groups"'
check "Classes (API + database)" "$API_URL/classes.php"       '"classes"'
check "Live status (API)"       "$API_URL/status.php"
check "Admin panel"             "$ADMIN_URL"                  'admin'
[ "$fails" -eq 0 ]
