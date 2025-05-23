'use client'

import { useAuthListener } from '@/lib/authListener'
import { useUser } from '@/hooks/useUser'

/**
 * 该组件用于监听跨标签页的认证状态变化
 * 不渲染任何UI，只是处理状态同步
 */
export default function AuthStateListener() {
  const { user, syncUserMetadata } = useUser()
  
  // 使用Auth监听器，处理跨标签页状态变化
  useAuthListener((isAuthenticated) => {
    // 如果用户已登录且有新的认证状态变化
    if (user && isAuthenticated) {
      // 同步用户元数据（确保最新状态）
      syncUserMetadata()
    }
    
    // 如果检测到从登录变为登出状态，页面将刷新
    // 刷新是由useUser钩子中的onAuthStateChange处理的
  })
  
  // 不渲染任何UI
  return null
} 