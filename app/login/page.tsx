'use client';

import { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase-browser';
import { useRouter, useSearchParams } from 'next/navigation';
import { showSuccess, toast } from '@/lib/toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createClient());
  const [isLoading, setIsLoading] = useState(true);
  
  // 获取type参数，用于确定显示哪种验证视图
  const type = searchParams.get('type');
  // 确定初始视图
  const initialView = type === 'forgotten_password' ? 'forgotten_password' : undefined;
  
  // 检查用户是否已登录，如果已登录则重定向到首页
  useEffect(() => {
    const checkUser = async () => {
      try {
        // 如果是重置密码视图，则不检查登录状态
        if (type === 'forgotten_password') {
          setIsLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('获取用户状态错误:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, [router, supabase, type]);

  // 处理登录状态变化
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('登录状态变化:', event);
      
      if (event === 'SIGNED_IN' && session) {
        // 如果是在重置密码视图，则不自动重定向
        if (type === 'forgotten_password') {
          console.log('用户已登录但在重置密码页面，不重定向');
          return;
        }
        
        // 显示加载中的toast，稍后关闭
        const loadingToast = toast.loading('Signing you in...');
        
        // 登录成功后，先同步一下用户信息到user_usage表
        const syncUserUsage = async () => {
          try {
            // 确保有会话并获取用户信息
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            // 检查user_usage表是否有今天的记录
            const today = new Date().toISOString().split('T')[0]; // 格式: YYYY-MM-DD
            const { data: existingRecord } = await supabase
              .from('user_usage')
              .select('*')
              .eq('user_id', user.id)
              .eq('date', today)
              .single();
            
            // 如果没有今天的记录，则创建一条
            if (!existingRecord) {
              await supabase
                .from('user_usage')
                .insert({ 
                  user_id: user.id,
                  date: today,
                  generation_count: 0
                });
              console.log('已为用户创建今日使用记录');
            }
          } catch (error) {
            console.error('同步用户使用记录失败:', error);
          }
        };
        
        // 执行同步操作并导航
        syncUserUsage().then(() => {
          // 关闭加载toast
          toast.dismiss(loadingToast);
          // 显示登录成功消息
          showSuccess('Successfully signed in!');
          // 导航到仪表板页面
          router.push('/dashboard');
        });
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, type]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-full max-w-md glass-card bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-lg border border-white/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            {initialView === 'forgotten_password' ? 'Reset Your Password' : 'Welcome Back!'}
          </h1>
          <p className="text-gray-600">
            {initialView === 'forgotten_password' 
              ? 'Enter your email to receive a password reset link' 
              : 'Sign in to transform your kid\'s drawings into magical creations'}
          </p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          view={initialView}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#a17ef5',
                  brandAccent: '#ff6b9d',
                  brandButtonText: 'white',
                }
              }
            },
            style: {
              button: {
                borderRadius: '0.5rem',
                fontSize: '16px',
                fontWeight: '600',
                padding: '10px 15px',
              },
              input: {
                borderRadius: '0.5rem',
                fontSize: '16px',
                padding: '10px 15px',
              },
            } 
          }}
          providers={['google']}
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
          localization={{
            variables: {
              sign_up: {
                email_label: 'Email Address',
                password_label: 'Create a Password',
                button_label: 'Sign Up',
                social_provider_text: 'Sign up with {{provider}}',
                link_text: 'Don\'t have an account? Sign up',
              },
              sign_in: {
                email_label: 'Email Address',
                password_label: 'Your Password',
                button_label: 'Sign In',
                social_provider_text: 'Sign in with {{provider}}',
                link_text: 'Already have an account? Sign in',
              },
              forgotten_password: {
                email_label: 'Email Address',
                password_label: 'Your Password',
                button_label: 'Send Reset Link',
                link_text: 'Forgot your password?',
              },
            }
          }}
        />
      </div>
    </div>
  );
} 