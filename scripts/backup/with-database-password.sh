#!/bin/sh
# The password lives only in DATABASE_URL. PostgreSQL's image and its client tools
# each want it on its own, so take it from there and run the given command.
set -eu

password=$(printf '%s' "$DATABASE_URL" | sed -E 's#^[^:]+://[^:]*:([^@]*)@.*#\1#')
export POSTGRES_PASSWORD="$password"
export PGPASSWORD="$password"

exec "$@"
