// 环境变量检查脚本
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 检查.env.local文件
function checkEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  console.log(`检查环境变量文件: ${envPath}`);
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local 文件不存在!');
    return false;
  }
  
  console.log('✅ .env.local 文件存在');
  
  // 读取并解析.env文件
  const envContent = fs.readFileSync(envPath, 'utf8');
  const parsedEnv = dotenv.parse(envContent);
  
  // 检查必需的环境变量
  const requiredVars = [
    'REPLICATE_API_TOKEN',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!parsedEnv[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.error(`❌ 缺少必需的环境变量: ${missingVars.join(', ')}`);
    return false;
  }
  
  // 验证REPLICATE_API_TOKEN格式
  const replicateToken = parsedEnv.REPLICATE_API_TOKEN;
  if (replicateToken && (!replicateToken.startsWith('r8_') || replicateToken.length < 30)) {
    console.error('❌ REPLICATE_API_TOKEN 格式可能不正确，应以r8_开头并且足够长');
    return false;
  }
  
  console.log('✅ 所有必需的环境变量已配置');
  console.log(`✅ REPLICATE_API_TOKEN 已设置 (${replicateToken.substring(0, 4)}...${replicateToken.substring(replicateToken.length-4)})`);
  
  return true;
}

// 执行检查
const envCheck = checkEnvFile();
if (!envCheck) {
  console.log('\n请在项目根目录创建或编辑 .env.local 文件，并添加必要的环境变量:');
  console.log(`
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxx

若要获取Replicate API token，请访问: https://replicate.com/account/api-tokens
`);
}

process.exit(envCheck ? 0 : 1); 