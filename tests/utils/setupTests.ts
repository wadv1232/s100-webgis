/**
 * Jest setup file for S-100 WebGIS testing
 * @author Development Team
 * @since 2024-01-01
 * @version 3.0.0
 */

import { setupTestEnvironment } from './testHelpers';

// Setup test environment before all tests
beforeAll(() => {
  setupTestEnvironment();
});

// Cleanup after all tests
afterAll(() => {
  // Global cleanup if needed
});

// Setup before each test
beforeEach(() => {
  // Reset mocks and test state
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Cleanup after each test
afterEach(() => {
  // Test-specific cleanup
});

// Global test configuration
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global mock for fetch
global.fetch = jest.fn();

// Global test timeout
jest.setTimeout(30000);