FROM node:20-alpine AS backend-build
WORKDIR /app
COPY backend/package.json .
RUN npm install --production

FROM nginx:alpine

RUN apk add --no-cache nodejs supervisor

WORKDIR /app
COPY --from=backend-build /app/node_modules ./node_modules
COPY backend/server.js .

COPY frontend/index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /data

COPY supervisord.conf /etc/supervisord.conf

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
