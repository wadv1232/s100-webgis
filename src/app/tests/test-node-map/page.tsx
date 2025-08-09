'use client'

import { useState, useEffect } from 'react'
import SharedMap from '@/components/maps/SharedMap'

interface TestNode {
  id: string
  name: string
  type: string
  level: number
  description: string
  healthStatus: string
  location: { lat: number; lng: number }
  coverage?: string
}

export default function TestNodeMapPage() {
  const [testNodes, setTestNodes] = useState<TestNode[]>([])
  const [selectedNode, setSelectedNode] = useState<TestNode | null>(null)

  useEffect(() => {
    // 创建测试节点数据
    const nodes: TestNode[] = [
      {
        id: 'test-node-1',
        name: '测试节点1',
        type: 'LEAF',
        level: 3,
        description: '这是一个测试节点',
        healthStatus: 'HEALTHY',
        location: { lat: 31.2000, lng: 121.5000 },
        coverage: JSON.stringify({
          type: "Polygon",
          coordinates: [[[121.0, 31.0], [122.0, 31.0], [122.0, 32.0], [121.0, 32.0], [121.0, 31.0]]]
        })
      },
      {
        id: 'test-node-2',
        name: '测试节点2',
        type: 'LEAF',
        level: 3,
        description: '这是另一个测试节点',
        healthStatus: 'WARNING',
        location: { lat: 31.3000, lng: 121.6000 },
        coverage: JSON.stringify({
          type: "Polygon",
          coordinates: [[[121.5, 31.2], [121.7, 31.2], [121.7, 31.4], [121.5, 31.4], [121.5, 31.2]]]
        })
      }
    ]
    
    setTestNodes(nodes)
    setSelectedNode(nodes[0])
  }, [])

  const handleNodeSelect = (node: TestNode) => {
    setSelectedNode(node)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">节点地图测试页面</h1>
        <p className="text-gray-600">测试SharedMap组件在节点管理中的功能</p>
      </div>

      {/* 节点选择 */}
      <div className="flex gap-4">
        {testNodes.map(node => (
          <button
            key={node.id}
            className={`px-4 py-2 rounded-lg ${
              selectedNode?.id === node.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            onClick={() => handleNodeSelect(node)}
          >
            {node.name}
          </button>
        ))}
      </div>

      {/* 地图显示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">单个节点地图</h2>
          <SharedMap
            nodes={selectedNode ? [selectedNode] : []}
            selectedNode={selectedNode}
            onNodeSelect={handleNodeSelect}
            mode="edit"
            editable={true}
            height="400px"
            baseMapConfig={{
              type: 'osm',
              minZoom: 1,
              maxZoom: 18
            }}
            displayConfig={{
              showCoordinates: true,
              showLayerPanel: false,
              showLegendPanel: false,
              layerPanelPosition: 'top-right',
              coordinatePanelPosition: 'bottom-left',
              panelOpacity: 95,
              alwaysOnTop: true
            }}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">所有节点地图</h2>
          <SharedMap
            nodes={testNodes}
            selectedNode={selectedNode}
            onNodeSelect={handleNodeSelect}
            mode="view"
            editable={false}
            height="400px"
            baseMapConfig={{
              type: 'osm',
              minZoom: 1,
              maxZoom: 18
            }}
            displayConfig={{
              showCoordinates: true,
              showLayerPanel: false,
              showLegendPanel: false,
              layerPanelPosition: 'top-right',
              coordinatePanelPosition: 'bottom-left',
              panelOpacity: 95,
              alwaysOnTop: true
            }}
          />
        </div>
      </div>

      {/* 调试信息 */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">调试信息</h3>
        <div className="space-y-2 text-sm">
          <p><strong>选中的节点:</strong> {selectedNode?.name || '无'}</p>
          <p><strong>节点总数:</strong> {testNodes.length}</p>
          {selectedNode && (
            <div>
              <p><strong>节点位置:</strong> {selectedNode.location.lat}, {selectedNode.location.lng}</p>
              <p><strong>节点类型:</strong> {selectedNode.type}</p>
              <p><strong>健康状态:</strong> {selectedNode.healthStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}