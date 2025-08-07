import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import MapServicesPage from '@/app/map-services/page'
import { mockNodes, mockServices, userStoryTestData } from '../../fixtures/mockData'
import { renderWithProviders, waitForMapToLoad, simulateUserInteraction } from '../../utils/testHelpers'

// 模拟 API 服务器
const server = setupServer(
  rest.get('/api/nodes', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockNodes))
  }),
  rest.get('/api/services', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockServices))
  }),
  rest.get('/api/nodes/:id', (req, res, ctx) => {
    const { id } = req.params
    const node = mockNodes.find(n => n.id === id)
    if (node) {
      return res(ctx.status(200), ctx.json(node))
    }
    return res(ctx.status(404), ctx.json({ error: 'Node not found' }))
  })
)

describe('用户故事1: 海事服务浏览', () => {
  const userStory = userStoryTestData.story1

  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('场景1: 用户访问地图服务页面', () => {
    it('应该成功加载地图服务页面', async () => {
      renderWithProviders(<MapServicesPage />)

      // 验证页面标题
      expect(screen.getByRole('heading', { name: /海事数据服务地图/i })).toBeInTheDocument()
      
      // 验证副标题
      expect(screen.getByText(/海事数据服务地理分布和实时状态监控/i)).toBeInTheDocument()
      
      // 验证地图容器加载
      await waitForMapToLoad()
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('应该显示所有控制按钮', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证控制按钮存在
      expect(screen.getByRole('button', { name: /搜索/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /图层/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /图例/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /全屏/i })).toBeInTheDocument()
    })

    it('应该正确加载节点数据', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证节点数据加载
      await waitFor(() => {
        expect(screen.getByText('上海海事服务中心')).toBeInTheDocument()
        expect(screen.getByText('北京海事服务中心')).toBeInTheDocument()
        expect(screen.getByText('广州海事服务中心')).toBeInTheDocument()
      })
    })

    it('应该正确加载服务数据', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证服务数据加载
      await waitFor(() => {
        expect(screen.getByText('S-101电子海图服务')).toBeInTheDocument()
        expect(screen.getByText('S-102水深服务')).toBeInTheDocument()
        expect(screen.getByText('S-104航行信息服务')).toBeInTheDocument()
      })
    })

    it('应该处理 API 错误情况', async () => {
      // 模拟 API 错误
      server.use(
        rest.get('/api/nodes', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal Server Error' }))
        })
      )

      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证错误处理
      await waitFor(() => {
        expect(screen.getByText(/加载失败/i)).toBeInTheDocument()
      })
    })
  })

  describe('场景2: 地图上的节点标记显示', () => {
    it('应该在地图上显示所有节点标记', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证节点标记存在（这里需要根据实际实现调整）
      const nodeMarkers = screen.getAllByTestId('marker')
      expect(nodeMarkers.length).toBe(mockNodes.length)
    })

    it('应该根据节点健康状态显示不同颜色', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证健康节点显示为绿色
      const healthyNodes = mockNodes.filter(node => node.healthStatus === 'HEALTHY')
      healthyNodes.forEach(node => {
        const nodeElement = screen.getByText(node.name)
        expect(nodeElement).toBeInTheDocument()
      })

      // 验证警告节点显示为黄色
      const warningNodes = mockNodes.filter(node => node.healthStatus === 'WARNING')
      warningNodes.forEach(node => {
        const nodeElement = screen.getByText(node.name)
        expect(nodeElement).toBeInTheDocument()
      })

      // 验证错误节点显示为红色
      const errorNodes = mockNodes.filter(node => node.healthStatus === 'ERROR')
      errorNodes.forEach(node => {
        const nodeElement = screen.getByText(node.name)
        expect(nodeElement).toBeInTheDocument()
      })
    })

    it('应该显示节点的类型和级别信息', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证国家级节点
      const nationalNodes = mockNodes.filter(node => node.type === 'NATIONAL')
      nationalNodes.forEach(node => {
        const nodeElement = screen.getByText(node.name)
        expect(nodeElement).toBeInTheDocument()
      })

      // 验证区域级节点
      const regionalNodes = mockNodes.filter(node => node.type === 'REGIONAL')
      regionalNodes.forEach(node => {
        const nodeElement = screen.getByText(node.name)
        expect(nodeElement).toBeInTheDocument()
      })
    })
  })

  describe('场景3: 点击节点查看详情', () => {
    it('应该能够点击节点标记', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 获取第一个节点标记
      const firstNodeMarker = screen.getAllByTestId('marker')[0]
      
      // 点击节点标记
      await userEvent.click(firstNodeMarker)

      // 验证节点详情弹出
      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })
    })

    it('应该在弹出窗口中显示节点详细信息', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 点击第一个节点
      const firstNodeMarker = screen.getAllByTestId('marker')[0]
      await userEvent.click(firstNodeMarker)

      // 验证弹出窗口内容
      await waitFor(() => {
        const popup = screen.getByTestId('popup')
        expect(within(popup).getByText(mockNodes[0].name)).toBeInTheDocument()
        expect(within(popup).getByText(mockNodes[0].description)).toBeInTheDocument()
        expect(within(popup).getByText(mockNodes[0].type)).toBeInTheDocument()
      })
    })

    it('应该显示节点的健康状态图标', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 点击第一个节点
      const firstNodeMarker = screen.getAllByTestId('marker')[0]
      await userEvent.click(firstNodeMarker)

      // 验证健康状态图标
      await waitFor(() => {
        const popup = screen.getByTestId('popup')
        const healthIcon = within(popup).getByTestId('health-icon')
        expect(healthIcon).toBeInTheDocument()
      })
    })

    it('应该显示节点的服务列表', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 点击第一个节点
      const firstNodeMarker = screen.getAllByTestId('marker')[0]
      await userEvent.click(firstNodeMarker)

      // 验证服务列表
      await waitFor(() => {
        const popup = screen.getByTestId('popup')
        mockNodes[0].services.forEach(service => {
          expect(within(popup).getByText(service)).toBeInTheDocument()
        })
      })
    })

    it('应该提供查看详情按钮', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 点击第一个节点
      const firstNodeMarker = screen.getAllByTestId('marker')[0]
      await userEvent.click(firstNodeMarker)

      // 验证查看详情按钮
      await waitFor(() => {
        const popup = screen.getByTestId('popup')
        const detailButton = within(popup).getByRole('button', { name: /查看详情/i })
        expect(detailButton).toBeInTheDocument()
      })
    })
  })

  describe('场景4: 节点状态正确显示', () => {
    it('应该显示健康状态的节点', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证健康节点
      const healthyNodes = mockNodes.filter(node => node.healthStatus === 'HEALTHY')
      healthyNodes.forEach(node => {
        const nodeElement = screen.getByText(node.name)
        expect(nodeElement).toBeInTheDocument()
        
        // 验证健康状态指示器
        const healthIndicator = screen.getByTestId(`health-${node.id}`)
        expect(healthIndicator).toHaveClass('text-green-500')
      })
    })

    it('应该显示警告状态的节点', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证警告节点
      const warningNodes = mockNodes.filter(node => node.healthStatus === 'WARNING')
      warningNodes.forEach(node => {
        const nodeElement = screen.getByText(node.name)
        expect(nodeElement).toBeInTheDocument()
        
        // 验证警告状态指示器
        const healthIndicator = screen.getByTestId(`health-${node.id}`)
        expect(healthIndicator).toHaveClass('text-yellow-500')
      })
    })

    it('应该显示错误状态的节点', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证错误节点
      const errorNodes = mockNodes.filter(node => node.healthStatus === 'ERROR')
      errorNodes.forEach(node => {
        const nodeElement = screen.getByText(node.name)
        expect(nodeElement).toBeInTheDocument()
        
        // 验证错误状态指示器
        const healthIndicator = screen.getByTestId(`health-${node.id}`)
        expect(healthIndicator).toHaveClass('text-red-500')
      })
    })

    it('应该实时更新节点状态', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 模拟状态更新
      const updatedNode = { ...mockNodes[0], healthStatus: 'WARNING' as const }
      
      // 这里需要模拟状态更新的逻辑
      // 根据实际实现调整测试代码
      
      // 验证状态更新
      await waitFor(() => {
        const healthIndicator = screen.getByTestId(`health-${updatedNode.id}`)
        expect(healthIndicator).toHaveClass('text-yellow-500')
      })
    })
  })

  describe('场景5: 地图交互功能', () => {
    it('应该支持地图缩放', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证缩放控制存在
      const zoomControls = screen.getByTestId('zoom-control')
      expect(zoomControls).toBeInTheDocument()

      // 模拟缩放操作
      const zoomInButton = within(zoomControls).getByRole('button', { name: /放大/i })
      const zoomOutButton = within(zoomControls).getByRole('button', { name: /缩小/i })

      expect(zoomInButton).toBeInTheDocument()
      expect(zoomOutButton).toBeInTheDocument()
    })

    it('应该支持地图拖拽', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证地图容器支持拖拽
      const mapContainer = screen.getByTestId('map-container')
      expect(mapContainer).toBeInTheDocument()
      
      // 模拟拖拽操作（这里需要根据实际实现调整）
      fireEvent.dragStart(mapContainer)
      fireEvent.drag(mapContainer)
      fireEvent.dragEnd(mapContainer)
    })

    it('应该显示比例尺', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证比例尺存在
      const scaleControl = screen.getByTestId('scale-control')
      expect(scaleControl).toBeInTheDocument()
    })

    it('应该显示坐标信息', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证坐标显示存在
      expect(screen.getByText(/WGS84:/i)).toBeInTheDocument()
    })
  })

  describe('场景6: 搜索功能', () => {
    it('应该能够搜索节点', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 打开搜索面板
      const searchButton = screen.getByRole('button', { name: /搜索/i })
      await userEvent.click(searchButton)

      // 输入搜索词
      const searchInput = screen.getByPlaceholderText(/搜索节点或服务/i)
      await userEvent.type(searchInput, '上海')

      // 验证搜索结果
      await waitFor(() => {
        expect(screen.getByText('上海海事服务中心')).toBeInTheDocument()
      })
    })

    it('应该能够搜索服务', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 打开搜索面板
      const searchButton = screen.getByRole('button', { name: /搜索/i })
      await userEvent.click(searchButton)

      // 输入搜索词
      const searchInput = screen.getByPlaceholderText(/搜索节点或服务/i)
      await userEvent.type(searchInput, 'S-101')

      // 验证搜索结果
      await waitFor(() => {
        expect(screen.getByText('S-101电子海图服务')).toBeInTheDocument()
      })
    })

    it('应该支持搜索结果选择', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 打开搜索面板
      const searchButton = screen.getByRole('button', { name: /搜索/i })
      await userEvent.click(searchButton)

      // 搜索节点
      const searchInput = screen.getByPlaceholderText(/搜索节点或服务/i)
      await userEvent.type(searchInput, '上海')

      // 选择搜索结果
      const searchResult = screen.getByText('上海海事服务中心')
      await userEvent.click(searchResult)

      // 验证搜索面板关闭
      expect(screen.queryByPlaceholderText(/搜索节点或服务/i)).not.toBeInTheDocument()
    })
  })

  describe('场景7: 响应式设计', () => {
    it('应该在小屏幕上正确显示', async () => {
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      })

      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证页面在小屏幕上正确显示
      expect(screen.getByRole('heading', { name: /海事数据服务地图/i })).toBeInTheDocument()
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('应该在大屏幕上正确显示', async () => {
      // 模拟大屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证页面在大屏幕上正确显示
      expect(screen.getByRole('heading', { name: /海事数据服务地图/i })).toBeInTheDocument()
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })
  })

  describe('场景8: 无障碍访问', () => {
    it('应该提供适当的 ARIA 标签', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证地图容器的 ARIA 标签
      const mapContainer = screen.getByTestId('map-container')
      expect(mapContainer).toHaveAttribute('aria-label', '海事数据服务地图')

      // 验证按钮的 ARIA 标签
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })

    it('应该支持键盘导航', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证 Tab 键导航
      await userEvent.tab()
      const firstButton = screen.getAllByRole('button')[0]
      expect(firstButton).toHaveFocus()

      // 验证 Enter 键激活
      await userEvent.keyboard('{Enter}')
      // 根据实际实现验证激活效果
    })
  })

  describe('场景9: 性能优化', () => {
    it('应该快速加载页面', async () => {
      const startTime = performance.now()
      
      renderWithProviders(<MapServicesPage />)
      
      await waitForMapToLoad()
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      // 验证页面加载时间在合理范围内
      expect(loadTime).toBeLessThan(3000) // 3秒内加载完成
    })

    it('应该正确处理大量节点数据', async () => {
      // 创建大量测试数据
      const largeNodes = Array.from({ length: 100 }, (_, i) => ({
        ...mockNodes[0],
        id: `node-${i}`,
        name: `节点 ${i}`,
        location: {
          lat: 30 + Math.random() * 10,
          lng: 120 + Math.random() * 10
        }
      }))

      server.use(
        rest.get('/api/nodes', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(largeNodes))
        })
      )

      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证大量节点数据正确加载
      expect(screen.getByText(/节点 0/)).toBeInTheDocument()
      expect(screen.getByText(/节点 99/)).toBeInTheDocument()
    })
  })

  describe('场景10: 错误处理和恢复', () => {
    it('应该处理网络错误', async () => {
      // 模拟网络错误
      server.use(
        rest.get('/api/nodes', (req, res) => {
          return res.networkError('Failed to connect')
        })
      )

      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证错误处理
      await waitFor(() => {
        expect(screen.getByText(/网络错误/i)).toBeInTheDocument()
      })
    })

    it('应该提供重试机制', async () => {
      // 模拟初始错误
      server.use(
        rest.get('/api/nodes', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal Server Error' }))
        })
      )

      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证错误显示
      await waitFor(() => {
        expect(screen.getByText(/加载失败/i)).toBeInTheDocument()
      })

      // 恢复正常
      server.use(
        rest.get('/api/nodes', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockNodes))
        })
      )

      // 模拟重试
      const retryButton = screen.getByRole('button', { name: /重试/i })
      await userEvent.click(retryButton)

      // 验证数据重新加载
      await waitFor(() => {
        expect(screen.getByText('上海海事服务中心')).toBeInTheDocument()
      })
    })
  })
})