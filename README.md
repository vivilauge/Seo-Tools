# 网站状态码批量检查工具

一个基于 Node.js 的网站状态码批量检查工具，支持实时显示检查结果。

## 功能特点

- ✅ 批量检查网站状态码
- ✅ 实时显示检查结果
- ✅ 自动处理不带协议的URL（如：`example.com/path/file.php`）
- ✅ 支持HTTP和HTTPS协议选择
- ✅ 状态码分类显示（2xx绿色、3xx蓝色、4xx黄色、5xx红色）
- ✅ 统计信息显示
- ✅ 进度条显示

## 安装和运行

### 本地开发

1. 确保已安装 Node.js（版本 >= 12.0.0）

2. 克隆仓库：
```bash
git clone https://github.com/vivilauge/Seo-Tools.git
cd Seo-Tools
```

3. 启动服务器：
```bash
node server.js
```

或者使用 npm：
```bash
npm start
```

4. 在浏览器中访问：
```
http://localhost:3000
```

**重要提示：** 
- ✅ **推荐方式**：通过 Node.js 服务器访问（`http://localhost:3000`），这样前端和 API 都能正常工作
- ❌ **不推荐**：直接双击打开 `index.html` 文件，因为 API 调用会失败（浏览器安全限制）
- 服务器会自动提供 `index.html` 页面，访问根路径 `/` 即可

## 环境变量

可以通过环境变量配置端口：

```bash
PORT=8080 node server.js
```

## 使用说明

1. 打开网页后，可以选择默认协议（HTTP 或 HTTPS）

2. 输入URL列表，每行一个，支持以下格式：
   - 完整URL：`https://example.com/path/file.php`
   - 不带协议：`example.com/path/file.php`
   - 路径（需配合基础域名）：`/path/file.php`

3. 点击"开始检查"按钮，系统会逐个检查URL并实时显示结果

4. 可以随时点击"停止检查"按钮停止检查

5. 点击"清空结果"按钮清空所有结果

## 注意事项

- 默认端口是 3000，如果端口被占用，可以通过环境变量 `PORT` 修改
- 服务器会同时提供静态文件服务和API服务

## 故障排除

### 本地运行问题

**端口被占用：**
```bash
PORT=8080 node server.js
```

**无法访问：**
1. 确认服务器正在运行
2. 检查防火墙设置
3. 查看终端日志确认错误信息

## 许可证

MIT

