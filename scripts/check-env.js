#!/usr/bin/env node

// 简单的环境变量检查脚本
// 使用：node scripts/check-env.js
// 或添加到package.json: "scripts": { "check-env": "node scripts/check-env.js" }

const fs = require('fs');
const path = require('path');

// 项目根目录路径
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');

console.log('检查环境变量配置...');
console.log('项目根目录:', rootDir);

// 检查.env.local文件是否存在
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local 文件不存在！');
  console.log('请在项目根目录创建 .env.local 文件，并添加以下内容:');
  console.log(`
NEXT_PUBLIC_REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
`);
  process.exit(1);
}

console.log('✅ .env.local 文件存在。');

// 读取.env.local文件内容
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line => line.trim() !== '');

// 检查必需的环境变量 - 现在支持两种命名方式
const requiredVarsWithAlternatives = [
  { name: 'REPLICATE_API_TOKEN', alternatives: ['NEXT_PUBLIC_REPLICATE_API_TOKEN'] },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', alternatives: [] },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', alternatives: [] }
];

const missingVars = [];

for (const varObj of requiredVarsWithAlternatives) {
  const { name, alternatives } = varObj;
  // 检查主变量名或任意替代变量名
  const foundVar = [name, ...alternatives].some(varName => 
    envLines.some(line => line.startsWith(`${varName}=`))
  );
  
  if (!foundVar) {
    if (alternatives.length > 0) {
      missingVars.push(`${name} 或 ${alternatives.join(' 或 ')}`);
    } else {
      missingVars.push(name);
    }
  }
}

if (missingVars.length > 0) {
  console.error(`❌ 缺少以下必需的环境变量: ${missingVars.join(', ')}`);
  process.exit(1);
}

// 检查Replicate API Token格式
// 先检查REPLICATE_API_TOKEN，再检查NEXT_PUBLIC_REPLICATE_API_TOKEN
let replicateTokenLine = envLines.find(line => line.startsWith('REPLICATE_API_TOKEN='));
if (!replicateTokenLine) {
  replicateTokenLine = envLines.find(line => line.startsWith('NEXT_PUBLIC_REPLICATE_API_TOKEN='));
}

if (replicateTokenLine) {
  const tokenValue = replicateTokenLine.split('=')[1].trim();
  if (!tokenValue.startsWith('r8_') || tokenValue.length < 30) {
    console.warn('⚠️ Replicate API Token 格式可能不正确。正确的token应以 r8_ 开头并且足够长。');
    console.warn('当前token:', tokenValue.substring(0, 5) + '...');
  } else {
    console.log('✅ Replicate API Token 格式正确。');
  }
}

console.log('✅ 所有必需的环境变量都已配置。');
console.log('环境变量检查完成。');

// 检查.env.local文件是否包含正确的变量
let hasCorrectToken = false;
if (envLines.some(line => line.startsWith('NEXT_PUBLIC_REPLICATE_API_TOKEN='))) {
  console.log('✅ 使用 NEXT_PUBLIC_REPLICATE_API_TOKEN 环境变量。');
  hasCorrectToken = true;
} else if (envLines.some(line => line.startsWith('REPLICATE_API_TOKEN='))) {
  console.warn('⚠️ 检测到 REPLICATE_API_TOKEN 而不是 NEXT_PUBLIC_REPLICATE_API_TOKEN。');
  console.warn('建议在.env.local中使用 NEXT_PUBLIC_REPLICATE_API_TOKEN 以确保前端和后端都能访问。');
}

// 退出状态基于是否有正确格式的token
process.exit(hasCorrectToken ? 0 : 1); 