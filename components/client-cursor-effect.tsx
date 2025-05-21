'use client';

import dynamic from 'next/dynamic';

// 在客户端组件中使用动态导入
const CursorStarEffect = dynamic(
  () => import('@/components/ui/cursor-effects').then((mod) => mod.CursorStarEffect),
  { ssr: false }
);

export default function ClientCursorEffect() {
  return <CursorStarEffect />;
} 