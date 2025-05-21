import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// 创建服务端Supabase客户端
export async function createClient() {
  const cookieStore = cookies()

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
            cookieStore.set(name, value, options)
          } catch (error) {
            // 在某些上下文中，Next.js可能无法设置cookies
            console.error('Failed to set cookie:', error)
          }
        },
        remove(name, options) {
          try {
            cookieStore.delete(name, options)
          } catch (error) {
            console.error('Failed to delete cookie:', error)
          }
        },
      },
    }
  )
} 