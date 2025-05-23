'use client'

import { createClient } from './supabase-browser'
import { useEffect } from 'react'

/**
 * 用于全局监听Supabase Auth状态变化
 * 这个工具可以在Layout或其他全局组件中使用
 * 主要解决多标签页登录状态同步问题
 */
export function useAuthListener(onAuthChange?: (isAuthenticated: boolean) => void) {
  useEffect(() => {
    const supabase = createClient()
    
    // 同步检查会话状态
    const checkAndUpdateSession = async () => {
      // 获取当前会话状态
      const { data: { session } } = await supabase.auth.getSession()
      
      // 调用回调通知应用程序状态变化
      if (onAuthChange) {
        onAuthChange(!!session)
      }

      console.log('Auth监听器: 会话检查', !!session)
    }

    // 初始检查
    checkAndUpdateSession()
    
    // 设置Auth状态变化监听
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth监听器: 状态变化', event)
      
      // 对于重要的Auth事件，同步应用状态
      if (
        event === 'SIGNED_IN' || 
        event === 'SIGNED_OUT' || 
        event === 'USER_UPDATED' ||
        event === 'TOKEN_REFRESHED'
      ) {
        if (onAuthChange) {
          onAuthChange(!!session)
        }
      }
    })
    
    // 设置跨窗口/标签页的监听器
    const handleStorageChange = (e: StorageEvent) => {
      // 如果localStorage中的supabase-auth-token发生变化
      if (e.key?.includes('supabase.auth.token')) {
        console.log('Auth监听器: 检测到跨标签页认证变化')
        checkAndUpdateSession()
      }
    }
    
    // 添加跨窗口/标签页事件监听
    window.addEventListener('storage', handleStorageChange)
    
    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      subscription.unsubscribe()
    }
  }, [onAuthChange])
} 