# 测试文档

本目录包含S100海事服务系统的测试框架、测试策略、测试用例等相关文档。

## 🧪 测试概述

S100海事服务系统采用多层次测试策略，确保系统的质量和稳定性。

### 📋 测试技术栈
- **测试框架**: Jest
- **测试工具**: React Testing Library
- **API测试**: Supertest
- **端到端测试**: Playwright (可选)
- **代码覆盖率**: Istanbul

### 🔍 测试层次
```
测试层次
├── 单元测试 (Unit Tests)
│   ├── 组件测试
│   ├── 工具函数测试
│   └── Hook测试
├── 集成测试 (Integration Tests)
│   ├── API集成测试
│   ├── 数据库集成测试
│   └── 服务集成测试
└── 端到端测试 (E2E Tests)
    ├── 用户流程测试
    ├── 关键功能测试
    └── 性能测试
```

## 📁 测试文件结构

### 测试目录结构
```
tests/
├── README.md              # 测试说明文档
├── utils/                 # 测试工具和辅助函数
│   └── testHelpers.ts    # 测试辅助函数
├── fixtures/              # 测试固件和模拟数据
│   └── mockData.ts       # 测试用模拟数据
├── unit/                  # 单元测试
│   └── components/       # 组件单元测试
│       ├── S100ServiceMap.test.tsx
│       └── MapInfoDisplay.test.tsx
└── integration/           # 集成测试
    └── features/         # 功能集成测试
        ├── userStory1-MaritimeServiceBrowsing.test.tsx
        └── userStory3-CoordinateTesting.test.tsx
```

## 🎯 测试策略

### 1. 单元测试策略
- **测试目标**: 独立的函数、组件、模块
- **测试范围**: 小粒度、快速执行
- **测试原则**: 快速、独立、可重复
- **覆盖率要求**: 核心功能 > 80%

#### 组件测试
```typescript
// 示例：S100ServiceMap组件测试
describe('S100ServiceMap', () => {
  it('renders correctly with default props', () => {
    render(<S100ServiceMap />)
    expect(screen.getByText('加载地图')).toBeInTheDocument()
  })

  it('handles map initialization', async () => {
    const { container } = render(<S100ServiceMap />)
    const loadButton = screen.getByText('加载地图')
    
    fireEvent.click(loadButton)
    
    await waitFor(() => {
      expect(container.querySelector('.leaflet-container')).toBeInTheDocument()
    })
  })
})
```

#### 工具函数测试
```typescript
// 示例：工具函数测试
describe('GeoUtils', () => {
  it('calculates distance between two points', () => {
    const point1 = { lat: 0, lng: 0 }
    const point2 = { lat: 1, lng: 1 }
    const distance = calculateDistance(point1, point2)
    
    expect(distance).toBeGreaterThan(0)
    expect(distance).toBeLessThan(200) // 大约157公里
  })
})
```

### 2. 集成测试策略
- **测试目标**: 多个模块协作、API接口、数据库交互
- **测试范围**: 中等粒度、模拟真实环境
- **测试原则**: 真实性、完整性、可维护性
- **覆盖率要求**: 关键流程 > 90%

#### API集成测试
```typescript
// 示例：API集成测试
describe('API Integration', () => {
  it('fetches nodes successfully', async () => {
    const response = await request(app)
      .get('/api/nodes')
      .expect(200)
    
    expect(response.body).toHaveProperty('nodes')
    expect(Array.isArray(response.body.nodes)).toBe(true)
  })

  it('handles node creation', async () => {
    const newNode = {
      name: 'Test Node',
      type: 'LEAF',
      parentId: 'global-root'
    }
    
    const response = await request(app)
      .post('/api/nodes')
      .send(newNode)
      .expect(201)
    
    expect(response.body).toHaveProperty('id')
    expect(response.body.name).toBe(newNode.name)
  })
})
```

#### 功能集成测试
```typescript
// 示例：用户故事集成测试
describe('User Story 1: Maritime Service Browsing', () => {
  it('allows users to browse maritime services', async () => {
    // 1. 用户登录
    await loginUser('admin@example.com')
    
    // 2. 导航到服务页面
    await navigateTo('/services')
    
    // 3. 验证服务列表显示
    await waitFor(() => {
      expect(screen.getByText('可用的海事服务')).toBeInTheDocument()
    })
    
    // 4. 选择服务并验证详情
    const serviceCard = screen.getByText('S101电子海图服务')
    fireEvent.click(serviceCard)
    
    await waitFor(() => {
      expect(screen.getByText('服务详情')).toBeInTheDocument()
    })
  })
})
```

### 3. 端到端测试策略
- **测试目标**: 完整用户流程、关键业务场景
- **测试范围**: 大粒度、真实环境
- **测试原则**: 真实用户场景、关键路径覆盖
- **执行频率**: 发布前、重要变更后

## 🛠️ 测试工具和配置

### Jest配置
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### 测试辅助函数
```typescript
// tests/utils/testHelpers.ts
export const createMockNode = (overrides = {}) => ({
  id: 'test-node',
  name: 'Test Node',
  type: 'LEAF',
  parentId: 'global-root',
  ...overrides,
})

export const mockApiResponse = (data: any, status = 200) => {
  return {
    status,
    json: async () => data,
  }
}

export const waitForElement = (selector: string, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
    
    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element ${selector} not found within ${timeout}ms`))
    }, timeout)
  })
}
```

## 📊 测试数据管理

### 测试固件
```typescript
// tests/fixtures/mockData.ts
export const mockNodes = [
  {
    id: 'global-root',
    name: 'IHO全球根节点',
    type: 'GLOBAL_ROOT',
    level: 0,
  },
  {
    id: 'china-national',
    name: '中国海事局国家级节点',
    type: 'NATIONAL',
    level: 1,
    parentId: 'global-root',
  },
]

export const mockServices = [
  {
    id: 's101-service',
    name: 'S101电子海图服务',
    type: 'WMS',
    status: 'ACTIVE',
  },
  {
    id: 's102-service',
    name: 'S102水深数据服务',
    type: 'WCS',
    status: 'ACTIVE',
  },
]

export const mockUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    role: 'ADMIN',
  },
  {
    id: 2,
    email: 'node-admin@example.com',
    role: 'NODE_ADMIN',
  },
]
```

## 🚀 测试执行

### 运行测试
```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行特定测试文件
npm test S100ServiceMap.test.tsx

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监视模式运行测试
npm run test:watch
```

### 测试脚本
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  }
}
```

## 📈 测试报告

### 覆盖率报告
测试覆盖率报告会生成在 `coverage/` 目录下：
- `lcov-report/index.html` - 详细的HTML覆盖率报告
- `coverage/lcov.info` - LCOV格式的覆盖率数据
- `coverage/coverage-final.json` - JSON格式的覆盖率数据

### 测试结果报告
- 控制台输出测试结果摘要
- 生成JUnit XML格式的测试报告
- 支持CI/CD集成和报告展示

## 🔍 测试最佳实践

### 1. 测试编写原则
- **单一职责** - 每个测试只测试一个功能点
- **可读性** - 测试代码要清晰易懂
- **可维护性** - 测试代码要易于维护和更新
- **独立性** - 测试之间相互独立，不依赖执行顺序

### 2. 测试数据管理
- **数据隔离** - 每个测试使用独立的数据
- **数据清理** - 测试后清理测试数据
- **数据真实性** - 使用接近真实的数据
- **数据版本控制** - 测试数据纳入版本控制

### 3. 测试性能优化
- **并行执行** - 支持测试并行执行
- **测试分组** - 按功能模块分组测试
- **选择性执行** - 支持运行特定测试
- **缓存机制** - 合理使用测试缓存

### 4. 持续集成
- **自动化测试** - CI/CD流水线自动执行测试
- **测试门禁** - 设置测试覆盖率门禁
- **失败通知** - 测试失败及时通知
- **报告生成** - 自动生成测试报告

---

*最后更新: 2024-01-01*