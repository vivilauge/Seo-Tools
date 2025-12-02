# Railway 一键部署指南

## 🚀 最简单的部署方式（推荐）

Railway 是最简单的免费部署方案，适合偶尔使用的场景。

## 部署步骤（只需 2 分钟）

### 第一步：访问 Railway

1. 打开 https://railway.app
2. 点击右上角 "Login"
3. 选择 "Login with GitHub"
4. 授权 Railway 访问你的 GitHub 账号

### 第二步：创建项目

1. 登录后，点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 在列表中找到你的仓库 `vivilauge/Websit-Status-Check`
4. 点击仓库名称

### 第三步：等待部署

1. Railway 会自动：
   - 检测到 `railway.json` 配置文件
   - 安装 Node.js 依赖
   - 启动服务器
   
2. 等待 1-2 分钟，部署完成后会显示：
   - ✅ "Deploy successful"
   - 🌐 一个公共 URL（如：`your-app.railway.app`）

### 第四步：访问服务

1. 点击生成的 URL
2. 在浏览器中打开
3. 开始使用！

## 🎉 完成！

现在你的服务已经在线运行了！

**服务地址：** `https://your-app.railway.app`

## 💡 实用功能

### 暂停服务（节省免费额度）

1. 在 Railway 项目页面
2. 点击服务右侧的 "..." 菜单
3. 选择 "Pause"
4. 需要时再点击 "Resume" 恢复

### 查看日志

1. 在项目页面点击服务
2. 查看 "Logs" 标签页
3. 可以看到服务器运行日志

### 自动更新

- 每次你 push 代码到 GitHub
- Railway 会自动重新部署
- 无需手动操作

## 🔧 故障排除

### 如果遇到 405 错误

1. **检查部署日志**
   - 在 Railway 项目页面查看 "Logs"
   - 确认服务器已正确启动

2. **测试 API**
   ```bash
   curl -X POST https://your-app.railway.app/check_status \
     -H "Content-Type: application/json" \
     -d '{"url":"example.com","protocol":"http"}'
   ```

3. **检查 URL**
   - 确保使用正确的 URL（不要有末尾斜杠）
   - 正确：`https://your-app.railway.app/check_status`
   - 错误：`https://your-app.railway.app/check_status/`

### 如果服务无法访问

1. 检查服务状态（应该是 "Active"）
2. 查看日志是否有错误
3. 尝试重新部署：
   - 点击 "Settings" → "Redeploy"

## 📊 免费额度

Railway 免费套餐包括：
- ✅ $5 免费额度/月
- ✅ 足够偶尔使用
- ✅ 可以暂停服务节省额度

## 🆘 需要帮助？

- Railway 文档：https://docs.railway.app
- 查看项目日志排查问题
- 在 Railway 控制台查看详细日志

