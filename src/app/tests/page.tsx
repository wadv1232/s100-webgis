'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Github, TestTube } from 'lucide-react'
import Link from 'next/link'

export default function TestsPage() {
  const testPages = [
    {
      title: '节点地图测试',
      description: '测试SharedMap组件在节点管理中的功能，包括单个节点和多个节点的地图显示',
      path: '/tests/test-node-map',
      icon: <TestTube className="h-5 w-5" />
    },
    {
      title: 'API测试控制台',
      description: '测试各种API端点的功能和响应',
      path: '/tests/api-test-console',
      icon: <Github className="h-5 w-5" />
    },
    {
      title: '坐标系统测试',
      description: '测试地图坐标系统和坐标转换功能',
      path: '/tests/test-coordinates',
      icon: <TestTube className="h-5 w-5" />
    },
    {
      title: '地图功能测试',
      description: '测试基础地图功能和交互',
      path: '/tests/test-map',
      icon: <TestTube className="h-5 w-5" />
    },
    {
      title: '地图配置测试',
      description: '测试地图配置和样式设置',
      path: '/tests/test-map-config',
      icon: <TestTube className="h-5 w-5" />
    },
    {
      title: '简化地图测试',
      description: '测试简化版本的地图功能',
      path: '/tests/test-map-simple',
      icon: <TestTube className="h-5 w-5" />
    },
    {
      title: 'Tailwind样式测试',
      description: '测试Tailwind CSS样式和组件',
      path: '/tests/test-tailwind',
      icon: <TestTube className="h-5 w-5" />
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">测试页面中心</h1>
        <p className="text-muted-foreground">
          集中管理和访问所有测试页面，用于开发和调试过程中的功能验证
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testPages.map((test, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="text-blue-600">
                  {test.icon}
                </div>
                <CardTitle className="text-lg">{test.title}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {test.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={test.path}>
                <Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  打开测试页面
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-blue-700">
            <p>• 所有测试页面都集中在此管理，便于开发和调试</p>
            <p>• 测试页面仅用于开发环境，生产环境中应移除或限制访问</p>
            <p>• 每个测试页面专注于特定功能的验证和演示</p>
            <p>• 请定期清理和更新测试页面，确保其与当前功能保持同步</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}