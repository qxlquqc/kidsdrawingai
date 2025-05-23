'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { showSuccess, showError } from '@/lib/toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  const supabase = createClient()
  
  // 检查用户是否已通过recovery链接登录
  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Checking user authentication status...')
        
        // 检查URL中是否有token_hash参数，如果有则是从邮件链接过来的
        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        
        if (tokenHash && type === 'recovery') {
          console.log('Password reset token detected in URL, handling recovery')
          
          // 如果URL中有token_hash但还没处理，尝试验证OTP
          try {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery',
            })
            
            if (error) {
              console.error('Failed to verify recovery token:', error)
              setMessage('Password reset link is invalid or has expired.')
              setIsCheckingAuth(false)
              return
            }
            
            console.log('Token verified successfully')
          } catch (err) {
            console.error('Error verifying token:', err)
          }
        }
        
        // 检查用户是否已登录
        const { data: { user } } = await supabase.auth.getUser()
        console.log('User authentication status:', user ? 'logged in' : 'not logged in', user?.email)
        
        if (user) {
          setIsLoggedIn(true)
        } else {
          // 尝试刷新会话
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.log('Failed to refresh session:', refreshError)
            setMessage('Please click the password reset link in your email first.')
            router.push('/login')
            return
          }
          
          // 再次检查用户状态
          const { data: { user: refreshedUser } } = await supabase.auth.getUser()
          if (refreshedUser) {
            setIsLoggedIn(true)
          } else {
            setMessage('Please click the password reset link in your email first.')
            router.push('/login')
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        setMessage('An error occurred while checking your authentication status.')
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkUser()
  }, [router, supabase, searchParams])
  
  // 处理重置密码提交
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证密码匹配
    if (password !== confirmPassword) {
      showError('Passwords do not match')
      return
    }
    
    // 验证密码强度
    if (password.length < 6) {
      showError('Password must be at least 6 characters')
      return
    }
    
    try {
      setLoading(true)
      
      // 调用Supabase更新密码
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        throw error
      }
      
      showSuccess('Password has been successfully reset!')
      setMessage('Your password has been updated successfully.')
      
      // 短暂延迟后重定向到首页
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Password reset error:', error)
      showError('Password reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-full max-w-md glass-card bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-lg border border-white/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Reset Your Password</h1>
          <p className="text-gray-600">
            Choose a new password for your account
          </p>
        </div>
        
        {message ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            {message}
          </div>
        ) : isCheckingAuth ? (
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authorization...</p>
          </div>
        ) : isLoggedIn ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your new password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm your new password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-red-500 mb-4">Authentication required to reset password.</p>
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition"
            >
              Go to login page
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 