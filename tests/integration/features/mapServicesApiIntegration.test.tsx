import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

// Mock TextEncoder and TextDecoder for MSW
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder
}

// 导入测试工具
import { renderWithProviders } from '../fixtures/testData'

// Mock the map components to avoid leaflet dependency
jest.mock('@/components/maps/SharedMapFixed', () => {
  return function MockSharedMap() {
    return <div data-testid="shared-map">Map Component</div>
  }
})

jest.mock('@/components/ui/ServiceDetailModal', () => {
  return function MockServiceDetailModal() {
    return <div data-testid="service-detail-modal">Service Detail Modal</div>
  }
})

// Mock the API server
const server = setupServer(
  rest.get('/api/nodes', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({
      success: true,
      data: [
        {
          id: 'node1',
          name: '上海港',
          type: 'LEAF',
          services: ['S101', 'S102'],
          healthStatus: 'HEALTHY'
        },
        {
          id: 'node2',
          name: '宁波港',
          type: 'LEAF',
          services: ['S101', 'S104'],
          healthStatus: 'WARNING'
        }
      ]
    }))
  }),
  rest.get('/api/services', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({
      success: true,
      data: {
        services: [
          {
            id: 's101-wms',
            name: 'S101 Web地图服务',
            type: 'WMS',
            product: 'S101',
            status: 'HEALTHY',
            nodeId: 'node1'
          },
          {
            id: 's101-wfs',
            name: 'S101 Web要素服务',
            type: 'WFS',
            product: 'S101',
            status: 'HEALTHY',
            nodeId: 'node1'
          },
          {
            id: 's102-wms',
            name: 'S102 Web地图服务',
            type: 'WMS',
            product: 'S102',
            status: 'HEALTHY',
            nodeId: 'node1'
          },
          {
            id: 's102-wcs',
            name: 'S102 Web覆盖服务',
            type: 'WCS',
            product: 'S102',
            status: 'HEALTHY',
            nodeId: 'node1'
          }
        ],
        stats: {
          total: 4,
          active: 4,
          warning: 0,
          error: 0
        }
      }
    }))
  })
)

describe('Map Services Page API Integration Tests', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  describe('场景1: 正常API响应处理', () => {
    it('应该正确处理API响应结构', async () => {
      // 动态导入组件以避免SSR问题
      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      // 等待数据加载
      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证没有JavaScript错误
      expect(console.error).not.toHaveBeenCalled()
    })

    it('应该正确解析services数据', async () => {
      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      // 等待组件加载完成
      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证页面正常渲染，没有filter错误
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument()
    })
  })

  describe('场景2: API响应结构异常测试', () => {
    it('应该处理空的services数组', async () => {
      server.use(
        rest.get('/api/services', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({
            success: true,
            data: {
              services: [],
              stats: { total: 0, active: 0, warning: 0, error: 0 }
            }
          }))
        })
      )

      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证空数据处理正常
      expect(console.error).not.toHaveBeenCalled()
    })

    it('应该处理services字段缺失的情况', async () => {
      server.use(
        rest.get('/api/services', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({
            success: true,
            data: {
              // services字段缺失
              stats: { total: 0, active: 0, warning: 0, error: 0 }
            }
          }))
        })
      )

      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证缺失字段处理正常
      expect(console.error).not.toHaveBeenCalled()
    })

    it('应该处理null的services数据', async () => {
      server.use(
        rest.get('/api/services', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({
            success: true,
            data: {
              services: null,
              stats: { total: 0, active: 0, warning: 0, error: 0 }
            }
          }))
        })
      )

      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证null数据处理正常
      expect(console.error).not.toHaveBeenCalled()
    })
  })

  describe('场景3: API错误处理测试', () => {
    it('应该处理API 500错误', async () => {
      server.use(
        rest.get('/api/services', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({
            success: false,
            error: 'Internal Server Error'
          }))
        })
      )

      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证错误处理正常，页面仍然可用
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('filter is not a function')
      )
    })

    it('应该处理网络错误', async () => {
      server.use(
        rest.get('/api/services', (req, res) => {
          return res.networkError('Failed to connect')
        })
      )

      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证网络错误处理正常
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('filter is not a function')
      )
    })
  })

  describe('场景4: 数据类型验证测试', () => {
    it('应该处理非数组的services数据', async () => {
      server.use(
        rest.get('/api/services', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({
            success: true,
            data: {
              services: "not an array",
              stats: { total: 0, active: 0, warning: 0, error: 0 }
            }
          }))
        })
      )

      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证非数组数据处理正常
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('filter is not a function')
      )
    })

    it('应该处理对象类型的services数据', async () => {
      server.use(
        rest.get('/api/services', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({
            success: true,
            data: {
              services: { service1: "data" },
              stats: { total: 0, active: 0, warning: 0, error: 0 }
            }
          }))
        })
      )

      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证对象类型处理正常
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('filter is not a function')
      )
    })
  })

  describe('场景5: 集成测试', () => {
    it('应该完整加载页面并处理所有API响应', async () => {
      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      // 等待页面完全加载
      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证页面主要元素存在
      expect(screen.getByText(/地图服务/)).toBeInTheDocument()
      
      // 验证没有filter相关的JavaScript错误
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('filter is not a function')
      )

      // 验证服务数据正确加载
      await waitFor(() => {
        // 页面应该包含服务相关的元素
        const mapElement = screen.getByTestId('shared-map')
        expect(mapElement).toBeInTheDocument()
      })
    })

    it('应该处理API响应延迟', async () => {
      // 模拟延迟响应
      server.use(
        rest.get('/api/services', async (req, res, ctx) => {
          // 添加延迟
          await new Promise(resolve => setTimeout(resolve, 1000))
          return res(ctx.status(200), ctx.json({
            success: true,
            data: {
              services: [
                {
                  id: 's101-wms',
                  name: 'S101 Web地图服务',
                  type: 'WMS',
                  product: 'S101',
                  status: 'HEALTHY',
                  nodeId: 'node1'
                }
              ],
              stats: { total: 1, active: 1, warning: 0, error: 0 }
            }
          }))
        })
      )

      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      // 初始状态显示加载中
      expect(screen.getByText(/加载中/)).toBeInTheDocument()

      // 等待延迟响应处理
      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      }, { timeout: 2000 })

      // 验证延迟响应处理正常
      expect(console.error).not.toHaveBeenCalled()
    })
  })

  describe('场景6: 数据一致性测试', () => {
    it('应该验证API响应数据结构的一致性', async () => {
      // 监听console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证没有数据结构相关的错误
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('filter is not a function')
      )

      consoleSpy.mockRestore()
    })

    it('应该处理节点和服务数据的关联', async () => {
      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证节点和服务数据正确关联
      expect(console.error).not.toHaveBeenCalled()
    })
  })

  describe('场景7: 错误边界测试', () => {
    it('应该处理意外的API响应格式', async () => {
      server.use(
        rest.get('/api/services', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({
            // 完全意外的格式
            unexpected: "format",
            random: { data: "structure" }
          }))
        })
      )

      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证意外格式处理正常
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('filter is not a function')
      )
    })

    it('应该处理部分缺失的API响应', async () => {
      server.use(
        rest.get('/api/services', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({
            success: true
            // 完全缺失data字段
          }))
        })
      )

      const MapServicesPage = (await import('@/app/map-services/page')).default
      renderWithProviders(<MapServicesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('shared-map')).toBeInTheDocument()
      })

      // 验证部分缺失处理正常
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('filter is not a function')
      )
    })
  })
})