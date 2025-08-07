// 测试环境设置文件

import '@testing-library/jest-dom'
import '@testing-library/user-event'
import { jest } from '@jest/globals'
import { setupTestEnvironment, cleanupTestEnvironment } from './testHelpers'

// 设置测试环境
beforeAll(() => {
  setupTestEnvironment()
})

// 清理测试环境
afterAll(() => {
  cleanupTestEnvironment()
})

// 每个测试前清理
beforeEach(() => {
  // 清理所有模拟
  jest.clearAllMocks()
  jest.clearAllTimers()
  
  // 模拟 console.error 避免测试输出过多错误信息
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

// 每个测试后清理
afterEach(() => {
  // 恢复 console 方法
  jest.restoreAllMocks()
  
  // 清理定时器
  jest.useRealTimers()
})

// 模拟 Leaflet 库
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
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
  })),
  tileLayer: jest.fn(() => ({
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
  })),
  marker: jest.fn(() => ({
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
  })),
  popup: jest.fn(() => ({
    setContent: jest.fn(),
    setLatLng: jest.fn(),
    openOn: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn()
  })),
  geoJson: jest.fn(() => ({
    addTo: jest.fn(),
    remove: jest.fn(),
    setStyle: jest.fn(),
    bindPopup: jest.fn(),
    on: jest.fn(),
    off: jest.fn()
  })),
  control: {
    scale: jest.fn(() => ({
      addTo: jest.fn(),
      remove: jest.fn()
    })),
    zoom: jest.fn(() => ({
      addTo: jest.fn(),
      remove: jest.fn()
    }))
  },
  CRS: {
    EPSG4326: {
      projection: {
        project: jest.fn(latlng => ({ x: latlng.lng, y: latlng.lat })),
        unproject: jest.fn(point => ({ lat: point.y, lng: point.x }))
      },
      transformation: {
        transform: jest.fn(point => point),
        untransform: jest.fn(point => point)
      }
    },
    EPSG3857: {
      projection: {
        project: jest.fn(latlng => ({ x: latlng.lng, y: latlng.lat })),
        unproject: jest.fn(point => ({ lat: point.y, lng: point.x }))
      },
      transformation: {
        transform: jest.fn(point => point),
        untransform: jest.fn(point => point)
      }
    }
  },
  LatLng: jest.fn((lat, lng) => ({ lat, lng })),
  LatLngBounds: jest.fn((southWest, northEast) => ({
    getSouth: () => southWest.lat,
    getNorth: () => northEast.lat,
    getWest: () => southWest.lng,
    getEast: () => northEast.lng,
    contains: jest.fn(),
    intersects: jest.fn(),
    extend: jest.fn()
  })),
  Point: jest.fn((x, y) => ({ x, y })),
  Bounds: jest.fn((minX, minY, maxX, maxY) => ({
    min: { x: minX, y: minY },
    max: { x: maxX, y: maxY }
  })),
  Icon: jest.fn(() => ({
    options: {},
    createIcon: jest.fn(),
    createShadow: jest.fn()
  })),
  DivIcon: jest.fn(() => ({
    options: {},
    createIcon: jest.fn(),
    createShadow: jest.fn()
  }))
}))

// 模拟 react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: jest.fn(({ children, whenCreated, ...props }) => {
    // 模拟地图创建
    const mockMap = {
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
    }
    
    if (whenCreated) {
      setTimeout(() => whenCreated(mockMap), 0)
    }
    
    return (
      <div data-testid="map-container" {...props}>
        {children}
      </div>
    )
  }),
  TileLayer: jest.fn(({ children, ...props }) => (
    <div data-testid="tile-layer" {...props}>
      {children}
    </div>
  )),
  Marker: jest.fn(({ children, ...props }) => (
    <div data-testid="marker" {...props}>
      {children}
    </div>
  )),
  Popup: jest.fn(({ children, ...props }) => (
    <div data-testid="popup" {...props}>
      {children}
    </div>
  )),
  GeoJSON: jest.fn(({ children, ...props }) => (
    <div data-testid="geojson" {...props}>
      {children}
    </div>
  )),
  WMSTileLayer: jest.fn(({ children, ...props }) => (
    <div data-testid="wms-tile-layer" {...props}>
      {children}
    </div>
  )),
  ZoomControl: jest.fn(props => (
    <div data-testid="zoom-control" {...props} />
  )),
  ScaleControl: jest.fn(props => (
    <div data-testid="scale-control" {...props} />
  )),
  useMap: jest.fn(() => ({
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
    addLayer: jest.fn(),
    removeLayer: jest.fn()
  })),
  useMapEvents: jest.fn(() => ({}))
}))

// 模拟 next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<any>, options: any) => {
    const MockComponent = (props: any) => {
      const [Component, setComponent] = React.useState<any>(null)
      
      React.useEffect(() => {
        loader().then(module => {
          setComponent(() => module.default || module)
        })
      }, [])
      
      if (Component) {
        return <Component {...props} />
      }
      
      return <div data-testid="dynamic-loading">Loading...</div>
    }
    
    MockComponent.displayName = 'DynamicComponent'
    return MockComponent
  }
}))

// 模拟 next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    query: {},
    pathname: '/',
    asPath: '/',
    route: '/'
  })
}))

// 模拟 fetch API
global.fetch = jest.fn()

// 模拟 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

// 模拟 IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {}
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

// 模拟 URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// 模拟 window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
})

// 模拟 window.matchMedia
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

// 模拟 getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: jest.fn().mockImplementation(() => ({
    getPropertyValue: jest.fn()
  })),
  writable: true
})

// 设置全局测试超时
jest.setTimeout(10000)

// 忽略 React 18 的 act 警告
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})