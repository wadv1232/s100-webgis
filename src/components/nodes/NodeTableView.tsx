'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RefreshCw, Edit, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

// 节点类型枚举
const NODE_TYPES = {
  GLOBAL_ROOT: '全球根节点',
  NATIONAL: '国家级节点',
  REGIONAL: '区域节点',
  LEAF: '叶子节点'
}

// 健康状态枚举
const HEALTH_STATUS = {
  HEALTHY: { label: '健康', color: 'bg-green-500', icon: CheckCircle },
  WARNING: { label: '警告', color: 'bg-yellow-500', icon: AlertTriangle },
  ERROR: { label: '错误', color: 'bg-red-500', icon: XCircle },
  OFFLINE: { label: '离线', color: 'bg-gray-500', icon: CheckCircle }
}

interface Node {
  id: string
  code: string
  name: string
  type: string
  level: number
  description?: string
  apiUrl: string
  adminUrl?: string
  coverage?: string
  isActive: boolean
  healthStatus: string
  lastHealthCheck?: string
  parentId?: string
  parent?: Node
  children?: Node[]
  capabilities?: any[]
  _count?: {
    datasets: number
    childNodeRelations: number
  }
  location?: {
    lat: number
    lng: number
  }
}

interface NodeTableViewProps {
  nodes: Node[]
  loading: boolean
  selectedNode: Node | null
  onNodeSelect: (node: Node) => void
  onNodeEdit: (node: Node) => void
  onNodeDelete: (nodeId: string) => void
  onHealthCheck: (nodeId: string) => void
  onNodePublish: (nodeId: string) => void
  onNodeOffline: (nodeId: string) => void
  onPushServices: (nodeId: string) => void
}

export default function NodeTableView({
  nodes,
  loading,
  selectedNode,
  onNodeSelect,
  onNodeEdit,
  onNodeDelete,
  onHealthCheck,
  onNodePublish,
  onNodeOffline,
  onPushServices
}: NodeTableViewProps) {
  // 获取节点图标
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'GLOBAL_ROOT':
        return <CheckCircle className="h-5 w-5" />
      case 'NATIONAL':
        return <AlertTriangle className="h-5 w-5" />
      case 'REGIONAL':
        return <XCircle className="h-5 w-5" />
      case 'LEAF':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <CheckCircle className="h-5 w-5" />
    }
  }

  // 获取健康状态徽章
  const getHealthBadge = (status: string) => {
    const healthInfo = HEALTH_STATUS[status as keyof typeof HEALTH_STATUS]
    if (!healthInfo) return <Badge variant="outline">未知</Badge>
    
    return (
      <Badge variant="outline" className={`${healthInfo.color} text-white`}>
        {healthInfo.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>节点</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>数据集</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node) => (
          <TableRow 
            key={node.id} 
            className={selectedNode?.id === node.id ? 'bg-blue-50' : ''}
          >
            <TableCell>
              <div className="flex items-center gap-2">
                {getNodeIcon(node.type)}
                <div>
                  <div className="font-medium">{node.name}</div>
                  <div className="text-sm text-gray-500">
                    {node.code} • 层级 {node.level}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {NODE_TYPES[node.type as keyof typeof NODE_TYPES]}
              </Badge>
            </TableCell>
            <TableCell>
              {getHealthBadge(node.healthStatus)}
            </TableCell>
            <TableCell>
              {node._count?.datasets || 0}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onNodeSelect(node)
                  }}
                >
                  查看
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onHealthCheck(node.id)}
                  title="健康检查"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                {node.isActive ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNodeOffline(node.id)}
                    title="下线节点"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNodePublish(node.id)}
                    title="发布节点"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                {node.level > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPushServices(node.id)}
                    title="向上推送服务"
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNodeEdit(node)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNodeDelete(node.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}