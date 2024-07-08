FROM oven/bun:1 AS build
WORKDIR /app/
COPY package.json bun.lockb .
COPY apps/ ./apps/
COPY scripts/ ./scripts/
ENV NODE_ENV=production
RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:1-distroless
WORKDIR /app/
COPY --from=build /app/dist/ ./

USER nonroot
ENV NODE_ENV=production
ENTRYPOINT ["bun", "run", "server.js"]