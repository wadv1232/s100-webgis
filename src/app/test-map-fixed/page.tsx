'use client'

import { useState } from 'react'
import SharedMap from '@/components/maps/SharedMapFixed'

interface TestNode {
  id: string
  name: string
  type: string
  level: number
  description: string
  healthStatus: string
  services: string[]
  location: { lat: number; lng: number }
  coverage?: string
}

export default function TestMapFixedPage() {
  const [selectedNode, setSelectedNode] = useState<TestNode | null>(null)

  // 创建测试节点数据
  const testNodes: TestNode[] = [
    {
      id: 'shanghai-port',
      name: '上海港',
      type: 'LEAF',
      level: 3,
      description: '上海港海事服务节点',
      healthStatus: 'HEALTHY',
      services: ['S101', 'S102'],
      location: { lat: 31.2000, lng: 121.5000 },
      coverage: JSON.stringify({
        type: "Polygon",
        coordinates: [[[121.0, 31.0], [122.0, 31.0], [122.0, 32.0], [121.0, 32.0], [121.0, 31.0]]]
      })
    },
    {
      id: 'ningbo-port',
      name: '宁波港',
      type: 'LEAF',
      level: 3,
      description: '宁波港海事服务节点',
      healthStatus: 'HEALTHY',
      services: ['S101'],
      location: { lat: 29.9000, lng: 121.6000 },
      coverage: JSON.stringify({
        type: "Polygon",
        coordinates: [[[121.4, 29.8], [121.8, 29.8], [121.8, 30.0], [121.4, 30.0], [121.4, 29.8]]]
      })
    }
  ]

  const handleNodeSelect = (node: TestNode) => {
    setSelectedNode(node)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">地图修复测试页面</h1>
        <p className="text-gray-600">测试SharedMapFixed组件是否解决了Leaflet chunk加载失败的问题</p>
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
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">修复后的地图组件</h2>
          <SharedMap
            nodes={testNodes}
            selectedNode={selectedNode}
            onNodeSelect={handleNodeSelect}
            mode="view"
            editable={false}
            height="600px"
            baseMapConfig={{
              type: 'osm',
              minZoom: 1,
              maxZoom: 18
            }}
            displayConfig={{
              showCoordinates: true,
              showLayerPanel: true,
              showLegendPanel: true,
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
              <p><strong>服务类型:</strong> {selectedNode.services.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2 text-blue-800">使用说明</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• 此页面使用SharedMapFixed组件，该组件通过动态导入Leaflet来解决chunk加载失败的问题</p>
          <p>• 点击上方的节点按钮可以选择不同的节点</p>
          <p>• 地图支持缩放、拖拽等基本操作</p>
          <p>• 右上角有图层控制面板，可以切换不同的底图类型</p>
          <p>• 左下角有坐标显示面板，显示当前鼠标位置的坐标</p>
          <p>• 如果地图正常显示，说明Leaflet chunk加载失败的问题已经修复</p>
        </div>
      </div>
    </div>
  )
}