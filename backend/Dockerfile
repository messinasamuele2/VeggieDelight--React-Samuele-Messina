FROM node:22-alpine

WORKDIR /app
COPY package.json server.js ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]

