#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ApiDocGenerator {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.apiRouteDir = path.join(projectRoot, 'src/app/api');
    this.outputDir = path.join(projectRoot, 'src/lib/generated');
  }

  async generateDocumentation() {
    console.log('🚀 开始生成API文档...');
    
    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 扫描所有API路由文件
    const apiFiles = this.scanApiFiles();
    console.log(`📁 发现 ${apiFiles.length} 个API路由文件`);

    // 解析每个API文件
    const allEndpoints = [];
    for (const file of apiFiles) {
      const endpoints = this.parseApiFile(file);
      allEndpoints.push(...endpoints);
    }

    console.log(`🔍 解析出 ${allEndpoints.length} 个API端点`);

    // 分类端点
    const categorized = this.categorizeEndpoints(allEndpoints);

    // 生成文档数据
    const documentation = {
      public: this.generateApiCategories(categorized.public),
      federation: this.generateApiCategories(categorized.federation),
      administration: this.generateApiCategories(categorized.administration),
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    // 保存文档数据
    await this.saveDocumentation(documentation);

    console.log('✅ API文档生成完成！');
    return documentation;
  }

  scanApiFiles() {
    const files = [];
    
    const scanDirectory = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // 跳过特定目录
          if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            scanDirectory(fullPath);
          }
        } else if (entry.name === 'route.ts') {
          files.push(fullPath);
        }
      }
    };

    scanDirectory(this.apiRouteDir);
    return files;
  }

  parseApiFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(this.apiRouteDir, filePath);
    const routePath = this.convertPathToRoute(relativePath);

    // 从文件路径推断HTTP方法
    const method = this.inferHttpMethod(routePath, content);
    
    // 基础端点信息
    const endpoint = {
      method,
      path: routePath,
      description: this.generateDescription(routePath, method),
      category: this.inferCategory(routePath),
      version: 'v1.0.0',
      authentication: this.inferAuthentication(routePath),
      securityLevel: this.inferSecurityLevel(routePath),
      responses: this.generateResponses(method)
    };

    // 解析参数（从路径中提取）
    const pathParams = this.extractPathParameters(routePath);
    if (pathParams.length > 0) {
      endpoint.parameters = pathParams;
    }

    return [endpoint];
  }

  convertPathToRoute(relativePath) {
    // 移除 route.ts
    const pathWithoutFile = relativePath.replace(/\/route\.ts$/, '');
    
    // 处理动态路由 [id] -> {id}
    const routePath = pathWithoutFile
      .replace(/\[([^\]]+)\]/g, '{$1}')
      .replace(/\\/g, '/');
    
    return `/api${routePath}`;
  }

  inferHttpMethod(routePath, fileContent) {
    // 从文件内容中查找HTTP方法
    const methodMatch = fileContent.match(/export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/i);
    if (methodMatch) {
      return methodMatch[1].toUpperCase();
    }

    // 从路径推断默认方法
    if (routePath.includes('/health') || routePath.includes('/capabilities')) {
      return 'GET';
    }
    
    if (routePath.includes('/ingest') || routePath.includes('/publish') || routePath.includes('/create')) {
      return 'POST';
    }
    
    if (routePath.includes('/update') || routePath.includes('/sync')) {
      return 'PUT';
    }
    
    if (routePath.includes('/delete') || routePath.includes('/remove')) {
      return 'DELETE';
    }

    return 'GET'; // 默认方法
  }

  generateDescription(routePath, method) {
    const descriptions = {
      '/api/v1/capabilities': '获取指定区域内所有可用的S-100数据服务',
      '/api/v1/s101/wfs': '获取S-101电子海图Web要素服务',
      '/api/v1/s101/wms': '获取S-101电子海图Web地图服务',
      '/api/v1/s102/wcs': '获取S-102高精度水深Web覆盖服务',
      '/api/v1/s102/wms': '获取S-102高精度水深Web地图服务',
      '/api/v1/s104/wms': '获取S-104水位数据Web地图服务',
      '/api/admin/nodes': '创建和管理网络节点',
      '/api/admin/services': '创建和管理服务',
      '/api/admin/users': '用户管理',
      '/api/health': '健康检查',
      '/api/capabilities': '获取服务能力',
      '/api/nodes': '节点管理',
      '/api/services': '服务管理',
      '/api/users': '用户管理'
    };

    return descriptions[routePath] || `${method} ${routePath}`;
  }

  inferCategory(routePath) {
    if (routePath.includes('/admin/') || routePath.includes('/internal/')) {
      return 'administration';
    }
    
    if (routePath.includes('/federation/') || routePath.includes('/nodes/')) {
      return 'federation';
    }
    
    return 'public';
  }

  inferAuthentication(routePath) {
    if (routePath.includes('/admin/') || routePath.includes('/internal/')) {
      return 'Internal Token + IP Whitelist';
    }
    
    if (routePath.includes('/v1/')) {
      return 'API Key';
    }
    
    return 'None';
  }

  inferSecurityLevel(routePath) {
    if (routePath.includes('/admin/') || routePath.includes('/internal/')) {
      return routePath.includes('/users/') || routePath.includes('/config/') ? 'critical' : 'high';
    }
    
    if (routePath.includes('/federation/')) {
      return 'high';
    }
    
    if (routePath.includes('/v1/')) {
      return 'medium';
    }
    
    return 'low';
  }

  extractPathParameters(routePath) {
    const params = [];

    // 提取路径参数 {id}
    const paramMatches = routePath.match(/\{([^}]+)\}/g);
    if (paramMatches) {
      paramMatches.forEach(match => {
        const paramName = match.replace(/[{}]/g, '');
        params.push({
          name: paramName,
          type: 'string',
          required: true,
          description: `${paramName}参数`
        });
      });
    }

    return params;
  }

  generateResponses(method) {
    const responses = [];

    switch (method) {
      case 'GET':
        responses.push(
          { code: 200, description: '成功获取数据' },
          { code: 404, description: '资源不存在' }
        );
        break;
      case 'POST':
        responses.push(
          { code: 201, description: '创建成功' },
          { code: 400, description: '请求参数错误' }
        );
        break;
      case 'PUT':
        responses.push(
          { code: 200, description: '更新成功' },
          { code: 404, description: '资源不存在' }
        );
        break;
      case 'DELETE':
        responses.push(
          { code: 200, description: '删除成功' },
          { code: 404, description: '资源不存在' }
        );
        break;
      default:
        responses.push({ code: 200, description: '成功' });
    }

    responses.push({ code: 500, description: '服务器内部错误' });
    
    return responses;
  }

  categorizeEndpoints(endpoints) {
    return {
      public: endpoints.filter(e => e.category === 'public'),
      federation: endpoints.filter(e => e.category === 'federation'),
      administration: endpoints.filter(e => e.category === 'administration')
    };
  }

  generateApiCategories(endpoints) {
    const categoryMap = new Map();

    endpoints.forEach(endpoint => {
      const categoryName = this.getCategoryName(endpoint.path);
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          description: this.getCategoryDescription(categoryName),
          icon: this.getCategoryIcon(categoryName),
          securityLevel: endpoint.securityLevel,
          endpoints: []
        });
      }

      categoryMap.get(categoryName).endpoints.push(endpoint);
    });

    return Array.from(categoryMap.values());
  }

  getCategoryName(path) {
    if (path.includes('/s101/')) return 'S-101电子海图服务';
    if (path.includes('/s102/')) return 'S-102高精度水深服务';
    if (path.includes('/s104/')) return 'S-104水位数据服务';
    if (path.includes('/capabilities')) return '服务能力查询';
    if (path.includes('/nodes')) return '节点管理服务';
    if (path.includes('/users')) return '用户管理服务';
    if (path.includes('/services')) return '服务管理';
    if (path.includes('/ingest')) return '数据摄入服务';
    if (path.includes('/health')) return '健康检查服务';
    if (path.includes('/monitoring')) return '监控服务';
    if (path.includes('/admin')) return '系统管理服务';
    if (path.includes('/internal')) return '内部服务';
    return '其他服务';
  }

  getCategoryDescription(categoryName) {
    const descriptions = {
      'S-101电子海图服务': '提供电子海图数据的Web要素服务和Web地图服务',
      'S-102高精度水深服务': '提供高精度水深数据的Web覆盖服务和Web地图服务',
      'S-104水位数据服务': '提供水位数据的Web地图服务',
      '服务能力查询': '查询系统服务能力和节点信息',
      '节点管理服务': '节点间通信，实现能力发现与聚合',
      '用户管理服务': '用户管理和权限控制接口',
      '服务管理': '服务注册、发布和管理',
      '数据摄入服务': 'S-100数据摄入和管理',
      '健康检查服务': '系统健康状态检查',
      '监控服务': '系统监控和性能指标',
      '系统管理服务': '系统管理员专用接口',
      '内部服务': '内部系统调用接口',
      '其他服务': '其他API服务'
    };
    return descriptions[categoryName] || 'API服务';
  }

  getCategoryIcon(categoryName) {
    const icons = {
      'S-101电子海图服务': 'Map',
      'S-102高精度水深服务': 'Database',
      'S-104水位数据服务': 'Activity',
      '服务能力查询': 'Search',
      '节点管理服务': 'Network',
      '用户管理服务': 'Users',
      '服务管理': 'Settings',
      '数据摄入服务': 'Upload',
      '健康检查服务': 'Heart',
      '监控服务': 'Activity',
      '系统管理服务': 'Shield',
      '内部服务': 'Lock',
      '其他服务': 'Code'
    };
    return icons[categoryName] || 'Code';
  }

  async saveDocumentation(documentation) {
    const filePath = path.join(this.outputDir, 'api-documentation.ts');
    
    const content = `// 自动生成的API文档 - 请勿手动修改
// 生成时间: ${documentation.generatedAt}
// 版本: ${documentation.version}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  category: 'public' | 'federation' | 'administration';
  version: string;
  authentication: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example?: string;
  }>;
  requestBody?: {
    type: string;
    description: string;
    example: string;
  };
  responses: Array<{
    code: number;
    description: string;
    example?: string;
  }>;
  tags?: string[];
  deprecated?: boolean;
}

export interface ApiCategory {
  name: string;
  description: string;
  icon: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  endpoints: ApiEndpoint[];
}

export interface ApiDocumentation {
  public: ApiCategory[];
  federation: ApiCategory[];
  administration: ApiCategory[];
  generatedAt: string;
  version: string;
}

export const apiDocumentation: ApiDocumentation = ${JSON.stringify(documentation, null, 2)};
`;

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`📄 API文档数据已保存到: ${filePath}`);
  }
}

// 主函数
async function main() {
  const generator = new ApiDocGenerator();
  await generator.generateDocumentation();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ApiDocGenerator };