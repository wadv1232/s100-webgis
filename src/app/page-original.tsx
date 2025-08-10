'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { USER_SCENARIOS } from '@/lib/auth/permissions'
import { 
  Globe, 
  Building, 
  Map, 
  Anchor, 
  Waves, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  Server,
  Settings,
  Activity,
  Search,
  Code,
  FolderOpen,
  Ship,
  Navigation,
  Radio,
  Shield,
  Zap,
  Eye,
  TrendingUp,
  Star,
  LogIn,
  FileText,
  Terminal,
  Download
} from 'lucide-react'
import { homeMockNodes, s100Products, systemStatus } from '@/mock-data'

// 颜色映射函数
const getColorClass = (color: string, type: 'text' | 'bg' | 'border' = 'text', shade: number = 600) => {
  const colorMap: Record<string, string> = {
    blue: type === 'text' ? 'text-blue-600' : type === 'bg' ? 'bg-blue-600' : 'border-blue-600',
    green: type === 'text' ? 'text-green-600' : type === 'bg' ? 'bg-green-600' : 'border-green-600',
    red: type === 'text' ? 'text-red-600' : type === 'bg' ? 'bg-red-600' : 'border-red-600',
    yellow: type === 'text' ? 'text-yellow-600' : type === 'bg' ? 'bg-yellow-600' : 'border-yellow-600',
    purple: type === 'text' ? 'text-purple-600' : type === 'bg' ? 'bg-purple-600' : 'border-purple-600',
    orange: type === 'text' ? 'text-orange-600' : type === 'bg' ? 'bg-orange-600' : 'border-orange-600',
    indigo: type === 'text' ? 'text-indigo-600' : type === 'bg' ? 'bg-indigo-600' : 'border-indigo-600',
    gray: type === 'text' ? 'text-gray-600' : type === 'bg' ? 'bg-gray-600' : 'border-gray-600',
  }
  return colorMap[color] || colorMap.blue
}

const getOpacityColorClass = (color: string, shade: number = 500) => {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    indigo: 'text-indigo-500',
    gray: 'text-gray-500',
  }
  return colorMap[color] || colorMap.blue
}

// 快速操作卡片
const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color = "blue",
  badge 
}: {
  title: string
  description: string
  icon: any
  href: string
  color?: string
  badge?: string
}) => (
  <Link href={href}>
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-200 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Icon className={`h-8 w-8 ${getColorClass(color)}`} />
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" className="w-full">
          进入 <Zap className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  </Link>
)

// 系统状态卡片
const StatusCard = ({ title, value, trend, icon: Icon, color = "green" }: {
  title: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  icon: any
  color?: string
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
              <span className={`text-xs ml-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                {trend === 'up' ? '+12%' : trend === 'down' ? '-5%' : '0%'}
              </span>
            </div>
          )}
        </div>
        <Icon className={`h-12 w-12 ${getOpacityColorClass(color)} opacity-20`} />
      </div>
    </CardContent>
  </Card>
)

export default function Home() {
  const { user } = useAuth()
  const [selectedNode, setSelectedNode] = useState(homeMockNodes[0])

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'WARNING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <Badge variant="default" className="bg-green-500">健康</Badge>
      case 'WARNING':
        return <Badge variant="secondary">警告</Badge>
      case 'ERROR':
        return <Badge variant="destructive">错误</Badge>
      default:
        return <Badge variant="outline">离线</Badge>
    }
  }

  const getNodeTypeName = (type: string) => {
    switch (type) {
      case 'GLOBAL_ROOT':
        return '全球根节点'
      case 'NATIONAL':
        return '国家级节点'
      case 'REGIONAL':
        return '区域节点'
      case 'LEAF':
        return '叶子节点'
      default:
        return '未知类型'
    }
  }

  // 根据用户角色获取适合的场景
  const getRelevantScenarios = () => {
    if (!user) {
      // 游客只看到航海导航场景
      return USER_SCENARIOS.filter(s => s.targetRoles.includes('GUEST'))
    }
    
    switch (user.role) {
      case 'ADMIN':
        // 系统管理员可以看到所有场景
        return USER_SCENARIOS
      case 'NODE_ADMIN':
        // 节点管理员看到航海导航、数据发布、区域监控场景
        return USER_SCENARIOS.filter(s => 
          ['航海导航', '数据发布', '区域监控'].includes(s.name)
        )
      case 'DATA_MANAGER':
        // 数据管理员看到航海导航、数据发布场景
        return USER_SCENARIOS.filter(s => 
          ['航海导航', '数据发布'].includes(s.name)
        )
      case 'SERVICE_MANAGER':
        // 服务管理员看到航海导航、服务维护场景
        return USER_SCENARIOS.filter(s => 
          ['航海导航', '服务维护'].includes(s.name)
        )
      case 'DEVELOPER':
        // 开发者看到航海导航、应用开发场景
        return USER_SCENARIOS.filter(s => 
          ['航海导航', '应用开发'].includes(s.name)
        )
      case 'USER':
        // 普通用户只看到航海导航场景
        return USER_SCENARIOS.filter(s => s.name === '航海导航')
      default:
        // 默认只显示航海导航场景
        return USER_SCENARIOS.filter(s => s.name === '航海导航')
    }
  }

  const relevantScenarios = getRelevantScenarios()

  // 获取用户快速操作
  const getUserQuickActions = () => {
    if (!user) {
      return [
        {
          title: '浏览地图服务',
          description: '查看S-100海事数据地图服务',
          icon: Map,
          href: '/map-services',
          color: 'blue'
        },
        {
          title: '了解系统架构',
          description: '了解海事服务平台架构',
          icon: Globe,
          href: '#overview',
          color: 'green'
        },
        {
          title: '用户登录',
          description: '登录以获得更多功能权限',
          icon: LogIn,
          href: '#',
          color: 'purple'
        }
      ]
    }

    // 基于角色的快速操作
    const roleActions = {
      ADMIN: [
        {
          title: '系统管理',
          description: '用户管理、节点配置、系统监控',
          icon: Settings,
          href: '/users',
          color: 'purple'
        },
        {
          title: '服务管理',
          description: '管理S-101、S-102等海事数据服务',
          icon: Settings,
          href: '/services',
          color: 'blue'
        },
        {
          title: '增强地图编辑器',
          description: '基于 Leaflet + leaflet-draw 的 GIS 编辑工具',
          icon: Map,
          href: '/enhanced-map',
          color: 'green'
        },
        {
          title: '节点地理分布',
          description: '节点几何信息编辑（点、多边形、矩形）',
          icon: Map,
          href: '/node-map-enhanced',
          color: 'blue'
        },
        {
          title: '节点管理',
          description: '管理网络节点和层级结构',
          icon: Settings,
          href: '/nodes',
          color: 'orange'
        },
        {
          title: '合规监控',
          description: '服务能力合规状态监控',
          icon: Shield,
          href: '/compliance-dashboard',
          color: 'red'
        }
      ],
      NODE_ADMIN: [
        {
          title: '区域管理',
          description: '管理区域内节点和数据服务',
          icon: Map,
          href: '/nodes',
          color: 'orange'
        },
        {
          title: '服务管理',
          description: '管理S-101、S-102等海事数据服务',
          icon: Settings,
          href: '/services',
          color: 'blue'
        },
        {
          title: '数据管理',
          description: '管理海事数据集和服务',
          icon: Database,
          href: '/datasets',
          color: 'green'
        },
        {
          title: '服务监控',
          description: '监控服务健康状态和性能',
          icon: Activity,
          href: '/monitoring',
          color: 'blue'
        }
      ],
      DATA_MANAGER: [
        {
          title: '数据管理',
          description: '上传、发布和管理海事数据集',
          icon: Database,
          href: '/datasets',
          color: 'green'
        },
        {
          title: '服务管理',
          description: '管理S-101、S-102等海事数据服务',
          icon: Settings,
          href: '/services',
          color: 'blue'
        },
        {
          title: '地图服务',
          description: '查看和使用地图服务',
          icon: Map,
          href: '/map-services',
          color: 'blue'
        },
        {
          title: '数据质量',
          description: '监控数据质量和完整性',
          icon: Activity,
          href: '/monitoring',
          color: 'purple'
        }
      ],
      SERVICE_MANAGER: [
        {
          title: '服务管理',
          description: '管理S-101、S-102等海事数据服务',
          icon: Settings,
          href: '/services',
          color: 'blue'
        },
        {
          title: '能力管理',
          description: '管理节点服务能力',
          href: '/capabilities',
          color: 'green'
        },
        {
          title: 'API测试',
          description: '测试和验证API服务',
          icon: Code,
          href: '/api-test-console',
          color: 'purple'
        }
      ],
      DEVELOPER: [
        {
          title: '开发者门户',
          description: 'API文档、外部API、内部API和开发工具',
          icon: Code,
          href: '/developer',
          color: 'indigo'
        },
        {
          title: '增强地图编辑器',
          description: '基于 Leaflet + leaflet-draw 的 GIS 编辑工具',
          icon: Map,
          href: '/enhanced-map',
          color: 'green'
        },
        {
          title: '节点地理分布',
          description: '节点几何信息编辑（点、多边形、矩形）',
          icon: Map,
          href: '/node-map-enhanced',
          color: 'blue'
        },
        {
          title: 'API测试控制台',
          description: '在线API测试和调试',
          icon: Terminal,
          href: '/api-test-console',
          color: 'green'
        }
      ],
      USER: [
        {
          title: '地图服务',
          description: '查看S-100海事数据地图',
          icon: Map,
          href: '/map-services',
          color: 'blue'
        },
        {
          title: '数据浏览',
          description: '浏览可用的海事数据集',
          icon: Database,
          href: '/datasets',
          color: 'green'
        },
        {
          title: '服务查询',
          description: '查询可用的数据服务',
          href: '/capabilities',
          color: 'purple'
        }
      ]
    }

    const baseActions = [
      {
        title: '地图服务',
        description: '底图 + S100服务叠加呈现',
        icon: Map,
        href: '/map-services',
        color: 'blue'
      }
    ]

    // 根据用户角色添加特定操作
    const userRole = user.role as keyof typeof roleActions
    if (roleActions[userRole]) {
      return [...baseActions, ...roleActions[userRole]]
    }

    return baseActions
  }

  const quickActions = getUserQuickActions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto space-y-8 p-4 pt-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Globe className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            S-100海事服务平台
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-6">
            基于分层递归架构的全球海事数据服务网络，为终端用户提供统一、可靠的海事信息访问入口
          </p>
          
          {/* 用户信息 */}
          <div className="flex justify-center items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm px-4 py-2">
                  <Users className="h-4 w-4 mr-2" />
                  欢迎，{user.name || user.username}
                </Badge>
                <Badge className="text-sm px-4 py-2 bg-blue-600">
                  {user.role === 'ADMIN' ? '系统管理员' :
                   user.role === 'NODE_ADMIN' ? '节点管理员' :
                   user.role === 'DATA_MANAGER' ? '数据管理员' :
                   user.role === 'SERVICE_MANAGER' ? '服务管理员' :
                   user.role === 'DEVELOPER' ? '开发者' :
                   user.role === 'USER' ? '普通用户' : '游客'}
                </Badge>
              </div>
            ) : (
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Eye className="h-4 w-4 mr-2" />
                游客模式
              </Badge>
            )}
          </div>
        </div>

        {/* 系统状态概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatusCard
            title="在线节点"
            value={systemStatus.onlineNodes}
            trend="up"
            icon={Server}
            color="green"
          />
          <StatusCard
            title="活跃服务"
            value={systemStatus.activeServices}
            trend="up"
            icon={Activity}
            color="blue"
          />
          <StatusCard
            title="数据集"
            value={systemStatus.datasets}
            trend="stable"
            icon={Database}
            color="purple"
          />
          <StatusCard
            title="系统健康度"
            value={systemStatus.systemHealth}
            trend="up"
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* 主要内容区域 - 基于用户角色显示不同内容 */}
        {user ? (
          // 已登录用户看到简化的界面
          <div className="space-y-6">
            {/* 欢迎信息和快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  欢迎回来，{user.name || user.username}！
                </CardTitle>
                <CardDescription>
                  根据您的角色为您推荐的功能和操作
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <QuickActionCard
                      key={index}
                      title={action.title}
                      description={action.description}
                      icon={action.icon}
                      href={action.href}
                      color={action.color}
                      badge={action.badge}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 用户场景推荐 - 只在有相关场景时显示 */}
            {relevantScenarios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    推荐场景
                  </CardTitle>
                  <CardDescription>
                    基于您的角色推荐的使用场景
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relevantScenarios.map((scenario, index) => {
                    const ScenarioIcon = {
                      Anchor: Ship,
                      Database: Database,
                      Map: Navigation,
                      Settings: Shield,
                      Activity: Radio,
                      Code: Code
                    }[scenario.icon || 'Anchor'] || Ship
                    
                    return (
                      <Card key={index} className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <ScenarioIcon className={`h-8 w-8 ${getColorClass(scenario.color)}`} />
                            <Star className={`h-5 w-5 ${getOpacityColorClass(scenario.color)} fill-current`} />
                          </div>
                          <CardTitle className="text-xl">{scenario.name}</CardTitle>
                          <CardDescription className="text-sm">{scenario.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">核心权限:</div>
                              <div className="flex flex-wrap gap-1">
                                {scenario.permissions.slice(0, 3).map((permission, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {permission.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                                {scenario.permissions.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{scenario.permissions.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {scenario.actions.map((action, actionIndex) => (
                                <Link key={actionIndex} href={action.href}>
                                  <Button variant="outline" size="sm" className="w-full">
                                    {action.title}
                                  </Button>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            )}

            {/* 系统状态概览 - 管理员用户看到 */}
            {(user.role === 'ADMIN' || user.role === 'NODE_ADMIN' || user.role === 'SERVICE_MANAGER') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    系统状态概览
                  </CardTitle>
                  <CardDescription>
                    实时系统运行状态和服务健康度
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatusCard
                      title="在线节点"
                      value="4/4"
                      trend="up"
                      icon={Server}
                      color="green"
                    />
                    <StatusCard
                      title="活跃服务"
                      value="24"
                      trend="up"
                      icon={Activity}
                      color="blue"
                    />
                    <StatusCard
                      title="数据集"
                      value="156"
                      trend="stable"
                      icon={Database}
                      color="purple"
                    />
                    <StatusCard
                      title="系统健康度"
                      value="98%"
                      trend="up"
                      icon={CheckCircle}
                      color="green"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // 未登录用户看到简化的游客界面
          <div className="space-y-6">
            {/* 主要功能介绍 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={index}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  href={action.href}
                  color={action.color}
                  badge={action.badge}
                />
              ))}
            </div>

            {/* 游客推荐场景 */}
            {relevantScenarios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    推荐场景
                  </CardTitle>
                  <CardDescription>
                    为游客推荐的使用场景
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relevantScenarios.map((scenario, index) => {
                      const ScenarioIcon = {
                        Anchor: Ship,
                        Database: Database,
                        Map: Navigation,
                        Settings: Shield,
                        Activity: Radio,
                        Code: Code
                      }[scenario.icon || 'Anchor'] || Ship
                      
                      return (
                        <Card key={index} className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <ScenarioIcon className={`h-8 w-8 ${getColorClass(scenario.color)}`} />
                              <Star className={`h-5 w-5 ${getOpacityColorClass(scenario.color)} fill-current`} />
                            </div>
                            <CardTitle className="text-xl">{scenario.name}</CardTitle>
                            <CardDescription className="text-sm">{scenario.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-2">核心权限:</div>
                                <div className="flex flex-wrap gap-1">
                                  {scenario.permissions.slice(0, 3).map((permission, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {permission.replace(/_/g, ' ')}
                                    </Badge>
                                  ))}
                                  {scenario.permissions.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{scenario.permissions.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {scenario.actions.map((action, actionIndex) => (
                                  <Link key={actionIndex} href={action.href}>
                                    <Button variant="outline" size="sm" className="w-full">
                                      {action.title}
                                    </Button>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 系统概览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  系统概览
                </CardTitle>
                <CardDescription>
                  S-100海事服务平台架构和功能介绍
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 架构可视化 */}
                  <div>
                    <h4 className="font-medium mb-3">分层架构</h4>
                    <div className="space-y-3">
                      {homeMockNodes.slice(0, 3).map((node, index) => (
                        <div key={node.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <div className="flex-shrink-0">
                            {node.type === 'GLOBAL_ROOT' && <Globe className="h-6 w-6 text-blue-600" />}
                            {node.type === 'NATIONAL' && <Building className="h-6 w-6 text-green-600" />}
                            {node.type === 'REGIONAL' && <Map className="h-6 w-6 text-orange-600" />}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{node.name}</h5>
                            <p className="text-sm text-gray-600">{getNodeTypeName(node.type)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getHealthIcon(node.healthStatus)}
                            {getHealthBadge(node.healthStatus)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* S-100 Products */}
                  <div>
                    <h4 className="font-medium mb-3">S-100产品系列</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {s100Products.slice(0, 4).map((product) => (
                        <div key={product.code} className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-2">
                            <product.icon className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{product.code}</span>
                          </div>
                          <h5 className="text-sm font-medium">{product.name}</h5>
                          <p className="text-xs text-gray-600 mt-1">{product.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}