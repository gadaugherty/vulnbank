# VULNERABILITY: Not pinned, not minimal base image (CWE-1104)
FROM golang:1.22

WORKDIR /app

# VULNERABILITY: No dependency verification
COPY . .
RUN go build -o payments .

# VULNERABILITY: Overly permissive (CWE-732)
RUN chmod 777 /app

# VULNERABILITY: Running as root (CWE-250)
USER root

EXPOSE 8080

CMD ["./payments"]
