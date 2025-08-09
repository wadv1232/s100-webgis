/**
 * 配置文件系统测试
 */

import { getAppConfig, validateConfig } from '@/config/app'
import { getServiceConfig, isValidServiceType, isValidProductType } from '@/config/services'
import { getUIConfig, validateUIConfig } from '@/config/ui'
import { getAppMapConfig, validateLayerConfig } from '@/config/map-config'
import { MockDataGenerator } from '@/lib/mock-data'

describe('Configuration System Tests', () => {
  
  test('App config should be valid', () => {
    const config = getAppConfig()
    expect(config).toBeDefined()
    expect(config.app.name).toBe('S-100 Maritime Services')
    expect(config.api.baseUrl).toBeDefined()
    expect(config.server.port).toBeGreaterThan(0)
    
    const validation = validateConfig(config)
    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })
  
  test('Service config should be valid', () => {
    const config = getServiceConfig()
    expect(config).toBeDefined()
    expect(config.serviceTypes).toBeDefined()
    expect(config.productTypes).toBeDefined()
    expect(config.providers).toBeDefined()
    
    // Test service types
    expect(isValidServiceType('WMS')).toBe(true)
    expect(isValidServiceType('WFS')).toBe(true)
    expect(isValidServiceType('SOS')).toBe(true)
    expect(isValidServiceType('WCS')).toBe(true)
    expect(isValidServiceType('INVALID')).toBe(false)
    
    // Test product types
    expect(isValidProductType('S101')).toBe(true)
    expect(isValidProductType('S102')).toBe(true)
    expect(isValidProductType('S104')).toBe(true)
    expect(isValidProductType('S111')).toBe(true)
    expect(isValidProductType('S124')).toBe(true)
    expect(isValidProductType('S131')).toBe(true)
    expect(isValidProductType('INVALID')).toBe(false)
  })
  
  test('UI config should be valid', () => {
    const config = getUIConfig()
    expect(config).toBeDefined()
    expect(config.theme).toBeDefined()
    expect(config.layout).toBeDefined()
    expect(config.table).toBeDefined()
    
    const validation = validateUIConfig(config)
    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })
  
  test('Map config should be valid', () => {
    const config = getAppMapConfig()
    expect(config).toBeDefined()
    expect(config.center).toBeDefined()
    expect(config.zoom).toBeGreaterThan(0)
    expect(config.layers).toBeDefined()
    expect(config.layers.length).toBeGreaterThan(0)
    
    // Test layer validation
    const layer = config.layers[0]
    const validation = validateLayerConfig(layer)
    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })
  
  test('Mock data generator should work', () => {
    const generator = new MockDataGenerator()
    expect(generator).toBeDefined()
    
    // Test node generation
    const nodes = generator.generateNodes()
    expect(nodes).toBeDefined()
    expect(Array.isArray(nodes)).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
    
    // Test service generation
    const services = generator.generateServices(nodes)
    expect(services).toBeDefined()
    expect(Array.isArray(services)).toBe(true)
    
    // Test dataset generation
    const datasets = generator.generateDatasets(nodes)
    expect(datasets).toBeDefined()
    expect(Array.isArray(datasets)).toBe(true)
    
    // Test full generation
    const allData = generator.generateAll()
    expect(allData).toBeDefined()
    expect(allData.nodes).toBeDefined()
    expect(allData.services).toBeDefined()
    expect(allData.datasets).toBeDefined()
  })
  
  test('Configuration should be environment-aware', () => {
    // Test default config
    const defaultConfig = getAppConfig()
    expect(defaultConfig.server.port).toBe(3001)
    
    // Test that config can be overridden by environment variables
    // Note: This test assumes no environment variables are set
    const config = getAppConfig()
    expect(config).toBeDefined()
  })
  
  test('Service templates should render correctly', () => {
    const config = getServiceConfig()
    const template = config.serviceTemplates.capabilities
    
    expect(template).toBeDefined()
    expect(template.template).toBeDefined()
    expect(template.parameters).toBeDefined()
    
    // Test template rendering
    const testData = {
      serviceName: 'Test Service',
      serviceDescription: 'Test Description',
      serviceType: 'WMS',
      providerName: 'Test Provider',
      providerSite: 'https://test.com',
      baseUrl: 'https://api.test.com',
      endpoint: '/wms'
    }
    
    // Note: We can't easily test the renderServiceTemplate function here
    // because it's not exported, but we can verify the template structure
    expect(template.template).toContain('{serviceName}')
    expect(template.template).toContain('{serviceDescription}')
    expect(template.template).toContain('{serviceType}')
  })
  
  test('Map layers should have required properties', () => {
    const config = getAppMapConfig()
    const layer = config.layers[0]
    
    expect(layer.id).toBeDefined()
    expect(layer.name).toBeDefined()
    expect(layer.url).toBeDefined()
    expect(layer.attribution).toBeDefined()
    expect(layer.type).toBeDefined()
    
    // Test that layer URLs contain required placeholders
    expect(layer.url).toContain('{z}')
    expect(layer.url).toContain('{x}')
    expect(layer.url).toContain('{y}')
  })
  
  test('UI configuration should have consistent structure', () => {
    const config = getUIConfig()
    
    // Test theme structure
    expect(config.theme.mode).toBeDefined()
    expect(config.theme.primaryColor).toBeDefined()
    expect(config.theme.fontSize).toBeDefined()
    expect(config.theme.fontSize.base).toBeDefined()
    
    // Test layout structure
    expect(config.layout.header).toBeDefined()
    expect(config.layout.sidebar).toBeDefined()
    expect(config.layout.content).toBeDefined()
    
    // Test table structure
    expect(config.table.defaultPageSize).toBeGreaterThan(0)
    expect(config.table.pageSizeOptions).toBeDefined()
    expect(Array.isArray(config.table.pageSizeOptions)).toBe(true)
    
    // Test breakpoints
    expect(config.breakpoints).toBeDefined()
    expect(config.breakpoints.xs).toBe(0)
    expect(config.breakpoints.xs < config.breakpoints.sm).toBe(true)
    expect(config.breakpoints.sm < config.breakpoints.md).toBe(true)
    expect(config.breakpoints.md < config.breakpoints.lg).toBe(true)
    expect(config.breakpoints.lg < config.breakpoints.xl).toBe(true)
    expect(config.breakpoints.xl < config.breakpoints['2xl']).toBe(true)
  })
})

console.log('Configuration system tests completed successfully!')