'use client'

import { ReactNode } from 'react'
import SidebarNavigation from './SidebarNavigation'
import BreadcrumbNavigation from './BreadcrumbNavigation'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/lib/i18n/hooks'
import ThemeToggle from './ThemeToggle'

interface MainLayoutProps {
  children: ReactNode
  className?: string
  showSidebar?: boolean
  showBreadcrumb?: boolean
  sidebarProps?: {
    collapsible?: boolean
  }
  breadcrumbProps?: {
    items?: Array<{
      label: string
      href?: string
      icon?: React.ReactNode
    }>
    showHome?: boolean
  }
}

export default function MainLayout({
  children,
  className,
  showSidebar = true,
  showBreadcrumb = true,
  sidebarProps = {},
  breadcrumbProps = {}
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      {showSidebar && (
        <SidebarNavigation {...sidebarProps} />
      )}
      
      {/* 主内容区域 */}
      <div className={cn(
        'transition-all duration-300',
        showSidebar ? 'lg:ml-80' : 'lg:ml-0',
        sidebarProps.collapsible !== false && 'lg:ml-16'
      )}>
        {/* 顶部导航栏 */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* 面包屑导航 */}
              <div className="flex-1">
                {showBreadcrumb && (
                  <BreadcrumbNavigation {...breadcrumbProps} />
                )}
              </div>
              
              {/* 右侧操作区域 */}
              <div className="flex items-center space-x-4">
                {/* 语言切换器 */}
                <LanguageSwitcher />
                
                {/* 主题切换器 */}
                <ThemeToggle />
                
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="text-sm text-gray-500">
                  S-100 海事服务平台
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* 页面内容 */}
        <main className={cn('p-4 sm:p-6 lg:p-8', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}