# 部署文档

本目录包含S100海事服务系统的部署指南、配置说明和运维手册等相关文档。

## 🚀 部署概述

S100海事服务系统支持多种部署方式，包括开发环境、测试环境和生产环境的部署。

### 📋 部署技术栈
- **容器化**: Docker
- **编排**: Docker Compose / Kubernetes
- **Web服务器**: Nginx
- **进程管理**: PM2
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack

## 🌍 部署环境

### 环境分类
- **开发环境** - 本地开发环境
- **测试环境** - 功能测试和集成测试
- **预生产环境** - 生产环境镜像
- **生产环境** - 线上运行环境

### 环境配置
```bash
# 开发环境
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/s100_dev
NEXTAUTH_SECRET=dev-secret-key

# 测试环境
NODE_ENV=test
DATABASE_URL=postgresql://user:pass@localhost:5432/s100_test
NEXTAUTH_SECRET=test-secret-key

# 生产环境
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/s100_prod
NEXTAUTH_SECRET=prod-secret-key
```

## 🐳 Docker部署

### Dockerfile
```dockerfile
# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 生产阶段
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://s100:s100@db:5432/s100_prod
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db
      - redis
    networks:
      - s100-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=s100_prod
      - POSTGRES_USER=s100
      - POSTGRES_PASSWORD=s100
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - s100-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - s100-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - s100-network

volumes:
  postgres_data:
  redis_data:

networks:
  s100-network:
    driver: bridge
```

## 📦 部署流程

### 1. 准备工作
```bash
# 1. 克隆项目
git clone <repository-url>
cd s100-webgis

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.production
# 编辑 .env.production 文件

# 4. 构建项目
npm run build
```

### 2. 数据库初始化
```bash
# 1. 推送数据库schema
npm run db:push

# 2. 生成Prisma客户端
npm run db:generate

# 3. 运行种子数据
npm run db:seed

# 4. 验证数据库
npm run db:studio
```

### 3. Docker部署
```bash
# 1. 构建Docker镜像
docker build -t s100-webgis:latest .

# 2. 启动服务
docker-compose up -d

# 3. 检查服务状态
docker-compose ps
docker-compose logs app

# 4. 验证部署
curl http://localhost:3000/api/health
```

### 4. 生产环境部署
```bash
# 1. 使用PM2部署
npm install -g pm2
pm2 start ecosystem.config.js

# 2. 检查PM2状态
pm2 status
pm2 logs s100-webgis

# 3. 设置开机自启
pm2 startup
pm2 save
```

## ⚙️ 配置管理

### Nginx配置
```nginx
# nginx.conf
upstream s100_backend {
    server app:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://s100_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 静态文件缓存
    location /_next/static/ {
        alias /app/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip压缩
    gzip on;
    gzip_types
        text/plain
        text/css
        text/js
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss;
}
```

### PM2配置
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 's100-webgis',
    script: 'npm',
    args: 'start',
    cwd: './',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
  }],
}
```

## 🔍 监控和日志

### 应用监控
```javascript
// 监控配置
const monitoring = {
  // 性能监控
  performance: {
    enabled: true,
    sampleRate: 0.1,
    maxSamples: 1000,
  },
  
  // 错误监控
  errors: {
    enabled: true,
    reportTo: ['sentry', 'console'],
    sampleRate: 1.0,
  },
  
  // 业务监控
  business: {
    enabled: true,
    metrics: ['user_actions', 'api_calls', 'map_loads'],
  },
}
```

### 日志配置
```javascript
// 日志配置
const logging = {
  level: process.env.LOG_LEVEL || 'info',
  format: 'json',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
}
```

### 健康检查
```typescript
// src/app/api/health/route.ts
export async function GET() {
  try {
    // 检查数据库连接
    await db.$queryRaw`SELECT 1`
    
    // 检查Redis连接
    await redis.ping()
    
    // 检查外部服务
    const externalServices = await checkExternalServices()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        redis: 'healthy',
        external: externalServices,
      },
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    }, { status: 500 })
  }
}
```

## 🔄 持续集成/持续部署

### GitHub Actions配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to production
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker build -t s100-webgis:latest .
          docker tag s100-webgis:latest ${{ secrets.DOCKER_USERNAME }}/s100-webgis:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/s100-webgis:latest
          
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /opt/s100-webgis
            docker-compose pull
            docker-compose up -d
```

## 📋 运维手册

### 日常维护
```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 重启服务
docker-compose restart app

# 更新服务
docker-compose pull
docker-compose up -d

# 备份数据库
docker exec s100_db pg_dump -U s100 s100_prod > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker exec -i s100_db psql -U s100 s100_prod < backup_20240101.sql
```

### 故障排除
```bash
# 检查容器资源使用
docker stats

# 检查磁盘空间
df -h

# 检查内存使用
free -h

# 检查网络连接
netstat -tulpn

# 检查应用日志
docker-compose logs --tail=100 app
```

### 性能优化
```bash
# 优化PostgreSQL
docker exec s100_db psql -U s100 -c "VACUUM ANALYZE;"

# 优化Redis
docker exec s100_redis redis-cli --eval optimize.lua

# 清理Docker资源
docker system prune -f

# 重启PM2服务
pm2 restart all
```

## 🔒 安全配置

### 网络安全
```yaml
# docker-compose.yml 安全配置
services:
  app:
    # ... 其他配置
    networks:
      - s100-network
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/run/nginx/tmp

  db:
    # ... 其他配置
    environment:
      - POSTGRES_HOST_AUTH_METHOD=scram-sha-256
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - s100-network
```

### 应用安全
```typescript
// 安全中间件
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 安全头
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  )
  
  return response
}
```

---

*最后更新: 2024-01-01*