// 地图相关模拟数据

// 地图图层配置
export const mapLayers = [
  {
    id: 'basemap-osm',
    name: 'OpenStreetMap',
    type: 'basemap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    visible: true,
    opacity: 1.0,
    minZoom: 0,
    maxZoom: 19
  },
  {
    id: 'basemap-satellite',
    name: '卫星影像',
    type: 'basemap',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    visible: false,
    opacity: 1.0,
    minZoom: 0,
    maxZoom: 19
  },
  {
    id: 's101-shanghai',
    name: '上海港电子海图',
    type: 'overlay',
    productId: 'S101',
    nodeId: 'shanghai-port',
    url: 'https://api.shanghai-port.gov.cn/wms/s101',
    serviceType: 'WMS',
    visible: true,
    opacity: 0.8,
    minZoom: 8,
    maxZoom: 18,
    styles: ['default', 'night', 'simplified']
  },
  {
    id: 's102-east',
    name: '东海高精度水深',
    type: 'overlay',
    productId: 'S102',
    nodeId: 'east-china-sea',
    url: 'https://api.east.msa.gov.cn/wcs/s102',
    serviceType: 'WCS',
    visible: false,
    opacity: 0.7,
    minZoom: 6,
    maxZoom: 16,
    styles: ['depth', 'contours', 'hillshade']
  },
  {
    id: 's104-shanghai',
    name: '长江口动态水位',
    type: 'overlay',
    productId: 'S104',
    nodeId: 'shanghai-port',
    url: 'https://api.shanghai-port.gov.cn/wms/s104',
    serviceType: 'WMS',
    visible: false,
    opacity: 0.9,
    minZoom: 10,
    maxZoom: 18,
    styles: ['water_level', 'tidal_prediction']
  },
  {
    id: 's111-east',
    name: '东海实时海流',
    type: 'overlay',
    productId: 'S111',
    nodeId: 'east-china-sea',
    url: 'https://api.east.msa.gov.cn/wms/s111',
    serviceType: 'WMS',
    visible: false,
    opacity: 0.8,
    minZoom: 6,
    maxZoom: 15,
    styles: ['current_speed', 'current_direction', 'arrows']
  },
  {
    id: 's124-national',
    name: '中国沿海航行警告',
    type: 'overlay',
    productId: 'S124',
    nodeId: 'china-national',
    url: 'https://api.msa.gov.cn/wfs/s124',
    serviceType: 'WFS',
    visible: true,
    opacity: 1.0,
    minZoom: 5,
    maxZoom: 18,
    styles: ['warnings', 'restricted_areas', 'temporary_notices']
  }
];

// 地图视图配置
export const mapViewConfigs = [
  {
    id: 'default',
    name: '默认视图',
    center: [31.2304, 121.4737], // 上海
    zoom: 10,
    basemap: 'basemap-osm',
    visibleLayers: ['s101-shanghai', 's124-national']
  },
  {
    id: 'east-china-sea',
    name: '东海区域',
    center: [29.8683, 121.5440], // 宁波
    zoom: 8,
    basemap: 'basemap-osm',
    visibleLayers: ['s102-east', 's111-east']
  },
  {
    id: 'shanghai-port',
    name: '上海港',
    center: [31.2304, 121.4737],
    zoom: 12,
    basemap: 'basemap-satellite',
    visibleLayers: ['s101-shanghai', 's104-shanghai']
  },
  {
    id: 'national-overview',
    name: '全国概览',
    center: [35.8617, 104.1954], // 中国中心
    zoom: 5,
    basemap: 'basemap-osm',
    visibleLayers: ['s124-national']
  }
];

// 地图工具配置
export const mapTools = [
  {
    id: 'measure',
    name: '测量工具',
    icon: 'Ruler',
    enabled: true,
    options: {
      distance: true,
      area: true,
      coordinates: true
    }
  },
  {
    id: 'draw',
    name: '绘制工具',
    icon: 'Pencil',
    enabled: true,
    options: {
      point: true,
      polyline: true,
      polygon: true,
      rectangle: true,
      circle: true,
      marker: true
    }
  },
  {
    id: 'print',
    name: '打印工具',
    icon: 'Printer',
    enabled: true,
    options: {
      formats: ['PDF', 'PNG', 'JPG'],
      scales: [1000, 5000, 10000, 25000, 50000]
    }
  },
  {
    id: 'search',
    name: '搜索工具',
    icon: 'Search',
    enabled: true,
    options: {
      providers: ['nominatim', 'geonames'],
      maxResults: 10
    }
  },
  {
    id: 'coordinates',
    name: '坐标工具',
    icon: 'Crosshair',
    enabled: true,
    options: {
      formats: ['decimal', 'dms', 'utm'],
      projection: 'WGS84'
    }
  }
];

// 地图统计信息
export const mapStats = {
  totalLayers: 7,
  visibleLayers: 3,
  baseLayers: 2,
  overlayLayers: 5,
  totalViews: 4,
  activeTools: 4,
  popularLayers: [
    { id: 's101-shanghai', views: 15420, name: '上海港电子海图' },
    { id: 's124-national', views: 8765, name: '中国沿海航行警告' },
    { id: 's102-east', views: 6543, name: '东海高精度水深' }
  ],
  usageByDate: [
    { date: '2024-12-01', views: 1200 },
    { date: '2024-12-02', views: 980 },
    { date: '2024-12-03', views: 1350 },
    { date: '2024-12-04', views: 1100 },
    { date: '2024-12-05', views: 1450 },
    { date: '2024-12-06', views: 1280 },
    { date: '2024-12-07', views: 1620 }
  ]
};

// 地图样式配置
export const mapStyles = {
  default: {
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    fonts: {
      base: 'Inter, system-ui, sans-serif',
      heading: 'Inter, system-ui, sans-serif'
    }
  },
  dark: {
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    },
    fonts: {
      base: 'Inter, system-ui, sans-serif',
      heading: 'Inter, system-ui, sans-serif'
    }
  },
  nautical: {
    colors: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    },
    fonts: {
      base: 'Roboto, system-ui, sans-serif',
      heading: 'Roboto, system-ui, sans-serif'
    }
  }
};

// 地图控件配置
export const mapControls = {
  zoom: {
    enabled: true,
    position: 'top-left',
    options: {
      zoomInText: '+',
      zoomOutText: '-',
      zoomInTitle: '放大',
      zoomOutTitle: '缩小'
    }
  },
  scale: {
    enabled: true,
    position: 'bottom-left',
    options: {
      maxWidth: 100,
      metric: true,
      imperial: false
    }
  },
  layers: {
    enabled: true,
    position: 'top-right',
    options: {
      collapsed: true,
      autoZIndex: true
    }
  },
  attribution: {
    enabled: true,
    position: 'bottom-right',
    options: {
      prefix: 'S-100海事服务平台'
    }
  },
  fullscreen: {
    enabled: true,
    position: 'top-right',
    options: {
      title: {
        'false': '全屏',
        'true': '退出全屏'
      }
    }
  }
};