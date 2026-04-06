# VULNERABILITY: Not pinned to digest (CWE-1104)
FROM node:18

WORKDIR /app

# VULNERABILITY: Copies everything, no .dockerignore
COPY . .

# VULNERABILITY: No lockfile integrity check
RUN npm install
RUN npm run build

# VULNERABILITY: Using full node image to serve static files
# VULNERABILITY: Running as root (CWE-250)
RUN npm install -g serve

# VULNERABILITY: Overly permissive (CWE-732)
RUN chmod -R 777 /app

USER root

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
