FROM oven/bun:1.1-slim

WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
RUN bun install

EXPOSE 3000

CMD ["bun", "run", "./src/index.ts"]
