FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_USER_API
ENV VITE_USER_API=$VITE_USER_API

ARG VITE_KYC_API
ENV VITE_KYC_API=$VITE_KYC_API

ARG VITE_TRANSACTION_API
ENV VITE_TRANSACTION_API=$VITE_TRANSACTION_API

ARG VITE_SIP_API
ENV VITE_SIP_API=$VITE_SIP_API

ARG VITE_NOTIFICATION_API
ENV VITE_NOTIFICATION_API=$VITE_NOTIFICATION_API

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo 'server { \
  listen 80; \
  location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]