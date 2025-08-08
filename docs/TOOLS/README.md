# 工具文档

本目录包含S100海事服务系统的开发工具、实用程序和自动化脚本等相关文档。

## 🛠️ 工具概述

S100海事服务系统提供了一系列开发工具和自动化脚本，用于提高开发效率和代码质量。

### 📋 工具分类
- **代码工具** - 代码生成、格式化、检查工具
- **数据库工具** - 数据库管理、迁移、种子工具
- **测试工具** - 测试运行、覆盖率、性能测试工具
- **部署工具** - 构建、部署、监控工具
- **自动化工具** - 自动提交、数据更新、维护脚本

## 🗂️ 工具目录结构

### 工具文件结构
```
tools/
├── README.md              # 工具说明文档
├── task-manager.js        # 任务管理器
├── commit-tools/          # 提交工具
│   ├── commit.sh          # 提交脚本
│   ├── auto-commit.sh     # 自动提交脚本
│   └── auto-commit.js     # 自动提交JavaScript脚本
└── scripts/               # 开发脚本
    ├── update-mock-data.js    # 模拟数据更新脚本
    └── mock-data-setup.sql    # 模拟数据设置SQL
```

## 🔧 核心工具

### 1. 任务管理器 (`task-manager.js`)
任务管理器用于管理和跟踪开发任务的执行状态。

#### 功能特性
- 任务创建和管理
- 任务状态跟踪
- 任务优先级设置
- 任务完成报告

#### 使用方法
```bash
# 运行任务管理器
node tools/task-manager.js

# 创建新任务
node tools/task-manager.js create --title "新功能开发" --priority high

# 查看任务列表
node tools/task-manager.js list

# 更新任务状态
node tools/task-manager.js update --id 1 --status in_progress

# 完成任务
node tools/task-manager.js complete --id 1
```

### 2. 提交工具 (`commit-tools/`)
提交工具用于自动化Git提交流程，确保提交信息的规范性。

#### 功能特性
- 自动化提交流程
- 标准化提交信息
- 代码质量检查
- 分支管理

#### 使用方法
```bash
# 使用提交脚本
./tools/commit-tools/commit.sh "feat: 添加新功能"

# 使用自动提交脚本
./tools/commit-tools/auto-commit.sh "fix: 修复bug"

# 使用JavaScript自动提交
node tools/commit-tools/auto-commit.js "docs: 更新文档"
```

#### 提交信息规范
```bash
# 格式: <type>: <description>
# 类型: feat, fix, docs, style, refactor, test, chore

feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式化
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

### 3. 模拟数据工具 (`scripts/`)
模拟数据工具用于管理和更新测试数据。

#### 功能特性
- 模拟数据生成
- 数据更新和同步
- 数据验证和清理
- 数据版本管理

#### 使用方法
```bash
# 更新模拟数据
node tools/scripts/update-mock-data.js

# 设置模拟数据
node tools/scripts/mock-data-setup.sql

# 验证模拟数据
node tools/scripts/validate-mock-data.js
```

## 🚀 开发脚本

### 1. 数据更新脚本 (`update-mock-data.js`)
用于更新和维护模拟数据，确保测试数据的一致性。

#### 功能特性
- 自动更新模拟数据
- 数据一致性检查
- 数据备份和恢复
- 数据差异报告

#### 配置选项
```javascript
// update-mock-data.js 配置
const config = {
  dataSource: 'database',    // 数据源: database, api, file
  targetPath: './mock-data', // 目标路径
  backupEnabled: true,       // 启用备份
  validationEnabled: true,   // 启用验证
  reportEnabled: true,      // 启用报告
}
```

### 2. 数据库设置脚本 (`mock-data-setup.sql`)
SQL脚本用于设置数据库的初始模拟数据。

#### 功能特性
- 数据库表创建
- 初始数据插入
- 索引和约束设置
- 数据完整性检查

#### 使用方法
```bash
# 执行SQL脚本
sqlite3 dev.db < tools/scripts/mock-data-setup.sql

# 或者使用Prisma
npx prisma db execute --file tools/scripts/mock-data-setup.sql
```

## 📊 工具集成

### 与CI/CD集成
工具可以与CI/CD流水线集成，实现自动化开发流程：

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Update mock data
        run: node tools/scripts/update-mock-data.js
      - name: Run tests
        run: npm test
      - name: Auto commit if changes
        run: node tools/commit-tools/auto-commit.js "chore: 更新模拟数据"
```

### 与开发工具集成
工具可以与VS Code等开发工具集成，提供更好的开发体验：

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Update Mock Data",
      "type": "shell",
      "command": "node tools/scripts/update-mock-data.js",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Auto Commit",
      "type": "shell",
      "command": "node tools/commit-tools/auto-commit.js",
      "args": ["chore: 自动提交"],
      "group": "build"
    }
  ]
}
```

## 🔧 工具配置

### 环境变量配置
```bash
# 工具配置环境变量
TOOL_LOG_LEVEL=debug           # 工具日志级别
TOOL_BACKUP_ENABLED=true       # 启用备份功能
TOOL_VALIDATION_ENABLED=true   # 启用验证功能
TOOL_REPORT_ENABLED=true       # 启用报告功能
TOOL_AUTO_COMMIT_ENABLED=true  # 启用自动提交
```

### 工具配置文件
```javascript
// tools/config.js
module.exports = {
  // 任务管理器配置
  taskManager: {
    storagePath: './development/tasks',
    defaultPriority: 'medium',
    autoArchive: true,
    archiveDays: 30,
  },
  
  // 提交工具配置
  commitTools: {
    autoStage: true,
    qualityCheck: true,
    branchProtection: true,
    commitTemplate: 'conventional',
  },
  
  // 数据工具配置
  dataTools: {
    dataSource: 'database',
    backupPath: './backups',
    validationRules: './config/validation-rules.json',
  },
}
```

## 📈 工具监控

### 工具执行监控
- 执行时间统计
- 成功率统计
- 错误日志记录
- 性能指标监控

### 工具使用报告
```bash
# 生成工具使用报告
node tools/scripts/generate-usage-report.js

# 查看工具统计信息
node tools/scripts/show-tool-stats.js
```

## 🔍 工具最佳实践

### 1. 工具开发原则
- **单一职责** - 每个工具只负责一个特定功能
- **可配置性** - 提供灵活的配置选项
- **错误处理** - 完善的错误处理和日志记录
- **文档完善** - 提供详细的使用文档

### 2. 工具使用原则
- **定期更新** - 保持工具代码的更新和维护
- **安全使用** - 注意工具使用的安全性
- **性能优化** - 优化工具的执行性能
- **兼容性** - 确保工具在不同环境下的兼容性

### 3. 工具集成原则
- **标准化** - 遵循工具集成的标准规范
- **自动化** - 实现工具的自动化执行
- **监控** - 集成工具执行监控
- **报告** - 生成工具执行报告

### 4. 工具维护原则
- **版本控制** - 工具代码纳入版本控制
- **测试覆盖** - 为工具编写测试用例
- **文档更新** - 及时更新工具文档
- **用户反馈** - 收集用户反馈并改进工具

---

*最后更新: 2024-01-01*