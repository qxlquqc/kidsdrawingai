"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import UploadPanel from '@/components/UploadPanel';
import PromptInput from '@/components/PromptInput';
import StyleSelector from '@/components/StyleSelector';
import GenerateButton from '@/components/GenerateButton';
import ResultDisplay from '@/components/ResultDisplay';
import { transformImage } from '@/lib/transform';
import { showError, showSuccess, showInfo } from '@/lib/toast';
import type { Database } from '@/lib/database.types';
import { useUser } from '@/hooks/useUser';
import { recordUsage } from '@/lib/supabaseApiBrowser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TransformImagePage() {
  // 获取当前用户
  const { user } = useUser();
  const router = useRouter();
  
  // Supabase客户端
  const [supabase] = useState(() => createClient());

  // 用户权限状态
  const [userPermissions, setUserPermissions] = useState<{
    canGenerate: boolean;
    currentUsage: number;
    limit: number;
    remaining: number;
    isPaid: boolean;
    planType: string;
    billingCycleEnd?: string;
  } | null>(null);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  // 状态管理
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('any');
  // followDrawingStrength已移除，新API不再需要此参数
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  // 检查用户权限
  useEffect(() => {
    async function checkUserPermissions() {
      if (!user?.id) {
        // 用户未登录，重定向到登录页
        router.push('/login');
        return;
      }

      try {
        // 调用服务端API检查权限
        const response = await fetch('/api/check-permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });

        if (response.ok) {
          const permissions = await response.json();
          setUserPermissions(permissions);
          
          // 如果是免费用户，显示提示
          if (permissions.planType === 'free') {
            showInfo('You need a paid plan to transform images. Choose a plan to get started!', {
              duration: 10000,
              id: 'free-plan-notice'
            });
          }
        } else {
          throw new Error('Failed to check permissions');
        }
      } catch (error) {
        console.error('检查用户权限失败:', error);
        showError('Failed to verify your account. Please try again.');
      } finally {
        setIsCheckingPermissions(false);
      }
    }

    checkUserPermissions();
  }, [user, router]);
  
  const handleImageUpload = (url: string) => {
    setUploadedImageUrl(url);
    // 如果已经生成过结果，重置结果
    if (resultImageUrl) {
      setResultImageUrl(null);
    }
  };
  
  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
  };
  
  const handleStyleChange = (styleId: string) => {
    setSelectedStyle(styleId);
  };
  
  // handleFollowDrawingChange已移除，新API不再需要此功能
  
  const handleGenerate = async () => {
    // 预检查权限
    if (!userPermissions) {
      showError('Please wait while we verify your account...');
      return;
    }

    if (!userPermissions.canGenerate) {
      if (userPermissions.planType === 'free') {
        showError('You need a paid plan to transform images. Choose a plan to get started!', {
          action: {
            label: 'Choose Plan',
            onClick: () => router.push('/pricing')
          }
        });
        return;
      } else {
        // 付费用户达到月度限制的详细提示
        const resetDate = userPermissions.billingCycleEnd ? 
          new Date(userPermissions.billingCycleEnd).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric' 
          }) : 'next month';
          
        showError(`You've reached your monthly limit of ${userPermissions.limit} transformations. Your limit will reset on ${resetDate}. You can upgrade to a higher plan for more transformations.`, {
          duration: 10000,
          action: {
            label: 'Upgrade Plan',
            onClick: () => router.push('/pricing')
          }
        });
        return;
      }
    }

    // 新的API支持只使用prompt生成，或图片+prompt转换
    if (!uploadedImageUrl && !prompt.trim()) {
      showError('Please upload an image or enter a prompt to generate');
      return;
    }
    

    
    setIsGenerating(true);
    setProgress(0);
    
    try {
              const result = await transformImage(
        {
          imageUrl: uploadedImageUrl || '', // 提供空字符串作为默认值
          prompt: prompt,
          styleId: selectedStyle,
        },
        (progressValue) => {
          setProgress(progressValue);
        }
      );
      

      
      if (result.success && result.outputUrl) {
        setResultImageUrl(result.outputUrl);
        
        // 记录用户使用次数
        if (user?.id) {
          try {
            await recordUsage(user.id);
            
            // 更新权限状态
            const newUsage = userPermissions.currentUsage + 1;
            setUserPermissions({
              ...userPermissions,
              currentUsage: newUsage,
              remaining: Math.max(0, userPermissions.limit - newUsage),
              canGenerate: newUsage < userPermissions.limit
            });
          } catch (usageError) {
            console.error('记录用户使用次数失败:', usageError);
            // 不阻止主流程，只记录错误
          }
        } else {
          
        }
        
        showSuccess('Your drawing has been transformed successfully!');
      } else {
        console.error('转换失败，没有输出URL', { error: result.error });
        throw new Error(result.error || 'Failed to transform image');
      }
    } catch (error: any) {
      console.error('生成错误:', error);
      showError(`Failed to transform: ${error.message}`);
      setResultImageUrl(null);
    } finally {
      
      setIsGenerating(false);
    }
  };

  // 权限检查中的加载状态
  if (isCheckingPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your account...</p>
        </div>
      </div>
    );
  }

  // 免费用户显示升级提示
  if (userPermissions?.planType === 'free') {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8">
            <div className="text-6xl mb-6">🎨</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose a Plan to Start Creating</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Transform your children's drawings into magical digital artwork with our AI-powered tool.
              Choose a plan that fits your family's creative needs.
            </p>
            <div className="space-y-4">
              <Link 
                href="/pricing"
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-lg transition transform hover:scale-105"
              >
                Choose Your Plan
              </Link>
              <div className="text-sm text-gray-500">
                <Link href="/dashboard" className="underline hover:text-purple-600">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 已达到使用限制的付费用户
  if (userPermissions && !userPermissions.canGenerate && userPermissions.planType !== 'free') {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Monthly Limit Reached</h2>
            <p className="text-gray-600 mb-6 text-lg">
              You've used all {userPermissions.limit} transformations for this month. 
              Your limit will reset next month, or you can upgrade to a higher plan for more transformations.
            </p>
            <div className="space-y-4">
              <Link 
                href="/pricing"
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium rounded-lg transition transform hover:scale-105"
              >
                Upgrade Plan
              </Link>
              <div className="text-sm text-gray-500">
                <Link href="/dashboard" className="underline hover:text-purple-600">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Abstract Shapes Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-pink-100 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-100 opacity-40 blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-blue-100 opacity-30 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-8 glass-card p-6 rounded-2xl shadow-sm">
          <h1 className="text-4xl font-bold mb-3 gradient-text">Transform Your Drawing</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload your child's drawing or simply describe what you want to create! 
            Our AI will transform it into magical digital artwork. Perfect for preserving and celebrating creativity!
          </p>
        </div>
        
        {/* 单列居中布局 */}
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-2xl shadow-md border border-white/30">
          <div className="space-y-8">
            <UploadPanel
              onImageUploaded={handleImageUpload}
              supabaseClient={supabase}
            />
            
            <PromptInput
              onChange={handlePromptChange}
              disabled={isGenerating}
            />
            
            <StyleSelector
              onChange={handleStyleChange}
              disabled={isGenerating}
              initialStyle={selectedStyle}
            />
            
            <GenerateButton
              onClick={handleGenerate}
              disabled={!uploadedImageUrl && !prompt.trim()}
              isGenerating={isGenerating}
              progress={progress}
            />
          </div>
        </div>
        
        {/* 结果显示区域 - 生成后出现在中央 */}
        {resultImageUrl && (
          <div className="mt-12 animate-fadeIn">
            <ResultDisplay
              imageUrl={resultImageUrl}
              originalImageUrl={uploadedImageUrl}
              prompt={prompt}
            />
          </div>
        )}
      </div>
    </div>
  );
} 