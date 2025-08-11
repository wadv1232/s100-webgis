#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ApiTestPageGenerator {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.apiDocPath = path.join(projectRoot, 'src/lib/generated/api-documentation.ts');
    this.outputDir = path.join(projectRoot, 'src/app/api-test');
  }

  async generateTestPage() {
    console.log('🚀 开始生成API测试页面...');
    
    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 读取API文档数据
    const apiDoc = await this.readApiDocumentation();
    
    // 生成主页面
    await this.generateMainPage(apiDoc);
    
    // 生成分类页面
    await this.generateCategoryPages(apiDoc);
    
    // 生成单个API测试页面
    await this.generateEndpointTestPages(apiDoc);
    
    console.log('✅ API测试页面生成完成！');
  }

  async readApiDocumentation() {
    if (!fs.existsSync(this.apiDocPath)) {
      throw new Error('API文档不存在，请先运行 npm run generate-api-docs');
    }

    const content = fs.readFileSync(this.apiDocPath, 'utf-8');
    
    // 提取JSON数据
    const jsonMatch = content.match(/export const apiDocumentation: ApiDocumentation = (\{[\s\S]*?\});/);
    if (!jsonMatch) {
      throw new Error('无法解析API文档数据');
    }

    // 使用eval解析JSON（注意：在生产环境中应该使用更安全的方法）
    try {
      return eval(`(${jsonMatch[1]})`);
    } catch (error) {
      throw new Error('API文档数据格式错误');
    }
  }

  async generateMainPage(apiDoc) {
    const mainPageContent = `'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiDocumentation } from '@/lib/generated/api-documentation';

export default function ApiTestPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const allEndpoints = [
    ...apiDocumentation.public.flatMap(cat => cat.endpoints),
    ...apiDocumentation.federation.flatMap(cat => cat.endpoints),
    ...apiDocumentation.administration.flatMap(cat => cat.endpoints)
  ];

  const filteredEndpoints = allEndpoints.filter(endpoint => {
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'public' && endpoint.category === 'public') ||
      (selectedCategory === 'federation' && endpoint.category === 'federation') ||
      (selectedCategory === 'administration' && endpoint.category === 'administration');
    
    const matchesSearch = endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const getSecurityColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">S-100 WebGIS API 测试平台</h1>
        <p className="text-gray-600 mb-6">
          自动生成的API测试界面，包含所有 {allEndpoints.length} 个API端点
        </p>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="搜索API..."
            className="flex-1 px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">所有分类</option>
            <option value="public">公共API</option>
            <option value="federation">联邦API</option>
            <option value="administration">管理API</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredEndpoints.map((endpoint, index) => (
          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={\`px-2 py-1 rounded text-sm font-medium \${getMethodColor(endpoint.method)}\`}>
                  {endpoint.method}
                </span>
                <span className={\`px-2 py-1 rounded text-sm \${getSecurityColor(endpoint.securityLevel)}\`}>
                  {endpoint.securityLevel}
                </span>
              </div>
              <Link
                href={\`/api-test/\${endpoint.category}/\${endpoint.method}/\${encodeURIComponent(endpoint.path)}\`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                测试
              </Link>
            </div>
            
            <h3 className="font-mono text-lg mb-2">{endpoint.path}</h3>
            <p className="text-gray-600 mb-2">{endpoint.description}</p>
            
            <div className="text-sm text-gray-500">
              <span>认证: {endpoint.authentication}</span>
              {endpoint.parameters && endpoint.parameters.length > 0 && (
                <span className="ml-4">参数: {endpoint.parameters.length}个</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEndpoints.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          没有找到匹配的API端点
        </div>
      )}
    </div>
  );
}
`;

    const mainPagePath = path.join(this.outputDir, 'page.tsx');
    fs.writeFileSync(mainPagePath, mainPageContent);
    console.log(`📄 主页面已生成: ${mainPagePath}`);
  }

  async generateCategoryPages(apiDoc) {
    const categories = ['public', 'federation', 'administration'];
    
    for (const category of categories) {
      const categoryDir = path.join(this.outputDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      const categoryContent = `'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiDocumentation } from '@/lib/generated/api-documentation';

export default function CategoryPage({ params }) {
  const category = '${category}';
  const [searchTerm, setSearchTerm] = useState('');

  const categoryData = apiDocumentation[category] || [];
  const endpoints = categoryData.flatMap(cat => cat.endpoints);

  const filteredEndpoints = endpoints.filter(endpoint => 
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSecurityColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/api-test" className="text-blue-500 hover:text-blue-700">
            ← 返回API测试平台
          </Link>
          <h1 className="text-3xl font-bold">{category.toUpperCase()} API</h1>
        </div>
        
        <input
          type="text"
          placeholder="搜索API..."
          className="w-full px-4 py-2 border rounded-lg mb-6"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredEndpoints.map((endpoint, index) => (
          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={\`px-2 py-1 rounded text-sm font-medium \${getMethodColor(endpoint.method)}\`}>
                  {endpoint.method}
                </span>
                <span className={\`px-2 py-1 rounded text-sm \${getSecurityColor(endpoint.securityLevel)}\`}>
                  {endpoint.securityLevel}
                </span>
              </div>
              <Link
                href={\`/api-test/\${category}/\${endpoint.method}/\${encodeURIComponent(endpoint.path)}\`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                测试
              </Link>
            </div>
            
            <h3 className="font-mono text-lg mb-2">{endpoint.path}</h3>
            <p className="text-gray-600 mb-2">{endpoint.description}</p>
            
            <div className="text-sm text-gray-500">
              <span>认证: {endpoint.authentication}</span>
              {endpoint.parameters && endpoint.parameters.length > 0 && (
                <span className="ml-4">参数: {endpoint.parameters.length}个</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEndpoints.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          没有找到匹配的API端点
        </div>
      )}
    </div>
  );
}
`;

      const categoryPagePath = path.join(categoryDir, 'page.tsx');
      fs.writeFileSync(categoryPagePath, categoryContent);
      console.log(`📄 分类页面已生成: ${categoryPagePath}`);
    }
  }

  async generateEndpointTestPages(apiDoc) {
    const allEndpoints = [
      ...apiDoc.public.flatMap(cat => cat.endpoints.map(e => ({...e, category: 'public'}))),
      ...apiDoc.federation.flatMap(cat => cat.endpoints.map(e => ({...e, category: 'federation'}))),
      ...apiDoc.administration.flatMap(cat => cat.endpoints.map(e => ({...e, category: 'administration'})))
    ];

    for (const endpoint of allEndpoints) {
      const endpointDir = path.join(this.outputDir, endpoint.category, endpoint.method, encodeURIComponent(endpoint.path));
      if (!fs.existsSync(endpointDir)) {
        fs.mkdirSync(endpointDir, { recursive: true });
      }

      const endpointContent = `'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EndpointTestPage({ params }) {
  const { method } = params;
  const path = params.path || '';
  const category = '${endpoint.category}';
  
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [headers, setHeaders] = useState('{}');

  const endpoint = {
    method: '${endpoint.method}',
    path: '${endpoint.path}',
    description: '${endpoint.description}',
    authentication: '${endpoint.authentication}',
    securityLevel: '${endpoint.securityLevel}',
    parameters: ${JSON.stringify(endpoint.parameters || [])},
    responses: ${JSON.stringify(endpoint.responses || [])}
  };

  const testEndpoint = async () => {
    setLoading(true);
    setError('');
    setResponseData(null);

    try {
      const url = path;
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...JSON.parse(headers || '{}')
        }
      };

      if (method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const response = await fetch(url, options);
      const data = await response.json();
      
      setResponseData({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const getSecurityColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href={\`/api-test/\${category}\`} className="text-blue-500 hover:text-blue-700">
            ← 返回{category} API
          </Link>
          <h1 className="text-3xl font-bold">API 测试</h1>
        </div>

        <div className="border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={\`px-3 py-1 rounded text-sm font-medium \${getMethodColor(endpoint.method)}\`}>
              {endpoint.method}
            </span>
            <span className={\`px-3 py-1 rounded text-sm \${getSecurityColor(endpoint.securityLevel)}\`}>
              {endpoint.securityLevel}
            </span>
          </div>

          <h2 className="font-mono text-xl mb-2">{endpoint.path}</h2>
          <p className="text-gray-600 mb-4">{endpoint.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-2">认证方式</h3>
              <p className="text-gray-600">{endpoint.authentication}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">安全级别</h3>
              <span className={\`px-2 py-1 rounded text-sm \${getSecurityColor(endpoint.securityLevel)}\`}>
                {endpoint.securityLevel}
              </span>
            </div>
          </div>

          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">路径参数</h3>
              <div className="space-y-2">
                {endpoint.parameters.map((param, index) => (
                  <div key={index} className="border rounded p-2">
                    <code className="text-sm">{param.name}</code>
                    <span className="text-gray-500 ml-2">({param.type})</span>
                    <p className="text-sm text-gray-600">{param.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-semibold mb-2">预期响应</h3>
            <div className="space-y-2">
              {endpoint.responses.map((response, index) => (
                <div key={index} className="border rounded p-2">
                  <span className="font-mono text-sm">{response.code}</span>
                  <span className="text-gray-600 ml-2">{response.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">请求配置</h3>
            
            {method !== 'GET' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">请求体 (JSON)</label>
                <textarea
                  className="w-full h-32 p-2 border rounded font-mono text-sm"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder='{"key": "value"}'
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">请求头 (JSON)</label>
              <textarea
                className="w-full h-24 p-2 border rounded font-mono text-sm"
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder='{"Authorization": "Bearer token"}'
              />
            </div>

            <button
              onClick={testEndpoint}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '请求中...' : '发送请求'}
            </button>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">响应结果</h3>
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded">
                <h4 className="font-semibold text-red-800">错误</h4>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {responseData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold">状态码:</span>
                    <span className={responseData.status >= 200 && responseData.status < 300 ? 'text-green-600' : 'text-red-600'}>
                      {' '}{responseData.status} {responseData.statusText}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">响应头</h4>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(responseData.headers, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">响应数据</h4>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto max-h-64">
                    {JSON.stringify(responseData.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {!responseData && !error && (
              <div className="text-center py-8 text-gray-500">
                点击"发送请求"按钮测试API
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

      const endpointPagePath = path.join(endpointDir, 'page.tsx');
      fs.writeFileSync(endpointPagePath, endpointContent);
      console.log(`📄 端点测试页面已生成: ${endpointPagePath}`);
    }
  }
}

// 主函数
async function main() {
  const generator = new ApiTestPageGenerator();
  await generator.generateTestPage();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ApiTestPageGenerator };