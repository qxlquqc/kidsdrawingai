import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// 创建服务端Supabase客户端
export async function createClient() {
  const cookieStore = await cookies()
  
  // 检测当前环境
  const isProduction = process.env.NODE_ENV === 'production'

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            // 添加环境感知的cookie选项，与middleware.ts和supabase-browser.ts保持一致
            const cookieOptions = {
              ...options,
              sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
              secure: isProduction,
              maxAge: options.maxAge || 60 * 60 * 24 * 7 // 7天
            }
            cookieStore.set({ name, value, ...cookieOptions })
          } catch (error) {
            // 在某些上下文中，Next.js可能无法设置cookies
            console.error('Failed to set cookie:', error)
          }
        },
        remove(name, options) {
          try {
            // 添加环境感知的cookie选项
            const cookieOptions = {
              ...options,
              sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
              secure: isProduction
            }
            cookieStore.delete({ name, ...cookieOptions })
          } catch (error) {
            console.error('Failed to delete cookie:', error)
          }
        },
      },
    }
  )
} 