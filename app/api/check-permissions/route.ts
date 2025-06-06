import { NextRequest, NextResponse } from 'next/server';
import { canGenerateImage } from '@/lib/supabaseApiServer';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // 检查用户权限
    const permissions = await canGenerateImage(userId);
    
    return NextResponse.json(permissions);
  } catch (error) {
    console.error('权限检查API错误:', error);
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    );
  }
} 