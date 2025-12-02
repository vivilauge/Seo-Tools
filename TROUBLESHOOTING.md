# 故障排除指南

## POST 请求返回 405 错误

405 错误表示"Method Not Allowed"，说明请求方法不被服务器允许。

### 可能的原因和解决方案

#### 1. Vercel 部署问题

如果部署在 **Vercel** 上：

**问题：** Vercel 需要 serverless 函数格式，不能直接运行 Node.js HTTP 服务器。

**解决方案：**
- ✅ 项目已包含 `api/server.js` serverless 函数
- ✅ `vercel.json` 已配置正确路由
- 重新部署：在 Vercel 控制台点击 "Redeploy"

**检查步骤：**
1. 确认 `api/server.js` 文件存在
2. 确认 `vercel.json` 配置正确
3. 在 Vercel 控制台查看部署日志
4. 测试 API：`curl -X POST https://your-domain.vercel.app/check_status -H "Content-Type: application/json" -d '{"url":"example.com"}'`

#### 2. Railway/Render 部署问题

如果部署在 **Railway** 或 **Render** 上：

**问题：** 这些平台应该直接运行 `server.js`，不应该出现 405。

**可能原因：**
- 路由配置错误
- 请求 URL 不正确
- 服务器未正确启动

**解决方案：**
1. **检查服务器日志**
   - Railway: 在项目页面查看 "Logs"
   - Render: 在服务页面查看 "Logs"

2. **确认请求 URL**
   - 正确：`https://your-domain.com/check_status`
   - 错误：`https://your-domain.com/check_status/` (末尾有斜杠)

3. **测试 API**
   ```bash
   curl -X POST https://your-domain.com/check_status \
     -H "Content-Type: application/json" \
     -d '{"url":"example.com","protocol":"http"}'
   ```

4. **检查环境变量**
   - 确认 `PORT` 环境变量已设置（Railway/Render 会自动设置）

#### 3. 前端请求问题

**检查前端代码：**
- 打开浏览器开发者工具（F12）
- 查看 Network 标签页
- 检查请求：
  - URL 是否正确
  - Method 是否为 POST
  - Headers 是否包含 `Content-Type: application/json`
  - Request Body 格式是否正确

**正确的请求示例：**
```javascript
fetch('/check_status', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
        url: 'example.com',
        protocol: 'http'
    })
})
```

#### 4. CORS 问题

如果从不同域名访问，可能遇到 CORS 问题：

**检查：**
- 浏览器控制台是否有 CORS 错误
- 服务器是否正确设置了 CORS 头

**解决方案：**
- 服务器已配置 CORS：`Access-Control-Allow-Origin: *`
- 如果仍有问题，检查服务器日志

### 快速诊断步骤

1. **确认部署平台**
   - Vercel → 使用 `api/server.js`
   - Railway/Render → 使用 `server.js`

2. **检查部署状态**
   - 查看平台控制台的部署日志
   - 确认部署成功且无错误

3. **测试 API 端点**
   ```bash
   # 替换为你的实际域名
   curl -X POST https://your-domain.com/check_status \
     -H "Content-Type: application/json" \
     -d '{"url":"example.com"}'
   ```

4. **检查浏览器控制台**
   - 打开开发者工具（F12）
   - 查看 Console 和 Network 标签页
   - 查看错误信息

5. **查看服务器响应**
   - Network 标签页中点击失败的请求
   - 查看 Response 内容
   - 405 错误通常返回：`{"status":0,"message":"只支持POST请求"}`

### 常见错误信息

| 错误码 | 含义 | 可能原因 |
|--------|------|----------|
| 405 | Method Not Allowed | 请求方法不是 POST，或路由配置错误 |
| 404 | Not Found | API 路径不正确 |
| 400 | Bad Request | 请求体格式错误或缺少参数 |
| 500 | Internal Server Error | 服务器内部错误，查看日志 |

### 获取帮助

如果问题仍未解决：

1. **提供以下信息：**
   - 部署平台（Vercel/Railway/Render）
   - 错误信息（完整）
   - 请求 URL
   - 服务器日志

2. **检查 GitHub Issues**
   - 查看是否有类似问题

3. **重新部署**
   - 删除并重新创建部署
   - 确保使用最新代码

