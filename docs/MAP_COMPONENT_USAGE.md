# 地图组件使用说明

## 快速开始

### 基本使用

```tsx
import S100ServiceMap from '@/components/S100ServiceMap'

function MyComponent() {
  // 准备数据
  const nodes = [
    {
      id: '1',
      name: '上海节点',
      type: 'NATIONAL',
      level: 2,
      description: '国家级海事服务中心',
      healthStatus: 'HEALTHY',
      services: ['S-101', 'S-102'],
      location: { lat: 31.2000, lng: 121.5000 }
    }
  ]

  const services = [
    {
      id: '1',
      name: 'S-101电子海图服务',
      type: 'WMS',
      product: 'S-101',
      status: 'ACTIVE',
      endpoint: 'https://example.com/wms',
      version: '1.3.0',
      nodeId: '1'
    }
  ]

  const [selectedNode, setSelectedNode] = useState(nodes[0])

  return (
    <S100ServiceMap
      nodes={nodes}
      services={services}
      selectedNode={selectedNode}
      onNodeSelect={setSelectedNode}
    />
  )
}
```

### 完整示例

```tsx
'use client'

import { useState } from 'react'
import S100ServiceMap from '@/components/S100ServiceMap'

// 定义节点数据
const mockNodes = [
  {
    id: 'node-001',
    name: '上海海事服务中心',
    type: 'NATIONAL' as const,
    level: 2,
    description: '国家级海事数据服务中心',
    healthStatus: 'HEALTHY' as const,
    services: ['S-101', 'S-102', 'S-104'],
    location: { lat: 31.2000, lng: 121.5000 }
  },
  {
    id: 'node-002',
    name: '北京海事服务中心',
    type: 'NATIONAL' as const,
    level: 2,
    description: '国家级海事数据服务中心',
    healthStatus: 'HEALTHY' as const,
    services: ['S-101', 'S-111'],
    location: { lat: 39.9042, lng: 116.4074 }
  },
  {
    id: 'node-003',
    name: '广州海事服务中心',
    type: 'REGIONAL' as const,
    level: 3,
    description: '区域级海事数据服务中心',
    healthStatus: 'WARNING' as const,
    services: ['S-102', 'S-124'],
    location: { lat: 23.1291, lng: 113.2644 }
  }
]

// 定义服务数据
const mockServices = [
  {
    id: 'service-001',
    name: 'S-101电子海图服务',
    type: 'WMS' as const,
    product: 'S-101',
    status: 'ACTIVE' as const,
    endpoint: 'https://maritime.example.com/wms',
    version: '1.3.0',
    nodeId: 'node-001'
  },
  {
    id: 'service-002',
    name: 'S-102水深服务',
    type: 'WMS' as const,
    product: 'S-102',
    status: 'ACTIVE' as const,
    endpoint: 'https://maritime.example.com/wms',
    version: '1.3.0',
    nodeId: 'node-001'
  },
  {
    id: 'service-003',
    name: 'S-111水位服务',
    type: 'WMS' as const,
    product: 'S-111',
    status: 'ACTIVE' as const,
    endpoint: 'https://maritime.example.com/wms',
    version: '1.3.0',
    nodeId: 'node-002'
  }
]

export default function MaritimeMapExample() {
  const [selectedNode, setSelectedNode] = useState(mockNodes[0])

  const handleNodeSelect = (node: any) => {
    setSelectedNode(node)
    console.log('Selected node:', node)
  }

  const handleNodeUpdate = (nodeId: string, updates: any) => {
    console.log('Updating node:', nodeId, updates)
    // 在实际应用中，这里会调用API更新数据
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">海事服务地图示例</h1>
      
      <S100ServiceMap
        nodes={mockNodes}
        services={mockServices}
        selectedNode={selectedNode}
        onNodeSelect={handleNodeSelect}
        onNodeUpdate={handleNodeUpdate}
        editable={true}
        height="700px"
        baseMapConfig={{
          type: 'satellite',
          minZoom: 1,
          maxZoom: 18
        }}
      />
    </div>
  )
}
```

## 配置选项

### 底图配置

#### 标准地图
```tsx
<S100ServiceMap
  // ... 其他属性
  baseMapConfig={{
    type: 'osm',
    minZoom: 1,
    maxZoom: 18
  }}
/>
```

#### 卫星地图
```tsx
<S100ServiceMap
  // ... 其他属性
  baseMapConfig={{
    type: 'satellite',
    minZoom: 1,
    maxZoom: 18
  }}
/>
```

#### 地形地图
```tsx
<S100ServiceMap
  // ... 其他属性
  baseMapConfig={{
    type: 'terrain',
    minZoom: 1,
    maxZoom: 18
  }}
/>
```

#### 自定义底图
```tsx
<S100ServiceMap
  // ... 其他属性
  baseMapConfig={{
    type: 'custom',
    customUrl: 'https://your-tile-server/{z}/{x}/{y}.png',
    attribution: 'Your Company Name',
    minZoom: 1,
    maxZoom: 20
  }}
/>
```

### 编辑模式

启用编辑模式后，用户可以编辑节点的地理数据：

```tsx
<S100ServiceMap
  // ... 其他属性
  editable={true}
  onNodeUpdate={(nodeId, updates) => {
    // 处理节点更新
    console.log('Node updated:', nodeId, updates)
  }}
/>
```

### 响应式高度

根据屏幕尺寸动态调整地图高度：

```tsx
import { useState, useEffect } from 'react'

function ResponsiveMap() {
  const [mapHeight, setMapHeight] = useState('600px')

  useEffect(() => {
    const updateHeight = () => {
      const height = window.innerWidth < 768 ? '400px' : '600px'
      setMapHeight(height)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  return (
    <S100ServiceMap
      // ... 其他属性
      height={mapHeight}
    />
  )
}
```

## 事件处理

### 节点选择事件

```tsx
const handleNodeSelect = (node: NodeType) => {
  setSelectedNode(node)
  
  // 可以在这里执行其他操作
  console.log('Selected node:', node.name)
  console.log('Node location:', node.location)
  console.log('Node services:', node.services)
  
  // 可以将地图中心移动到选中的节点
  setMapCenter([node.location.lat, node.location.lng])
  setMapZoom(10)
}
```

### 节点更新事件

```tsx
const handleNodeUpdate = async (nodeId: string, updates: Partial<NodeType>) => {
  try {
    // 显示加载状态
    setLoading(true)
    
    // 调用API更新数据
    const response = await fetch(`/api/nodes/${nodeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update node')
    }
    
    const updatedNode = await response.json()
    
    // 更新本地状态
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? updatedNode : node
    ))
    
    // 显示成功消息
    toast.success('节点更新成功')
    
  } catch (error) {
    console.error('Error updating node:', error)
    toast.error('节点更新失败')
  } finally {
    setLoading(false)
  }
}
```

### 地图交互事件

```tsx
import { useEffect, useRef } from 'react'

function MapWithEvents() {
  const mapRef = useRef<any>(null)

  const handleMapCreated = (map: any) => {
    mapRef.current = map
    
    // 地图点击事件
    map.on('click', (e: any) => {
      console.log('Map clicked at:', e.latlng)
    })
    
    // 地图移动事件
    map.on('moveend', (e: any) => {
      const center = map.getCenter()
      const zoom = map.getZoom()
      const bounds = map.getBounds()
      
      console.log('Map moved:', { center, zoom, bounds })
    })
    
    // 缩放事件
    map.on('zoomend', (e: any) => {
      console.log('Map zoomed to:', map.getZoom())
    })
  }

  return (
    <S100ServiceMap
      // ... 其他属性
      ref={mapRef}
      whenCreated={handleMapCreated}
    />
  )
}
```

## 数据格式

### NodeType

```typescript
interface NodeType {
  id: string
  name: string
  type: 'GLOBAL_ROOT' | 'NATIONAL' | 'REGIONAL' | 'LEAF'
  level: number
  description: string
  healthStatus: 'HEALTHY' | 'WARNING' | 'ERROR'
  services: string[]
  location: {
    lat: number
    lng: number
  }
}
```

### ServiceType

```typescript
interface ServiceType {
  id: string
  name: string
  type: 'WMS' | 'WFS' | 'WCS'
  product: string
  status: 'ACTIVE' | 'MAINTENANCE' | 'ERROR'
  endpoint: string
  version: string
  layers?: string[]
  formats: string[]
  nodeId: string
}
```

## 样式定制

### 容器样式

```tsx
<div className="map-wrapper">
  <S100ServiceMap
    // ... 其他属性
    height="500px"
    className="custom-map"
  />
</div>
```

```css
/* 自定义地图容器样式 */
.map-wrapper {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.custom-map {
  border: 2px solid #e5e7eb;
}
```

### 节点标记样式

节点标记的颜色根据健康状态自动设置：

- **HEALTHY**: 绿色 (#10b981)
- **WARNING**: 黄色 (#f59e0b)
- **ERROR**: 红色 (#ef4444)
- **默认**: 灰色 (#6b7280)

## 性能优化

### 懒加载

```tsx
import dynamic from 'next/dynamic'

// 懒加载地图组件
const S100ServiceMap = dynamic(
  () => import('@/components/S100ServiceMap'),
  { 
    ssr: false,
    loading: () => <div>地图加载中...</div>
  }
)
```

### 数据优化

```tsx
import { useMemo } from 'react'

function OptimizedMap({ nodes, services, ...props }) {
  // 使用 useMemo 优化计算
  const filteredServices = useMemo(() => {
    return services.filter(service => 
      props.selectedNode.services.some(ns => ns.includes(service.product))
    )
  }, [services, props.selectedNode])

  const processedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      // 添加计算属性
      serviceCount: node.services.length,
      isActive: node.healthStatus === 'HEALTHY'
    }))
  }, [nodes])

  return (
    <S100ServiceMap
      nodes={processedNodes}
      services={filteredServices}
      {...props}
    />
  )
}
```

### 防抖处理

```tsx
import { useCallback, debounce } from 'lodash'

function MapWithSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  
  // 防抖搜索处理
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      // 执行搜索逻辑
      console.log('Searching for:', term)
    }, 300),
    []
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    debouncedSearch(term)
  }

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="搜索节点或服务..."
      />
      <S100ServiceMap /* ... */ />
    </div>
  )
}
```

## 错误处理

### 错误边界

```tsx
import { Component, ErrorInfo, ReactNode } from 'react'

class MapErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="map-error">
          <h3>地图加载失败</h3>
          <p>无法加载地图组件，请刷新页面重试。</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// 使用错误边界
function SafeMap() {
  return (
    <MapErrorBoundary>
      <S100ServiceMap /* ... */ />
    </MapErrorBoundary>
  )
}
```

### 加载状态处理

```tsx
function MapWithLoading() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleMapCreated = (map: any) => {
    setIsLoading(false)
    console.log('Map loaded successfully')
  }

  const handleMapError = (error: any) => {
    setIsLoading(false)
    setHasError(true)
    console.error('Map loading error:', error)
  }

  if (hasError) {
    return (
      <div className="map-error">
        <h3>地图加载失败</h3>
        <p>请检查网络连接并重试。</p>
      </div>
    )
  }

  return (
    <div className="map-container">
      {isLoading && (
        <div className="map-loading">
          <div className="spinner"></div>
          <p>地图加载中...</p>
        </div>
      )}
      <S100ServiceMap
        // ... 其他属性
        whenCreated={handleMapCreated}
        onError={handleMapError}
      />
    </div>
  )
}
```

## 测试

### 单元测试

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import S100ServiceMap from '@/components/S100ServiceMap'

const mockNodes = [
  {
    id: '1',
    name: 'Test Node',
    type: 'NATIONAL' as const,
    level: 2,
    description: 'Test Description',
    healthStatus: 'HEALTHY' as const,
    services: ['S-101'],
    location: { lat: 31.2000, lng: 121.5000 }
  }
]

const mockServices = [
  {
    id: '1',
    name: 'Test Service',
    type: 'WMS' as const,
    product: 'S-101',
    status: 'ACTIVE' as const,
    endpoint: 'https://test.com/wms',
    version: '1.3.0',
    nodeId: '1'
  }
]

describe('S100ServiceMap', () => {
  it('renders map with nodes and services', () => {
    const { container } = render(
      <S100ServiceMap
        nodes={mockNodes}
        services={mockServices}
        selectedNode={mockNodes[0]}
        onNodeSelect={jest.fn()}
      />
    )
    
    expect(container).toBeInTheDocument()
  })

  it('calls onNodeSelect when node is clicked', () => {
    const mockOnNodeSelect = jest.fn()
    
    render(
      <S100ServiceMap
        nodes={mockNodes}
        services={mockServices}
        selectedNode={mockNodes[0]}
        onNodeSelect={mockOnNodeSelect}
      />
    )
    
    // 模拟节点点击
    // 注意：这需要根据实际实现调整
    // fireEvent.click(screen.getByText('Test Node'))
    
    // expect(mockOnNodeSelect).toHaveBeenCalledWith(mockNodes[0])
  })
})
```

### 集成测试

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MaritimeMapExample from './MaritimeMapExample'

describe('MaritimeMapExample Integration', () => {
  it('allows user to interact with map nodes', async () => {
    render(<MaritimeMapExample />)
    
    // 等待地图加载
    await waitFor(() => {
      expect(screen.getByText('海事服务地图示例')).toBeInTheDocument()
    })
    
    // 测试搜索功能
    const searchButton = screen.getByText('搜索')
    await userEvent.click(searchButton)
    
    // 测试图层控制
    const layerButton = screen.getByText('图层')
    await userEvent.click(layerButton)
    
    // 测试图例控制
    const legendButton = screen.getByText('图例')
    await userEvent.click(legendButton)
  })
})
```

## 部署注意事项

### 环境变量

```bash
# 地图瓦片服务配置
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAP_ATTRIBUTION="© OpenStreetMap contributors"

# 自定义瓦片服务（如果使用）
NEXT_PUBLIC_CUSTOM_MAP_URL=https://your-tile-server/{z}/{x}/{y}.png
NEXT_PUBLIC_CUSTOM_MAP_ATTRIBUTION="Your Company Name"
```

### 构建优化

```tsx
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['tile.openstreetmap.org', 'server.arcgisonline.com'],
  },
  webpack: (config) => {
    // 优化地图相关包的打包
    config.externals = config.externals || []
    config.externals.push({
      'leaflet': 'leaflet'
    })
    return config
  }
}

module.exports = nextConfig
```

### CDN 配置

```html
<!-- 在 _document.tsx 中添加 -->
<Head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</Head>

<!-- 在 _app.tsx 中添加 -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

## 常见问题

### Q: 地图显示为空白或白色方块

**A**: 检查以下几点：
1. 确保容器有明确的宽高设置
2. 检查 CSS 样式是否正确
3. 确认地图组件已正确挂载
4. 检查浏览器控制台是否有错误信息

### Q: 瓦片加载失败

**A**: 可能的原因和解决方案：
1. **网络问题**: 检查网络连接
2. **CORS 问题**: 确保瓦片服务允许跨域访问
3. **URL 错误**: 验证瓦片 URL 格式是否正确
4. **配额限制**: 某些瓦片服务有访问限制

### Q: 坐标显示不正确

**A**: 检查坐标系统设置：
1. 确认使用 WGS84 坐标系统
2. 检查坐标是否在有效范围内（纬度 [-90, 90]，经度 [-180, 180]）
3. 使用内置的坐标标准化功能

### Q: 性能问题

**A**: 优化建议：
1. 使用懒加载减少初始加载时间
2. 优化数据结构和计算
3. 合理设置缩放级别限制
4. 使用防抖处理频繁操作

---

**文档版本**: v1.0.0  
**最后更新**: 2025-06-17  
**维护者**: 开发团队