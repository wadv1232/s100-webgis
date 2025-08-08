'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Activity,
  Settings,
  RefreshCw,
  Filter,
  Download,
  Mail,
  Bell
} from 'lucide-react'

interface NodeCompliance {
  nodeId: string
  nodeName: string
  nodeType: string
  level: number
  requiredProducts: string[]
  actualProducts: string[]
  missingProducts: string[]
  isCompliant: boolean
  complianceScore: number
  lastChecked: string
  nextCheck: string
  healthStatus: string
  isActive: boolean
}

interface ComplianceSummary {
  totalNodes: number
  compliantNodes: number
  nonCompliantNodes: number
  unknownNodes: number
  overallComplianceRate: number
  criticalIssues: number
  warnings: number
  recommendations: string[]
}

const ComplianceDashboard = () => {
  const [complianceData, setComplianceData] = useState<NodeCompliance[]>([])
  const [summary, setSummary] = useState<ComplianceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'compliant' | 'non-compliant' | 'unknown'>('all')

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    setIsLoading(true)
    try {
      // 模拟API调用，实际应该从后端获取
      const mockData: NodeCompliance[] = [
        {
          nodeId: 'shanghai-port',
          nodeName: '上海港叶子节点',
          nodeType: 'LEAF',
          level: 3,
          requiredProducts: ['S101', 'S124'],
          actualProducts: ['S101', 'S102', 'S104', 'S124'],
          missingProducts: [],
          isCompliant: true,
          complianceScore: 100,
          lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          nextCheck: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          healthStatus: 'HEALTHY',
          isActive: true
        },
        {
          nodeId: 'ningbo-port',
          nodeName: '宁波港叶子节点',
          nodeType: 'LEAF',
          level: 3,
          requiredProducts: ['S101', 'S124'],
          actualProducts: ['S101'],
          missingProducts: ['S124'],
          isCompliant: false,
          complianceScore: 50,
          lastChecked: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          nextCheck: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
          healthStatus: 'HEALTHY',
          isActive: true
        },
        {
          nodeId: 'east-china-sea',
          nodeName: '东海分局区域节点',
          nodeType: 'REGIONAL',
          level: 2,
          requiredProducts: ['S101', 'S104', 'S124'],
          actualProducts: ['S101', 'S104'],
          missingProducts: ['S124'],
          isCompliant: false,
          complianceScore: 67,
          lastChecked: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          nextCheck: new Date(Date.now() + 23.5 * 60 * 60 * 1000).toISOString(),
          healthStatus: 'HEALTHY',
          isActive: true
        },
        {
          nodeId: 'cn-js-msa',
          nodeName: '江苏海事服务节点',
          nodeType: 'LEAF',
          level: 3,
          requiredProducts: ['S101', 'S124'],
          actualProducts: [],
          missingProducts: ['S101', 'S124'],
          isCompliant: false,
          complianceScore: 0,
          lastChecked: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          nextCheck: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
          healthStatus: 'WARNING',
          isActive: true
        }
      ]

      setComplianceData(mockData)

      // 计算汇总数据
      const totalNodes = mockData.length
      const compliantNodes = mockData.filter(n => n.isCompliant).length
      const nonCompliantNodes = mockData.filter(n => !n.isCompliant && n.missingProducts.length > 0).length
      const unknownNodes = totalNodes - compliantNodes - nonCompliantNodes
      const overallComplianceRate = Math.round((compliantNodes / totalNodes) * 100)
      const criticalIssues = mockData.filter(n => n.complianceScore === 0).length
      const warnings = mockData.filter(n => n.complianceScore > 0 && n.complianceScore < 100).length

      const recommendations = [
        '建议为江苏海事服务节点配置S101和S124服务',
        '宁波港节点需要添加S124航行警告服务',
        '东海分局区域节点应补充S124服务能力',
        '定期检查节点服务状态，确保服务可用性'
      ]

      setSummary({
        totalNodes,
        compliantNodes,
        nonCompliantNodes,
        unknownNodes,
        overallComplianceRate,
        criticalIssues,
        warnings,
        recommendations
      })

    } catch (error) {
      console.error('Error fetching compliance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getComplianceBadge = (isCompliant: boolean, score: number) => {
    if (isCompliant) {
      return <Badge className="bg-green-500">合规</Badge>
    } else if (score === 0) {
      return <Badge variant="destructive">严重不合规</Badge>
    } else {
      return <Badge variant="secondary">部分合规</Badge>
    }
  }

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <Badge className="bg-green-500">健康</Badge>
      case 'WARNING':
        return <Badge variant="secondary">警告</Badge>
      case 'ERROR':
        return <Badge variant="destructive">错误</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const filteredData = complianceData.filter(node => {
    switch (selectedFilter) {
      case 'compliant':
        return node.isCompliant
      case 'non-compliant':
        return !node.isCompliant
      case 'unknown':
        return node.complianceScore === 0
      default:
        return true
    }
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">加载合规数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">合规性监控仪表板</h1>
            <p className="text-muted-foreground">
              实时监控所有节点的服务能力合规状态，确保S-100服务网络的质量和可靠性
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchComplianceData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-1" />
              导出报告
            </Button>
          </div>
        </div>
      </div>

      {/* 汇总统计 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总体合规率</p>
                  <p className="text-2xl font-bold">{summary.overallComplianceRate}%</p>
                  <div className="flex items-center mt-1">
                    {summary.overallComplianceRate >= 80 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-xs ml-1 ${
                      summary.overallComplianceRate >= 80 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {summary.overallComplianceRate >= 80 ? '良好' : '需改进'}
                    </span>
                  </div>
                </div>
                <Shield className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">合规节点</p>
                  <p className="text-2xl font-bold text-green-600">{summary.compliantNodes}</p>
                  <p className="text-xs text-gray-500">共 {summary.totalNodes} 个节点</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">严重问题</p>
                  <p className="text-2xl font-bold text-red-600">{summary.criticalIssues}</p>
                  <p className="text-xs text-gray-500">需要立即处理</p>
                </div>
                <XCircle className="h-12 w-12 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">警告</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.warnings}</p>
                  <p className="text-xs text-gray-500">需要关注</p>
                </div>
                <AlertTriangle className="h-12 w-12 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 主要内容区域 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="nodes">节点详情</TabsTrigger>
          <TabsTrigger value="recommendations">改进建议</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 合规率趋势图 */}
          <Card>
            <CardHeader>
              <CardTitle>合规状态分布</CardTitle>
              <CardDescription>所有节点的合规性状态概览</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {summary?.compliantNodes || 0}
                    </div>
                    <div className="text-sm text-gray-600">合规节点</div>
                    <Progress value={(summary?.compliantNodes || 0) / (summary?.totalNodes || 1) * 100} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {summary?.warnings || 0}
                    </div>
                    <div className="text-sm text-gray-600">部分合规</div>
                    <Progress value={(summary?.warnings || 0) / (summary?.totalNodes || 1) * 100} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {summary?.criticalIssues || 0}
                    </div>
                    <div className="text-sm text-gray-600">严重不合规</div>
                    <Progress value={(summary?.criticalIssues || 0) / (summary?.totalNodes || 1) * 100} className="mt-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 产品类型合规性 */}
          <Card>
            <CardHeader>
              <CardTitle>产品类型合规性分析</CardTitle>
              <CardDescription>各S-100产品类型的合规情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['S101', 'S102', 'S104', 'S111', 'S124', 'S131'].map(product => {
                  const requiredNodes = complianceData.filter(n => n.requiredProducts.includes(product))
                  const compliantNodes = requiredNodes.filter(n => n.actualProducts.includes(product))
                  const complianceRate = requiredNodes.length > 0 ? Math.round((compliantNodes.length / requiredNodes.length) * 100) : 100

                  return (
                    <div key={product} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{product}</div>
                        <Badge variant="outline">{requiredNodes.length} 个节点需要</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{complianceRate}%</div>
                          <div className="text-xs text-gray-500">{compliantNodes.length}/{requiredNodes.length} 合规</div>
                        </div>
                        <Progress value={complianceRate} className="w-24" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nodes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>节点合规详情</CardTitle>
                  <CardDescription>每个节点的具体合规状态和服务能力</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedFilter} onValueChange={(value: any) => setSelectedFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="compliant">合规</SelectItem>
                      <SelectItem value="non-compliant">不合规</SelectItem>
                      <SelectItem value="unknown">未知</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.map(node => (
                  <div key={node.nodeId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{node.nodeName}</div>
                          <div className="text-sm text-gray-500">{node.nodeType} • Level {node.level}</div>
                        </div>
                        {getComplianceBadge(node.isCompliant, node.complianceScore)}
                        {getHealthBadge(node.healthStatus)}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{node.complianceScore}%</div>
                        <div className="text-xs text-gray-500">合规率</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-2">必需产品</div>
                        <div className="flex flex-wrap gap-1">
                          {node.requiredProducts.map(product => (
                            <Badge key={product} variant="outline" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">实际产品</div>
                        <div className="flex flex-wrap gap-1">
                          {node.actualProducts.map(product => (
                            <Badge key={product} className="text-xs bg-green-100 text-green-800">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {node.missingProducts.length > 0 && (
                      <Alert className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>缺失产品</AlertTitle>
                        <AlertDescription>
                          该节点缺少以下必需产品: {node.missingProducts.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <div>最后检查: {new Date(node.lastChecked).toLocaleString()}</div>
                      <div>下次检查: {new Date(node.nextCheck).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>改进建议</CardTitle>
              <CardDescription>基于合规性分析生成的系统改进建议</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.recommendations.map((recommendation, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>建议 #{index + 1}</AlertTitle>
                    <AlertDescription>{recommendation}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>自动化操作</CardTitle>
              <CardDescription>一键执行常见的合规性管理操作</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Mail className="h-6 w-6 mb-2" />
                  <span>发送合规提醒</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Bell className="h-6 w-6 mb-2" />
                  <span>设置告警规则</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  <span>配置检查策略</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ComplianceDashboard