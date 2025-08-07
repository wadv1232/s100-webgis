import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedUsers(nodes: any[]) {
  console.log('创建用户...')
  
  const [globalRoot, chinaNational, eastChinaBureau, shanghaiPort] = nodes
  
  const users = [
    // 系统管理员 - 史密斯博士
    {
      email: 'david.smith@iho.org',
      username: 'dsmith',
      name: 'Dr. David Smith',
      role: UserRole.ADMIN,
      nodeId: globalRoot.id,
      isActive: true
    },
    // 国家级管理员 - 张总工
    {
      email: 'zhang.chief@msa.gov.cn',
      username: 'zhangchief',
      name: '张总工',
      role: UserRole.NODE_ADMIN,
      nodeId: chinaNational.id,
      isActive: true
    },
    // 区域管理员 - 王处长
    {
      email: 'wang.director@east.msa.gov.cn',
      username: 'wangdirector',
      name: '王处长',
      role: UserRole.NODE_ADMIN,
      nodeId: eastChinaBureau.id,
      isActive: true
    },
    // 数据管理员 - 李工
    {
      email: 'li.wei@shanghai-port.msa.gov.cn',
      username: 'liwei',
      name: '李工',
      role: UserRole.DATA_MANAGER,
      nodeId: shanghaiPort.id,
      isActive: true
    },
    // 终端用户 - 伊娃船长
    {
      email: 'eva.captain@shipping.com',
      username: 'evacaptain',
      name: '伊娃船长',
      role: UserRole.USER,
      nodeId: null,
      isActive: true
    },
    // 服务管理员
    {
      email: 'service.admin@msa.gov.cn',
      username: 'serviceadmin',
      name: '服务管理员',
      role: UserRole.SERVICE_MANAGER,
      nodeId: chinaNational.id,
      isActive: true
    },
    // 开发者
    {
      email: 'developer@ecdis-company.com',
      username: 'developer',
      name: 'ECDIS开发者',
      role: UserRole.DEVELOPER,
      nodeId: null,
      isActive: true
    },
    // 游客用户
    {
      email: 'guest@example.com',
      username: 'guest',
      name: 'Guest User',
      role: UserRole.GUEST,
      nodeId: null,
      isActive: true
    }
  ]

  const createdUsers = []
  for (const user of users) {
    try {
      const createdUser = await prisma.user.create({
        data: user
      })
      createdUsers.push(createdUser)
    } catch (error) {
      console.log(`用户已存在，跳过: ${user.username}`)
      // 尝试获取现有用户
      const existingUser = await prisma.user.findUnique({
        where: { username: user.username }
      })
      if (existingUser) {
        createdUsers.push(existingUser)
      }
    }
  }

  console.log(`✅ 创建了 ${createdUsers.length} 个用户`)
  return createdUsers
}