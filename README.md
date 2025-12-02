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

2. 启动服务器：
```bash
node server.js
```

或者使用 npm：
```bash
npm start
```

3. 在浏览器中访问：
```
http://localhost:3000
```

**重要提示：** 
- ✅ **推荐方式**：通过 Node.js 服务器访问（`http://localhost:3000`），这样前端和 API 都能正常工作
- ❌ **不推荐**：直接双击打开 `index.html` 文件，因为 API 调用会失败（浏览器安全限制）
- 服务器会自动提供 `index.html` 页面，访问根路径 `/` 即可

### 部署到服务器

#### 方法一：直接运行（适合测试）

1. 将项目文件上传到服务器

2. 在服务器上安装 Node.js（如果还没有安装）

3. 启动服务器：
```bash
node server.js
```

4. 访问服务器IP或域名：
```
http://your-server-ip:3000
```

#### 方法二：使用 PM2 管理进程（推荐生产环境）

1. 安装 PM2：
```bash
npm install -g pm2
```

2. 启动应用（使用配置文件）：
```bash
pm2 start ecosystem.config.js
```

或者直接启动：
```bash
pm2 start server.js --name status-checker
```

3. 设置开机自启：
```bash
pm2 startup
pm2 save
```

4. 查看状态：
```bash
pm2 status
```

5. 查看日志：
```bash
pm2 logs status-checker
```

6. 重启应用：
```bash
pm2 restart status-checker
```

7. 停止应用：
```bash
pm2 stop status-checker
```

#### 方法三：使用 Nginx 反向代理（推荐生产环境）

1. 安装 Nginx（如果还没有安装）

2. 配置 Nginx（编辑 `/etc/nginx/sites-available/default` 或创建新配置文件）：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. 重启 Nginx：
```bash
sudo nginx -t
sudo systemctl restart nginx
```

4. 使用 PM2 启动 Node.js 应用（见方法二）

5. 访问：
```
http://your-domain.com
```

#### 方法四：使用 Docker（可选）

1. 创建 `Dockerfile`：
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

2. 构建镜像：
```bash
docker build -t status-checker .
```

3. 运行容器：
```bash
docker run -d -p 3000:3000 --name status-checker status-checker
```

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
- 如果部署到生产环境，建议使用 PM2 或 Docker 管理进程
- 如果需要HTTPS，建议使用 Nginx 反向代理并配置SSL证书

## 故障排除

### 端口被占用

如果遇到端口被占用的错误，可以：
1. 修改 `server.js` 中的 `PORT` 变量
2. 或使用环境变量：`PORT=8080 node server.js`

### 无法访问

1. 检查防火墙是否开放了相应端口
2. 检查服务器是否正在运行：`ps aux | grep node`
3. 查看服务器日志确认是否有错误

### CORS 错误

如果遇到跨域问题，检查 `server.js` 中的 CORS 设置是否正确。

## 许可证

MIT

