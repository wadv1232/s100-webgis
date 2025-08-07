'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronRight, 
  GripVertical, 
  Maximize2, 
  Minimize2,
  Edit,
  Save,
  X
} from 'lucide-react'

export interface PanelItem {
  id: string
  title: string
  icon?: React.ReactNode
  content: React.ReactNode
  defaultCollapsed?: boolean
  defaultMinimized?: boolean
  badge?: string
  editable?: boolean
  onEdit?: () => void
  onSave?: () => void
  onCancel?: () => void
}

interface CollapsiblePanelsProps {
  items: PanelItem[]
  onReorder?: (newOrder: string[]) => void
  className?: string
}

export default function CollapsiblePanels({
  items,
  onReorder,
  className = ''
}: CollapsiblePanelsProps) {
  const [panelStates, setPanelStates] = useState<Record<string, { collapsed: boolean; minimized: boolean }>>({})
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragItemRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // 初始化面板状态
  useEffect(() => {
    const initialStates: Record<string, { collapsed: boolean; minimized: boolean }> = {}
    items.forEach(item => {
      initialStates[item.id] = {
        collapsed: item.defaultCollapsed || false,
        minimized: item.defaultMinimized || false
      }
    })
    setPanelStates(initialStates)
  }, [items])

  const toggleCollapse = (id: string) => {
    setPanelStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        collapsed: !prev[id].collapsed
      }
    }))
  }

  const toggleMinimize = (id: string) => {
    setPanelStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        minimized: !prev[id].minimized,
        collapsed: false // 最小化时自动展开
      }
    }))
  }

  // 拖拽处理函数
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    
    if (dragItemRef.current) {
      dragItemRef.current.style.opacity = '0.5'
    }
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(id)
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      setDragOverId(null)
      return
    }

    const currentIndex = items.findIndex(item => item.id === draggingId)
    const targetIndex = items.findIndex(item => item.id === targetId)
    
    if (currentIndex !== -1 && targetIndex !== -1) {
      const newOrder = [...items.map(item => item.id)]
      newOrder.splice(currentIndex, 1)
      newOrder.splice(targetIndex, 0, draggingId)
      
      onReorder?.(newOrder)
    }
    
    setDraggingId(null)
    setDragOverId(null)
    
    if (dragItemRef.current) {
      dragItemRef.current.style.opacity = '1'
    }
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverId(null)
    
    if (dragItemRef.current) {
      dragItemRef.current.style.opacity = '1'
    }
  }

  // 根据当前顺序渲染面板
  const renderPanels = () => {
    return items.map((item, index) => {
      const state = panelStates[item.id] || { collapsed: false, minimized: false }
      const isDragging = draggingId === item.id
      const isDragOver = dragOverId === item.id

      return (
        <div
          key={item.id}
          ref={draggingId === item.id ? dragItemRef : null}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item.id)}
          onDragEnd={handleDragEnd}
          className={`transition-all duration-200 ${
            isDragging ? 'opacity-50 scale-95' : ''
          } ${
            isDragOver ? 'border-t-2 border-blue-500' : ''
          }`}
        >
          <Card className={`mb-2 ${state.minimized ? 'h-12' : ''}`}>
            <CardHeader 
              className={`pb-2 cursor-move ${
                state.minimized ? 'pb-3' : state.collapsed ? 'pb-2' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* 拖拽手柄 */}
                  <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  
                  {/* 图标 */}
                  {item.icon && (
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                  )}
                  
                  {/* 标题 */}
                  <CardTitle className="text-sm flex-1 min-w-0 truncate">
                    {item.title}
                  </CardTitle>
                  
                  {/* 徽章 */}
                  {item.badge && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                
                {/* 操作按钮 */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* 编辑操作 */}
                  {item.editable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.onEdit}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {item.editable && item.onSave && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.onSave}
                      className="h-6 w-6 p-0 text-green-600"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {item.editable && item.onCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.onCancel}
                      className="h-6 w-6 p-0 text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {/* 折叠/展开 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCollapse(item.id)}
                    className="h-6 w-6 p-0"
                    disabled={state.minimized}
                  >
                    {state.collapsed ? (
                      <ChevronRight className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                  
                  {/* 最小化/还原 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMinimize(item.id)}
                    className="h-6 w-6 p-0"
                  >
                    {state.minimized ? (
                      <Maximize2 className="h-3 w-3" />
                    ) : (
                      <Minimize2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {/* 内容区域 */}
            {!state.minimized && !state.collapsed && (
              <CardContent className="pt-0">
                {item.content}
              </CardContent>
            )}
          </Card>
        </div>
      )
    })
  }

  return (
    <div ref={containerRef} className={className}>
      {renderPanels()}
    </div>
  )
}