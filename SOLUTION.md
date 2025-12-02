# 解决方案：如何长期运行后端服务

## ⚠️ 重要说明

**GitHub Actions 不能用于长期运行服务：**
- ❌ GitHub Actions 是 CI/CD 工具，工作流运行完成后就会停止
- ❌ 免费账户最长运行时间只有 6 小时
- ❌ 不能提供公开访问的 URL
- ✅ 只能用于代码测试和验证

## 🎯 推荐方案（按简单程度排序）

### 方案一：Railway（最简单，推荐）⭐

**优点：**
- ✅ 完全免费（有免费额度）
- ✅ 一键部署，无需配置
- ✅ 自动 HTTPS
- ✅ 每次 push 到 GitHub 自动更新
- ✅ 可以暂停服务节省额度

**部署步骤：**

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用 GitHub 账号登录

2. **创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库 `vivilauge/Websit-Status-Check`

3. **自动部署**
   - Railway 会自动检测到 `railway.json`
   - 自动安装依赖并启动服务
   - 几秒钟后就会获得一个公共 URL

4. **访问服务**
   - 部署完成后，点击生成的 URL 即可访问
   - URL 格式：`your-app.railway.app`

5. **暂停服务（节省额度）**
   - 在 Railway 控制台可以暂停服务
   - 需要时再启动即可

**完全免费，适合偶尔使用！**

---

### 方案二：Render（同样简单）

**优点：**
- ✅ 免费套餐可用
- ✅ 自动 HTTPS
- ✅ 简单易用

**部署步骤：**

1. 访问 https://render.com
2. 使用 GitHub 账号登录
3. 点击 "New" → "Web Service"
4. 连接你的 GitHub 仓库
5. Render 会自动检测配置
6. 点击 "Create Web Service"

---

### 方案三：本地运行（完全免费，但需要保持电脑开机）

如果你只是偶尔使用，可以在自己的电脑上运行：

**步骤：**

1. **安装 Node.js**
   ```bash
   # macOS (使用 Homebrew)
   brew install node
   
   # 或从官网下载
   # https://nodejs.org
   ```

2. **运行服务**
   ```bash
   cd /path/to/项目目录
   node server.js
   ```

3. **访问**
   - 在浏览器打开：`http://localhost:3000`
   - 或者使用你的局域网 IP：`http://你的IP:3000`

4. **保持运行**
   - 保持终端窗口打开
   - 或者使用 PM2（进程管理器）：
     ```bash
     npm install -g pm2
     pm2 start server.js
     pm2 save
     ```

---

### 方案四：GitHub Codespaces（临时运行）

**注意：** 这是唯一与 GitHub 相关的运行方案，但有时限。

**优点：**
- ✅ 在浏览器中运行
- ✅ 不需要本地安装

**限制：**
- ⚠️ 免费账户每月有使用时间限制
- ⚠️ Codespace 停止后需要重新启动

**步骤：**

1. 在 GitHub 仓库页面点击 "Code" → "Codespaces" → "Create codespace"
2. 等待 Codespace 启动
3. 在终端运行：
   ```bash
   node server.js
   ```
4. 点击端口标签页，选择 "Public" 获得公共 URL

---

## 🔧 解决 405 错误

如果你已经部署但遇到 405 错误：

### 检查清单：

1. **确认部署平台**
   - Railway/Render：应该直接运行 `server.js`，不应该有 405
   - Vercel：需要使用 `api/server.js` serverless 函数

2. **测试 API**
   ```bash
   curl -X POST https://your-domain.com/check_status \
     -H "Content-Type: application/json" \
     -d '{"url":"example.com","protocol":"http"}'
   ```

3. **检查浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Network 标签页
   - 检查请求的 Method 是否为 POST

4. **查看服务器日志**
   - 在部署平台的控制台查看日志
   - 确认服务器已正确启动

---

## 💡 我的推荐

**对于"偶尔使用"的场景，我强烈推荐 Railway：**

1. ✅ 完全免费
2. ✅ 部署只需 1 分钟
3. ✅ 可以暂停服务节省额度
4. ✅ 每次代码更新自动部署
5. ✅ 自动 HTTPS，无需配置

**部署后，你就可以通过公共 URL 随时访问服务了！**

---

## 🆘 需要帮助？

如果遇到问题：
1. 查看部署平台的日志
2. 检查浏览器控制台的错误信息
3. 参考 `TROUBLESHOOTING.md` 文件

