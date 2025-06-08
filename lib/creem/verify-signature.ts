import { timingSafeEqual } from 'crypto';
import { createHmac } from 'crypto';

/**
 * 验证Creem webhook签名
 * 基于Creem文档的简化签名格式：直接是hex字符串
 * 
 * @param payload - 原始请求体字符串
 * @param signature - creem-signature头的值
 * @param secret - CREEM_WEBHOOK_SECRET
 * @returns 验证结果
 */
export function verifyCreemSignature(
  payload: string, 
  signature: string, 
  secret: string
): boolean {
  try {
    // 清理签名头（去除可能的空格和换行符）
    const receivedSig = signature.trim().replace(/\s+/g, '');
    
    if (!receivedSig || !secret || !payload) {
      console.error('Missing required parameters for signature verification');
      return false;
    }
    
    // 使用HMAC-SHA256计算期望签名
    const expectedSig = createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    // 确保两个签名长度相同
    if (receivedSig.length !== expectedSig.length) {
      console.error('Signature length mismatch');
      return false;
    }
    
    // 使用timing-safe比较防止时序攻击
    const receivedBuffer = Buffer.from(receivedSig, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');
    
    return timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch (error) {
    console.error('Creem signature verification error:', error);
    return false;
  }
}

/**
 * 生成测试签名（仅用于开发测试）
 */
export function generateTestSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
} 