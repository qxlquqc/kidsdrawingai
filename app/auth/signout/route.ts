import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  
  // 检查用户是否已登录
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // 登出用户
    await supabase.auth.signOut()
  }
  
  // 重新验证所有页面
  revalidatePath('/', 'layout')
  
  // 重定向到首页
  return NextResponse.redirect(new URL('/', req.url), {
    status: 302,
  })
} 