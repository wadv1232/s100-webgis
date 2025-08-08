import { Permission, UserRole } from '@prisma/client'

// 角色默认权限配置
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // 系统管理员拥有所有权限
    Permission.NODE_CREATE,
    Permission.NODE_READ,
    Permission.NODE_UPDATE,
    Permission.NODE_DELETE,
    Permission.DATASET_CREATE,
    Permission.DATASET_READ,
    Permission.DATASET_UPDATE,
    Permission.DATASET_DELETE,
    Permission.DATASET_PUBLISH,
    Permission.SERVICE_CREATE,
    Permission.SERVICE_READ,
    Permission.SERVICE_UPDATE,
    Permission.SERVICE_DELETE,
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.SYSTEM_CONFIG,
    Permission.SYSTEM_MONITOR,
    Permission.API_READ,
    Permission.API_TEST,
    Permission.API_KEY_CREATE,
    Permission.API_KEY_MANAGE,
  ],
  NODE_ADMIN: [
    // 节点管理员权限
    Permission.NODE_CREATE,
    Permission.NODE_READ,
    Permission.NODE_UPDATE,
    Permission.DATASET_CREATE,
    Permission.DATASET_READ,
    Permission.DATASET_UPDATE,
    Permission.DATASET_PUBLISH,
    Permission.SERVICE_CREATE,
    Permission.SERVICE_READ,
    Permission.SERVICE_UPDATE,
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.SYSTEM_MONITOR,
    Permission.API_READ,
    Permission.API_TEST,
  ],
  DATA_MANAGER: [
    // 数据管理员权限
    Permission.NODE_READ,
    Permission.DATASET_CREATE,
    Permission.DATASET_READ,
    Permission.DATASET_UPDATE,
    Permission.DATASET_PUBLISH,
    Permission.SERVICE_READ,
    Permission.SYSTEM_MONITOR,
    Permission.API_READ,
  ],
  SERVICE_MANAGER: [
    // 服务管理员权限
    Permission.NODE_READ,
    Permission.DATASET_READ,
    Permission.SERVICE_CREATE,
    Permission.SERVICE_READ,
    Permission.SERVICE_UPDATE,
    Permission.SYSTEM_MONITOR,
    Permission.API_READ,
    Permission.API_TEST,
  ],
  DEVELOPER: [
    // 开发者权限
    Permission.NODE_READ,
    Permission.DATASET_READ,
    Permission.SERVICE_READ,
    Permission.API_READ,
    Permission.API_TEST,
    Permission.API_KEY_CREATE,
    Permission.API_KEY_MANAGE,
  ],
  USER: [
    // 普通用户权限
    Permission.NODE_READ,
    Permission.DATASET_READ,
    Permission.SERVICE_READ,
  ],
  GUEST: [
    // 游客权限
    Permission.NODE_READ,
    Permission.DATASET_READ,
  ],
}

// 用户场景配置 - 基于使用场景而非角色
export const USER_SCENARIOS = [
  {
    name: '航海导航',
    description: '船长、船员在航行中需要实时海事数据支持',
    icon: 'Anchor',
    color: 'blue',
    targetRoles: ['USER', 'GUEST'],
    permissions: [
      Permission.NODE_READ,
      Permission.DATASET_READ,
      Permission.SERVICE_READ,
    ],
    actions: [
      {
        title: '查看海图',
        href: '/map-services',
        description: '访问实时海图服务'
      },
      {
        title: '航行警告',
        href: '/map-services?filter=warnings',
        description: '查看航行警告信息'
      }
    ]
  },
  {
    name: '数据发布',
    description: '港口、海事局数据管理员需要发布和管理海事数据',
    icon: 'Database',
    color: 'green',
    targetRoles: ['DATA_MANAGER', 'NODE_ADMIN', 'ADMIN'],
    permissions: [
      Permission.NODE_READ,
      Permission.DATASET_CREATE,
      Permission.DATASET_READ,
      Permission.DATASET_UPDATE,
      Permission.DATASET_PUBLISH,
      Permission.SERVICE_READ,
      Permission.SYSTEM_MONITOR,
      Permission.API_READ,
    ],
    actions: [
      {
        title: '数据管理',
        href: '/datasets',
        description: '上传和管理海事数据集'
      },
      {
        title: '发布服务',
        href: '/services',
        description: '配置和发布数据服务'
      }
    ]
  },
  {
    name: '区域监控',
    description: '区域海事分局需要监控辖区内数据服务质量和节点状态',
    icon: 'Map',
    color: 'orange',
    targetRoles: ['NODE_ADMIN', 'ADMIN'],
    permissions: [
      Permission.NODE_CREATE,
      Permission.NODE_READ,
      Permission.NODE_UPDATE,
      Permission.DATASET_CREATE,
      Permission.DATASET_READ,
      Permission.DATASET_UPDATE,
      Permission.DATASET_PUBLISH,
      Permission.SERVICE_CREATE,
      Permission.SERVICE_READ,
      Permission.SERVICE_UPDATE,
      Permission.USER_CREATE,
      Permission.USER_READ,
      Permission.USER_UPDATE,
      Permission.SYSTEM_MONITOR,
      Permission.API_READ,
      Permission.API_TEST,
    ],
    actions: [
      {
        title: '节点管理',
        href: '/nodes',
        description: '管理区域内节点和层级结构'
      },
      {
        title: '服务监控',
        href: '/monitoring',
        description: '监控服务健康状态和性能'
      }
    ]
  },
  {
    name: '系统治理',
    description: 'IHO协调员需要全局视角管理整个海事数据网络',
    icon: 'Settings',
    color: 'purple',
    targetRoles: ['ADMIN'],
    permissions: ROLE_PERMISSIONS.ADMIN,
    actions: [
      {
        title: '用户管理',
        href: '/users',
        description: '管理用户和权限分配'
      },
      {
        title: '系统配置',
        href: '/system-config',
        description: '配置系统全局参数'
      }
    ]
  },
  {
    name: '服务维护',
    description: 'S-100服务提供商需要维护和更新服务接口',
    icon: 'Activity',
    color: 'teal',
    targetRoles: ['SERVICE_MANAGER', 'ADMIN'],
    permissions: [
      Permission.NODE_READ,
      Permission.DATASET_READ,
      Permission.SERVICE_CREATE,
      Permission.SERVICE_READ,
      Permission.SERVICE_UPDATE,
      Permission.SYSTEM_MONITOR,
      Permission.API_READ,
      Permission.API_TEST,
    ],
    actions: [
      {
        title: '服务管理',
        href: '/services',
        description: '管理和维护S-100服务'
      },
      {
        title: 'API测试',
        href: '/api-test-console',
        description: '测试和验证API服务'
      }
    ]
  },
  {
    name: '应用开发',
    description: 'ECDIS开发者需要API接口和开发工具来集成海事数据',
    icon: 'Code',
    color: 'indigo',
    targetRoles: ['DEVELOPER', 'ADMIN'],
    permissions: [
      Permission.NODE_READ,
      Permission.DATASET_READ,
      Permission.SERVICE_READ,
      Permission.API_READ,
      Permission.API_TEST,
      Permission.API_KEY_CREATE,
      Permission.API_KEY_MANAGE,
    ],
    actions: [
      {
        title: '开发者门户',
        href: '/developer',
        description: 'API文档和开发工具'
      },
      {
        title: 'API测试',
        href: '/api-test-console',
        description: '在线API测试和调试'
      }
    ]
  },
]

// 权限检查函数
export function hasPermission(
  userRole: UserRole,
  permission: Permission,
  userPermissions?: Permission[]
): boolean {
  // 如果有用户特定权限，优先检查
  if (userPermissions) {
    return userPermissions.includes(permission)
  }
  
  // 否则检查角色默认权限
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

// 检查用户是否有任意一个权限
export function hasAnyPermission(
  userRole: UserRole,
  permissions: Permission[],
  userPermissions?: Permission[]
): boolean {
  return permissions.some(permission => 
    hasPermission(userRole, permission, userPermissions)
  )
}

// 检查用户是否有所有权限
export function hasAllPermissions(
  userRole: UserRole,
  permissions: Permission[],
  userPermissions?: Permission[]
): boolean {
  return permissions.every(permission => 
    hasPermission(userRole, permission, userPermissions)
  )
}

// 获取用户可访问的菜单项
export function getAccessibleMenuItems(userRole: UserRole) {
  const menuItems = [
    {
      name: '首页',
      href: '/',
      icon: 'Home',
      requiredPermissions: [] // 所有人都可以访问
    },
    {
      name: '服务管理',
      href: '/services',
      icon: 'Settings',
      requiredPermissions: [Permission.SERVICE_READ]
    },
    {
      name: '节点管理',
      href: '/nodes',
      icon: 'Settings',
      requiredPermissions: [Permission.NODE_READ]
    },
    {
      name: '数据集管理',
      href: '/datasets',
      icon: 'Database',
      requiredPermissions: [Permission.DATASET_READ]
    },
    {
      name: '服务能力',
      href: '/capabilities',
      icon: 'Waves',
      requiredPermissions: [Permission.SERVICE_READ]
    },
    {
      name: '地图服务',
      href: '/map-services',
      icon: 'Map',
      requiredPermissions: [Permission.SERVICE_READ]
    },
    {
      name: '开发者门户',
      href: '/developer',
      icon: 'Code',
      requiredPermissions: [Permission.API_READ]
    },
    {
      name: '系统监控',
      href: '/monitoring',
      icon: 'Activity',
      requiredPermissions: [Permission.SYSTEM_MONITOR]
    },
    {
      name: '用户管理',
      href: '/users',
      icon: 'Users',
      requiredPermissions: [Permission.USER_READ]
    },
  ]

  return menuItems.filter(item => {
    if (item.requiredPermissions.length === 0) return true
    return hasAnyPermission(userRole, item.requiredPermissions)
  })
}