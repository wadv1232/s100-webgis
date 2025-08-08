# 测试目录结构说明

## 目录结构

```
tests/
├── unit/                          # 单元测试
│   ├── components/                # 组件单元测试
│   │   ├── S100ServiceMap.test.tsx
│   │   ├── MapInfoDisplay.test.tsx
│   │   └── MapUpdater.test.tsx
│   ├── hooks/                     # React Hooks 测试
│   │   ├── useMapState.test.ts
│   │   └── useCoordinateNormalization.test.ts
│   ├── services/                  # 服务层测试
│   │   ├── nodeService.test.ts
│   │   ├── mapService.test.ts
│   │   └── coordinateService.test.ts
│   └── utils/                     # 工具函数测试
│       ├── geoUtils.test.ts
│       └── coordinateUtils.test.ts
├── integration/                   # 集成测试
│   ├── features/                  # 功能特性测试
│   │   ├── mapRendering.test.tsx
│   │   ├── coordinateSystem.test.tsx
│   │   ├── baseMapSwitching.test.tsx
│   │   └── nodeInteraction.test.tsx
│   └── api/                       # API 集成测试
│       ├── nodeApi.test.ts
│       ├── mapApi.test.ts
│       └── authApi.test.ts
├── e2e/                           # 端到端测试 (基于用户故事)
│   ├── pages/                     # 页面级测试
│   │   ├── mapServicesPage.test.ts
│   │   ├── testCoordinatesPage.test.ts
│   │   └── nodeManagementPage.test.ts
│   └── scenarios/                 # 用户场景测试
│       ├── userStory1.test.ts     # 用户故事1: 海事服务浏览
│       ├── userStory2.test.ts     # 用户故事2: 节点管理
│       ├── userStory3.test.ts     # 用户故事3: 坐标测试
│       └── userStory4.test.ts     # 用户故事4: 底图配置
├── fixtures/                      # 测试数据
│   ├── mockNodes.ts
│   ├── mockServices.ts
│   ├── mockMapData.ts
│   └── testResponses.ts
├── utils/                         # 测试工具
│   ├── testHelpers.ts
│   ├── mockRender.tsx
│   ├── setupTests.ts
│   └── customMatchers.ts
└── README.md                      # 本说明文件
```

## 测试类型说明

### 1. 单元测试 (Unit Tests)
**目的**: 测试独立的功能单元，确保每个函数、组件或模块按预期工作。

**测试范围**:
- 组件渲染和属性传递
- 函数逻辑和边界条件
- 工具函数的正确性
- Hooks 的状态管理

**运行方式**:
```bash
npm run test:unit
```

### 2. 集成测试 (Integration Tests)
**目的**: 测试多个组件或模块之间的交互，确保它们能正确协作。

**测试范围**:
- 组件间的数据流
- API 调用和响应处理
- 状态管理的同步
- 功能特性的端到端流程

**运行方式**:
```bash
npm run test:integration
```

### 3. 端到端测试 (E2E Tests)
**目的**: 模拟真实用户操作，验证整个应用的功能完整性。

**测试范围**:
- 用户故事场景
- 页面导航和交互
- 表单提交和数据持久化
- 错误处理和用户反馈

**运行方式**:
```bash
npm run test:e2e
```

## 用户故事测试

### 用户故事 1: 海事服务浏览
**描述**: 作为海事服务用户，我希望能够浏览和查看不同地区的海事服务节点和状态。

**测试场景**:
- 用户访问地图服务页面
- 地图正确显示所有节点
- 用户可以点击节点查看详情
- 节点状态正确显示（健康/警告/错误）

### 用户故事 2: 节点管理
**描述**: 作为系统管理员，我希望能够管理海事服务节点，包括添加、编辑和删除节点。

**测试场景**:
- 管理员登录系统
- 进入节点管理界面
- 创建新节点并设置位置
- 编辑现有节点信息
- 删除不需要的节点

### 用户故事 3: 坐标测试
**描述**: 作为开发人员，我需要测试坐标系统的正确性，确保坐标标准化功能正常工作。

**测试场景**:
- 访问坐标测试页面
- 查看测试坐标点显示
- 验证坐标标准化功能
- 测试超出范围坐标的处理

### 用户故事 4: 底图配置
**描述**: 作为系统配置员，我希望能够配置不同的底图类型，以满足不同场景的需求。

**测试场景**:
- 访问底图配置界面
- 切换不同底图类型
- 验证底图正确加载
- 保存配置并验证持久化

## 测试数据

### 测试夹具 (Fixtures)
- `mockNodes.ts`: 模拟节点数据
- `mockServices.ts`: 模拟服务数据
- `mockMapData.ts`: 模拟地图数据
- `testResponses.ts`: 模拟API响应

### 数据示例
```typescript
// mockNodes.ts
export const mockNodes = [
  {
    id: 'node-001',
    name: '上海海事服务中心',
    type: 'NATIONAL',
    level: 2,
    description: '国家级海事数据服务中心',
    healthStatus: 'HEALTHY',
    services: ['S-101', 'S-102'],
    location: { lat: 31.2000, lng: 121.5000 }
  }
]
```

## 测试工具

### 测试辅助函数
- `testHelpers.ts`: 通用测试辅助函数
- `mockRender.tsx`: 自定义渲染函数
- `setupTests.ts`: 测试环境设置
- `customMatchers.ts`: 自定义匹配器

### 示例工具函数
```typescript
// testHelpers.ts
export const waitForMapToLoad = async () => {
  return await waitFor(() => {
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })
}

export const createMockNode = (overrides = {}) => ({
  id: 'test-node',
  name: 'Test Node',
  type: 'NATIONAL',
  level: 2,
  description: 'Test Description',
  healthStatus: 'HEALTHY',
  services: ['S-101'],
  location: { lat: 0, lng: 0 },
  ...overrides
})
```

## 测试配置

### Jest 配置
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/utils/setupTests.ts'],
  testMatch: [
    '<rootDir>/tests/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
```

### Testing Library 配置
```typescript
// setupTests.ts
import '@testing-library/jest-dom'
import '@testing-library/user-event'
import { jest } from '@jest/globals'

// 模拟 Leaflet
jest.mock('leaflet', () => ({
  map: jest.fn(),
  tileLayer: jest.fn(),
  marker: jest.fn(),
  popup: jest.fn(),
  // ... 其他 Leaflet 方法
}))
```

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行特定类型测试
```bash
npm run test:unit      # 只运行单元测试
npm run test:integration # 只运行集成测试
npm run test:e2e        # 只运行端到端测试
```

### 运行特定文件
```bash
npm test S100ServiceMap.test.tsx
npm test -- --testNamePattern="用户故事1"
```

### 生成测试覆盖率报告
```bash
npm run test:coverage
```

## 最佳实践

### 1. 测试命名规范
- 文件名: `ComponentName.test.tsx`
- 测试名: `should [do something] when [condition]`
- 描述名: 使用中文描述测试场景

### 2. 测试结构
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // 测试前设置
  })

  describe('when [condition]', () => {
    it('should [do something]', () => {
      // 测试逻辑
    })
  })

  afterEach(() => {
    // 测试后清理
  })
})
```

### 3. 断言最佳实践
- 使用具体的断言而不是通用的
- 测试行为而不是实现细节
- 使用语义化的匹配器

### 4. Mock 和 Stub
- 只模拟外部依赖
- 保持模拟的简单性
- 在测试后清理模拟

## 持续集成

### GitHub Actions 配置
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Generate coverage
        run: npm run test:coverage
```

## 贡献指南

### 添加新测试
1. 在适当的目录创建测试文件
2. 遵循命名规范
3. 编写清晰的测试描述
4. 确保测试独立性和可重复性
5. 添加必要的测试数据

### 维护测试
- 定期更新测试数据
- 修复失败的测试
- 提高测试覆盖率
- 优化测试性能

---

**文档版本**: v1.0.0  
**最后更新**: 2025-06-17  
**维护者**: 开发团队