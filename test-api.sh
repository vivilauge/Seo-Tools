#!/bin/bash

# API 测试脚本
# 用于测试 /check_status API 是否正常工作

echo "🧪 测试 /check_status API"
echo "========================"
echo ""

# 默认 URL
API_URL="${1:-http://localhost:3000/check_status}"
TEST_URL="${2:-example.com}"

echo "API 地址: $API_URL"
echo "测试 URL: $TEST_URL"
echo ""

# 测试 POST 请求
echo "📤 发送 POST 请求..."
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TEST_URL\",\"protocol\":\"http\"}" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

echo ""
echo "响应状态码: $HTTP_CODE"
echo "响应内容:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# 判断结果
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API 测试成功！"
    exit 0
elif [ "$HTTP_CODE" = "405" ]; then
    echo "❌ 405 错误：方法不允许"
    echo ""
    echo "可能的原因："
    echo "1. 服务器未正确启动"
    echo "2. 路由配置错误"
    echo "3. 请求方法不是 POST"
    echo ""
    echo "检查步骤："
    echo "1. 确认服务器正在运行"
    echo "2. 检查 API URL 是否正确"
    echo "3. 查看服务器日志"
    exit 1
else
    echo "⚠️  API 返回状态码: $HTTP_CODE"
    exit 1
fi

