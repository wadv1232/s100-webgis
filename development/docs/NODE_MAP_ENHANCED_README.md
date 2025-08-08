# 节点地理分布增强版 (NodeMap Enhanced)

基于 Leaflet + leaflet-draw 的节点几何信息编辑系统，支持点、多边形、矩形的绘制和编辑功能。

## 功能特性

### 🎨 核心功能
- **多种几何类型**: 支持点、多边形、矩形的几何信息编辑
- **实时绘制**: 使用 leaflet-draw 工具栏进行直观的几何绘制
- **节点关联**: 几何信息与节点数据关联存储
- **GeoJSON 导入**: 支持通过 GeoJSON 格式导入几何数据
- **编辑历史**: 记录所有几何信息编辑操作

### 🛠️ 技术特点
- **Leaflet 集成**: 基于 Leaflet 地图库，性能优秀
- **leaflet-draw**: 专业的地图绘制工具
- **TypeScript 支持**: 完整的类型定义和类型安全
- **响应式设计**: 适配各种屏幕尺寸
- **实时同步**: 几何信息与节点数据实时同步

### 🎯 使用场景
- **节点几何编辑**: 为节点添加或修改点、多边形、矩形几何信息
- **区域管理**: 定义节点的服务区域或管辖范围
- **数据可视化**: 节点地理信息的可视化展示
- **空间分析**: 基于几何信息进行空间分析

## 快速开始

### 1. 访问增强节点地图

通过以下方式访问编辑器：

- **系统管理员角色**: 登录后在主页点击"节点地理分布"
- **开发者角色**: 登录后在主页点击"节点地理分布"
- **直接访问**: 访问 `/node-map-enhanced` 路径

### 2. 基本操作

#### 启用编辑模式
1. 点击地图右上角的"图层"按钮
2. 在弹出的对话框中启用"编辑模式"
3. 编辑模式指示器会出现在地图左上角

#### 选择节点进行编辑
1. 在地图上点击任意节点标记
2. 在弹出的信息窗口中点击"编辑几何"按钮
3. 地图将自动定位到选中的节点

#### 绘制几何信息
1. 选择节点后，使用地图右上角的绘制工具：
   - 🔴 **点**: 绘制点几何（精确位置）
   - 📏 **线**: 绘制线几何（路径、边界）
   - 🔷 **多边形**: 绘制多边形几何（区域、范围）
   - ⬜ **矩形**: 绘制矩形几何（规则区域）
   - ⭕ **圆形**: 绘制圆形几何（覆盖范围）

2. 在地图上绘制所需的几何形状
3. 绘制完成后，几何信息会自动保存到节点数据中

#### 导入 GeoJSON
1. 选择节点后，在编辑面板中切换到"导入数据"标签
2. 在文本框中输入 GeoJSON 格式的几何数据
3. 点击"导入几何数据"按钮
4. 系统会验证 GeoJSON 格式并导入到节点

### 3. 功能详解

#### 地图图层控制
- **节点位置**: 显示所有节点的位置标记
- **服务覆盖**: 显示节点的服务覆盖范围（圆形）
- **覆盖范围**: 显示节点的扩展覆盖范围（虚线圆形）
- **几何信息**: 显示节点的几何信息（点、多边形、矩形）

#### 编辑功能
- **绘制工具**: 支持点、线、多边形、矩形、圆形的绘制
- **编辑工具**: 支持已绘制几何的编辑和修改
- **删除工具**: 支持删除已绘制的几何信息
- **撤销功能**: 支持取消编辑操作

#### 数据管理
- **实时保存**: 几何信息修改后实时保存到节点数据
- **历史记录**: 记录所有编辑操作，支持查看历史
- **数据验证**: 自动验证几何数据的格式和有效性
- **同步更新**: 几何信息与位置信息同步更新

## 组件使用

### NodeMapEnhanced 组件

```tsx
import NodeMapEnhanced from '@/components/NodeMapEnhanced'

function MyComponent() {
  return (
    <NodeMapEnhanced
      nodes={nodes}
      selectedNode={selectedNode}
      onNodeSelect={handleNodeSelect}
      onNodeUpdate={handleNodeUpdate}
    />
  )
}
```

### 组件属性

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `nodes` | `Node[]` | ✅ | 节点数据数组 |
| `selectedNode` | `Node \| null` | ❌ | 当前选中的节点 |
| `onNodeSelect` | `(node: Node) => void` | ❌ | 节点选择回调 |
| `onNodeUpdate` | `(nodeId: string, updates: Partial<Node>) => void` | ❌ | 节点更新回调 |
| `className` | `string` | ❌ | 自定义 CSS 类名 |

### Node 接口

```typescript
interface Node {
  id: string
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
  parent?: any
  children?: any[]
  capabilities?: any[]
  _count?: {
    datasets: number
    childNodeRelations: number
  }
  location?: {
    lat: number
    lng: number
  }
  geometry?: {
    type: string
    coordinates: any
  }
}
```

## 数据格式

### 几何信息格式

节点几何信息支持以下 GeoJSON 格式：

#### 点几何
```json
{
  "type": "Point",
  "coordinates": [121.4737, 31.2304]
}
```

#### 多边形几何
```json
{
  "type": "Polygon",
  "coordinates": [[
    [121.0, 31.0],
    [122.0, 31.0],
    [122.0, 32.0],
    [121.0, 32.0],
    [121.0, 31.0]
  ]]
}
```

#### 矩形几何
```json
{
  "type": "Polygon",
  "coordinates": [[
    [121.4, 29.7],
    [121.7, 29.7],
    [121.7, 30.0],
    [121.4, 30.0],
    [121.4, 29.7]
  ]]
}
```

### 节点更新数据

当编辑几何信息时，会调用 `onNodeUpdate` 回调：

```typescript
// 点几何更新
onNodeUpdate(nodeId, {
  geometry: {
    type: "Point",
    coordinates: [121.4737, 31.2304]
  },
  location: {
    lat: 31.2304,
    lng: 121.4737
  }
})

// 多边形/矩形几何更新
onNodeUpdate(nodeId, {
  geometry: {
    type: "Polygon",
    coordinates: [[...]]
  }
})
```

## 最佳实践

### 1. 几何类型选择
- **点几何**: 适用于精确位置标记（如建筑物、设施）
- **多边形几何**: 适用于不规则区域（如管辖范围、服务区域）
- **矩形几何**: 适用于规则区域（如搜索区域、显示范围）

### 2. 数据管理
- **定期备份**: 重要几何信息应定期备份
- **数据验证**: 确保几何数据的准确性和有效性
- **性能优化**: 避免过于复杂的几何形状影响性能

### 3. 用户体验
- **清晰指引**: 为用户提供明确的操作指引
- **视觉反馈**: 提供实时的视觉反馈和状态提示
- **错误处理**: 优雅处理编辑过程中的错误情况

### 4. 系统集成
- **数据同步**: 确保几何信息与其他系统数据同步
- **权限控制**: 根据用户角色控制编辑权限
- **日志记录**: 记录重要的编辑操作用于审计

## 故障排除

### 常见问题

#### 1. 绘制工具不显示
- 确认已启用编辑模式
- 检查是否选择了要编辑的节点
- 确认 leaflet-draw 资源正确加载

#### 2. 几何信息无法保存
- 检查 `onNodeUpdate` 回调是否正确实现
- 确认网络连接正常
- 验证几何数据格式是否正确

#### 3. GeoJSON 导入失败
- 检查 GeoJSON 格式是否符合标准
- 确认坐标系统的正确性
- 验证几何类型的支持性

#### 4. 地图显示异常
- 检查 Leaflet 资源是否正确加载
- 确认地图容器的尺寸设置
- 验证浏览器兼容性

### 调试技巧

1. **浏览器控制台**: 使用开发者工具查看错误信息
2. **网络面板**: 检查资源加载和网络请求
3. **React 开发工具**: 检查组件状态和属性
4. **地图事件**: 监听地图事件进行调试

## 扩展开发

### 添加新的几何类型
```typescript
// 在 DrawControls 组件中扩展
const customDrawTools = {
  customGeometry: {
    icon: 'custom-icon',
    title: '自定义几何',
    handler: handleCustomDraw
  }
}
```

### 自定义样式
```typescript
// 自定义几何样式
const customStyles = {
  color: '#ff6b6b',
  weight: 3,
  fillColor: '#ff6b6b',
  fillOpacity: 0.3
}
```

### 集成后端服务
```typescript
// 集成后端 API
const saveGeometryToBackend = async (nodeId: string, geometry: any) => {
  const response = await fetch(`/api/nodes/${nodeId}/geometry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ geometry })
  })
  return response.json()
}
```

## 性能优化

### 1. 地图性能
- **合理缩放**: 根据数据密度设置合适的缩放级别
- **图层管理**: 及时隐藏不需要的图层
- **几何简化**: 对复杂几何进行简化处理

### 2. 数据性能
- **分页加载**: 大量节点数据时分页加载
- **缓存策略**: 合理使用缓存减少重复请求
- **索引优化**: 为几何数据建立空间索引

### 3. 渲染性能
- **虚拟化**: 对大量几何要素使用虚拟化渲染
- **LOD 技术**: 根据缩放级别调整细节程度
- **WebGL**: 考虑使用 WebGL 渲染提升性能

## 安全考虑

### 1. 数据安全
- **输入验证**: 验证所有输入的几何数据
- **权限控制**: 严格控制几何信息的编辑权限
- **数据加密**: 敏感几何数据传输时加密

### 2. 操作安全
- **操作日志**: 记录所有几何编辑操作
- **审计跟踪**: 支持操作审计和回溯
- **备份恢复**: 定期备份几何数据支持恢复

### 3. 访问控制
- **角色权限**: 基于用户角色控制功能访问
- **IP 限制**: 限制特定 IP 的访问权限
- **会话管理**: 合理管理用户会话和超时

## 贡献指南

欢迎提交问题和改进建议！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。