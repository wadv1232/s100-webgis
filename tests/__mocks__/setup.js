/**
 * Mock file for Jest setup
 * @author Development Team
 * @since 2024-01-01
 * @version 3.0.0
 */

// Mock fetch globally
global.fetch = jest.fn();

// Mock other global APIs if needed
global.Response = jest.fn();
global.Request = jest.fn();
global.Headers = jest.fn();