'use client'

import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

interface SortablePanelContainerProps {
  items: Array<{
    id: string
    title: string
    icon?: React.ReactNode
    badge?: string | React.ReactNode
    defaultExpanded?: boolean
    content: React.ReactNode
  }>
  onOrderChange?: (newOrder: string[]) => void
  onExpandChange?: (panelId: string, expanded: boolean) => void
  className?: string
}

export default function SortablePanelContainer({
  items,
  onOrderChange,
  onExpandChange,
  className = ''
}: SortablePanelContainerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over?.id)
      
      const newOrder = arrayMove(items.map(item => item.id), oldIndex, newIndex)
      onOrderChange?.(newOrder)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className={`space-y-3 ${className}`}>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.content}
            </React.Fragment>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}