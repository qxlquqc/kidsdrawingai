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
    console.log('👤 ================================');
    console.log('👤 Syncing user metadata');
    console.log('👤 User:', user?.id);
    console.log('👤 User email:', user?.email);
    console.log('👤 User metadata:', user?.user_metadata);
    console.log('👤 ================================');
    
    try {
      if (!user) {
        console.log('⚠️ No user found, skipping metadata sync');
        return;
      }

      // 获取用户的元数据
      console.log('📋 Fetching existing user metadata from database...');
      const { data: userData, error: fetchError } = await supabase
        .from('user_meta')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('📋 Existing user data:', userData);
      console.log('📋 Fetch error:', fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116是"未找到记录"错误
        console.error('❌ 获取用户元数据错误:', fetchError);
        throw fetchError
      }

      // 提取头像URL和用户名（如果从OAuth提供者可用）
      let avatar_url = user.user_metadata.avatar_url
      let username = user.user_metadata.name || user.user_metadata.full_name || user.email?.split('@')[0]

      console.log('👤 Extracted user info:');
      console.log('👤 Username:', username);
      console.log('👤 Avatar URL:', avatar_url);

      const upsertData = {
        user_id: user.id,
        username,
        avatar_url,
        updated_at: new Date().toISOString(),
      };

      console.log('💾 Upserting user metadata:', upsertData);

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

      console.log('✅ 用户元数据同步成功');
    } catch (error) {
      console.error('💥 同步用户元数据失败:', error);
      console.error('💥 Error details:', JSON.stringify(error, null, 2));
      setError(error as Error)
    }
  }

  // 登出方法
  const signOut = async () => {
    console.log('🚪 ================================');
    console.log('🚪 User signing out');
    console.log('🚪 Current user:', user?.id);
    console.log('🚪 ================================');
    
    try {
      await supabase.auth.signOut()
      console.log('✅ 用户已成功登出');
    } catch (error) {
      console.error('❌ 登出错误:', error);
      console.error('❌ Logout error details:', JSON.stringify(error, null, 2));
      setError(error as Error)
    }
  }

  // 监听用户状态变化
  useEffect(() => {
    console.log('🔄 ================================');
    console.log('🔄 Initializing user authentication');
    console.log('🔄 ================================');
    
    const initUser = async () => {
      try {
        setLoading(true)
        console.log('⏳ Setting loading to true');
        
        // 获取当前会话
        console.log('🔍 Getting current user session...');
        const { data: { user }, error: getUserError } = await supabase.auth.getUser()
        
        console.log('👤 Current user result:', user?.id);
        console.log('👤 Current user email:', user?.email);
        console.log('👤 Get user error:', getUserError);
        
        setUser(user)

        if (user) {
          console.log('👤 User found, syncing metadata...');
          // 同步用户元数据
          await syncUserMetadata()
        } else {
          console.log('👤 No user found in session');
        }
        
        // 监听登录状态变化
        console.log('👂 Setting up auth state change listener...');
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 ================================');
            console.log('🔄 Auth状态变化:', event);
            console.log('🔄 Session user:', session?.user?.id);
            console.log('🔄 Session user email:', session?.user?.email);
            console.log('🔄 ================================');
            
            setUser(session?.user || null)
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('✅ 用户登录，同步元数据');
              await syncUserMetadata()
            } else if (event === 'SIGNED_OUT') {
              console.log('👋 用户已登出');
            }
          }
        )

        return () => {
          console.log('🧹 Cleaning up auth subscription');
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('💥 ================================');
        console.error('💥 初始化用户错误:', error);
        console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack');
        console.error('💥 ================================');
        setError(error as Error)
      } finally {
        console.log('✅ Setting loading to false');
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