"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadToSupabase } from '@/lib/uploadToSupabase';
import { showError, showLoading, updateToast } from '@/lib/toast';
import { TypedSupabaseClient } from '@/lib/supabase';

interface UploadPanelProps {
  onImageUploaded: (imageUrl: string) => void;
  supabaseClient: TypedSupabaseClient;
}

export default function UploadPanel({ onImageUploaded, supabaseClient }: UploadPanelProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (isUploading) return;
    
    setIsUploading(true);
    const toastId = showLoading('Uploading your drawing...');
    
    try {
      // 上传到Supabase Storage
      const imageUrl = await uploadToSupabase({
        file,
        bucketName: 'uploads',
        supabaseClient,
      });
      
      // 更新Toast并设置预览图
      updateToast(toastId, 'Drawing uploaded successfully!', 'success');
      setPreviewImage(URL.createObjectURL(file));
      onImageUploaded(imageUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      updateToast(toastId, `Upload failed: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
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
        showError('Please upload an image file');
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
              style={{ objectFit: 'contain' }}
              priority
            />
            {isUploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <div className="animate-pulse text-[#a17ef5] font-bold">Uploading...</div>
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
            
            <div className="mt-6 px-6 py-2 inline-block rounded-lg bg-white border border-gray-200 text-gray-500 text-sm">
              Children's drawings work best!
            </div>
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