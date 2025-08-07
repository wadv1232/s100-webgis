export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface ErrorResponse {
  error: ApiError
}

export class ApiErrorHandler {
  // 预定义的错误码和消息
  static readonly ERROR_CODES = {
    // 客户端错误 (4xx)
    INVALID_BBOX: {
      code: 'INVALID_BBOX',
      message: 'Invalid bounding box format. Expected: minX,minY,maxX,maxY',
      status: 400
    },
    MISSING_PARAMETERS: {
      code: 'MISSING_PARAMETERS',
      message: 'Required parameters are missing',
      status: 400
    },
    INVALID_DIMENSIONS: {
      code: 'INVALID_DIMENSIONS',
      message: 'Invalid width or height values',
      status: 400
    },
    PRODUCT_NOT_SUPPORTED: {
      code: 'PRODUCT_NOT_SUPPORTED',
      message: 'The requested S-100 product is not supported in this area',
      status: 404
    },
    SERVICE_UNAVAILABLE: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'The requested service is temporarily unavailable',
      status: 503
    },
    
    // 服务器错误 (5xx)
    INTERNAL_ERROR: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
      status: 500
    },
    DATABASE_ERROR: {
      code: 'DATABASE_ERROR',
      message: 'A database error occurred while processing the request',
      status: 500
    },
    
    // 认证和授权错误
    UNAUTHORIZED: {
      code: 'UNAUTHORIZED',
      message: 'Authentication is required to access this resource',
      status: 401
    },
    FORBIDDEN: {
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource',
      status: 403
    },
    
    // 限流错误
    RATE_LIMIT_EXCEEDED: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Request rate limit exceeded. Please try again later',
      status: 429
    },
    
    // 节点管理错误
    NODE_NOT_FOUND: {
      code: 'NODE_NOT_FOUND',
      message: 'The specified node was not found',
      status: 404
    },
    NODE_ALREADY_EXISTS: {
      code: 'NODE_ALREADY_EXISTS',
      message: 'A node with the specified ID already exists',
      status: 409
    },
    INVALID_NODE_CONFIG: {
      code: 'INVALID_NODE_CONFIG',
      message: 'Invalid node configuration provided',
      status: 400
    },
    
    // 服务策略错误
    POLICY_VIOLATION: {
      code: 'POLICY_VIOLATION',
      message: 'The request violates service policy requirements',
      status: 400
    },
    COMPLIANCE_CHECK_FAILED: {
      code: 'COMPLIANCE_CHECK_FAILED',
      message: 'Service compliance check failed',
      status: 400
    }
  }

  /**
   * 创建标准化的错误响应
   */
  static createError(
    errorCode: keyof typeof ApiErrorHandler.ERROR_CODES,
    details?: Record<string, any>,
    customMessage?: string
  ): ErrorResponse {
    const errorDef = ApiErrorHandler.ERROR_CODES[errorCode]
    
    return {
      error: {
        code: errorDef.code,
        message: customMessage || errorDef.message,
        details
      }
    }
  }

  /**
   * 创建NextResponse错误响应
   */
  static createErrorResponse(
    errorCode: keyof typeof ApiErrorHandler.ERROR_CODES,
    details?: Record<string, any>,
    customMessage?: string
  ): Response {
    const errorDef = ApiErrorHandler.ERROR_CODES[errorCode]
    const errorResponse = this.createError(errorCode, details, customMessage)
    
    return new Response(JSON.stringify(errorResponse), {
      status: errorDef.status,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Code': errorDef.code
      }
    })
  }

  /**
   * 处理未知错误
   */
  static handleUnknownError(error: any): Response {
    console.error('Unhandled error:', error)
    
    // 如果是已知错误类型，直接返回
    if (error && typeof error === 'object' && 'code' in error) {
      return this.createErrorResponse('INTERNAL_ERROR', {
        originalError: error.message || error.toString()
      })
    }
    
    // 否则返回通用内部错误
    return this.createErrorResponse('INTERNAL_ERROR')
  }

  /**
   * 验证bbox格式
   */
  static validateBbox(bbox: string): { valid: boolean; coordinates?: [number, number, number, number] } {
    if (!bbox) {
      return { valid: false }
    }

    const parts = bbox.split(',').map(coord => parseFloat(coord.trim()))
    if (parts.length !== 4 || parts.some(isNaN)) {
      return { valid: false }
    }

    const [minX, minY, maxX, maxY] = parts
    
    // 基本范围检查
    if (minX >= maxX || minY >= maxY) {
      return { valid: false }
    }

    // 经度范围检查 (-180 到 180)
    if (minX < -180 || maxX > 180) {
      return { valid: false }
    }

    // 纬度范围检查 (-90 到 90)
    if (minY < -90 || maxY > 90) {
      return { valid: false }
    }

    return { valid: true, coordinates: [minX, minY, maxX, maxY] }
  }

  /**
   * 验证图像尺寸
   */
  static validateDimensions(width: string, height: string): { valid: boolean; dimensions?: { width: number; height: number } } {
    const widthNum = parseInt(width)
    const heightNum = parseInt(height)
    
    if (isNaN(widthNum) || isNaN(heightNum) || widthNum <= 0 || heightNum <= 0) {
      return { valid: false }
    }

    // 最大尺寸限制
    if (widthNum > 4096 || heightNum > 4096) {
      return { valid: false }
    }

    return { valid: true, dimensions: { width: widthNum, height: heightNum } }
  }

  /**
   * 检查服务可用性
   */
  static checkServiceAvailability(services: any[]): { available: boolean; service?: any } {
    if (!services || services.length === 0) {
      return { available: false }
    }

    // 检查是否有健康的服务
    const healthyServices = services.filter(service => 
      service.node?.healthStatus === 'HEALTHY' && service.isEnabled
    )

    if (healthyServices.length === 0) {
      return { available: false }
    }

    // 返回第一个可用的服务
    return { available: true, service: healthyServices[0] }
  }

  /**
   * 记录错误日志
   */
  static logError(errorCode: string, details?: Record<string, any>, request?: Request): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      errorCode,
      message: this.ERROR_CODES[errorCode as keyof typeof this.ERROR_CODES]?.message || 'Unknown error',
      details,
      request: request ? {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      } : null
    }

    console.error('API Error:', JSON.stringify(logEntry, null, 2))
  }
}

/**
 * 验证GeoJSON格式
 */
export function validateGeoJSON(geojson: any): { valid: boolean; error?: string } {
  if (!geojson || typeof geojson !== 'object') {
    return { valid: false, error: 'Invalid GeoJSON: must be an object' }
  }

  if (geojson.type !== 'FeatureCollection' && geojson.type !== 'Feature') {
    return { valid: false, error: 'Invalid GeoJSON: must be a Feature or FeatureCollection' }
  }

  if (geojson.type === 'FeatureCollection') {
    if (!Array.isArray(geojson.features)) {
      return { valid: false, error: 'Invalid GeoJSON: FeatureCollection must have features array' }
    }

    for (let i = 0; i < geojson.features.length; i++) {
      const feature = geojson.features[i]
      if (!feature.type || feature.type !== 'Feature' || !feature.geometry) {
        return { valid: false, error: `Invalid GeoJSON: Feature at index ${i} is malformed` }
      }
    }
  }

  return { valid: true }
}

/**
 * API路由包装器，提供统一的错误处理
 */
export function withApiHandler(
  handler: (request: NextRequest, context?: any) => Promise<Response>
) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return ApiErrorHandler.handleUnknownError(error)
    }
  }
}

/**
 * 需要认证的API路由包装器
 */
export function withAuthApiHandler(
  handler: (request: NextRequest, context?: any, user?: any) => Promise<Response>
) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    try {
      // 这里可以添加认证逻辑
      // const user = await authenticateUser(request)
      // if (!user) {
      //   return ApiErrorHandler.createErrorResponse('UNAUTHORIZED')
      // }
      
      return await handler(request, context, null) // 暂时传入null作为user
    } catch (error) {
      return ApiErrorHandler.handleUnknownError(error)
    }
  }
}