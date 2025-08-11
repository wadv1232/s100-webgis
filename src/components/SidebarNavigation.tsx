'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Users, 
  Database, 
  Settings, 
  Map, 
  Activity,
  Anchor,
  Code,
  Shield,
  Globe,
  Building,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/lib/i18n/hooks'
import { LanguageSwitcher } from '@/lib/i18n/hooks'

interface NavItem {
  titleKey: string
  href: string
  icon: React.ReactNode
  descriptionKey?: string
  badge?: string
  roles?: string[]
  children?: NavItem[]
}

interface SidebarNavigationProps {
  className?: string
  collapsible?: boolean
}

const navigationItems: NavItem[] = [
  {
    titleKey: 'navigation.home',
    href: '/',
    icon: <Home className="h-5 w-5" />,
    descriptionKey: '系统概览和快速操作',
    roles: ['ALL']
  },
  {
    titleKey: 'navigation.mapServices',
    href: '/map-services',
    icon: <Map className="h-5 w-5" />,
    descriptionKey: 'S-100海事数据地图服务',
    roles: ['ALL']
  },
  {
    titleKey: 'navigation.services',
    href: '#',
    icon: <Settings className="h-5 w-5" />,
    descriptionKey: '用户、节点和服务管理',
    roles: ['ADMIN', 'NODE_ADMIN'],
    children: [
      {
        titleKey: 'navigation.users',
        href: '/users',
        icon: <Users className="h-4 w-4" />,
        descriptionKey: '管理系统用户和权限',
        roles: ['ADMIN']
      },
      {
        titleKey: 'navigation.nodes',
        href: '/nodes',
        icon: <Globe className="h-4 w-4" />,
        descriptionKey: '管理网络节点和层级结构',
        roles: ['ADMIN', 'NODE_ADMIN']
      },
      {
        titleKey: 'navigation.services',
        href: '/services',
        icon: <Settings className="h-4 w-4" />,
        descriptionKey: '管理S-100数据服务',
        roles: ['ADMIN', 'NODE_ADMIN', 'SERVICE_MANAGER']
      }
    ]
  },
  {
    titleKey: 'navigation.datasets',
    href: '#',
    icon: <Database className="h-5 w-5" />,
    descriptionKey: '数据集上传和管理',
    roles: ['ADMIN', 'NODE_ADMIN', 'DATA_MANAGER'],
    children: [
      {
        titleKey: 'navigation.datasets',
        href: '/datasets',
        icon: <Database className="h-4 w-4" />,
        descriptionKey: '上传和管理海事数据集',
        roles: ['ADMIN', 'NODE_ADMIN', 'DATA_MANAGER']
      }
    ]
  },
  {
    titleKey: '导航.地图工具',
    href: '#',
    icon: <Map className="h-5 w-5" />,
    descriptionKey: 'GIS编辑和可视化工具',
    roles: ['ADMIN', 'DEVELOPER', 'DATA_MANAGER'],
    children: [
      {
        titleKey: 'navigation.enhancedMap',
        href: '/enhanced-map',
        icon: <Map className="h-4 w-4" />,
        descriptionKey: '基于Leaflet的GIS编辑工具',
        roles: ['ADMIN', 'DEVELOPER']
      },
      {
        titleKey: 'navigation.nodeMapEnhanced',
        href: '/node-map-enhanced',
        icon: <Globe className="h-4 w-4" />,
        descriptionKey: '节点几何信息编辑',
        roles: ['ADMIN', 'DEVELOPER']
      }
    ]
  },
  {
    titleKey: 'navigation.monitoring',
    href: '/monitoring',
    icon: <Activity className="h-5 w-5" />,
    descriptionKey: '系统健康状态监控',
    roles: ['ADMIN', 'NODE_ADMIN', 'SERVICE_MANAGER']
  },
  {
    titleKey: 'navigation.developer',
    href: '#',
    icon: <Code className="h-5 w-5" />,
    descriptionKey: 'API和开发工具',
    roles: ['ADMIN', 'DEVELOPER'],
    children: [
      {
        titleKey: 'navigation.developer',
        href: '/developer',
        icon: <Code className="h-4 w-4" />,
        descriptionKey: 'API文档和开发工具',
        roles: ['ADMIN', 'DEVELOPER']
      },
      {
        titleKey: 'navigation.apiTestConsole',
        href: '/api-test-console',
        icon: <Code className="h-4 w-4" />,
        descriptionKey: '在线API测试工具',
        roles: ['ADMIN', 'DEVELOPER']
      }
    ]
  },
  {
    titleKey: 'navigation.complianceDashboard',
    href: '/compliance-dashboard',
    icon: <Shield className="h-5 w-5" />,
    descriptionKey: '服务能力合规状态监控',
    roles: ['ADMIN']
  }
]

export default function SidebarNavigation({ 
  className, 
  collapsible = true 
}: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const { t } = useI18n()

  // 检查用户是否有权限访问某个项目
  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.includes('ALL')) return true
    if (!user) return false
    return roles.includes(user.role)
  }

  // 切换展开/折叠状态
  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  // 检查当前路径是否匹配
  const isActive = (href: string) => {
    if (href === '#') return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  // 渲染导航项
  const renderNavItem = (item: NavItem, level = 0) => {
    if (!hasAccess(item.roles)) return null

    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.title)
    const active = isActive(item.href)

    if (level === 0) {
      return (
        <div key={item.title} className="mb-1">
          <Link
            href={hasChildren ? '#' : item.href}
            onClick={hasChildren ? (e) => {
              e.preventDefault()
              toggleExpanded(item.title)
            } : undefined}
            className={cn(
              'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
              'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
              active && 'bg-blue-50 text-blue-700 hover:bg-blue-100',
              isCollapsed && 'justify-center px-3'
            )}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-current={active ? 'page' : undefined}
          >
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{t(item.titleKey)}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {!isCollapsed && item.descriptionKey && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {item.descriptionKey}
                    </p>
                  )}
                </div>
                
                {hasChildren && (
                  <ChevronRight 
                    className={cn(
                      'h-4 w-4 text-gray-400 transition-transform duration-200',
                      isExpanded && 'rotate-90'
                    )} 
                  />
                )}
              </>
            )}
          </Link>

          {hasChildren && isExpanded && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map(child => (
                <div key={child.href}>
                  {renderNavItem(child, level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    } else {
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200',
            'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
            active && 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          )}
          aria-current={active ? 'page' : undefined}
        >
          <div className="flex-shrink-0">
            {item.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{t(item.titleKey)}</span>
          </div>
          
          {item.badge && (
            <Badge variant="outline" className="text-xs">
              {item.badge}
            </Badge>
          )}
        </Link>
      )
    }
  }

  return (
    <>
      {/* 移动端遮罩 */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* 侧边栏 */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300',
          'flex flex-col',
          isCollapsed ? 'w-16' : 'w-80',
          'lg:relative lg:z-auto',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <Anchor className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">S-100</h1>
                <p className="text-xs text-gray-500">海事服务平台</p>
              </div>
            </div>
          ) : (
            <Anchor className="h-8 w-8 text-blue-600 mx-auto" />
          )}
          
          <div className="flex items-center space-x-2">
            {/* 语言切换器 */}
            {!isCollapsed && (
              <LanguageSwitcher variant="button" className="text-xs" />
            )}
            
            {/* 移动端关闭按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* 折叠按钮 */}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map(item => renderNavItem(item))}
        </nav>

        {/* 底部用户信息 */}
        {!isCollapsed && user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role === 'ADMIN' ? '系统管理员' :
                   user.role === 'NODE_ADMIN' ? '节点管理员' :
                   user.role === 'DATA_MANAGER' ? '数据管理员' :
                   user.role === 'SERVICE_MANAGER' ? '服务管理员' :
                   user.role === 'DEVELOPER' ? '开发者' :
                   user.role === 'USER' ? '普通用户' : '游客'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 移动端菜单按钮 */}
      <div className="fixed bottom-4 left-4 z-30 lg:hidden">
        <Button
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="shadow-lg"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}