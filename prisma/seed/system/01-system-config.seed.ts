import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedSystemConfig() {
  console.log('创建系统配置...')
  
  const systemConfigs = [
    {
      key: 'app.name',
      value: JSON.stringify('S-100海事服务平台'),
      description: '应用程序名称',
      category: 'general',
      isSystem: true
    },
    {
      key: 'app.version',
      value: JSON.stringify('1.0.0'),
      description: '应用程序版本',
      category: 'general',
      isSystem: true
    },
    {
      key: 'app.description',
      value: JSON.stringify('基于IHO S-100标准的全球海事数据服务网络'),
      description: '应用程序描述',
      category: 'general',
      isSystem: true
    },
    {
      key: 'security.jwt.secret',
      value: JSON.stringify('your-super-secret-jwt-key-change-in-production'),
      description: 'JWT签名密钥',
      category: 'security',
      isSystem: true
    },
    {
      key: 'security.jwt.expiresIn',
      value: JSON.stringify('24h'),
      description: 'JWT过期时间',
      category: 'security',
      isSystem: true
    },
    {
      key: 'sync.interval',
      value: JSON.stringify(3600),
      description: '服务同步间隔（秒）',
      category: 'sync',
      isSystem: false
    },
    {
      key: 'sync.timeout',
      value: JSON.stringify(300),
      description: '同步超时时间（秒）',
      category: 'sync',
      isSystem: false
    },
    {
      key: 'cache.ttl',
      value: JSON.stringify(1800),
      description: '缓存生存时间（秒）',
      category: 'cache',
      isSystem: false
    },
    {
      key: 'upload.maxFileSize',
      value: JSON.stringify(104857600),
      description: '最大文件上传大小（字节）',
      category: 'upload',
      isSystem: false
    },
    {
      key: 'upload.allowedTypes',
      value: JSON.stringify(['.zip', '.tiff', '.json', '.xml']),
      description: '允许上传的文件类型',
      category: 'upload',
      isSystem: false
    }
  ]

  const createdConfigs = []
  for (const config of systemConfigs) {
    try {
      const createdConfig = await prisma.systemConfig.create({
        data: config
      })
      createdConfigs.push(createdConfig)
    } catch (error) {
      console.log(`系统配置已存在，跳过: ${config.key}`)
    }
  }

  console.log(`✅ 创建了 ${createdConfigs.length} 个系统配置`)
  return createdConfigs
}