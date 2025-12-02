# 部署指南

## 🚀 快速部署到云平台

### 方法一：Vercel 部署（推荐）

**注意：** Vercel 主要支持 Serverless 函数，对于长期运行的 Node.js 服务器，建议使用 Railway 或 Render。

如果要在 Vercel 上部署，需要将服务器改造为 Serverless 函数。当前配置可能无法直接运行。

### 方法二：Railway 部署（最简单）⭐

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 授权 Railway 访问你的 GitHub 账号
   - 选择仓库 `vivilauge/Websit-Status-Check`

3. **自动部署**
   - Railway 会自动检测到 `railway.json` 配置文件
   - 自动安装依赖并启动服务
   - 部署完成后会生成一个公共 URL（如：`your-app.railway.app`）

4. **设置环境变量（可选）**
   - 在 Railway 项目设置中可以设置 `PORT` 环境变量
   - Railway 会自动分配端口，通常不需要手动设置

5. **访问应用**
   - 部署完成后，点击生成的 URL 即可访问
   - Railway 会自动提供 HTTPS

**优点：**
- ✅ 完全免费（有免费额度）
- ✅ 自动 HTTPS
- ✅ 自动部署（每次 push 到 GitHub 自动更新）
- ✅ 简单易用，无需配置

### 方法三：Render 部署

1. **访问 Render**
   - 打开 https://render.com
   - 使用 GitHub 账号登录

2. **创建 Web Service**
   - 点击 "New" → "Web Service"
   - 连接你的 GitHub 仓库 `vivilauge/Websit-Status-Check`

3. **配置服务**
   - Render 会自动检测到 `render.yaml` 配置文件
   - 或者手动配置：
     - **Name**: website-status-checker
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`

4. **部署**
   - 点击 "Create Web Service"
   - Render 会自动构建和部署
   - 部署完成后会生成一个公共 URL

**优点：**
- ✅ 免费套餐可用
- ✅ 自动 HTTPS
- ✅ 支持自动部署

### 方法四：使用 GitHub Codespaces（临时运行）

GitHub Codespaces 可以临时运行服务，适合开发和测试：

1. **打开 Codespaces**
   - 在 GitHub 仓库页面点击 "Code" → "Codespaces" → "Create codespace"

2. **启动服务**
   ```bash
   npm install
   node server.js
   ```

3. **访问服务**
   - Codespaces 会自动创建端口转发
   - 点击端口标签页，选择 "Public" 即可获得公共 URL

**注意：** Codespaces 按使用时间收费，不适合长期运行。

## 📋 GitHub Actions（CI/CD）

项目已配置 GitHub Actions，每次 push 代码时会自动：

- ✅ 运行代码测试
- ✅ 检查代码语法
- ✅ 验证服务器启动

**查看 Actions：**
- 访问你的 GitHub 仓库
- 点击 "Actions" 标签页
- 查看工作流运行状态

## 🔧 环境变量配置

所有平台都支持环境变量配置：

- `PORT`: 服务器端口（默认：3000）
- `NODE_ENV`: 运行环境（production/development）

## 📝 部署后检查清单

- [ ] 服务是否正常启动
- [ ] 前端页面是否可以访问
- [ ] API 接口 `/check_status` 是否正常工作
- [ ] HTTPS 是否已启用
- [ ] 自动部署是否配置成功

## 🆘 常见问题

### 部署失败

1. 检查 Node.js 版本（需要 >= 12.0.0）
2. 检查 `package.json` 中的依赖是否正确
3. 查看平台日志了解具体错误

### 服务无法访问

1. 检查端口配置是否正确
2. 确认服务已成功启动
3. 检查防火墙设置

### API 调用失败

1. 确认 CORS 设置正确
2. 检查 API 路径是否正确（`/check_status`）
3. 查看服务器日志

## 💡 推荐方案

**对于 GitHub 项目，推荐使用 Railway：**
- ✅ 配置最简单
- ✅ 免费额度充足
- ✅ 自动 HTTPS 和部署
- ✅ 无需信用卡即可使用

