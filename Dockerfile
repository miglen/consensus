FROM node:20-alpine

WORKDIR /app

# Install dependencies for better-sqlite3 native build
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --production

COPY index.html ./
COPY server.js ./

# Data volume for SQLite persistence
RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV PORT=3000
ENV DB_PATH=/app/data/consensus.db

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
