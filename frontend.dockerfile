FROM oven/bun:latest AS build

# TODO: remove this is for testing
ARG GAME_SERVER_URL=https://card-engine-backend-production.up.railway.app
ENV GAME_SERVER_URL=$GAME_SERVER_URL

WORKDIR /app

COPY package.json ./
COPY bun.lock ./
COPY . ./

RUN bun install
RUN bun run build

FROM nginx:alpine AS production

COPY --from=build /app/apps/client/dist /usr/share/nginx/html
EXPOSE 80