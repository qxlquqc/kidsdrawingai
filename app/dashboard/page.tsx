import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import UserDashboard from './user-dashboard'
import { getUserMeta, getCurrentMonthUsage, getTotalUsage, getUsageHistory } from '@/lib/supabaseApiServer'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 获取当前用户
  const { data: { user }, error } = await supabase.auth.getUser()

  // 如果没有用户或有错误，重定向到登录页面
  if (error || !user) {
    console.error('Dashboard页面错误:', error)
    redirect('/login')
  }

  // 获取用户元数据
  const userMeta = await getUserMeta(user.id);

  // 获取当月使用情况
  const monthlyUsageInfo = await getCurrentMonthUsage(user.id);

  // 获取总使用情况
  const totalGenerationCount = await getTotalUsage(user.id);
  
  // 获取用户使用历史记录
  const usageHistory = await getUsageHistory(user.id, 20);

  // 传递用户数据和使用情况到客户端组件
  return (
    <UserDashboard 
      user={user}
      userMeta={userMeta || { 
        is_paid: false, 
        plan_type: 'free',
        username: null,
        avatar_url: null,
        paid_at: undefined
      }}
      monthlyUsage={monthlyUsageInfo?.usage || 0}
      totalUsage={totalGenerationCount}
      usageHistory={usageHistory}
    />
  )
} 