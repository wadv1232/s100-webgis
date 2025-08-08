const fs = require('fs');
const path = require('path');

// Mock data configuration
const mockDataConfig = {
  nodes: [
    {
      id: 'shanghai-port',
      name: '上海港叶子节点',
      type: 'LEAF',
      level: 3,
      description: '上海港务局数据管理中心',
      apiUrl: 'http://localhost:3000/api',
      adminUrl: 'http://localhost:3000/admin',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [122.0, 31.0], [122.0, 32.0], [121.0, 32.0], [121.0, 31.0]]]
      }),
      isActive: true,
      healthStatus: 'HEALTHY'
    }
  ],
  datasets: [
    {
      name: '上海港航道水深数据',
      description: '上海港主航道及周边区域的高精度水深测量数据',
      productType: 'S102',
      version: '1.0',
      status: 'PUBLISHED',
      fileName: 'bathymetry-grid.tiff',
      filePath: '/mock-data/s102/wcs/bathymetry-grid.tiff',
      fileSize: 2400000000, // 2.4GB
      mimeType: 'image/tiff',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[121.0, 31.0], [122.0, 31.0], [122.0, 32.0], [121.0, 32.0], [121.0, 31.0]]]
      }),
      metadata: JSON.stringify({
        resolution: '1m',
        surveyDate: '2024-01-10',
        source: 'multibeam_echosounder'
      }),
      nodeId: 'shanghai-port'
    },
    {
      name: '东海电子海图更新',
      description: '东海海域电子海图要素更新，包括航道、锚地等',
      productType: 'S101',
      version: '1.0',
      status: 'PUBLISHED',
      fileName: 'navigation-layer.json',
      filePath: '/mock-data/s101/wms/navigation-layer.json',
      fileSize: 156000, // 156KB
      mimeType: 'application/json',
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[120.0, 30.0], [125.0, 30.0], [125.0, 35.0], [120.0, 35.0], [120.0, 30.0]]]
      }),
      metadata: JSON.stringify({
        featureCount: 1250,
        lastUpdated: '2024-01-15'
      }),
      nodeId: 'shanghai-port'
    }
  ],
  capabilities: [
    {
      nodeId: 'shanghai-port',
      productType: 'S101',
      serviceType: 'WMS',
      isEnabled: true,
      endpoint: '/api/s101/wms',
      version: '1.3.0'
    },
    {
      nodeId: 'shanghai-port',
      productType: 'S101',
      serviceType: 'WFS',
      isEnabled: true,
      endpoint: '/api/s101/wfs',
      version: '2.0.0'
    },
    {
      nodeId: 'shanghai-port',
      productType: 'S102',
      serviceType: 'WMS',
      isEnabled: true,
      endpoint: '/api/s102/wms',
      version: '1.3.0'
    },
    {
      nodeId: 'shanghai-port',
      productType: 'S102',
      serviceType: 'WCS',
      isEnabled: true,
      endpoint: '/api/s102/wcs',
      version: '2.0.1'
    }
  ],
  services: [
    {
      datasetId: 'shanghai-port-dataset-1',
      serviceType: 'WMS',
      endpoint: '/api/s102/wms',
      configuration: JSON.stringify({
        layers: ['bathymetry'],
        styles: ['default'],
        format: 'image/png'
      })
    },
    {
      datasetId: 'shanghai-port-dataset-2',
      serviceType: 'WFS',
      endpoint: '/api/s101/wfs',
      configuration: JSON.stringify({
        typeName: 'depth_features',
        outputFormat: 'application/json'
      })
    }
  ]
};

// Function to read mock data files
function readMockDataFiles() {
  const mockDataDir = path.join(__dirname, '../../mock-data');
  const files = [];
  
  function readDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const itemRelativePath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        readDirectory(fullPath, itemRelativePath);
      } else if (stat.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const parsedData = JSON.parse(content);
          
          files.push({
            path: itemRelativePath,
            fullPath: fullPath,
            size: stat.size,
            data: parsedData,
            service: extractServiceFromPath(itemRelativePath),
            type: extractTypeFromPath(itemRelativePath)
          });
        } catch (error) {
          console.log(`Skipping non-JSON file: ${itemRelativePath}`);
        }
      }
    });
  }
  
  readDirectory(mockDataDir);
  return files;
}

// Extract service type from file path
function extractServiceFromPath(filePath) {
  const parts = filePath.split('/');
  if (parts.length >= 2) {
    return parts[0]; // s101, s102, etc.
  }
  return 'unknown';
}

// Extract data type from file path
function extractTypeFromPath(filePath) {
  const parts = filePath.split('/');
  if (parts.length >= 3) {
    return parts[1]; // wms, wfs, wcs, etc.
  }
  return 'unknown';
}

// Generate SQL statements for database insertion
function generateSQLStatements(mockFiles) {
  const statements = [];
  
  // Insert nodes
  mockDataConfig.nodes.forEach(node => {
    statements.push(`
INSERT INTO nodes (id, name, type, level, description, apiUrl, adminUrl, coverage, isActive, healthStatus, createdAt, updatedAt)
VALUES (
  '${node.id}',
  '${node.name}',
  '${node.type}',
  ${node.level},
  '${node.description}',
  '${node.apiUrl}',
  '${node.adminUrl}',
  '${node.coverage}',
  ${node.isActive},
  '${node.healthStatus}',
  datetime('now'),
  datetime('now')
);`);
  });
  
  // Insert datasets
  mockDataConfig.datasets.forEach((dataset, index) => {
    const datasetId = `${dataset.nodeId}-dataset-${index + 1}`;
    statements.push(`
INSERT INTO datasets (id, name, description, productType, version, status, fileName, filePath, fileSize, mimeType, coverage, metadata, nodeId, createdAt, updatedAt)
VALUES (
  '${datasetId}',
  '${dataset.name}',
  '${dataset.description}',
  '${dataset.productType}',
  '${dataset.version}',
  '${dataset.status}',
  '${dataset.fileName}',
  '${dataset.filePath}',
  ${dataset.fileSize},
  '${dataset.mimeType}',
  '${dataset.coverage}',
  '${dataset.metadata}',
  '${dataset.nodeId}',
  datetime('now'),
  datetime('now')
);`);
  });
  
  // Insert capabilities
  mockDataConfig.capabilities.forEach(capability => {
    statements.push(`
INSERT INTO capabilities (nodeId, productType, serviceType, isEnabled, endpoint, version, createdAt, updatedAt)
VALUES (
  '${capability.nodeId}',
  '${capability.productType}',
  '${capability.serviceType}',
  ${capability.isEnabled},
  '${capability.endpoint}',
  '${capability.version}',
  datetime('now'),
  datetime('now')
);`);
  });
  
  // Insert services
  mockDataConfig.services.forEach((service, index) => {
    statements.push(`
INSERT INTO services (datasetId, serviceType, endpoint, configuration, isActive, createdAt, updatedAt)
VALUES (
  '${service.datasetId}',
  '${service.serviceType}',
  '${service.endpoint}',
  '${service.configuration}',
  true,
  datetime('now'),
  datetime('now')
);`);
  });
  
  return statements;
}

// Main execution
function main() {
  console.log('Reading mock data files...');
  const mockFiles = readMockDataFiles();
  
  console.log(`Found ${mockFiles.length} mock data files:`);
  mockFiles.forEach(file => {
    console.log(`  - ${file.path} (${file.service}/${file.type})`);
  });
  
  console.log('\nGenerating SQL statements...');
  const sqlStatements = generateSQLStatements(mockFiles);
  
  console.log('SQL Statements:');
  sqlStatements.forEach(statement => {
    console.log(statement);
  });
  
  // Save SQL to file
  const sqlContent = sqlStatements.join('\n');
  fs.writeFileSync(path.join(__dirname, '../../mock-data-setup.sql'), sqlContent);
  
  console.log('\nSQL statements saved to mock-data-setup.sql');
  console.log('You can run this SQL file to populate your database with mock data.');
}

if (require.main === module) {
  main();
}

module.exports = {
  readMockDataFiles,
  generateSQLStatements
};