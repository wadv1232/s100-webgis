'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

// 默认面包屑配置
const getDefaultBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const pathSegments = pathname.split('/').filter(Boolean)
  
  const breadcrumbs: BreadcrumbItem[] = []
  
  // 构建面包屑路径
  pathSegments.forEach((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`
    const isLast = index === pathSegments.length - 1
    
    // 根据路径段生成标签
    let label = segment
    switch (segment) {
      case 'users':
        label = '用户管理'
        break
      case 'datasets':
        label = '数据集管理'
        break
      case 'services':
        label = '服务管理'
        break
      case 'nodes':
        label = '节点管理'
        break
      case 'monitoring':
        label = '系统监控'
        break
      case 'enhanced-map':
        label = '地图编辑器'
        break
      case 'map-services':
        label = '地图服务'
        break
      case 'developer':
        label = '开发者门户'
        break
      case 'api-test-console':
        label = 'API测试'
        break
      case 'compliance-dashboard':
        label = '合规监控'
        break
      case 'node-map-enhanced':
        label = '节点地理分布'
        break
      default:
        label = segment.charAt(0).toUpperCase() + segment.slice(1)
    }
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : href
    })
  })
  
  return breadcrumbs
}

export default function BreadcrumbNavigation({ 
  items, 
  className, 
  showHome = true 
}: BreadcrumbNavigationProps) {
  const pathname = usePathname()
  const breadcrumbs = items || getDefaultBreadcrumbs(pathname)
  
  // 如果是首页，不显示面包屑
  if (pathname === '/') {
    return null
  }
  
  return (
    <nav 
      aria-label="面包屑导航" 
      className={cn('flex items-center space-x-2 text-sm', className)}
    >
      {showHome && (
        <Link 
          href="/" 
          className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
          aria-label="返回首页"
        >
          <Home className="h-4 w-4" />
        </Link>
      )}
      
      {showHome && breadcrumbs.length > 0 && (
        <ChevronRight className="h-4 w-4 text-gray-400" />
      )}
      
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          
          {item.href ? (
            <Link 
              href={item.href}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center space-x-1 text-gray-900 font-medium">
              {item.icon && <span className="mr-1">{item.icon}</span>}
              <span>{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}