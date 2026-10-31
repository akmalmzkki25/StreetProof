#!/bin/sh
# One backup on start, then one a day. A failed run stays visible in the logs and
# the loop carries on, so one bad night doesn't end backups for good.
set -u

ONE_DAY_SECONDS=86400

run_backup() {
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  target="/backups/$stamp"
  mkdir -p "$target" || return 1

  pg_dump --format=custom --file="$target/database.dump" || return 1
  tar -czf "$target/photos.tar.gz" -C /minio-data . || return 1

  # Written last, so restore can tell a finished backup from a cut-off one.
  date -u +%Y-%m-%dT%H:%M:%SZ >"$target/complete"
  find /backups -mindepth 1 -maxdepth 1 -type d -mtime "+${BACKUP_KEEP_DAYS:-14}" -exec rm -rf {} +
  echo "{\"level\":\"info\",\"message\":\"Backup finished\",\"stamp\":\"$stamp\"}"
}

until pg_isready --quiet; do
  sleep 5
done

while true; do
  run_backup || echo '{"level":"error","message":"Backup failed"}'
  sleep "$ONE_DAY_SECONDS"
done
