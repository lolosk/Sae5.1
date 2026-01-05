# ---- Build Front ----
FROM node:20-alpine AS webbuild
WORKDIR /app
COPY apps/frontend/package*.json ./apps/frontend/
WORKDIR /app/apps/frontend
RUN npm ci || npm i
COPY apps/frontend/ /app/apps/frontend/
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app

# volumes médias
VOLUME ["/media/movies", "/media/series", "/media/photos"]

# serveur
COPY apps/server/package*.json ./apps/server/
WORKDIR /app/apps/server
RUN npm ci --omit=dev || npm i --omit=dev
COPY apps/server/ /app/apps/server/

# front build -> /app/public
RUN mkdir -p /app/public
COPY --from=webbuild /app/apps/frontend/dist/ /app/public/

ENV PORT=3000 \
    MOVIES_DIR=/media/movies \
    SERIES_DIR=/media/series \
    PHOTOS_DIR=/media/photos

EXPOSE 3000
CMD ["node","src/index.js"]
