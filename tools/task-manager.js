#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class TaskManager {
    constructor() {
        this.repoPath = process.cwd();
        this.tasksDir = path.join(this.repoPath, 'development/tasks');
        this.currentTaskFile = path.join(this.tasksDir, 'current-task.json');
        this.statsFile = path.join(this.tasksDir, 'task-stats.json');
    }

    log(message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    }

    createTask(taskData) {
        const taskId = taskData.id || this.generateTaskId();
        const taskFile = path.join(this.tasksDir, 'active', `${this.getCurrentDate()}_${taskId}_${this.sanitizeFileName(taskData.name)}.md`);
        
        const template = this.getTemplate(taskData.type);
        const content = this.populateTemplate(template, { ...taskData, id: taskId });
        
        fs.writeFileSync(taskFile, content);
        this.updateCurrentTask(taskData);
        this.log(`✅ 任务创建成功: ${taskData.name} (${taskId})`);
        
        return taskId;
    }

    completeTask(taskId) {
        const activeTaskFile = this.findActiveTask(taskId);
        if (!activeTaskFile) {
            throw new Error(`未找到活跃任务: ${taskId}`);
        }

        const completedTaskFile = path.join(this.tasksDir, 'completed', path.basename(activeTaskFile).replace('.md', '_completed.md'));
        
        // 移动任务文件
        fs.renameSync(activeTaskFile, completedTaskFile);
        
        // 更新当前任务文件
        this.clearCurrentTask();
        
        this.log(`✅任务已完成: ${taskId}`);
        return completedTaskFile;
    }

    updateTaskStatus(taskId, newStatus) {
        const taskFile = this.findActiveTask(taskId);
        if (!taskFile) {
            throw new Error(`未找到活跃任务: ${taskId}`);
        }

        let content = fs.readFileSync(taskFile, 'utf8');
        content = content.replace(/- \*\*状态\*\*: [\w-]+/, `- **状态**: ${newStatus}`);
        fs.writeFileSync(taskFile, content);
        
        this.log(`✅ 任务状态已更新: ${taskId} → ${newStatus}`);
    }

    getCurrentTaskInfo() {
        try {
            if (fs.existsSync(this.currentTaskFile)) {
                return JSON.parse(fs.readFileSync(this.currentTaskFile, 'utf8'));
            }
            return null;
        } catch (error) {
            this.log('❌ 读取当前任务信息失败: ' + error.message);
            return null;
        }
    }

    listTasks(status = 'active') {
        const tasksDir = path.join(this.tasksDir, status);
        if (!fs.existsSync(tasksDir)) {
            return [];
        }

        return fs.readdirSync(tasksDir)
            .filter(file => file.endsWith('.md'))
            .map(file => {
                const filePath = path.join(tasksDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                return this.parseTaskInfo(content, file);
            });
    }

    showStats() {
        const stats = this.getStats();
        console.log('\n📊 任务统计信息:');
        console.log(`总任务数: ${stats.statistics.total_tasks}`);
        console.log(`活跃任务: ${stats.statistics.active_tasks}`);
        console.log(`已完成: ${stats.statistics.completed_tasks}`);
        console.log(`被阻塞: ${stats.statistics.blocked_tasks}`);
        console.log(`已取消: ${stats.statistics.cancelled_tasks}`);
        console.log(`完成率: ${stats.statistics.completion_rate}%`);
        
        console.log('\n🎯 优先级分布:');
        Object.entries(stats.statistics.priority_distribution).forEach(([priority, count]) => {
            console.log(`  ${priority}: ${count}`);
        });
        
        console.log('\n📝 类型分布:');
        Object.entries(stats.statistics.type_distribution).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });
    }

    // 私有方法
    generateTaskId() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '');
        return `${dateStr}${timeStr}`;
    }

    getCurrentDate() {
        return new Date().toISOString().slice(0, 10);
    }

    sanitizeFileName(name) {
        return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    }

    getTemplate(type) {
        const templateFile = path.join(this.tasksDir, 'templates', `${type}-task-template.md`);
        if (fs.existsSync(templateFile)) {
            return fs.readFileSync(templateFile, 'utf8');
        }
        return fs.readFileSync(path.join(this.tasksDir, 'templates', 'standard-task-template.md'), 'utf8');
    }

    populateTemplate(template, data) {
        let content = template;
        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`\\[${key}\\]`, 'g');
            content = content.replace(regex, value || '');
        });
        return content;
    }

    updateCurrentTask(taskData) {
        const currentData = {
            current_task: {
                id: taskData.id,
                name: taskData.name,
                description: taskData.description,
                type: taskData.type || 'feature',
                priority: taskData.priority || 'medium',
                status: 'pending',
                start_date: this.getCurrentDate(),
                expected_completion: taskData.expected_completion || this.getCurrentDate(),
                subtasks: taskData.subtasks || []
            },
            last_updated: new Date().toISOString(),
            version: '1.0'
        };
        
        fs.writeFileSync(this.currentTaskFile, JSON.stringify(currentData, null, 2));
    }

    clearCurrentTask() {
        if (fs.existsSync(this.currentTaskFile)) {
            fs.unlinkSync(this.currentTaskFile);
        }
    }

    findActiveTask(taskId) {
        const activeDir = path.join(this.tasksDir, 'active');
        if (!fs.existsSync(activeDir)) {
            return null;
        }

        const files = fs.readdirSync(activeDir);
        const taskFile = files.find(file => file.includes(`_${taskId}_`));
        return taskFile ? path.join(activeDir, taskFile) : null;
    }

    parseTaskInfo(content, filename) {
        const lines = content.split('\n');
        const info = {
            filename,
            id: this.extractField(lines, '任务ID'),
            name: this.extractField(lines, '任务名称') || this.extractField(lines, '功能名称') || this.extractField(lines, 'Bug标题'),
            status: this.extractField(lines, '状态'),
            priority: this.extractField(lines, '优先级'),
            type: this.extractField(lines, '任务类型') || 'unknown'
        };
        return info;
    }

    extractField(lines, fieldName) {
        const line = lines.find(l => l.includes(`**${fieldName}**:`));
        if (line) {
            const match = line.match(/\*\*${fieldName}\*\*:\s*(.+)/);
            return match ? match[1].trim() : null;
        }
        return null;
    }

    getStats() {
        try {
            if (fs.existsSync(this.statsFile)) {
                return JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
            }
            return this.getDefaultStats();
        } catch (error) {
            this.log('❌ 读取统计信息失败，使用默认值');
            return this.getDefaultStats();
        }
    }

    getDefaultStats() {
        return {
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
    }
}

// 命令行接口
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const taskManager = new TaskManager();
    
    try {
        switch (command) {
            case 'create':
                const taskData = {
                    name: args[1] || '新任务',
                    description: args[2] || '任务描述',
                    type: args[3] || 'feature',
                    priority: args[4] || 'medium'
                };
                taskManager.createTask(taskData);
                break;
                
            case 'complete':
                const completeId = args[1];
                if (!completeId) {
                    console.error('请提供任务ID');
                    process.exit(1);
                }
                taskManager.completeTask(completeId);
                break;
                
            case 'list':
                const status = args[1] || 'active';
                const tasks = taskManager.listTasks(status);
                console.log(`\n📋 ${status} 任务列表:`);
                tasks.forEach(task => {
                    console.log(`  ${task.id}: ${task.name} (${task.status})`);
                });
                break;
                
            case 'current':
                const current = taskManager.getCurrentTaskInfo();
                if (current && current.current_task) {
                    console.log('\n🎯 当前任务:');
                    console.log(`ID: ${current.current_task.id}`);
                    console.log(`名称: ${current.current_task.name}`);
                    console.log(`描述: ${current.current_task.description}`);
                    console.log(`状态: ${current.current_task.status}`);
                    console.log(`优先级: ${current.current_task.priority}`);
                } else {
                    console.log('没有当前活跃任务');
                }
                break;
                
            case 'stats':
                taskManager.showStats();
                break;
                
            default:
                console.log(`
任务管理工具使用方法:

  node tools/task-manager.js create <name> <description> <type> <priority>
    创建新任务
    
  node tools/task-manager.js complete <task-id>
    完成指定任务
    
  node tools/task-manager.js list [active|completed]
    列出任务
    
  node tools/task-manager.js current
    显示当前任务
    
  node tools/task-manager.js stats
    显示任务统计

示例:
  node tools/task-manager.js create "修复登录问题" "用户无法登录系统" bugfix high
  node tools/task-manager.js complete 001
  node tools/task-manager.js list active
                `);
        }
    } catch (error) {
        console.error('❌ 操作失败:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = TaskManager;