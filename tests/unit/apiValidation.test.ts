import { validateAndExtractServices, safeFilter, safeGetNodeServices, ApiResponseValidator } from '@/lib/apiValidation'

describe('API Validation Utilities', () => {
  describe('validateAndExtractServices', () => {
    it('应该正确处理有效的API响应', () => {
      const validResponse = {
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
      }

      const result = validateAndExtractServices(validResponse)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('s101-wms')
    })

    it('应该处理空的services数组', () => {
      const response = {
        success: true,
        data: {
          services: [],
          stats: { total: 0, active: 0, warning: 0, error: 0 }
        }
      }

      const result = validateAndExtractServices(response)
      expect(result).toHaveLength(0)
    })

    it('应该处理services字段缺失的情况', () => {
      const response = {
        success: true,
        data: {
          stats: { total: 0, active: 0, warning: 0, error: 0 }
        }
      }

      const result = validateAndExtractServices(response)
      expect(result).toHaveLength(0)
    })

    it('应该处理null的services数据', () => {
      const response = {
        success: true,
        data: {
          services: null,
          stats: { total: 0, active: 0, warning: 0, error: 0 }
        }
      }

      const result = validateAndExtractServices(response)
      expect(result).toHaveLength(0)
    })

    it('应该处理非数组的services数据', () => {
      const response = {
        success: true,
        data: {
          services: "not an array",
          stats: { total: 0, active: 0, warning: 0, error: 0 }
        }
      }

      const result = validateAndExtractServices(response)
      expect(result).toHaveLength(0)
    })

    it('应该处理无效的service对象', () => {
      const response = {
        success: true,
        data: {
          services: [
            {
              id: 's101-wms',
              name: 'S101 Web地图服务',
              // 缺少必需字段
            },
            {
              id: 's102-wms',
              name: 'S102 Web地图服务',
              type: 'WMS',
              product: 'S102',
              status: 'HEALTHY',
              nodeId: 'node1'
            }
          ],
          stats: { total: 2, active: 1, warning: 0, error: 0 }
        }
      }

      const result = validateAndExtractServices(response)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('s102-wms')
    })

    it('应该处理无效的响应结构', () => {
      const invalidResponse = {
        success: false,
        error: 'Internal Server Error'
      }

      const result = validateAndExtractServices(invalidResponse)
      expect(result).toHaveLength(0)
    })

    it('应该处理null或undefined响应', () => {
      let result = validateAndExtractServices(null)
      expect(result).toHaveLength(0)

      result = validateAndExtractServices(undefined)
      expect(result).toHaveLength(0)
    })
  })

  describe('safeFilter', () => {
    it('应该正确过滤数组', () => {
      const array = [1, 2, 3, 4, 5]
      const result = safeFilter(array, item => item > 3)
      expect(result).toEqual([4, 5])
    })

    it('应该处理非数组输入', () => {
      const result = safeFilter("not an array", item => item > 3)
      expect(result).toEqual([])
    })

    it('应该处理null输入', () => {
      const result = safeFilter(null, item => item > 3)
      expect(result).toEqual([])
    })

    it('应该处理undefined输入', () => {
      const result = safeFilter(undefined, item => item > 3)
      expect(result).toEqual([])
    })

    it('应该处理过滤函数错误', () => {
      const array = [1, 2, 3]
      const result = safeFilter(array, item => {
        if (item === 2) {
          throw new Error('Filter error')
        }
        return item > 1
      })
      expect(result).toEqual([])
    })
  })

  describe('safeGetNodeServices', () => {
    it('应该正确提取节点服务', () => {
      const node = {
        id: 'node1',
        name: '上海港',
        type: 'LEAF',
        services: ['S101', 'S102']
      }

      const result = safeGetNodeServices(node)
      expect(result).toEqual(['S101', 'S102'])
    })

    it('应该处理无效节点', () => {
      const result = safeGetNodeServices(null)
      expect(result).toEqual([])
    })

    it('应该处理非数组服务', () => {
      const node = {
        id: 'node1',
        name: '上海港',
        type: 'LEAF',
        services: "not an array"
      }

      const result = safeGetNodeServices(node)
      expect(result).toEqual([])
    })

    it('应该过滤非字符串服务', () => {
      const node = {
        id: 'node1',
        name: '上海港',
        type: 'LEAF',
        services: ['S101', 123, null, 'S102', undefined]
      }

      const result = safeGetNodeServices(node)
      expect(result).toEqual(['S101', 'S102'])
    })
  })

  describe('ApiResponseValidator', () => {
    it('应该验证有效响应', () => {
      const validator = new ApiResponseValidator()
      const response = {
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
      }

      const result = validator.validateResponse(response)
      expect(result.isValid).toBe(true)
      expect(result.services).toHaveLength(1)
      expect(result.errors).toHaveLength(0)
    })

    it('应该收集验证错误', () => {
      const validator = new ApiResponseValidator()
      const response = {
        success: true,
        data: {
          services: [
            {
              id: 's101-wms',
              name: 'S101 Web地图服务',
              // 缺少必需字段
            }
          ],
          stats: { total: 1, active: 1, warning: 0, error: 0 }
        }
      }

      const result = validator.validateResponse(response)
      expect(result.isValid).toBe(false)
      expect(result.services).toHaveLength(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('应该检测错误响应', () => {
      const validator = new ApiResponseValidator()
      const response = {
        success: false,
        error: 'Internal Server Error'
      }

      const result = validator.validateResponse(response)
      expect(result.isValid).toBe(false)
      expect(result.services).toHaveLength(0)
      expect(result.errors).toContain('API request was not successful')
    })
  })

  describe('实际应用场景测试', () => {
    it('应该模拟修复前的错误场景', () => {
      // 模拟API返回错误的数据结构
      const apiResponse = {
        success: true,
        data: {
          // 这里应该是 data.services 但实际上是其他结构
          services: "not an array"
        }
      }

      // 这是修复前会出错的情况
      const services = validateAndExtractServices(apiResponse)
      
      // 现在应该安全地返回空数组而不是抛出错误
      expect(services).toEqual([])
      
      // 验证可以安全地调用 filter
      const filtered = safeFilter(services, service => service.type === 'WMS')
      expect(filtered).toEqual([])
    })

    it('应该处理复杂的真实API响应', () => {
      const complexResponse = {
        success: true,
        data: {
          services: [
            {
              id: 's101-wms-cme6hp2mh000ne3fr2psaftuu',
              name: 'S101 Web地图服务服务',
              type: 'WMS',
              product: 'S101',
              version: '1.0.0',
              status: 'ERROR',
              endpoint: '/api/v1/s101/wms',
              node: '上海港',
              nodeType: 'LEAF',
              nodeId: 'cme6hp2mh000ne3fr2psaftuu',
              lastUpdated: '2025-08-11T02:24:43.167Z',
              uptime: '99.9%',
              requestCount: 18302,
              avgResponseTime: 262,
              layers: ['s101_navigation', 's101_depth'],
              formats: ['image/png', 'image/jpeg'],
              description: 'S101 Web地图服务服务',
              isEnabled: true
            },
            {
              id: 's102-wcs-cme6hp2mh000ne3fr2psaftuu',
              name: 'S102 Web覆盖服务服务',
              type: 'WCS',
              product: 'S102',
              version: '1.0.0',
              status: 'ERROR',
              endpoint: '/api/v1/s102/wcs',
              node: '上海港',
              nodeType: 'LEAF',
              nodeId: 'cme6hp2mh000ne3fr2psaftuu',
              lastUpdated: '2025-08-11T02:24:43.181Z',
              uptime: '99.9%',
              requestCount: 5483,
              avgResponseTime: 279,
              layers: ['s102_coverage', 's102_grid'],
              formats: ['image/tiff'],
              description: 'S102 Web覆盖服务服务',
              isEnabled: true
            }
          ],
          stats: {
            total: 7,
            active: 0,
            warning: 1,
            error: 6,
            maintenance: 0,
            byProduct: {
              S101: 3,
              S102: 2,
              S104: 1,
              S111: 1
            },
            byType: {
              WMS: 4,
              WFS: 2,
              WCS: 1
            }
          }
        }
      }

      const services = validateAndExtractServices(complexResponse)
      expect(services).toHaveLength(2)
      
      // 验证可以安全地进行过滤操作
      const wmsServices = safeFilter(services, service => service.type === 'WMS')
      expect(wmsServices).toHaveLength(1)
      expect(wmsServices[0].id).toBe('s101-wms-cme6hp2mh000ne3fr2psaftuu')

      const s102Services = safeFilter(services, service => service.product === 'S102')
      expect(s102Services).toHaveLength(1)
      expect(s102Services[0].id).toBe('s102-wcs-cme6hp2mh000ne3fr2psaftuu')
    })

    it('应该模拟API响应结构变化的情况', () => {
      // 模拟API返回的数据结构发生变化
      const responseWithDifferentStructure = {
        success: true,
        data: {
          // 假设API返回了不同的字段名
          items: [
            {
              id: 's101-wms',
              name: 'S101 Web地图服务',
              type: 'WMS',
              product: 'S101',
              status: 'HEALTHY',
              nodeId: 'node1'
            }
          ],
          // services字段缺失
        }
      }

      const services = validateAndExtractServices(responseWithDifferentStructure)
      expect(services).toHaveLength(0)
      
      // 验证代码不会崩溃
      expect(() => {
        safeFilter(services, s => s.type === 'WMS')
      }).not.toThrow()
    })
  })
})