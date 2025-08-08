// 主页模拟数据

import { 
  Map, 
  Anchor, 
  AlertTriangle 
} from 'lucide-react'

// 节点模拟数据
export const homeMockNodes = [
  {
    id: 'global-root',
    name: 'IHO全球根节点',
    type: 'GLOBAL_ROOT',
    level: 0,
    description: '国际海道测量组织全球协调节点',
    healthStatus: 'HEALTHY',
    children: ['china-national']
  },
  {
    id: 'china-national',
    name: '中国海事局国家级节点',
    type: 'NATIONAL',
    level: 1,
    description: '中国海事局总部的技术负责人',
    healthStatus: 'HEALTHY',
    parent: 'global-root',
    children: ['east-china-sea', 'south-china-sea', 'north-china-sea']
  },
  {
    id: 'east-china-sea',
    name: '东海分局区域节点',
    type: 'REGIONAL',
    level: 2,
    description: '中国海事局东海分局',
    healthStatus: 'HEALTHY',
    parent: 'china-national',
    children: ['shanghai-port', 'ningbo-port', 'qingdao-port']
  },
  {
    id: 'shanghai-port',
    name: '上海港叶子节点',
    type: 'LEAF',
    level: 3,
    description: '上海港务局数据管理中心',
    healthStatus: 'HEALTHY',
    parent: 'east-china-sea',
    capabilities: ['S101', 'S102', 'S104', 'S111', 'S124']
  }
];

// S-100产品类型模拟数据
export const s100Products = [
  { code: 'S101', name: '电子海图', icon: Map, description: 'S-101电子海图服务' },
  { code: 'S102', name: '高精度水深', icon: Anchor, description: 'S-102高精度水深服务' },
  { code: 'S104', name: '动态水位', icon: Anchor, description: 'S-104动态水位服务' },
  { code: 'S111', name: '实时海流', icon: Anchor, description: 'S-111实时海流服务' },
  { code: 'S124', name: '航行警告', icon: AlertTriangle, description: 'S-124航行警告服务' },
  { code: 'S131', name: '海洋保护区', icon: Map, description: 'S-131海洋保护区服务' }
];

// 系统状态模拟数据
export const systemStatus = {
  onlineNodes: '4/4',
  activeServices: 24,
  datasets: 156,
  systemHealth: '98%'
};