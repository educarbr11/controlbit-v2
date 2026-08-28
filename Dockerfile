# Build da versão web (Expo Web + react-native-web) e serve como site
# estático via Nginx — usado para deploy no Dokploy (build type "Dockerfile").

# ---- Build ----
FROM node:24-bookworm AS build
WORKDIR /app

# Copiado antes do restante para aproveitar o cache de camadas do Docker
# entre builds quando só o código-fonte muda.
COPY package.json package-lock.json ./
COPY patches ./patches
RUN npm ci

COPY . .
RUN npm run build:web

# ---- Serve ----
FROM nginx:1.27-alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
