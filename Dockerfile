FROM nginx:1.27-alpine

RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/nginx.conf
COPY ./ /usr/share/nginx/html/
RUN rm -rf /usr/share/nginx/html/.git /usr/share/nginx/html/.idea || true

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD curl -fsS http://127.0.0.1/ || exit 1

CMD ["nginx","-g","daemon off;"]