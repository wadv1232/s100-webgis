# 开发文档

本目录包含S100海事服务系统的详细开发文档、技术指南和最佳实践。

## 📚 文档结构

### 🛠️ 开发指南
- **[开发指南](./development.md)** - 开发环境搭建、配置和规范
- **[用户角色](./user-roles.md)** - 用户角色定义和权限管理
- **[用户场景深入分析](./user-scenarios-deep-dive.md)** - 用户使用场景的详细分析

### 🗺️ 地图功能
- **[增强地图功能](./ENHANCED_MAP_README.md)** - 地图功能增强和优化
- **[节点地图增强](./NODE_MAP_ENHANCED_README.md)** - 节点地图功能增强

### 🏢 节点管理
- **[节点管理改进](./NODE_MANAGEMENT_IMPROVEMENTS.md)** - 节点管理功能改进
- **[服务管理总结](./service-management-summary.md)** - 服务管理功能和优化

### 📋 任务管理
- **[任务管理指南](./TASK_MANAGEMENT_GUIDE.md)** - 任务管理系统使用指南
- **[任务文档](./task-document.md)** - 任务文档编写规范

### 🔧 开发工具
- **[自动提交指南](./AUTO_COMMIT_GUIDE.md)** - 自动提交工具使用指南
- **[模拟数据重构总结](./MOCK_DATA_REFACTOR_SUMMARY.md)** - 模拟数据重构和优化

### 📊 API文档
- **[API文档](./README.md)** - API接口文档和说明

## 🎯 开发流程

### 1. 环境搭建
参考 [开发指南](./development.md) 进行开发环境的搭建和配置。

### 2. 任务管理
使用 [任务管理指南](./TASK_MANAGEMENT_GUIDE.md) 进行任务的开发和管理。

### 3. 代码开发
遵循开发规范，参考相应的功能文档进行开发。

### 4. 测试和部署
参考测试指南和部署文档进行测试和部署。

## 🔍 快速导航

### 按功能模块查找
- **地图功能** → `ENHANCED_MAP_README.md`, `NODE_MAP_ENHANCED_README.md`
- **节点管理** → `NODE_MANAGEMENT_IMPROVEMENTS.md`
- **服务管理** → `service-management-summary.md`
- **用户管理** → `user-roles.md`, `user-scenarios-deep-dive.md`

### 按开发阶段查找
- **环境搭建** → `development.md`
- **开发工具** → `AUTO_COMMIT_GUIDE.md`, `MOCK_DATA_REFACTOR_SUMMARY.md`
- **任务管理** → `TASK_MANAGEMENT_GUIDE.md`, `task-document.md`

### 按文档类型查找
- **指南文档** → `development.md`, `TASK_MANAGEMENT_GUIDE.md`, `AUTO_COMMIT_GUIDE.md`
- **功能文档** → `ENHANCED_MAP_README.md`, `NODE_MANAGEMENT_IMPROVEMENTS.md`
- **总结文档** → `service-management-summary.md`, `MOCK_DATA_REFACTOR_SUMMARY.md`

## 📝 任务管理

### 任务模板
在 `tasks/templates/` 目录下提供了标准的任务模板：
- **标准任务模板** (`standard-task-template.md`)
- **功能任务模板** (`feature-task-template.md`)
- **缺陷修复模板** (`bugfix-task-template.md`)

### 已完成任务
在 `tasks/completed/` 目录下保存了已完成的任务文档，记录了任务的开发过程和结果。

## 🔄 开发工具

### 自动提交工具
参考 [自动提交指南](./AUTO_COMMIT_GUIDE.md) 使用自动提交工具，提高开发效率。

### 模拟数据管理
参考 [模拟数据重构总结](./MOCK_DATA_REFACTOR_SUMMARY.md) 了解模拟数据的管理和使用。

## 📋 最佳实践

### 代码开发
- 遵循TypeScript严格模式
- 使用ESLint进行代码检查
- 编写单元测试和集成测试
- 遵循模块化设计原则

### 文档编写
- 使用Markdown格式编写文档
- 保持文档的及时更新
- 提供清晰的示例和说明
- 遵循文档编写规范

### 任务管理
- 使用标准模板创建任务
- 及时更新任务状态
- 记录任务开发过程
- 完成后进行总结和归档

---

*最后更新: 2024-01-01*