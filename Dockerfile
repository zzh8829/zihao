FROM nginx:alpine
COPY  deploy/nginx_gcs_proxy.conf /etc/nginx/
COPY deploy/nginx_zihao.conf /etc/nginx/conf.d/default.conf
