# 部署指南

## 概述

S-100海事服务平台支持多种部署方式，包括开发环境、测试环境和生产环境。本文档详细介绍了系统的部署要求、配置方法和运维指南。

## 环境要求

### 硬件要求

#### 开发环境
- **CPU**: 2核心以上
- **内存**: 4GB以上
- **存储**: 20GB以上可用空间
- **网络**: 稳定的互联网连接

#### 测试环境
- **CPU**: 4核心以上
- **内存**: 8GB以上
- **存储**: 50GB以上可用空间
- **网络**: 100Mbps以上带宽

#### 生产环境
- **CPU**: 8核心以上
- **内存**: 16GB以上
- **存储**: 100GB以上SSD存储
- **网络**: 1Gbps以上带宽
- **负载均衡**: 支持高并发访问

### 软件要求

#### 基础软件
- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 8+)
- **Node.js**: 18.x 或更高版本
- **npm**: 8.x 或更高版本
- **Git**: 2.x 或更高版本

#### 数据库
- **SQLite**: 3.x (开发环境)
- **PostgreSQL**: 13+ (生产环境推荐)
- **Redis**: 6+ (缓存和会话存储)

#### 其他工具
- **Docker**: 20.x (容器化部署)
- **Nginx**: 1.18+ (反向代理)
- **PM2**: 5.x (进程管理)

## 环境配置

### 1. 开发环境配置

#### 安装Node.js
```bash
# 使用nvm安装Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### 克隆项目
```bash
git clone <repository-url>
cd s100-federal-maritime-platform
```

#### 安装依赖
```bash
npm install
```

#### 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**环境变量配置**：
```env
# 数据库配置
DATABASE_URL="file:./dev.db"

# 应用配置
NODE_ENV="development"
PORT="3000"
HOST="localhost"

# JWT配置
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="3600"

# Redis配置（可选）
REDIS_URL="redis://localhost:6379"

# 文件上传配置
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="104857600"  # 100MB

# 邮件配置（可选）
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"

# 监控配置
ENABLE_MONITORING="true"
MONITORING_INTERVAL="300000"  # 5分钟
```

#### 初始化数据库
```bash
# 生成Prisma客户端
npm run db:generate

# 推送数据库schema
npm run db:push

# 运行数据库迁移（如果需要）
npm run db:migrate
```

#### 启动开发服务器
```bash
npm run dev
```

### 2. 测试环境配置

#### 使用Docker部署
```bash
# 构建Docker镜像
docker build -t s100-platform:test .

# 运行容器
docker run -d \
  --name s100-platform-test \
  -p 3000:3000 \
  -e NODE_ENV=test \
  -e DATABASE_URL="file:./test.db" \
  -v $(pwd)/data:/app/data \
  s100-platform:test
```

#### 使用PM2部署
```bash
# 安装PM2
npm install -g pm2

# 创建PM2配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 's100-platform-test',
    script: 'server.ts',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'test',
      PORT: 3000,
      DATABASE_URL: 'file:./test.db'
    },
    log_file: './logs/test.log',
    out_file: './logs/test-out.log',
    error_file: './logs/test-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
EOF

# 启动应用
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save
pm2 startup
```

### 3. 生产环境配置

#### 使用Docker Compose部署
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/s100platform
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=s100platform
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

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
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### Nginx配置
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # HTTP重定向到HTTPS
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS配置
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # 安全头
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # 静态文件
        location /static/ {
            alias /app/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API代理
        location /api/ {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # 超时设置
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # 主应用
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket支持
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

#### PM2生产环境配置
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 's100-platform',
    script: 'server.ts',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://user:password@localhost:5432/s100platform',
      REDIS_URL: 'redis://localhost:6379'
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
```

## 部署步骤

### 1. 准备工作

#### 服务器初始化
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y curl git nginx

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装PM2
sudo npm install -g pm2

# 创建应用用户
sudo useradd -m -s /bin/bash s100user
sudo usermod -aG sudo s100user
```

#### 防火墙配置
```bash
# 安装UFW
sudo apt install -y ufw

# 配置防火墙
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 2. 应用部署

#### 部署脚本
```bash
#!/bin/bash
# deploy.sh

# 设置变量
APP_DIR="/opt/s100-platform"
REPO_URL="https://github.com/your-org/s100-platform.git"
BRANCH="main"

# 创建应用目录
sudo mkdir -p $APP_DIR
sudo chown s100user:s100user $APP_DIR

# 切换到应用用户
sudo -u s100user -i << EOF

# 克隆代码
cd $APP_DIR
git clone $REPO_URL .
git checkout $BRANCH

# 安装依赖
npm install --production

# 构建应用
npm run build

# 配置环境变量
cp .env.example .env
# 编辑环境变量...

# 初始化数据库
npm run db:generate
npm run db:migrate

# 启动应用
pm2 start ecosystem.config.js
pm2 save
pm2 startup

EOF

# 配置Nginx
sudo cp nginx.conf /etc/nginx/sites-available/s100-platform
sudo ln -s /etc/nginx/sites-available/s100-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 配置SSL证书（使用Let's Encrypt）
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

echo "部署完成！"
```

### 3. 数据库迁移

#### PostgreSQL配置
```sql
-- 创建数据库和用户
CREATE DATABASE s100platform;
CREATE USER s100user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE s100platform TO s100user;
ALTER DATABASE s100platform OWNER TO s100user;

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

#### 数据迁移
```bash
# 生成迁移文件
npx prisma migrate dev --name init

# 运行迁移
npx prisma migrate deploy

# 生成客户端
npx prisma generate

# 重置数据库（如果需要）
npx prisma migrate reset
```

## 监控与运维

### 1. 应用监控

#### PM2监控
```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs s100-platform

# 监控应用性能
pm2 monit

# 重启应用
pm2 restart s100-platform

# 更新应用
pm2 reload s100-platform
```

#### 健康检查
```bash
# 创建健康检查脚本
cat > health-check.sh << 'EOF'
#!/bin/bash

# 检查应用状态
APP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ $APP_STATUS -eq 200 ]; then
    echo "应用运行正常"
    exit 0
else
    echo "应用异常，状态码: $APP_STATUS"
    # 发送告警邮件
    echo "应用异常" | mail -s "S100平台告警" admin@example.com
    exit 1
fi
EOF

chmod +x health-check.sh

# 添加到crontab
echo "*/5 * * * * /opt/s100-platform/health-check.sh" | crontab -
```

### 2. 系统监控

#### 系统资源监控
```bash
# 安装监控工具
sudo apt install -y htop iotop nethogs

# 创建系统监控脚本
cat > system-monitor.sh << 'EOF'
#!/bin/bash

# 获取系统信息
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
MEMORY_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')

# 记录到日志
echo "$(date): CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}%" >> /var/log/system-monitor.log

# 检查阈值
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "CPU使用率过高: ${CPU_USAGE}%" | mail -s "系统告警" admin@example.com
fi

if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "内存使用率过高: ${MEMORY_USAGE}%" | mail -s "系统告警" admin@example.com
fi

if [ $DISK_USAGE -gt 80 ]; then
    echo "磁盘使用率过高: ${DISK_USAGE}%" | mail -s "系统告警" admin@example.com
fi
EOF

chmod +x system-monitor.sh

# 添加到crontab
echo "*/10 * * * * /opt/s100-platform/system-monitor.sh" | crontab -
```

### 3. 日志管理

#### 日志轮转配置
```bash
# 创建logrotate配置
sudo tee /etc/logrotate.d/s100-platform << EOF
/opt/s100-platform/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 s100user s100user
    postrotate
        pm2 reload s100-platform
    endscript
}
EOF
```

#### 日志分析
```bash
# 安装日志分析工具
sudo apt install -y goaccess

# 创建日志分析脚本
cat > log-analysis.sh << 'EOF'
#!/bin/bash

# 分析访问日志
echo "=== 访问日志分析 ==="
goaccess /var/log/nginx/access.log -c

# 分析应用日志
echo "=== 应用日志分析 ==="
grep -i "error\|warning\|exception" /opt/s100-platform/logs/error.log | tail -20
EOF

chmod +x log-analysis.sh
```

### 4. 备份策略

#### 数据库备份
```bash
# 创建数据库备份脚本
cat > backup-database.sh << 'EOF'
#!/bin/bash

# 设置变量
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="s100platform"
DB_USER="s100user"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/${DB_NAME}_${DATE}.sql

# 压缩备份文件
gzip $BACKUP_DIR/${DB_NAME}_${DATE}.sql

# 删除30天前的备份
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +30 -delete

echo "数据库备份完成: ${DB_NAME}_${DATE}.sql.gz"
EOF

chmod +x backup-database.sh

# 添加到crontab
echo "0 2 * * * /opt/s100-platform/backup-database.sh" | crontab -
```

#### 文件备份
```bash
# 创建文件备份脚本
cat > backup-files.sh << 'EOF'
#!/bin/bash

# 设置变量
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/s100-platform"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_${DATE}.tar.gz -C $APP_DIR uploads

# 备份配置文件
tar -czf $BACKUP_DIR/config_${DATE}.tar.gz -C $APP_DIR .env ecosystem.config.js

# 删除30天前的备份
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "config_*.tar.gz" -mtime +30 -delete

echo "文件备份完成"
EOF

chmod +x backup-files.sh

# 添加到crontab
echo "0 3 * * * /opt/s100-platform/backup-files.sh" | crontab -
```

## 故障排除

### 1. 常见问题

#### 应用启动失败
```bash
# 检查应用状态
pm2 status

# 查看错误日志
pm2 logs s100-platform --err

# 检查端口占用
sudo netstat -tulpn | grep :3000

# 检查数据库连接
npm run db:push
```

#### 数据库连接问题
```bash
# 检查数据库状态
sudo systemctl status postgresql

# 测试数据库连接
psql -h localhost -U s100user -d s100platform -c "SELECT 1;"

# 检查数据库配置
cat /opt/s100-platform/.env | grep DATABASE_URL
```

#### 性能问题
```bash
# 检查系统资源
htop

# 检查应用性能
pm2 monit

# 检查数据库性能
psql -h localhost -U s100user -d s100platform -c "SELECT * FROM pg_stat_activity;"
```

### 2. 应急处理

#### 应用崩溃处理
```bash
# 重启应用
pm2 restart s100-platform

# 检查应用状态
pm2 status

# 查看日志
pm2 logs s100-platform --lines 50
```

#### 数据库故障处理
```bash
# 重启数据库
sudo systemctl restart postgresql

# 检查数据库状态
sudo systemctl status postgresql

# 恢复数据库
gunzip -c /opt/backups/s100platform_20240101_020000.sql.gz | psql -h localhost -U s100user s100platform
```

#### 系统故障处理
```bash
# 重启系统
sudo reboot

# 检查服务状态
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# 恢复服务
sudo systemctl start nginx
sudo systemctl start postgresql
pm2 start all
```

---

*该部署指南提供了完整的部署流程和运维方案，确保系统的稳定运行和高效维护。*