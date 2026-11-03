#!/bin/sh
# Copies finished backups to an S3-compatible bucket on another host, so losing
# this server doesn't lose them too. Without BACKUP_REMOTE_URL it stops at once.
set -u

ONE_DAY_SECONDS=86400
# Lets the first nightly backup, which starts with the stack, finish first. A
# restore drill can shorten it.
FIRST_WAIT_SECONDS="${BACKUP_OFFSITE_FIRST_WAIT_SECONDS:-600}"

if [ -z "${BACKUP_REMOTE_URL:-}" ]; then
  echo '{"level":"info","message":"No BACKUP_REMOTE_URL, so backups stay on this host"}'
  exit 0
fi

mc alias set remote "$BACKUP_REMOTE_URL" "$BACKUP_REMOTE_ACCESS_KEY" "$BACKUP_REMOTE_SECRET_KEY" >/dev/null || exit 1

copy_finished() {
  for dir in /backups/*/; do
    # Only finished backups: each gets its "complete" file last.
    [ -f "${dir}complete" ] || continue
    stamp=$(basename "$dir")
    if mc mirror --quiet --overwrite "$dir" "remote/$BACKUP_REMOTE_BUCKET/$stamp" >/dev/null; then
      echo "{\"level\":\"info\",\"message\":\"Backup copied off this host\",\"stamp\":\"$stamp\"}"
    else
      echo "{\"level\":\"error\",\"message\":\"Copying a backup off this host failed\",\"stamp\":\"$stamp\"}"
    fi
  done
}

sleep "$FIRST_WAIT_SECONDS"
while true; do
  copy_finished
  sleep "$ONE_DAY_SECONDS"
done
