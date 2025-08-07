'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Settings, 
  Database, 
  Map, 
  Activity, 
  Waves,
  Users,
  LogOut,
  User,
  Code,
  Globe
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Navbar() {
  const pathname = usePathname()
  const { user, login, logout, getAccessibleMenuItems } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const accessibleMenuItems = getAccessibleMenuItems()

  const handleLogin = async () => {
    setIsLoading(true)
    const success = await login(loginForm.email, loginForm.password)
    if (success) {
      setIsLoginOpen(false)
      setLoginForm({ email: '', password: '' })
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center">
            <Globe className="h-12 w-12 text-blue-600" />
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          {accessibleMenuItems.map((item) => {
            const isActive = pathname === item.href
            // 动态导入图标
            const IconComponent = {
              Home, Settings, Database, Map, Activity, Waves, Users, Code
            }[item.icon] || Home
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center space-x-2",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center space-x-2">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.name || user.username}</span>
                <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                  {user.role}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                退出
              </Button>
            </div>
          ) : (
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  登录
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>用户登录</DialogTitle>
                  <DialogDescription>
                    请输入您的邮箱和密码登录系统
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="请输入邮箱"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="请输入密码"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>测试账号：</p>
                    <p>管理员: admin@example.com / password</p>
                    <p>节点管理员: node-admin@example.com / password</p>
                    <p>数据管理员: data-manager@example.com / password</p>
                    <p>开发者: developer@ecdis-company.com / password</p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsLoginOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleLogin} disabled={isLoading}>
                      {isLoading ? '登录中...' : '登录'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </nav>
  )
}