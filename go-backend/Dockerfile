# Build Stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install git and ssl certificates
RUN apk add --no-cache git ca-certificates

# Copy go mod and sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
# CGO_ENABLED=0 disables C dependencies for static binary
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final Stage
FROM alpine:latest

WORKDIR /app

# Install necessary certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/main .

# Copy data directory (critical for static file serving)
COPY --from=builder /app/data ./data

# Expose port
EXPOSE 8080

# Run
CMD ["./main"]
