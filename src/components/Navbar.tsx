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
  Globe,
  Shield,
  ChevronDown,
  Bell,
  Settings as SettingsIcon
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import ThemeToggle from '@/components/ThemeToggle'

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

  // 获取角色图标
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />
      case 'NODE_ADMIN':
        return <Globe className="h-4 w-4" />
      case 'DATA_MANAGER':
        return <Database className="h-4 w-4" />
      case 'SERVICE_MANAGER':
        return <Settings className="h-4 w-4" />
      case 'DEVELOPER':
        return <Code className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  // 获取角色名称
  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '系统管理员'
      case 'NODE_ADMIN':
        return '节点管理员'
      case 'DATA_MANAGER':
        return '数据管理员'
      case 'SERVICE_MANAGER':
        return '服务管理员'
      case 'DEVELOPER':
        return '开发者'
      case 'USER':
        return '普通用户'
      case 'GUEST':
        return '游客'
      default:
        return '未知角色'
    }
  }

  // 获取角色颜色
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'NODE_ADMIN':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'DATA_MANAGER':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'SERVICE_MANAGER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'DEVELOPER':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

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
    <nav className="bg-background border-b border-border px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Globe className="h-12 w-12 text-blue-600" />
          </Link>
        </div>
        
        {/* Navigation Menu */}
        <div className="flex items-center space-x-1 flex-1 justify-center overflow-x-auto">
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
                    "flex items-center space-x-2 whitespace-nowrap min-w-fit",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                  <span className="sm:hidden">{item.name.replace('管理', '').replace('服务', '')}</span>
                </Button>
              </Link>
            )
          })}
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Theme Toggle */}
          <ThemeToggle variant="outline" size="icon" className="h-9 w-9" />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name || user.username} />
                    <AvatarFallback className="text-xs">
                      {(user.name || user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {user.name || user.username}
                      </p>
                      {getRoleIcon(user.role)}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <Badge variant="outline" className={`text-xs w-fit ${getRoleColor(user.role)}`}>
                      {getRoleName(user.role)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>个人资料</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>账户设置</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>通知设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hover:bg-muted">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">登录</span>
                  <span className="sm:hidden">登录</span>
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
                      className="mt-1"
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
                      className="mt-1"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">测试账号：</p>
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