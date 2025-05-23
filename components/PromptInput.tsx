"use client";

import React, { useState } from 'react';

interface PromptInputProps {
  onChange: (prompt: string) => void;
  disabled?: boolean;
}

export default function PromptInput({ onChange, disabled = false }: PromptInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };
  
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex justify-between items-baseline mb-2">
        <label className="block font-medium text-gray-700">
          Describe your drawing
        </label>
        <span className="text-sm text-gray-500">
          {value.length} / 500
        </span>
      </div>
      
      <div className={`
        relative rounded-xl overflow-hidden border transition-all
        ${isFocused ? 'border-[#a17ef5] shadow-sm ring-1 ring-[#a17ef5]/20' : 'border-gray-300'}
        ${disabled ? 'bg-gray-50 opacity-75' : 'bg-white'}
      `}>
        <textarea
          className="w-full px-4 py-3 resize-none focus:outline-none bg-transparent"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          maxLength={500}
          rows={3}
          placeholder={`Describe what you've drawn (recommend).\nFor example: "Rocket being launched, blue sky and white clouds"`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      
      <p className="mt-2 text-sm text-gray-500 text-center">
        The better your description, the better the result will match your drawing
      </p>
    </div>
  );
} 