FROM oven/bun:latest

# as of right now, the server doesn't need anything from the client so we don't
# need client code in server image.. if that changes.. then perish
COPY ./apps/server/package.json ./
COPY ./apps/server ./

RUN bun install

CMD ["bun", "dev"]
