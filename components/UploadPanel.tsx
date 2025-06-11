"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadToSupabase } from '@/lib/uploadToSupabase';
import { showError, showLoading, updateToast, showSuccess, dismissToast } from '@/lib/toast';
import { TypedSupabaseClient } from '@/lib/supabase';

interface UploadPanelProps {
  onImageUploaded: (imageUrl: string) => void;
  supabaseClient: TypedSupabaseClient;
}

export default function UploadPanel({ onImageUploaded, supabaseClient }: UploadPanelProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (isUploading) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // 显示文件大小检查提示
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 4) {
      showError(`File size (${fileSizeMB.toFixed(1)}MB) exceeds the 5MB limit. Please choose a smaller file.`);
      setIsUploading(false);
      return;
    }
    
    // 创建可以取消的Toast
    const toastId = showLoading('Preparing your drawing...');
    
    // 模拟上传进度更新
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        // 最多更新到95%，保留最后5%给真正的完成阶段
        const newProgress = prev + (95 - prev) * 0.2;
        if (newProgress > 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return newProgress;
      });
    }, 500);
    
    try {
      // 更新Toast提示
      setTimeout(() => {
        updateToast(String(toastId), 'Uploading your drawing...', 'info');
      }, 800);
      
      // 上传到Supabase Storage
      const imageUrl = await uploadToSupabase({
        file,
        bucketName: 'uploads',
        supabaseClient,
      });
      
      // 完成最后的进度
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      // 关闭加载Toast，显示成功Toast
      dismissToast(String(toastId));
      showSuccess('Drawing uploaded successfully!');
      
      // 设置预览图
      setPreviewImage(URL.createObjectURL(file));
      onImageUploaded(imageUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      clearInterval(progressInterval);
      
      // 显示更详细的错误信息
      dismissToast(String(toastId));
      if (error.message.includes('timeout')) {
        showError('Upload timed out. Please check your internet connection and try again.');
      } else if (error.message.includes('size')) {
        showError('File size too large. Please upload an image under 5MB.');
      } else {
        showError(`Upload failed: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
      clearInterval(progressInterval);
    }
  };

  // 处理拖放事件
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // 处理文件放置
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // 检查文件类型
      if (!file.type.match('image.*')) {
        showError('Please upload an image file (JPG, PNG, etc.)');
        return;
      }
      
      handleFileUpload(file);
    }
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  };

  // 打开文件选择器
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`
          border-2 border-dashed rounded-xl p-6
          flex flex-col items-center justify-center
          transition-all duration-300
          ${dragActive ? 'border-[#ff6b9d] bg-[#ff6b9d]/5' : 'border-gray-300'} 
          ${previewImage ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}
          cursor-pointer
          aspect-square
          shadow-sm
        `}
        onClick={openFileSelector}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        {previewImage ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image 
              src={previewImage}
              alt="Preview"
              className="rounded-lg object-contain w-full h-full"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 384px"
              style={{ objectFit: 'contain' }}
              priority
              quality={85}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center">
                <div className="animate-pulse text-[#a17ef5] font-bold mb-2">Uploading...</div>
                <div className="w-4/5 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5]"
                    style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6 text-6xl float-animation">
              ✏️
            </div>
            <p className="mb-3 text-xl font-medium text-gray-700">
              {isUploading ? 'Uploading...' : 'Upload Your Drawing'}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop or click to browse
            </p>
            
            {isUploading ? (
              <div className="mt-4 w-full">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5] animate-pulse"
                    style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</div>
              </div>
            ) : (
            <div className="mt-6 px-6 py-2 inline-block rounded-lg bg-white border border-gray-200 text-gray-500 text-sm">
                JPG or PNG under 5MB
            </div>
            )}
          </div>
        )}
      </div>
      
      {previewImage && (
        <div className="mt-4 text-center">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5] font-medium">Drawing uploaded successfully!</p>
          <button
            className="mt-2 text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5] hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            Upload a different drawing
          </button>
        </div>
      )}
    </div>
  );
} 