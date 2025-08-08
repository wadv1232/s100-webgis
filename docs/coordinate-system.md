# 地图坐标系统实现说明

## 概述

本项目的地图系统采用了**混合坐标系统**的方法，结合了 Web Mercator 投影的地图瓦片和 WGS84 坐标系统的用户友好显示。

## 技术架构

### 1. 地图投影系统
- **地图瓦片投影**: Web Mercator (EPSG:3857)
- **显示坐标系统**: WGS84 (EPSG:4326)
- **坐标转换**: Leaflet 内部自动处理

### 2. 为什么采用这种架构？

#### Web Mercator (EPSG:3857)
- ✅ **标准网络地图投影**: 所有主流地图服务（OpenStreetMap、Google Maps、Esri等）都使用
- ✅ **瓦片兼容性**: 与标准地图瓦片完全兼容
- ✅ **性能优化**: 专为网络地图显示优化
- ✅ **工具支持**: 所有地图库和工具都原生支持

#### WGS84 (EPSG:4326) 显示
- ✅ **用户友好**: 地理坐标（经纬度）易于理解
- ✅ **标准地理坐标**: GPS、GIS系统通用
- ✅ **海事标准**: 符合海事行业的坐标表示习惯
- ✅ **数据交换**: 便于与其他系统交换数据

## 实现细节

### 1. 地图容器配置
```typescript
<MapContainer
  center={[31.2000, 121.5000]}  // WGS84 坐标
  zoom={2}
  // 不指定 CRS，使用默认的 Web Mercator
  style={{ height: '100%', width: '100%' }}
>
```

### 2. 坐标标准化处理
```typescript
// 经度标准化到 [-180, 180] 范围
const normalizeLongitude = (lng: number): number => {
  let normalized = lng % 360
  if (normalized > 180) {
    normalized -= 360
  } else if (normalized < -180) {
    normalized += 360
  }
  return normalized
}
```

### 3. 坐标显示组件
```typescript
// MapInfoDisplay 组件自动处理坐标转换和标准化
const formatCoordinate = (value: number, type: 'lat' | 'lng') => {
  let normalizedValue = value
  
  // 对经度进行标准化处理
  if (type === 'lng') {
    normalizedValue = normalizeLongitude(value)
  }
  
  // 转换为度分秒格式
  // ...
}
```

### 4. 比例尺显示
```typescript
<ScaleControl 
  position="bottomleft" 
  metric={true} 
  imperial={false}
  maxWidth={200}
/>
```

### 5. 坐标系统标注
```typescript
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <strong>显示坐标: WGS84</strong>'
/>
```

## 功能特性

### 1. 坐标标准化
- **自动处理**: 超出范围的经度值自动标准化
- **实时显示**: 鼠标移动时实时显示标准化后的坐标
- **多种格式**: 支持十进制和度分秒格式显示

### 2. 坐标转换示例
| 原始坐标 | 标准化后 | 显示格式 |
|---------|---------|---------|
| -88.032349, -326.667414 | -88.032349, 33.332586 | 88°1'56"S 33°19'57"E |
| 45.5, 400.0 | 45.5, 40.0 | 45°30'0"N 40°0'0"E |
| 31.2000, 121.5000 | 31.2000, 121.5000 | 31°12'0"N 121°30'0"E |

### 3. 用户界面元素
- **比例尺**: 左下角显示公制单位比例尺
- **坐标显示**: 左下角显示鼠标位置坐标
- **视图范围**: 右下角显示当前地图边界
- **坐标系统标注**: 地图 attribution 中明确标注

## 测试验证

### 1. 测试页面
- **路径**: `/test-coordinates`
- **功能**: 测试坐标标准化和显示功能
- **测试数据**: 包含正常和异常坐标点

### 2. 测试坐标点
```typescript
const testCoordinates = [
  { name: 'Shanghai', lat: 31.2000, lng: 121.5000 },
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Problematic', lat: -88.032349, lng: -326.667414 },
  { name: 'Another Issue', lat: 45.5, lng: 400.0 },
]
```

## 优势总结

### 1. 技术优势
- ✅ **兼容性**: 与所有标准地图瓦片服务兼容
- ✅ **稳定性**: 避免了 CRS 不兼容导致的错误
- ✅ **性能**: 使用优化的 Web Mercator 投影
- ✅ **标准化**: 自动处理坐标范围问题

### 2. 用户体验优势
- ✅ **直观性**: 显示用户熟悉的 WGS84 坐标
- ✅ **准确性**: 坐标标准化确保数据正确
- ✅ **信息丰富**: 提供比例尺、坐标显示等多种信息
- ✅ **实时性**: 动态更新坐标和视图信息

### 3. 海事应用优势
- ✅ **行业标准**: 符合海事坐标表示习惯
- ✅ **数据交换**: 便于与其他海事系统交换数据
- ✅ **全球覆盖**: 支持全球范围的坐标显示
- ✅ **精度保证**: 坐标标准化确保数据精度

## 注意事项

1. **坐标输入**: 系统接受任何范围的坐标值，会自动标准化
2. **显示格式**: 坐标显示为 WGS84 格式，但地图内部使用 Web Mercator
3. **比例尺**: 显示实际地面距离，不受坐标系统影响
4. **数据导出**: 导出的坐标数据均为 WGS84 格式

这种混合坐标系统的实现既保证了技术上的兼容性和稳定性，又提供了用户友好的坐标显示体验，特别适合海事等需要精确地理坐标的应用场景。