import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (client) return client

  // 检测当前环境
  const isProduction = process.env.NODE_ENV === 'production'

  // 创建SSR兼容的Supabase客户端
  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // 设置根据环境调整的Cookie选项
      cookieOptions: {
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        maxAge: 60 * 60 * 24 * 7 // 7天
      }
    }
  )

  return client
} 