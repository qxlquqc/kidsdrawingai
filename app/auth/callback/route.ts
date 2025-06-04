import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  
  // 处理密码重置链接
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  
  // 检测当前环境
  const isProduction = process.env.NODE_ENV === 'production'
  
  // 如果是密码重置，优先处理
  if (tokenHash && type === 'recovery') {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // 添加环境感知的cookie选项
            const cookieOptions = {
              ...options,
              sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
              secure: isProduction,
              maxAge: options.maxAge || 60 * 60 * 24 * 7
            }
            cookieStore.set({ name, value, ...cookieOptions })
          },
          remove(name: string, options: any) {
            const cookieOptions = {
              ...options,
              sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
              secure: isProduction
            }
            cookieStore.delete({ name, ...cookieOptions })
          },
        },
      }
    )
    
    try {
      // 显式验证令牌，确保会话被创建
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      })
      
      if (error) {
        throw error
      }
      
      // 验证成功后，确认用户已登录
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Password reset token verified, user logged in:', !!user)
      
      // 重定向到密码重置页面
      console.log('Redirecting to password reset page:', next)
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error('Error processing password reset token:', error)
      return NextResponse.redirect(new URL('/login?error=invalid_reset_link', requestUrl.origin))
    }
  }
  
  // 处理OAuth回调
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // 添加环境感知的cookie选项
            const cookieOptions = {
              ...options,
              sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
              secure: isProduction,
              maxAge: options.maxAge || 60 * 60 * 24 * 7
            }
            cookieStore.set({ name, value, ...cookieOptions })
          },
          remove(name: string, options: any) {
            const cookieOptions = {
              ...options,
              sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
              secure: isProduction
            }
            cookieStore.delete({ name, ...cookieOptions })
          },
        },
      }
    )
    
    // 交换code获取会话
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      // 失败时重定向到登录页面
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }
    
    // 通过认证后，将用户重定向到目标页面
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }
  
  // 如果没有code参数，重定向到首页
  return NextResponse.redirect(new URL('/', requestUrl.origin))
} 