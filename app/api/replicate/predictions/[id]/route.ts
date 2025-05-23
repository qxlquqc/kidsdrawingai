import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getReplicateApiToken, validateServerEnv } from '@/lib/env';

// 禁用路由缓存，确保每次请求都读取最新的环境变量
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// 使用正确的类型定义
interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  // 使用noStore确保不缓存此API路由的响应
  noStore();
  
  // 设置请求头来防止缓存
  const headers = new Headers();
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set('Surrogate-Control', 'no-store');
  
  try {
    const id = context.params.id;
    console.log(`GET /api/replicate/predictions/${id}`, {timestamp: new Date().toISOString()});

    if (!id) {
      console.log('Missing prediction ID');
      return NextResponse.json({ error: 'Missing prediction ID' }, { status: 400, headers });
    }

    // 验证环境变量
    const envValidation = validateServerEnv();
    if (!envValidation.valid) {
      console.error(`环境变量缺失: ${envValidation.missingVars.join(', ')}`);
      return NextResponse.json(
        { 
          error: 'API configuration error. Missing environment variables.',
          detail: '在.env.local中设置NEXT_PUBLIC_REPLICATE_API_TOKEN环境变量'
        },
        { status: 500, headers }
      );
    }

    // 从环境变量获取Replicate API Token，使用我们的辅助函数
    const REPLICATE_API_TOKEN = getReplicateApiToken();
    console.log('环境变量检查 [id] REPLICATE_API_TOKEN:', REPLICATE_API_TOKEN ? '已设置' : '未设置', 
      { tokenLength: REPLICATE_API_TOKEN.length, tokenPrefix: REPLICATE_API_TOKEN.substring(0, 3) });
    
    if (!REPLICATE_API_TOKEN) {
      console.error('未找到任何Replicate API Token，请检查.env.local文件');
      return NextResponse.json(
        { 
          error: 'API configuration error. Please check .env.local file.',
          detail: '在.env.local中设置NEXT_PUBLIC_REPLICATE_API_TOKEN环境变量'
        },
        { status: 500, headers }
      );
    }

    // 调用Replicate API获取预测状态
    console.log(`准备获取预测 ${id} 的状态，使用token头部:`, 
      REPLICATE_API_TOKEN ? `Token ${REPLICATE_API_TOKEN.substring(0, 3)}...${REPLICATE_API_TOKEN.substring(REPLICATE_API_TOKEN.length-3)}` : '无token');
    
    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    try {
      // 使用no-store确保不缓存Replicate API的响应
      const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
        // 关键：禁用缓存
        cache: 'no-store',
        next: { revalidate: 0 },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Replicate API错误响应: ${id}:`, errorText, '状态码:', response.status);
        
        // 尝试解析错误JSON
        let errorDetail = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = JSON.stringify(errorJson, null, 2);
        } catch (e) {
          // 如果不是JSON，使用原始文本
        }
        
        return NextResponse.json(
          { error: `Replicate API error: ${errorDetail}` },
          { status: response.status, headers }
        );
      }

      const prediction = await response.json();
      
      // 将Replicate的状态映射为我们的标准状态格式
      const status = prediction.status;
      const output = prediction.output;
      const error = prediction.error;
      
      // 记录状态变化
      console.log(`预测 ${id} 状态: ${status}`, {
        hasOutput: Array.isArray(output) && output.length > 0,
        hasError: !!error,
        rawResponse: JSON.stringify(prediction).substring(0, 200) + '...' // 仅显示前200个字符
      });
      
      if (error) {
        console.error(`预测 ${id} 错误:`, error);
      }
      
      // 返回统一格式的结果
      return NextResponse.json({
        id,
        status,
        output,
        error,
      }, { headers });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // 特别处理AbortError（超时）
      if (fetchError.name === 'AbortError') {
        console.error(`获取预测${id}超时:`, fetchError);
        return NextResponse.json(
          { error: 'Request to Replicate API timed out after 30 seconds' },
          { status: 504, headers }
        );
      }
      
      throw fetchError; // 重新抛出其他错误以统一处理
    }
  } catch (error: any) {
    console.error(`Error in GET /api/replicate/predictions/${context.params.id}:`, error);
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { 
        status: 500, 
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  }
}