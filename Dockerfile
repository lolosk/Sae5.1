# ---------- Build FRONT ----------
FROM node:20-alpine AS web
WORKDIR /web
COPY apps/web/package*.json ./
RUN npm ci
COPY apps/web/ ./
RUN npm run build

# ---------- Build SERVER deps ----------
FROM node:20-alpine AS server_deps
WORKDIR /app
COPY apps/server/package*.json ./
RUN npm ci --omit=dev

# ---------- Runtime ----------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# server code + deps
COPY --from=server_deps /app/node_modules ./node_modules
COPY apps/server/ ./

# front build -> server/public
COPY --from=web /web/dist ./public

EXPOSE 3000
CMD ["node", "src/index.js"]
