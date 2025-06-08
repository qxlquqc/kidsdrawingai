/**
 * 服务端Supabase API
 * 只能在服务端组件中使用
 * 没有"use client"指令的组件中使用此文件
 */

import { createClient } from './supabase-server';
import { User } from '@supabase/supabase-js';

// 获取用户元数据
export async function getUserMeta(userId: string) {
  console.log('📋 ================================');
  console.log('📋 Getting user metadata for user:', userId);
  console.log('📋 ================================');
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_meta')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  console.log('📋 User metadata query result:');
  console.log('📋 Data:', data);
  console.log('📋 Error:', error);
  console.log('📋 Error code:', error?.code);
    
  if (error && error.code !== 'PGRST116') { // PGRST116 是 "记录不存在" 错误
    console.error('❌ 获取用户元数据错误:', error);
    throw error;
  }
  
  if (!data) {
    console.log('⚠️ No user metadata found in database for user:', userId);
  } else {
    console.log('✅ User metadata found:');
    console.log('✅ Plan type:', data.plan_type);
    console.log('✅ Is paid:', data.is_paid);
    console.log('✅ Paid at:', data.paid_at);
    console.log('✅ Username:', data.username);
  }
  
  console.log('📋 ================================');
  return data;
}

// 更新或插入用户元数据
export async function upsertUserMeta(
  user: User,
  additionalData = {}
) {
  const supabase = await createClient();
  
  // 提取头像URL和用户名（如果从OAuth提供者可用）
  const avatar_url = user.user_metadata?.avatar_url;
  const username = user.user_metadata?.name || 
                   user.user_metadata?.full_name || 
                   user.email?.split('@')[0];
  
  const userData = {
    user_id: user.id,
    username,
    avatar_url,
    updated_at: new Date().toISOString(),
    ...additionalData
  };
  
  const { data, error } = await supabase
    .from('user_meta')
    .upsert(userData, { onConflict: 'user_id' });
    
  if (error) {
    console.error('更新用户元数据错误:', error);
    throw error;
  }
  
  return data;
}

// 记录图像生成使用
export async function recordUsage(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0]; // 格式: YYYY-MM-DD
  
  // 查询今天的使用记录
  const { data: existingRecord, error: fetchError } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
    
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('获取使用记录错误:', fetchError);
    throw fetchError;
  }
  
  // 如果今天已有记录，则更新计数
  if (existingRecord) {
    const { error: updateError } = await supabase
      .from('user_usage')
      .update({ 
        generation_count: existingRecord.generation_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('date', today);
      
    if (updateError) {
      console.error('更新使用记录错误:', updateError);
      throw updateError;
    }
    
    return existingRecord.generation_count + 1;
  } 
  // 否则，创建新记录
  else {
    const { error: insertError } = await supabase
      .from('user_usage')
      .insert({ 
        user_id: userId,
        date: today,
        generation_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (insertError) {
      console.error('创建使用记录错误:', insertError);
      throw insertError;
    }
    
    return 1;
  }
}

// 获取用户今日使用情况
export async function getTodayUsage(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0]; // 格式: YYYY-MM-DD
  
  const { data, error } = await supabase
    .from('user_usage')
    .select('generation_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('获取今日使用情况错误:', error);
    throw error;
  }
  
  return data?.generation_count || 0;
}

// 获取用户总使用情况
export async function getTotalUsage(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_usage')
    .select('generation_count')
    .eq('user_id', userId);
    
  if (error) {
    console.error('获取总使用情况错误:', error);
    throw error;
  }
  
  // 计算总使用次数
  const totalCount = data?.reduce((sum, record) => sum + (record.generation_count || 0), 0) || 0;
  
  return totalCount;
}

// 获取用户生成历史记录
export async function getUsageHistory(userId: string, limit = 10) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_usage')
    .select('date, generation_count')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('获取使用历史记录错误:', error);
    throw error;
  }
  
  return data || [];
}

// 获取套餐限制信息
function getPlanLimits(planType: string) {
  // 使用新的套餐配置
  try {
    const { getPlanLimit } = require('@/lib/planConfig');
    return { monthlyLimit: getPlanLimit(planType) };
  } catch (error) {
    // 回退到硬编码配置（向后兼容）
    console.warn('Failed to import planConfig, using fallback limits');
  const limits = {
    'free': { monthlyLimit: 0 },
    'starter_monthly': { monthlyLimit: 50 },
    'starter_yearly': { monthlyLimit: 50 },
    'explorer_monthly': { monthlyLimit: 200 },
    'explorer_yearly': { monthlyLimit: 200 },
    'creator_monthly': { monthlyLimit: 500 },
    'creator_yearly': { monthlyLimit: 500 }
  };
  return limits[planType as keyof typeof limits] || limits['free'];
  }
}

// 获取当月使用情况 - 基于用户账单周期（30天）而非自然月
export async function getCurrentMonthUsage(userId: string) {
  const supabase = await createClient();
  
  // 获取用户付费信息
  const userMeta = await getUserMeta(userId);
  
  let billingCycleStart: Date;
  
  if (userMeta?.paid_at) {
    // 有付费记录，使用付费日期作为账单周期开始
    const paidDate = new Date(userMeta.paid_at);
    const today = new Date();
    
    // 计算距离付费日期已过了多少个30天周期
    const daysSincePaid = Math.floor((today.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24));
    const cyclesPassed = Math.floor(daysSincePaid / 30);
    
    // 当前账单周期开始日期
    billingCycleStart = new Date(paidDate);
    billingCycleStart.setDate(paidDate.getDate() + (cyclesPassed * 30));
  } else {
    // 没有付费记录，使用注册日期或当前自然月
    // 对于免费用户，使用自然月即可
    const now = new Date();
    billingCycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  // 账单周期结束日期（30天后）
  const billingCycleEnd = new Date(billingCycleStart);
  billingCycleEnd.setDate(billingCycleStart.getDate() + 30);
  
  // 格式化日期为 YYYY-MM-DD
  const startDate = billingCycleStart.toISOString().split('T')[0];
  const endDate = billingCycleEnd.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('user_usage')
    .select('generation_count')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lt('date', endDate);
    
  if (error) {
    console.error('获取当月使用情况错误:', error);
    throw error;
  }
  
  const totalUsage = data?.reduce((sum, record) => sum + (record.generation_count || 0), 0) || 0;
  
  // 返回使用情况和周期信息
  return {
    usage: totalUsage,
    billingCycleStart,
    billingCycleEnd,
    isInCurrentCycle: true
  };
}

// 检查用户是否可以生成图像（是否超过使用限制）
export async function canGenerateImage(userId: string) {
  try {
    // 获取用户元数据（检查是否付费用户和套餐类型）
    const userMeta = await getUserMeta(userId);
    const planType = userMeta?.plan_type || 'free';
    const isPaid = userMeta?.is_paid || false;
    
    // 获取套餐限制
    const limits = getPlanLimits(planType);
    
    // 获取当前账单周期使用情况
    const monthlyUsageInfo = await getCurrentMonthUsage(userId);
    const monthlyUsage = monthlyUsageInfo.usage;
    
    return {
      canGenerate: monthlyUsage < limits.monthlyLimit,
      currentUsage: monthlyUsage,
      limit: limits.monthlyLimit,
      remaining: Math.max(0, limits.monthlyLimit - monthlyUsage),
      isPaid,
      planType,
      billingCycleStart: monthlyUsageInfo.billingCycleStart,
      billingCycleEnd: monthlyUsageInfo.billingCycleEnd
    };
  } catch (error) {
    console.error('检查生成权限错误:', error);
    throw error;
  }
} 