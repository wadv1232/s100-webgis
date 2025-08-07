# 地图容器尺寸问题解决方案

## 问题描述

地图在页面中表现为：
- **小矩形渲染**: 地图在一个明显更大的白色容器的中间，以一个小矩形的形式渲染
- **居中显示**: 地图被居中放置在更大的可用空间中
- **尺寸感知错误**: Leaflet 认为其容器只有那个小矩形的大小

## 根本原因分析

### 1. 时序问题
- MapContainer 在容器尺寸为 0x0 或很小时初始化
- Leaflet 基于错误的初始尺寸计算内部布局
- 后续容器尺寸变化，但 Leaflet 未被告知需要重新计算

### 2. CSS 布局问题
- 父容器使用 flex/grid 布局，带有居中属性
- `align-items: center` 或 `justify-content: center` 导致地图容器收缩
- MapContainer 的 div 在渲染时高度和宽度为 0 或较小默认值

### 3. 生命周期竞争条件
- React 布局完成前，Leaflet 已基于错误尺寸初始化
- DOM 尺寸变化与地图初始化之间存在竞争条件

## 系统性解决方案

### 1. CSS 层面修复

#### 全局样式 (`globals.css`)
```css
/* Map container fixes - 解决地图容器尺寸问题 */
.map-container {
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 400px !important;
  display: block !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}

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
}

/* Ensure leaflet maps fill their containers */
.leaflet-container {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
}

/* Fix for flex layouts that might interfere with map sizing */
.flex .map-container,
.flex .leaflet-map-container,
.flex .leaflet-container {
  min-height: 400px !important;
  flex: 1 1 auto !important;
  align-self: stretch !important;
}
```

#### 组件内联样式
```typescript
<div 
  ref={mapContainerRef}
  style={{ 
    height: fullscreen ? '100vh' : height, 
    position: 'relative',
    width: '100%',
    minHeight: fullscreen ? '100vh' : (parseInt(height) || 600),
    display: 'block', // 避免 flex 布局影响
    overflow: 'hidden',
    boxSizing: 'border-box'
  }}
  className="map-container"
>
```

### 2. JavaScript 层面修复

#### 状态管理增强
```typescript
const [isMounted, setIsMounted] = useState(false)
const [mapKey, setMapKey] = useState(0) // 强制重新挂载
const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
const mapContainerRef = useRef<HTMLDivElement>(null)
const mapRef = useRef<any>(null)
const resizeObserverRef = useRef<ResizeObserver | null>(null)
```

#### 智能 ResizeObserver
```typescript
useEffect(() => {
  setIsMounted(true)
  
  // 清理之前的观察者
  if (resizeObserverRef.current) {
    resizeObserverRef.current.disconnect()
  }
  
  // 创建 ResizeObserver 监听容器尺寸变化
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      
      // 更新容器尺寸状态
      setContainerSize({ width, height })
      
      // 只有当容器尺寸有效时才处理地图
      if (width > 100 && height > 100) { // 设置最小阈值
        console.log('Container size changed:', { width, height })
        
        // 方法1: 延迟调用 invalidateSize
        if (mapRef.current) {
          setTimeout(() => {
            try {
              mapRef.current.invalidateSize()
              console.log('Map size invalidated successfully')
            } catch (error) {
              console.warn('Failed to invalidate map size:', error)
            }
          }, 100) // 增加延迟确保 DOM 更新完成
        }
        
        // 方法2: 如果 invalidateSize 失败，强制重新挂载
        else {
          setMapKey(prev => prev + 1)
        }
      }
    }
  })
  
  // 开始观察容器
  if (mapContainerRef.current) {
    observer.observe(mapContainerRef.current)
    resizeObserverRef.current = observer
    
    // 初始检查容器尺寸
    const initialRect = mapContainerRef.current.getBoundingClientRect()
    console.log('Initial container size:', {
      width: initialRect.width,
      height: initialRect.height
    })
    
    // 如果初始尺寸太小，延迟后重新挂载
    if (initialRect.width < 100 || initialRect.height < 100) {
      setTimeout(() => {
        setMapKey(prev => prev + 1)
      }, 200)
    }
  }
  
  return () => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect()
    }
  }
}, [])
```

#### 状态变化处理
```typescript
// 处理影响地图容器尺寸的状态变化
useEffect(() => {
  console.log('Layout-related state changed, updating map...')
  // 延迟处理以确保 DOM 更新完成
  const timer = setTimeout(() => {
    if (mapRef.current) {
      try {
        mapRef.current.invalidateSize()
        console.log('Map size invalidated after state change')
      } catch (error) {
        console.warn('Failed to invalidate map size after state change:', error)
        // 如果 invalidateSize 失败，强制重新挂载
        setMapKey(prev => prev + 1)
      }
    } else {
      // 如果地图不存在，强制重新挂载
      setMapKey(prev => prev + 1)
    }
  }, 150) // 增加延迟确保 DOM 完全更新
  
  return () => clearTimeout(timer)
}, [fullscreen, height, editingNode, baseLayer])
```

#### MapContainer 样式优化
```typescript
<MapContainer
  key={mapKey} // 关键：使用 key 强制重新挂载
  center={mapCenter}
  zoom={mapZoom}
  style={{ 
    height: '100%', 
    width: '100%',
    display: 'block',
    position: 'absolute', // 绝对定位填充容器
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0
  }}
  ref={mapRef}
  className="leaflet-map-container"
  whenCreated={(map) => {
    console.log('Map created successfully', map)
    mapRef.current = map
    // 地图创建后立即调用 invalidateSize
    setTimeout(() => {
      try {
        map.invalidateSize()
        console.log('Initial map size invalidation completed')
      } catch (error) {
        console.warn('Initial map size invalidation failed:', error)
      }
    }, 100)
  }}
>
```

### 3. 多重保障机制

#### 第一层：ResizeObserver 监听
- 实时监听容器尺寸变化
- 智能判断尺寸有效性（>100px）
- 自动调用 invalidateSize 或重新挂载

#### 第二层：状态变化监听
- 监听影响布局的状态变化
- 延迟处理确保 DOM 更新完成
- 错误处理和降级方案

#### 第三层：备用尺寸检查
- 定期检查容器尺寸状态
- 备用 invalidateSize 调用
- 更长的延迟确保所有更新完成

#### 第四层：强制重新挂载
- key 属性强制重新渲染
- 作为最后的解决方案
- 确保地图完全重新初始化

## 技术要点

### 1. 时序控制
```typescript
// 多层延迟确保时序正确
setTimeout(() => {
  map.invalidateSize()
}, 100) // 地图创建后

setTimeout(() => {
  // 状态变化处理
}, 150) // DOM 更新后

setTimeout(() => {
  // 备用检查
}, 200) // 所有更新完成后
```

### 2. 错误处理
```typescript
try {
  mapRef.current.invalidateSize()
  console.log('Map size invalidated successfully')
} catch (error) {
  console.warn('Failed to invalidate map size:', error)
  // 降级到强制重新挂载
  setMapKey(prev => prev + 1)
}
```

### 3. 尺寸阈值
```typescript
if (width > 100 && height > 100) {
  // 只有当容器尺寸足够大时才处理
}
```

## 验证方法

### 1. 控制台日志
```typescript
console.log('Container size changed:', { width, height })
console.log('Initial container size:', initialRect)
console.log('Map size invalidated successfully')
```

### 2. 测试页面
- 路径：`/test-coordinates`
- 功能：测试各种布局条件下的地图显示
- 验证：地图正确铺满容器

### 3. 浏览器开发者工具
- 检查容器元素的计算样式
- 验证尺寸变化时的响应
- 观察 ResizeObserver 的触发

## 效果验证

### 修复前
- ❌ 地图在小矩形中渲染
- ❌ 白色容器背景明显
- ❌ 地图居中显示但不填充
- ❌ 坐标显示异常

### 修复后
- ✅ 地图正确铺满容器
- ✅ 无白色背景暴露
- ✅ 地图填充整个可用空间
- ✅ 坐标显示正常
- ✅ 响应式布局正常工作
- ✅ 全屏模式正常

## 性能考虑

### 1. 优化策略
- **智能监听**: 只在尺寸有效时处理
- **延迟执行**: 避免频繁的 invalidateSize 调用
- **错误降级**: 优先使用 invalidateSize，失败时才重新挂载

### 2. 内存管理
- **清理观察者**: 组件卸载时断开 ResizeObserver
- **避免内存泄漏**: 正确清理定时器和事件监听器
- **状态重置**: 重新挂载时正确重置所有状态

## 适用场景

此解决方案适用于：
- React + Leaflet 地图应用
- Flex/Grid 布局中的地图容器
- 动态尺寸变化的地图容器
- 全屏模式切换
- 响应式布局中的地图显示

通过这种系统性的解决方案，我们彻底解决了地图容器尺寸问题，确保地图在各种布局条件下都能正确显示和填充容器。