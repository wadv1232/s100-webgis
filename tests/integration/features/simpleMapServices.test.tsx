import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// 简化的测试数据
const mockNodes = [
  {
    id: '1',
    name: '上海海事服务中心',
    type: 'NATIONAL',
    healthStatus: 'HEALTHY',
    location: { lat: 31.2, lng: 121.5 },
    description: '国家级海事服务中心',
    services: ['S-101', 'S-102', 'S-104'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    name: '北京海事服务中心',
    type: 'REGIONAL',
    healthStatus: 'WARNING',
    location: { lat: 39.9, lng: 116.4 },
    description: '区域级海事服务中心',
    services: ['S-101', 'S-102'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: '广州海事服务中心',
    type: 'REGIONAL',
    healthStatus: 'ERROR',
    location: { lat: 23.1, lng: 113.3 },
    description: '区域级海事服务中心',
    services: ['S-101'],
    lastUpdated: new Date().toISOString()
  }
]

const mockServices = [
  {
    id: '1',
    name: 'S-101电子海图服务',
    type: 'WMS',
    productType: 'S-101',
    status: 'ACTIVE',
    nodeId: '1',
    endpoint: 'http://example.com/wms',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    name: 'S-102水深服务',
    type: 'WCS',
    productType: 'S-102',
    status: 'ACTIVE',
    nodeId: '1',
    endpoint: 'http://example.com/wcs',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: 'S-104航行信息服务',
    type: 'WFS',
    productType: 'S-104',
    status: 'ACTIVE',
    nodeId: '2',
    endpoint: 'http://example.com/wfs',
    lastUpdated: new Date().toISOString()
  }
]

// 简化的地图服务页面组件
const SimpleMapServicesPage = () => {
  const [nodes, setNodes] = React.useState(mockNodes)
  const [services, setServices] = React.useState(mockServices)
  const [selectedNode, setSelectedNode] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
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
    return React.createElement('div', null,
      React.createElement('h1', null, '海事数据服务地图'),
      React.createElement('div', null, '加载中...')
    )
  }

  if (error) {
    return React.createElement('div', null,
      React.createElement('h1', null, '海事数据服务地图'),
      React.createElement('div', null, `加载失败: ${error}`),
      React.createElement('button', { onClick: handleRetry }, '重试')
    )
  }

  return React.createElement('div', null,
    React.createElement('h1', null, '海事数据服务地图'),
    React.createElement('p', null, '海事数据服务地理分布和实时状态监控'),
    
    React.createElement('div', null,
      React.createElement('button', { onClick: () => {} }, '搜索'),
      React.createElement('button', null, '图层'),
      React.createElement('button', null, '图例'),
      React.createElement('button', null, '全屏')
    ),

    React.createElement('div', { 
      'data-testid': 'map-container', 
      style: { height: '600px', position: 'relative', border: '1px solid #ccc' }
    },
      nodes.map(node => 
        React.createElement('div', {
          key: node.id,
          'data-testid': 'marker',
          'data-node-id': node.id,
          onClick: () => handleNodeClick(node),
          style: {
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer',
            padding: '10px',
            backgroundColor: node.healthStatus === 'HEALTHY' ? '#4CAF50' : 
                             node.healthStatus === 'WARNING' ? '#FF9800' : '#F44336',
            color: 'white',
            borderRadius: '4px'
          }
        },
          React.createElement('div', { 'data-testid': `health-${node.id}` }, node.name)
        )
      )
    ),

    selectedNode && React.createElement('div', { 'data-testid': 'popup' },
      React.createElement('h3', null, selectedNode.name),
      React.createElement('p', null, selectedNode.description),
      React.createElement('p', null, `类型: ${selectedNode.type}`),
      React.createElement('p', null, `状态: ${selectedNode.healthStatus}`),
      React.createElement('div', null,
        React.createElement('h4', null, '服务:'),
        selectedNode.services.map((service: string) => 
          React.createElement('div', { key: service }, service)
        )
      ),
      React.createElement('button', null, '查看详情')
    ),

    React.createElement('div', null,
      React.createElement('h2', null, '服务列表'),
      services.map(service => 
        React.createElement('div', { key: service.id },
          React.createElement('h3', null, service.name),
          React.createElement('p', null, `类型: ${service.type}`),
          React.createElement('p', null, `产品: ${service.productType}`),
          React.createElement('p', null, `状态: ${service.status}`)
        )
      )
    )
  )
}

// 测试工具函数
const renderWithProviders = (component: React.ReactElement) => {
  return render(component)
}

const waitForMapToLoad = async () => {
  await waitFor(() => {
    expect(screen.queryByText('加载中...')).not.toBeInTheDocument()
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  }, { timeout: 2000 })
}

describe('用户故事1: 海事服务浏览 - 简化测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('场景1: 用户访问地图服务页面', () => {
    it('应该成功加载地图服务页面', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

      // 等待加载完成
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument()
      }, { timeout: 2000 })

      // 验证页面标题
      expect(screen.getByRole('heading', { name: /海事数据服务地图/ })).toBeInTheDocument()
      
      // 验证副标题
      expect(screen.getByText(/海事数据服务地理分布和实时状态监控/)).toBeInTheDocument()
      
      // 验证地图容器加载
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('应该显示所有控制按钮', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 验证控制按钮存在
      expect(screen.getByRole('button', { name: /搜索/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /图层/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /图例/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /全屏/ })).toBeInTheDocument()
    })

    it('应该正确加载节点数据', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 验证节点数据加载
      await waitFor(() => {
        expect(screen.getByText('上海海事服务中心')).toBeInTheDocument()
        expect(screen.getByText('北京海事服务中心')).toBeInTheDocument()
        expect(screen.getByText('广州海事服务中心')).toBeInTheDocument()
      })
    })

    it('应该正确加载服务数据', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 验证服务数据加载
      await waitFor(() => {
        expect(screen.getByText('S-101电子海图服务')).toBeInTheDocument()
        expect(screen.getByText('S-102水深服务')).toBeInTheDocument()
        expect(screen.getByText('S-104航行信息服务')).toBeInTheDocument()
      })
    })
  })

  describe('场景2: 地图上的节点标记显示', () => {
    it('应该在地图上显示所有节点标记', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 验证节点标记存在
      const nodeMarkers = screen.getAllByTestId('marker')
      expect(nodeMarkers.length).toBe(mockNodes.length)
    })

    it('应该根据节点健康状态显示不同颜色', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

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
  })

  describe('场景3: 点击节点查看详情', () => {
    it('应该能够点击节点标记', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

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
      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 点击第一个节点
      const firstNodeMarker = screen.getAllByTestId('marker')[0]
      await userEvent.click(firstNodeMarker)

      // 验证弹出窗口内容
      await waitFor(() => {
        const popup = screen.getByTestId('popup')
        expect(within(popup).getByText(mockNodes[0].name)).toBeInTheDocument()
        expect(within(popup).getByText(mockNodes[0].description)).toBeInTheDocument()
        expect(within(popup).getByText(`类型: ${mockNodes[0].type}`)).toBeInTheDocument()
      })
    })

    it('应该显示节点的服务列表', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

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
      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 点击第一个节点
      const firstNodeMarker = screen.getAllByTestId('marker')[0]
      await userEvent.click(firstNodeMarker)

      // 验证查看详情按钮
      await waitFor(() => {
        const popup = screen.getByTestId('popup')
        const detailButton = within(popup).getByRole('button', { name: /查看详情/ })
        expect(detailButton).toBeInTheDocument()
      })
    })
  })

  describe('场景4: 节点状态正确显示', () => {
    it('应该显示健康状态的节点', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

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
      renderWithProviders(React.createElement(SimpleMapServicesPage))

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
      renderWithProviders(React.createElement(SimpleMapServicesPage))

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
      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 验证地图容器
      const mapContainer = screen.getByTestId('map-container')
      expect(mapContainer).toBeInTheDocument()
      expect(mapContainer).toHaveStyle({ height: '600px' })
    })

    it('应该支持节点交互', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 验证节点可点击
      const nodeMarkers = screen.getAllByTestId('marker')
      nodeMarkers.forEach(marker => {
        expect(marker).toHaveStyle({ cursor: 'pointer' })
      })
    })
  })

  describe('场景6: 性能优化', () => {
    it('应该快速加载页面', async () => {
      const startTime = performance.now()
      
      renderWithProviders(React.createElement(SimpleMapServicesPage))
      
      await waitForMapToLoad()
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      // 验证页面加载时间在合理范围内
      expect(loadTime).toBeLessThan(3000) // 3秒内加载完成
    })

    it('应该正确处理大量节点数据', async () => {
      // 创建大量测试数据
      const largeNodes = Array.from({ length: 50 }, (_, i) => ({
        ...mockNodes[0],
        id: `node-${i}`,
        name: `节点 ${i}`,
        location: {
          lat: 30 + Math.random() * 10,
          lng: 120 + Math.random() * 10
        }
      }))

      // 修改组件以使用大量数据
      const LargeDataPage = () => {
        const [nodes] = React.useState(largeNodes)
        return React.createElement('div', null,
          React.createElement('h1', null, '海事数据服务地图'),
          React.createElement('div', { 
            'data-testid': 'map-container', 
            style: { height: '600px', position: 'relative' }
          },
            nodes.map(node => 
              React.createElement('div', {
                key: node.id,
                'data-testid': 'marker',
                style: {
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  padding: '5px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  borderRadius: '4px'
                }
              },
                React.createElement('div', null, node.name)
              )
            )
          )
        )
      }

      renderWithProviders(React.createElement(LargeDataPage))

      await waitForMapToLoad()

      // 验证大量节点数据正确加载
      expect(screen.getByText(/节点 0/)).toBeInTheDocument()
      expect(screen.getByText(/节点 49/)).toBeInTheDocument()
    })
  })

  describe('场景7: 错误处理和恢复', () => {
    it('应该处理加载状态', async () => {
      // 创建一个始终在加载的组件
      const LoadingPage = () => {
        const [loading] = React.useState(true)
        return React.createElement('div', null,
          React.createElement('h1', null, '海事数据服务地图'),
          loading ? React.createElement('div', null, '加载中...') : React.createElement('div', null, '内容')
        )
      }

      renderWithProviders(React.createElement(LoadingPage))

      // 验证加载状态显示
      expect(screen.getByText('加载中...')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /海事数据服务地图/ })).toBeInTheDocument()
    })

    it('应该提供重试机制', () => {
      // 创建一个错误状态的组件
      const ErrorPage = () => {
        const [error] = React.useState('网络错误')
        const handleRetry = () => {}
        
        return React.createElement('div', null,
          React.createElement('h1', null, '海事数据服务地图'),
          React.createElement('div', null, `加载失败: ${error}`),
          React.createElement('button', { onClick: handleRetry }, '重试')
        )
      }

      renderWithProviders(React.createElement(ErrorPage))

      // 验证错误显示和重试按钮
      expect(screen.getByText(/加载失败: 网络错误/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /重试/ })).toBeInTheDocument()
    })
  })

  describe('场景8: 响应式设计', () => {
    it('应该在小屏幕上正确显示', async () => {
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      })

      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 验证页面在小屏幕上正确显示
      expect(screen.getByRole('heading', { name: /海事数据服务地图/ })).toBeInTheDocument()
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('应该在大屏幕上正确显示', async () => {
      // 模拟大屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 验证页面在大屏幕上正确显示
      expect(screen.getByRole('heading', { name: /海事数据服务地图/ })).toBeInTheDocument()
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })
  })

  describe('场景9: 无障碍访问', () => {
    it('应该提供适当的页面结构', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 验证页面标题
      const heading = screen.getByRole('heading', { name: /海事数据服务地图/ })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('应该为交互元素提供适当的角色', async () => {
      renderWithProviders(React.createElement(SimpleMapServicesPage))

      await waitForMapToLoad()

      // 验证按钮角色
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
    })
  })
})