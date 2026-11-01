# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend
COPY frontend ./frontend
COPY shared ./shared
ARG SITE_URL
ARG SOURCE_COMMIT=development
ARG VITE_FORMSPREE_FORM_ID=moevqqvl
ENV SITE_URL=${SITE_URL}
ENV VITE_FORMSPREE_FORM_ID=${VITE_FORMSPREE_FORM_ID}
RUN npm run build --prefix frontend
RUN node -e "require('fs').writeFileSync('frontend/build/version.json', JSON.stringify({commit: process.env.SOURCE_COMMIT}))"

FROM node:24-alpine AS runtime
ARG SOURCE_COMMIT=development
LABEL org.opencontainers.image.source="https://github.com/Daniel-Badura/PortfolioV2" org.opencontainers.image.revision="${SOURCE_COMMIT}"
ENV NODE_ENV=production PORT=5000 DATA_SOURCE=file
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY backend ./backend
COPY shared ./shared
COPY --from=build /app/frontend/build ./frontend/build
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:5000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "backend/server.js"]
