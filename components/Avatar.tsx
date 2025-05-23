'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

// 通过名字生成一个颜色
const getColorFromName = (name: string) => {
  const colors = [
    '#ff5733', '#33ff57', '#3357ff', '#f033ff', '#ff33a8',
    '#33fff3', '#ffd633', '#8cff33', '#33ffa2', '#337aff'
  ]
  
  // 使用名字的ASCII码总和作为颜色索引
  let sum = 0
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i)
  }
  
  return colors[sum % colors.length]
}

// 获取姓名首字母
const getInitials = (name: string) => {
  if (!name) return '?'
  
  // 分割名字并获取首字母
  const parts = name.split(' ')
  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase()
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface AvatarProps {
  src?: string
  name: string
  size?: number
  className?: string
}

export default function Avatar({ src, name, size = 40, className = '' }: AvatarProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src)
  const [retries, setRetries] = useState(0)
  const [loadFailed, setLoadFailed] = useState(false)
  
  // 当源URL变化时重置状态
  useEffect(() => {
    setImgSrc(src)
    setRetries(0)
    setLoadFailed(false)
  }, [src])
  
  // 处理图片加载失败
  const handleError = () => {
    if (retries < 3 && imgSrc) {
      // 尝试重新加载图片（最多3次）
      setRetries(prev => prev + 1)
      // 添加随机参数避免缓存
      setImgSrc(`${imgSrc}?retry=${Date.now()}`)
    } else {
      // 超过重试次数，显示首字母头像
      setLoadFailed(true)
    }
  }
  
  // 如果没有图片或图片加载失败，显示首字母
  if (!imgSrc || loadFailed) {
    const initials = getInitials(name)
    const bgColor = getColorFromName(name)
    
    return (
      <div 
        className={`flex items-center justify-center rounded-full ${className}`}
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: bgColor,
          color: 'white',
          fontSize: size * 0.4,
          fontWeight: 'bold'
        }}
      >
        {initials}
      </div>
    )
  }
  
  // 显示用户头像
  return (
    <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <Image 
        src={imgSrc}
        alt={`${name}'s avatar`}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={handleError}
      />
    </div>
  )
} 