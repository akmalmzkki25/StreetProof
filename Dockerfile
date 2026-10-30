# One file, two images. Build with --target web or --target tools.
FROM node:22-slim AS base
ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo
# Downloads stay in their own layer, so a code change doesn't fetch them again.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm fetch

# --- Web: a Next.js standalone build, with only what the server traces ------
FROM base AS web-build
COPY . .
RUN pnpm install --frozen-lockfile --offline --filter "@streetproof/web..."
ENV NEXT_OUTPUT=standalone
RUN pnpm --filter @streetproof/web build

FROM node:22-slim AS web
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app
COPY --from=web-build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=web-build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((r)=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "apps/web/server.js"]

# --- Tools: the worker, migrations and seeds, run from TypeScript with tsx ---
FROM base AS tools
COPY . .
RUN pnpm install --frozen-lockfile --offline --filter "@streetproof/worker..." --filter "@streetproof/db..."
RUN rm -rf apps/web
ENV NODE_ENV=production
USER node
WORKDIR /repo/apps/worker
CMD ["node", "--import", "tsx", "src/index.ts"]
