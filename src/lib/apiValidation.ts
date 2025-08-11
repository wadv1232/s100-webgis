/**
 * API响应数据验证工具
 * 用于防止API响应结构异常导致的运行时错误
 */

export interface ServiceData {
  id: string
  name: string
  type: string
  product: string
  status: string
  nodeId: string
  [key: string]: any
}

export interface ApiResponse {
  success: boolean
  data?: {
    services?: ServiceData[] | null
    [key: string]: any
  }
  [key: string]: any
}

/**
 * 验证并提取服务数据
 * @param response API响应对象
 * @returns 安全的服务数据数组
 */
export function validateAndExtractServices(response: any): ServiceData[] {
  // 基本验证
  if (!response || typeof response !== 'object') {
    console.warn('Invalid API response: response is not an object')
    return []
  }

  // 检查success字段
  if (response.success !== true) {
    console.warn('API request failed:', response)
    return []
  }

  // 检查data字段
  if (!response.data || typeof response.data !== 'object') {
    console.warn('Invalid API response: data field is missing or invalid')
    return []
  }

  // 检查services字段
  if (!response.data.services) {
    console.warn('API response: services field is missing')
    return []
  }

  // 检查services是否为数组
  if (!Array.isArray(response.data.services)) {
    console.warn('API response: services is not an array')
    return []
  }

  // 验证每个服务项的基本结构
  const validServices = response.data.services.filter((service: any) => {
    if (!service || typeof service !== 'object') {
      console.warn('Invalid service item: service is not an object')
      return false
    }

    // 检查必需字段
    const requiredFields = ['id', 'name', 'type', 'product', 'status', 'nodeId']
    const hasAllRequiredFields = requiredFields.every(field => 
      service[field] !== undefined && service[field] !== null
    )

    if (!hasAllRequiredFields) {
      console.warn('Invalid service item: missing required fields', service)
      return false
    }

    return true
  })

  console.log(`Validated services: ${validServices.length} out of ${response.data.services.length}`)

  return validServices
}

/**
 * 安全的数组过滤操作
 * @param array 要过滤的数组
 * @param predicate 过滤函数
 * @returns 过滤后的数组，如果输入不是数组则返回空数组
 */
export function safeFilter<T>(array: any, predicate: (item: T) => boolean): T[] {
  if (!Array.isArray(array)) {
    console.warn('safeFilter: input is not an array', array)
    return []
  }

  try {
    return array.filter(predicate)
  } catch (error) {
    console.error('safeFilter: error during filtering', error)
    return []
  }
}

/**
 * 安全的数组映射操作
 * @param array 要映射的数组
 * @param mapper 映射函数
 * @returns 映射后的数组，如果输入不是数组则返回空数组
 */
export function safeMap<T, R>(array: any, mapper: (item: T) => R): R[] {
  if (!Array.isArray(array)) {
    console.warn('safeMap: input is not an array', array)
    return []
  }

  try {
    return array.map(mapper)
  } catch (error) {
    console.error('safeMap: error during mapping', error)
    return []
  }
}

/**
 * 安全的数组查找操作
 * @param array 要搜索的数组
 * @param predicate 查找函数
 * @returns 找到的元素，如果输入不是数组则返回undefined
 */
export function safeFind<T>(array: any, predicate: (item: T) => boolean): T | undefined {
  if (!Array.isArray(array)) {
    console.warn('safeFind: input is not an array', array)
    return undefined
  }

  try {
    return array.find(predicate)
  } catch (error) {
    console.error('safeFind: error during find operation', error)
    return undefined
  }
}

/**
 * 验证节点数据
 * @param node 节点对象
 * @returns 是否为有效的节点数据
 */
export function validateNode(node: any): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const requiredFields = ['id', 'name', 'type', 'services']
  return requiredFields.every(field => 
    node[field] !== undefined && node[field] !== null
  )
}

/**
 * 安全获取节点服务
 * @param node 节点对象
 * @returns 服务数组，如果无效则返回空数组
 */
export function safeGetNodeServices(node: any): string[] {
  if (!validateNode(node)) {
    console.warn('Invalid node data', node)
    return []
  }

  if (!Array.isArray(node.services)) {
    console.warn('Node services is not an array', node.services)
    return []
  }

  return node.services.filter(service => typeof service === 'string')
}

/**
 * API响应验证器类
 */
export class ApiResponseValidator {
  private errors: string[] = []

  constructor() {
    this.errors = []
  }

  /**
   * 验证API响应
   * @param response API响应对象
   * @returns 验证结果
   */
  validateResponse(response: any): { isValid: boolean; services: ServiceData[]; errors: string[] } {
    this.errors = []

    if (!response || typeof response !== 'object') {
      this.errors.push('Response is not an object')
      return { isValid: false, services: [], errors: this.errors }
    }

    if (response.success !== true) {
      this.errors.push('API request was not successful')
      return { isValid: false, services: [], errors: this.errors }
    }

    if (!response.data || typeof response.data !== 'object') {
      this.errors.push('Response data is missing or invalid')
      return { isValid: false, services: [], errors: this.errors }
    }

    const services = this.validateServices(response.data.services)

    return {
      isValid: this.errors.length === 0,
      services,
      errors: [...this.errors]
    }
  }

  private validateServices(services: any): ServiceData[] {
    if (!services) {
      this.errors.push('Services field is missing')
      return []
    }

    if (!Array.isArray(services)) {
      this.errors.push('Services is not an array')
      return []
    }

    const validServices: ServiceData[] = []

    services.forEach((service, index) => {
      if (!service || typeof service !== 'object') {
        this.errors.push(`Service at index ${index} is not an object`)
        return
      }

      const requiredFields = ['id', 'name', 'type', 'product', 'status', 'nodeId']
      const missingFields = requiredFields.filter(field => 
        service[field] === undefined || service[field] === null
      )

      if (missingFields.length > 0) {
        this.errors.push(`Service at index ${index} is missing fields: ${missingFields.join(', ')}`)
        return
      }

      validServices.push(service)
    })

    return validServices
  }

  getErrors(): string[] {
    return [...this.errors]
  }

  hasErrors(): boolean {
    return this.errors.length > 0
  }
}