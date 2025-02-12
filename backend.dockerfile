FROM oven/bun

WORKDIR /app

COPY ./ ./
RUN bun install

WORKDIR /app/apps/server

ENV PORT=3001
EXPOSE 3001

CMD ["bun", "start"]