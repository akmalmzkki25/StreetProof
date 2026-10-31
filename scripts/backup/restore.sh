#!/bin/sh
# Replaces the database and photos with one backup. See docs/deployment.md.
set -eu

stamp="${1:-}"
if [ -z "$stamp" ]; then
  echo "Finished backups:"
  for dir in /backups/*/; do
    [ -f "${dir}complete" ] && basename "$dir"
  done
  echo "Run this again with the name of the one to restore."
  exit 1
fi

source_dir="/backups/$stamp"
if [ ! -f "$source_dir/complete" ]; then
  echo "$stamp isn't a finished backup." >&2
  exit 1
fi

pg_restore --clean --if-exists --no-owner --dbname="$PGDATABASE" "$source_dir/database.dump"

find /minio-data -mindepth 1 -delete
tar -xzf "$source_dir/photos.tar.gz" -C /minio-data

echo "Restored $stamp. Start web, worker and minio again."
