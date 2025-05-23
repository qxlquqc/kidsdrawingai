/**
 * 客户端Supabase API
 * 只能在客户端组件中使用
 * "use client" 指令的组件中使用此文件
 */

import { createClient } from './supabase-browser';
import { User } from '@supabase/supabase-js';

// 获取用户元数据
export async function getUserMeta(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_meta')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 是 "记录不存在" 错误
    console.error('获取用户元数据错误:', error);
    throw error;
  }
  
  return data;
}

// 更新或插入用户元数据
export async function upsertUserMeta(
  user: User,
  additionalData = {}
) {
  const supabase = createClient();
  
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
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
  
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

// 检查用户是否可以生成图像（是否超过使用限制）
export async function canGenerateImage(userId: string) {
  try {
    // 获取用户元数据（检查是否付费用户）
    const userMeta = await getUserMeta(userId);
    const isPaid = userMeta?.is_paid || false;
    
    // 获取今日使用情况
    const todayUsage = await getTodayUsage(userId);
    
    // 付费用户每天限制100张，免费用户每天限制3张
    const limit = isPaid ? 100 : 3;
    
    return {
      canGenerate: todayUsage < limit,
      currentUsage: todayUsage,
      limit,
      remaining: Math.max(0, limit - todayUsage),
      isPaid
    };
  } catch (error) {
    console.error('检查生成权限错误:', error);
    throw error;
  }
} 