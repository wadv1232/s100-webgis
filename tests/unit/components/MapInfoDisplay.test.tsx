import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapInfoDisplay from '@/components/MapInfoDisplay'
import { renderWithProviders } from '../../utils/testHelpers'

// 模拟 useMap hook
jest.mock('react-leaflet', () => ({
  ...jest.requireActual('react-leaflet'),
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
    on: jest.fn(),
    off: jest.fn()
  }))
}))

describe('MapInfoDisplay 组件', () => {
  const defaultProps = {
    showCursorCoordinates: true,
    showViewBounds: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该正确渲染组件', () => {
      renderWithProviders(<MapInfoDisplay {...defaultProps} />)
      
      expect(screen.getByText(/WGS84:/)).toBeInTheDocument()
      expect(screen.getByText(/视图范围:/)).toBeInTheDocument()
    })

    it('当 showCursorCoordinates 为 false 时不应显示坐标', () => {
      renderWithProviders(
        <MapInfoDisplay 
          showCursorCoordinates={false} 
          showViewBounds={true} 
        />
      )
      
      expect(screen.queryByText(/WGS84:/)).not.toBeInTheDocument()
      expect(screen.getByText(/视图范围:/)).toBeInTheDocument()
    })

    it('当 showViewBounds 为 false 时不应显示视图范围', () => {
      renderWithProviders(
        <MapInfoDisplay 
          showCursorCoordinates={true} 
          showViewBounds={false} 
        />
      )
      
      expect(screen.getByText(/WGS84:/)).toBeInTheDocument()
      expect(screen.queryByText(/视图范围:/)).not.toBeInTheDocument()
    })

    it('当两个属性都为 false 时不应显示任何信息', () => {
      renderWithProviders(
        <MapInfoDisplay 
          showCursorCoordinates={false} 
          showViewBounds={false} 
        />
      )
      
      expect(screen.queryByText(/WGS84:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/视图范围:/)).not.toBeInTheDocument()
    })
  })

  describe('坐标显示功能', () => {
    it('应该显示初始坐标', () => {
      renderWithProviders(<MapInfoDisplay {...defaultProps} />)
      
      const coordinateDisplay = screen.getByText(/WGS84:/)
      expect(coordinateDisplay).toBeInTheDocument()
      expect(coordinateDisplay).toHaveTextContent('31.200000')
      expect(coordinateDisplay).toHaveTextContent('121.500000')
    })

    it('应该正确处理鼠标移动事件', async () => {
      const mockMap = {
        on: jest.fn(),
        off: jest.fn(),
        getContainer: jest.fn(() => ({
          getBoundingClientRect: () => ({
            width: 800,
            height: 600
          })
        }))
      }

      // 重新模拟 useMap hook
      const { useMap } = require('react-leaflet')
      useMap.mockReturnValue(mockMap)

      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      // 验证事件监听器已添加
      expect(mockMap.on).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(mockMap.on).toHaveBeenCalledWith('mouseout', expect.any(Function))
    })

    it('应该正确处理鼠标移出事件', async () => {
      const mockMap = {
        on: jest.fn(),
        off: jest.fn(),
        getContainer: jest.fn(() => ({
          getBoundingClientRect: () => ({
            width: 800,
            height: 600
          })
        }))
      }

      const { useMap } = require('react-leaflet')
      useMap.mockReturnValue(mockMap)

      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      // 获取 mousemove 事件处理器
      const mousemoveHandler = mockMap.on.mock.calls.find(
        call => call[0] === 'mousemove'
      )?.[1]

      // 获取 mouseout 事件处理器
      const mouseoutHandler = mockMap.on.mock.calls.find(
        call => call[0] === 'mouseout'
      )?.[1]

      expect(mousemoveHandler).toBeDefined()
      expect(mouseoutHandler).toBeDefined()

      // 模拟鼠标移出事件
      if (mouseoutHandler) {
        mouseoutHandler()
        await waitFor(() => {
          const coordinateDisplay = screen.getByText(/WGS84:/)
          expect(coordinateDisplay).toHaveTextContent('--')
        })
      }
    })
  })

  describe('坐标标准化功能', () => {
    it('应该正确标准化超出范围的经度', () => {
      const mockMap = {
        on: jest.fn((event, handler) => {
          if (event === 'mousemove') {
            // 模拟超出范围的经度
            handler({
              latlng: { lat: 31.2000, lng: 400.0 }
            })
          }
        }),
        off: jest.fn(),
        getContainer: jest.fn(() => ({
          getBoundingClientRect: () => ({
            width: 800,
            height: 600
          })
        }))
      }

      const { useMap } = require('react-leaflet')
      useMap.mockReturnValue(mockMap)

      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      // 验证经度被标准化为 40.0 (400 - 360)
      const coordinateDisplay = screen.getByText(/WGS84:/)
      expect(coordinateDisplay).toHaveTextContent('40.000000')
    })

    it('应该正确标准化负的超出范围经度', () => {
      const mockMap = {
        on: jest.fn((event, handler) => {
          if (event === 'mousemove') {
            // 模拟负的超出范围经度
            handler({
              latlng: { lat: 31.2000, lng: -400.0 }
            })
          }
        }),
        off: jest.fn(),
        getContainer: jest.fn(() => ({
          getBoundingClientRect: () => ({
            width: 800,
            height: 600
          })
        }))
      }

      const { useMap } = require('react-leaflet')
      useMap.mockReturnValue(mockMap)

      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      // 验证经度被标准化为 -40.0 (-400 + 360)
      const coordinateDisplay = screen.getByText(/WGS84:/)
      expect(coordinateDisplay).toHaveTextContent('-40.000000')
    })

    it('应该正确标准化超出范围的纬度', () => {
      const mockMap = {
        on: jest.fn((event, handler) => {
          if (event === 'mousemove') {
            // 模拟超出范围的纬度
            handler({
              latlng: { lat: 100.0, lng: 121.5000 }
            })
          }
        }),
        off: jest.fn(),
        getContainer: jest.fn(() => ({
          getBoundingClientRect: () => ({
            width: 800,
            height: 600
          })
        }))
      }

      const { useMap } = require('react-leaflet')
      useMap.mockReturnValue(mockMap)

      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      // 验证纬度被限制为 90.0
      const coordinateDisplay = screen.getByText(/WGS84:/)
      expect(coordinateDisplay).toHaveTextContent('90.000000')
    })

    it('应该正确标准化负的超出范围纬度', () => {
      const mockMap = {
        on: jest.fn((event, handler) => {
          if (event === 'mousemove') {
            // 模拟负的超出范围纬度
            handler({
              latlng: { lat: -100.0, lng: 121.5000 }
            })
          }
        }),
        off: jest.fn(),
        getContainer: jest.fn(() => ({
          getBoundingClientRect: () => ({
            width: 800,
            height: 600
          })
        }))
      }

      const { useMap } = require('react-leaflet')
      useMap.mockReturnValue(mockMap)

      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      // 验证纬度被限制为 -90.0
      const coordinateDisplay = screen.getByText(/WGS84:/)
      expect(coordinateDisplay).toHaveTextContent('-90.000000')
    })
  })

  describe('视图范围显示', () => {
    it('应该显示正确的视图范围', () => {
      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      const boundsDisplay = screen.getByText(/视图范围:/)
      expect(boundsDisplay).toBeInTheDocument()
      expect(boundsDisplay).toHaveTextContent('20.000000')
      expect(boundsDisplay).toHaveTextContent('45.000000')
      expect(boundsDisplay).toHaveTextContent('110.000000')
      expect(boundsDisplay).toHaveTextContent('125.000000')
    })

    it('应该正确格式化边界坐标', () => {
      const mockMap = {
        on: jest.fn(),
        off: jest.fn(),
        getCenter: jest.fn(() => ({ lat: 31.2000, lng: 121.5000 })),
        getZoom: jest.fn(() => 6),
        getBounds: jest.fn(() => ({
          getSouth: () => 20.123456,
          getNorth: () => 45.987654,
          getWest: () => 110.123456,
          getEast: () => 125.987654
        })),
        getContainer: jest.fn(() => ({
          getBoundingClientRect: () => ({
            width: 800,
            height: 600
          })
        }))
      }

      const { useMap } = require('react-leaflet')
      useMap.mockReturnValue(mockMap)

      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      const boundsDisplay = screen.getByText(/视图范围:/)
      expect(boundsDisplay).toHaveTextContent('20.123456')
      expect(boundsDisplay).toHaveTextContent('45.987654')
      expect(boundsDisplay).toHaveTextContent('110.123456')
      expect(boundsDisplay).toHaveTextContent('125.987654')
    })
  })

  describe('样式和布局', () => {
    it('应该应用正确的 CSS 类', () => {
      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      const coordinateDisplay = screen.getByText(/WGS84:/)
      const boundsDisplay = screen.getByText(/视图范围:/)

      expect(coordinateDisplay).toHaveClass('text-xs')
      expect(coordinateDisplay).toHaveClass('bg-black')
      expect(coordinateDisplay).toHaveClass('bg-opacity-50')
      
      expect(boundsDisplay).toHaveClass('text-xs')
      expect(boundsDisplay).toHaveClass('bg-black')
      expect(boundsDisplay).toHaveClass('bg-opacity-50')
    })

    it('应该正确定位在地图左下角', () => {
      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      const coordinateDisplay = screen.getByText(/WGS84:/)
      const boundsDisplay = screen.getByText(/视图范围:/)

      expect(coordinateDisplay).toHaveClass('bottom-2')
      expect(coordinateDisplay).toHaveClass('left-2')
      
      expect(boundsDisplay).toHaveClass('bottom-8')
      expect(boundsDisplay).toHaveClass('left-2')
    })
  })

  describe('响应式设计', () => {
    it('应该在小屏幕上调整样式', () => {
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      })

      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      const coordinateDisplay = screen.getByText(/WGS84:/)
      expect(coordinateDisplay).toBeInTheDocument()
    })
  })

  describe('无障碍访问', () => {
    it('应该为坐标显示提供适当的 ARIA 标签', () => {
      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      const coordinateDisplay = screen.getByText(/WGS84:/)
      expect(coordinateDisplay).toHaveAttribute('aria-label', '光标坐标')
    })

    it('应该为视图范围显示提供适当的 ARIA 标签', () => {
      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      const boundsDisplay = screen.getByText(/视图范围:/)
      expect(boundsDisplay).toHaveAttribute('aria-label', '视图范围')
    })
  })

  describe('性能优化', () => {
    it('应该在组件卸载时清理事件监听器', () => {
      const mockMap = {
        on: jest.fn(),
        off: jest.fn(),
        getContainer: jest.fn(() => ({
          getBoundingClientRect: () => ({
            width: 800,
            height: 600
          })
        }))
      }

      const { useMap } = require('react-leaflet')
      useMap.mockReturnValue(mockMap)

      const { unmount } = renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      // 卸载组件
      unmount()

      // 验证事件监听器被清理
      expect(mockMap.off).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(mockMap.off).toHaveBeenCalledWith('mouseout', expect.any(Function))
    })

    it('应该使用防抖处理频繁的鼠标移动事件', async () => {
      const mockMap = {
        on: jest.fn(),
        off: jest.fn(),
        getContainer: jest.fn(() => ({
          getBoundingClientRect: () => ({
            width: 800,
            height: 600
          })
        }))
      }

      const { useMap } = require('react-leaflet')
      useMap.mockReturnValue(mockMap)

      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      // 获取 mousemove 事件处理器
      const mousemoveHandler = mockMap.on.mock.calls.find(
        call => call[0] === 'mousemove'
      )?.[1]

      expect(mousemoveHandler).toBeDefined()

      // 模拟快速连续的鼠标移动事件
      if (mousemoveHandler) {
        mousemoveHandler({ latlng: { lat: 31.1, lng: 121.1 } })
        mousemoveHandler({ latlng: { lat: 31.2, lng: 121.2 } })
        mousemoveHandler({ latlng: { lat: 31.3, lng: 121.3 } })
      }

      // 验证最终显示的坐标（应该是最新的坐标）
      await waitFor(() => {
        const coordinateDisplay = screen.getByText(/WGS84:/)
        expect(coordinateDisplay).toHaveTextContent('31.300000')
        expect(coordinateDisplay).toHaveTextContent('121.300000')
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理地图对象不存在的情况', () => {
      const { useMap } = require('react-leaflet')
      useMap.mockReturnValue(null)

      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      // 组件应该仍然渲染，但不显示坐标信息
      expect(screen.queryByText(/WGS84:/)).not.toBeInTheDocument()
    })

    it('应该处理地图方法调用失败的情况', () => {
      const mockMap = {
        on: jest.fn(),
        off: jest.fn(),
        getContainer: jest.fn(() => {
          throw new Error('Container not found')
        }),
        getCenter: jest.fn(() => {
          throw new Error('Center not available')
        }),
        getBounds: jest.fn(() => {
          throw new Error('Bounds not available')
        })
      }

      const { useMap } = require('react-leaflet')
      useMap.mockReturnValue(mockMap)

      renderWithProviders(<MapInfoDisplay {...defaultProps} />)

      // 组件应该仍然渲染，但显示默认值
      expect(screen.getByText(/WGS84:/)).toBeInTheDocument()
      expect(screen.getByText(/视图范围:/)).toBeInTheDocument()
    })
  })
})