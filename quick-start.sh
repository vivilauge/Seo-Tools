#!/bin/bash

# 快速启动脚本
# 用于本地运行服务

echo "🚀 网站状态码批量检查工具 - 快速启动"
echo "======================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js"
    echo ""
    echo "请先安装 Node.js："
    echo "  macOS: brew install node"
    echo "  或访问: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo ""

# 检查 server.js 是否存在
if [ ! -f "server.js" ]; then
    echo "❌ 未找到 server.js 文件"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

echo "📦 启动服务器..."
echo ""
echo "服务器将在以下地址运行："
echo "  🌐 http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""
echo "======================================"
echo ""

# 启动服务器
node server.js

