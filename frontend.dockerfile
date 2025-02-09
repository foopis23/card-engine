FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json ./
COPY bun.lock ./
COPY . ./

RUN bun install
RUN bun run build

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html