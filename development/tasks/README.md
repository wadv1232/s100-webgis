# 任务管理系统

## 概述
本系统用于跟踪和管理S-100海事Web服务平台开发过程中的所有任务，确保开发进度透明化，并提供自动提交工具的任务摘要功能。

## 文件夹结构

```
development/tasks/
├── active/           # 当前进行中的任务
├── completed/        # 已完成的任务
├── templates/        # 任务模板
├── archive/          # 归档的任务
├── current-task.json # 当前活跃任务记录
└── task-stats.json   # 任务统计信息
```

## 任务文件命名规范

### 活跃任务
- 格式: `YYYY-MM-DD_task-id_task-name.md`
- 示例: `2024-01-15_001_fix-font-loading.md`

### 已完成任务
- 格式: `YYYY-MM-DD_task-id_task-name_completed.md`
- 示例: `2024-01-15_001_fix-font-loading_completed.md`

## 任务模板

### 标准任务模板
见 `templates/standard-task-template.md`

### 功能任务模板
见 `templates/feature-task-template.md`

### 修复任务模板
见 `templates/bugfix-task-template.md`

## 任务状态

- **pending**: 待开始
- **in_progress**: 进行中
- **completed**: 已完成
- **blocked**: 被阻塞
- **cancelled**: 已取消

## 自动提交集成

自动提交工具会读取 `current-task.json` 文件来获取当前任务信息，并在提交信息中包含任务摘要。

## 使用方法

1. 创建新任务时，从模板复制并填写详细信息
2. 将任务文件放入 `active/` 文件夹
3. 更新 `current-task.json` 文件
4. 任务完成后，移动到 `completed/` 文件夹并更新状态
5. 定期将旧任务归档到 `archive/` 文件夹

## 任务统计

运行 `npm run task-stats` 可以查看任务完成情况和统计信息。