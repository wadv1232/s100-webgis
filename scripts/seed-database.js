const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建根节点
  const rootNode = await prisma.node.create({
    data: {
      code: 'iho-global',
      name: 'IHO Global Root',
      type: 'GLOBAL_ROOT',
      level: 0,
      description: 'International Hydrographic Organization Global Root Node',
      apiUrl: 'https://iho.int/api',
      coverage: '{"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]}',
      isActive: true,
      healthStatus: 'HEALTHY',
      latitude: 0,
      longitude: 0,
      contactEmail: 'info@iho.int',
      contactOrg: 'IHO',
      defaultZoom: 2,
      minZoom: 1,
      maxZoom: 18,
    },
  });

  // 创建中国国家级节点
  const chinaNode = await prisma.node.create({
    data: {
      code: 'china-msa',
      name: 'China Maritime Safety Administration',
      type: 'NATIONAL',
      level: 1,
      description: '中国海事局国家级节点',
      apiUrl: 'http://localhost:3003/api',
      coverage: '{"type":"Polygon","coordinates":[[[73.33,3.86],[135.05,3.86],[135.05,53.55],[73.33,53.55],[73.33,3.86]]]}',
      isActive: true,
      healthStatus: 'HEALTHY',
      parentId: rootNode.id,
      latitude: 35.8617,
      longitude: 104.1954,
      contactEmail: 'info@msa.gov.cn',
      contactOrg: '中国海事局',
      defaultZoom: 4,
      minZoom: 1,
      maxZoom: 18,
    },
  });

  // 创建上海港节点
  const shanghaiNode = await prisma.node.create({
    data: {
      code: 'shanghai-port',
      name: 'Shanghai Port Authority',
      type: 'LEAF',
      level: 3,
      description: '上海港务局节点',
      apiUrl: 'http://localhost:3003/api',
      coverage: '{"type":"Polygon","coordinates":[[[121.0,31.0],[121.8,31.0],[121.8,31.5],[121.0,31.5],[121.0,31.0]]]}',
      isActive: true,
      healthStatus: 'HEALTHY',
      parentId: chinaNode.id,
      latitude: 31.2304,
      longitude: 121.4737,
      contactEmail: 'info@shanghai-port.gov.cn',
      contactOrg: '上海港务局',
      defaultZoom: 10,
      minZoom: 8,
      maxZoom: 18,
    },
  });

  // 为上海港创建默认底图配置
  const defaultBaseMap = await prisma.nodeBaseMapConfig.create({
    data: {
      nodeId: shanghaiNode.id,
      type: 'osm',
      attribution: '© OpenStreetMap contributors',
      minZoom: 1,
      maxZoom: 18,
      isActive: true,
      isDefault: true,
      showCoordinates: true,
      showLayerPanel: true,
      showLegendPanel: true,
      layerPanelPosition: 'top-right',
      coordinatePanelPosition: 'bottom-left',
      panelOpacity: 95,
      alwaysOnTop: true,
    },
  });

  // 为上海港创建卫星底图配置
  const satelliteBaseMap = await prisma.nodeBaseMapConfig.create({
    data: {
      nodeId: shanghaiNode.id,
      type: 'satellite',
      customUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri, © OpenStreetMap contributors',
      minZoom: 1,
      maxZoom: 18,
      isActive: true,
      isDefault: false,
      showCoordinates: true,
      showLayerPanel: true,
      showLegendPanel: true,
      layerPanelPosition: 'top-right',
      coordinatePanelPosition: 'bottom-left',
      panelOpacity: 95,
      alwaysOnTop: true,
    },
  });

  // 创建服务能力
  await prisma.capability.createMany({
    data: [
      {
        nodeId: shanghaiNode.id,
        productType: 'S101',
        serviceType: 'WMS',
        isEnabled: true,
        endpoint: 'http://localhost:3003/api/s101/wms',
        version: '1.3.0',
      },
      {
        nodeId: shanghaiNode.id,
        productType: 'S101',
        serviceType: 'WFS',
        isEnabled: true,
        endpoint: 'http://localhost:3003/api/s101/wfs',
        version: '2.0.0',
      },
      {
        nodeId: shanghaiNode.id,
        productType: 'S102',
        serviceType: 'WMS',
        isEnabled: true,
        endpoint: 'http://localhost:3003/api/s102/wms',
        version: '1.3.0',
      },
      {
        nodeId: shanghaiNode.id,
        productType: 'S102',
        serviceType: 'WCS',
        isEnabled: true,
        endpoint: 'http://localhost:3003/api/s102/wcs',
        version: '2.0.1',
      },
    ],
  });

  // 创建测试用户
  const testUser = await prisma.user.create({
    data: {
      email: 'admin@shanghai-port.gov.cn',
      username: 'admin',
      name: '系统管理员',
      role: 'ADMIN',
      nodeId: shanghaiNode.id,
      isActive: true,
    },
  });

  console.log('数据库初始化完成！');
  console.log('创建的节点：');
  console.log(`- 根节点: ${rootNode.name} (${rootNode.code})`);
  console.log(`- 中国节点: ${chinaNode.name} (${chinaNode.code})`);
  console.log(`- 上海港节点: ${shanghaiNode.name} (${shanghaiNode.code})`);
  console.log(`- 默认底图配置: ${defaultBaseMap.type}`);
  console.log(`- 卫星底图配置: ${satelliteBaseMap.type}`);
  console.log(`- 测试用户: ${testUser.username} (${testUser.email})`);
}

main()
  .catch((e) => {
    console.error('初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });