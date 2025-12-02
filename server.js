const http = require('http');
const https = require('https');
const url = require('url');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const STATIC_DIR = __dirname;

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
 * 检查URL的状态码
 */
function checkUrlStatus(targetUrl, protocol = 'http') {
    return new Promise((resolve) => {
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
            method: 'GET',
            timeout: 10000, // 10秒超时
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            // 不验证SSL证书（可根据需要修改）
            rejectUnauthorized: false
        };

        const req = httpModule.request(options, (res) => {
            const result = {
                status: res.statusCode,
                message: getStatusMessage(res.statusCode)
            };

            // 如果是重定向，获取重定向URL
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
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
                errorMessage = '无法连接到服务器';
            } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
                errorMessage = '请求超时';
            } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
                errorMessage = '无法解析域名';
            } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
                errorMessage = 'SSL证书错误';
            }

            resolve({
                status: 0,
                message: errorMessage,
                errorCode: error.code
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                status: 0,
                message: '请求超时'
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
    // 处理路径，确保以 / 开头
    const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;
    const fullPath = path.join(STATIC_DIR, normalizedPath);
    
    // 安全检查：确保文件在静态目录内
    const resolvedPath = path.resolve(fullPath);
    const resolvedDir = path.resolve(STATIC_DIR);
    
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
    
    // 提供静态文件
    serveStaticFile(filePath, res);
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`访问地址: http://localhost:${PORT}`);
    console.log(`API接口: http://localhost:${PORT}/check_status`);
    console.log('按 Ctrl+C 停止服务器');
});

// 处理错误
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`端口 ${PORT} 已被占用，请使用其他端口`);
    } else {
        console.error('服务器错误:', error);
    }
    process.exit(1);
});

