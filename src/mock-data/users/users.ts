// 用户相关模拟数据
import { UserRole, Permission } from '@prisma/client';

// 用户模拟数据
export const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@iho.org',
    name: '系统管理员',
    role: UserRole.ADMIN,
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date('2024-01-01').toISOString(),
    permissions: Object.values(Permission)
  },
  {
    id: '2',
    username: 'node_admin',
    email: 'admin@east.msa.gov.cn',
    name: '张三',
    role: UserRole.NODE_ADMIN,
    isActive: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date('2024-02-01').toISOString(),
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
      Permission.API_TEST
    ]
  },
  {
    id: '3',
    username: 'data_manager',
    email: 'manager@shanghai-port.gov.cn',
    name: '李四',
    role: UserRole.DATA_MANAGER,
    isActive: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date('2024-03-01').toISOString(),
    permissions: [
      Permission.NODE_READ,
      Permission.DATASET_CREATE,
      Permission.DATASET_READ,
      Permission.DATASET_UPDATE,
      Permission.DATASET_PUBLISH,
      Permission.SERVICE_READ,
      Permission.SYSTEM_MONITOR,
      Permission.API_READ
    ]
  },
  {
    id: '4',
    username: 'service_manager',
    email: 'service@provider.com',
    name: '王五',
    role: UserRole.SERVICE_MANAGER,
    isActive: true,
    lastLogin: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date('2024-04-01').toISOString(),
    permissions: [
      Permission.NODE_READ,
      Permission.DATASET_READ,
      Permission.SERVICE_CREATE,
      Permission.SERVICE_READ,
      Permission.SERVICE_UPDATE,
      Permission.SYSTEM_MONITOR,
      Permission.API_READ,
      Permission.API_TEST
    ]
  },
  {
    id: '5',
    username: 'developer',
    email: 'dev@company.com',
    name: '赵六',
    role: UserRole.DEVELOPER,
    isActive: true,
    lastLogin: new Date(Date.now() - 345600000).toISOString(),
    createdAt: new Date('2024-05-01').toISOString(),
    permissions: [
      Permission.NODE_READ,
      Permission.DATASET_READ,
      Permission.SERVICE_READ,
      Permission.API_READ,
      Permission.API_TEST,
      Permission.API_KEY_CREATE,
      Permission.API_KEY_MANAGE
    ]
  },
  {
    id: '6',
    username: 'user',
    email: 'user@example.com',
    name: '钱七',
    role: UserRole.USER,
    isActive: true,
    lastLogin: new Date(Date.now() - 432000000).toISOString(),
    createdAt: new Date('2024-06-01').toISOString(),
    permissions: [
      Permission.NODE_READ,
      Permission.DATASET_READ,
      Permission.SERVICE_READ
    ]
  },
  {
    id: '7',
    username: 'inactive_user',
    email: 'inactive@example.com',
    name: '孙八',
    role: UserRole.USER,
    isActive: false,
    lastLogin: new Date(Date.now() - 2592000000).toISOString(),
    createdAt: new Date('2024-01-15').toISOString(),
    permissions: [
      Permission.NODE_READ,
      Permission.DATASET_READ,
      Permission.SERVICE_READ
    ]
  }
];

// 用户角色显示名称映射
export const getUserRoleName = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return '系统管理员';
    case UserRole.NODE_ADMIN:
      return '节点管理员';
    case UserRole.DATA_MANAGER:
      return '数据管理员';
    case UserRole.SERVICE_MANAGER:
      return '服务管理员';
    case UserRole.DEVELOPER:
      return '开发者';
    case UserRole.USER:
      return '普通用户';
    case UserRole.GUEST:
      return '游客';
    default:
      return '未知角色';
  }
};

// 用户统计模拟数据
export const userStats = {
  totalUsers: 7,
  activeUsers: 6,
  inactiveUsers: 1,
  usersByRole: {
    [UserRole.ADMIN]: 1,
    [UserRole.NODE_ADMIN]: 1,
    [UserRole.DATA_MANAGER]: 1,
    [UserRole.SERVICE_MANAGER]: 1,
    [UserRole.DEVELOPER]: 1,
    [UserRole.USER]: 2
  },
  recentLogins: [
    { date: '2024-12-01', count: 15 },
    { date: '2024-12-02', count: 12 },
    { date: '2024-12-03', count: 18 },
    { date: '2024-12-04', count: 14 },
    { date: '2024-12-05', count: 20 },
    { date: '2024-12-06', count: 16 },
    { date: '2024-12-07', count: 22 }
  ]
};