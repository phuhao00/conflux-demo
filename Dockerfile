# 构建阶段
FROM golang:1.21-alpine AS builder

WORKDIR /app

# 复制 go mod 文件
COPY go.mod go.sum ./
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# 运行阶段
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

# 复制构建的二进制文件
COPY --from=builder /app/main .

# 复制静态文件
COPY --from=builder /app/public ./public

# 暴露端口
EXPOSE 8080

# 运行应用
CMD ["./main"]