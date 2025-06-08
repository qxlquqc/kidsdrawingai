import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import UserDashboard from './user-dashboard'
import { getUserMeta, getCurrentMonthUsage, getTotalUsage, getUsageHistory } from '@/lib/supabaseApiServer'

export default async function DashboardPage() {
  console.log('🏠 ================================');
  console.log('🏠 Dashboard page accessed');
  console.log('🏠 Timestamp:', new Date().toISOString());
  console.log('🏠 ================================');
  
  const supabase = await createClient()

  // 获取当前用户
  console.log('👤 Getting current user...');
  const { data: { user }, error } = await supabase.auth.getUser()

  console.log('👤 User auth result:');
  console.log('👤 User ID:', user?.id);
  console.log('👤 User email:', user?.email);
  console.log('👤 Auth error:', error);
  console.log('👤 User metadata:', user?.user_metadata);

  // 如果没有用户或有错误，重定向到登录页面
  if (error || !user) {
    console.error('❌ ================================');
    console.error('❌ Dashboard页面错误:', error);
    console.error('❌ No user found, redirecting to login');
    console.error('❌ ================================');
    redirect('/login')
  }

  console.log('✅ User authenticated, fetching user metadata...');

  // 获取用户元数据
  const userMeta = await getUserMeta(user.id);
  console.log('📋 User metadata from database:', userMeta);

  // 获取当月使用情况
  const monthlyUsageInfo = await getCurrentMonthUsage(user.id);
  console.log('📊 Monthly usage info:', monthlyUsageInfo);

  // 获取总使用情况
  const totalGenerationCount = await getTotalUsage(user.id);
  console.log('📊 Total usage count:', totalGenerationCount);
  
  // 获取用户使用历史记录
  const usageHistory = await getUsageHistory(user.id, 20);
  console.log('📊 Usage history (first 3):', usageHistory?.slice(0, 3));

  console.log('🏠 ================================');
  console.log('🏠 Dashboard data prepared successfully');
  console.log('🏠 Final user meta to be displayed:');
  console.log('🏠 Plan type:', userMeta?.plan_type || 'free');
  console.log('🏠 Is paid:', userMeta?.is_paid || false);
  console.log('🏠 Paid at:', userMeta?.paid_at);
  console.log('🏠 ================================');

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