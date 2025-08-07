// 自定义错误类
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, AppError)
  }
}

// 验证错误
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details)
  }
}

// 认证错误
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, 'AUTHENTICATION_ERROR', message)
  }
}

// 授权错误
export class AuthorizationError extends AppError {
  constructor(message: string = 'Authorization failed') {
    super(403, 'AUTHORIZATION_ERROR', message)
  }
}

// 资源未找到错误
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`)
  }
}

// 冲突错误
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT_ERROR', message)
  }
}

// 业务逻辑错误
export class BusinessError extends AppError {
  constructor(message: string, details?: any) {
    super(422, 'BUSINESS_ERROR', message, details)
  }
}

// 服务器错误
export class ServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, 'SERVER_ERROR', message)
  }
}

// 服务不可用错误
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable') {
    super(503, 'SERVICE_UNAVAILABLE', message)
  }
}

// 网络错误
export class NetworkError extends AppError {
  constructor(message: string = 'Network error') {
    super(502, 'NETWORK_ERROR', message)
  }
}

// 超时错误
export class TimeoutError extends AppError {
  constructor(message: string = 'Request timeout') {
    super(504, 'TIMEOUT_ERROR', message)
  }
}

// 错误类型检查函数
export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError
}

export function isAuthenticationError(error: any): error is AuthenticationError {
  return error instanceof AuthenticationError
}

export function isAuthorizationError(error: any): error is AuthorizationError {
  return error instanceof AuthorizationError
}

export function isNotFoundError(error: any): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isConflictError(error: any): error is ConflictError {
  return error instanceof ConflictError
}

export function isBusinessError(error: any): error is BusinessError {
  return error instanceof BusinessError
}

export function isServerError(error: any): error is ServerError {
  return error instanceof ServerError
}

export function isServiceUnavailableError(error: any): error is ServiceUnavailableError {
  return error instanceof ServiceUnavailableError
}

export function isNetworkError(error: any): error is NetworkError {
  return error instanceof NetworkError
}

export function isTimeoutError(error: any): error is TimeoutError {
  return error instanceof TimeoutError
}

// 错误处理工具函数
export function handleError(error: any): AppError {
  // 如果已经是AppError，直接返回
  if (isAppError(error)) {
    return error
  }

  // 处理Zod验证错误
  if (error instanceof Error && error.name === 'ZodError') {
    return new ValidationError('Validation failed', error.errors)
  }

  // 处理Prisma错误
  if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
    switch ((error as any).code) {
      case 'P2002':
        return new ConflictError('Resource already exists')
      case 'P2025':
        return new NotFoundError('Resource not found')
      case 'P2003':
        return new BusinessError('Foreign key constraint failed')
      case 'P2001':
        return new NotFoundError('Record not found')
      default:
        return new BusinessError('Database operation failed', { code: (error as any).code })
    }
  }

  // 处理网络错误
  if (error instanceof Error && error.name === 'NetworkError') {
    return new NetworkError(error.message)
  }

  // 处理超时错误
  if (error instanceof Error && error.name === 'TimeoutError') {
    return new TimeoutError(error.message)
  }

  // 处理其他错误
  if (error instanceof Error) {
    return new ServerError(error.message)
  }

  // 未知错误
  return new ServerError('Unknown error occurred')
}

// 错误响应格式化函数
export function formatErrorResponse(error: AppError) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    },
    timestamp: new Date().toISOString()
  }
}

// 错误日志记录函数
export function logError(error: any, context?: any) {
  const appError = handleError(error)
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    code: appError.code,
    message: appError.message,
    details: appError.details,
    stack: appError.stack,
    context
  }

  // 在开发环境中输出到控制台
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', JSON.stringify(logEntry, null, 2))
  }

  // 在生产环境中可以发送到日志服务
  if (process.env.NODE_ENV === 'production') {
    // 这里可以添加发送到日志服务的逻辑
    // 例如：sendToLogService(logEntry)
  }

  return logEntry
}

// 错误恢复函数
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  fallback?: T | ((error: AppError) => T)
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    const appError = handleError(error)
    logError(appError)
    
    if (fallback) {
      return typeof fallback === 'function' 
        ? (fallback as (error: AppError) => T)(appError)
        : fallback
    }
    
    throw appError
  }
}

// 重试函数
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delayMs?: number
    backoff?: boolean
    retryableErrors?: string[]
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
    retryableErrors = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVICE_UNAVAILABLE']
  } = options

  let lastError: AppError

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = handleError(error)
      
      // 检查是否可重试
      if (attempt === maxAttempts || !retryableErrors.includes(lastError.code)) {
        throw lastError
      }

      // 计算延迟时间
      const currentDelay = backoff 
        ? delayMs * Math.pow(2, attempt - 1)
        : delayMs

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, currentDelay))
    }
  }

  throw lastError!
}

// 错误边界组件（React）
export class ErrorBoundary {
  private onError: (error: Error, errorInfo: any) => void
  private fallback: React.ComponentType<{ error: Error; retry: () => void }>

  constructor(
    onError: (error: Error, errorInfo: any) => void,
    fallback: React.ComponentType<{ error: Error; retry: () => void }>
  ) {
    this.onError = onError
    this.fallback = fallback
  }

  // 这个方法可以在React组件中使用
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.onError(error, errorInfo)
  }
}

// 全局错误处理器
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler
  private errorHandlers: Array<(error: AppError) => void> = []

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler()
    }
    return GlobalErrorHandler.instance
  }

  addHandler(handler: (error: AppError) => void): void {
    this.errorHandlers.push(handler)
  }

  removeHandler(handler: (error: AppError) => void): void {
    const index = this.errorHandlers.indexOf(handler)
    if (index > -1) {
      this.errorHandlers.splice(index, 1)
    }
  }

  handleError(error: any): void {
    const appError = handleError(error)
    logError(appError)

    // 通知所有错误处理器
    this.errorHandlers.forEach(handler => {
      try {
        handler(appError)
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    })
  }
}

// 初始化全局错误处理器
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    GlobalErrorHandler.getInstance().handleError(event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    GlobalErrorHandler.getInstance().handleError(event.reason)
  })
}

// API错误处理中间件
export function apiErrorHandler(handler: (req: any, res: any) => Promise<any>) {
  return async (req: any, res: any) => {
    try {
      return await handler(req, res)
    } catch (error) {
      const appError = handleError(error)
      logError(appError, { url: req.url, method: req.method })
      
      res.status(appError.statusCode).json(formatErrorResponse(appError))
    }
  }
}

// 异步错误包装器
export function asyncWrapper<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T) => {
    try {
      return await fn(...args)
    } catch (error) {
      const appError = handleError(error)
      logError(appError)
      throw appError
    }
  }
}

// 错误监控装饰器
export function monitorErrors(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args)
    } catch (error) {
      const appError = handleError(error)
      logError(appError, {
        target: target.constructor.name,
        method: propertyKey,
        args
      })
      throw appError
    }
  }

  return descriptor
}