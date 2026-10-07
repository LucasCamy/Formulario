FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}

COPY src/frontend/app/package.json src/frontend/app/package-lock.json ./
RUN npm ci

COPY src/frontend/app/ ./
RUN npm run build

FROM nginx:1.29-alpine AS final
COPY docker/nginx/formulario.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
