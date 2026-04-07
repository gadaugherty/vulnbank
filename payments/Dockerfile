# FIX: Multi-stage build with distroless runtime
# WHY distroless over alpine:
# - Alpine has a shell and package manager → attacker can install tools
# - Distroless has no shell, no package manager
# - Tradeoff: Can't exec into container for debugging
# - Use ephemeral debug containers in k8s instead (kubectl debug)
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o payments .

# FIX: Distroless nonroot base image
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /app/payments /payments
# FIX: Run as nonroot user (UID 65534)
USER 65534:65534
EXPOSE 8080
ENTRYPOINT ["/payments"]
