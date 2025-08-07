'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Edit, Trash2, CheckCircle, XCircle, AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react'

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

interface NodeTreeViewProps {
  nodes: Node[]
  loading: boolean
  selectedNode: Node | null
  expandedNodes: Set<string>
  onNodeSelect: (node: Node) => void
  onNodeEdit: (node: Node) => void
  onNodeDelete: (nodeId: string) => void
  onHealthCheck: (nodeId: string) => void
  onNodePublish: (nodeId: string) => void
  onNodeOffline: (nodeId: string) => void
  onPushServices: (nodeId: string) => void
  onToggleExpand: (nodeId: string) => void
}

export default function NodeTreeView({
  nodes,
  loading,
  selectedNode,
  expandedNodes,
  onNodeSelect,
  onNodeEdit,
  onNodeDelete,
  onHealthCheck,
  onNodePublish,
  onNodeOffline,
  onPushServices,
  onToggleExpand
}: NodeTreeViewProps) {
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

  // 构建节点树形结构
  const buildNodeTree = (nodes: Node[]) => {
    const nodeMap = new Map<string, Node & { children: Node[] }>()
    const rootNodes: Node[] = []

    // 创建节点映射
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] })
    })

    // 构建树形结构
    nodes.forEach(node => {
      const nodeWithChildren = nodeMap.get(node.id)!
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId)
        if (parent) {
          parent.children.push(nodeWithChildren)
        }
      } else {
        rootNodes.push(nodeWithChildren)
      }
    })

    return rootNodes
  }

  // 渲染树形节点
  const renderTreeNode = (node: Node & { children: Node[] }, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id} className="space-y-1">
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
            selectedNode?.id === node.id ? 'bg-blue-50' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => {
            onNodeSelect(node)
          }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand(node.id)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-8" />}
          {getNodeIcon(node.type)}
          <div className="flex-1">
            <div className="font-medium">{node.name}</div>
            <div className="text-sm text-gray-500">
              {node.code} • {NODE_TYPES[node.type as keyof typeof NODE_TYPES]}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getHealthBadge(node.healthStatus)}
            <Badge variant="outline">
              {node._count?.datasets || 0} 数据集
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onHealthCheck(node.id)
              }}
              title="健康检查"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {node.isActive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onNodeOffline(node.id)
                }}
                title="下线节点"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onNodePublish(node.id)
                }}
                title="发布节点"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            {node.level > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onPushServices(node.id)
                }}
                title="向上推送服务"
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onNodeEdit(node)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onNodeDelete(node.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const treeNodes = buildNodeTree(nodes)

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {treeNodes.map(node => renderTreeNode(node))}
    </div>
  )
}