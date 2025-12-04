const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const { URL } = require('url');

/**
 * 获取HTTP状态码的友好描述
 */
function getStatusMessage(code) {
    const messages = {
        200: 'OK - 请求成功',
        201: 'Created - 已创建',
        204: 'No Content - 无内容',
        301: 'Moved Permanently - 永久重定向',
        302: 'Found - 临时重定向',
        304: 'Not Modified - 未修改',
        400: 'Bad Request - 请求错误',
        401: 'Unauthorized - 未授权',
        403: 'Forbidden - 禁止访问',
        404: 'Not Found - 未找到',
        405: 'Method Not Allowed - 方法不允许',
        408: 'Request Timeout - 请求超时',
        429: 'Too Many Requests - 请求过多',
        500: 'Internal Server Error - 服务器内部错误',
        502: 'Bad Gateway - 网关错误',
        503: 'Service Unavailable - 服务不可用',
        504: 'Gateway Timeout - 网关超时',
    };

    return messages[code] || `HTTP ${code}`;
}

/**
 * 检查URL的状态码（支持HTTP和HTTPS，自动重定向）
 */
function checkUrlStatus(targetUrl, protocol = 'http', redirectCount = 0) {
    return new Promise(async (resolve) => {
        // 防止无限重定向
        if (redirectCount > 3) {
            resolve({
                status: 0,
                message: '重定向次数过多 - 可能存在重定向循环',
                protocol: protocol
            });
            return;
        }

        // 自动处理不带协议的URL
        let finalUrl = targetUrl.trim();
        if (!/^https?:\/\//.test(finalUrl)) {
            finalUrl = `${protocol}://${finalUrl}`;
        }

        // 验证URL格式
        try {
            new URL(finalUrl);
        } catch (error) {
            resolve({
                status: 0,
                message: '无效的URL格式: ' + finalUrl
            });
            return;
        }

        // 选择HTTP或HTTPS模块
        const httpModule = finalUrl.startsWith('https://') ? https : http;

        // 解析URL
        const parsedUrl = new URL(finalUrl);

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (finalUrl.startsWith('https://') ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'HEAD', // 使用HEAD请求获取状态码
            timeout: 15000, // 15秒超时
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Connection': 'keep-alive',
                'Accept': '*/*'
            },
            // 不验证SSL证书（可根据需要修改）
            rejectUnauthorized: false
        };

        const req = httpModule.request(options, async (res) => {
            const currentProtocol = finalUrl.startsWith('https://') ? 'https' : 'http';
            const statusCode = res.statusCode;

            const result = {
                status: statusCode,
                message: getStatusMessage(statusCode),
                protocol: currentProtocol
            };

            // 检查是否需要重定向到HTTPS
            if (statusCode === 301 || statusCode === 302) {
                // 如果当前是HTTP请求且返回301/302，尝试HTTPS版本
                if (currentProtocol === 'http') {
                    const httpsUrl = finalUrl.replace('http://', 'https://');
                    console.log(`🔄 HTTP重定向检测，尝试HTTPS版本: ${finalUrl} → ${httpsUrl}`);

                    try {
                        // 递归调用检查HTTPS版本
                        const httpsResult = await checkUrlStatus(httpsUrl, 'https', redirectCount + 1);
                        // 标记这是从HTTP重定向过来的
                        httpsResult.redirected_from_http = true;
                        httpsResult.original_http_url = finalUrl;
                        httpsResult.redirect_url = res.headers.location; // 保留原始的重定向URL
                        resolve(httpsResult);
                        return;
                    } catch (error) {
                        console.log(`❌ HTTPS重试失败，使用原始HTTP结果`);
                        // HTTPS重试失败，返回原始HTTP重定向结果
                        result.redirect_url = res.headers.location;
                    }
                } else {
                    // HTTPS请求的重定向，正常处理
                    result.redirect_url = res.headers.location;
                }
            } else if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
                // 其他重定向情况
                result.redirect_url = res.headers.location;
            }

            // 读取响应数据（但不使用）
            res.on('data', () => {});
            res.on('end', () => {
                resolve(result);
            });
        });

        req.on('error', (error) => {
            let errorMessage = error.message || '未知错误';

            // 常见错误码转换
            if (error.code === 'ECONNREFUSED') {
                errorMessage = '连接被拒绝 - 服务器可能未运行或防火墙阻止';
            } else if (error.code === 'ETIMEDOUT') {
                errorMessage = '连接超时 - 网络延迟或服务器响应慢';
            } else if (error.code === 'ECONNRESET') {
                errorMessage = '连接被重置 - 网络不稳定或服务器限制';
            } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
                errorMessage = '域名解析失败 - 域名不存在或DNS问题';
            } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
                errorMessage = 'SSL证书错误 - 证书已过期或无效';
            } else if (error.code === 'EHOSTUNREACH') {
                errorMessage = '主机不可达 - 网络路由问题';
            } else if (error.code === 'ENETUNREACH') {
                errorMessage = '网络不可达 - 网络连接问题';
            } else if (error.code === 'EPIPE') {
                errorMessage = '管道错误 - 连接中断';
            }

            resolve({
                status: 0,
                message: errorMessage,
                errorCode: error.code,
                protocol: finalUrl.startsWith('https://') ? 'https' : 'http'
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                status: 0,
                message: '请求超时 - 15秒内未收到响应',
                protocol: finalUrl.startsWith('https://') ? 'https' : 'http'
            });
        });

        req.end();
    });
}

/**
 * 处理CORS
 */
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

/**
 * 获取文件MIME类型
 */
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * 提供静态文件服务
 */
function serveStaticFile(filePath, res) {
    const fs = require('fs');
    const path = require('path');

    // 处理路径，确保以 / 开头
    const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;
    const fullPath = path.join(__dirname, normalizedPath);

    // 安全检查：确保文件在静态目录内
    const resolvedPath = path.resolve(fullPath);
    const resolvedDir = path.resolve(__dirname);

    if (!resolvedPath.startsWith(resolvedDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<h1>404 - File not found</h1><p>请求的文件不存在: ${filePath}</p>`);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<h1>500 - Server error</h1><p>服务器错误: ${err.message}</p>`);
            }
            return;
        }

        const mimeType = getMimeType(fullPath);
        res.setHeader('Content-Type', mimeType);
        res.writeHead(200);
        res.end(data);
    });
}

/**
 * 创建HTTP服务器
 */
const server = http.createServer(async (req, res) => {
    // 解析URL，移除查询参数
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname || '/';

    // 处理CORS预检请求
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }

    // 处理API请求（只处理POST请求）
    if (pathname === '/check_status' || pathname === '/check_status.js') {
        if (req.method !== 'POST') {
            setCorsHeaders(res);
            res.writeHead(405);
            res.end(JSON.stringify({
                status: 0,
                message: '只支持POST请求'
            }));
            return;
        }

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const data = JSON.parse(body);

                if (!data.url || !data.url.trim()) {
                    setCorsHeaders(res);
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        status: 0,
                        message: '缺少URL参数'
                    }));
                    return;
                }

                const protocol = data.protocol || 'http';
                const result = await checkUrlStatus(data.url, protocol);

                setCorsHeaders(res);
                res.writeHead(200);
                res.end(JSON.stringify(result));
            } catch (error) {
                setCorsHeaders(res);
                res.writeHead(400);
                res.end(JSON.stringify({
                    status: 0,
                    message: '请求数据格式错误: ' + error.message
                }));
            }
        });
        return;
    }

    // 处理静态文件请求（GET请求）
    let filePath = pathname === '/' ? '/index.html' : pathname;

    serveStaticFile(filePath, res);
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 SEO工具服务器启动成功!`);
    console.log(`📍 本地访问: http://localhost:${PORT}`);
    console.log(`🌐 网络访问: http://YOUR_IP:${PORT}`);
    console.log(`📊 API接口: http://localhost:${PORT}/check_status`);
    console.log(`🛑 停止服务器: Ctrl+C`);
    console.log('');
    console.log('✨ 支持检测所有类型的URL：');
    console.log('   • HTTP资源: http://example.com/api');
    console.log('   • HTTPS资源: https://example.com/api');
    console.log('   • 无协议URL: example.com/api (自动添加http://)');
});

// 处理错误
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用，请使用其他端口:`);
        console.log(`   PORT=8080 node server.js`);
    } else {
        console.error('❌ 服务器错误:', error);
    }
    process.exit(1);
});
