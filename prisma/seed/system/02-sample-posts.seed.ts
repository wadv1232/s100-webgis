import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedSamplePosts(users: any[]) {
  console.log('创建示例帖子...')
  
  const adminUser = users.find(u => u.role === 'ADMIN')
  const normalUser = users.find(u => u.role === 'USER')
  
  if (!adminUser || !normalUser) {
    console.log('未找到管理员或普通用户，跳过创建示例帖子')
    return []
  }
  
  const posts = [
    {
      title: '欢迎使用S-100海事服务平台',
      content: '这是一个基于IHO S-100标准的全球海事数据服务网络。平台提供电子海图、高精度水深、动态水位、实时海流等多种海事数据服务。',
      published: true,
      authorId: adminUser.id
    },
    {
      title: '平台使用指南',
      content: '本平台支持多种用户角色：系统管理员、节点管理员、数据管理员、服务管理员、开发者和普通用户。每个角色都有相应的权限和功能。',
      published: true,
      authorId: adminUser.id
    },
    {
      title: '数据更新通知',
      content: '上海港和宁波港的最新数据已经更新，包括电子海图、水深数据和海流数据。请及时查看和使用最新数据。',
      published: true,
      authorId: normalUser.id
    },
    {
      title: '服务维护公告',
      content: '系统将于本周六凌晨2:00-4:00进行维护升级，期间部分服务可能不可用。请提前做好准备。',
      published: false,
      authorId: adminUser.id
    }
  ]

  const createdPosts = []
  for (const post of posts) {
    try {
      const createdPost = await prisma.post.create({
        data: post
      })
      createdPosts.push(createdPost)
    } catch (error) {
      console.log(`帖子已存在，跳过: ${post.title}`)
    }
  }

  console.log(`✅ 创建了 ${createdPosts.length} 个示例帖子`)
  return createdPosts
}