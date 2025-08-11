import React from 'react'

// Mock TextEncoder and TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder
}

describe('页面导入测试', () => {
  
  it('应该能够导入 /api-docs/ 页面', async () => {
    try {
      const Page = (await import('@/app/api-docs/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /api-docs/', error.message)
      throw error
    }
  })

  it('应该能够导入 /capabilities/ 页面', async () => {
    try {
      const Page = (await import('@/app/capabilities/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /capabilities/', error.message)
      throw error
    }
  })

  it('应该能够导入 /compliance-dashboard/ 页面', async () => {
    try {
      const Page = (await import('@/app/compliance-dashboard/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /compliance-dashboard/', error.message)
      throw error
    }
  })

  it('应该能够导入 /datasets/ 页面', async () => {
    try {
      const Page = (await import('@/app/datasets/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /datasets/', error.message)
      throw error
    }
  })

  it('应该能够导入 /developer/ 页面', async () => {
    try {
      const Page = (await import('@/app/developer/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /developer/', error.message)
      throw error
    }
  })

  it('应该能够导入 /enhanced-map/ 页面', async () => {
    try {
      const Page = (await import('@/app/enhanced-map/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /enhanced-map/', error.message)
      throw error
    }
  })

  it('应该能够导入 /experimental-services/ 页面', async () => {
    try {
      const Page = (await import('@/app/experimental-services/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /experimental-services/', error.message)
      throw error
    }
  })

  it('应该能够导入 /map-services/ 页面', async () => {
    try {
      const Page = (await import('@/app/map-services/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /map-services/', error.message)
      throw error
    }
  })

  it('应该能够导入 /monitoring/ 页面', async () => {
    try {
      const Page = (await import('@/app/monitoring/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /monitoring/', error.message)
      throw error
    }
  })

  it('应该能够导入 /node-map-enhanced/ 页面', async () => {
    try {
      const Page = (await import('@/app/node-map-enhanced/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /node-map-enhanced/', error.message)
      throw error
    }
  })

  it('应该能够导入 /nodes/ 页面', async () => {
    try {
      const Page = (await import('@/app/nodes/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /nodes/', error.message)
      throw error
    }
  })

  it('应该能够导入 / 页面', async () => {
    try {
      const Page = (await import('@/app/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /', error.message)
      throw error
    }
  })

  it('应该能够导入 /s101/ 页面', async () => {
    try {
      const Page = (await import('@/app/s101/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /s101/', error.message)
      throw error
    }
  })

  it('应该能够导入 /s102/ 页面', async () => {
    try {
      const Page = (await import('@/app/s102/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /s102/', error.message)
      throw error
    }
  })

  it('应该能够导入 /services/ 页面', async () => {
    try {
      const Page = (await import('@/app/services/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /services/', error.message)
      throw error
    }
  })

  it('应该能够导入 /users/ 页面', async () => {
    try {
      const Page = (await import('@/app/users/page')).default
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    } catch (error) {
      console.error('导入页面失败: /users/', error.message)
      throw error
    }
  })
})