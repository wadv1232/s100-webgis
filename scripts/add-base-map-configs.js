const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addBaseMapConfigs() {
  console.log('开始添加底图配置...');

  try {
    // 获取所有节点
    const nodes = await prisma.node.findMany();
    console.log(`找到 ${nodes.length} 个节点`);

    for (const node of nodes) {
      console.log(`为节点 ${node.code} (${node.name}) 添加底图配置...`);
      
      // 检查是否已有配置
      const existingConfig = await prisma.nodeBaseMapConfig.findFirst({
        where: { nodeId: node.id }
      });

      if (existingConfig) {
        console.log(`节点 ${node.code} 已有配置，跳过`);
        continue;
      }

      // 创建默认OSM底图配置
      const defaultConfig = await prisma.nodeBaseMapConfig.create({
        data: {
          nodeId: node.id,
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
        }
      });

      // 为叶子节点添加卫星底图配置
      if (node.type === 'LEAF') {
        await prisma.nodeBaseMapConfig.create({
          data: {
            nodeId: node.id,
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
          }
        });
      }

      console.log(`✅ 节点 ${node.code} 底图配置创建完成`);
    }

    console.log('🎉 所有节点底图配置添加完成！');
  } catch (error) {
    console.error('添加底图配置失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addBaseMapConfigs();