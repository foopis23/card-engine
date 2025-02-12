FROM oven/bun

WORKDIR /app

COPY ./ ./
RUN bun install

WORKDIR /app/apps/client

ENV PORT=3000
EXPOSE 3000

CMD ["bun", "start"]