
FROM oven/bun:1.1 AS builder

WORKDIR /app
COPY package.json ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun build ./src/index.ts --outdir ./dist

FROM oven/bun:1.1-slim

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
RUN bun install

EXPOSE 3000

CMD ["bun", "run", "./dist/index.js"]
