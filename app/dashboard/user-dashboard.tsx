'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { showSuccess, showInfo, toast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/Avatar'

interface UserDashboardProps {
  user: User
  userMeta: {
    is_paid: boolean
    paid_at?: string
    username?: string
    avatar_url?: string
    plan_type?: string
  }
  monthlyUsage: number
  totalUsage: number
  usageHistory: {
    date: string
    generation_count: number
  }[]
}

export default function UserDashboard({ user, userMeta, monthlyUsage, totalUsage, usageHistory }: UserDashboardProps) {
  const { signOut } = useUser()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isManagingSubscription, setIsManagingSubscription] = useState(false)

  // 用户信息显示格式化
  const username = userMeta.username || user.email?.split('@')[0] || 'User'
  const avatarUrl = userMeta.avatar_url
  
  // 获取套餐信息
  const planType = userMeta.plan_type || 'free'
  const getPlanInfo = (planType: string) => {
    const planMap = {
      'free': { name: 'Free Plan', monthlyLimit: 0, displayPrice: 'Free' },
      'starter_monthly': { name: 'Starter Plan', monthlyLimit: 50, displayPrice: '$7.99/month' },
      'starter_yearly': { name: 'Starter Plan (yearly)', monthlyLimit: 50, displayPrice: '$59/year' },
      'explorer_monthly': { name: 'Explorer Plan', monthlyLimit: 200, displayPrice: '$14.99/month' },
      'explorer_yearly': { name: 'Explorer Plan (yearly)', monthlyLimit: 200, displayPrice: '$99/year' },
      'creator_monthly': { name: 'Creator Plan', monthlyLimit: 500, displayPrice: '$30/month' },
      'creator_yearly': { name: 'Creator Plan (yearly)', monthlyLimit: 500, displayPrice: '$199/year' }
    };
    return planMap[planType as keyof typeof planMap] || planMap['free'];
  };
  
  const planInfo = getPlanInfo(planType);
  
  // 计算订阅状态
  const subscriptionStatus = userMeta.is_paid ? 'Active' : 'Free'
  const usageLimit = planInfo.monthlyLimit
  const usagePercentage = usageLimit > 0 ? Math.min(100, (monthlyUsage / usageLimit) * 100) : 0

  // 计算总使用限制 - 根据套餐调整
  const totalUsageLimit = planInfo.monthlyLimit * 12 // 年度估算

  // 检查并显示使用限制提示
  const checkAndShowUsageAlert = () => {
    if (planType === 'free') {
      showInfo('You need a paid plan to start transforming images. Choose a plan to get started!', {
        duration: 8000,
        id: 'free-plan-notice'
      });
    } else if (monthlyUsage >= usageLimit) {
      showInfo(`You've reached your monthly limit of ${usageLimit} transformations. Your limit will reset next month.`, {
        duration: 8000,
        id: 'usage-limit-reached'
      });
    } else if (monthlyUsage >= usageLimit * 0.8) {
      showInfo(`You're approaching your monthly limit! ${monthlyUsage} of ${usageLimit} transformations used.`, {
        duration: 6000,
        id: 'usage-limit-warning'
      });
    }
  };

  // 当组件挂载时检查使用情况
  useEffect(() => {
    checkAndShowUsageAlert();
  }, [monthlyUsage, usageLimit, planType]);

  // 处理登出
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const loadingToast = toast.loading('Logging out...')
      await signOut()
      toast.dismiss(loadingToast)
      showSuccess('Successfully logged out')
      router.push('/')
    } catch (error) {
      console.error('登出错误:', error)
      toast.error('Failed to log out. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // 处理转换页面跳转
  const handleTransformClick = () => {
    // 免费用户需要先升级
    if (planType === 'free') {
      toast.error("You need a paid plan to transform images. Choose a plan to get started!", {
        action: {
          label: 'Choose Plan',
          onClick: () => router.push('/pricing')
        }
      });
      return;
    }
    
    // 如果用户已达到月度限制，显示提示
    if (monthlyUsage >= usageLimit) {
      toast.error(`You've reached your monthly limit of ${usageLimit} transformations. Your limit will reset next month.`, {
        action: {
          label: 'Upgrade Plan',
          onClick: () => router.push('/pricing')
        }
      });
      return;
    }
    
    // 如果没有达到限制，正常导航
    router.push('/transform/image');
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // 处理管理订阅
  const handleManageSubscription = async () => {
    console.log('🎛️ ================================');
    console.log('🎛️ Manage Subscription button clicked');
    console.log('🎛️ User ID:', user.id);
    console.log('🎛️ User email:', user.email);
    console.log('🎛️ Plan type:', userMeta.plan_type);
    console.log('🎛️ Is paid:', userMeta.is_paid);
    console.log('🎛️ Timestamp:', new Date().toISOString());
    console.log('🎛️ ================================');

    setIsManagingSubscription(true);

    try {
      // 调用Customer Portal API
      console.log('🛒 Calling Customer Portal API...');
      const response = await fetch('/api/creem/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Customer Portal API response status:', response.status);
      
      const data = await response.json();
      console.log('📡 Customer Portal API response data:', data);

      if (!response.ok) {
        console.error('❌ Customer Portal API failed:', data);
        
        // 特殊处理测试用户
        if (data.is_test_user) {
          toast.error("Billing portal is not available for test accounts. This feature works with real subscriptions.", {
            duration: 6000,
            action: {
              label: 'Learn More',
              onClick: () => window.open('https://docs.creem.io/learn/customers/customer-portal', '_blank')
            }
          });
          return;
        }
        
        // 处理其他错误
        throw new Error(data.error || 'Failed to access billing portal');
      }

      // 重定向到Customer Portal
      if (data.customer_portal_link) {
        console.log('🔗 Redirecting to Customer Portal:', data.customer_portal_link);
        toast.success("Opening billing portal...", { duration: 3000 });
        
        // 在新窗口打开，避免用户失去当前页面
        const newWindow = window.open(data.customer_portal_link, '_blank');
        
        // 检查弹窗是否被阻止
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          toast.error("Pop-up blocked. Please allow pop-ups for this site or copy the link manually.", {
            duration: 8000,
            action: {
              label: 'Copy Link',
              onClick: () => {
                navigator.clipboard.writeText(data.customer_portal_link);
                toast.success("Link copied to clipboard!");
              }
            }
          });
        }
      } else {
        console.error('❌ No customer portal link in response:', data);
        throw new Error('No billing portal link received');
      }

    } catch (error) {
      console.error('💥 Manage subscription error:', error);
      
      if (error instanceof Error && error.message.includes('customer portal not available')) {
        // 已经在上面处理了测试用户的情况
        return;
      }
      
      toast.error(error instanceof Error ? error.message : "Failed to access billing portal. Please try again or contact support.", {
        duration: 6000
      });
    } finally {
      setIsManagingSubscription(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* 用户信息卡 */}
        <div className="w-full md:w-1/3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <Avatar 
                src={avatarUrl}
                name={username}
                size={96}
                className="border-2 border-purple-200"
              />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800">{username}</h2>
            <p className="text-gray-500 mb-2">{user.email}</p>
            
            <div className="flex gap-2 mt-4">
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition"
              >
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </button>
              
              <Link 
                href="/login?type=forgotten_password" 
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-700 font-medium transition"
              >
                Change Password
              </Link>
            </div>
          </div>
        </div>
        
        {/* 使用统计卡 */}
        <div className="w-full md:w-2/3">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Dashboard</h2>
          
          {/* 订阅状态 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Subscription Status</h3>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="block text-xl font-bold">{planInfo.name}</span>
                <span className={`text-sm ${userMeta.is_paid ? 'text-green-600' : 'text-gray-500'}`}>
                  {subscriptionStatus}
                </span>
              </div>
              
              <div className="flex gap-2">
                {!userMeta.is_paid ? (
                <Link 
                  href="/pricing" 
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-lg transition transform hover:scale-105"
                >
                  Choose Plan
                </Link>
                ) : (
                  <>
                    <button
                      onClick={handleManageSubscription}
                      disabled={isManagingSubscription}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition transform hover:scale-105 disabled:transform-none"
                    >
                      {isManagingSubscription ? 'Loading...' : 'Manage Subscription'}
                    </button>
                    <Link 
                      href="/pricing" 
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-lg transition transform hover:scale-105"
                    >
                      Upgrade Plan
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* 使用情况 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Monthly Usage</h3>
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span>{monthlyUsage} / {usageLimit}</span>
                  <span>{usageLimit > 0 ? Math.round(usagePercentage) : 0}%</span>
                </div>
                {usageLimit > 0 ? (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${usagePercentage > 80 ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                      style={{ width: `${usagePercentage}%` }}
                    ></div>
                  </div>
                ) : (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-gray-300 w-0"></div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {planType === 'free' 
                  ? 'You need a paid plan to transform images.'
                  : `Your ${planInfo.name} includes ${usageLimit} transformations per month.`}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Usage</h3>
              <p className="text-3xl font-bold">{totalUsage} <span className="text-lg text-gray-500">/ {totalUsageLimit}</span></p>
              <p className="text-sm text-gray-500 mt-2">All-time transformations used</p>
            </div>
          </div>
          
          {/* 快速链接 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleTransformClick}
                className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-left"
              >
                <span className="text-2xl mr-3">🎨</span>
                <div>
                  <span className="block font-medium">Transform Images</span>
                  <span className="text-sm text-gray-500">Convert drawings to magic</span>
                </div>
              </button>
              
              <Link 
                href="/pricing" 
                className="flex items-center p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition"
              >
                <span className="text-2xl mr-3">⭐</span>
                <div>
                  <span className="block font-medium">Pricing Plans</span>
                  <span className="text-sm text-gray-500">Compare subscription options</span>
                </div>
              </Link>
            </div>
          </div>
          
          {/* 生成历史记录 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Generation History</h3>
            {usageHistory.length > 0 ? (
              <div className="overflow-auto max-h-96 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Generations</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usageHistory.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-sm text-gray-700">{formatDate(item.date)}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 text-right">{item.generation_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No generation history yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 