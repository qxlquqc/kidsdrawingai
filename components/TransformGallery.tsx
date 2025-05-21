"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 图库数据
const galleryData = [
  {
    id: "1",
    title: "Fantasy Castle",
    description: "A magical castle with towers and dragons" 
  },
  {
    id: "2",
    title: "Space Rocket",
    description: "An intergalactic spaceship adventure" 
  },
  {
    id: "3",
    title: "Dinosaur Park",
    description: "Prehistoric creatures come to life" 
  },
  {
    id: "4",
    title: "Fairy Garden",
    description: "Magical forest with tiny fairies" 
  }
];

export default function TransformGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % galleryData.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % galleryData.length);
  };
  
  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + galleryData.length) % galleryData.length);
  };

  // 图片加载处理
  const handleImageLoad = (id: string) => {
    setImagesLoaded(prev => ({ ...prev, [id]: true }));
  };

  // 图片错误处理
  const handleImageError = (id: string) => {
    setImagesLoaded(prev => ({ ...prev, [id]: false }));
  };

  // 检查图片是否已加载
  const isImageLoaded = (id: string) => {
    return imagesLoaded[id] === true;
  };

  const currentId = galleryData[activeIndex].id;

  return (
    <div className="w-full">
      {/* 主展示区 */}
      <div className="mb-8 glass-card p-6 rounded-2xl shadow-lg hover-scale transition-all overflow-hidden relative">
        {/* 移除标题和描述区域 */}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 原始草图 - 现在是单独的一格 */}
          <div className="aspect-square relative rounded-lg overflow-hidden shadow-md">
            <div className="relative w-full h-full">
              {/* 图片加载时显示占位符 */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              </div>

              {/* 实际图片 */}
              <Image 
                src={`/images/gallery/sketch${currentId}.jpg`}
                alt={`Original sketch of ${galleryData[activeIndex].title}`}
                fill
                className={`object-cover transition-opacity duration-300 
                  ${isImageLoaded(`sketch${currentId}`) ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => handleImageLoad(`sketch${currentId}`)}
                onError={() => handleImageError(`sketch${currentId}`)}
              />
            </div>
          </div>
          
          {/* 生成图 - 现在与草图大小一致 */}
          {[1, 2, 3].map((num) => (
            <div key={num} className="aspect-square relative rounded-lg overflow-hidden shadow-md hover-scale">
              <div className="relative w-full h-full">
                {/* 图片加载时显示占位符 */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>

                {/* 实际图片 */}
                <Image 
                  src={`/images/gallery/style${currentId}-${num}.jpg`}
                  alt={`${galleryData[activeIndex].title} style variation ${num}`}
                  fill
                  className={`object-cover transition-opacity duration-300 
                    ${isImageLoaded(`style${currentId}-${num}`) ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => handleImageLoad(`style${currentId}-${num}`)}
                  onError={() => handleImageError(`style${currentId}-${num}`)}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* 箭头导航 - 仅桌面显示 */}
        <div className="hidden md:flex justify-between absolute top-1/2 left-6 right-6 -translate-y-1/2 px-4 pointer-events-none">
          <button 
            onClick={prevSlide}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/50 transition-all pointer-events-auto"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/50 transition-all pointer-events-auto"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
      
      {/* 底部缩略图导航 */}
      <div className="relative overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-none justify-center md:justify-start"
        >
          {galleryData.map((item, index) => (
            <div 
              key={index}
              className={`flex-shrink-0 w-24 md:w-32 rounded-lg overflow-hidden cursor-pointer transition-all 
              ${activeIndex === index ? 'ring-2 ring-[#ff6b9d] opacity-100' : 'opacity-70'}`}
              onClick={() => setActiveIndex(index)}
            >
              <div className="aspect-square relative">
                {/* 缩略图占位符 */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </div>

                {/* 实际缩略图 */}
                <Image 
                  src={`/images/gallery/sketch${item.id}.jpg`}
                  alt={item.title}
                  fill
                  className={`object-cover transition-opacity duration-300 
                    ${isImageLoaded(`thumb-${item.id}`) ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => handleImageLoad(`thumb-${item.id}`)}
                  onError={() => handleImageError(`thumb-${item.id}`)}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {/* 移除底部文字描述 */}
              </div>
            </div>
          ))}
        </div>

        {/* 移动端分页指示器 */}
        <div className="flex justify-center mt-4 gap-2 md:hidden">
          {galleryData.map((_, index) => (
            <button 
              key={index} 
              className={`w-2 h-2 rounded-full transition-all ${index === activeIndex ? 'bg-[#ff6b9d]' : 'bg-gray-300'}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 