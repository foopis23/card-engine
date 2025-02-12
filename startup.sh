bun run build
cp -r /app/apps/client/dist /usr/share/nginx/html
nginx -g 'daemon off;'
