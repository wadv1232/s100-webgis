const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // 提供 Next.js 应用的路径，以加载 next.config.js 和 .env 文件
  dir: './',
})

// Jest 的自定义配置
const customJestConfig = {
  // 设置运行测试环境
  testEnvironment: 'jsdom',
  
  // 设置文件匹配模式
  testMatch: [
    '<rootDir>/tests/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  
  // 设置模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // 设置测试设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/utils/setupTests.ts'],
  
  // 设置测试覆盖率收集
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
    '!src/app/loading.tsx',
    '!src/app/error.tsx',
    '!src/app/not-found.tsx',
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // 设置测试超时时间
  testTimeout: 10000,
  
  // 设置模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // 设置转换器
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // 设置忽略的文件
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  
  // 设置模拟文件
  setupFiles: ['<rootDir>/tests/__mocks__/setup.js'],
  
  // 设置全局变量
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'preserve',
      },
    },
  },
  
  // 设置快照序列化
  snapshotSerializers: [
    'jest-serializer-html',
  ],
  
  // 设置测试报告
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
      },
    ],
  ],
  
  // 设置最大工作进程数
  maxWorkers: '50%',
  
  // 设置缓存
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
}

// createJestConfig 是异步的，Jest 会等待
module.exports = createJestConfig(customJestConfig)