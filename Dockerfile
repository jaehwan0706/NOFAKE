FROM node:20-alpine AS builder

WORKDIR /app/front

COPY front/package*.json ./
RUN npm install --legacy-peer-deps

COPY front ./

ARG VITE_API_BASE_URL=http://localhost:3002
ARG VITE_KAKAO_REST_API_KEY
ARG VITE_KAKAO_REDIRECT_URI=http://localhost:5173/auth/kakao/callback

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_KAKAO_REST_API_KEY=${VITE_KAKAO_REST_API_KEY}
ENV VITE_KAKAO_REDIRECT_URI=${VITE_KAKAO_REDIRECT_URI}

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/front/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
