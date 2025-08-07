
INSERT INTO nodes (id, name, type, level, description, apiUrl, adminUrl, coverage, isActive, healthStatus, createdAt, updatedAt)
VALUES (
  'shanghai-port',
  '上海港叶子节点',
  'LEAF',
  3,
  '上海港务局数据管理中心',
  'http://localhost:3000/api',
  'http://localhost:3000/admin',
  '{"type":"Polygon","coordinates":[[[121,31],[122,31],[122,32],[121,32],[121,31]]]}',
  true,
  'HEALTHY',
  datetime('now'),
  datetime('now')
);

INSERT INTO datasets (id, name, description, productType, version, status, fileName, filePath, fileSize, mimeType, coverage, metadata, nodeId, createdAt, updatedAt)
VALUES (
  'shanghai-port-dataset-1',
  '上海港航道水深数据',
  '上海港主航道及周边区域的高精度水深测量数据',
  'S102',
  '1.0',
  'PUBLISHED',
  'bathymetry-grid.tiff',
  '/mock-data/s102/wcs/bathymetry-grid.tiff',
  2400000000,
  'image/tiff',
  '{"type":"Polygon","coordinates":[[[121,31],[122,31],[122,32],[121,32],[121,31]]]}',
  '{"resolution":"1m","surveyDate":"2024-01-10","source":"multibeam_echosounder"}',
  'shanghai-port',
  datetime('now'),
  datetime('now')
);

INSERT INTO datasets (id, name, description, productType, version, status, fileName, filePath, fileSize, mimeType, coverage, metadata, nodeId, createdAt, updatedAt)
VALUES (
  'shanghai-port-dataset-2',
  '东海电子海图更新',
  '东海海域电子海图要素更新，包括航道、锚地等',
  'S101',
  '1.0',
  'PUBLISHED',
  'navigation-layer.json',
  '/mock-data/s101/wms/navigation-layer.json',
  156000,
  'application/json',
  '{"type":"Polygon","coordinates":[[[120,30],[125,30],[125,35],[120,35],[120,30]]]}',
  '{"featureCount":1250,"lastUpdated":"2024-01-15"}',
  'shanghai-port',
  datetime('now'),
  datetime('now')
);

INSERT INTO capabilities (nodeId, productType, serviceType, isEnabled, endpoint, version, createdAt, updatedAt)
VALUES (
  'shanghai-port',
  'S101',
  'WMS',
  true,
  '/api/s101/wms',
  '1.3.0',
  datetime('now'),
  datetime('now')
);

INSERT INTO capabilities (nodeId, productType, serviceType, isEnabled, endpoint, version, createdAt, updatedAt)
VALUES (
  'shanghai-port',
  'S101',
  'WFS',
  true,
  '/api/s101/wfs',
  '2.0.0',
  datetime('now'),
  datetime('now')
);

INSERT INTO capabilities (nodeId, productType, serviceType, isEnabled, endpoint, version, createdAt, updatedAt)
VALUES (
  'shanghai-port',
  'S102',
  'WMS',
  true,
  '/api/s102/wms',
  '1.3.0',
  datetime('now'),
  datetime('now')
);

INSERT INTO capabilities (nodeId, productType, serviceType, isEnabled, endpoint, version, createdAt, updatedAt)
VALUES (
  'shanghai-port',
  'S102',
  'WCS',
  true,
  '/api/s102/wcs',
  '2.0.1',
  datetime('now'),
  datetime('now')
);

INSERT INTO services (datasetId, serviceType, endpoint, configuration, isActive, createdAt, updatedAt)
VALUES (
  'shanghai-port-dataset-1',
  'WMS',
  '/api/s102/wms',
  '{"layers":["bathymetry"],"styles":["default"],"format":"image/png"}',
  true,
  datetime('now'),
  datetime('now')
);

INSERT INTO services (datasetId, serviceType, endpoint, configuration, isActive, createdAt, updatedAt)
VALUES (
  'shanghai-port-dataset-2',
  'WFS',
  '/api/s101/wfs',
  '{"typeName":"depth_features","outputFormat":"application/json"}',
  true,
  datetime('now'),
  datetime('now')
);