const http = require('http');
const https = require('https');
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
 * Vercel Serverless 函数入口
 */
module.exports = async (req, res) => {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // 处理 CORS 预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 只处理 POST 请求
    if (req.method !== 'POST') {
        res.status(405).json({
            status: 0,
            message: '只支持POST请求，当前方法: ' + req.method
        });
        return;
    }

    try {
        // Vercel 会自动解析 JSON body
        const data = req.body || {};

        if (!data.url || !data.url.trim()) {
            res.status(400).json({
                status: 0,
                message: '缺少URL参数'
            });
            return;
        }

        const protocol = data.protocol || 'http';
        const result = await checkUrlStatus(data.url, protocol);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: '请求数据格式错误: ' + error.message
        });
    }
};

