"use client";

import { useState } from 'react';
import Image from 'next/image';
import { downloadImage } from '@/lib/downloadBlob';
import { showError, showSuccess } from '@/lib/toast';
import { 
  FacebookShareButton, TwitterShareButton, PinterestShareButton, 
  FacebookIcon, TwitterIcon, PinterestIcon
} from 'react-share';

interface ResultDisplayProps {
  imageUrl: string | null;
  originalImageUrl: string | null;
  prompt: string;
}

export default function ResultDisplay({
  imageUrl,
  originalImageUrl,
  prompt,
}: ResultDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  
  if (!imageUrl) return null;
  
  const handleDownload = async () => {
    if (!imageUrl || isDownloading) return;
    
    setIsDownloading(true);
    try {
      await downloadImage(imageUrl, `kidsdrawingai-${Date.now()}.png`);
      showSuccess('Image downloaded successfully!');
    } catch (error: any) {
      console.error('Download error:', error);
      showError(`Failed to download: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };
  
  // 分享URL和标题
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = 'Check out this drawing transformation by KidsDrawingAI!';
  const shareDescription = prompt || 'AI-transformed children\'s drawing';
  
  return (
    <div className="w-full rounded-xl p-6 border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center gradient-text">Your Transformed Drawing</h2>
      
      <div className="relative mx-auto rounded-lg overflow-hidden bg-transparent">
        <div className="w-full max-w-2xl mx-auto aspect-square relative">
          <Image
            src={imageUrl}
            alt="Transformed drawing"
            className="object-contain rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20"
            fill
            sizes="(max-width: 768px) 100vw, 512px"
            priority
          />
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <button
          className={`
            flex items-center px-6 py-3 rounded-lg 
            bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5] text-white font-medium
            shadow-sm hover:shadow-md transition-all
            ${isDownloading ? 'opacity-70' : 'hover-scale'}
          `}
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {isDownloading ? 'Downloading...' : 'Download'}
        </button>
        
        <div className="flex gap-3">
          <FacebookShareButton 
            url={shareUrl} 
            className="hover-scale"
          >
            <FacebookIcon size={40} round />
          </FacebookShareButton>
          
          <TwitterShareButton url={shareUrl} title={shareTitle} className="hover-scale">
            <TwitterIcon size={40} round />
          </TwitterShareButton>
          
          <PinterestShareButton url={shareUrl} media={imageUrl} description={shareDescription} className="hover-scale">
            <PinterestIcon size={40} round />
          </PinterestShareButton>
        </div>
      </div>
    </div>
  );
} 