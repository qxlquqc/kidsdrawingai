'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Child's original drawing",
  afterAlt = "AI enhanced artwork"
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate slider position based on mouse/touch position
  const calculatePosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      const offsetX = clientX - rect.left;
      const position = Math.max(0, Math.min((offsetX / containerWidth) * 100, 100));
      
      setSliderPosition(position);
    },
    []
  );

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isHovering) {
        calculatePosition(e.clientX);
      }
    },
    [isHovering, calculatePosition]
  );

  // Handle touch movement
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches[0]) {
        calculatePosition(e.touches[0].clientX);
      }
    },
    [calculatePosition]
  );

  // Set up event listeners
  useEffect(() => {
    if (isHovering) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isHovering, handleMouseMove, handleTouchMove]);

  // Mouse enter/leave handlers
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square rounded-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsHovering(true)}
      onTouchEnd={() => setIsHovering(false)}
      style={{ cursor: isHovering ? 'col-resize' : 'default' }}
    >
      {/* Container for both images */}
      <div className="absolute inset-0 w-full h-full">
        {/* Bottom image (AI enhanced) - always fully visible */}
        <Image
          src={afterImage}
          alt={afterAlt}
          fill
          className="object-cover"
          priority
        />
        
        {/* Top image (original drawing) - clipped based on slider position */}
        <div 
          className="absolute inset-0 overflow-hidden" 
          style={{ 
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` 
          }}
        >
          <Image
            src={beforeImage}
            alt={beforeAlt}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Slider handle */}
      <div
        ref={sliderRef}
        className="absolute top-0 bottom-0 w-0 bg-transparent z-10"
        style={{ 
          left: `${sliderPosition}%`,
          boxShadow: 'none'
        }}
      >
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center z-20"
          style={{
            background: 'linear-gradient(135deg, #ff80ab, #7c4dff)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            border: '2px solid white',
          }}
        >
          <span className="text-white font-bold text-lg">↔</span>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute left-2 top-2 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 z-10">
        {beforeAlt}
      </div>
      <div className="absolute right-2 top-2 bg-gradient-to-r from-[#ff80ab]/70 to-[#7c4dff]/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white z-10">
        {afterAlt}
      </div>
    </div>
  );
} 