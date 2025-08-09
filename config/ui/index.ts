/**
 * UI组件配置文件
 * 包含所有UI组件相关的配置项
 */

export interface UIConfig {
  // 主题配置
  theme: {
    mode: 'light' | 'dark' | 'system'
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    surfaceColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
  }
  
  // 布局配置
  layout: {
    header: {
      height: string
      fixed: boolean
      showLogo: boolean
      showNavigation: boolean
      showSearch: boolean
      showUserMenu: boolean
    }
    sidebar: {
      width: string
      collapsible: boolean
      collapsedWidth: string
      showIcons: boolean
      showBadges: boolean
    }
    footer: {
      height: string
      showCopyright: boolean
      showLinks: boolean
      showVersion: boolean
    }
    content: {
      padding: string
      maxWidth: string
      centerContent: boolean
    }
  }
  
  // 表格配置
  table: {
    defaultPageSize: number
    pageSizeOptions: number[]
    showPagination: boolean
    showSorting: boolean
    showFiltering: boolean
    showSearch: boolean
    showActions: boolean
    density: 'compact' | 'standard' | 'comfortable'
    striped: boolean
    bordered: boolean
    hoverable: boolean
  }
  
  // 表单配置
  form: {
    layout: 'vertical' | 'horizontal' | 'inline'
    labelAlign: 'left' | 'right'
    labelWidth: string
    showValidation: boolean
    showHelpText: boolean
    requiredMark: boolean
    colon: boolean
  }
  
  // 按钮配置
  button: {
    size: 'small' | 'medium' | 'large'
    shape: 'default' | 'circle' | 'round'
    showIcon: boolean
    loadingDelay: number
    autoInsertSpace: boolean
  }
  
  // 卡片配置
  card: {
    bordered: boolean
    hoverable: boolean
    size: 'small' | 'default' | 'large'
    cover: boolean
    actions: boolean
    extra: boolean
  }
  
  // 模态框配置
  modal: {
    width: string
    centered: boolean
    closable: boolean
    maskClosable: boolean
    keyboard: boolean
    destroyOnClose: boolean
    forceRender: boolean
  }
  
  // 通知配置
  notification: {
    placement: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
    duration: number
    maxCount: number
    showProgress: boolean
    showCloseButton: boolean
  }
  
  // 加载配置
  loading: {
    delay: number
    size: 'small' | 'medium' | 'large'
    tip: string
    indicator: string
  }
  
  // 图标配置
  icons: {
    size: 'small' | 'medium' | 'large'
    style: 'outline' | 'filled' | 'two-tone'
    theme: 'outlined' | 'filled' | 'two-tone'
  }
  
  // 响应式断点配置
  breakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    '2xl': number
  }
  
  // 动画配置
  animation: {
    duration: {
      fast: number
      normal: number
      slow: number
    }
    easing: {
      easeIn: string
      easeOut: string
      easeInOut: string
    }
  }
}

// 默认UI配置
export const defaultUIConfig: UIConfig = {
  theme: {
    mode: 'system',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#1e293b',
    borderColor: '#e2e8f0',
    borderRadius: '0.375rem',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    }
  },
  
  layout: {
    header: {
      height: '64px',
      fixed: true,
      showLogo: true,
      showNavigation: true,
      showSearch: true,
      showUserMenu: true
    },
    sidebar: {
      width: '240px',
      collapsible: true,
      collapsedWidth: '80px',
      showIcons: true,
      showBadges: true
    },
    footer: {
      height: '48px',
      showCopyright: true,
      showLinks: true,
      showVersion: true
    },
    content: {
      padding: '1.5rem',
      maxWidth: '1280px',
      centerContent: true
    }
  },
  
  table: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    showPagination: true,
    showSorting: true,
    showFiltering: true,
    showSearch: true,
    showActions: true,
    density: 'standard',
    striped: false,
    bordered: true,
    hoverable: true
  },
  
  form: {
    layout: 'vertical',
    labelAlign: 'left',
    labelWidth: '120px',
    showValidation: true,
    showHelpText: true,
    requiredMark: true,
    colon: true
  },
  
  button: {
    size: 'medium',
    shape: 'default',
    showIcon: true,
    loadingDelay: 300,
    autoInsertSpace: true
  },
  
  card: {
    bordered: true,
    hoverable: false,
    size: 'default',
    cover: true,
    actions: true,
    extra: true
  },
  
  modal: {
    width: '520px',
    centered: true,
    closable: true,
    maskClosable: true,
    keyboard: true,
    destroyOnClose: false,
    forceRender: false
  },
  
  notification: {
    placement: 'topRight',
    duration: 4500,
    maxCount: 3,
    showProgress: true,
    showCloseButton: true
  },
  
  loading: {
    delay: 200,
    size: 'medium',
    tip: 'Loading...',
    indicator: 'spinner'
  },
  
  icons: {
    size: 'medium',
    style: 'outline',
    theme: 'outlined'
  },
  
  breakpoints: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
}

// 暗色主题配置
export const darkThemeConfig: Partial<UIConfig> = {
  theme: {
    mode: 'dark',
    backgroundColor: '#0f172a',
    surfaceColor: '#1e293b',
    textColor: '#f1f5f9',
    borderColor: '#334155'
  }
}

// 紧凑布局配置
export const compactLayoutConfig: Partial<UIConfig> = {
  layout: {
    header: {
      height: '48px'
    },
    sidebar: {
      width: '200px',
      collapsedWidth: '64px'
    },
    content: {
      padding: '1rem'
    }
  },
  table: {
    density: 'compact'
  }
}

// 获取UI配置
export function getUIConfig(): UIConfig {
  return defaultUIConfig
}

// 获取主题配置
export function getThemeConfig(theme?: 'light' | 'dark' | 'system'): Partial<UIConfig> {
  const config = getUIConfig()
  
  if (theme === 'dark') {
    return { ...config, ...darkThemeConfig }
  }
  
  return config
}

// 获取布局配置
export function getLayoutConfig(layout?: 'default' | 'compact'): Partial<UIConfig> {
  const config = getUIConfig()
  
  if (layout === 'compact') {
    return { ...config, ...compactLayoutConfig }
  }
  
  return config
}

// 获取表格配置
export function getTableConfig(overrides: Partial<UIConfig['table']> = {}): UIConfig['table'] {
  const config = getUIConfig()
  return { ...config.table, ...overrides }
}

// 获取表单配置
export function getFormConfig(overrides: Partial<UIConfig['form']> = {}): UIConfig['form'] {
  const config = getUIConfig()
  return { ...config.form, ...overrides }
}

// 获取按钮配置
export function getButtonConfig(overrides: Partial<UIConfig['button']> = {}): UIConfig['button'] {
  const config = getUIConfig()
  return { ...config.button, ...overrides }
}

// 获取卡片配置
export function getCardConfig(overrides: Partial<UIConfig['card']> = {}): UIConfig['card'] {
  const config = getUIConfig()
  return { ...config.card, ...overrides }
}

// 获取模态框配置
export function getModalConfig(overrides: Partial<UIConfig['modal']> = {}): UIConfig['modal'] {
  const config = getUIConfig()
  return { ...config.modal, ...overrides }
}

// 获取通知配置
export function getNotificationConfig(overrides: Partial<UIConfig['notification']> = {}): UIConfig['notification'] {
  const config = getUIConfig()
  return { ...config.notification, ...overrides }
}

// 获取响应式断点配置
export function getBreakpointsConfig(): UIConfig['breakpoints'] {
  const config = getUIConfig()
  return config.breakpoints
}

// 获取动画配置
export function getAnimationConfig(): UIConfig['animation'] {
  const config = getUIConfig()
  return config.animation
}

// 验证UI配置
export function validateUIConfig(config: UIConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 验证主题配置
  if (!['light', 'dark', 'system'].includes(config.theme.mode)) {
    errors.push('Theme mode must be one of: light, dark, system')
  }
  
  // 验证表格分页配置
  if (config.table.defaultPageSize < 1) {
    errors.push('Default page size must be greater than 0')
  }
  
  // 验证通知配置
  if (config.notification.duration < 0) {
    errors.push('Notification duration must be non-negative')
  }
  
  // 验证加载配置
  if (config.loading.delay < 0) {
    errors.push('Loading delay must be non-negative')
  }
  
  // 验证断点配置
  const breakpoints = config.breakpoints
  if (breakpoints.xs >= breakpoints.sm || 
      breakpoints.sm >= breakpoints.md || 
      breakpoints.md >= breakpoints.lg || 
      breakpoints.lg >= breakpoints.xl || 
      breakpoints.xl >= breakpoints['2xl']) {
    errors.push('Breakpoints must be in ascending order')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// 导出默认配置
export default getUIConfig