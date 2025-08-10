import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用严格模式以获得更好的开发体验
  reactStrictMode: true,
  experimental: {
    // 优化开发模式下的性能
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
  },
  // 配置 webpack 以更好地处理开发环境
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 在开发模式下优化配置
      config.watchOptions = {
        poll: 1000, // 使用轮询而不是文件系统事件
        aggregateTimeout: 300,
        ignored: ['node_modules/**'],
      };
    }
    
    // 优化模块解析
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
      },
    };
    
    // 禁用Leaflet的代码分割，确保它被正确打包
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          chunks: 'all',
          cacheGroups: {
            leaflet: {
              test: /[\\/]node_modules[\\/]leaflet[\\/]/,
              name: 'leaflet',
              chunks: 'all',
              priority: 20,
              enforce: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;