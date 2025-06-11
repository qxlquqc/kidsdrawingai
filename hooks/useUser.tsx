'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'
import React from 'react'

// 创建用户上下文
type UserContextType = {
  user: User | null
  loading: boolean
  error: Error | null
  signOut: () => Promise<void>
  syncUserMetadata: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
  syncUserMetadata: async () => {},
})

// 用户上下文提供器
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  // 同步用户信息到数据库
  const syncUserMetadata = async () => {
    
    try {
      if (!user) {
        return;
      }

      // 获取用户的元数据
      const { data: userData, error: fetchError } = await supabase
        .from('user_meta')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116是"未找到记录"错误
        console.error('❌ 获取用户元数据错误:', fetchError);
        throw fetchError
      }

      // 提取头像URL和用户名（如果从OAuth提供者可用）
      let avatar_url = user.user_metadata.avatar_url
      let username = user.user_metadata.name || user.user_metadata.full_name || user.email?.split('@')[0]

      const upsertData = {
        user_id: user.id,
        username,
        avatar_url,
        updated_at: new Date().toISOString(),
      };

      // 使用Upsert - 如果记录存在则更新，不存在则插入
      const { error: upsertError } = await supabase
        .from('user_meta')
        .upsert(upsertData, {
          onConflict: 'user_id'
        })

      if (upsertError) {
        console.error('❌ Upsert error:', upsertError);
        console.error('❌ Upsert error details:', JSON.stringify(upsertError, null, 2));
        throw upsertError
      }
    } catch (error) {
      console.error('💥 同步用户元数据失败:', error);
      console.error('💥 Error details:', JSON.stringify(error, null, 2));
      setError(error as Error)
    }
  }

  // 登出方法
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('❌ 登出错误:', error);
      console.error('❌ Logout error details:', JSON.stringify(error, null, 2));
      setError(error as Error)
    }
  }

  // 监听用户状态变化
  useEffect(() => {
    const initUser = async () => {
      try {
        setLoading(true)
        
        // 获取当前会话
        const { data: { user }, error: getUserError } = await supabase.auth.getUser()
        
        setUser(user)

        if (user) {
          // 同步用户元数据
          await syncUserMetadata()
        }
        
        // 监听登录状态变化
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setUser(session?.user || null)
            
            if (event === 'SIGNED_IN' && session?.user) {
              await syncUserMetadata()
            }
          }
        )

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('💥 初始化用户错误:', error);
        console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack');
        setError(error as Error)
      } finally {
        setLoading(false)
      }
    }
    
    initUser()
  }, [])

  const value = {
    user,
    loading,
    error,
    signOut,
    syncUserMetadata,
  }

  return React.createElement(UserContext.Provider, { value }, children)
}

// 使用用户钩子
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser必须在UserProvider内部使用')
  }
  return context
} 