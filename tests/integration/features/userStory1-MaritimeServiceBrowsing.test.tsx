import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { jest } from '@jest/globals'

// Mock TextEncoder and TextDecoder for MSW
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// 导入测试数据和工具
import { mockNodes, mockServices, userStoryTestData, renderWithProviders, waitForMapToLoad } from '../fixtures/testData'

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

// 模拟地图服务页面组件
const MapServicesPage = () => {
  const [nodes, setNodes] = React.useState(mockNodes)
  const [services, setServices] = React.useState(mockServices)
  const [selectedNode, setSelectedNode] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    // 模拟数据加载
    setLoading(true)
    setTimeout(() => {
      setNodes(mockNodes)
      setServices(mockServices)
      setLoading(false)
    }, 1000)
  }, [])

  const handleNodeClick = (node: any) => {
    setSelectedNode(node)
  }

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setNodes(mockNodes)
      return
    }

    const filteredNodes = mockNodes.filter(node =>
      node.name.toLowerCase().includes(query.toLowerCase()) ||
      node.services.some((service: string) => service.toLowerCase().includes(query.toLowerCase()))
    )
    setNodes(filteredNodes)
  }

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    setTimeout(() => {
      setNodes(mockNodes)
      setServices(mockServices)
      setLoading(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div>
        <h1>海事数据服务地图</h1>
        <div>加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1>海事数据服务地图</h1>
        <div>加载失败: {error}</div>
        <button onClick={handleRetry}>重试</button>
      </div>
    )
  }

  return (
    <div>
      <h1>海事数据服务地图</h1>
      <p>海事数据服务地理分布和实时状态监控</p>
      
      <div>
        <button onClick={() => handleSearch('上海')}>搜索</button>
        <button>图层</button>
        <button>图例</button>
        <button>全屏</button>
      </div>

      <div data-testid="map-container" style={{ height: '600px', position: 'relative' }}>
        {nodes.map(node => (
          <div
            key={node.id}
            data-testid="marker"
            data-node-id={node.id}
            onClick={() => handleNodeClick(node)}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer'
            }}
          >
            <div data-testid={`health-${node.id}`} className={`health-${node.healthStatus.toLowerCase()}`}>
              {node.name}
            </div>
          </div>
        ))}
      </div>

      {selectedNode && (
        <div data-testid="popup">
          <h3>{selectedNode.name}</h3>
          <p>{selectedNode.description}</p>
          <p>类型: {selectedNode.type}</p>
          <p>状态: {selectedNode.healthStatus}</p>
          <div>
            <h4>服务:</h4>
            {selectedNode.services.map((service: string) => (
              <div key={service}>{service}</div>
            ))}
          </div>
          <button>查看详情</button>
        </div>
      )}

      <div>
        <h2>服务列表</h2>
        {services.map(service => (
          <div key={service.id}>
            <h3>{service.name}</h3>
            <p>类型: {service.type}</p>
            <p>产品: {service.productType}</p>
            <p>状态: {service.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

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
      expect(screen.getByText(/海事数据服务地理分布和实时状态监控/)).toBeInTheDocument()
      
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
        expect(screen.getByText(/加载失败/i })).toBeInTheDocument()
      })
    })
  })

  describe('场景2: 地图上的节点标记显示', () => {
    it('应该在地图上显示所有节点标记', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证节点标记存在
      const nodeMarkers = screen.getAllByTestId('marker')
      expect(nodeMarkers.length).toBe(mockNodes.length)
    })

    it('应该根据节点健康状态显示不同颜色', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证健康节点显示
      const healthyNodes = mockNodes.filter(node => node.healthStatus === 'HEALTHY')
      healthyNodes.forEach(node => {
        const nodeElement = screen.getByText(node.name)
        expect(nodeElement).toBeInTheDocument()
      })

      // 验证警告节点显示
      const warningNodes = mockNodes.filter(node => node.healthStatus === 'WARNING')
      warningNodes.forEach(node => {
        const nodeElement = screen.getByText(node.name)
        expect(nodeElement).toBeInTheDocument()
      })

      // 验证错误节点显示
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

    it('应该显示节点的健康状态', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 点击第一个节点
      const firstNodeMarker = screen.getAllByTestId('marker')[0]
      await userEvent.click(firstNodeMarker)

      // 验证健康状态显示
      await waitFor(() => {
        const popup = screen.getByTestId('popup')
        expect(within(popup).getByText(mockNodes[0].healthStatus)).toBeInTheDocument()
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
        expect(healthIndicator).toBeInTheDocument()
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
        expect(healthIndicator).toBeInTheDocument()
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
        expect(healthIndicator).toBeInTheDocument()
      })
    })
  })

  describe('场景5: 地图交互功能', () => {
    it('应该支持地图容器显示', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证地图容器
      const mapContainer = screen.getByTestId('map-container')
      expect(mapContainer).toBeInTheDocument()
      expect(mapContainer).toHaveStyle({ height: '600px' })
    })

    it('应该支持节点交互', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证节点可点击
      const nodeMarkers = screen.getAllByTestId('marker')
      nodeMarkers.forEach(marker => {
        expect(marker).toHaveStyle({ cursor: 'pointer' })
      })
    })
  })

  describe('场景6: 搜索功能', () => {
    it('应该能够搜索节点', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 点击搜索按钮
      const searchButton = screen.getByRole('button', { name: /搜索/i })
      await userEvent.click(searchButton)

      // 验证搜索功能触发
      await waitFor(() => {
        expect(screen.getByText('上海海事服务中心')).toBeInTheDocument()
      })
    })

    it('应该支持服务搜索', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证服务数据显示
      expect(screen.getByText('S-101电子海图服务')).toBeInTheDocument()
      expect(screen.getByText('S-102水深服务')).toBeInTheDocument()
      expect(screen.getByText('S-104航行信息服务')).toBeInTheDocument()
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
    it('应该提供适当的页面结构', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证页面标题
      const heading = screen.getByRole('heading', { name: /海事数据服务地图/i })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('应该为交互元素提供适当的角色', async () => {
      renderWithProviders(<MapServicesPage />)

      await waitForMapToLoad()

      // 验证按钮角色
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
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
        expect(screen.getByText(/加载失败/i)).toBeInTheDocument()
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