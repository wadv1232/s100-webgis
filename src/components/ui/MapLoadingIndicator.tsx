'use client'

import { Loader2, MapPin, AlertTriangle } from 'lucide-react'

interface MapLoadingIndicatorProps {
  isLoading: boolean
  isError: boolean
  onRetry?: () => void
  message?: string
}

export default function MapLoadingIndicator({ 
  isLoading, 
  isError, 
  onRetry, 
  message 
}: MapLoadingIndicatorProps) {
  if (!isLoading && !isError) {
    return null
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 backdrop-blur-sm z-50 rounded-lg">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm">
        {isLoading ? (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">正在加载地图</h3>
              <p className="text-sm text-gray-600">
                {message || '正在初始化地图组件，请稍候...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">地图加载失败</h3>
              <p className="text-sm text-gray-600">
                {message || '地图组件加载失败，请重试'}
              </p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                重新加载
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}