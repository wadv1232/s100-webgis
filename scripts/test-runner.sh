#!/bin/bash

# 测试运行脚本
# 提供便捷的测试运行方式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# 显示帮助信息
show_help() {
    echo "测试运行脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -u, --unit          运行单元测试"
    echo "  -i, --integration   运行集成测试"
    echo "  -e, --e2e           运行端到端测试"
    echo "  -a, --all           运行所有测试"
    echo "  -c, --coverage      运行测试并生成覆盖率报告"
    echo "  -w, --watch         以监视模式运行测试"
    echo "  -d, --debug         以调试模式运行测试"
    echo "  -ci, --ci           在CI环境中运行测试"
    echo "  --clean             清理测试缓存"
    echo ""
    echo "示例:"
    echo "  $0 -u               # 运行单元测试"
    echo "  $0 -i -c            # 运行集成测试并生成覆盖率报告"
    echo "  $0 -a               # 运行所有测试"
    echo "  $0 --clean          # 清理测试缓存"
}

# 清理测试缓存
clean_cache() {
    print_message $YELLOW "清理测试缓存..."
    npm run test: -- --clearCache
    rm -rf .jest-cache
    rm -rf coverage
    rm -rf test-results
    print_message $GREEN "测试缓存已清理"
}

# 运行单元测试
run_unit_tests() {
    print_message $BLUE "运行单元测试..."
    npm run test:unit
    print_message $GREEN "单元测试完成"
}

# 运行集成测试
run_integration_tests() {
    print_message $BLUE "运行集成测试..."
    npm run test:integration
    print_message $GREEN "集成测试完成"
}

# 运行端到端测试
run_e2e_tests() {
    print_message $BLUE "运行端到端测试..."
    npm run test:e2e
    print_message $GREEN "端到端测试完成"
}

# 运行所有测试
run_all_tests() {
    print_message $BLUE "运行所有测试..."
    npm test
    print_message $GREEN "所有测试完成"
}

# 运行测试并生成覆盖率报告
run_coverage_tests() {
    print_message $BLUE "运行测试并生成覆盖率报告..."
    npm run test:coverage
    print_message $GREEN "覆盖率报告已生成"
}

# 以监视模式运行测试
run_watch_tests() {
    print_message $BLUE "以监视模式运行测试..."
    npm run test:watch
}

# 以调试模式运行测试
run_debug_tests() {
    print_message $BLUE "以调试模式运行测试..."
    npm run test:debug
}

# 在CI环境中运行测试
run_ci_tests() {
    print_message $BLUE "在CI环境中运行测试..."
    npm run test:ci
    print_message $GREEN "CI测试完成"
}

# 主函数
main() {
    # 检查是否安装了依赖
    if [ ! -d "node_modules" ]; then
        print_message $YELLOW "未找到 node_modules，正在安装依赖..."
        npm install
    fi

    # 解析命令行参数
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -u|--unit)
            run_unit_tests
            ;;
        -i|--integration)
            run_integration_tests
            ;;
        -e|--e2e)
            run_e2e_tests
            ;;
        -a|--all)
            run_all_tests
            ;;
        -c|--coverage)
            run_coverage_tests
            ;;
        -w|--watch)
            run_watch_tests
            ;;
        -d|--debug)
            run_debug_tests
            ;;
        -ci|--ci)
            run_ci_tests
            ;;
        --clean)
            clean_cache
            ;;
        "")
            print_message $YELLOW "未指定选项，运行所有测试..."
            run_all_tests
            ;;
        *)
            print_message $RED "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 检查是否在正确的目录中
if [ ! -f "package.json" ]; then
    print_message $RED "错误: 未找到 package.json 文件"
    print_message $RED "请在项目根目录中运行此脚本"
    exit 1
fi

# 运行主函数
main "$@"