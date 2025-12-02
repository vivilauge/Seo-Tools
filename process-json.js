const fs = require('fs');
const path = require('path');

/**
 * 处理JSON文件，移除文件开头的非JSON字符串
 * @param {string} sourceDir - 源文件夹路径
 * @param {string} targetDir - 目标文件夹路径
 */
function processJsonFiles(sourceDir, targetDir) {
  // 确保目标文件夹存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 递归读取所有JSON文件
  function getAllJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // 递归处理子文件夹
        getAllJsonFiles(filePath, fileList);
      } else if (file.endsWith('.json')) {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  const jsonFiles = getAllJsonFiles(sourceDir);
  console.log(`找到 ${jsonFiles.length} 个JSON文件`);

  let successCount = 0;
  let errorCount = 0;

  jsonFiles.forEach((filePath, index) => {
    try {
      // 读取原始文件内容
      const rawContent = fs.readFileSync(filePath, 'utf8');

      // 查找JSON内容的开始位置
      // 方法1: 查找第一个 '{' 或 '[' 的位置
      let jsonStartIndex = -1;
      for (let i = 0; i < rawContent.length; i++) {
        const char = rawContent[i];
        if (char === '{' || char === '[') {
          jsonStartIndex = i;
          break;
        }
      }

      if (jsonStartIndex === -1) {
        throw new Error('未找到有效的JSON开始标记');
      }

      // 提取JSON部分
      const jsonContent = rawContent.substring(jsonStartIndex).trim();

      // 验证JSON格式
      JSON.parse(jsonContent);

      // 计算相对路径，保持目录结构
      const relativePath = path.relative(sourceDir, filePath);
      const targetFilePath = path.join(targetDir, relativePath);
      const targetFileDir = path.dirname(targetFilePath);

      // 确保目标目录存在
      if (!fs.existsSync(targetFileDir)) {
        fs.mkdirSync(targetFileDir, { recursive: true });
      }

      // 保存处理后的JSON文件（格式化）
      const formattedJson = JSON.stringify(JSON.parse(jsonContent), null, 2);
      fs.writeFileSync(targetFilePath, formattedJson, 'utf8');

      successCount++;
      if ((index + 1) % 100 === 0) {
        console.log(`已处理 ${index + 1}/${jsonFiles.length} 个文件...`);
      }
    } catch (error) {
      errorCount++;
      console.error(`处理文件失败: ${filePath}`);
      console.error(`错误信息: ${error.message}`);
    }
  });

  console.log('\n处理完成！');
  console.log(`成功: ${successCount} 个文件`);
  console.log(`失败: ${errorCount} 个文件`);
}

// 从命令行参数获取源文件夹和目标文件夹
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('使用方法: node process-json.js <源文件夹> <目标文件夹>');
  console.log('示例: node process-json.js ./results ./cleaned-results');
  process.exit(1);
}

const sourceDir = path.resolve(args[0]);
const targetDir = path.resolve(args[1]);

if (!fs.existsSync(sourceDir)) {
  console.error(`错误: 源文件夹不存在: ${sourceDir}`);
  process.exit(1);
}

console.log(`源文件夹: ${sourceDir}`);
console.log(`目标文件夹: ${targetDir}`);
console.log('开始处理...\n');

processJsonFiles(sourceDir, targetDir);

