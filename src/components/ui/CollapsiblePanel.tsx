'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronRight, 
  GripVertical, 
  Maximize2,
  Minimize2
} from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface CollapsiblePanelProps {
  id: string
  title: string
  icon?: React.ReactNode
  badge?: string | React.ReactNode
  defaultExpanded?: boolean
  children: React.ReactNode
  onExpandChange?: (expanded: boolean) => void
  draggable?: boolean
  className?: string
}

export default function CollapsiblePanel({
  id,
  title,
  icon,
  badge,
  defaultExpanded = true,
  children,
  onExpandChange,
  draggable = true,
  className = ''
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleExpandChange = (expanded: boolean) => {
    setIsExpanded(expanded)
    onExpandChange?.(expanded)
  }

  // 拖拽功能
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: draggable ? id : undefined,
    disabled: !draggable
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto'
  } : undefined

  const dragHandleProps = draggable ? {
    ...attributes,
    ...listeners
  } : {}

  return (
    <Card 
      ref={setDraggableNodeRef}
      className={`transition-all duration-200 ${isDragging ? 'shadow-lg' : ''} ${className}`}
      style={style}
    >
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => handleExpandChange(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {draggable && (
              <div 
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
                onClick={(e) => e.stopPropagation()}
                {...dragHandleProps}
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            {icon && (
              <div className="text-gray-600">
                {icon}
              </div>
            )}
            <CardTitle className="text-sm font-medium flex-1">
              {title}
            </CardTitle>
            {badge && (
              <div className="ml-2">
                {typeof badge === 'string' ? (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ) : (
                  badge
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              handleExpandChange(!isExpanded)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  )
}