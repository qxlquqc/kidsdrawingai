import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getReplicateApiToken, validateServerEnv } from '@/lib/env';
import { createClient } from '@/lib/supabase-server';
import { canGenerateImage } from '@/lib/supabaseApiServer';

// 禁用路由缓存，确保每次请求都读取最新的环境变量
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  // 使用noStore确保不缓存此API路由的响应
  noStore();
  
  // 设置请求头来防止缓存
  const headers = new Headers();
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set('Surrogate-Control', 'no-store');
  
  try {
    console.log('🔄 处理POST /api/replicate/predictions请求', {timestamp: new Date().toISOString()});
    
    // 用户认证和权限检查
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Authentication failed:', authError?.message || 'No user');
      return NextResponse.json(
        { error: 'Unauthorized. Please log in first.' },
        { status: 401, headers }
      );
    }

    // 检查用户生成权限
    const permission = await canGenerateImage(user.id);
    if (!permission.canGenerate) {
      console.log('Permission denied for user:', user.id, 'Current usage:', permission.currentUsage, 'Limit:', permission.limit);
      
      let reason = 'Access denied';
      if (permission.planType === 'free') {
        reason = 'Free users need to upgrade to generate images';
      } else if (permission.currentUsage >= permission.limit) {
        reason = `Monthly limit reached (${permission.currentUsage}/${permission.limit})`;
      }
      
      return NextResponse.json(
        { 
          error: 'Permission denied',
          reason: reason,
          details: permission
        },
        { status: 403, headers }
      );
    }

    const body = await request.json();
    console.log('POST /api/replicate/predictions', { 
      userId: user.id,
      body: {
        model: body.model,
        input: body.input ? '已提供' : '未提供',
      }
    });

    // 检查必要的请求参数
    if (!body.model) {
      console.log('Missing model parameter');
      return NextResponse.json({ error: 'Missing model parameter' }, { status: 400, headers });
    }

    if (!body.input || !body.input.prompt) {
      console.log('Missing required input parameters', { input: body.input });
      return NextResponse.json({ error: 'Missing required input parameters (prompt is required)' }, { status: 400, headers });
    }

    // 从环境变量获取Replicate API Token，使用我们的辅助函数
    const REPLICATE_API_TOKEN = getReplicateApiToken();
    console.log('环境变量检查 REPLICATE_API_TOKEN:', REPLICATE_API_TOKEN ? '已设置' : '未设置', 
      { tokenLength: REPLICATE_API_TOKEN.length, tokenPrefix: REPLICATE_API_TOKEN.substring(0, 3) });
    
    if (!REPLICATE_API_TOKEN) {
      console.error('未找到任何Replicate API Token，请检查.env.local文件');
      return NextResponse.json(
        { 
          error: 'API configuration error. Please check .env.local file.',
          detail: 'Please set the NEXT_PUBLIC_REPLICATE_API_TOKEN environment variable in .env.local' 
        },
        { status: 500, headers }
      );
    }

    // 详细记录input对象的内容（截断图片URL和prompt以避免日志过长）
    console.log('🧪 API路由：完整的请求参数:', {
      userId: user.id,
      model: body.model,
      input: {
        ...body.input,
        input_image: body.input.input_image ? (typeof body.input.input_image === 'string' ? 
          (body.input.input_image.substring(0, 30) + '...') : '非字符串图片URL') : '未提供图片',
        prompt: body.input.prompt ? (body.input.prompt.substring(0, 100) + '...') : '未提供提示词',
        aspect_ratio: body.input.aspect_ratio,
        output_format: body.input.output_format,
        safety_tolerance: body.input.safety_tolerance,
        seed: body.input.seed
      }
    });
    
    // 检查模型格式，Replicate需要正确的version参数
    console.log('🔍 模型参数检查:', {
      providedModel: body.model,
      isCorrectFormat: body.model.includes('/'),
      expectedFormat: 'black-forest-labs/flux-kontext-pro'
    });
    
    const requestBody = JSON.stringify({
      version: body.model,
      input: body.input,
    });
    
    console.log('发送到Replicate API的请求体大小:', (requestBody.length / 1024).toFixed(2) + 'KB');
    
    // 使用直接获取的环境变量
    console.log('准备调用 Replicate API，使用token头部:', 
      REPLICATE_API_TOKEN ? `Token ${REPLICATE_API_TOKEN.substring(0, 3)}...${REPLICATE_API_TOKEN.substring(REPLICATE_API_TOKEN.length-3)}` : '无token');
    
    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    try {
      console.log('🌐 准备调用Replicate API', {
        url: 'https://api.replicate.com/v1/predictions',
        tokenPrefix: REPLICATE_API_TOKEN.substring(0, 8) + '...',
        bodySize: requestBody.length
      });

      // 使用no-store确保不缓存Replicate API的响应
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'User-Agent': 'KidsDrawingAI/1.0'
        },
        body: requestBody,
        // 关键：禁用缓存
        cache: 'no-store',
        next: { revalidate: 0 },
        signal: controller.signal
      });

      console.log('📡 Replicate API响应状态:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Replicate API错误响应:', errorText, '状态码:', response.status);
        
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
      console.log('Replicate API成功响应:', { 
        userId: user.id,
        id: prediction.id,
        status: prediction.status 
      });
      
      return NextResponse.json(prediction, { headers });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // 特别处理AbortError（超时）
      if (fetchError.name === 'AbortError') {
        console.error('请求超时:', fetchError);
        return NextResponse.json(
          { error: 'Request to Replicate API timed out after 30 seconds' },
          { status: 504, headers }
        );
      }
      
      throw fetchError; // 重新抛出其他错误以统一处理
    }
  } catch (error: any) {
    console.error('Error in POST /api/replicate/predictions:', error);
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