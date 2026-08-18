#!/bin/sh
set -e

if [ "${SKIP_DB_MIGRATE:-0}" != "1" ] && [ -f ./prisma/schema.prisma ]; then
  if [ ! -x ./node_modules/.bin/next ] && [ ! -f ./server.js ]; then
    echo "Installing npm dependencies…"
    npm ci
  fi

  if [ -x ./node_modules/.bin/prisma ]; then
    if [ ! -f ./server.js ]; then
      echo "Prisma: generate"
      ./node_modules/.bin/prisma generate
    fi

    echo "Prisma: migrate deploy"
    i=0
    until ./node_modules/.bin/prisma migrate deploy; do
      i=$((i + 1))
      if [ "$i" -ge 30 ]; then
        echo "Database unreachable after 60s"
        exit 1
      fi
      echo "Waiting for database…"
      sleep 2
    done
  fi
fi

exec "$@"
