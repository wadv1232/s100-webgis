#!/usr/bin/env node

// Script to seed database with consistent node IDs that match mock data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('Seeding database with consistent node IDs...\n');
    
    // Delete existing data in correct order to respect foreign key constraints
    console.log('Cleaning existing data...');
    await prisma.userBaseMapPreference.deleteMany();
    await prisma.nodeBaseMapConfig.deleteMany();
    await prisma.scenarioRole.deleteMany();
    await prisma.userPermission.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.serviceDirectoryEntry.deleteMany();
    await prisma.syncTask.deleteMany();
    await prisma.childNode.deleteMany();
    await prisma.capability.deleteMany();
    await prisma.dataset.deleteMany();
    await prisma.service.deleteMany();
    await prisma.post.deleteMany(); // Delete posts before users
    await prisma.user.deleteMany();
    await prisma.node.deleteMany();
    console.log('✅ Existing data cleaned\n');
    
    // Create nodes with consistent IDs
    console.log('Creating nodes with consistent IDs...');
    const nodeData = [
      {
        id: 'global-root',
        code: 'IHO_GLOBAL_ROOT',
        name: 'IHO全球根节点',
        type: 'GLOBAL_ROOT',
        level: 0,
        description: '国际海道测量组织全球协调节点',
        healthStatus: 'HEALTHY',
        isActive: true,
        apiUrl: 'https://api.iho.org/global',
        adminUrl: 'https://admin.iho.org/global',
        coverage: '全球范围',
        latitude: 0,
        longitude: 0,
        lastHealthCheck: new Date(),
      },
      {
        id: 'china-national',
        code: 'CHINA_NATIONAL',
        name: '中国海事局国家级节点',
        type: 'NATIONAL',
        level: 1,
        description: '中国海事局总部的技术负责人',
        healthStatus: 'HEALTHY',
        isActive: true,
        apiUrl: 'https://api.msa.gov.cn/national',
        adminUrl: 'https://admin.msa.gov.cn/national',
        coverage: '中国沿海',
        latitude: 35.8617,
        longitude: 104.1954,
        lastHealthCheck: new Date(),
        parentId: 'global-root',
      },
      {
        id: 'east-china-sea',
        code: 'EAST_CHINA_BUREAU',
        name: '东海分局区域节点',
        type: 'REGIONAL',
        level: 2,
        description: '中国海事局东海分局',
        healthStatus: 'HEALTHY',
        isActive: true,
        apiUrl: 'https://api.east.msa.gov.cn',
        adminUrl: 'https://admin.east.msa.gov.cn',
        coverage: '东海区域',
        latitude: 31.2304,
        longitude: 121.4737,
        lastHealthCheck: new Date(),
        parentId: 'china-national',
      },
      {
        id: 'shanghai-port',
        code: 'SHANGHAI_PORT',
        name: '上海港叶子节点',
        type: 'LEAF',
        level: 3,
        description: '上海港务局数据管理中心',
        healthStatus: 'HEALTHY',
        isActive: true,
        apiUrl: 'https://api.shanghai-port.gov.cn',
        adminUrl: 'https://admin.shanghai-port.gov.cn',
        coverage: '上海港区域',
        latitude: 31.2304,
        longitude: 121.4737,
        lastHealthCheck: new Date(),
        parentId: 'east-china-sea',
      },
      {
        id: 'ningbo-port',
        code: 'NINGBO_PORT',
        name: '宁波港叶子节点',
        type: 'LEAF',
        level: 3,
        description: '宁波港务局数据管理中心',
        healthStatus: 'WARNING',
        isActive: true,
        apiUrl: 'https://api.ningbo-port.gov.cn',
        adminUrl: 'https://admin.ningbo-port.gov.cn',
        coverage: '宁波港区域',
        latitude: 29.8683,
        longitude: 121.5440,
        lastHealthCheck: new Date(Date.now() - 3600000),
        parentId: 'east-china-sea',
      }
    ];

    for (const node of nodeData) {
      try {
        await prisma.node.create({
          data: node
        });
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Node ${node.id} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    console.log('✅ Nodes created with consistent IDs\n');
    
    // Create child node relationships
    console.log('Creating child node relationships...');
    const childNodeData = [
      { parentId: 'global-root', childId: 'china-national' },
      { parentId: 'china-national', childId: 'east-china-sea' },
      { parentId: 'east-china-sea', childId: 'shanghai-port' },
      { parentId: 'east-china-sea', childId: 'ningbo-port' },
    ];

    for (const childNode of childNodeData) {
      try {
        await prisma.childNode.create({
          data: childNode
        });
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Child relationship ${childNode.parentId} -> ${childNode.childId} already exists, skipping...`);
        } else {
          console.log(`Error creating child relationship ${childNode.parentId} -> ${childNode.childId}:`, error.message);
        }
      }
    }
    console.log('✅ Child node relationships created\n');
    
    // Create capabilities for nodes
    console.log('Creating node capabilities...');
    await prisma.capability.createMany({
      data: [
        // Shanghai Port capabilities
        {
          nodeId: 'shanghai-port',
          productType: 'S101',
          serviceType: 'WMS',
          isEnabled: true,
          endpoint: '/wms/s101',
          version: '1.3.0'
        },
        {
          nodeId: 'shanghai-port',
          productType: 'S102',
          serviceType: 'WCS',
          isEnabled: true,
          endpoint: '/wcs/s102',
          version: '1.1.1'
        },
        // Ningbo Port capabilities
        {
          nodeId: 'ningbo-port',
          productType: 'S101',
          serviceType: 'WMS',
          isEnabled: true,
          endpoint: '/wms/s101',
          version: '1.3.0'
        },
        // East China Sea capabilities
        {
          nodeId: 'east-china-sea',
          productType: 'S111',
          serviceType: 'WMS',
          isEnabled: true,
          endpoint: '/wms/s111',
          version: '1.3.0'
        },
        {
          nodeId: 'east-china-sea',
          productType: 'S102',
          serviceType: 'WCS',
          isEnabled: true,
          endpoint: '/wcs/s102',
          version: '1.1.1'
        },
        // China National capabilities
        {
          nodeId: 'china-national',
          productType: 'S101',
          serviceType: 'WMS',
          isEnabled: true,
          endpoint: '/wms/s101',
          version: '1.3.0'
        },
        {
          nodeId: 'china-national',
          productType: 'S102',
          serviceType: 'WMS',
          isEnabled: true,
          endpoint: '/wms/s102',
          version: '1.3.0'
        },
        // Global Root capabilities
        {
          nodeId: 'global-root',
          productType: 'S101',
          serviceType: 'WMS',
          isEnabled: true,
          endpoint: '/wms/s101',
          version: '1.3.0'
        },
        {
          nodeId: 'global-root',
          productType: 'S102',
          serviceType: 'WMS',
          isEnabled: true,
          endpoint: '/wms/s102',
          version: '1.3.0'
        },
        {
          nodeId: 'global-root',
          productType: 'S104',
          serviceType: 'WMS',
          isEnabled: true,
          endpoint: '/wms/s104',
          version: '1.3.0'
        },
        {
          nodeId: 'global-root',
          productType: 'S111',
          serviceType: 'WMS',
          isEnabled: true,
          endpoint: '/wms/s111',
          version: '1.3.0'
        }
      ]
    });
    console.log('✅ Node capabilities created\n');
    
    // Create users with consistent roles
    console.log('Creating users...');
    await prisma.user.createMany({
      data: [
        {
          id: '1',
          email: 'admin@example.com',
          username: 'admin',
          name: '系统管理员',
          role: 'ADMIN',
          isActive: true,
        },
        {
          id: '2',
          email: 'node-admin@example.com',
          username: 'node_admin',
          name: '节点管理员',
          role: 'NODE_ADMIN',
          nodeId: 'china-national',
          isActive: true,
        },
        {
          id: '3',
          email: 'data-manager@example.com',
          username: 'data_manager',
          name: '数据管理员',
          role: 'DATA_MANAGER',
          nodeId: 'shanghai-port',
          isActive: true,
        },
        {
          id: '4',
          email: 'service-manager@example.com',
          username: 'service_manager',
          name: '服务管理员',
          role: 'SERVICE_MANAGER',
          isActive: true,
        },
        {
          id: '5',
          email: 'user@example.com',
          username: 'user',
          name: '普通用户',
          role: 'USER',
          isActive: true,
        },
        {
          id: '6',
          email: 'guest@example.com',
          username: 'guest',
          name: '游客',
          role: 'GUEST',
          isActive: true,
        },
      ]
    });
    console.log('✅ Users created\n');
    
    // Create some sample datasets
    console.log('Creating sample datasets...');
    await prisma.dataset.createMany({
      data: [
        {
          name: '上海港电子海图数据集',
          description: '上海港区域S-101电子海图数据',
          productType: 'S101',
          version: '1.0',
          status: 'PUBLISHED',
          fileName: 'shanghai_s101.zip',
          filePath: '/datasets/shanghai_s101.zip',
          fileSize: 1024000,
          mimeType: 'application/zip',
          nodeId: 'shanghai-port',
          publishedAt: new Date(),
        },
        {
          name: '上海港高精度水深数据集',
          description: '上海港区域S-102高精度水深数据',
          productType: 'S102',
          version: '1.0',
          status: 'PUBLISHED',
          fileName: 'shanghai_s102.zip',
          filePath: '/datasets/shanghai_s102.zip',
          fileSize: 2048000,
          mimeType: 'application/zip',
          nodeId: 'shanghai-port',
          publishedAt: new Date(),
        },
        {
          name: '中国海事局电子海图数据集',
          description: '中国沿海S-101电子海图数据',
          productType: 'S101',
          version: '1.0',
          status: 'PUBLISHED',
          fileName: 'china_s101.zip',
          filePath: '/datasets/china_s101.zip',
          fileSize: 5120000,
          mimeType: 'application/zip',
          nodeId: 'china-national',
          publishedAt: new Date(),
        }
      ]
    });
    console.log('✅ Sample datasets created\n');
    
    // Create role permissions
    console.log('Creating role permissions...');
    const rolePermissions = [
      // ADMIN permissions
      { role: 'ADMIN', permission: 'NODE_CREATE' },
      { role: 'ADMIN', permission: 'NODE_READ' },
      { role: 'ADMIN', permission: 'NODE_UPDATE' },
      { role: 'ADMIN', permission: 'NODE_DELETE' },
      { role: 'ADMIN', permission: 'DATASET_CREATE' },
      { role: 'ADMIN', permission: 'DATASET_READ' },
      { role: 'ADMIN', permission: 'DATASET_UPDATE' },
      { role: 'ADMIN', permission: 'DATASET_DELETE' },
      { role: 'ADMIN', permission: 'DATASET_PUBLISH' },
      { role: 'ADMIN', permission: 'SERVICE_CREATE' },
      { role: 'ADMIN', permission: 'SERVICE_READ' },
      { role: 'ADMIN', permission: 'SERVICE_UPDATE' },
      { role: 'ADMIN', permission: 'SERVICE_DELETE' },
      { role: 'ADMIN', permission: 'USER_CREATE' },
      { role: 'ADMIN', permission: 'USER_READ' },
      { role: 'ADMIN', permission: 'USER_UPDATE' },
      { role: 'ADMIN', permission: 'USER_DELETE' },
      { role: 'ADMIN', permission: 'SYSTEM_CONFIG' },
      { role: 'ADMIN', permission: 'SYSTEM_MONITOR' },
      
      // NODE_ADMIN permissions
      { role: 'NODE_ADMIN', permission: 'NODE_READ' },
      { role: 'NODE_ADMIN', permission: 'NODE_UPDATE' },
      { role: 'NODE_ADMIN', permission: 'DATASET_CREATE' },
      { role: 'NODE_ADMIN', permission: 'DATASET_READ' },
      { role: 'NODE_ADMIN', permission: 'DATASET_UPDATE' },
      { role: 'NODE_ADMIN', permission: 'DATASET_PUBLISH' },
      { role: 'NODE_ADMIN', permission: 'SERVICE_CREATE' },
      { role: 'NODE_ADMIN', permission: 'SERVICE_READ' },
      { role: 'NODE_ADMIN', permission: 'SERVICE_UPDATE' },
      { role: 'NODE_ADMIN', permission: 'USER_READ' },
      { role: 'NODE_ADMIN', permission: 'USER_CREATE' },
      { role: 'NODE_ADMIN', permission: 'USER_UPDATE' },
      { role: 'NODE_ADMIN', permission: 'SYSTEM_MONITOR' },
    ];
    
    for (const rp of rolePermissions) {
      await prisma.rolePermission.create({
        data: rp
      });
    }
    console.log('✅ Role permissions created\n');
    
    console.log('🎉 Database seeded successfully with consistent node IDs!');
    console.log('\nNode ID verification:');
    const verifyNodes = await prisma.node.findMany({
      select: { id: true, name: true, type: true }
    });
    verifyNodes.forEach(node => {
      console.log(`- ${node.id}: ${node.name} (${node.type})`);
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();