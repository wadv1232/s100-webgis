// 合规相关模拟数据

// 合规状态枚举
export const ComplianceStatus = {
  COMPLIANT: 'COMPLIANT',
  NON_COMPLIANT: 'NON_COMPLIANT',
  PARTIALLY_COMPLIANT: 'PARTIALLY_COMPLIANT',
  NOT_ASSESSED: 'NOT_ASSESSED'
} as const;

// 合规检查项
export const complianceChecks = [
  {
    id: '1',
    name: 'S-101标准合规性',
    description: '检查S-101电子海图数据是否符合IHO S-101标准规范',
    category: '数据标准',
    status: ComplianceStatus.COMPLIANT,
    score: 95,
    lastChecked: new Date().toISOString(),
    nextCheck: new Date(Date.now() + 2592000000).toISOString(), // 30天后
    details: {
      passed: 18,
      failed: 1,
      warnings: 1,
      requirements: [
        { id: 'req-1', name: '数据格式', status: 'passed', description: '数据格式符合S-101标准' },
        { id: 'req-2', name: '坐标系统', status: 'passed', description: '使用WGS84坐标系统' },
        { id: 'req-3', name: '属性完整性', status: 'warning', description: '部分属性信息缺失' },
        { id: 'req-4', name: '拓扑关系', status: 'failed', description: '发现拓扑关系错误' }
      ]
    }
  },
  {
    id: '2',
    name: '服务可用性',
    description: '检查S-100服务的可用性和响应时间',
    category: '服务质量',
    status: ComplianceStatus.PARTIALLY_COMPLIANT,
    score: 82,
    lastChecked: new Date(Date.now() - 86400000).toISOString(),
    nextCheck: new Date(Date.now() + 604800000).toISOString(), // 7天后
    details: {
      passed: 6,
      failed: 1,
      warnings: 2,
      requirements: [
        { id: 'req-5', name: '服务响应时间', status: 'passed', description: '平均响应时间在可接受范围内' },
        { id: 'req-6', name: '服务可用性', status: 'warning', description: '部分时段可用性低于99%' },
        { id: 'req-7', name: '错误处理', status: 'passed', description: '错误处理机制完善' },
        { id: 'req-8', name: '并发处理', status: 'failed', description: '高并发时性能下降明显' },
        { id: 'req-9', name: '数据一致性', status: 'warning', description: '偶发数据不一致问题' }
      ]
    }
  },
  {
    id: '3',
    name: '数据安全',
    description: '检查数据传输和存储的安全性',
    category: '安全合规',
    status: ComplianceStatus.COMPLIANT,
    score: 98,
    lastChecked: new Date(Date.now() - 172800000).toISOString(),
    nextCheck: new Date(Date.now() + 5184000000).toISOString(), // 60天后
    details: {
      passed: 12,
      failed: 0,
      warnings: 1,
      requirements: [
        { id: 'req-10', name: '传输加密', status: 'passed', description: '数据传输使用HTTPS加密' },
        { id: 'req-11', name: '访问控制', status: 'passed', description: '访问控制机制完善' },
        { id: 'req-12', name: '数据备份', status: 'passed', description: '数据备份机制正常' },
        { id: 'req-13', name: '审计日志', status: 'warning', description: '审计日志记录不完整' }
      ]
    }
  },
  {
    id: '4',
    name: '元数据完整性',
    description: '检查数据集元数据的完整性和准确性',
    category: '数据质量',
    status: ComplianceStatus.NON_COMPLIANT,
    score: 65,
    lastChecked: new Date(Date.now() - 259200000).toISOString(),
    nextCheck: new Date(Date.now() + 1209600000).toISOString(), // 14天后
    details: {
      passed: 8,
      failed: 3,
      warnings: 2,
      requirements: [
        { id: 'req-14', name: '必填字段', status: 'failed', description: '部分必填元数据字段缺失' },
        { id: 'req-15', name: '数据质量', status: 'warning', description: '数据质量信息不完整' },
        { id: 'req-16', name: '时间精度', status: 'passed', description: '时间戳记录准确' },
        { id: 'req-17', name: '空间参考', status: 'failed', description: '空间参考信息缺失' },
        { id: 'req-18', name: '数据来源', status: 'passed', description: '数据来源信息完整' },
        { id: 'req-19', name: '更新频率', status: 'warning', description: '更新频率记录不准确' },
        { id: 'req-20', name: '联系方式', status: 'failed', description: '维护联系方式缺失' }
      ]
    }
  },
  {
    id: '5',
    name: '性能指标',
    description: '检查系统性能是否满足SLA要求',
    category: '服务质量',
    status: ComplianceStatus.NOT_ASSESSED,
    score: 0,
    lastChecked: null,
    nextCheck: new Date(Date.now() + 86400000).toISOString(), // 1天后
    details: {
      passed: 0,
      failed: 0,
      warnings: 0,
      requirements: [
        { id: 'req-21', name: '响应时间', status: 'not_assessed', description: '待评估' },
        { id: 'req-22', name: '吞吐量', status: 'not_assessed', description: '待评估' },
        { id: 'req-23', name: '并发用户', status: 'not_assessed', description: '待评估' }
      ]
    }
  }
];

// 节点合规状态
export const nodeCompliance = [
  {
    nodeId: 'shanghai-port',
    nodeName: '上海港叶子节点',
    overallStatus: ComplianceStatus.COMPLIANT,
    overallScore: 92,
    lastAssessed: new Date().toISOString(),
    checks: [
      { checkId: '1', status: ComplianceStatus.COMPLIANT, score: 95 },
      { checkId: '2', status: ComplianceStatus.PARTIALLY_COMPLIANT, score: 82 },
      { checkId: '3', status: ComplianceStatus.COMPLIANT, score: 98 },
      { checkId: '4', status: ComplianceStatus.PARTIALLY_COMPLIANT, score: 78 }
    ]
  },
  {
    nodeId: 'ningbo-port',
    nodeName: '宁波港叶子节点',
    overallStatus: ComplianceStatus.PARTIALLY_COMPLIANT,
    overallScore: 78,
    lastAssessed: new Date(Date.now() - 86400000).toISOString(),
    checks: [
      { checkId: '1', status: ComplianceStatus.COMPLIANT, score: 88 },
      { checkId: '2', status: ComplianceStatus.PARTIALLY_COMPLIANT, score: 75 },
      { checkId: '3', status: ComplianceStatus.COMPLIANT, score: 92 },
      { checkId: '4', status: ComplianceStatus.NON_COMPLIANT, score: 58 }
    ]
  },
  {
    nodeId: 'east-china-sea',
    nodeName: '东海分局区域节点',
    overallStatus: ComplianceStatus.COMPLIANT,
    overallScore: 87,
    lastAssessed: new Date(Date.now() - 172800000).toISOString(),
    checks: [
      { checkId: '1', status: ComplianceStatus.COMPLIANT, score: 91 },
      { checkId: '2', status: ComplianceStatus.PARTIALLY_COMPLIANT, score: 79 },
      { checkId: '3', status: ComplianceStatus.COMPLIANT, score: 95 },
      { checkId: '4', status: ComplianceStatus.PARTIALLY_COMPLIANT, score: 83 }
    ]
  },
  {
    nodeId: 'china-national',
    nodeName: '中国海事局国家级节点',
    overallStatus: ComplianceStatus.COMPLIANT,
    overallScore: 94,
    lastAssessed: new Date(Date.now() - 259200000).toISOString(),
    checks: [
      { checkId: '1', status: ComplianceStatus.COMPLIANT, score: 97 },
      { checkId: '2', status: ComplianceStatus.COMPLIANT, score: 89 },
      { checkId: '3', status: ComplianceStatus.COMPLIANT, score: 98 },
      { checkId: '4', status: ComplianceStatus.COMPLIANT, score: 92 }
    ]
  }
];

// 合规统计概览
export const complianceStats = {
  totalChecks: 5,
  compliantChecks: 2,
  partiallyCompliantChecks: 2,
  nonCompliantChecks: 1,
  notAssessedChecks: 1,
  averageScore: 80,
  totalNodes: 4,
  compliantNodes: 2,
  partiallyCompliantNodes: 2,
  nonCompliantNodes: 0,
  lastUpdated: new Date().toISOString()
};

// 合规历史趋势
export const complianceHistory = [
  {
    date: '2024-11-01',
    overallScore: 75,
    compliantChecks: 1,
    partiallyCompliantChecks: 2,
    nonCompliantChecks: 2
  },
  {
    date: '2024-11-08',
    overallScore: 78,
    compliantChecks: 1,
    partiallyCompliantChecks: 3,
    nonCompliantChecks: 1
  },
  {
    date: '2024-11-15',
    overallScore: 82,
    compliantChecks: 2,
    partiallyCompliantChecks: 2,
    nonCompliantChecks: 1
  },
  {
    date: '2024-11-22',
    overallScore: 79,
    compliantChecks: 2,
    partiallyCompliantChecks: 1,
    nonCompliantChecks: 2
  },
  {
    date: '2024-11-29',
    overallScore: 85,
    compliantChecks: 3,
    partiallyCompliantChecks: 1,
    nonCompliantChecks: 1
  },
  {
    date: '2024-12-06',
    overallScore: 80,
    compliantChecks: 2,
    partiallyCompliantChecks: 2,
    nonCompliantChecks: 1
  }
];

// 获取合规状态显示信息
export const getComplianceStatusInfo = (status: string) => {
  switch (status) {
    case ComplianceStatus.COMPLIANT:
      return { label: '合规', color: 'green', icon: 'CheckCircle' };
    case ComplianceStatus.NON_COMPLIANT:
      return { label: '不合规', color: 'red', icon: 'XCircle' };
    case ComplianceStatus.PARTIALLY_COMPLIANT:
      return { label: '部分合规', color: 'yellow', icon: 'AlertTriangle' };
    case ComplianceStatus.NOT_ASSESSED:
      return { label: '未评估', color: 'gray', icon: 'Clock' };
    default:
      return { label: '未知', color: 'gray', icon: 'HelpCircle' };
  }
};