'use client'

import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { forwardRef, useRef } from 'react'

interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string
  ariaDescribedBy?: string
  loadingText?: string
  loading?: boolean
  iconOnly?: boolean
  tooltip?: string
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    ariaLabel,
    ariaDescribedBy,
    loadingText = '加载中...',
    loading = false,
    iconOnly = false,
    tooltip,
    disabled,
    onClick,
    className,
    ...props
  }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    // 处理键盘事件
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!disabled && !loading && onClick) {
          onClick(event as any)
        }
      }
    }

    // 如果是图标按钮但没有提供aria-label，使用children作为aria-label
    const computedAriaLabel = iconOnly && !ariaLabel && typeof children === 'string' 
      ? children 
      : ariaLabel

    return (
      <div className="relative inline-block">
        <Button
          ref={ref || buttonRef}
          aria-label={computedAriaLabel}
          aria-describedby={ariaDescribedBy}
          aria-busy={loading}
          disabled={disabled || loading}
          onKeyDown={handleKeyDown}
          className={cn(
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            loading && 'cursor-wait',
            className
          )}
          onClick={onClick}
          {...props}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              <span>{loadingText}</span>
            </div>
          ) : (
            children
          )}
        </Button>
        
        {tooltip && (
          <div 
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
            role="tooltip"
          >
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

// 无障碍性链接组件
interface AccessibleLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
  ariaLabel?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

export function AccessibleLink({
  href,
  children,
  className,
  external = false,
  ariaLabel,
  onClick,
  ...props
}: AccessibleLinkProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (onClick) {
        onClick(event as any)
      } else {
        window.location.href = href
      }
    }
  }

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        'text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded',
        'transition-colors duration-200',
        external && 'underline',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
      {external && (
        <span className="ml-1 text-xs" aria-label="（在新窗口中打开）">
          ↗
        </span>
      )}
    </a>
  )
}

// 无障碍性输入组件
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
}

export function AccessibleInput({
  label,
  error,
  helperText,
  required,
  id,
  className,
  ...props
}: AccessibleInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText ? `${inputId}-helper` : undefined

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={errorId || helperId}
        aria-required={required}
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      
      {error && (
        <div id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div id={helperId} className="text-sm text-gray-500">
          {helperText}
        </div>
      )}
    </div>
  )
}

// 跳转到主要内容的链接（用于屏幕阅读器）
export function SkipToContent({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium z-50"
    >
      跳转到主要内容
    </a>
  )
}

// 区域标记组件
interface LandmarkProps {
  children: React.ReactNode
  as?: 'main' | 'nav' | 'aside' | 'section' | 'header' | 'footer'
  ariaLabel?: string
  id?: string
}

export function Landmark({ 
  children, 
  as = 'section', 
  ariaLabel, 
  id 
}: LandmarkProps) {
  const Component = as
  const props: any = {}
  
  if (ariaLabel) {
    props['aria-label'] = ariaLabel
  }
  
  if (id) {
    props.id = id
  }

  return <Component {...props}>{children}</Component>
}