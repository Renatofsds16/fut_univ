# Etapa 1: Build do frontend
FROM node:18-alpine AS build
WORKDIR /app

# Receber as variáveis durante o build
ARG REACT_APP_PARSE_APPLICATION_ID
ARG REACT_APP_PARSE_HOST_URL
ARG REACT_APP_PARSE_JAVASCRIPT_KEY

# Definir as variáveis de ambiente para o React compilar
ENV REACT_APP_PARSE_APPLICATION_ID=$REACT_APP_PARSE_APPLICATION_ID
ENV REACT_APP_PARSE_HOST_URL=$REACT_APP_PARSE_HOST_URL
ENV REACT_APP_PARSE_JAVASCRIPT_KEY=$REACT_APP_PARSE_JAVASCRIPT_KEY

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Etapa 2: Servir com Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
