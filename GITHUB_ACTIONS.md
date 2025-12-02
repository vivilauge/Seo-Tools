# GitHub Actions 使用指南

本项目使用 GitHub Actions 进行自动化测试和验证。

## 📋 工作流说明

### 1. 测试和验证工作流 (`test.yml`)

**触发时机：**
- 每次 push 到 `main` 或 `master` 分支
- 创建 Pull Request 时
- 手动触发（workflow_dispatch）

**测试内容：**
- ✅ 代码语法检查（server.js 和 api/server.js）
- ✅ 服务器启动测试
- ✅ POST API `/check_status` 功能测试
- ✅ CORS 预检请求测试
- ✅ GET 请求错误处理测试（应返回 405）
- ✅ 静态文件服务测试
- ✅ 多 Node.js 版本兼容性测试（16.x, 18.x, 20.x）

### 2. 完整测试工作流 (`deploy.yml`)

**触发时机：**
- 每次 push 到 `main` 分支
- 手动触发（workflow_dispatch）

**测试内容：**
- ✅ 完整的代码质量检查
- ✅ 服务器功能全面测试
- ✅ API 响应验证
- ✅ CORS 支持验证
- ✅ 错误处理验证

## 🚀 如何使用

### 自动运行

每次你 push 代码到 GitHub 时，GitHub Actions 会自动运行测试：

1. 推送代码到 GitHub
2. 访问你的仓库页面
3. 点击 "Actions" 标签页
4. 查看工作流运行状态

### 手动触发

1. 访问你的 GitHub 仓库
2. 点击 "Actions" 标签页
3. 选择要运行的工作流
4. 点击 "Run workflow" 按钮
5. 选择分支并点击 "Run workflow"

## 📊 查看测试结果

### 在 GitHub 上查看

1. 进入仓库的 "Actions" 页面
2. 点击最新的工作流运行
3. 查看每个步骤的详细日志

### 测试通过示例

```
✅ 语法检查通过
✅ 服务器启动成功
✅ API 测试通过
✅ CORS 预检请求测试通过
✅ GET 请求正确返回 405
✅ index.html 可以访问
✅ 所有测试通过
```

### 测试失败处理

如果测试失败：

1. 查看失败的步骤日志
2. 检查错误信息
3. 修复代码问题
4. 重新 push 代码触发测试

## 🔍 测试详情

### API 测试

工作流会测试以下 API 端点：

```bash
# POST 请求测试
POST http://localhost:3000/check_status
Content-Type: application/json
Body: {"url":"example.com","protocol":"http"}

# OPTIONS 预检请求测试
OPTIONS http://localhost:3000/check_status

# GET 请求错误处理测试（应返回 405）
GET http://localhost:3000/check_status
```

### 验证内容

- ✅ 服务器能正常启动
- ✅ API 返回正确的 JSON 响应
- ✅ 状态码检查功能正常
- ✅ CORS 头正确设置
- ✅ 错误请求正确处理

## ⚠️ 重要说明

### GitHub Actions 的限制

**GitHub Actions 主要用于 CI/CD，不能用于长期运行服务：**

- ❌ 不能长期运行服务器
- ❌ 不能提供公开访问的 URL
- ❌ 工作流运行有时间限制（免费账户最长 6 小时）
- ✅ 适合代码测试和验证
- ✅ 适合自动化检查
- ✅ 适合持续集成

### 如果需要运行服务

如果你需要实际运行服务供他人访问，可以考虑：

1. **本地运行**
   ```bash
   node server.js
   ```

2. **自己的服务器**
   - VPS（如 DigitalOcean, Linode）
   - 云服务器（如 AWS EC2, 阿里云）

3. **云平台部署**（虽然你只想用 GitHub Actions，但这是运行服务的唯一方式）
   - Railway
   - Render
   - Vercel

## 📝 工作流配置

工作流文件位于：
- `.github/workflows/test.yml` - 测试工作流
- `.github/workflows/deploy.yml` - 完整测试工作流

### 修改测试配置

如果需要修改测试：

1. 编辑 `.github/workflows/` 目录下的 YAML 文件
2. 修改测试步骤
3. Push 更改到 GitHub
4. GitHub Actions 会自动使用新配置

## 🎯 最佳实践

1. **每次提交前本地测试**
   ```bash
   node server.js
   # 在另一个终端测试
   curl -X POST http://localhost:3000/check_status \
     -H "Content-Type: application/json" \
     -d '{"url":"example.com"}'
   ```

2. **查看 Actions 状态**
   - 确保所有测试通过后再合并 PR
   - 关注失败的测试并及时修复

3. **使用分支保护**
   - 设置分支保护规则
   - 要求 Actions 通过后才能合并

## 📚 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [工作流语法参考](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Node.js Actions](https://github.com/actions/setup-node)

