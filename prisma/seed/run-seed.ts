#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function runSeed() {
  try {
    console.log('开始运行数据库种子脚本...')
    
    // 检查是否已有数据
    const userCount = await prisma.user.count()
    const nodeCount = await prisma.node.count()
    
    if (userCount > 0 || nodeCount > 0) {
      console.log('数据库中已有数据，跳过种子数据初始化')
      return
    }
    
    // 运行种子脚本
    await import('./index')
    
    console.log('数据库种子数据初始化完成')
  } catch (error) {
    console.error('运行数据库种子脚本失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runSeed()