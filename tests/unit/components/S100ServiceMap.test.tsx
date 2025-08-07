import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import S100ServiceMap from '@/components/S100ServiceMap'
import { mockNodes, mockServices, createMockNode, createMockService } from '../../fixtures/mockData'
import { renderWithProviders, waitForMapToLoad, simulateUserInteraction } from '../../utils/testHelpers'

// 模拟动态导入
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const MockComponent = (props: any) => (
      <div data-testid="map-container" {...props}>
        Mock Map Component
      </div>
    )
    return MockComponent
  }
}))

describe('S100ServiceMap 组件', () => {
  const defaultProps = {
    nodes: mockNodes,
    services: mockServices,
    selectedNode: mockNodes[0],
    onNodeSelect: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该正确渲染地图组件', () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)
      
      expect(screen.getByText('S-100服务地图')).toBeInTheDocument()
      expect(screen.getByText('海事数据服务地理分布和实时状态监控')).toBeInTheDocument()
    })

    it('应该显示所有控制按钮', () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)
      
      expect(screen.getByText('搜索')).toBeInTheDocument()
      expect(screen.getByText('图层')).toBeInTheDocument()
      expect(screen.getByText('图例')).toBeInTheDocument()
      expect(screen.getByText('全屏')).toBeInTheDocument()
    })

    it('当启用编辑模式时应该显示编辑按钮', () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} editable={true} />)
      
      expect(screen.getByText('编辑地理数据')).toBeInTheDocument()
    })

    it('当禁用编辑模式时不应显示编辑按钮', () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} editable={false} />)
      
      expect(screen.queryByText('编辑地理数据')).not.toBeInTheDocument()
    })
  })

  describe('节点选择功能', () => {
    it('应该正确调用 onNodeSelect 回调', async () => {
      const handleNodeSelect = jest.fn()
      renderWithProviders(
        <S100ServiceMap 
          {...defaultProps} 
          onNodeSelect={handleNodeSelect} 
        />
      )

      // 模拟节点选择（这里需要根据实际实现调整）
      const nodeButton = screen.getByText(mockNodes[0].name)
      await userEvent.click(nodeButton)

      expect(handleNodeSelect).toHaveBeenCalledWith(mockNodes[0])
    })

    it('应该更新选中的节点状态', () => {
      const { rerender } = renderWithProviders(
        <S100ServiceMap 
          {...defaultProps} 
          selectedNode={mockNodes[0]} 
        />
      )

      rerender(
        <S100ServiceMap 
          {...defaultProps} 
          selectedNode={mockNodes[1]} 
        />
      )

      // 验证选中节点更新（这里需要根据实际实现调整）
      expect(screen.getByText(mockNodes[1].name)).toBeInTheDocument()
    })
  })

  describe('搜索功能', () => {
    it('应该打开搜索面板', async () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      const searchButton = screen.getByText('搜索')
      await userEvent.click(searchButton)

      expect(screen.getByPlaceholderText(/搜索节点或服务/)).toBeInTheDocument()
    })

    it('应该能够搜索节点', async () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      // 打开搜索
      const searchButton = screen.getByText('搜索')
      await userEvent.click(searchButton)

      // 输入搜索词
      const searchInput = screen.getByPlaceholderText(/搜索节点或服务/)
      await userEvent.type(searchInput, '上海')

      // 验证搜索结果
      expect(screen.getByText('上海海事服务中心')).toBeInTheDocument()
    })

    it('应该能够搜索服务', async () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      // 打开搜索
      const searchButton = screen.getByText('搜索')
      await userEvent.click(searchButton)

      // 输入搜索词
      const searchInput = screen.getByPlaceholderText(/搜索节点或服务/)
      await userEvent.type(searchInput, 'S-101')

      // 验证搜索结果
      expect(screen.getByText('S-101电子海图服务')).toBeInTheDocument()
    })
  })

  describe('图层控制', () => {
    it('应该打开图层面板', async () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      const layerButton = screen.getByText('图层')
      await userEvent.click(layerButton)

      expect(screen.getByText('标准地图')).toBeInTheDocument()
      expect(screen.getByText('卫星地图')).toBeInTheDocument()
      expect(screen.getByText('地形地图')).toBeInTheDocument()
    })

    it('应该能够切换图层可见性', async () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      // 打开图层面板
      const layerButton = screen.getByText('图层')
      await userEvent.click(layerButton)

      // 切换节点标记图层
      const nodeLayerCheckbox = screen.getByLabelText('节点标记')
      await userEvent.click(nodeLayerCheckbox)

      // 验证图层状态变化（这里需要根据实际实现调整）
      expect(nodeLayerCheckbox).not.toBeChecked()
    })
  })

  describe('全屏功能', () => {
    it('应该切换全屏模式', async () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      const fullscreenButton = screen.getByText('全屏')
      await userEvent.click(fullscreenButton)

      // 验证全屏模式激活
      expect(screen.getByText('退出全屏')).toBeInTheDocument()
    })

    it('应该退出全屏模式', async () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      // 进入全屏
      const fullscreenButton = screen.getByText('全屏')
      await userEvent.click(fullscreenButton)

      // 退出全屏
      const exitFullscreenButton = screen.getByText('退出全屏')
      await userEvent.click(exitFullscreenButton)

      // 验证全屏模式退出
      expect(screen.getByText('全屏')).toBeInTheDocument()
    })
  })

  describe('编辑功能', () => {
    it('应该打开编辑面板', async () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} editable={true} />)

      const editButton = screen.getByText('编辑地理数据')
      await userEvent.click(editButton)

      expect(screen.getByText('编辑地理数据')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/例: 31.2000/)).toBeInTheDocument()
    })

    it('应该能够编辑节点坐标', async () => {
      const handleNodeUpdate = jest.fn()
      renderWithProviders(
        <S100ServiceMap 
          {...defaultProps} 
          editable={true} 
          onNodeUpdate={handleNodeUpdate} 
        />
      )

      // 打开编辑面板
      const editButton = screen.getByText('编辑地理数据')
      await userEvent.click(editButton)

      // 修改坐标
      const latInput = screen.getByPlaceholderText(/例: 31.2000/)
      const lngInput = screen.getByPlaceholderText(/例: 121.5000/)
      
      await userEvent.clear(latInput)
      await userEvent.type(latInput, '35.0000')
      await userEvent.clear(lngInput)
      await userEvent.type(lngInput, '120.0000')

      // 保存更改
      const saveButton = screen.getByText('保存')
      await userEvent.click(saveButton)

      expect(handleNodeUpdate).toHaveBeenCalledWith(
        mockNodes[0].id,
        expect.objectContaining({
          location: expect.objectContaining({
            lat: 35.0000,
            lng: 120.0000
          })
        })
      )
    })

    it('应该能够取消编辑', async () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} editable={true} />)

      // 打开编辑面板
      const editButton = screen.getByText('编辑地理数据')
      await userEvent.click(editButton)

      // 取消编辑
      const cancelButton = screen.getByText('取消')
      await userEvent.click(cancelButton)

      expect(screen.queryByText('编辑地理数据')).not.toBeInTheDocument()
    })
  })

  describe('底图配置', () => {
    it('应该使用默认的 OSM 底图', () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      // 验证默认底图配置
      expect(screen.getByText('标准地图')).toBeInTheDocument()
    })

    it('应该使用自定义底图配置', () => {
      const customBaseMapConfig = {
        type: 'satellite' as const,
        minZoom: 1,
        maxZoom: 18
      }

      renderWithProviders(
        <S100ServiceMap 
          {...defaultProps} 
          baseMapConfig={customBaseMapConfig} 
        />
      )

      // 验证自定义底图配置
      expect(screen.getByText('卫星地图')).toBeInTheDocument()
    })

    it('应该支持自定义底图 URL', () => {
      const customBaseMapConfig = {
        type: 'custom' as const,
        customUrl: 'https://custom-tile-server.com/{z}/{x}/{y}.png',
        attribution: 'Custom Provider',
        minZoom: 1,
        maxZoom: 20
      }

      renderWithProviders(
        <S100ServiceMap 
          {...defaultProps} 
          baseMapConfig={customBaseMapConfig} 
        />
      )

      // 验证自定义底图配置
      expect(screen.getByText('自定义地图')).toBeInTheDocument()
    })
  })

  describe('响应式设计', () => {
    it('应该使用默认高度', () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      const mapContainer = screen.getByTestId('map-container')
      expect(mapContainer).toHaveStyle({ height: '600px' })
    })

    it('应该使用自定义高度', () => {
      renderWithProviders(
        <S100ServiceMap 
          {...defaultProps} 
          height="800px" 
        />
      )

      const mapContainer = screen.getByTestId('map-container')
      expect(mapContainer).toHaveStyle({ height: '800px' })
    })

    it('应该支持全屏高度', async () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      // 进入全屏
      const fullscreenButton = screen.getByText('全屏')
      await userEvent.click(fullscreenButton)

      const mapContainer = screen.getByTestId('map-container')
      expect(mapContainer).toHaveStyle({ height: '100vh' })
    })
  })

  describe('错误处理', () => {
    it('应该处理空的节点数组', () => {
      renderWithProviders(
        <S100ServiceMap 
          {...defaultProps} 
          nodes={[]} 
        />
      )

      expect(screen.getByText('S-100服务地图')).toBeInTheDocument()
    })

    it('应该处理空的服务数组', () => {
      renderWithProviders(
        <S100ServiceMap 
          {...defaultProps} 
          services={[]} 
        />
      )

      expect(screen.getByText('S-100服务地图')).toBeInTheDocument()
    })

    it('应该处理未选中的节点', () => {
      renderWithProviders(
        <S100ServiceMap 
          {...defaultProps} 
          selectedNode={null as any} 
        />
      )

      expect(screen.getByText('S-100服务地图')).toBeInTheDocument()
    })
  })

  describe('性能优化', () => {
    it('应该使用动态导入避免 SSR 问题', () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      // 验证动态导入的组件正确渲染
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('应该正确处理地图容器尺寸变化', async () => {
      const { container } = renderWithProviders(<S100ServiceMap {...defaultProps} />)

      // 模拟容器尺寸变化
      const mapContainer = screen.getByTestId('map-container')
      Object.defineProperty(mapContainer, 'getBoundingClientRect', {
        value: () => ({ width: 1024, height: 768 }),
        configurable: true
      })

      // 触发尺寸变化事件
      window.dispatchEvent(new Event('resize'))

      await waitFor(() => {
        expect(mapContainer).toBeInTheDocument()
      })
    })
  })

  describe('无障碍访问', () => {
    it('应该为按钮提供适当的标签', () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })

    it('应该支持键盘导航', async () => {
      renderWithProviders(<S100ServiceMap {...defaultProps} />)

      const searchButton = screen.getByText('搜索')
      
      // 使用 Tab 键导航到按钮
      await userEvent.tab()
      expect(searchButton).toHaveFocus()

      // 使用 Enter 键激活按钮
      await userEvent.keyboard('{Enter}')
      expect(screen.getByPlaceholderText(/搜索节点或服务/)).toBeInTheDocument()
    })
  })
})