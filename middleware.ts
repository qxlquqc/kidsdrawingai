import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 创建带有cookies支持的supabase客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 使用getUser而不是getSession，确保会话得到刷新
  const { data: { user } } = await supabase.auth.getUser()
  
  // 检查受保护路由
  const url = new URL(request.url)
  const isDashboardRoute = url.pathname.startsWith('/dashboard')
  
  // 检查是否为密码重置相关路由
  const isResetPasswordRoute = url.pathname.startsWith('/reset-password')
  const isAuthCallbackWithReset = 
    url.pathname.startsWith('/auth/callback') && 
    url.searchParams.get('type') === 'recovery'
  
  // 记录密码重置相关路径的调试信息
  if (isAuthCallbackWithReset) {
    console.log('Middleware detected password reset callback:', url.pathname, url.search)
  }
  
  // 如果是需要认证的路由但用户未登录，重定向到登录页
  // 注意：密码重置相关路由不需要认证
  if (isDashboardRoute && !user && !isResetPasswordRoute && !isAuthCallbackWithReset) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

// 指定应用中间件的路径，排除静态资源
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - 静态文件（_next/static, favicon.ico等）
     * - 媒体文件（图片、视频等）
     * - auth回调路径（处理OAuth回调）
     * - reset-password路径（处理密码重置）
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|reset-password|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 