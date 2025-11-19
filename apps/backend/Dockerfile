FROM node:20-alpine
WORKDIR /app

# Copie des manifests et install
COPY package*.json ./
RUN npm ci || npm i

# Copie du code
COPY . .

# Variables (optionnel) / Port API
ENV PORT=8080
EXPOSE 8080

# Démarrage (adapter si tu utilises nodemon)
CMD ["npm", "run", "start"]
