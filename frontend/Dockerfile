# FIX: Multi-stage build — build with Node, serve with nginx
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# FIX: Use nginx-unprivileged for serving static files
# WHY: Full node image is ~900MB. Nginx alpine is ~40MB.
# Less surface area, less to scan, less to patch.
FROM nginxinc/nginx-unprivileged:1.25-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# FIX: Already runs as non-root (UID 101)
EXPOSE 8080
