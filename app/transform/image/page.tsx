"use client";

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import UploadPanel from '@/components/UploadPanel';
import PromptInput from '@/components/PromptInput';
import StyleSelector from '@/components/StyleSelector';
import GenerateButton from '@/components/GenerateButton';
import ResultDisplay from '@/components/ResultDisplay';
import { transformImage } from '@/lib/transform';
import { showError, showSuccess } from '@/lib/toast';
import type { Database } from '@/lib/database.types';

export default function TransformImagePage() {
  // Supabase客户端
  const [supabase] = useState(() => 
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  // 状态管理
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('any');
  const [followDrawingStrength, setFollowDrawingStrength] = useState<number>(9);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  
  const handleImageUpload = (url: string) => {
    console.log('Image uploaded:', url);
    setUploadedImageUrl(url);
    // 如果已经生成过结果，重置结果
    if (resultImageUrl) {
      setResultImageUrl(null);
    }
  };
  
  const handlePromptChange = (newPrompt: string) => {
    console.log('Prompt changed:', newPrompt);
    setPrompt(newPrompt);
  };
  
  const handleStyleChange = (styleId: string) => {
    console.log('Style changed:', styleId);
    setSelectedStyle(styleId);
  };
  
  const handleFollowDrawingChange = (value: number) => {
    console.log('Follow drawing strength changed:', value);
    setFollowDrawingStrength(value);
  };
  
  const handleGenerate = async () => {
    if (!uploadedImageUrl) {
      showError('Please upload a drawing first');
      return;
    }
    
    console.log('开始生成转换图像', {
      uploadedImageUrl: uploadedImageUrl.substring(0, 30) + '...',
      prompt: prompt || '(默认提示词)',
      selectedStyle: selectedStyle,
      followDrawingStrength: followDrawingStrength
    });
    
    setIsGenerating(true);
    setProgress(0);
    
    try {
      console.log('调用transformImage函数');
      
      const result = await transformImage(
        {
          imageUrl: uploadedImageUrl,
          prompt: prompt,
          styleId: selectedStyle,
          followDrawingStrength: followDrawingStrength,
        },
        (progressValue) => {
          console.log(`转换进度: ${progressValue}%`);
          setProgress(progressValue);
        }
      );
      
      console.log('transformImage函数执行完成', {
        success: result.success,
        hasOutputUrl: !!result.outputUrl,
        error: result.error
      });
      
      if (result.success && result.outputUrl) {
        setResultImageUrl(result.outputUrl);
        console.log('成功设置结果图像URL', {
          resultImageUrl: result.outputUrl.substring(0, 30) + '...'
        });
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
      console.log('生成过程结束，无论成功失败');
      setIsGenerating(false);
    }
  };
  
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
            Upload your child's drawing and watch our AI transform it into a magical digital artwork.
            Perfect for preserving and celebrating their creativity!
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
              onFollowDrawingChange={handleFollowDrawingChange}
              disabled={isGenerating}
              initialStyle={selectedStyle}
            />
            
            <GenerateButton
              onClick={handleGenerate}
              disabled={!uploadedImageUrl}
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