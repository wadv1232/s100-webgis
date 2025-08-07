// 测试辅助函数和工具

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { jest } from '@jest/globals'

// 自定义渲染函数，包含提供者
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    ...options,
    // 这里可以添加需要的提供者，如 ThemeProvider, QueryProvider 等
  })
}

// 等待地图加载完成的辅助函数
export const waitForMapToLoad = async () => {
  // 在实际实现中，这里会等待地图容器出现
  return new Promise(resolve => setTimeout(resolve, 100))
}

// 等待异步操作完成的辅助函数
export const waitForAsync = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// 创建模拟的 Leaflet 地图对象
export const createMockMap = () => ({
  getContainer: jest.fn(() => ({
    getBoundingClientRect: () => ({
      width: 800,
      height: 600
    })
  })),
  getCenter: jest.fn(() => ({ lat: 31.2000, lng: 121.5000 })),
  getZoom: jest.fn(() => 6),
  getBounds: jest.fn(() => ({
    getSouth: () => 20,
    getNorth: () => 45,
    getWest: () => 110,
    getEast: () => 125
  })),
  setView: jest.fn(),
  invalidateSize: jest.fn(),
  setMaxBounds: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  remove: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  eachLayer: jest.fn(),
  openPopup: jest.fn(),
  closePopup: jest.fn(),
  fitBounds: jest.fn(),
  panTo: jest.fn(),
  zoomIn: jest.fn(),
  zoomOut: jest.fn(),
  setZoom: jest.fn()
})

// 创建模拟的 Leaflet 瓦片层
export const createMockTileLayer = () => ({
  addTo: jest.fn(),
  remove: jest.fn(),
  setOpacity: jest.fn(),
  setZIndex: jest.fn(),
  bringToFront: jest.fn(),
  bringToBack: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  getBounds: jest.fn(),
  redraw: jest.fn()
})

// 创建模拟的 Leaflet 标记
export const createMockMarker = () => ({
  addTo: jest.fn(),
  remove: jest.fn(),
  setLatLng: jest.fn(),
  getLatLng: jest.fn(() => ({ lat: 31.2000, lng: 121.5000 })),
  bindPopup: jest.fn(),
  openPopup: jest.fn(),
  closePopup: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  getPopup: jest.fn()
})

// 创建模拟的 Leaflet 弹出窗口
export const createMockPopup = () => ({
  setContent: jest.fn(),
  setLatLng: jest.fn(),
  openOn: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  remove: jest.fn()
})

// 模拟 ResizeObserver
export const createMockResizeObserver = () => {
  return class ResizeObserver {
    observe = jest.fn()
    unobserve = jest.fn()
    disconnect = jest.fn()
  }
}

// 模拟 IntersectionObserver
export const createMockIntersectionObserver = () => {
  return class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {}
    observe = jest.fn()
    unobserve = jest.fn()
    disconnect = jest.fn()
  }
}

// 生成随机测试数据
export const generateRandomCoordinate = () => ({
  lat: Math.random() * 180 - 90,
  lng: Math.random() * 360 - 180
})

// 生成随机节点数据
export const generateRandomNode = () => ({
  id: `node-${Math.random().toString(36).substr(2, 9)}`,
  name: `Node ${Math.floor(Math.random() * 1000)}`,
  type: ['NATIONAL', 'REGIONAL', 'LEAF'][Math.floor(Math.random() * 3)],
  level: Math.floor(Math.random() * 4) + 1,
  description: `Test node description ${Math.floor(Math.random() * 100)}`,
  healthStatus: ['HEALTHY', 'WARNING', 'ERROR'][Math.floor(Math.random() * 3)],
  services: ['S-101', 'S-102', 'S-104', 'S-111', 'S-124']
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 1),
  location: generateRandomCoordinate()
})

// 生成随机服务数据
export const generateRandomService = () => ({
  id: `service-${Math.random().toString(36).substr(2, 9)}`,
  name: `Service ${Math.floor(Math.random() * 1000)}`,
  type: ['WMS', 'WFS', 'WCS'][Math.floor(Math.random() * 3)],
  product: ['S-101', 'S-102', 'S-104', 'S-111', 'S-124'][Math.floor(Math.random() * 5)],
  status: ['ACTIVE', 'MAINTENANCE', 'ERROR'][Math.floor(Math.random() * 3)],
  endpoint: `https://service-${Math.floor(Math.random() * 100)}.example.com/wms`,
  version: '1.3.0',
  formats: ['image/png', 'image/jpeg'],
  nodeId: `node-${Math.random().toString(36).substr(2, 9)}`
})

// 深度比较两个对象是否相等
export const deepEqual = (obj1: any, obj2: any): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

// 模拟 API 响应延迟
export const simulateApiDelay = (response: any, delay: number = 100) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(response), delay)
  })
}

// 模拟 API 错误
export const simulateApiError = (error: any, delay: number = 100) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(error), delay)
  })
}

// 创建模拟的 fetch 函数
export const createMockFetch = (responses: Record<string, any>) => {
  return jest.fn().mockImplementation((url: string) => {
    const response = responses[url]
    if (response) {
      return Promise.resolve({
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        json: () => Promise.resolve(response.data || response.error)
      })
    }
    return Promise.reject(new Error(`No mock response for ${url}`))
  })
}

// 验证坐标标准化
export const validateCoordinateNormalization = (lat: number, lng: number) => {
  const normalizedLat = Math.max(-90, Math.min(90, lat))
  const normalizedLng = ((lng % 360) + 360) % 360
  const finalLng = normalizedLng > 180 ? normalizedLng - 360 : normalizedLng
  
  return {
    lat: normalizedLat,
    lng: finalLng,
    isValid: normalizedLat >= -90 && normalizedLat <= 90 && finalLng >= -180 && finalLng <= 180
  }
}

// 模拟用户交互事件
export const simulateUserInteraction = {
  click: (element: HTMLElement) => {
    element.click()
  },
  type: (element: HTMLElement, text: string) => {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.value = text
      element.dispatchEvent(new Event('input', { bubbles: true }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
    }
  },
  hover: (element: HTMLElement) => {
    element.dispatchEvent(new Event('mouseenter', { bubbles: true }))
  },
  focus: (element: HTMLElement) => {
    element.focus()
  },
  blur: (element: HTMLElement) => {
    element.blur()
  }
}

// 测试用例装饰器
export const describeWithTimeout = (timeout: number) => {
  return (description: string, testFn: () => void) => {
    describe(description, () => {
      beforeEach(() => {
        jest.setTimeout(timeout)
      })
      
      testFn()
    })
  }
}

// 测试用例重试装饰器
export const itWithRetry = (retries: number) => {
  return (description: string, testFn: () => Promise<void>) => {
    it(description, async () => {
      let lastError: Error | null = null
      
      for (let i = 0; i < retries; i++) {
        try {
          await testFn()
          return
        } catch (error) {
          lastError = error as Error
          console.warn(`Test failed on attempt ${i + 1}:`, error)
        }
      }
      
      throw lastError
    })
  }
}

// 性能测试辅助函数
export const measurePerformance = (fn: () => void, iterations: number = 1000) => {
  const start = performance.now()
  
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  
  const end = performance.now()
  return {
    totalTime: end - start,
    averageTime: (end - start) / iterations,
    iterations
  }
}

// 内存使用测试辅助函数
export const measureMemoryUsage = () => {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage()
  }
  
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    return (performance as any).memory
  }
  
  return null
}

// 清理所有模拟
export const clearAllMocks = () => {
  jest.clearAllMocks()
  jest.clearAllTimers()
}

// 设置全局测试环境
export const setupTestEnvironment = () => {
  // 模拟 window 对象
  Object.defineProperty(window, 'ResizeObserver', {
    value: createMockResizeObserver(),
    writable: true
  })
  
  Object.defineProperty(window, 'IntersectionObserver', {
    value: createMockIntersectionObserver(),
    writable: true
  })
  
  // 模拟 matchMedia
  Object.defineProperty(window, 'matchMedia', {
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    })),
    writable: true
  })
  
  // 模拟 scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true
  })
}

// 清理测试环境
export const cleanupTestEnvironment = () => {
  clearAllMocks()
  jest.useRealTimers()
}

// 导出所有工具函数
export * from './mockData'