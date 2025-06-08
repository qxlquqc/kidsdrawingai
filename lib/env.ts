/**
 * 环境变量帮助模块
 * 确保API路由能够正确访问环境变量
 */

// 可以在客户端使用的环境变量
export const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  NEXT_PUBLIC_REPLICATE_API_TOKEN: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || '',
};

// 只在服务器端使用的环境变量，现在也可以使用客户端环境变量
export const serverEnv = {
  // 注意：按照优先级查找所有可能的变量名
  REPLICATE_API_TOKEN: 
    process.env.REPLICATE_API_TOKEN || 
    process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || 
    process.env.REPLICATE_API_KEY || // 兼容处理，万一有这个变量
    '',
};

// Creem Payment Configuration
export const creemEnv = {
  API_URL: process.env.CREEM_API_URL || 'https://test-api.creem.io/v1',
  API_KEY: process.env.CREEM_API_KEY || '',
  WEBHOOK_SECRET: process.env.CREEM_WEBHOOK_SECRET || '',
  SUCCESS_URL: process.env.CREEM_SUCCESS_URL || '',
  CANCEL_URL: process.env.CREEM_CANCEL_URL || '',
  
  // Product IDs for all plans
  PRODUCTS: {
    STARTER_MONTHLY: process.env.CREEM_PID_STARTER_MONTHLY || '',
    STARTER_YEARLY: process.env.CREEM_PID_STARTER_YEARLY || '',
    EXPLORER_MONTHLY: process.env.CREEM_PID_EXPLORER_MONTHLY || '',
    EXPLORER_YEARLY: process.env.CREEM_PID_EXPLORER_YEARLY || '',
    CREATOR_MONTHLY: process.env.CREEM_PID_CREATOR_MONTHLY || '',
    CREATOR_YEARLY: process.env.CREEM_PID_CREATOR_YEARLY || '',
  }
};

/**
 * 验证服务器端环境变量是否正确配置
 * @returns {boolean} 环境变量是否正确配置
 */
export function validateServerEnv(): { valid: boolean; missingVars: string[] } {
  const missingVars: string[] = [];
  
  // 检查Replicate API Token（尝试所有可能的变量名）
  const replicateToken = 
    process.env.REPLICATE_API_TOKEN || 
    process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || 
    process.env.REPLICATE_API_KEY ||
    '';
    
  if (!replicateToken) {
    missingVars.push('REPLICATE_API_TOKEN 或 NEXT_PUBLIC_REPLICATE_API_TOKEN');
  }
  
  // 验证REPLICATE_API_TOKEN格式
  if (replicateToken && (!replicateToken.startsWith('r8_') || replicateToken.length < 30)) {
    console.warn('⚠️ Replicate API Token 格式可能不正确，应以r8_开头并且足够长');
  }
  
  return {
    valid: missingVars.length === 0,
    missingVars,
  };
}

/**
 * 获取Replicate API令牌，确保正确加载
 * @returns {string} Replicate API令牌
 */
export function getReplicateApiToken(): string {
  // 按优先级尝试获取所有可能的变量名
  const token = 
    process.env.REPLICATE_API_TOKEN || 
    process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN ||
    process.env.REPLICATE_API_KEY ||
    '';
  
  if (!token) {
    console.error('⚠️ 未找到Replicate API Token，请检查.env.local文件');
    console.error('请确保设置了以下任一变量: REPLICATE_API_TOKEN, NEXT_PUBLIC_REPLICATE_API_TOKEN');
  } else {
    console.log(`✅ 找到了Replicate API令牌 (${token.substring(0, 3)}...)`);
  }
  
  return token;
}

export function validateCreemEnv(): { valid: boolean; missingVars: string[] } {
  const requiredVars = [
    'CREEM_API_KEY',
    'CREEM_WEBHOOK_SECRET',
    'CREEM_SUCCESS_URL',
    'CREEM_CANCEL_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    valid: missingVars.length === 0,
    missingVars
  };
} 