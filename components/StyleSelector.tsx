"use client";

import React, { useState, useEffect } from 'react';
import { STYLE_OPTIONS } from '@/lib/transform';

interface StyleSelectorProps {
  onChange: (styleId: string) => void;
  disabled?: boolean;
  initialStyle?: string; // 添加初始风格参数
}

export default function StyleSelector({
  onChange,
  disabled = false,
  initialStyle
}: StyleSelectorProps) {
  // 如果提供了初始风格，使用它；否则使用默认的第一个选项
  const [selectedStyle, setSelectedStyle] = useState(initialStyle || STYLE_OPTIONS[0].id);
  
  // 组件挂载时，确保初始风格被选择
  useEffect(() => {
    console.log('StyleSelector初始化，选择风格', { 
      styleId: selectedStyle,
      styleName: STYLE_OPTIONS.find(s => s.id === selectedStyle)?.name,
      stylePrompt: STYLE_OPTIONS.find(s => s.id === selectedStyle)?.a_prompt
    });
    onChange(selectedStyle); // 使用state中的风格，而不是强制使用默认风格
  }, [onChange, selectedStyle]);
  
  const handleSelect = (styleId: string) => {
    if (disabled) return;
    
    const selectedStyleObj = STYLE_OPTIONS.find(s => s.id === styleId);
    console.log('风格切换', { 
      from: selectedStyle, 
      to: styleId,
      styleName: selectedStyleObj?.name,
      stylePrompt: selectedStyleObj?.a_prompt
    });
    
    setSelectedStyle(styleId);
    onChange(styleId);
  };
  
  return (
    <div className="w-full max-w-xl mx-auto">
      <h3 className="font-medium text-gray-700 mb-3 text-center">Choose Art Style</h3>
      
      <div className="grid grid-cols-5 gap-2">
        {STYLE_OPTIONS.map((style) => (
          <button
            key={`style-${style.id}`}
            className={`
              flex flex-col items-center justify-center 
              p-3 rounded-xl transition-all
              ${selectedStyle === style.id 
                ? 'bg-gradient-to-br from-[#ff6b9d]/10 to-[#a17ef5]/10 border-[#a17ef5] shadow-sm' 
                : 'border-gray-200 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover-scale'}
              border
            `}
            onClick={() => handleSelect(style.id)}
            disabled={disabled}
          >
            <span className="text-2xl mb-1">{style.emoji}</span>
            <span className={`text-sm ${selectedStyle === style.id ? 'text-[#a17ef5] font-medium' : 'text-gray-700'}`}>
              {style.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
} 