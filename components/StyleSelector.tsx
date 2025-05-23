"use client";

import React, { useState, useEffect } from 'react';
import { STYLE_OPTIONS } from '@/lib/transform';

interface StyleSelectorProps {
  onChange: (styleId: string) => void;
  onFollowDrawingChange?: (value: number) => void;
  disabled?: boolean;
  initialStyle?: string; // 添加初始风格参数
}

export default function StyleSelector({
  onChange,
  onFollowDrawingChange,
  disabled = false,
  initialStyle
}: StyleSelectorProps) {
  // 如果提供了初始风格，使用它；否则使用默认的第一个选项
  const [selectedStyle, setSelectedStyle] = useState(initialStyle || STYLE_OPTIONS[0].id);
  const [sliderValue, setSliderValue] = useState(9); // 默认值9
  const [percentValue, setPercentValue] = useState(70); // 计算默认9对应的百分比值
  
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

  // 将百分比值转换为API需要的scale值 (0% -> 30, 100% -> 0.1)
  // 注意：这里百分比是"遵循绘图的程度"，所以100%表示完全遵循(0.1)，0%表示完全不遵循(30)
  const percentToScale = (percent: number): number => {
    // 线性插值: 0% = 30, 100% = 0.1
    return 30 - (percent / 100) * 29.9;
  };
  
  // 将API的scale值转换为百分比显示 (30 -> 0%, 0.1 -> 100%)
  const scaleToPercent = (scale: number): number => {
    // 线性插值: 30 = 0%, 0.1 = 100%
    return Math.round(((30 - scale) / 29.9) * 100);
  };

  const handleFollowDrawingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFollowDrawingChange) {
      // 获取滑块的百分比值
      const percent = parseInt(e.target.value, 10);
      const scaleValue = percentToScale(percent);
      
      console.log('Follow Drawing强度变更', { 
        percentValue: percent,
        scaleValue: scaleValue,
        min: 0.1, 
        max: 30 
      });
      
      setPercentValue(percent);
      setSliderValue(scaleValue);
      onFollowDrawingChange(scaleValue);
    }
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
      
      <div className="mt-6 px-4">
        <label className="flex flex-col">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Follow Drawing Strength</span>
            <span className="text-sm text-gray-500">{percentValue}%</span>
          </div>
        
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            defaultValue="70"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#a17ef5] mt-3"
            disabled={disabled}
            onChange={handleFollowDrawingChange}
          />
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Creative Freedom (0%)</span>
            <span>Exact Match (100%)</span>
          </div>
        </label>
      </div>
    </div>
  );
} 