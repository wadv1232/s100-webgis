# 地图配置系统

本项目提供了一个灵活的地图配置系统，支持多种底图服务，包括 OpenStreetMap、天地图、高德地图、腾讯地图、百度地图等。

## 功能特性

- 🗺️ **多底图支持**: 支持10+种地图服务
- 🔧 **灵活配置**: 通过环境变量和配置文件管理
- 🎨 **类型安全**: 完整的TypeScript类型定义
- 📱 **响应式设计**: 适配不同屏幕尺寸
- ⚡ **实时切换**: 动态切换底图图层
- 🔑 **密钥管理**: 安全的API密钥管理
- ⚠️ **配置验证**: 自动检测配置问题

## 文件结构

```
config/
├── map-config.ts              # 地图图层配置
├── map-env.ts                 # 环境变量配置
└── map-config-README.md       # 说明文档

src/
├── hooks/
│   └── useMapConfig.ts        # 地图配置Hook
└── components/maps/
    ├── MapLayerSelector.tsx   # 图层选择器组件
    └── EnhancedMapWithConfig.tsx # 增强地图组件

src/app/
└── map-config-example/
    └── page.tsx              # 示例页面

.env.example                  # 环境变量示例
```

## 快速开始

### 1. 环境变量配置

复制 `.env.example` 到 `.env.local` 并配置相应的API密钥：

```bash
cp .env.example .env.local
```

然后编辑 `.env.local` 文件：

```env
# 天地图配置
NEXT_PUBLIC_TIANDITU_ENABLED=false
NEXT_PUBLIC_TIANDITU_TOKEN=your_tianditu_token_here

# 高德地图配置
NEXT_PUBLIC_GAODE_MAP_ENABLED=true
NEXT_PUBLIC_GAODE_MAP_KEY=your_gaode_map_key_here

# 腾讯地图配置
NEXT_PUBLIC_TENCENT_MAP_ENABLED=true
NEXT_PUBLIC_TENCENT_MAP_KEY=your_tencent_map_key_here

# 百度地图配置
NEXT_PUBLIC_BAIDU_MAP_ENABLED=true
NEXT_PUBLIC_BAIDU_MAP_KEY=your_baidu_map_key_here
```

### 2. API密钥申请

#### 天地图
1. 访问 [天地图控制台](https://console.tianditu.gov.cn/api/key)
2. 注册开发者账号
3. 创建应用并获取token
4. 将token配置到环境变量中

#### 高德地图
1. 访问 [高德开放平台](https://lbs.amap.com/api/javascript-api/guide/create-project/key)
2. 注册开发者账号
3. 创建应用并获取key
4. 将key配置到环境变量中

#### 腾讯地图
1. 访问 [腾讯位置服务](https://lbs.qq.com/webApi/javascriptGL/glGuide/glBasic)
2. 注册开发者账号
3. 创建应用并获取key
4. 将key配置到环境变量中

#### 百度地图
1. 访问 [百度地图开放平台](https://lbsyun.baidu.com/apiconsole/key)
2. 注册开发者账号
3. 创建应用并获取AK
4. 将AK配置到环境变量中

### 3. 基本使用

#### 使用Hook

```tsx
import { useMapConfig } from '@/hooks/useMapConfig'

function MyMapComponent() {
  const {
    mapConfig,
    currentLayer,
    setCurrentLayer,
    getLayerUrl,
    configWarnings,
    isValidConfig
  } = useMapConfig()

  return (
    <div>
      {configWarnings.length > 0 && (
        <div className="warnings">
          {configWarnings.map((warning, index) => (
            <div key={index}>{warning}</div>
          ))}
        </div>
      )}
      
      <MapLayerSelector
        currentLayerId={currentLayer?.id || mapConfig.defaultLayer}
        onLayerChange={setCurrentLayer}
        mapConfig={mapConfig}
      />
    </div>
  )
}
```

#### 使用组件

```tsx
import { MapLayerSelector } from '@/components/maps/MapLayerSelector'
import EnhancedMapWithConfig from '@/components/maps/EnhancedMapWithConfig'

function MyMapPage() {
  const [currentLayerId, setCurrentLayerId] = useState('osm')
  
  return (
    <div>
      <MapLayerSelector
        currentLayerId={currentLayerId}
        onLayerChange={setCurrentLayerId}
        mapConfig={mapConfig}
      />
      
      <EnhancedMapWithConfig
        title="我的地图"
        description="使用配置系统的地图"
        height="600px"
      />
    </div>
  )
}
```

## 支持的地图服务

### 国际地图服务

| 服务 | 类型 | 需要密钥 | 描述 |
|------|------|----------|------|
| OpenStreetMap | 矢量 | 否 | 开源矢量地图 |
| OSM Humanitarian | 矢量 | 否 | 人道主义地图 |
| OpenTopoMap | 地形 | 否 | 开源地形图 |
| Esri Satellite | 卫星 | 否 | Esri卫星影像 |
| Esri Streets | 矢量 | 否 | Esri街道地图 |
| Esri Topographic | 地形 | 否 | Esri地形图 |
| CartoDB Light | 矢量 | 否 | CartoDB浅色主题 |
| CartoDB Dark | 矢量 | 否 | CartoDB深色主题 |
| Stamen Watercolor | 自定义 | 否 | 水彩风格地图 |
| Stamen Terrain | 地形 | 否 | Stamen地形风格 |

### 中国地图服务

| 服务 | 类型 | 需要密钥 | 描述 |
|------|------|----------|------|
| 天地图矢量 | 矢量 | 是 | 天地图矢量图层 |
| 天地图影像 | 卫星 | 是 | 天地图卫星影像 |
| 天地图地形 | 地形 | 是 | 天地图地形图层 |
| 高德地图 | 矢量 | 否 | 高德矢量地图 |
| 高德卫星图 | 卫星 | 否 | 高德卫星影像 |
| 高德卫星标注 | 卫星 | 否 | 高德卫星标注 |
| 高德实时路况 | 路况 | 否 | 高德实时路况 |
| 腾讯地图 | 矢量 | 否 | 腾讯矢量地图 |
| 腾讯卫星图 | 卫星 | 否 | 腾讯卫星影像 |
| 百度地图 | 矢量 | 否 | 百度矢量地图 |
| 百度卫星图 | 卫星 | 否 | 百度卫星影像 |

## 配置选项

### MapTileLayer 接口

```typescript
interface MapTileLayer {
  id: string                    // 图层唯一标识
  name: string                  // 图层显示名称
  type: 'vector' | 'satellite' | 'terrain' | 'traffic' | 'custom'  // 图层类型
  url: string                   // 图层URL模板
  attribution: string           // 版权信息
  maxZoom?: number             // 最大缩放级别
  minZoom?: number             // 最小缩放级别
  tileSize?: number            // 瓦片大小
  token?: string               // API密钥
  subdomains?: string[]        // 子域名
  options?: {                 // 其他选项
    [key: string]: any
  }
}
```

### MapConfig 接口

```typescript
interface MapConfig {
  defaultLayer: string         // 默认图层ID
  layers: MapTileLayer[]       // 所有可用图层
  center: [number, number]    // 默认中心点 [lat, lng]
  zoom: number                // 默认缩放级别
  minZoom: number             // 最小缩放级别
  maxZoom: number             // 最大缩放级别
}
```

## 高级用法

### 自定义图层

```typescript
import { getCompleteMapConfig, MapTileLayer } from '@/config/map-config'

// 添加自定义图层
const customLayer: MapTileLayer = {
  id: 'my-custom-layer',
  name: '自定义图层',
  type: 'custom',
  url: 'https://my-custom-tiles/{z}/{x}/{y}.png',
  attribution: '&copy; My Custom Tiles',
  maxZoom: 18,
  minZoom: 1
}

// 生成包含自定义图层的配置
const customConfig = getCompleteMapConfig({
  includeGaode: true,
  includeTencent: true,
  includeBaidu: true
})

// 添加自定义图层
customConfig.layers.push(customLayer)
```

### 条件图层

```typescript
import { getCompleteMapConfig } from '@/config/map-config'

// 根据用户权限动态配置
const userConfig = getCompleteMapConfig({
  includeTianditu: user.hasTiandituAccess,
  includeGaode: user.hasGaodeAccess,
  includeTencent: user.hasTencentAccess,
  includeBaidu: user.hasBaiduAccess,
  tiandituToken: user.tiandituToken,
  gaodeKey: user.gaodeKey,
  tencentKey: user.tencentKey,
  baiduKey: user.baiduKey
})
```

### 图层分组

```typescript
import { getLayersByType } from '@/config/map-config'

// 获取所有矢量图层
const vectorLayers = getLayersByType(mapConfig, 'vector')

// 获取所有卫星图层
const satelliteLayers = getLayersByType(mapConfig, 'satellite')

// 获取所有地形图层
const terrainLayers = getLayersByType(mapConfig, 'terrain')
```

## 故障排除

### 常见问题

#### 1. 图层无法加载

**问题**: 某些图层无法显示或加载失败

**解决方案**:
- 检查网络连接
- 确认API密钥是否正确配置
- 查看浏览器控制台是否有错误信息
- 检查CORS设置

#### 2. API密钥错误

**问题**: 配置了API密钥但仍然无法使用

**解决方案**:
- 确认API密钥是否有效
- 检查API密钥是否有足够的权限
- 确认域名是否在白名单中
- 检查API调用次数是否超限

#### 3. 配置警告

**问题**: 页面显示配置警告信息

**解决方案**:
- 查看具体的警告信息
- 根据提示配置相应的API密钥
- 检查环境变量格式是否正确

### 调试模式

启用调试模式以获取更详细的错误信息：

```tsx
const {
  mapConfig,
  envConfig,
  configWarnings,
  error
} = useMapConfig()

console.log('Map Config:', mapConfig)
console.log('Env Config:', envConfig)
console.log('Warnings:', configWarnings)
console.log('Error:', error)
```

## 示例页面

访问 `/map-config-example` 查看完整的示例页面，包括：

- 地图演示
- 图层管理
- 配置说明
- API文档

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

本项目采用 MIT 许可证。