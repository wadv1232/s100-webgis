# 增强地图编辑器 (Enhanced Map Editor)

基于 Leaflet + leaflet-draw 的 GIS 数据编辑工具，支持点线面绘制与编辑，并生成后端渲染指令。

## 功能特性

### 🎨 核心功能
- **多种绘制工具**: 点、线、面、矩形、圆形绘制
- **实时编辑**: 支持要素的编辑、删除、样式修改
- **GeoJSON 导入导出**: 支持标准 GeoJSON 格式数据交换
- **绘图指令生成**: 自动生成后端渲染指令
- **S-100 兼容**: 支持 S-100 产品标准的绘图指令

### 🛠️ 技术特点
- **轻量级**: 基于 Leaflet 生态系统，性能优秀
- **易用性**: 直观的用户界面，支持拖拽绘制
- **TypeScript 支持**: 完整的类型定义和类型安全
- **响应式设计**: 适配各种屏幕尺寸
- **模块化架构**: 可扩展的组件设计

### 🎯 使用场景
- **GIS 数据编辑**: 直接在地图上编辑地理数据
- **S-100 产品开发**: 为 S-100 产品生成绘图指令
- **地图服务集成**: 与现有地图服务无缝集成
- **数据可视化**: 地理数据的可视化编辑和展示

## 快速开始

### 1. 访问增强地图编辑器

通过以下方式访问编辑器：

- **开发者角色**: 登录后在主页点击"增强地图编辑器"
- **系统管理员角色**: 登录后在主页点击"增强地图编辑器"
- **直接访问**: 访问 `/enhanced-map` 路径

### 2. 基本操作

#### 绘制要素
1. 选择绘制工具（点、线、面、矩形、圆形）
2. 在地图上点击或拖拽绘制
3. 绘制完成后自动保存到要素列表

#### 编辑要素
1. 点击地图上的要素进行选择
2. 使用编辑工具修改要素形状
3. 修改样式属性（颜色、线宽、透明度等）

#### 导入导出
1. **导入 GeoJSON**: 在侧边栏输入 GeoJSON 数据并点击导入
2. **导出 GeoJSON**: 点击"导出 GeoJSON"按钮下载要素数据
3. **导出指令**: 点击"导出指令"按钮下载绘图指令

### 3. 绘图指令

#### 指令格式
```json
{
  "id": "instruction_123",
  "type": "draw",
  "featureType": "Point",
  "geometry": {
    "type": "Point",
    "coordinates": [121.5, 31.2]
  },
  "properties": {...},
  "style": {...},
  "timestamp": 1234567890
}
```

#### 指令类型
- **draw**: 绘制新要素
- **edit**: 编辑现有要素
- **delete**: 删除要素
- **style**: 修改要素样式

#### S-100 兼容性
编辑器支持生成 S-100 产品兼容的绘图指令，包含：
- S-100 产品标识
- 标准化的几何格式
- 符合 S-100 规范的样式定义

## API 接口

### 绘图指令 API

#### 生成指令
```bash
POST /api/drawing-instructions
Content-Type: application/json

{
  "action": "generate",
  "data": {
    "features": [...],
    "options": {
      "s100Compatible": true
    }
  }
}
```

#### 验证指令
```bash
POST /api/drawing-instructions
Content-Type: application/json

{
  "action": "validate",
  "data": {
    "instructions": [...]
  }
}
```

#### 渲染指令
```bash
POST /api/drawing-instructions
Content-Type: application/json

{
  "action": "render",
  "data": {
    "instructions": [...],
    "renderOptions": {...}
  }
}
```

## 组件使用

### EnhancedMap 组件

```tsx
import EnhancedMap from '@/components/EnhancedMap'

function MyComponent() {
  return (
    <EnhancedMap
      initialFeatures={sampleFeatures}
      onFeaturesChange={handleFeaturesChange}
      onInstructionsGenerated={handleInstructionsGenerated}
      editable={true}
      height="600px"
      title="我的地图编辑器"
      description="使用描述"
    />
  )
}
```

### 组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `initialFeatures` | `DrawingFeature[]` | `[]` | 初始要素数组 |
| `onFeaturesChange` | `(features: DrawingFeature[]) => void` | - | 要素变化回调 |
| `onInstructionsGenerated` | `(instructions: DrawingInstruction[]) => void` | - | 指令生成回调 |
| `editable` | `boolean` | `true` | 是否启用编辑 |
| `height` | `string` | `"600px"` | 地图高度 |
| `title` | `string` | `"增强地图编辑器"` | 标题 |
| `description` | `string` | `"基于 Leaflet + leaflet-draw 的 GIS 数据编辑工具"` | 描述 |

## 样式定制

### CSS 变量
编辑器使用 CSS 变量进行样式定制：

```css
:root {
  --leaflet-draw-toolbar-bg: #ffffff;
  --leaflet-draw-toolbar-border: #cccccc;
  --leaflet-draw-toolbar-hover: #f0f0f0;
}
```

### 自定义样式
可以通过覆盖 CSS 类来自定义样式：

```css
.leaflet-draw-toolbar {
  /* 自定义工具栏样式 */
}

.leaflet-draw-draw-marker {
  /* 自定义点绘制工具样式 */
}

.leaflet-draw-draw-polygon {
  /* 自定义面绘制工具样式 */
}
```

## 最佳实践

### 1. 性能优化
- 避免在单个地图中绘制过多要素
- 使用合适的缩放级别和视图范围
- 定期清理不需要的要素

### 2. 数据管理
- 定期导出和备份要素数据
- 使用版本控制管理重要的地理数据
- 遵循 GeoJSON 标准格式

### 3. 用户体验
- 提供清晰的操作指引
- 使用适当的视觉反馈
- 支持撤销和重做操作

### 4. 安全考虑
- 验证导入的 GeoJSON 数据
- 限制用户权限和操作范围
- 记录重要的操作日志

## 故障排除

### 常见问题

#### 1. 地图不显示
- 检查网络连接
- 确认 Leaflet 资源正确加载
- 检查浏览器控制台错误

#### 2. 绘制工具不工作
- 确认 `editable` 属性设置为 `true`
- 检查 leaflet-draw 资源是否加载
- 验证用户权限

#### 3. 导入失败
- 检查 GeoJSON 格式是否正确
- 确认坐标系统是否一致
- 验证数据完整性

### 调试技巧

1. **浏览器开发者工具**: 使用控制台查看错误信息
2. **网络面板**: 检查资源加载情况
3. **React 开发工具**: 检查组件状态和属性

## 扩展开发

### 添加新的绘制工具
```typescript
// 在 EnhancedMap 组件中扩展
const customDrawTools = {
  customTool: {
    icon: 'custom-icon',
    title: '自定义工具',
    handler: handleCustomDraw
  }
}
```

### 集成后端服务
```typescript
// 使用绘图指令 API
const response = await fetch('/api/drawing-instructions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generate',
    data: { features, options }
  })
})
```

### 自定义渲染器
```typescript
// 实现自定义渲染逻辑
class CustomRenderer extends CanvasRenderer {
  async renderFeature(instruction: DrawingInstruction) {
    // 自定义渲染实现
  }
}
```

## 贡献指南

欢迎提交问题和改进建议！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。