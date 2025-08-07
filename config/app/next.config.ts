import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // 启用严格模式以获得更好的开发体验
  reactStrictMode: true,
  experimental: {
    // 优化开发模式下的性能
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
  },
  eslint: {
    ignoreDuringBuilds: true,
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
    
    return config;
  },
};

export default nextConfig;