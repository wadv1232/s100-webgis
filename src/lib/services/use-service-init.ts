import { useEffect } from 'react'
import { initializeServices } from './service-init'

// 服务初始化Hook - 确保服务在客户端初始化
export function useServiceInit() {
  useEffect(() => {
    // 在客户端初始化服务
    try {
      initializeServices()
      console.log('Services initialized successfully')
    } catch (error) {
      console.error('Failed to initialize services:', error)
    }
  }, [])
}