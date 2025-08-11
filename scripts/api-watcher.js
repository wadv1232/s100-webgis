#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class ApiWatcher {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.apiRouteDir = path.join(projectRoot, 'src/app/api');
    this.isRunning = false;
    this.debounceTimer = null;
    this.debounceDelay = 1000; // 1秒延迟
  }

  start() {
    if (this.isRunning) {
      console.log('🔄 API监听器已经在运行中...');
      return;
    }

    console.log('🚀 启动API文件监听器...');
    this.isRunning = true;

    // 初始生成
    this.generateApiDocs();

    // 开始监听
    this.watchApiFiles();

    console.log('✅ API监听器已启动，正在监听API文件变化...');
    console.log('📁 监听目录:', this.apiRouteDir);
    console.log('⏱️  防抖延迟:', this.debounceDelay, 'ms');
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 停止API文件监听器...');
    this.isRunning = false;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (this.watcher) {
      this.watcher.close();
    }
  }

  watchApiFiles() {
    try {
      const chokidar = require('chokidar');
      
      this.watcher = chokidar.watch(this.apiRouteDir, {
        ignored: /node_modules/,
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100
        }
      });

      this.watcher
        .on('add', (filePath) => this.handleFileChange('add', filePath))
        .on('change', (filePath) => this.handleFileChange('change', filePath))
        .on('unlink', (filePath) => this.handleFileChange('unlink', filePath))
        .on('addDir', (dirPath) => this.handleFileChange('addDir', dirPath))
        .on('unlinkDir', (dirPath) => this.handleFileChange('unlinkDir', dirPath))
        .on('error', (error) => {
          console.error('❌ 监听器错误:', error);
        });

    } catch (error) {
      console.log('⚠️  chokidar不可用，使用简化的监听模式');
      this.fallbackWatch();
    }
  }

  fallbackWatch() {
    // 简化的轮询监听
    const checkInterval = 2000; // 2秒检查一次
    let lastFiles = new Set();

    const checkFiles = () => {
      if (!this.isRunning) return;

      try {
        const currentFiles = new Set();
        this.scanApiFiles(this.apiRouteDir, currentFiles);

        // 检查文件变化
        const changes = [];
        
        // 检查新增文件
        for (const file of currentFiles) {
          if (!lastFiles.has(file)) {
            changes.push({ type: 'add', file });
          }
        }

        // 检查删除文件
        for (const file of lastFiles) {
          if (!currentFiles.has(file)) {
            changes.push({ type: 'unlink', file });
          }
        }

        // 检查文件修改
        for (const file of currentFiles) {
          if (lastFiles.has(file)) {
            const stats = fs.statSync(file);
            const lastStats = lastFiles.get(file);
            if (lastStats && stats.mtime > lastStats.mtime) {
              changes.push({ type: 'change', file });
            }
          }
        }

        if (changes.length > 0) {
          console.log('🔄 检测到文件变化:', changes);
          this.handleFileChange('batch', changes);
        }

        lastFiles = currentFiles;
        for (const file of currentFiles) {
          lastFiles.set(file, fs.statSync(file));
        }

      } catch (error) {
        console.error('❌ 轮询检查错误:', error);
      }

      setTimeout(checkFiles, checkInterval);
    };

    // 初始化文件状态
    this.scanApiFiles(this.apiRouteDir, lastFiles);
    for (const file of lastFiles) {
      lastFiles.set(file, fs.statSync(file));
    }

    // 开始轮询
    setTimeout(checkFiles, checkInterval);
  }

  scanApiFiles(dir, fileSet) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          this.scanApiFiles(fullPath, fileSet);
        }
      } else if (entry.isFile() && (entry.name === 'route.ts' || entry.name.endsWith('.ts'))) {
        fileSet.add(fullPath);
      }
    }
  }

  handleFileChange(event, filePath) {
    if (!this.isRunning) return;

    const message = this.formatChangeMessage(event, filePath);
    console.log(`🔄 ${message}`);

    // 防抖处理
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.generateApiDocs();
    }, this.debounceDelay);
  }

  formatChangeMessage(event, filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    
    switch (event) {
      case 'add':
        return `新增API文件: ${relativePath}`;
      case 'change':
        return `修改API文件: ${relativePath}`;
      case 'unlink':
        return `删除API文件: ${relativePath}`;
      case 'addDir':
        return `新增API目录: ${relativePath}`;
      case 'unlinkDir':
        return `删除API目录: ${relativePath}`;
      case 'batch':
        return `批量文件变化: ${filePath.length} 个文件`;
      default:
        return `文件变化: ${relativePath}`;
    }
  }

  generateApiDocs() {
    console.log('🔄 开始重新生成API文档和测试页面...');

    const startTime = Date.now();

    // 生成API文档
    const docProcess = spawn('node', ['scripts/generate-api-docs.js'], {
      cwd: this.projectRoot,
      stdio: 'pipe'
    });

    docProcess.stdout.on('data', (data) => {
      console.log(`📄 ${data.toString().trim()}`);
    });

    docProcess.stderr.on('data', (data) => {
      console.error(`❌ ${data.toString().trim()}`);
    });

    docProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ API文档生成完成');
        
        // 生成测试页面
        const testProcess = spawn('node', ['scripts/generate-api-test-pages.js'], {
          cwd: this.projectRoot,
          stdio: 'pipe'
        });

        testProcess.stdout.on('data', (data) => {
          console.log(`🧪 ${data.toString().trim()}`);
        });

        testProcess.stderr.on('data', (data) => {
          console.error(`❌ ${data.toString().trim()}`);
        });

        testProcess.on('close', (testCode) => {
          if (testCode === 0) {
            const duration = Date.now() - startTime;
            console.log(`🎉 API文档和测试页面更新完成! (耗时: ${duration}ms)`);
          } else {
            console.error(`❌ 测试页面生成失败，退出码: ${testCode}`);
          }
        });

      } else {
        console.error(`❌ API文档生成失败，退出码: ${code}`);
      }
    });
  }
}

// 主函数
function main() {
  const watcher = new ApiWatcher();
  
  // 启动监听器
  watcher.start();

  // 优雅关闭处理
  process.on('SIGINT', () => {
    console.log('\n🛑 收到关闭信号，正在停止监听器...');
    watcher.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 收到终止信号，正在停止监听器...');
    watcher.stop();
    process.exit(0);
  });

  process.on('exit', () => {
    watcher.stop();
  });
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ApiWatcher };