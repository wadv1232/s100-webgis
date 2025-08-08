import jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'

export interface ValidatedToken {
  isValid: boolean
  payload?: any
  issuer?: string
  localUser?: {
    id: string
    email: string
    username: string
    name?: string
    role: UserRole
    nodeId?: string
    isActive: boolean
  }
  error?: string
}

// 模拟用户数据库 - 在实际应用中应该从数据库获取
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    username: 'admin',
    name: '系统管理员',
    role: UserRole.ADMIN,
    isActive: true,
  },
  {
    id: '2',
    email: 'node-admin@example.com',
    username: 'node_admin',
    name: '节点管理员',
    role: UserRole.NODE_ADMIN,
    nodeId: 'china-national',
    isActive: true,
  },
  {
    id: '3',
    email: 'data-manager@example.com',
    username: 'data_manager',
    name: '数据管理员',
    role: UserRole.DATA_MANAGER,
    nodeId: 'shanghai-port',
    isActive: true,
  },
  {
    id: '4',
    email: 'service-manager@example.com',
    username: 'service_manager',
    name: '服务管理员',
    role: UserRole.SERVICE_MANAGER,
    isActive: true,
  },
  {
    id: '5',
    email: 'user@example.com',
    username: 'user',
    name: '普通用户',
    role: UserRole.USER,
    isActive: true,
  },
  {
    id: '6',
    email: 'guest@example.com',
    username: 'guest',
    name: '游客',
    role: UserRole.GUEST,
    isActive: true,
  },
]

export class FederatedJWTValidator {
  private secretKey: string
  private trustedIssuers: string[]

  constructor(secretKey?: string, trustedIssuers?: string[]) {
    this.secretKey = secretKey || process.env.JWT_SECRET || 'your-secret-key'
    this.trustedIssuers = trustedIssuers || [
      'https://auth.example.com',
      'https://sso.example.com',
      'https://identity.example.com'
    ]
  }

  async validateToken(token: string): Promise<ValidatedToken> {
    try {
      // 验证JWT token
      const decoded = jwt.verify(token, this.secretKey) as any
      
      // 检查发行者是否可信
      if (decoded.iss && !this.trustedIssuers.includes(decoded.iss)) {
        return {
          isValid: false,
          error: 'Untrusted issuer'
        }
      }

      // 查找对应的本地用户
      const localUser = mockUsers.find(user => 
        user.email === decoded.email || 
        user.username === decoded.sub ||
        user.id === decoded.sub
      )

      if (!localUser) {
        return {
          isValid: false,
          error: 'User not found in local database'
        }
      }

      if (!localUser.isActive) {
        return {
          isValid: false,
          error: 'User account is inactive'
        }
      }

      return {
        isValid: true,
        payload: decoded,
        issuer: decoded.iss,
        localUser
      }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          isValid: false,
          error: error.message
        }
      }
      
      return {
        isValid: false,
        error: 'Token validation failed'
      }
    }
  }

  // 添加可信发行者
  addTrustedIssuer(issuer: string): void {
    if (!this.trustedIssuers.includes(issuer)) {
      this.trustedIssuers.push(issuer)
    }
  }

  // 移除可信发行者
  removeTrustedIssuer(issuer: string): void {
    const index = this.trustedIssuers.indexOf(issuer)
    if (index > -1) {
      this.trustedIssuers.splice(index, 1)
    }
  }

  // 获取所有可信发行者
  getTrustedIssuers(): string[] {
    return [...this.trustedIssuers]
  }
}

// 导出单例实例
export const federatedJWTValidator = new FederatedJWTValidator()