#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoCommit {
    constructor() {
        this.repoPath = process.cwd();
        this.logFile = path.join(this.repoPath, 'logs/system/auto-commit.log');
        this.taskFile = path.join(this.repoPath, 'development/tasks/current-task.json');
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        console.log(logMessage.trim());
        fs.appendFileSync(this.logFile, logMessage);
    }

    execute(command, description) {
        try {
            this.log(`执行: ${description}`);
            const result = execSync(command, { 
                cwd: this.repoPath,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            this.log(`✅ ${description} 成功`);
            return result.trim();
        } catch (error) {
            this.log(`❌ ${description} 失败: ${error.message}`);
            throw error;
        }
    }

    getCurrentTask() {
        try {
            if (fs.existsSync(this.taskFile)) {
                const taskData = JSON.parse(fs.readFileSync(this.taskFile, 'utf8'));
                return taskData.current_task;
            }
            return null;
        } catch (error) {
            this.log('读取当前任务信息失败: ' + error.message);
            return null;
        }
    }

    getTaskProgress(currentTask) {
        if (!currentTask || !currentTask.subtasks) {
            return { completed: 0, total: 0, percentage: 0 };
        }
        
        const completed = currentTask.subtasks.filter(subtask => subtask.status === 'completed').length;
        const total = currentTask.subtasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { completed, total, percentage };
    }

    hasChanges() {
        try {
            const status = this.execute('git status --porcelain', '检查更改状态');
            return status.trim().length > 0;
        } catch (error) {
            this.log('检查更改状态失败');
            return false;
        }
    }

    getStagedFiles() {
        try {
            const status = this.execute('git diff --cached --name-only', '获取暂存文件');
            return status.trim() ? status.trim().split('\n') : [];
        } catch (error) {
            this.log('获取暂存文件失败');
            return [];
        }
    }

    createCommitMessage() {
        const timestamp = new Date().toLocaleString('zh-CN');
        const stagedFiles = this.getStagedFiles();
        const currentTask = this.getCurrentTask();
        const taskProgress = this.getTaskProgress(currentTask);
        
        let message = '';
        
        if (currentTask) {
            const taskIcon = this.getTaskIcon(currentTask.type);
            const progressText = taskProgress.total > 0 ? ` (${taskProgress.completed}/${taskProgress.total})` : '';
            message = `${taskIcon} ${currentTask.name}${progressText} - ${timestamp}\n\n`;
            
            message += `📋 任务ID: ${currentTask.id}\n`;
            message += `🎯 任务描述: ${currentTask.description}\n`;
            message += `📊 进度: ${taskProgress.percentage}%\n`;
            
            if (taskProgress.total > 0) {
                message += `📝 子任务完成情况:\n`;
                currentTask.subtasks.forEach(subtask => {
                    const statusIcon = subtask.status === 'completed' ? '✅' : '⏳';
                    message += `   ${statusIcon} ${subtask.name}\n`;
                });
                message += '\n';
            }
        } else {
            message = `🔧 Auto-fix: 自动修复和改进 - ${timestamp}\n\n`;
        }
        
        if (stagedFiles.length > 0) {
            message += '📁 修改文件:\n';
            stagedFiles.forEach(file => {
                message += `   - ${file}\n`;
            });
            message += '\n';
        }
        
        message += '🤖 Generated with [Claude Code](https://claude.ai/code)\n';
        message += 'Co-Authored-By: Claude <noreply@anthropic.com>';
        
        return message;
    }

    getTaskIcon(taskType) {
        const icons = {
            'feature': '🚀',
            'bugfix': '🐛',
            'optimization': '⚡',
            'documentation': '📚',
            'maintenance': '🔧',
            'testing': '🧪'
        };
        return icons[taskType] || '📝';
    }

    updateTaskStats() {
        try {
            const statsFile = path.join(this.repoPath, 'development/tasks/task-stats.json');
            let stats = {
                statistics: {
                    total_tasks: 0,
                    active_tasks: 0,
                    completed_tasks: 0,
                    blocked_tasks: 0,
                    cancelled_tasks: 0,
                    completion_rate: 0.0,
                    priority_distribution: { high: 0, medium: 0, low: 0 },
                    type_distribution: { feature: 0, bugfix: 0, optimization: 0, documentation: 0 }
                },
                recent_activity: [],
                last_updated: new Date().toISOString()
            };

            if (fs.existsSync(statsFile)) {
                stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
            }

            // 更新最近活动
            const currentTask = this.getCurrentTask();
            if (currentTask) {
                stats.recent_activity.unshift({
                    task_id: currentTask.id,
                    action: 'committed',
                    timestamp: new Date().toISOString()
                });

                // 只保留最近10条活动记录
                if (stats.recent_activity.length > 10) {
                    stats.recent_activity = stats.recent_activity.slice(0, 10);
                }
            }

            stats.last_updated = new Date().toISOString();
            fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
            this.log('✅ 任务统计信息已更新');
        } catch (error) {
            this.log('❌ 更新任务统计信息失败: ' + error.message);
        }
    }

    async commit() {
        this.log('🚀 开始自动提交流程...');

        if (!this.hasChanges()) {
            this.log('✅ 没有检测到更改，无需提交');
            return true;
        }

        try {
            // 添加所有更改
            this.execute('git add .', '添加所有更改到暂存区');

            // 检查是否有文件被暂存
            const stagedFiles = this.getStagedFiles();
            if (stagedFiles.length === 0) {
                this.log('✅ 没有文件需要提交');
                return true;
            }

            // 创建提交信息
            const commitMessage = this.createCommitMessage();
            
            // 提交更改
            this.execute(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, '提交更改');

            // 推送到 GitHub
            this.execute('git push origin master', '推送到 GitHub');

            // 更新任务统计信息
            this.updateTaskStats();

            this.log('✅ 自动提交完成！');
            this.log(`📋 提交了 ${stagedFiles.length} 个文件`);
            
            return true;
        } catch (error) {
            this.log(`❌ 自动提交失败: ${error.message}`);
            return false;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const autoCommit = new AutoCommit();
    autoCommit.commit()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('自动提交脚本执行失败:', error);
            process.exit(1);
        });
}

module.exports = AutoCommit;