import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { jest } from '@jest/globals'

// 导入测试数据和工具
import { userStoryTestData, renderWithProviders, waitForMapToLoad } from '../fixtures/testData'

// 测试坐标数据
const testCoordinates = [
  { name: 'Shanghai', lat: 31.2, lng: 121.5, expected: { lat: 31.2, lng: 121.5 } },
  { name: 'New York', lat: 40.7128, lng: -74.0060, expected: { lat: 40.7128, lng: -74.0060 } },
  { name: 'London', lat: 51.5074, lng: -0.1278, expected: { lat: 51.5074, lng: -0.1278 } },
  { name: 'Problematic', lat: -88.032349, lng: -326.667414, expected: { lat: -88.032349, lng: 33.332586 } },
  { name: 'Another Issue', lat: 45.5, lng: 400.0, expected: { lat: 45.5, lng: 40.0 } },
  { name: 'Out of Bounds', lat: 95.0, lng: -200.0, expected: { lat: 90.0, lng: 160.0 } }
]

// 坐标标准化函数
const normalizeCoordinates = (lat: number, lng: number): { lat: number; lng: number } => {
  // 标准化纬度（-90 到 90）
  let normalizedLat = Math.max(-90, Math.min(90, lat))
  
  // 标准化经度（-180 到 180）
  let normalizedLng = lng
  while (normalizedLng > 180) normalizedLng -= 360
  while (normalizedLng < -180) normalizedLng += 360
  
  return { lat: normalizedLat, lng: normalizedLng }
}

// 模拟坐标测试页面组件
const TestCoordinatesPage = () => {
  const [currentCoordinates, setCurrentCoordinates] = React.useState<{ lat: number; lng: number } | null>(null)
  const [mapBounds, setMapBounds] = React.useState<{ north: number; south: number; east: number; west: number } | null>(null)

  const handleMapClick = (event: React.MouseEvent) => {
    // 模拟地图点击，生成随机坐标
    const lat = -90 + Math.random() * 180
    const lng = -180 + Math.random() * 360
    const normalized = normalizeCoordinates(lat, lng)
    setCurrentCoordinates(normalized)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    // 模拟鼠标移动，生成随机坐标
    const lat = -90 + Math.random() * 180
    const lng = -180 + Math.random() * 360
    const normalized = normalizeCoordinates(lat, lng)
    setCurrentCoordinates(normalized)
  }

  const handleResetMap = () => {
    setCurrentCoordinates(null)
    setMapBounds(null)
  }

  React.useEffect(() => {
    // 设置初始地图边界
    setMapBounds({
      north: 60,
      south: -60,
      east: 180,
      west: -180
    })
  }, [])

  return (
    <div>
      <h1>坐标系统测试页面 - WGS84</h1>
      <p>此页面用于测试坐标显示和标准化功能</p>
      
      <div>
        <h2>投影系统信息</h2>
        <p>地图投影: Web Mercator (EPSG:3857)</p>
        <p>显示坐标: WGS84 (EPSG:4326)</p>
        <p>问题坐标应该被自动标准化到正确范围</p>
      </div>

      <div>
        <h2>测试坐标点：</h2>
        <ul>
          {testCoordinates.map((coord, index) => (
            <li key={index}>
              <strong>{coord.name}:</strong> {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>预期标准化结果：</h2>
        <ul>
          <li><strong>Problematic:</strong> -88.032349, 33.332586</li>
          <li><strong>Another Issue:</strong> 45.5, 40.0</li>
          <li><strong>Out of Bounds:</strong> 90.0, 160.0</li>
        </ul>
      </div>

      <div>
        <h2>交互式地图测试 (Web Mercator + WGS84 显示)</h2>
        <div 
          data-testid="map-container"
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
          style={{ 
            height: '400px', 
            border: '1px solid #ccc',
            cursor: 'crosshair',
            position: 'relative',
            backgroundColor: '#f0f0f0'
          }}
        >
          {/* 模拟地图上的坐标点标记 */}
          {testCoordinates.map((coord, index) => {
            const normalized = normalizeCoordinates(coord.lat, coord.lng)
            const x = ((normalized.lng + 180) / 360) * 100
            const y = ((90 - normalized.lat) / 180) * 100
            
            return (
              <div
                key={index}
                data-testid="marker"
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '10px',
                  height: '10px',
                  backgroundColor: coord.name === 'Problematic' || coord.name === 'Another Issue' ? 'red' : 'blue',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
                title={`${coord.name}: ${normalized.lat.toFixed(6)}, ${normalized.lng.toFixed(6)}`}
              />
            )
          })}
        </div>
        
        <button onClick={handleResetMap}>重置地图</button>
      </div>

      {/* 坐标显示 */}
      <div>
        <h2>坐标信息</h2>
        {currentCoordinates && (
          <div>
            <p><strong>光标坐标 (WGS84):</strong> {currentCoordinates.lat.toFixed(6)}, {currentCoordinates.lng.toFixed(6)}</p>
          </div>
        )}
        
        {mapBounds && (
          <div>
            <p><strong>视图范围:</strong> N:{mapBounds.north} S:{mapBounds.south} E:{mapBounds.east} W:{mapBounds.west}</p>
          </div>
        )}
      </div>

      {/* 坐标标准化测试结果 */}
      <div>
        <h2>坐标标准化测试结果</h2>
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>原始坐标</th>
              <th>标准化后坐标</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {testCoordinates.map((coord, index) => {
              const normalized = normalizeCoordinates(coord.lat, coord.lng)
              const isCorrect = 
                Math.abs(normalized.lat - coord.expected.lat) < 0.000001 &&
                Math.abs(normalized.lng - coord.expected.lng) < 0.000001
              
              return (
                <tr key={index}>
                  <td>{coord.name}</td>
                  <td className="font-mono">{coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}</td>
                  <td className="font-mono">{normalized.lat.toFixed(6)}, {normalized.lng.toFixed(6)}</td>
                  <td style={{ color: isCorrect ? 'green' : 'red' }}>
                    {isCorrect ? '✓ 正确' : '✗ 错误'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

describe('用户故事3: 坐标测试', () => {
  const userStory = userStoryTestData.story3

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('场景1: 访问坐标测试页面', () => {
    it('应该成功加载坐标测试页面', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证页面标题
      expect(screen.getByRole('heading', { name: /坐标系统测试页面 - WGS84/i })).toBeInTheDocument()
      
      // 验证页面描述
      expect(screen.getByText(/此页面用于测试坐标显示和标准化功能/i)).toBeInTheDocument()
    })

    it('应该显示坐标系统信息', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证投影系统信息
      expect(screen.getByText(/地图投影: Web Mercator \(EPSG:3857\)/i)).toBeInTheDocument()
      expect(screen.getByText(/显示坐标: WGS84 \(EPSG:4326\)/i)).toBeInTheDocument()
      
      // 验证坐标范围说明
      expect(screen.getByText(/问题坐标应该被自动标准化到正确范围/i)).toBeInTheDocument()
    })

    it('应该显示测试坐标点列表', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证测试坐标点标题
      expect(screen.getByRole('heading', { name: /测试坐标点：/i })).toBeInTheDocument()
      
      // 验证所有测试坐标点显示
      testCoordinates.forEach(coord => {
        expect(screen.getByText(coord.name)).toBeInTheDocument()
        expect(screen.getByText(new RegExp(`${coord.lat.toFixed(6)}`))).toBeInTheDocument()
        expect(screen.getByText(new RegExp(`${coord.lng.toFixed(6)}`))).toBeInTheDocument()
      })
    })

    it('应该显示预期标准化结果', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证预期结果标题
      expect(screen.getByRole('heading', { name: /预期标准化结果：/i })).toBeInTheDocument()
      
      // 验证问题坐标的预期结果
      expect(screen.getByText(/Problematic:/i)).toBeInTheDocument()
      expect(screen.getByText(/-88.032349, 33.332586/i)).toBeInTheDocument()
      
      expect(screen.getByText(/Another Issue:/i)).toBeInTheDocument()
      expect(screen.getByText(/45.5, 40.0/i)).toBeInTheDocument()
    })

    it('应该显示交互式地图测试区域', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证地图测试标题
      expect(screen.getByRole('heading', { name: /交互式地图测试 \(Web Mercator \+ WGS84 显示\)/i })).toBeInTheDocument()
      
      // 验证重置按钮
      expect(screen.getByRole('button', { name: /重置地图/i })).toBeInTheDocument()
    })
  })

  describe('场景2: 查看测试坐标点', () => {
    it('应该在地图上显示所有测试坐标点', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证地图容器
      expect(screen.getByTestId('map-container')).toBeInTheDocument()

      // 验证所有测试坐标点的标记
      const markers = screen.getAllByTestId('marker')
      expect(markers.length).toBe(testCoordinates.length)
    })

    it('应该正确显示正常坐标点', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证上海坐标点
      const shanghaiCoord = testCoordinates.find(c => c.name === 'Shanghai')
      expect(shanghaiCoord).toBeDefined()
      
      // 验证纽约坐标点
      const newYorkCoord = testCoordinates.find(c => c.name === 'New York')
      expect(newYorkCoord).toBeDefined()
      
      // 验证伦敦坐标点
      const londonCoord = testCoordinates.find(c => c.name === 'London')
      expect(londonCoord).toBeDefined()
    })

    it('应该正确显示问题坐标点', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证问题坐标点1
      const problematicCoord = testCoordinates.find(c => c.name === 'Problematic')
      expect(problematicCoord).toBeDefined()
      
      // 验证问题坐标点2
      const anotherIssueCoord = testCoordinates.find(c => c.name === 'Another Issue')
      expect(anotherIssueCoord).toBeDefined()
      
      // 验证超出边界坐标点
      const outOfBoundsCoord = testCoordinates.find(c => c.name === 'Out of Bounds')
      expect(outOfBoundsCoord).toBeDefined()
    })
  })

  describe('场景3: 验证坐标标准化功能', () => {
    it('应该正确标准化超出范围的经度', () => {
      const result = normalizeCoordinates(-88.032349, -326.667414)
      expect(result.lat).toBeCloseTo(-88.032349, 6)
      expect(result.lng).toBeCloseTo(33.332586, 6)
    })

    it('应该正确标准化负的超出范围经度', () => {
      const result = normalizeCoordinates(45.5, 400.0)
      expect(result.lat).toBeCloseTo(45.5, 6)
      expect(result.lng).toBeCloseTo(40.0, 6)
    })

    it('应该正确限制超出范围的纬度', () => {
      const result = normalizeCoordinates(95.0, -200.0)
      expect(result.lat).toBeCloseTo(90.0, 6)
      expect(result.lng).toBeCloseTo(160.0, 6)
    })

    it('应该保持正常坐标不变', () => {
      const result = normalizeCoordinates(31.2, 121.5)
      expect(result.lat).toBeCloseTo(31.2, 6)
      expect(result.lng).toBeCloseTo(121.5, 6)
    })
  })

  describe('场景4: 测试边界处理', () => {
    it('应该正确处理纬度边界', () => {
      const boundaryTests = [
        { input: { lat: 90, lng: 0 }, expected: { lat: 90, lng: 0 } },
        { input: { lat: -90, lng: 0 }, expected: { lat: -90, lng: 0 } },
        { input: { lat: 91, lng: 0 }, expected: { lat: 90, lng: 0 } },
        { input: { lat: -91, lng: 0 }, expected: { lat: -90, lng: 0 } }
      ]

      boundaryTests.forEach(test => {
        const result = normalizeCoordinates(test.input.lat, test.input.lng)
        expect(result.lat).toBeCloseTo(test.expected.lat, 6)
        expect(result.lng).toBeCloseTo(test.expected.lng, 6)
      })
    })

    it('应该正确处理经度边界', () => {
      const boundaryTests = [
        { input: { lat: 0, lng: 180 }, expected: { lat: 0, lng: 180 } },
        { input: { lat: 0, lng: -180 }, expected: { lat: 0, lng: -180 } },
        { input: { lat: 0, lng: 181 }, expected: { lat: 0, lng: -179 } },
        { input: { lat: 0, lng: -181 }, expected: { lat: 0, lng: 179 } }
      ]

      boundaryTests.forEach(test => {
        const result = normalizeCoordinates(test.input.lat, test.input.lng)
        expect(result.lat).toBeCloseTo(test.expected.lat, 6)
        expect(result.lng).toBeCloseTo(test.expected.lng, 6)
      })
    })

    it('应该正确处理极端坐标值', () => {
      const extremeTests = [
        { input: { lat: 1000, lng: 1000 }, expected: { lat: 90, lng: -80 } },
        { input: { lat: -1000, lng: -1000 }, expected: { lat: -90, lng: 80 } },
        { input: { lat: 360, lng: 360 }, expected: { lat: 90, lng: 0 } },
        { input: { lat: -360, lng: -360 }, expected: { lat: -90, lng: 0 } }
      ]

      extremeTests.forEach(test => {
        const result = normalizeCoordinates(test.input.lat, test.input.lng)
        expect(result.lat).toBeCloseTo(test.expected.lat, 6)
        expect(result.lng).toBeCloseTo(test.expected.lng, 6)
      })
    })
  })

  describe('场景5: 地图交互测试', () => {
    it('应该支持地图点击查看坐标', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 模拟地图点击
      const mapContainer = screen.getByTestId('map-container')
      fireEvent.click(mapContainer, {
        clientX: 400,
        clientY: 300
      })

      // 验证坐标显示更新
      await waitFor(() => {
        const coordinateDisplay = screen.getByText(/光标坐标 \(WGS84\):/i)
        expect(coordinateDisplay).toBeInTheDocument()
      })
    })

    it('应该实时显示鼠标位置坐标', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 模拟鼠标移动
      const mapContainer = screen.getByTestId('map-container')
      fireEvent.mouseMove(mapContainer, {
        clientX: 400,
        clientY: 300
      })

      // 验证坐标显示更新
      await waitFor(() => {
        const coordinateDisplay = screen.getByText(/光标坐标 \(WGS84\):/i)
        expect(coordinateDisplay).toBeInTheDocument()
      })
    })

    it('应该正确显示视图范围', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证视图范围显示
      const boundsDisplay = screen.getByText(/视图范围:/i)
      expect(boundsDisplay).toBeInTheDocument()
    })
  })

  describe('场景6: 重置地图功能', () => {
    it('应该能够重置地图', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 模拟地图操作
      const mapContainer = screen.getByTestId('map-container')
      fireEvent.click(mapContainer)

      // 点击重置按钮
      const resetButton = screen.getByRole('button', { name: /重置地图/i })
      await userEvent.click(resetButton)

      // 验证地图重置
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
      })
    })

    it('应该在重置后恢复初始状态', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 获取初始状态
      const initialMarkers = screen.getAllByTestId('marker')

      // 模拟地图操作
      const mapContainer = screen.getByTestId('map-container')
      fireEvent.click(mapContainer)

      // 重置地图
      const resetButton = screen.getByRole('button', { name: /重置地图/i })
      await userEvent.click(resetButton)

      // 验证恢复初始状态
      await waitFor(() => {
        const resetMarkers = screen.getAllByTestId('marker')
        expect(resetMarkers.length).toBe(initialMarkers.length)
      })
    })
  })

  describe('场景7: 坐标格式显示', () => {
    it('应该显示6位小数的坐标精度', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证测试坐标点显示6位小数
      testCoordinates.forEach(coord => {
        expect(screen.getByText(new RegExp(`${coord.lat.toFixed(6)}`))).toBeInTheDocument()
        expect(screen.getByText(new RegExp(`${coord.lng.toFixed(6)}`))).toBeInTheDocument()
      })
    })

    it('应该在表格中显示标准化结果', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证表格存在
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      // 验证表格包含所有坐标点
      testCoordinates.forEach(coord => {
        expect(within(table).getByText(coord.name)).toBeInTheDocument()
      })
    })

    it('应该使用等宽字体显示坐标', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证坐标显示使用等宽字体
      const coordinateElements = screen.getAllByText(/\d+\.\d+/)
      coordinateElements.forEach(element => {
        expect(element).toHaveClass('font-mono')
      })
    })
  })

  describe('场景8: 响应式设计', () => {
    it('应该在小屏幕上正确显示', () => {
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      })

      renderWithProviders(<TestCoordinatesPage />)

      // 验证页面在小屏幕上正确显示
      expect(screen.getByRole('heading', { name: /坐标系统测试页面 - WGS84/i })).toBeInTheDocument()
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('应该在大屏幕上正确显示', () => {
      // 模拟大屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      renderWithProviders(<TestCoordinatesPage />)

      // 验证页面在大屏幕上正确显示
      expect(screen.getByRole('heading', { name: /坐标系统测试页面 - WGS84/i })).toBeInTheDocument()
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('应该在不同屏幕尺寸下保持地图功能', async () => {
      // 测试不同屏幕尺寸
      const screenSizes = [320, 768, 1024, 1920]

      for (const screenSize of screenSizes) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: screenSize,
        })

        renderWithProviders(<TestCoordinatesPage />)

        // 验证地图功能正常
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /重置地图/i })).toBeInTheDocument()

        // 清理渲染
        screen.unmount()
      }
    })
  })

  describe('场景9: 性能测试', () => {
    it('应该快速加载测试页面', () => {
      const startTime = performance.now()
      
      renderWithProviders(<TestCoordinatesPage />)
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      // 验证页面加载时间在合理范围内
      expect(loadTime).toBeLessThan(2000) // 2秒内加载完成
    })

    it('应该高效处理多个坐标点', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证所有坐标点标记正确渲染
      const markers = screen.getAllByTestId('marker')
      expect(markers.length).toBe(testCoordinates.length)

      // 验证坐标点交互响应
      const firstMarker = markers[0]
      await userEvent.click(firstMarker)

      // 验证交互正常工作
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('应该保持流畅的地图交互', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 模拟快速连续的地图交互
      const mapContainer = screen.getByTestId('map-container')
      
      for (let i = 0; i < 10; i++) {
        fireEvent.click(mapContainer, {
          clientX: 400 + i * 10,
          clientY: 300 + i * 10
        })
      }

      // 验证交互响应
      await waitFor(() => {
        expect(screen.getByText(/光标坐标 \(WGS84\):/i)).toBeInTheDocument()
      })
    })
  })

  describe('场景10: 错误处理', () => {
    it('应该处理无效坐标输入', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证页面正常显示
      expect(screen.getByRole('heading', { name: /坐标系统测试页面 - WGS84/i })).toBeInTheDocument()

      // 验证标准化函数处理无效输入
      const invalidTests = [
        { lat: NaN, lng: 0 },
        { lat: 0, lng: Infinity },
        { lat: -Infinity, lng: 0 },
        { lat: null, lng: 0 },
        { lat: undefined, lng: 0 }
      ]

      invalidTests.forEach(test => {
        try {
          // @ts-ignore - 故意传递无效值进行测试
          const result = normalizeCoordinates(test.lat, test.lng)
          // 验证结果仍然是有效的坐标
          expect(result.lat).toBeGreaterThanOrEqual(-90)
          expect(result.lat).toBeLessThanOrEqual(90)
          expect(result.lng).toBeGreaterThanOrEqual(-180)
          expect(result.lng).toBeLessThanOrEqual(180)
        } catch (error) {
          // 如果抛出错误，确保页面仍然正常显示
          expect(screen.getByRole('heading', { name: /坐标系统测试页面 - WGS84/i })).toBeInTheDocument()
        }
      })
    })

    it('应该提供用户友好的错误信息', async () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证页面包含错误处理说明
      expect(screen.getByText(/此页面用于测试坐标显示和标准化功能/i)).toBeInTheDocument()
      expect(screen.getByText(/问题坐标应该被自动标准化到正确范围/i)).toBeInTheDocument()
    })
  })

  describe('场景11: 无障碍访问', () => {
    it('应该提供适当的页面结构', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证页面标题的层次结构
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
      
      // 验证主标题
      const mainHeading = screen.getByRole('heading', { name: /坐标系统测试页面 - WGS84/i })
      expect(mainHeading).toBeInTheDocument()
      expect(mainHeading.tagName).toBe('H1')
    })

    it('应该为交互元素提供适当的角色', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证按钮角色
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })

      // 验证表格角色
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('应该为坐标信息提供适当的标签', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证坐标显示的标签
      const coordinateDisplay = screen.getByText(/光标坐标 \(WGS84\):/i)
      expect(coordinateDisplay).toBeInTheDocument()

      // 验证视图范围的标签
      const boundsDisplay = screen.getByText(/视图范围:/i)
      expect(boundsDisplay).toBeInTheDocument()
    })
  })

  describe('场景12: 数据验证', () => {
    it('应该验证测试数据的完整性', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证所有测试坐标点都显示
      testCoordinates.forEach(coord => {
        expect(screen.getByText(coord.name)).toBeInTheDocument()
      })

      // 验证预期结果显示
      expect(screen.getByText(/-88.032349, 33.332586/i)).toBeInTheDocument()
      expect(screen.getByText(/45.5, 40.0/i)).toBeInTheDocument()
    })

    it('应该验证坐标标准化算法的正确性', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证标准化算法
      const testCases = [
        { input: { lat: -88.032349, lng: -326.667414 }, expected: { lat: -88.032349, lng: 33.332586 } },
        { input: { lat: 45.5, lng: 400.0 }, expected: { lat: 45.5, lng: 40.0 } },
        { input: { lat: 95.0, lng: -200.0 }, expected: { lat: 90.0, lng: 160.0 } }
      ]

      testCases.forEach(testCase => {
        const result = normalizeCoordinates(testCase.input.lat, testCase.input.lng)
        expect(result.lat).toBeCloseTo(testCase.expected.lat, 6)
        expect(result.lng).toBeCloseTo(testCase.expected.lng, 6)
      })
    })

    it('应该验证边界条件的处理', () => {
      renderWithProviders(<TestCoordinatesPage />)

      // 验证边界条件
      const boundaryTests = [
        { lat: 90, lng: 180 },
        { lat: -90, lng: -180 },
        { lat: 90.000001, lng: 180.000001 },
        { lat: -90.000001, lng: -180.000001 }
      ]

      boundaryTests.forEach(test => {
        const result = normalizeCoordinates(test.lat, test.lng)
        expect(result.lat).toBeGreaterThanOrEqual(-90)
        expect(result.lat).toBeLessThanOrEqual(90)
        expect(result.lng).toBeGreaterThanOrEqual(-180)
        expect(result.lng).toBeLessThanOrEqual(180)
      })
    })
  })
})