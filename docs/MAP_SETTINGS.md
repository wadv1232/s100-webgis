# 地图设置文档

## 概述

本文档详细说明了项目中地图组件的配置参数、使用方法和最佳实践。地图组件基于 Leaflet 和 React-Leaflet 构建，支持多种底图类型和坐标系统。

## 核心组件

### S100ServiceMap 组件

主要的地图服务组件，用于显示海事数据服务地理分布和实时状态监控。

#### 基本配置

```tsx
import S100ServiceMap from '@/components/S100ServiceMap'

function MyMapComponent() {
  return (
    <S100ServiceMap
      nodes={nodes}
      services={services}
      selectedNode={selectedNode}
      onNodeSelect={handleNodeSelect}
      height="600px"
      baseMapConfig={{
        type: 'osm',
        minZoom: 1,
        maxZoom: 18
      }}
    />
  )
}
```

#### 完整属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `nodes` | `NodeType[]` | 必需 | 节点数据数组 |
| `services` | `ServiceType[]` | 必需 | 服务数据数组 |
| `selectedNode` | `NodeType` | 必需 | 当前选中的节点 |
| `onNodeSelect` | `(node: NodeType) => void` | 必需 | 节点选择回调函数 |
| `onNodeUpdate` | `(nodeId: string, updates: Partial<NodeType>) => void` | 可选 | 节点更新回调函数 |
| `editable` | `boolean` | `false` | 是否启用编辑模式 |
| `height` | `string` | `"600px"` | 地图容器高度 |
| `baseMapConfig` | `BaseMapConfig` | 可选 | 底图配置对象 |

#### BaseMapConfig 类型

```typescript
interface BaseMapConfig {
  type: 'osm' | 'satellite' | 'terrain' | 'custom'
  customUrl?: string
  attribution?: string
  minZoom?: number
  maxZoom?: number
}
```

### 底图类型

#### 1. 标准地图 (OSM)
```typescript
baseMapConfig={{
  type: 'osm',
  minZoom: 1,
  maxZoom: 18
}}
```
- **URL**: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **适用场景**: 通用地图显示，轻量级加载
- **特点**: 免费开源，全球覆盖，更新及时

#### 2. 卫星地图
```typescript
baseMapConfig={{
  type: 'satellite',
  minZoom: 1,
  maxZoom: 18
}}
```
- **URL**: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}`
- **适用场景**: 需要真实地形和建筑物的场景
- **特点**: 高清卫星影像，适合海事监控

#### 3. 地形地图
```typescript
baseMapConfig={{
  type: 'terrain',
  minZoom: 1,
  maxZoom: 18
}}
```
- **URL**: `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`
- **适用场景**: 需要地形高程信息的场景
- **特点**: 地形等高线显示，适合航海规划

#### 4. 自定义底图
```typescript
baseMapConfig={{
  type: 'custom',
  customUrl: 'https://your-custom-tile-server/{z}/{x}/{y}.png',
  attribution: 'Custom Map Provider',
  minZoom: 1,
  maxZoom: 20
}}
```
- **适用场景**: 使用自定义瓦片服务
- **特点**: 完全自定义，支持私有瓦片服务

## 坐标系统

### 投影系统

- **地图投影**: Web Mercator (EPSG:3857)
- **显示坐标**: WGS84 (EPSG:4326)
- **坐标范围**: 纬度 [-90, 90]，经度 [-180, 180]

### 坐标标准化

组件内置坐标标准化功能，自动处理超出范围的坐标：

```typescript
// 标准化函数示例
function normalizeLongitude(lng: number): number {
  const normalized = lng % 360
  return normalized > 180 ? normalized - 360 : normalized
}

function normalizeLatitude(lat: number): number {
  return Math.max(-90, Math.min(90, lat))
}
```

### 坐标显示

地图左下角显示当前鼠标位置的 WGS84 坐标，格式为：
```
WGS84: 31.200000, 121.500000
```

## 地图控制

### 比例尺

- **位置**: 左下角
- **单位**: 公制 (米/公里)
- **最大宽度**: 200px

### 缩放控制

- **位置**: 右上角
- **缩放级别**: 1-18
- **快捷键**: 鼠标滚轮、双击、拖拽

### 图层控制

支持多种图层类型：

#### 基础图层
- 标准地图
- 卫星地图
- 地形地图
- 自定义地图

#### 服务图层
- 节点标记
- 服务覆盖区域
- S-100 WMS 服务层

## 配置参数详解

### TileLayer 关键参数

```typescript
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution="© OpenStreetMap contributors"
  noWrap={true}                    // 防止地图重复
  updateWhenIdle={false}           // 确保及时更新
  updateWhenZooming={true}         // 缩放时更新
  keepBuffer={4}                   // 增加缓冲区减少瓦片闪烁
  bounds={[[-90, -180], [90, 180]]} // 限制世界范围
  maxBounds={[[-90, -180], [90, 180]]} // 限制最大边界
  maxBoundsViscosity={1.0}        // 严格边界限制
  minZoom={1}                      // 最小缩放级别
  maxZoom={18}                     // 最大缩放级别
/>
```

### MapContainer 关键参数

```typescript
<MapContainer
  center={[31.2000, 121.5000]}    // 地图中心点
  zoom={6}                         // 初始缩放级别
  style={{                         // 容器样式
    height: '100%',
    width: '100%',
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'transparent'
  }}
  worldCopyJump={false}           // 禁用世界复制跳跃
  maxBounds={[[-90, -180], [90, 180]]} // 限制世界边界
  maxBoundsViscosity={1.0}        // 严格边界限制
  minZoom={1}                      // 最小缩放级别
  maxZoom={18}                     // 最大缩放级别
  zoomControl={false}              // 禁用默认缩放控制
  attributionControl={false}       // 禁用默认归属控制
  whenCreated={(map) => {         // 地图创建回调
    map.setMaxBounds([[-90, -180], [90, 180]])
    map.invalidateSize()
  }}
/>
```

## 样式配置

### CSS 样式

地图容器需要特定的 CSS 样式以确保正确显示：

```css
/* 地图容器样式 */
.map-container {
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 400px !important;
  display: block !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  background: transparent !important;
}

/* Leaflet 地图容器 */
.leaflet-map-container {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  z-index: 0 !important;
  background: transparent !important;
}

/* 瓦片层修复 */
.leaflet-tile-container {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
}

.leaflet-tile-pane {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  transform: translate3d(0, 0, 0) !important;
}
```

### 响应式设计

地图组件支持响应式布局：

```tsx
// 响应式高度设置
<S100ServiceMap
  height={window.innerWidth < 768 ? '400px' : '600px'}
  // ... 其他属性
/>
```

## 性能优化

### 瓦片加载优化

1. **缓冲区设置**: `keepBuffer={4}` 预加载周围瓦片
2. **边界限制**: 限制地图范围减少不必要的瓦片请求
3. **更新策略**: `updateWhenIdle={false}` 确保及时更新

### 内存管理

1. **组件卸载**: 自动清理地图实例和事件监听器
2. **尺寸监听**: 使用 ResizeObserver 监听容器尺寸变化
3. **重新挂载**: 当容器尺寸异常时强制重新挂载

### 渲染优化

1. **动态导入**: 使用 `dynamic` 导入地图组件避免 SSR 问题
2. **CSS 硬件加速**: 使用 `transform: translate3d` 启用 GPU 加速
3. **样式隔离**: 使用 `!important` 确保样式不被覆盖

## 故障排除

### 常见问题

#### 1. 地图显示为白色或小方块
**原因**: 容器尺寸初始化问题
**解决方案**: 
- 检查容器 CSS 样式
- 确保容器有明确的宽高
- 使用 `invalidateSize()` 重新计算尺寸

#### 2. 瓦片拼接错乱
**原因**: TileLayer 配置不当
**解决方案**:
- 添加 `noWrap={true}` 防止地图重复
- 设置 `bounds` 和 `maxBounds` 限制范围
- 使用 `keepBuffer={4}` 优化瓦片加载

#### 3. 坐标显示异常
**原因**: 坐标超出范围
**解决方案**:
- 使用内置的坐标标准化功能
- 检查输入坐标的有效性
- 确认坐标系统设置正确

#### 4. 地图不响应容器尺寸变化
**原因**: 缺少尺寸监听
**解决方案**:
- 使用 ResizeObserver 监听容器变化
- 在尺寸变化时调用 `invalidateSize()`
- 考虑强制重新挂载地图组件

### 调试方法

#### 1. 控制台日志
```typescript
whenCreated={(map) => {
  console.log('Map created:', map)
  console.log('Map bounds:', map.getBounds())
  console.log('Map center:', map.getCenter())
  console.log('Map zoom:', map.getZoom())
}}
```

#### 2. 容器尺寸检查
```typescript
useEffect(() => {
  const container = mapContainerRef.current
  if (container) {
    const rect = container.getBoundingClientRect()
    console.log('Container dimensions:', rect)
  }
}, [])
```

#### 3. 瓦片加载监控
```typescript
// 监听瓦片加载事件
map.on('tileload', (e) => {
  console.log('Tile loaded:', e.tile)
})

map.on('tileerror', (e) => {
  console.error('Tile load error:', e.error)
})
```

## 最佳实践

### 1. 初始化配置
```tsx
// 推荐的初始化配置
const baseMapConfig = {
  type: 'osm' as const,
  minZoom: 1,
  maxZoom: 18
}

const mapProps = {
  height: '600px',
  baseMapConfig,
  // ... 其他配置
}
```

### 2. 事件处理
```tsx
// 地图点击事件
const handleMapClick = (e: any) => {
  console.log('Map clicked:', e.latlng)
  // 处理点击事件
}

// 地图移动事件
const handleMapMove = (e: any) => {
  const map = e.target
  console.log('Map moved:', map.getCenter())
}
```

### 3. 性能监控
```tsx
// 性能监控示例
useEffect(() => {
  const startTime = performance.now()
  
  return () => {
    const endTime = performance.now()
    console.log(`Map component lifetime: ${endTime - startTime}ms`)
  }
}, [])
```

## 版本历史

### v1.0.0 (2025-06-17)
- 修复地图拼接错乱问题
- 添加坐标标准化功能
- 优化瓦片加载性能
- 增强响应式布局支持
- 完善错误处理机制

## 相关资源

- [Leaflet 官方文档](https://leafletjs.com/)
- [React-Leaflet 文档](https://react-leaflet.js.org/)
- [OpenStreetMap 瓦片服务](https://www.openstreetmap.org/)
- [WGS84 坐标系统](https://en.wikipedia.org/wiki/World_Geodetic_System)

---

**文档版本**: v1.0.0  
**最后更新**: 2025-06-17  
**维护者**: 开发团队