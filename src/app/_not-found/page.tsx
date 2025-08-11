import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search, Settings } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">页面未找到</CardTitle>
          <CardDescription>
            抱歉，您访问的页面不存在或已被移动。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/map-services">
                <Search className="w-4 h-4 mr-2" />
                浏览地图服务
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/developer">
                <Settings className="w-4 h-4 mr-2" />
                开发者中心
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>如果您认为这是一个错误，请联系系统管理员。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}