import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedUsers(nodes: any[]) {
  console.log('创建用户...')
  
  const [globalRoot, chinaNational, eastChinaBureau, shanghaiPort, ningboPort] = nodes
  
  const users = [
    // 全球根节点管理员 - 史密斯博士（用户故事11-15）
    {
      email: 'david.smith@iho.org',
      username: 'dsmith',
      name: 'Dr. David Schmidt',
      role: UserRole.ADMIN,
      nodeId: globalRoot.id,
      isActive: true
    },
    // 国家级管理员 - 张总工（用户故事16-18）
    {
      email: 'zhang.chief@msa.gov.cn',
      username: 'zhangchief',
      name: '张总工',
      role: UserRole.NODE_ADMIN,
      nodeId: chinaNational.id,
      isActive: true
    },
    // 区域管理员 - 李处长（用户故事6-10）
    {
      email: 'li.director@east.msa.gov.cn',
      username: 'lidirector',
      name: '李处长',
      role: UserRole.NODE_ADMIN,
      nodeId: eastChinaBureau.id,
      isActive: true
    },
    // 叶子节点操作员 - 陈工（用户故事1-5）
    {
      email: 'chen.wei@shanghai-port.msa.gov.cn',
      username: 'chenwei',
      name: '陈工',
      role: UserRole.DATA_MANAGER,
      nodeId: shanghaiPort.id,
      isActive: true
    },
    // 叶子节点操作员 - 王工（宁波港）
    {
      email: 'wang.li@ningbo-port.msa.gov.cn',
      username: 'wangli',
      name: '王工',
      role: UserRole.DATA_MANAGER,
      nodeId: ningboPort.id,
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
    // 创新负责人 - 张博士（用户故事19-20）
    {
      email: 'zhang.dr@singapore-port.gov.sg',
      username: 'zhangdr',
      name: '张博士',
      role: UserRole.DEVELOPER,
      nodeId: null,
      isActive: true
    },
    // 应用开发者 - 艾伦（用户故事21-22）
    {
      email: 'alan.developer@shipping-company.com',
      username: 'alandev',
      name: 'Alan',
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
    },
    // 前端测试用户 - 管理员
    {
      email: 'admin@example.com',
      username: 'admin',
      name: 'Frontend Admin',
      role: UserRole.ADMIN,
      nodeId: globalRoot.id,
      isActive: true
    },
    // 前端测试用户 - 节点管理员
    {
      email: 'node-admin@example.com',
      username: 'nodeadmin',
      name: 'Frontend Node Admin',
      role: UserRole.NODE_ADMIN,
      nodeId: chinaNational.id,
      isActive: true
    },
    // 前端测试用户 - 数据管理员
    {
      email: 'data-manager@example.com',
      username: 'datamanager',
      name: 'Frontend Data Manager',
      role: UserRole.DATA_MANAGER,
      nodeId: shanghaiPort.id,
      isActive: true
    },
    // 前端测试用户 - 开发者
    {
      email: 'developer@ecdis-company.com',
      username: 'developer',
      name: 'Frontend Developer',
      role: UserRole.DEVELOPER,
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